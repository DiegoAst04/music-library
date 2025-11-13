import { useState } from "react";
import { Upload, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UploadZone } from "./UploadZone";

interface UploadDialogProps {
  onUpload: (files: File[], artistName: string, albumName: string) => void;
}

export const UploadDialog = ({ onUpload }: UploadDialogProps) => {
  const [open, setOpen] = useState(false);
  const [artistName, setArtistName] = useState("");
  const [albumName, setAlbumName] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const handleUpload = () => {
    if (files.length > 0 && artistName.trim() && albumName.trim()) {
      onUpload(files, artistName.trim(), albumName.trim());
      setArtistName("");
      setAlbumName("");
      setFiles([]);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Music
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Music to Library</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="artist">Artist Name</Label>
            <Input
              id="artist"
              placeholder="Enter artist name"
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="album">Album Name</Label>
            <Input
              id="album"
              placeholder="Enter album name"
              value={albumName}
              onChange={(e) => setAlbumName(e.target.value)}
            />
          </div>
          <UploadZone onUpload={setFiles} />
          {files.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {files.length} {files.length === 1 ? 'file' : 'files'} selected
            </p>
          )}
          <Button 
            onClick={handleUpload} 
            className="w-full"
            disabled={!artistName.trim() || !albumName.trim() || files.length === 0}
          >
            <Upload className="h-4 w-4 mr-2" />
            Add to Library
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};