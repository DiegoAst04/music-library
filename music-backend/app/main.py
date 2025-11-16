from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from .db import aql, exists_doc
from .config import PORT
from pydantic import BaseModel, Field
from typing import Optional, List

app = FastAPI(title="Music API (ArangoDB)")

# CORS para desarrollo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_methods=["*"], allow_headers=["*"], allow_credentials=True
)

# ---------- Health ----------
@app.get("/health")
def health():
    try:
        res = aql("RETURN CURRENT_DATABASE()")
        return {"ok": True, "db": res[0]}
    except Exception as e:
        return {"ok": False, "error": str(e)}


# ---- CREATE ----
class ArtistCreate(BaseModel):
    key: str = Field(..., description="artists._key")
    name: str
    country: Optional[str] = None
    genres: List[str] = []

class AlbumCreate(BaseModel):
    key: str = Field(..., description="albums._key")
    title: str
    year: int
    artistKey: str

class TrackCreate(BaseModel):
    key: str
    title: str
    duration: int
    albumKey: str
    artistKey: str
    genres: List[str] = []
    plays: int = 0

class PlaylistCreate(BaseModel):
    key: str
    title: str
    userKey: str
    createdAt: Optional[int] = None  # epoch ms (si no, se pone ahora)

class PlaylistTrackAdd(BaseModel):
    trackKey: str
    createdAt: Optional[int] = None


# ---- UPDATE (parciales) ----
class AlbumUpdate(BaseModel):
    title: Optional[str] = None
    year: Optional[int] = None

class TrackUpdate(BaseModel):
    title: Optional[str] = None
    duration: Optional[int] = None
    plays: Optional[int] = None
    genres: Optional[List[str]] = None

class PlaylistUpdate(BaseModel):
    title: Optional[str] = None


# ============ ENDPOINTS ============

# Consultas tipo Read:---------------

# 1) Top-N tracks por reproducciones
@app.get("/tracks/top")
def top_tracks(n: int = Query(5, ge=1, le=100)):
    q = """
    FOR t IN tracks
      SORT t.plays DESC
      LIMIT @n
      RETURN { key: t._key, title: t.title, plays: t.plays, albumKey: t.albumKey, artistKey: t.artistKey }
    """
    return aql(q, {"n": n})

# 2) Álbum -> Tracks
@app.get("/albums/{album_key}/tracks")
def album_tracks(album_key: str):
    if not exists_doc("albums", album_key):
        raise HTTPException(404, "Album not found")
    q = """
    FOR e IN rel_album_track
      FILTER e._from == CONCAT("albums/", @albumKey)
      FOR t IN tracks FILTER t._id == e._to
      RETURN { key: t._key, title: t.title, duration: t.duration, plays: t.plays }
    """
    return aql(q, {"albumKey": album_key})

# 3) Artista -> Álbumes
@app.get("/artists/{artist_key}/albums")
def artist_albums(artist_key: str):
    if not exists_doc("artists", artist_key):
        raise HTTPException(404, "Artist not found")
    q = """
    FOR e IN rel_artist_album
      FILTER e._from == CONCAT("artists/", @artistKey)
      FOR a IN albums FILTER a._id == e._to
      SORT a.year ASC
      RETURN { key: a._key, title: a.title, year: a.year }
    """
    return aql(q, {"artistKey": artist_key})

# 4) Usuario -> Playlists
@app.get("/users/{user_key}/playlists")
def user_playlists(user_key: str):
    if not exists_doc("users", user_key):
        raise HTTPException(404, "User not found")
    q = """
    FOR e IN rel_user_playlist
      FILTER e._from == CONCAT("users/", @userKey)
      FOR p IN playlists FILTER p._id == e._to
      SORT p.createdAt DESC
      RETURN { key: p._key, title: p.title, createdAt: p.createdAt }
    """
    return aql(q, {"userKey": user_key})

# 5) Playlist -> Tracks (orden configurable)
@app.get("/playlists/{pl_key}/tracks")
def playlist_tracks(pl_key: str, order: str = Query("desc", pattern="^(asc|desc)$")):
    if not exists_doc("playlists", pl_key):
        raise HTTPException(404, "Playlist not found")
    sort = "ASC" if order == "asc" else "DESC"
    q = f"""
    FOR e IN rel_playlist_track
      FILTER e._from == CONCAT("playlists/", @plKey)
      SORT e.createdAt {sort}
      FOR t IN tracks FILTER t._id == e._to
      RETURN {{
        key: t._key, title: t.title, createdAt: e.createdAt,
        albumKey: t.albumKey, artistKey: t.artistKey
      }}
    """
    return aql(q, {"plKey": pl_key})

