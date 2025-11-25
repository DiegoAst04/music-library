import { Disc3 } from "lucide-react";
import { Link } from "react-router-dom";
import React from "react";

type AlbumCardProps = {
  title: string;
  artistName?: string;
  artistKey?: string;
  albumKey?: string;
  year?: number;
  trackCount?: number;
  className?: string;
}

const AlbumCard: React.FC<AlbumCardProps> = ({
  title,
  artistName,
  artistKey,
  albumKey,
  year,
  className,
}) => {

  return (
    <Link
      to={`/album/${albumKey}`}
      className="group flex flex-col gap-3 p-4 rounded-lg transition-all hover:bg-secondary/50 text-left"
    >
      <div className="aspect-square rounded-lg bg-gradient-primary flex items-center justify-center transition-transform group-hover:scale-105 overflow-hidden">
        <Disc3 className="h-16 w-16 text-primary-foreground" />
      </div>
      <div className="space-y-1">
        <h4 className="font-medium text-foreground truncate">{title}</h4>
          <Link
            to={`${artistKey}`}
            onClick={(e) => e.stopPropagation()}
            className="text-primary hover:underline font-medium"
          >
            {artistName}
          </Link>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {year && <span>{year}</span>}
          {year && <span>•</span>}
          <span>1 o más tracks</span>
        </div>
      </div>
    </Link>
  );
};

export { AlbumCard };