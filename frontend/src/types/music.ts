export interface Artist {
  id: string;
  name: string;
  albumIds: string[];
  createdAt: Date;
}

export interface Album {
  id: string;
  title: string;
  artistId: string;
  artwork?: string;
  songIds: string[];
  year?: number;
  createdAt: Date;
}

export interface Song {
  id: string;
  title: string;
  artistId: string;
  albumId: string;
  duration: number;
  file: File;
  track?: number;
  addedAt: Date;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  songIds: string[];
  createdAt: Date;
  updatedAt: Date;
}
