// src/pages/Queries.tsx
import { useEffect, useState, useMemo } from "react";
import { apiGet } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBackendLibrary } from "@/hooks/useBackendLibrary";
import { TrackCard } from "@/components/TrackCard";
import { AlbumCard } from "@/components/AlbumCard";

type QueryId =
  | "topTracks"
  | "albumTracks"
  | "artistAlbums"
  | "playlistTracks"
  | "trackFull"
  | "searchTracks"
  | "genreTracks"
  | "artistTracksByYear"
  | "trackRecommendations"
  | "countTracksByArtist"
  | "artistTraversal";

type ParamDef = {
  name: string;
  label: string;
  placeholder?: string;
  type?: "text" | "number";
  defaultValue?: string;
};

type QueryConfig = {
  id: QueryId;
  label: string;
  params: ParamDef[];
  buildRequest: (values: Record<string, string>) => {
    url: string;
    params?: Record<string, any>;
  };
};

const QUERY_CONFIGS: QueryConfig[] = [
  {
    id: "topTracks",
    label: "Top tracks más escuchados",
    params: [
      {
        name: "n",
        label: "Cantidad de tracks (N)",
        type: "number",
        defaultValue: "5",
        placeholder: "5",
      },
    ],
    buildRequest: (v) => ({
      url: "/tracks/top",
      params: { n: Number(v.n || "5") },
    }),
  },
  {
    id: "albumTracks",
    label: "Tracks de un álbum",
    params: [
      {
        name: "albumKey",
        label: "Clave del álbum",
        defaultValue: "al3",
        placeholder: "al3",
      },
    ],
    buildRequest: (v) => ({
      url: `/albums/${v.albumKey || "al3"}/tracks`,
    }),
  },
  {
    id: "artistAlbums",
    label: "Álbumes de un artista",
    params: [
      {
        name: "artistKey",
        label: "Clave del artista",
        defaultValue: "a2",
        placeholder: "a2",
      },
    ],
    buildRequest: (v) => ({
      url: `/artists/${v.artistKey || "a2"}/albums`,
    }),
  },
  {
    id: "playlistTracks",
    label: "Tracks de una playlist (orden por fecha de inserción)",
    params: [
      {
        name: "playlistKey",
        label: "Clave de la playlist",
        defaultValue: "p1",
        placeholder: "p1",
      },
      {
        name: "order",
        label: "Orden (asc/desc)",
        defaultValue: "desc",
        placeholder: "desc",
      },
    ],
    buildRequest: (v) => ({
      url: `/playlists/${v.playlistKey || "p1"}/tracks`,
      params: { order: v.order === "asc" ? "asc" : "desc" },
    }),
  },
  {
    id: "trackFull",
    label: "Detalle completo de un track",
    params: [
      {
        name: "trackKey",
        label: "Clave del track",
        defaultValue: "t5",
        placeholder: "t5",
      },
    ],
    buildRequest: (v) => ({
      url: `/tracks/${v.trackKey || "t5"}/full`,
    }),
  },
  {
    id: "searchTracks",
    label: "Buscar canciones por nombre",
    params: [
      {
        name: "prefix",
        label: "Prefijo del título",
        defaultValue: "R",
        placeholder: "R",
      },
      {
        name: "limit",
        label: "Límite de resultados",
        type: "number",
        defaultValue: "10",
        placeholder: "10",
      },
    ],
    buildRequest: (v) => ({
      url: "/search/tracks",
      params: {
        prefix: v.prefix || "R",
        limit: Number(v.limit || "10"),
      },
    }),
  },
  {
    id: "genreTracks",
    label: "Tracks por género musical",
    params: [
      {
        name: "genreKey",
        label: "Clave del género",
        defaultValue: "rock",
        placeholder: "rock",
      },
      {
        name: "limit",
        label: "Límite de resultados",
        type: "number",
        defaultValue: "50",
        placeholder: "50",
      },
    ],
    buildRequest: (v) => ({
      url: `/genres/${v.genreKey || "rock"}/tracks`,
      params: { limit: Number(v.limit || "50") },
    }),
  },
  {
    id: "artistTracksByYear",
    label: "Tracks de un artista por años (rango)",
    params: [
      {
        name: "artistKey",
        label: "Clave del artista",
        defaultValue: "a2",
        placeholder: "a2",
      },
      {
        name: "year_from",
        label: "Año inicial",
        type: "number",
        defaultValue: "2020",
        placeholder: "2020",
      },
      {
        name: "year_to",
        label: "Año final",
        type: "number",
        defaultValue: "2023",
        placeholder: "2023",
      },
    ],
    buildRequest: (v) => ({
      url: `/artists/${v.artistKey || "a2"}/tracks-by-year`,
      params: {
        year_from: Number(v.year_from || "2020"),
        year_to: Number(v.year_to || "2023"),
      },
    }),
  },
  {
    id: "trackRecommendations",
    label: "Recomendaciones a partir de un track (BFS)",
    params: [
      {
        name: "trackKey",
        label: "Clave del track",
        defaultValue: "t5",
        placeholder: "t5",
      },
      {
        name: "limit",
        label: "Límite de resultados",
        type: "number",
        defaultValue: "20",
        placeholder: "20",
      },
    ],
    buildRequest: (v) => ({
      url: `/tracks/${v.trackKey || "t5"}/recommendations`,
      params: { limit: Number(v.limit || "20") },
    }),
  },
  {
    id: "countTracksByArtist",
    label: "Conteo de tracks por artista",
    params: [
      {
        name: "artistKey",
        label: "Clave del artista",
        defaultValue: "a2",
        placeholder: "a2",
      },
    ],
    buildRequest: (v) => ({
      url: `/counts/tracks-by-artist/${v.artistKey || "a2"}`,
    }),
  },
  {
    id: "artistTraversal",
    label: "Recorrido: artista → tracks (DFS)",
    params: [
      {
        name: "artistKey",
        label: "Clave del artista",
        defaultValue: "a1",
        placeholder: "a1",
      },
      {
        name: "max_depth",
        label: "Profundidad máxima",
        type: "number",
        defaultValue: "2",
        placeholder: "2",
      },
    ],
    buildRequest: (v) => ({
      url: `/graph/artist/${v.artistKey || "a1"}/tracks`,
      params: { max_depth: Number(v.max_depth || "2") },
    }),
  },
];

