// src/hooks/useBackendLibrary.ts
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";

export interface DbArtist {
  key: string;
  name: string;
  country?: string;
  genres?: string[];
}

export interface DbAlbum {
  key: string;
  title: string;
  year?: number;
  artistKey: string;
}

export interface DbTrack {
  key: string;
  title: string;
  duration?: number;
  albumKey: string;
  artistKey: string;
  plays?: number;
}

export interface DbPlaylist {
  key: string;
  title: string;
  userKey: string;
  createdAt?: number;
}

export function useBackendLibrary() {
  const [artists, setArtists] = useState<DbArtist[]>([]);
  const [albums, setAlbums] = useState<DbAlbum[]>([]);
  const [tracks, setTracks] = useState<DbTrack[]>([]);
  const [playlists, setPlaylists] = useState<DbPlaylist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [a, b, c, d] = await Promise.all([
          apiGet<DbArtist[]>("/artists/all"),
          apiGet<DbAlbum[]>("/albums/all"),
          apiGet<DbTrack[]>("/tracks/all"),
          apiGet<DbPlaylist[]>("/playlists/all"),
        ]);
        setArtists(a);
        setAlbums(b);
        setTracks(c);
        setPlaylists(d);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { artists, albums, tracks, playlists, loading };
}
