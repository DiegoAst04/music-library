import { Music, Play, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Song, Artist, Album } from "@/types/music";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SongListProps {
  songs: Song[];
  onPlaySong: (song: Song) => void;
  onRemoveSong?: (id: string) => void;
  currentSongId?: string;
  getArtistById: (id: string) => Artist | undefined;
  getAlbumById: (id: string) => Album | undefined;
}

export const SongList = ({ songs, onPlaySong, onRemoveSong, currentSongId, getArtistById, getAlbumById }: SongListProps) => {
  if (songs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <Music className="h-16 w-16 mb-4 opacity-20" />
        <p className="text-lg">Your library is empty</p>
        <p className="text-sm">Upload some music to get started</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-300px)]">
      <div className="space-y-2 pr-4">
        {songs.map((song) => {
          const artist = getArtistById(song.artistId);
          const album = getAlbumById(song.albumId);
          
          return (
          <div
            key={song.id}
            className={`group flex items-center gap-4 p-4 rounded-lg transition-all hover:bg-secondary/50 ${
              currentSongId === song.id ? "bg-secondary" : ""
            }`}
          >
            <button
              onClick={() => onPlaySong(song)}
              className="relative w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center transition-transform hover:scale-105"
            >
              {album?.artwork ? (
                <img src={album.artwork} alt={song.title} className="w-full h-full object-cover rounded-lg" />
              ) : (
                <Music className="h-6 w-6 text-primary-foreground" />
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                <Play className="h-5 w-5 text-white ml-0.5" />
              </div>
            </button>

            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-foreground truncate">{song.title}</h4>
              <p className="text-sm text-muted-foreground truncate">{artist?.name || "Unknown"}</p>
            </div>

            <div className="text-sm text-muted-foreground hidden md:block">{album?.title || "Unknown"}</div>

          </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};