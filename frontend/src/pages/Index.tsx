import { useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useBackendLibrary } from "@/hooks/useBackendLibrary";
import { TrackCard } from "@/components/TrackCard";
import { AlbumCard } from "@/components/AlbumCard";

export default function Index() {
  const { artists, albums, tracks, playlists, loading } = useBackendLibrary();
  const [search, setSearch] = useState("");

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">
          Cargando datos desde la base de datos…
        </p>
      </div>
    );
  }

  const filteredTracks = tracks.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="border-b px-6 py-4 sticky top-0 bg-background/95 z-10 backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Music Library</h1>
            <p className="text-sm text-muted-foreground">
              ArangoDB - Backend API (FastAPI) - Frontend (React)
            </p>
          </div>
          <Link
            to="/queries"
            className="text-sm text-primary hover:underline"
          >
            Búsqueda avanzada (Consultas) →
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 py-6 space-y-6">
        {/* Resumen general */}
        <Card>
          <CardHeader>
            <CardTitle>🎧 Resumen BD </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4 text-sm">
            <span>
              <strong>{artists.length}</strong> artistas
            </span>
            <span>
              <strong>{albums.length}</strong> álbumes
            </span>
            <span>
              <strong>{tracks.length}</strong> tracks
            </span>
            <span>
              <strong>{playlists.length}</strong> playlists
            </span>
          </CardContent>
        </Card>

        <Tabs defaultValue="songs" className="space-y-4">
          <TabsList>
            <TabsTrigger value="songs">Songs</TabsTrigger>
            <TabsTrigger value="artists">Artists</TabsTrigger>
            <TabsTrigger value="albums">Albums</TabsTrigger>
            <TabsTrigger value="playlists">Playlists</TabsTrigger>
          </TabsList>

          {/* SONGS */}
          <TabsContent value="songs">

            {/* Buscador SOLO para tracks */}
            <div className="relative mb-4 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar tracks por título…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>🎵 Tracks</CardTitle>
              </CardHeader>
              <CardContent>
                <TrackCard
                  title="Ejemplo"
                  artistName="Nirvana"
                  artistUrl="/artist/artist_nirvana_123"
                  albumName="Nevermind"
                  albumUrl="/album/album_nevermind_456"
                  duration={301}
                />

                <ul className="text-sm">
                  {filteredTracks.map((t) => (
                    <li key={t.key}>
                      <TrackCard
                        title={t.title}
                        artistName={t.artistKey || "Artista desconocido"}
                        artistUrl={`/artist/${t.artistKey}`}
                        albumName={t.albumKey}
                        albumUrl={`/album/${t.albumKey}`}
                        duration={t.duration}
                      />
                    </li>
                  ))}
                  {filteredTracks.length === 0 && (
                    <li className="text-sm text-muted-foreground">
                      No se encontraron tracks que coincidan con “{search}”.
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ARTISTS */}
          <TabsContent value="artists">
            <Card>
              <CardHeader>
                <CardTitle>🎤 Artistas</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm">
                  {artists.map((a) => (
                    <li key={a.key}>
                      <Link
                        to={`/artist/${a.key}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {a.name}
                      </Link>
                      {a.country && (
                        <span className="text-xs text-muted-foreground">
                          {" "}
                          · {a.country}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ALBUMS */}
          <TabsContent value="albums">
            <Card>
              <CardHeader>
                <CardTitle>💿 Álbumes</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm flex flex-wrap">
                  {albums.map((al) => (
                    <li key={al.key}>
                      <AlbumCard
                        title={al.title}
                        artistName={al.artistKey}
                        artistKey={`/artist/${al.artistKey}`}
                        year={al.year}
                        albumKey={al.key}
                      />
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PLAYLISTS */}
          <TabsContent value="playlists">
            <Card>
              <CardHeader>
                <CardTitle>📃 Playlists</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm">
                  {playlists.map((p) => (
                    <li key={p.key}>
                      <Link
                        to={`/playlist/${p.key}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {p.title}
                      </Link>
                      <span className="text-xs text-muted-foreground">
                        {" "}
                        · user {p.userKey}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
