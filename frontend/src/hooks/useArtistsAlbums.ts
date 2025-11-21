import { useState, useEffect } from "react";
import { Artist, Album, Song } from "@/types/music";

const ARTISTS_KEY = "music_artists";
const ALBUMS_KEY = "music_albums";

export const useArtistsAlbums = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const storedArtists = localStorage.getItem(ARTISTS_KEY);
    const storedAlbums = localStorage.getItem(ALBUMS_KEY);
    
    if (storedArtists) setArtists(JSON.parse(storedArtists));
    if (storedAlbums) setAlbums(JSON.parse(storedAlbums));
  };

  const saveArtists = (newArtists: Artist[]) => {
    localStorage.setItem(ARTISTS_KEY, JSON.stringify(newArtists));
    setArtists(newArtists);
  };

  const saveAlbums = (newAlbums: Album[]) => {
    localStorage.setItem(ALBUMS_KEY, JSON.stringify(newAlbums));
    setAlbums(newAlbums);
  };

  const addOrGetArtist = (artistName: string): string => {
    const existing = artists.find(a => a.name.toLowerCase() === artistName.toLowerCase());
    if (existing) return existing.id;

    const newArtist: Artist = {
      id: crypto.randomUUID(),
      name: artistName,
      albumIds: [],
      createdAt: new Date(),
    };
    saveArtists([...artists, newArtist]);
    return newArtist.id;
  };

  const addOrGetAlbum = (albumTitle: string, artistId: string, artwork?: string): string => {
    const existing = albums.find(
      a => a.title.toLowerCase() === albumTitle.toLowerCase() && a.artistId === artistId
    );
    if (existing) return existing.id;

    const newAlbum: Album = {
      id: crypto.randomUUID(),
      title: albumTitle,
      artistId,
      artwork,
      songIds: [],
      createdAt: new Date(),
    };
    
    const newAlbums = [...albums, newAlbum];
    saveAlbums(newAlbums);

    // Update artist's albumIds
    const updatedArtists = artists.map(a =>
      a.id === artistId ? { ...a, albumIds: [...a.albumIds, newAlbum.id] } : a
    );
    saveArtists(updatedArtists);

    return newAlbum.id;
  };

  const addSongToAlbum = (albumId: string, songId: string) => {
    const updatedAlbums = albums.map(a =>
      a.id === albumId ? { ...a, songIds: [...a.songIds, songId] } : a
    );
    saveAlbums(updatedAlbums);
  };

  const getArtistById = (id: string) => artists.find(a => a.id === id);
  const getAlbumById = (id: string) => albums.find(a => a.id === id);
  const getAlbumsByArtist = (artistId: string) => albums.filter(a => a.artistId === artistId);

  return {
    artists,
    albums,
    addOrGetArtist,
    addOrGetAlbum,
    addSongToAlbum,
    getArtistById,
    getAlbumById,
    getAlbumsByArtist,
  };
};