# 6) Detalle de Track con Artista y Álbum
@app.get("/tracks/{track_key}/full")
def track_full(track_key: str):
    if not exists_doc("tracks", track_key):
        raise HTTPException(404, "Track not found")
    q = """
    LET t = DOCUMENT("tracks", @trackKey)
    LET a = DOCUMENT("albums", t.albumKey)
    LET r = DOCUMENT("artists", t.artistKey)
    RETURN { track: t, album: a, artist: r }
    """
    return aql(q, {"trackKey": track_key})[0]

# 7) Búsqueda por prefijo de título (LIKE)
@app.get("/search/tracks")
def search_tracks(prefix: str, limit: int = Query(20, ge=1, le=100)):
    q = """
    FOR t IN tracks
      FILTER LIKE(t.title, CONCAT(@prefix, "%"), true)
      LIMIT @limit
      RETURN { key: t._key, title: t.title }
    """
    return aql(q, {"prefix": prefix, "limit": limit})

# 8) Género -> Tracks
@app.get("/genres/{genre_key}/tracks")
def genre_tracks(genre_key: str, limit: int = Query(50, ge=1, le=200)):
    # genres._key es el nombre del género en el seed
    q = """
    FOR e IN rel_track_genre
      FILTER e._to == CONCAT("genres/", @g)
      FOR t IN tracks FILTER t._id == e._from
      LIMIT @limit
      RETURN { key: t._key, title: t.title, artistKey: t.artistKey, albumKey: t.albumKey }
    """
    return aql(q, {"g": genre_key, "limit": limit})

# 9) Tracks de un artista en rango de años
@app.get("/artists/{artist_key}/tracks-by-year")
def artist_tracks_by_year(artist_key: str, year_from: int, year_to: int):
    if year_from > year_to:
        raise HTTPException(400, "year_from must be <= year_to")
    q = """
    FOR a IN albums
      FILTER a.artistKey == @artistKey AND a.year >= @y1 AND a.year <= @y2
      FOR e IN rel_album_track FILTER e._from == a._id
        FOR t IN tracks FILTER t._id == e._to
        RETURN { key: t._key, title: t.title, album: a.title, year: a.year }
    """
    return aql(q, {"artistKey": artist_key, "y1": year_from, "y2": year_to})

# 10) Recomendación simple por género (excluye el track actual)
@app.get("/tracks/{track_key}/recommendations")
def track_recommendations(track_key: str, limit: int = Query(20, ge=1, le=100)):
    if not exists_doc("tracks", track_key):
        raise HTTPException(404, "Track not found")
    q = """
    LET seed = DOCUMENT("tracks", @k)
    FOR g IN seed.genres
      FOR e IN rel_track_genre
        FILTER e._to == CONCAT("genres/", g)
        FOR t IN tracks
          FILTER t._id == e._from AND t._key != @k
          LIMIT @limit
          RETURN DISTINCT { key: t._key, title: t.title }
    """
    return aql(q, {"k": track_key, "limit": limit})

# 11) Conteo de tracks por artista
@app.get("/counts/tracks-by-artist/{artist_key}")
def count_tracks_by_artist(artist_key: str):
    q = """
    LET albumKeys = (
      FOR e IN rel_artist_album
        FILTER e._from == CONCAT("artists/", @artistKey)
        RETURN PARSE_IDENTIFIER(e._to).key
    )
    FOR e IN rel_album_track
      FILTER PARSE_IDENTIFIER(e._from).key IN albumKeys
      COLLECT WITH COUNT INTO c
    RETURN { artistKey: @artistKey, tracks: c }
    """
    return aql(q, {"artistKey": artist_key})[0]

# 12) Traversal demo (impacto): Artista -> (1..2) -> Tracks
@app.get("/graph/artist/{artist_key}/tracks")
def artist_graph_tracks(artist_key: str, max_depth: int = Query(2, ge=1, le=3)):
    q = """
    FOR v,e,p IN 1..@d OUTBOUND CONCAT("artists/", @k) GRAPH "musicGraph"
      FILTER IS_SAME_COLLECTION("tracks", v)
      RETURN { key: v._key, title: v.title }
    """
    return aql(q, {"k": artist_key, "d": max_depth})

# Consultas tipo Create:---------------

# 1) Crear Artista
@app.post("/artists", status_code=201)
def create_artist(body: ArtistCreate):
    if exists_doc("artists", body.key):
        raise HTTPException(409, "Artist key already exists")
    q = """
    INSERT { _key:@k, name:@name, country:@country, genres:@genres } IN artists
    RETURN NEW
    """
    return aql(q, {"k": body.key, "name": body.name, "country": body.country, "genres": body.genres})[0]

