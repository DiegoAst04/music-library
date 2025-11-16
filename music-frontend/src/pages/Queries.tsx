// src/pages/Queries.tsx
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type QueryId =
  | "topTracks"
  | "albumTracks"
  | "artistAlbums"
  | "userPlaylists"
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
  description: string;
  params: ParamDef[];
  buildRequest: (values: Record<string, string>) => {
    url: string;
    params?: Record<string, any>;
  };
};

const QUERY_CONFIGS: QueryConfig[] = [
  {
    id: "topTracks",
    label: "Top N tracks por reproducciones",
    description:
      "Devuelve los tracks más reproducidos ordenados por número de plays (descendente).",
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
    description:
      "Lista todas las canciones que pertenecen a un álbum específico.",
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
    description:
      "Muestra todos los álbumes asociados a un artista de la base de datos.",
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
    id: "userPlaylists",
    label: "Playlists de un usuario",
    description:
      "Devuelve las playlists que pertenecen a un usuario específico.",
    params: [
      {
        name: "userKey",
        label: "Clave del usuario",
        defaultValue: "u1",
        placeholder: "u1",
      },
    ],
    buildRequest: (v) => ({
      url: `/users/${v.userKey || "u1"}/playlists`,
    }),
  },
  {
    id: "playlistTracks",
    label: "Tracks de una playlist",
    description:
      "Lista las canciones que hay dentro de una playlist, ordenadas por fecha de inserción.",
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
    description:
      "Muestra la información del track junto con su álbum y artista relacionados.",
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
    label: "Búsqueda de tracks por prefijo",
    description:
      "Permite buscar canciones cuyo título comienza con un prefijo dado (LIKE).",
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
    label: "Tracks por género",
    description:
      "Lista tracks que están asociados a un género musical específico.",
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
    label: "Tracks de un artista por rango de años",
    description:
      "Muestra las canciones de un artista cuyos álbumes están dentro de un rango de años.",
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
    label: "Recomendaciones a partir de un track",
    description:
      "Busca canciones recomendadas a partir de los géneros del track seleccionado.",
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
    description:
      "Devuelve cuántos tracks están asociados a un artista (vía sus álbumes).",
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
    label: "Recorrido en grafo: artista → tracks",
    description:
      "Ejecuta un traversal sobre el grafo musicGraph desde un artista hasta los tracks relacionados.",
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

  const selectedConfig =
    QUERY_CONFIGS.find((c) => c.id === selectedId) ?? QUERY_CONFIGS[0];

  // Inicializar campos al cambiar de consulta
  useEffect(() => {
    const initial: Record<string, string> = {};
    selectedConfig.params.forEach((p) => {
      initial[p.name] = p.defaultValue ?? "";
    });
    setValues(initial);
  }, [selectedId]);

  const handleChange = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleRun = async () => {
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

  return (
    <div className="p-6 grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)]">
      {/* Columna izquierda: inputs + resultado */}
      <div className="space-y-4">
        {/* Configuración / parámetros de la consulta */}
        <Card>
          <CardHeader>
            <CardTitle>🔧 Configuración de la consulta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-semibold">
                Consulta seleccionada:
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {selectedConfig.description}
              </p>
            </div>

            {selectedConfig.params.length > 0 && (
              <div className="space-y-3">
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
              {loading ? "Buscando..." : "Buscar"}
            </Button>
          </CardContent>
        </Card>

        {/* Resultado */}
        <Card>
          <CardHeader>
            <CardTitle>
              📤 Resultado de la consulta{" "}
              <span className="block text-xs text-muted-foreground font-normal">
                (Salida en formato JSON)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-slate-950 text-slate-100 text-xs p-3 rounded-lg overflow-auto max-h-[520px]">
              {result === null
                ? "Selecciona una consulta y presiona «Buscar»."
                : JSON.stringify(result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>

      {/* Columna derecha: lista de consultas */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>📚 Consultas preestablecidas (lectura)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {QUERY_CONFIGS.map((config) => (
              <button
                key={config.id}
                type="button"
                onClick={() => setSelectedId(config.id)}
                className={`w-full text-left text-sm px-3 py-2 rounded-md border ${
                  config.id === selectedId
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background hover:bg-muted border-border"
                }`}
              >
                {config.label}
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
