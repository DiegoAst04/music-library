import { Music, Disc } from "lucide-react";
import { Album, Artist } from "@/types/music";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AlbumListProps {
  albums: Album[];
  getArtistById: (id: string) => Artist | undefined;
  onSelectAlbum: (album: Album) => void;
}

export const AlbumList = ({ albums, getArtistById, onSelectAlbum }: AlbumListProps) => {
  if (albums.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <Disc className="h-16 w-16 mb-4 opacity-20" />
        <p className="text-lg">No albums yet</p>
        <p className="text-sm">Upload music to see your albums</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-300px)]">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pr-4">
        {albums.map((album) => {
          const artist = getArtistById(album.artistId);
          
          return (
            <button
              key={album.id}
              onClick={() => onSelectAlbum(album)}
              className="group flex flex-col gap-3 p-4 rounded-lg transition-all hover:bg-secondary/50 text-left"
            >
              <div className="aspect-square rounded-lg bg-gradient-primary flex items-center justify-center transition-transform group-hover:scale-105 overflow-hidden">
                {album.artwork ? (
                  <img src={album.artwork} alt={album.title} className="w-full h-full object-cover" />
                ) : (
                  <Music className="h-16 w-16 text-primary-foreground" />
                )}
              </div>
              <div>
                <h4 className="font-medium text-foreground truncate">{album.title}</h4>
                <p className="text-sm text-muted-foreground truncate">{artist?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {album.songIds.length} {album.songIds.length === 1 ? 'song' : 'songs'}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
};
