'use strict';
const DB_NAME = "musicdb";
const GRAPH_NAME = "musicGraph";

function ensureDb(name) {
  const dbs = db._databases();
  if (!dbs.includes(name)) db._createDatabase(name);
  db._useDatabase(name);
}
function ensureDocCol(name){ if(!db._collection(name)) db._createDocumentCollection(name); return db._collection(name); }
function ensureEdgeCol(name){ if(!db._collection(name)) db._createEdgeCollection(name); return db._collection(name); }
function ensurePersistent(col, fields, opts={}){ col.ensureIndex({ type:"persistent", fields, unique:false, sparse:false, ...opts }); }
function reset(col){ col.truncate(); }

ensureDb(DB_NAME);
const artists   = ensureDocCol("artists");
const albums    = ensureDocCol("albums");
const tracks    = ensureDocCol("tracks");
const users     = ensureDocCol("users");
const playlists = ensureDocCol("playlists");
const genres    = ensureDocCol("genres"); // opcional

const rel_artist_album   = ensureEdgeCol("rel_artist_album");
const rel_album_track    = ensureEdgeCol("rel_album_track");
const rel_track_genre    = ensureEdgeCol("rel_track_genre");
const rel_user_playlist  = ensureEdgeCol("rel_user_playlist");
const rel_playlist_track = ensureEdgeCol("rel_playlist_track");

// Índices
ensurePersistent(artists, ["name"]); ensurePersistent(artists, ["genres[*]"]);
ensurePersistent(albums, ["artistKey"]); ensurePersistent(albums, ["year"]);
ensurePersistent(tracks, ["title"]); ensurePersistent(tracks, ["plays"]);
ensurePersistent(tracks, ["albumKey"]); ensurePersistent(tracks, ["artistKey"]); ensurePersistent(tracks, ["genres[*]"]);
ensurePersistent(users, ["email"]);
ensurePersistent(playlists, ["userKey"]); ensurePersistent(playlists, ["createdAt"]);

[artists, albums, tracks, users, playlists, genres,
 rel_artist_album, rel_album_track, rel_track_genre, rel_user_playlist, rel_playlist_track].forEach(reset);

// Seed
const genreKeys = ["rock","pop","jazz","classical","electronic","latin"];
genres.insert(genreKeys.map(g => ({ _key: g })));

const artistSeed = [
  { _key:"a1", name:"Luna Rivera", country:"PE", genres:["latin","pop"] },
  { _key:"a2", name:"The Night Owls", country:"US", genres:["rock"] },
  { _key:"a3", name:"Blue Canvas Trio", country:"UK", genres:["jazz"] },
  { _key:"a4", name:"Synthline", country:"DE", genres:["electronic"] },
  { _key:"a5", name:"Orquesta Andina", country:"PE", genres:["classical","latin"] },
  { _key:"a6", name:"Indigo Waves", country:"AR", genres:["pop","electronic"] },
  { _key:"a7", name:"Cedro & Cuerdas", country:"PE", genres:["classical"] },
  { _key:"a8", name:"Ruta 34", country:"CL", genres:["rock","latin"] }
];
artists.insert(artistSeed);

const albumSeed = [
  { _key:"al1", title:"Amanecer", year:2021, artistKey:"a1" },
  { _key:"al2", title:"Vértigo", year:2023, artistKey:"a1" },
  { _key:"al3", title:"Moonlight Run", year:2020, artistKey:"a2" },
  { _key:"al4", title:"Static Roads", year:2022, artistKey:"a2" },
  { _key:"al5", title:"Azure Notes", year:2019, artistKey:"a3" },
  { _key:"al6", title:"Late Café", year:2021, artistKey:"a3" },
  { _key:"al7", title:"Neon Fields", year:2022, artistKey:"a4" },
  { _key:"al8", title:"Pulse Driver", year:2023, artistKey:"a4" },
  { _key:"al9", title:"Suite Andina", year:2018, artistKey:"a5" },
  { _key:"al10", title:"Cuerdas del Sur", year:2022, artistKey:"a7" },
  { _key:"al11", title:"Río Eléctrico", year:2024, artistKey:"a6" },
  { _key:"al12", title:"Kilómetro 34", year:2021, artistKey:"a8" }
];
albums.insert(albumSeed);

