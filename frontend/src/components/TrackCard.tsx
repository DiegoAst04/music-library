import { Music, Play } from "lucide-react";
import React from "react";

type TrackCardProps = {
  title: string;
  artistName: string;
  artistUrl?: string;
  albumName?: string;
  albumUrl?: string;
  duration?: number | string;
  year?: number | string;      // 👈 nuevo: año (opcional)
  artworkUrl?: string;
  className?: string;
  rightLabel?: string;         // 👈 nuevo: etiqueta derecha (ej. "1234 reproducciones" o fecha)
};

// Utilidad: segundos → "m:ss" o "h:mm:ss"
function formatDuration(d?: number | string): string {
  if (d == null) return "–";
  if (typeof d === "string") return d;

  const total = Math.max(0, Math.floor(d));
  const s = total % 60;
  const m = Math.floor((total % 3600) / 60);
  const h = Math.floor(total / 3600);
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  if (h > 0) return `${h}:${pad(m)}:${pad(s)}`;
  return `${m}:${pad(s)}`;
}

const TrackCard: React.FC<TrackCardProps> = ({
  title,
  artistName,
  artistUrl,
  albumName = "Álbum desconocido",
  albumUrl,
  duration,
  year,
  className,
  rightLabel,
}) => {
  // Texto del extremo derecho: etiqueta custom o duración
  const displayRight = rightLabel ?? formatDuration(duration);

  return (
    <div
      className={`group flex items-center gap-4 p-4 rounded-lg transition-all hover:bg-secondary/50 ${className ?? ""}`}
      role="group"
      aria-label={`Track: ${title} by ${artistName}`}
    >
      {/* Icono / portada */}
      <div className="relative w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center transition-transform hover:scale-105 shrink-0">
        <Music className="h-6 w-6 text-primary opacity-80" />
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
          <Play className="h-5 w-5 text-white ml-0.5" fill="white" />
        </div>
      </div>

      {/* Texto principal */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-foreground truncate">{title}</h4>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {artistUrl ? (
            <a
              href={artistUrl}
              className="hover:underline truncate"
              {...(artistUrl.startsWith("http")
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {artistName || "Artista desconocido"}
            </a>
          ) : (
            <span className="truncate">
              {artistName || "Artista desconocido"}
            </span>
          )}

          <span className="opacity-60">•</span>

          {albumUrl ? (
            <a
              href={albumUrl}
              className="hover:underline hidden sm:inline"
              {...(albumUrl.startsWith("http")
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {albumName}
            </a>
          ) : (
            <span className="hidden sm:inline">{albumName}</span>
          )}

          {year && (
            <>
              <span className="opacity-60">•</span>
              <span className="hidden sm:inline">
                {typeof year === "number" ? year : String(year)}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Lado derecho (duración / etiqueta) */}
      <div className="text-sm text-muted-foreground tabular-nums">
        {displayRight}
      </div>
    </div>
  );
};

export { TrackCard };
