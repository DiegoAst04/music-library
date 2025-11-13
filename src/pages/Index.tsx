import { useState } from "react";
import { Music, Search, User, Disc, ListMusic, Library } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { MusicPlayer } from "@/components/MusicPlayer";
import { SongList } from "@/components/SongList";
import { ArtistList } from "@/components/ArtistList";
import { AlbumList } from "@/components/AlbumList";
import { PlaylistList } from "@/components/PlaylistList";
import { UploadDialog } from "@/components/UploadDialog";
import { useMusicPlayer } from "@/hooks/useMusicPlayer";
import { useMusicLibrary } from "@/hooks/useMusicLibrary";
import { useArtistsAlbums } from "@/hooks/useArtistsAlbums";
import { usePlaylists } from "@/hooks/usePlaylists";
import { Artist, Album, Playlist } from "@/types/music";
import { ArrowLeft } from "lucide-react";

const Index = () => {
  const { currentSong, isPlaying, currentTime, volume, playSong, togglePlayPause, seek, setVolume } =
    useMusicPlayer();
  const { songs, searchQuery, setSearchQuery, addSongs, removeSong, getSongsByAlbum, getSongsByIds } =
    useMusicLibrary();
  const { artists, albums, addOrGetArtist, addOrGetAlbum, addSongToAlbum, getArtistById, getAlbumById, getAlbumsByArtist } =
    useArtistsAlbums();
  const { playlists, createPlaylist, deletePlaylist, addSongToPlaylist, removeSongFromPlaylist } =
    usePlaylists();

  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);

  const handleUpload = (files: File[], artistName: string, albumName: string) => {
    const artistId = addOrGetArtist(artistName);
    const albumId = addOrGetAlbum(albumName, artistId);
    
    addSongs(files, artistId, albumId, (songId) => {
      addSongToAlbum(albumId, songId);
    });
  };

  const handleSelectArtist = (artist: Artist) => {
    setSelectedArtist(artist);
    setSelectedAlbum(null);
    setSelectedPlaylist(null);
  };

  const handleSelectAlbum = (album: Album) => {
    setSelectedAlbum(album);
    setSelectedArtist(null);
    setSelectedPlaylist(null);
  };

  const handleSelectPlaylist = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setSelectedArtist(null);
    setSelectedAlbum(null);
  };

  const handleBack = () => {
    setSelectedArtist(null);
    setSelectedAlbum(null);
    setSelectedPlaylist(null);
  };

  const displayedSongs = selectedAlbum
    ? getSongsByAlbum(selectedAlbum.id)
    : selectedPlaylist
    ? getSongsByIds(selectedPlaylist.songIds)
    : songs;

  return (
    <div className="min-h-screen bg-background pb-32" style={{ backgroundImage: 'var(--gradient-background)' }}>
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-10 bg-background/80">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              {(selectedArtist || selectedAlbum || selectedPlaylist) && (
                <Button variant="ghost" size="icon" onClick={handleBack}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
              <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Music className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  {selectedArtist
                    ? selectedArtist.name
                    : selectedAlbum
                    ? selectedAlbum.title
                    : selectedPlaylist
                    ? selectedPlaylist.name
                    : "My Music Library"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {selectedArtist
                    ? `${getAlbumsByArtist(selectedArtist.id).length} albums`
                    : selectedAlbum
                    ? `${getArtistById(selectedAlbum.artistId)?.name} • ${displayedSongs.length} songs`
                    : selectedPlaylist
                    ? `${displayedSongs.length} songs`
                    : `${songs.length} songs`}
                </p>
              </div>
            </div>
          </div>

          {!selectedArtist && !selectedAlbum && !selectedPlaylist && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search songs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary/50 border-border/50"
              />
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {selectedArtist ? (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-foreground">Albums</h2>
            <AlbumList
              albums={getAlbumsByArtist(selectedArtist.id)}
              getArtistById={getArtistById}
              onSelectAlbum={handleSelectAlbum}
            />
          </div>
        ) : selectedAlbum || selectedPlaylist ? (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-foreground">Songs</h2>
            <SongList
              songs={displayedSongs}
              onPlaySong={playSong}
              onRemoveSong={selectedPlaylist ? undefined : removeSong}
              currentSongId={currentSong?.id}
              getArtistById={getArtistById}
              getAlbumById={getAlbumById}
            />
          </div>
        ) : (
          <Tabs defaultValue="songs" className="space-y-6">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="songs">
                  <Library className="h-4 w-4 mr-2" />
                  Songs
                </TabsTrigger>
                <TabsTrigger value="artists">
                  <User className="h-4 w-4 mr-2" />
                  Artists
                </TabsTrigger>
                <TabsTrigger value="albums">
                  <Disc className="h-4 w-4 mr-2" />
                  Albums
                </TabsTrigger>
                <TabsTrigger value="playlists">
                  <ListMusic className="h-4 w-4 mr-2" />
                  Playlists
                </TabsTrigger>
              </TabsList>
              <UploadDialog onUpload={handleUpload} />
            </div>

            <TabsContent value="songs">
              <SongList
                songs={displayedSongs}
                onPlaySong={playSong}
                onRemoveSong={removeSong}
                currentSongId={currentSong?.id}
                getArtistById={getArtistById}
                getAlbumById={getAlbumById}
              />
            </TabsContent>

            <TabsContent value="artists">
              <ArtistList
                artists={artists}
                albums={albums}
                onSelectArtist={handleSelectArtist}
              />
            </TabsContent>

            <TabsContent value="albums">
              <AlbumList
                albums={albums}
                getArtistById={getArtistById}
                onSelectAlbum={handleSelectAlbum}
              />
            </TabsContent>

            <TabsContent value="playlists">
              <PlaylistList
                playlists={playlists}
                onSelectPlaylist={handleSelectPlaylist}
                onCreatePlaylist={createPlaylist}
                onDeletePlaylist={deletePlaylist}
              />
            </TabsContent>
          </Tabs>
        )}
      </main>

      {/* Music Player */}
      <MusicPlayer
        currentSong={currentSong}
        isPlaying={isPlaying}
        currentTime={currentTime}
        volume={volume}
        onTogglePlayPause={togglePlayPause}
        onSeek={seek}
        onVolumeChange={setVolume}
        getArtistById={getArtistById}
      />
    </div>
  );
};

export default Index;
