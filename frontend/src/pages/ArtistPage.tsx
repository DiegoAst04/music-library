import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiGet } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function ArtistPage() {
  const { id } = useParams();
  const [artist, setArtist] = useState<any>(null);
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const artistData = await apiGet(`/artists/all`);
        const foundArtist = artistData.find((a: any) => a.key === id);
        setArtist(foundArtist);

        const albumsData = await apiGet(`/artists/${id}/albums`);
        setAlbums(albumsData);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <p className="p-6">Cargando artista...</p>;
  if (!artist) return <p className="p-6">No se encontró el artista.</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">{artist.name}</h1>
      <p className="text-sm text-muted-foreground">{artist.country ?? "—"}</p>

      <Card>
        <CardHeader>
          <CardTitle>Álbumes</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1">
            {albums.map((a) => (
              <li key={a.key}>
                <Link
                  to={`/album/${a.key}`}
                  className="text-primary hover:underline"
                >
                  {a.title} ({a.year})
                </Link>
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