# 2) Crear Album (edge artists-albums)
@app.post("/albums", status_code=201)
def create_album(body: AlbumCreate):
    if not exists_doc("artists", body.artistKey):
        raise HTTPException(404, "Artist not found")
    if exists_doc("albums", body.key):
        raise HTTPException(409, "Album key already exists")
    q = """
    LET ins = (INSERT { _key:@k, title:@title, year:@year, artistKey:@artist } IN albums RETURN NEW)[0]
    INSERT { _from: CONCAT('artists/', @artist), _to: CONCAT('albums/', @k) } IN rel_artist_album
    RETURN ins
    """
    return aql(q, {"k": body.key, "title": body.title, "year": body.year, "artist": body.artistKey})[0]

# 3) Crear Track (edges album-track, track-genres)
@app.post("/tracks", status_code=201)
def create_track(body: TrackCreate):
    if not exists_doc("albums", body.albumKey):
        raise HTTPException(404, "Album not found")
    if not exists_doc("artists", body.artistKey):
        raise HTTPException(404, "Artist not found")
    if exists_doc("tracks", body.key):
        raise HTTPException(409, "Track key already exists")

    q = """
    LET t = (INSERT {
      _key:@k, title:@title, duration:@duration, albumKey:@albumKey,
      artistKey:@artistKey, genres:@genres, plays:@plays
    } IN tracks RETURN NEW)[0]

    INSERT { _from: CONCAT('albums/', @albumKey), _to: CONCAT('tracks/', @k) } IN rel_album_track

    FOR g IN @genres
      INSERT { _from: CONCAT('tracks/', @k), _to: CONCAT('genres/', g) } IN rel_track_genre

    RETURN t
    """
    return aql(q, {
        "k": body.key, "title": body.title, "duration": body.duration,
        "albumKey": body.albumKey, "artistKey": body.artistKey,
        "genres": body.genres, "plays": body.plays
    })[0]

# 4) Crear Playlist (edge user-playlist)
@app.post("/playlists", status_code=201)
def create_playlist(body: PlaylistCreate):
    if not exists_doc("users", body.userKey):
        raise HTTPException(404, "User not found")
    if exists_doc("playlists", body.key):
        raise HTTPException(409, "Playlist key already exists")
    q = """
    LET ts = @ts != null ? @ts : DATE_NOW()
    LET p = (INSERT { _key:@k, title:@title, userKey:@user, createdAt:ts } IN playlists RETURN NEW)[0]
    INSERT { _from: CONCAT('users/', @user), _to: CONCAT('playlists/', @k) } IN rel_user_playlist
    RETURN p
    """
    return aql(q, {"k": body.key, "title": body.title, "user": body.userKey, "ts": body.createdAt})[0]

# 5) Agregar Track a Playlist (edge playlist-track)
@app.post("/playlists/{pl_key}/tracks", status_code=201)
def add_track_to_playlist(pl_key: str, body: PlaylistTrackAdd):
    if not exists_doc("playlists", pl_key):
        raise HTTPException(404, "Playlist not found")
    if not exists_doc("tracks", body.trackKey):
        raise HTTPException(404, "Track not found")
    q = """
    LET ts = @ts != null ? @ts : DATE_NOW()
    INSERT { _from: CONCAT('playlists/', @pl), _to: CONCAT('tracks/', @tk), createdAt: ts }
    IN rel_playlist_track
    RETURN NEW
    """
    return aql(q, {"pl": pl_key, "tk": body.trackKey, "ts": body.createdAt})[0]

# Consultas tipo Update:---------------

# 1) Actualizar Album (titulo,anio)
@app.patch("/albums/{album_key}")
def update_album(album_key: str, body: AlbumUpdate):
    if not exists_doc("albums", album_key):
        raise HTTPException(404, "Album not found")
    q = """
    LET old = DOCUMENT("albums", @k)
    LET upd = MERGE(old, {
      title: HAS(@body, 'title') && @body.title != null ? @body.title : old.title,
      year:  HAS(@body, 'year')  && @body.year  != null ? @body.year  : old.year
    })
    REPLACE old WITH upd IN albums
    RETURN NEW
    """
    return aql(q, {"k": album_key, "body": body.dict(exclude_unset=True)})[0]

