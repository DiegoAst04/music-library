import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiGet } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function PlaylistPage() {
  const { id } = useParams();
  const [playlist, setPlaylist] = useState<any>(null);
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const pls = await apiGet("/playlists/all");
        const pl = pls.find((p: any) => p.key === id);
        setPlaylist(pl);

        if (pl) {
          const t = await apiGet(`/playlists/${id}/tracks`);
          setTracks(t);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <p className="p-6">Cargando playlist...</p>;
  if (!playlist) return <p className="p-6">Playlist no encontrada.</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">{playlist.title}</h1>

      <Card>
        <CardHeader>
          <CardTitle>Tracks</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1">
            {tracks.map((t) => (
              <li key={t.key}>
                {t.title} — plays: {t.plays} — artistas: {t.artistKey}
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
