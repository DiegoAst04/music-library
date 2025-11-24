import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiGet } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function AlbumPage() {
  const { id } = useParams();
  const [album, setAlbum] = useState<any>(null);
  const [tracks, setTracks] = useState<any[]>([]);
  const [artist, setArtist] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // obtener álbum completo
        const allAlbums = await apiGet("/albums/all");
        const found = allAlbums.find((a: any) => a.key === id);
        setAlbum(found);

        // obtener tracks
        const t = await apiGet(`/albums/${id}/tracks`);
        setTracks(t);

        // obtener artista
        if (found) {
          const allArtists = await apiGet("/artists/all");
          const art = allArtists.find((a: any) => a.key === found.artistKey);
          setArtist(art);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <p className="p-6">Cargando álbum...</p>;
  if (!album) return <p className="p-6">No se encontró el álbum.</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">{album.title}</h1>
      <p className="text-sm text-muted-foreground">
        {artist ? (
          <Link to={`/artist/${artist.key}`} className="text-primary hover:underline">
            {artist.name}
          </Link>
        ) : (
          "Artista no encontrado"
        )}
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Tracks</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1">
            {tracks.map((t) => (
              <li key={t.key}>
                {t.title} — {t.duration}s — plays: {t.plays}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Link to="/" className="text-sm text-primary hover:underline">
        ← Volver al inicio
      </Link>
    </div>
  );
}