function t(_key,title,duration,albumKey,artistKey,genres,plays){ return {_key,title,duration,albumKey,artistKey,genres,plays}; }
const trackSeed = [
  t("t1","Intro Amanecer",120,"al1","a1",["latin","pop"],351),
  t("t2","Sol de Octubre",214,"al1","a1",["latin","pop"],980),
  t("t3","Vértigo I",205,"al2","a1",["pop"],640),
  t("t4","Vértigo II",230,"al2","a1",["pop"],712),
  t("t5","The Run",198,"al3","a2",["rock"],845),
  t("t6","Night Curve",242,"al3","a2",["rock"],523),
  t("t7","Static Road",210,"al4","a2",["rock"],667),
  t("t8","Echo Signs",225,"al4","a2",["rock"],590),
  t("t9","Azure Theme",256,"al5","a3",["jazz"],432),
  t("t10","Smoky Room",201,"al5","a3",["jazz"],350),
  t("t11","Closing Time",220,"al6","a3",["jazz"],501),
  t("t12","Blue Streets",235,"al6","a3",["jazz"],488),
  t("t13","Neon Gate",210,"al7","a4",["electronic"],910),
  t("t14","Field Trip",199,"al7","a4",["electronic"],880),
  t("t15","Driver 1",205,"al8","a4",["electronic"],720),
  t("t16","Driver 2",218,"al8","a4",["electronic"],612),
  t("t17","Obertura",180,"al9","a5",["classical","latin"],300),
  t("t18","Cueca en Re",210,"al9","a5",["classical","latin"],420),
  t("t19","Cuerdas I",240,"al10","a7",["classical"],520),
  t("t20","Cuerdas II",260,"al10","a7",["classical"],510),
  t("t21","Río I",200,"al11","a6",["pop","electronic"],610),
  t("t22","Río II",212,"al11","a6",["pop","electronic"],745),
  t("t23","Ruta",190,"al12","a8",["rock","latin"],430),
  t("t24","Kilómetro",205,"al12","a8",["rock","latin"],455),
  t("t25","Brisa",185,"al1","a1",["latin"],260),
  t("t26","Medianoche",210,"al3","a2",["rock"],470),
  t("t27","Café Tarde",215,"al6","a3",["jazz"],390),
  t("t28","Neon Sky",205,"al7","a4",["electronic"],510),
  t("t29","Suite I",240,"al9","a5",["classical"],330),
  t("t30","Suite II",255,"al9","a5",["classical"],345),
  t("t31","Arpegio",222,"al10","a7",["classical"],380),
  t("t32","Marea",210,"al11","a6",["pop"],560),
  t("t33","Asfalto",208,"al12","a8",["rock"],495),
  t("t34","Norte",206,"al12","a8",["rock","latin"],505),
  t("t35","Luciérnagas",204,"al2","a1",["pop"],455),
  t("t36","Sombras",202,"al4","a2",["rock"],420),
  t("t37","Turno Noche",213,"al3","a2",["rock"],399),
  t("t38","Chispa",198,"al8","a4",["electronic"],488),
  t("t39","Zamba Luz",232,"al9","a5",["latin"],310),
  t("t40","Cuerda Final",245,"al10","a7",["classical"],390),
];
tracks.insert(trackSeed);

const userSeed = [
  { _key:"u1", name:"Ana", email:"ana@example.com" },
  { _key:"u2", name:"Luis", email:"luis@example.com" },
  { _key:"u3", name:"Sofía", email:"sofia@example.com" },
  { _key:"u4", name:"Diego", email:"diego@example.com" },
  { _key:"u5", name:"Mia", email:"mia@example.com" }
];
users.insert(userSeed);

const now = Date.now();
const playlistSeed = [
  { _key:"p1", title:"Mañanas Pop",   userKey:"u1", createdAt: now-86400000*5 },
  { _key:"p2", title:"Jazz Café",     userKey:"u2", createdAt: now-86400000*3 },
  { _key:"p3", title:"Electro Run",   userKey:"u3", createdAt: now-86400000*10 },
  { _key:"p4", title:"Clásicos PE",   userKey:"u4", createdAt: now-86400000*20 },
  { _key:"p5", title:"Rock Ruta",     userKey:"u5", createdAt: now-86400000*1  },
  { _key:"p6", title:"Focus Jazz",    userKey:"u1", createdAt: now-86400000*2  },
  { _key:"p7", title:"Relax Andina",  userKey:"u2", createdAt: now-86400000*7  },
  { _key:"p8", title:"Top Electrónica", userKey:"u3", createdAt: now-86400000*4}
];
playlists.insert(playlistSeed);

// Edges
albumSeed.forEach(al => {
  rel_artist_album.insert({ _from:"artists/"+al.artistKey, _to:"albums/"+al._key });
});
trackSeed.forEach(tr => {
  rel_album_track.insert({ _from:"albums/"+tr.albumKey, _to:"tracks/"+tr._key, trackNumber:1 });
});
const genreKeysSet = new Set(genreKeys);
trackSeed.forEach(tr => {
  (tr.genres||[]).forEach(g => { if(genreKeysSet.has(g)){
    rel_track_genre.insert({ _from:"tracks/"+tr._key, _to:"genres/"+g });
  }});
});
playlistSeed.forEach(p => {
  rel_user_playlist.insert({ _from:"users/"+p.userKey, _to:"playlists/"+p._key });
});
function pick(arr,n){ const out=[]; const copy=arr.slice(); while(n-- >0 && copy.length){ const i=Math.floor(Math.random()*copy.length); out.push(copy.splice(i,1)[0]); } return out; }
const trackKeys = trackSeed.map(t=>t._key);
playlistSeed.forEach((p, idx) => {
  const chosen = pick(trackKeys, 6 + (idx % 3));
  chosen.forEach((tk, j) => {
    rel_playlist_track.insert({ _from:"playlists/"+p._key, _to:"tracks/"+tk, createdAt: now - (idx*100000 + j*5000) });
  });
});

// Graph (opcional)
try {
  const graphs = require("@arangodb/general-graph");
  if (!graphs._list().includes(GRAPH_NAME)) {
    graphs._create(GRAPH_NAME, [
      { collection:"rel_artist_album", from:["artists"], to:["albums"] },
      { collection:"rel_album_track",  from:["albums"],  to:["tracks"] },
      { collection:"rel_track_genre",  from:["tracks"],  to:["genres"] },
      { collection:"rel_user_playlist",from:["users"],   to:["playlists"] },
      { collection:"rel_playlist_track",from:["playlists"],to:["tracks"] }
    ]);
  }
} catch(e){}

print("\n✅ Seed completado en DB '"+DB_NAME+"'. Colecciones, índices y aristas listas.\n");
