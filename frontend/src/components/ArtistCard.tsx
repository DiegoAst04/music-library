import { User } from "lucide-react";
import { Link } from "react-router-dom";

type ArtistCardProps = {
  artistName: string;
  albumCount: number;
  songCount: number;
  artistKey?: string;
}

const ArtistCard: React.FC<ArtistCardProps> = ({
  artistName,
  albumCount,
  songCount,
  artistKey,
}) => {

  return (
    <button
      onClick={() => {}}
      className="group flex flex-col items-center gap-3 p-4 rounded-lg transition-all hover:bg-secondary/50"
    >
      <div className="w-32 h-32 rounded-full bg-gradient-primary flex items-center justify-center transition-transform group-hover:scale-105">
        <User className="h-16 w-16 text-primary-foreground" />
      </div>
      <div className="text-center">
        <Link
              to={`/artist/${artistKey}`}
              className="text-sm font-semibold hover:underline"
            >
        <h4 className="font-medium text-foreground">{artistName}</h4>
        </Link>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{albumCount} {albumCount === 1 ? 'álbum' : 'álbumes'}</span>
          <span>•</span>
          <span>{songCount} {songCount === 1 ? 'canción' : 'canciones'}</span>
        </div>
      </div>
    </button>
  );
};

export { ArtistCard };