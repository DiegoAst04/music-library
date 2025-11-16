import { useState } from "react";
import { Upload } from "lucide-react";

interface UploadZoneProps {
  onUpload: (files: File[]) => void;
  compact?: boolean;
}

export const UploadZone = ({ onUpload, compact = false }: UploadZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;

    const audioFiles = Array.from(fileList).filter((file) =>
      file.type.startsWith("audio/")
    );

    if (audioFiles.length > 0) {
      onUpload(audioFiles);
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`relative border-2 border-dashed rounded-lg transition-colors ${
        compact ? "p-6" : "p-12"
      } ${
        isDragging
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50"
      }`}
    >
      <input
        type="file"
        multiple
        accept="audio/*"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <div className={`flex flex-col items-center gap-4 text-center ${compact ? "gap-2" : "gap-4"}`}>
        <div className={`rounded-full bg-primary/10 ${compact ? "p-3" : "p-4"}`}>
          <Upload className={`text-primary ${compact ? "h-6 w-6" : "h-8 w-8"}`} />
        </div>
        <div>
          <p className={`font-medium text-foreground ${compact ? "text-base" : "text-lg"} mb-1`}>
            Drop your music files here
          </p>
          <p className="text-sm text-muted-foreground">
            or click to browse (MP3, WAV, FLAC, etc.)
          </p>
        </div>
      </div>
    </div>
  );
};