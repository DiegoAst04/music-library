import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

import Index from "@/pages/Index";
import Queries from "@/pages/Queries";
import ArtistPage from "@/pages/ArtistPage";
import AlbumPage from "@/pages/AlbumPage";
import PlaylistPage from "@/pages/PlaylistPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        {/* Navbar simple */}
        <header className="flex items-center gap-4 px-4 py-2 border-b bg-background">
          <Link to="/" className="font-bold text-lg">
            🎵 Music Library
          </Link>
          <Link
            to="/queries"
            className="text-sm text-muted-foreground hover:underline"
          >
            Búsqueda avanzada
          </Link>
        </header>

        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/artist/:id" element={<ArtistPage />} />
          <Route path="/album/:id" element={<AlbumPage />} />
          <Route path="/playlist/:id" element={<PlaylistPage />} />
          <Route path="/queries" element={<Queries />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>

      <Toaster />
      <Sonner />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