export default function Queries() {
  const [selectedId, setSelectedId] = useState<QueryId>("topTracks");
  const [values, setValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Datos base de la biblioteca
  const { artists, albums, tracks } = useBackendLibrary();

  const artistByKey = useMemo(
    () => Object.fromEntries(artists.map((a: any) => [a.key, a])),
    [artists]
  );

  const albumByKey = useMemo(
    () => Object.fromEntries(albums.map((al: any) => [al.key, al])),
    [albums]
  );

  const trackByKey = useMemo(
    () => Object.fromEntries(tracks.map((t: any) => [t.key, t])),
    [tracks]
  );

  const trackCountByAlbumKey = useMemo(
    () =>
      tracks.reduce((acc: Record<string, number>, t: any) => {
        if (t.albumKey) {
          acc[t.albumKey] = (acc[t.albumKey] || 0) + 1;
        }
        return acc;
      }, {}),
    [tracks]
  );

  const selectedConfig =
    QUERY_CONFIGS.find((c) => c.id === selectedId) ?? QUERY_CONFIGS[0];

  const queryGroups = useMemo(
    () => [
      {
        title: "Tendencias y descubrimiento",
        description: "Explora qué se escucha más y descubre nueva música.",
        items: [
          "topTracks",
          "trackRecommendations",
          "genreTracks",
          "searchTracks",
        ] as QueryId[],
      },
      {
        title: "Por artista o álbum",
        description: "Navega la biblioteca a partir de artistas y álbumes.",
        items: [
          "artistAlbums",
          "artistTracksByYear",
          "albumTracks",
          "artistTraversal",
        ] as QueryId[],
      },
      {
        title: "Playlists y estadísticas",
        description: "Explora playlists y estadísticas resumidas.",
        items: [
          "playlistTracks",
          "countTracksByArtist",
          "trackFull",
        ] as QueryId[],
      },
    ],
    []
  );

  // Reset de filtros al cambiar de consulta
  useEffect(() => {
    const initial: Record<string, string> = {};
    selectedConfig.params.forEach((p) => {
      initial[p.name] = p.defaultValue ?? "";
    });
    setValues(initial);
    setResult(null);
  }, [selectedId, selectedConfig]);

  const handleChange = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleRun = async () => {
    // Validación para rango de años
    if (selectedId === "artistTracksByYear") {
      const from = Number(values.year_from);
      const to = Number(values.year_to);
      if (!Number.isNaN(from) && !Number.isNaN(to) && from > to) {
        alert("El año inicial no puede ser mayor que el año final.");
        return;
      }
    }

    try {
      setLoading(true);
      const { url, params } = selectedConfig.buildRequest(values);
      const data = await apiGet(url, params);
      setResult(data);
    } catch (err: any) {
      setResult({
        error: err?.response?.data ?? String(err),
      });
    } finally {
      setLoading(false);
    }
  };

  // Normalización de tracks
  const tracksResult: any[] = useMemo(() => {
    if (!result || (result as any).error) return [];

    let raw: any[] = [];

    switch (selectedId) {
      case "topTracks":
      case "albumTracks":
      case "playlistTracks":
      case "searchTracks":
      case "genreTracks":
      case "artistTracksByYear":
      case "trackRecommendations":
        raw = Array.isArray(result) ? result : [];
        break;

      case "trackFull":
        if (result.track) raw = [result.track];
        break;

      case "artistTraversal":
        if (Array.isArray((result as any).tracks)) {
          raw = (result as any).tracks;
        } else if (
          Array.isArray(result) &&
          result.length &&
          result[0].title
        ) {
          raw = result;
        }
        break;

      default:
        raw = [];
    }

    return raw.map((t: any) => {
      const key = t.key ?? t._key ?? t.trackKey;
      const base = key && trackByKey[key] ? trackByKey[key] : {};
      return {
        ...base,
        ...t,
        key: key ?? base.key,
      };
    });
  }, [result, selectedId, trackByKey]);

  const albumsResult: any[] = useMemo(() => {
    if (!result || (result as any).error) return [];

    switch (selectedId) {
      case "artistAlbums":
        return Array.isArray(result) ? result : [];
      default:
        return [];
    }
  }, [result, selectedId]);

  const hasPrettyCards =
    tracksResult.length > 0 || albumsResult.length > 0;

  // Datos para conteo de tracks por artista
  const isCountQuery = selectedId === "countTracksByArtist";
  const countData = isCountQuery && result && !(result as any).error ? result : null;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Explorar biblioteca musical</h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Explora y consulta tendencias, relaciones y estadísticas.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)]">
        {/* IZQUIERDA */}
        <div className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle className="space-y-1">
                <span className="block text-sm font-semibold">
                  {selectedConfig.label}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedConfig.params.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Filtros
                  </p>
                  {selectedConfig.params.map((p) => (
                    <div key={p.name} className="space-y-1">
                      <label className="text-xs font-medium">
                        {p.label}
                      </label>
                      <Input
                        type={p.type === "number" ? "number" : "text"}
                        value={values[p.name] ?? ""}
                        onChange={(e) =>
                          handleChange(p.name, e.target.value)
                        }
                        placeholder={p.placeholder}
                        className="h-8 text-xs"
                      />
                    </div>
                  ))}
                </div>
              )}

              <Button
                onClick={handleRun}
                className="w-full"
                disabled={loading}
              >
                {loading ? "Consultando..." : "Aplicar filtros"}
              </Button>
            </CardContent>
          </Card>

          {/* Resultados */}
          <Card>
            <CardHeader>
              <CardTitle className="space-y-1">
                <span className="block text-sm font-semibold">
                  Resultados obtenidos
                </span>
                {hasPrettyCards || countData ? (
                  <span className="block text-xs text-muted-foreground font-normal">
                    
                  </span>
                ) : (
                  <span className="block text-xs text-muted-foreground font-normal">
                    Ejecuta una exploración.
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">



          {/* Detalle extra para trackFull */}
          {selectedId === "trackFull" &&
            result &&
            !(result as any).error &&
            (result as any).track && (() => {
              const t = (result as any).track;

              const artistName =
                result.artist?.name ??
                (t.artistKey && artistByKey[t.artistKey]?.name) ??
                t.artistName ??
                t.artistKey ??
                "Desconocido";
          
              const albumTitle =
                result.album?.title ??
                (t.albumKey && albumByKey[t.albumKey]?.title) ??
                t.albumTitle ??
                t.albumKey ??
                "Desconocido";

              // Géneros: puede venir como result.genres o track.genres
              const rawGenres = Array.isArray((result as any).genres)
                ? (result as any).genres
                : Array.isArray(t.genres)
                ? t.genres
                : [];

              const genresText =
                rawGenres.length > 0
                  ? rawGenres
                      .map((g: any) => g.name ?? g.key ?? g._key ?? String(g))
                      .join(", ")
                  : null;

              // Plays: probamos varios campos
              const plays =
                t.plays ??
                t.playCount ??
                t.totalPlays ??
                t.stats?.plays;

              return (
                <div className="space-y-1 text-sm">
                  <p className="font-semibold">
                    {t.title ?? "Track sin título"}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    Artista: <span className="font-semibold">{artistName}</span>
                  </p>

                  <p className="text-xs text-muted-foreground">
                    Álbum: <span className="font-semibold">{albumTitle}</span>
                  </p>

                  {genresText && (
                    <p className="text-xs text-muted-foreground">
                      Géneros: <span className="font-semibold">{genresText}</span>
                    </p>
                  )}

                  {plays != null && (
                    <p className="text-xs text-muted-foreground">
                      Reproducciones:{" "}
                      <span className="font-semibold">{plays}</span>
                    </p>
                  )}
                </div>
              );
            })()}


              {/* TRACKS */}
              {tracksResult.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Canciones encontradas ({tracksResult.length})
                  </p>
                  <ul className="space-y-2 text-sm">
                    {tracksResult.map((t: any, idx: number) => {
                      const artist =
                        t.artistKey && artistByKey[t.artistKey]
                          ? artistByKey[t.artistKey]
                          : undefined;
                      const album =
                        t.albumKey && albumByKey[t.albumKey]
                          ? albumByKey[t.albumKey]
                          : undefined;

                      const isTop = selectedId === "topTracks";
                      const isPlaylistTracks =
                        selectedId === "playlistTracks";

                      const plays =
                        t.plays ?? t.playCount ?? t.totalPlays;

                      // Fecha / año para playlist (si viene en el resultado)
                      const addedAtRaw =
                        t.addedAt ??
                        t.added_at ??
                        t.date ??
                        t.insertedAt;
                      let playlistLabel: string | undefined;
                      if (addedAtRaw) {
                        const d = new Date(addedAtRaw);
                        playlistLabel = isNaN(d.getTime())
                          ? String(addedAtRaw)
                          : d.toISOString().slice(0, 10); // YYYY-MM-DD
                      }

                      let rightLabel: string | undefined;
                      if (isTop && plays != null) {
                        rightLabel = `${plays} reproducciones`;
                      } else if (isPlaylistTracks && playlistLabel) {
                        rightLabel = playlistLabel;
                      }

                      const year =
                        t.year ??
                        t.releaseYear ??
                        album?.year;

                      return (
                        <li
                          key={t.key ?? t._key ?? `track-${idx}`}
                        >
                          <TrackCard
                            title={t.title ?? t.name ?? "Sin título"}
                            artistName={
                              t.artistName ||
                              artist?.name ||
                              t.artistKey ||
                              "Artista desconocido"
                            }
                            artistUrl={
                              t.artistKey
                                ? `/artist/${t.artistKey}`
                                : "#"
                            }
                            albumName={
                              t.albumTitle ||
                              album?.title ||
                              t.albumKey ||
                              "Álbum desconocido"
                            }
                            albumUrl={
                              t.albumKey ? `/album/${t.albumKey}` : "#"
                            }
                            duration={t.duration}
                            year={year}
                            rightLabel={rightLabel}
                          />
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* ALBUMS */}
              {albumsResult.length > 0 && (
                <div className="space-y-3">
                  {/* Nombre del artista (punto 2) */}
                  {selectedId === "artistAlbums" && (
                    <div className="text-xs text-muted-foreground">
                      {(() => {
                        const first = albumsResult[0];

                        const akFromAlbum = first.artistKey;
                        const akFromFilter = values.artistKey;
                        const ak = akFromAlbum ?? akFromFilter;

                        const artist =
                          ak && artistByKey[ak] ? artistByKey[ak] : undefined;

                        const name =
                          artist?.name ?? ak ?? "Artista desconocido";

                        return (
                          <span>
                            Artista:{" "}
                            <span className="font-semibold">{name}</span>
                          </span>
                        );
                      })()}
                    </div>
                  )}

                  <p className="text-xs font-semibold text-muted-foreground">
                    Álbumes encontrados ({albumsResult.length})
                  </p>
                  <ul className="flex flex-wrap gap-4 text-sm">

                    {albumsResult.map((al: any) => {
                      const artistKey = al.artistKey ?? values.artistKey;
                      const artist = artistKey ? artistByKey[artistKey] : undefined;

                      const artistName =
                        artist?.name ??
                        artistKey ??
                        "Artista desconocido";

                      const trackCount =
                        trackCountByAlbumKey[al.key] ?? 0;

                      return (
                        <li key={al.key}>
                          <AlbumCard
                            title={al.title}
                            artistName={artistName}
                            artistKey={artistKey ? `/artist/${artistKey}` : "#"}
                            year={al.year}
                            albumKey={al.key}
                            trackCount={trackCount}
                          />
                        </li>
                      );
                    })}

                  </ul>
                </div>
              )}

              {/* Conteo de tracks por artista */}
              {countData && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Conteo de tracks por artista
                  </p>
                  <div className="text-sm">
                    {(() => {
                      const artistKey = countData.artistKey;
                      const artist =
                        artistKey && artistByKey[artistKey];
                      const name =
                        artist?.name ||
                        countData.artistName ||
                        artistKey ||
                        "Artista desconocido";

                      const total =
                        countData.trackCount ??
                        countData.count ??
                        countData.total ??
                        countData.totalTracks ??
                        countData.tracks ??
                        0;

                      return (
                        <>
                          <p>
                            <span className="font-medium">
                              {name}
                            </span>{" "}
                            tiene{" "}
                            <span className="font-semibold">
                              {total} track
                              {total === 1 ? "" : "s"}
                            </span>{" "}
                            en la biblioteca.
                          </p>
                          {artist?.country && (
                            <p className="text-xs text-muted-foreground">
                              País: {artist.country}
                            </p>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* JSON crudo */}
              <details className="mt-2">
                <summary className="text-xs text-muted-foreground cursor-pointer">
                  Alt.: Ver respuesta en formato JSON
                </summary>
                <pre className="mt-2 bg-slate-950 text-slate-100 text-xs p-3 rounded-lg overflow-auto max-h-[320px]">
                  {result === null
                    ? "Aún no se ha ejecutado ninguna consulta."
                    : JSON.stringify(result, null, 2)}
                </pre>
              </details>
            </CardContent>
          </Card>
        </div>

        {/* DERECHA */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>⚡ Exploraciones rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {queryGroups.map((group) => (
                <div key={group.title} className="space-y-2">
                  <div>
                    <p className="text-sm font-semibold">
                      {group.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {group.description}
                    </p>
                  </div>
                  <div className="space-y-2">
                    {group.items.map((id) => {
                      const config = QUERY_CONFIGS.find(
                        (c) => c.id === id
                      );
                      if (!config) return null;
                      const isActive = config.id === selectedId;
                      return (
                        <button
                          key={config.id}
                          type="button"
                          onClick={() => setSelectedId(config.id)}
                          className={`w-full text-left text-xs px-3 py-2 rounded-md border transition ${
                            isActive
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background hover:bg-muted border-border"
                          }`}
                        >
                          <span className="block font-medium">
                            {config.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
