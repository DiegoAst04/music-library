import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Song, Artist } from "@/types/music";

interface MusicPlayerProps {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  volume: number;
  onTogglePlayPause: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  getArtistById: (id: string) => Artist | undefined;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export const MusicPlayer = ({
  currentSong,
  isPlaying,
  currentTime,
  volume,
  onTogglePlayPause,
  onSeek,
  onVolumeChange,
  getArtistById,
}: MusicPlayerProps) => {
  if (!currentSong) return null;

  const artist = getArtistById(currentSong.artistId);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-player-glass/95 backdrop-blur-xl border-t border-player-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center gap-6">
          {/* Song Info */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-14 h-14 bg-gradient-primary rounded-lg flex-shrink-0" />
            <div className="min-w-0">
              <h4 className="font-semibold text-foreground truncate">{currentSong.title}</h4>
              <p className="text-sm text-muted-foreground truncate">{artist?.name || "Unknown Artist"}</p>
            </div>
          </div>

          {/* Player Controls */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-foreground hover:text-primary">
                <SkipBack className="h-5 w-5" />
              </Button>
              <Button
                variant="default"
                size="icon"
                className="bg-gradient-primary hover:opacity-90 h-10 w-10 rounded-full"
                onClick={onTogglePlayPause}
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
              </Button>
              <Button variant="ghost" size="icon" className="text-foreground hover:text-primary">
                <SkipForward className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex items-center gap-2 w-full max-w-md">
              <span className="text-xs text-muted-foreground w-10 text-right">{formatTime(currentTime)}</span>
              <Slider
                value={[currentTime]}
                max={currentSong.duration || 100}
                step={0.1}
                onValueChange={([value]) => onSeek(value)}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-10">{formatTime(currentSong.duration || 0)}</span>
            </div>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2 flex-1 justify-end">
            <Volume2 className="h-5 w-5 text-muted-foreground" />
            <Slider
              value={[volume * 100]}
              max={100}
              step={1}
              onValueChange={([value]) => onVolumeChange(value / 100)}
              className="w-24"
            />
          </div>
        </div>
      </div>
    </div>
  );
};