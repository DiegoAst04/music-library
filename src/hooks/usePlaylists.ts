import { useState, useEffect } from "react";
import { Playlist } from "@/types/music";

const PLAYLISTS_KEY = "music_playlists";

export const usePlaylists = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = () => {
    const stored = localStorage.getItem(PLAYLISTS_KEY);
    if (stored) {
      setPlaylists(JSON.parse(stored));
    }
  };

  const savePlaylists = (newPlaylists: Playlist[]) => {
    localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(newPlaylists));
    setPlaylists(newPlaylists);
  };

  const createPlaylist = (name: string, description?: string) => {
    const newPlaylist: Playlist = {
      id: crypto.randomUUID(),
      name,
      description,
      songIds: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    savePlaylists([...playlists, newPlaylist]);
    return newPlaylist;
  };

  const deletePlaylist = (id: string) => {
    savePlaylists(playlists.filter(p => p.id !== id));
  };

  const addSongToPlaylist = (playlistId: string, songId: string) => {
    const updatedPlaylists = playlists.map(p =>
      p.id === playlistId
        ? { ...p, songIds: [...p.songIds, songId], updatedAt: new Date() }
        : p
    );
    savePlaylists(updatedPlaylists);
  };

  const removeSongFromPlaylist = (playlistId: string, songId: string) => {
    const updatedPlaylists = playlists.map(p =>
      p.id === playlistId
        ? { ...p, songIds: p.songIds.filter(id => id !== songId), updatedAt: new Date() }
        : p
    );
    savePlaylists(updatedPlaylists);
  };

  const updatePlaylist = (id: string, updates: Partial<Playlist>) => {
    const updatedPlaylists = playlists.map(p =>
      p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
    );
    savePlaylists(updatedPlaylists);
  };

  return {
    playlists,
    createPlaylist,
    deletePlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
    updatePlaylist,
  };
};