# 2) Actualizar Track (titulo,duracion,plays,generos)
@app.patch("/tracks/{track_key}")
def update_track(track_key: str, body: TrackUpdate):
    if not exists_doc("tracks", track_key):
        raise HTTPException(404, "Track not found")
    payload = body.dict(exclude_unset=True)

    # 1) Actualiza campos simples del track
    q1 = """
    LET old = DOCUMENT("tracks", @k)
    LET upd = MERGE(old, {
      title:    HAS(@p,'title')    && @p.title    != null ? @p.title    : old.title,
      duration: HAS(@p,'duration') && @p.duration != null ? @p.duration : old.duration,
      plays:    HAS(@p,'plays')    && @p.plays    != null ? @p.plays    : old.plays
    })
    REPLACE old WITH upd IN tracks
    RETURN NEW
    """
    updated = aql(q1, {"k": track_key, "p": payload})[0]

    # 2) Si cambian géneros: primero REMOVE en una query...
    if "genres" in payload and payload["genres"] is not None:
        q2_remove = """
        FOR e IN rel_track_genre
          FILTER e._from == CONCAT('tracks/', @k)
          REMOVE e IN rel_track_genre
        RETURN 1
        """
        aql(q2_remove, {"k": track_key})

        # ... luego INSERT en otra query (no en la misma)
        if payload["genres"]:
            q2_insert = """
            FOR g IN @genres
              INSERT { _from: CONCAT('tracks/', @k), _to: CONCAT('genres/', g) }
              IN rel_track_genre
            RETURN 1
            """
            aql(q2_insert, {"k": track_key, "genres": payload["genres"]})

        # Refleja géneros en el doc
        q3 = """UPDATE { _key:@k } WITH { genres:@genres } IN tracks RETURN NEW"""
        updated = aql(q3, {"k": track_key, "genres": payload["genres"]})[0]

    return updated

# 3) Renombrar Playlist
@app.patch("/playlists/{pl_key}")
def update_playlist(pl_key: str, body: PlaylistUpdate):
    if not exists_doc("playlists", pl_key):
        raise HTTPException(404, "Playlist not found")
    q = """
    LET old = DOCUMENT("playlists", @k)
    LET upd = MERGE(old, { title: HAS(@p,'title') && @p.title != null ? @p.title : old.title })
    REPLACE old WITH upd IN playlists
    RETURN NEW
    """
    return aql(q, {"k": pl_key, "p": body.dict(exclude_unset=True)})[0]

# Consultas tipo Delete:---------------

# 1) Quitar un Track de una Playlist (borra edge)
@app.delete("/playlists/{pl_key}/tracks/{track_key}")
def remove_track_from_playlist(pl_key: str, track_key: str):
    if not exists_doc("playlists", pl_key): raise HTTPException(404, "Playlist not found")
    if not exists_doc("tracks", track_key): raise HTTPException(404, "Track not found")
    q = """
    FOR e IN rel_playlist_track
      FILTER e._from == CONCAT('playlists/', @pl) AND e._to == CONCAT('tracks/', @tk)
      REMOVE e IN rel_playlist_track
    RETURN { removed: OLD != null }
    """
    res = aql(q, {"pl": pl_key, "tk": track_key})
    return res[0] if res else {"removed": False}

# 2) Borrar Track (y sus edges)
@app.delete("/tracks/{track_key}")
def delete_track(track_key: str):
    if not exists_doc("tracks", track_key):
        raise HTTPException(404, "Track not found")

    # 1) playlist->track
    q1 = """
    FOR e IN rel_playlist_track
      FILTER e._to == CONCAT('tracks/', @k)
      REMOVE e IN rel_playlist_track
    RETURN 1
    """
    aql(q1, {"k": track_key})

    # 2) album->track
    q2 = """
    FOR e IN rel_album_track
      FILTER e._to == CONCAT('tracks/', @k)
      REMOVE e IN rel_album_track
    RETURN 1
    """
    aql(q2, {"k": track_key})

    # 3) track->genre
    q3 = """
    FOR e IN rel_track_genre
      FILTER e._from == CONCAT('tracks/', @k)
      REMOVE e IN rel_track_genre
    RETURN 1
    """
    aql(q3, {"k": track_key})

    # 4) doc track
    q4 = """REMOVE { _key:@k } IN tracks RETURN { deleted: true }"""
    return aql(q4, {"k": track_key})[0]


# ========= ENDPOINTS EXTRA PARA EL FRONT (listar todo) ==========

@app.get("/artists/all")
def all_artists():
    q = """
    FOR a IN artists
      SORT a.name ASC
      RETURN { key: a._key, name: a.name, country: a.country, genres: a.genres }
    """
    return aql(q)

@app.get("/albums/all")
def all_albums():
    q = """
    FOR a IN albums
      SORT a.title ASC
      RETURN { key: a._key, title: a.title, year: a.year, artistKey: a.artistKey }
    """
    return aql(q)

@app.get("/tracks/all")
def all_tracks():
    q = """
    FOR t IN tracks
      SORT t.title ASC
      RETURN { key: t._key, title: t.title, duration: t.duration, albumKey: t.albumKey, artistKey: t.artistKey, plays: t.plays }
    """
    return aql(q)

@app.get("/playlists/all")
def all_playlists():
    q = """
    FOR p IN playlists
      SORT p.title ASC
      RETURN { key: p._key, title: p.title, userKey: p.userKey, createdAt: p.createdAt }
    """
    return aql(q)

