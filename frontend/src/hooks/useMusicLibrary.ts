import { useState, useEffect } from "react";
import { Song } from "@/types/music";

const STORAGE_KEY = "music_library";

export const useMusicLibrary = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadSongs();
  }, []);

  const loadSongs = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setSongs(JSON.parse(stored));
    }
  };

  const saveSongs = (newSongs: Song[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSongs));
    setSongs(newSongs);
  };

  const addSongs = async (
    files: File[],
    artistId: string,
    albumId: string,
    onSongAdded?: (songId: string) => void
  ) => {
    const newSongs: Song[] = files.map((file) => {
      const songId = crypto.randomUUID();
      const song: Song = {
        id: songId,
        title: file.name.replace(/\.[^/.]+$/, ""),
        artistId,
        albumId,
        duration: 0,
        file,
        addedAt: new Date(),
      };
      
      if (onSongAdded) onSongAdded(songId);
      return song;
    });

    saveSongs([...songs, ...newSongs]);
  };

  const getSongsByAlbum = (albumId: string) => {
    return songs.filter(s => s.albumId === albumId);
  };

  const getSongsByIds = (ids: string[]) => {
    return songs.filter(s => ids.includes(s.id));
  };

  const removeSong = (id: string) => {
    saveSongs(songs.filter((song) => song.id !== id));
  };

  const filteredSongs = songs.filter((song) =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return {
    songs: filteredSongs,
    allSongs: songs,
    searchQuery,
    setSearchQuery,
    addSongs,
    removeSong,
    getSongsByAlbum,
    getSongsByIds,
  };
};
