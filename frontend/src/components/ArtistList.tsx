import { Music, User } from "lucide-react";
import { Artist, Album } from "@/types/music";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ArtistListProps {
  artists: Artist[];
  albums: Album[];
  onSelectArtist: (artist: Artist) => void;
}

export const ArtistList = ({ artists, albums, onSelectArtist }: ArtistListProps) => {
  if (artists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <User className="h-16 w-16 mb-4 opacity-20" />
        <p className="text-lg">No artists yet</p>
        <p className="text-sm">Upload music to see your artists</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-300px)]">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pr-4">
        {artists.map((artist) => {
          const artistAlbums = albums.filter(a => a.artistId === artist.id);
          const albumCount = artistAlbums.length;
          
          return (
            <button
              key={artist.id}
              onClick={() => onSelectArtist(artist)}
              className="group flex flex-col items-center gap-3 p-4 rounded-lg transition-all hover:bg-secondary/50"
            >
              <div className="w-32 h-32 rounded-full bg-gradient-primary flex items-center justify-center transition-transform group-hover:scale-105">
                <User className="h-16 w-16 text-primary-foreground" />
              </div>
              <div className="text-center">
                <h4 className="font-medium text-foreground">{artist.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {albumCount} {albumCount === 1 ? 'album' : 'albums'}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
};