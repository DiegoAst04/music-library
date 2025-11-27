// src/pages/Manage.tsx
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiPost, apiPatch, apiDelete } from "@/lib/api";

type Message = {
  type: "success" | "error";
  text: string;
};

export default function Manage() {
  // --- estado de mensajes global sencillo ---
  const [message, setMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(false);

  // --- CREATE TRACK ---
  const [cTitle, setCTitle] = useState("");
  const [cArtistKey, setCArtistKey] = useState("");
  const [cAlbumKey, setCAlbumKey] = useState("");
  const [cDuration, setCDuration] = useState("");
  const [cPlays, setCPlays] = useState("");

  // --- UPDATE TRACK ---
  const [uKey, setUKey] = useState("");
  const [uTitle, setUTitle] = useState("");
  const [uAlbumKey, setUAlbumKey] = useState("");
  const [uPlays, setUPlays] = useState("");

  // --- DELETE TRACK ---
  const [dKey, setDKey] = useState("");

  // helper para mostrar mensajes
  const showMessage = (m: Message) => {
    setMessage(m);
    // mensaje se limpia luego de unos segundos
    setTimeout(() => setMessage(null), 5000);
  };

  // --- handlers ---

  async function handleCreateTrack() {
    if (!cTitle || !cArtistKey) {
      showMessage({
        type: "error",
        text: "Para crear un track, al menos título y artistKey son obligatorios.",
      });
      return;
    }

    try {
      setLoading(true);
      const body: any = {
        title: cTitle,
        artistKey: cArtistKey,
      };

      if (cAlbumKey) body.albumKey = cAlbumKey;
      if (cDuration) body.duration = Number(cDuration);
      if (cPlays) body.plays = Number(cPlays);

      const created = await apiPost("/tracks", body);
      showMessage({
        type: "success",
        text: `Track creado correctamente (key: ${created.key ?? created._key ?? "nuevo"}).`,
      });

      // limpiar formulario
      setCTitle("");
      setCArtistKey("");
      setCAlbumKey("");
      setCDuration("");
      setCPlays("");
    } catch (err: any) {
      showMessage({
        type: "error",
        text: `Error al crear track: ${err?.response?.data?.detail ?? String(err)}`,
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateTrack() {
    if (!uKey) {
      showMessage({
        type: "error",
        text: "Debes indicar la clave (key) del track a actualizar.",
      });
      return;
    }

    const body: any = {};
    if (uTitle) body.title = uTitle;
    if (uAlbumKey) body.albumKey = uAlbumKey;
    if (uPlays) body.plays = Number(uPlays);

    if (Object.keys(body).length === 0) {
      showMessage({
        type: "error",
        text: "Indica al menos un campo a actualizar (título, álbum o plays).",
      });
      return;
    }

    try {
      setLoading(true);
      await apiPatch(`/tracks/${uKey}`, body);
      showMessage({
        type: "success",
        text: `Track ${uKey} actualizado correctamente.`,
      });

      // no limpio uKey para poder seguir editando el mismo
      setUTitle("");
      setUAlbumKey("");
      setUPlays("");
    } catch (err: any) {
      showMessage({
        type: "error",
        text: `Error al actualizar track: ${err?.response?.data?.detail ?? String(err)}`,
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteTrack() {
    if (!dKey) {
      showMessage({
        type: "error",
        text: "Debes indicar la clave (key) del track a eliminar.",
      });
      return;
    }

    if (!window.confirm(`¿Seguro que quieres eliminar el track ${dKey}?`)) {
      return;
    }

    try {
      setLoading(true);
      await apiDelete(`/tracks/${dKey}`);
      showMessage({
        type: "success",
        text: `Track ${dKey} eliminado correctamente.`,
      });
      setDKey("");
    } catch (err: any) {
      showMessage({
        type: "error",
        text: `Error al eliminar track: ${err?.response?.data?.detail ?? String(err)}`,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Gestionar biblioteca</h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Crear, actualizar y eliminar tracks de la biblioteca.
        </p>
      </header>

      {/* Mensajes */}
      {message && (
        <div
          className={`rounded-md p-3 text-sm ${
            message.type === "success"
              ? "bg-emerald-900/40 text-emerald-200 border border-emerald-700/60"
              : "bg-red-900/40 text-red-200 border border-red-700/60"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* CREATE */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">➕ Crear nuevo track</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div>
              <label className="font-medium">Título *</label>
              <Input
                value={cTitle}
                onChange={(e) => setCTitle(e.target.value)}
                placeholder="Moonlight Run"
                className="h-8 text-xs mt-1"
              />
            </div>
            <div>
              <label className="font-medium">Artist key *</label>
              <Input
                value={cArtistKey}
                onChange={(e) => setCArtistKey(e.target.value)}
                placeholder="a2"
                className="h-8 text-xs mt-1"
              />
            </div>
            <div>
              <label className="font-medium">Album key</label>
              <Input
                value={cAlbumKey}
                onChange={(e) => setCAlbumKey(e.target.value)}
                placeholder="al3"
                className="h-8 text-xs mt-1"
              />
            </div>
            <div>
              <label className="font-medium">Duración (segundos)</label>
              <Input
                type="number"
                value={cDuration}
                onChange={(e) => setCDuration(e.target.value)}
                placeholder="210"
                className="h-8 text-xs mt-1"
              />
            </div>
            <div>
              <label className="font-medium">Reproducciones (plays)</label>
              <Input
                type="number"
                value={cPlays}
                onChange={(e) => setCPlays(e.target.value)}
                placeholder="1500"
                className="h-8 text-xs mt-1"
              />
            </div>

            <Button
              className="w-full mt-2"
              onClick={handleCreateTrack}
              disabled={loading}
            >
              {loading ? "Procesando..." : "Crear track"}
            </Button>
          </CardContent>
        </Card>

        {/* UPDATE */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">✏️ Actualizar track</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div>
              <label className="font-medium">Track key *</label>
              <Input
                value={uKey}
                onChange={(e) => setUKey(e.target.value)}
                placeholder="t5"
                className="h-8 text-xs mt-1"
              />
            </div>
            <div>
              <label className="font-medium">Nuevo título</label>
              <Input
                value={uTitle}
                onChange={(e) => setUTitle(e.target.value)}
                placeholder="Nuevo título (opcional)"
                className="h-8 text-xs mt-1"
              />
            </div>
            <div>
              <label className="font-medium">Nuevo album key</label>
              <Input
                value={uAlbumKey}
                onChange={(e) => setUAlbumKey(e.target.value)}
                placeholder="al3"
                className="h-8 text-xs mt-1"
              />
            </div>
            <div>
              <label className="font-medium">Nuevo valor de plays</label>
              <Input
                type="number"
                value={uPlays}
                onChange={(e) => setUPlays(e.target.value)}
                placeholder="2000"
                className="h-8 text-xs mt-1"
              />
            </div>

            <Button
              className="w-full mt-2"
              onClick={handleUpdateTrack}
              disabled={loading}
            >
              {loading ? "Procesando..." : "Actualizar track"}
            </Button>
          </CardContent>
        </Card>

        {/* DELETE */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">🗑️ Eliminar track</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div>
              <label className="font-medium">Track key *</label>
              <Input
                value={dKey}
                onChange={(e) => setDKey(e.target.value)}
                placeholder="t5"
                className="h-8 text-xs mt-1"
              />
            </div>

            <p className="text-[11px] text-muted-foreground">
              Esta acción eliminará el track de la base de datos. No se puede deshacer.
            </p>

            <Button
              variant="destructive"
              className="w-full mt-2"
              onClick={handleDeleteTrack}
              disabled={loading}
            >
              {loading ? "Procesando..." : "Eliminar track"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
