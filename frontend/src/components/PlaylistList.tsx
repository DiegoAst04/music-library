import { ListMusic, Plus, Trash2 } from "lucide-react";
import { Playlist } from "@/types/music";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface PlaylistListProps {
  playlists: Playlist[];
  onSelectPlaylist: (playlist: Playlist) => void;
  onCreatePlaylist: (name: string, description?: string) => void;
  onDeletePlaylist: (id: string) => void;
}

export const PlaylistList = ({
  playlists,
  onSelectPlaylist,
  onCreatePlaylist,
  onDeletePlaylist,
}: PlaylistListProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = () => {
    if (name.trim()) {
      onCreatePlaylist(name.trim(), description.trim() || undefined);
      setName("");
      setDescription("");
      setOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Create Playlist
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Playlist</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Playlist name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Button onClick={handleCreate} className="w-full">
              Create
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {playlists.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <ListMusic className="h-16 w-16 mb-4 opacity-20" />
          <p className="text-lg">No playlists yet</p>
          <p className="text-sm">Create your first playlist</p>
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-350px)]">
          <div className="space-y-2 pr-4">
            {playlists.map((playlist) => (
              <div
                key={playlist.id}
                className="group flex items-center gap-4 p-4 rounded-lg transition-all hover:bg-secondary/50"
              >
                <button
                  onClick={() => onSelectPlaylist(playlist)}
                  className="flex-1 flex items-center gap-4 min-w-0"
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                    <ListMusic className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <h4 className="font-medium text-foreground truncate">{playlist.name}</h4>
                    <p className="text-sm text-muted-foreground truncate">
                      {playlist.songIds.length} {playlist.songIds.length === 1 ? 'song' : 'songs'}
                    </p>
                  </div>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDeletePlaylist(playlist.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};