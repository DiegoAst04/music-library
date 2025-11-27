import { Link } from "react-router-dom";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Disc3 } from "lucide-react";

type AlbumCardProps = {
  title: string;
  artistName: string;
  artistKey: string;   // URL tipo `/artist/a1`
  year?: number;
  albumKey: string;    // key del álbum (ej. "al1")
  trackCount?: number; // 👉 NUEVO
};

export function AlbumCard({
  title,
  artistName,
  artistKey,
  year,
  albumKey,
  trackCount,
}: AlbumCardProps) {
  const count = trackCount ?? 0;
  const label =
    count === 1
      ? "1 canción"
      : count > 1
      ? `${count} canciones`
      : "Sin canciones";

  return (
    <Card className="w-56 overflow-hidden">
      <CardHeader className="p-3 pb-2">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-md bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
            <Disc3 className="h-6 w-6 text-slate-100" />
          </div>
          <div className="min-w-0">
            <Link
              to={`/album/${albumKey}`}
              className="text-sm font-semibold hover:underline"
            >
              {title}
            </Link>
            <p className="text-xs text-muted-foreground truncate">
              <Link to={artistKey} className="hover:underline">
                {artistName}
              </Link>
            </p>
            {year && (
              <p className="text-[11px] text-muted-foreground">{year}</p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-3 pb-3 pt-1">
        <p className="text-xs text-muted-foreground">
          {label} {/* 👈 aquí antes estaba "1 o más tracks" */}
        </p>
      </CardContent>
    </Card>
  );
}
