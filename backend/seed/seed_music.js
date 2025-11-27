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
ensurePersistent(artists, ["name"]); 
ensurePersistent(artists, ["genres[*]"]);
ensurePersistent(albums, ["artistKey"]); 
ensurePersistent(albums, ["year"]);
ensurePersistent(tracks, ["title"]); 
ensurePersistent(tracks, ["plays"]);
ensurePersistent(tracks, ["albumKey"]); 
ensurePersistent(tracks, ["artistKey"]); 
ensurePersistent(tracks, ["genres[*]"]);
ensurePersistent(users, ["email"]);
ensurePersistent(playlists, ["userKey"]); 
ensurePersistent(playlists, ["createdAt"]);

[
  artists, albums, tracks, users, playlists, genres,
  rel_artist_album, rel_album_track, rel_track_genre, rel_user_playlist, rel_playlist_track
].forEach(reset);

// Seed
const genreKeys = ["rock","pop","jazz","classical","electronic","latin"];
genres.insert(genreKeys.map(g => ({ _key: g })));

// ==================== ARTISTS ====================
const artistSeed = [
  { _key: "a1",  name: "Luna Rivera",      country: "PE", genres: ["latin", "pop"] },
  { _key: "a2",  name: "The Night Owls",   country: "US", genres: ["rock"] },
  { _key: "a3",  name: "Blue Canvas Trio", country: "UK", genres: ["jazz"] },
  { _key: "a4",  name: "Synthline",        country: "DE", genres: ["electronic"] },
  { _key: "a5",  name: "Orquesta Andina",  country: "PE", genres: ["classical", "latin"] },
  { _key: "a6",  name: "Indigo Waves",     country: "AR", genres: ["pop", "electronic"] },
  { _key: "a7",  name: "Cedro & Cuerdas",  country: "PE", genres: ["classical"] },
  { _key: "a8",  name: "Ruta 34",          country: "CL", genres: ["rock", "latin"] },

  // Artistas agregados antes
  { _key: "a9",  name: "Mar de Fondo",     country: "UY", genres: ["rock", "latin"] },
  { _key: "a10", name: "Solar Echoes",     country: "MX", genres: ["electronic", "pop"] },
  { _key: "a11", name: "Café Meridian",    country: "CO", genres: ["jazz", "latin"] },
  { _key: "a12", name: "Luz de Cámara",    country: "ES", genres: ["pop"] },
  { _key: "a13", name: "Cuarteto del Sur", country: "PE", genres: ["classical", "latin"] },

  // 8 artistas nuevos extra
  { _key: "a14", name: "Bosque Urbano",    country: "BR", genres: ["rock","pop"] },
  { _key: "a15", name: "Línea de Fuego",   country: "MX", genres: ["rock"] },
  { _key: "a16", name: "Nube Rosa",        country: "AR", genres: ["pop","latin"] },
  { _key: "a17", name: "Orbit Ensemble",   country: "CA", genres: ["jazz","electronic"] },
  { _key: "a18", name: "Sierra Brava",     country: "PE", genres: ["latin"] },
  { _key: "a19", name: "Puente Gris",      country: "CL", genres: ["rock","jazz"] },
  { _key: "a20", name: "Nocturna",         country: "ES", genres: ["electronic"] },
  { _key: "a21", name: "Bruma Quartet",    country: "IT", genres: ["classical"] }
];
artists.insert(artistSeed);

// ==================== ALBUMS ====================
const albumSeed = [
  { _key:"al1",  title:"Amanecer",            year:2021, artistKey:"a1" },
  { _key:"al2",  title:"Vértigo",             year:2023, artistKey:"a1" },
  { _key:"al3",  title:"Moonlight Run",       year:2020, artistKey:"a2" },
  { _key:"al4",  title:"Static Roads",        year:2022, artistKey:"a2" },
  { _key:"al5",  title:"Azure Notes",         year:2019, artistKey:"a3" },
  { _key:"al6",  title:"Late Café",           year:2021, artistKey:"a3" },
  { _key:"al7",  title:"Neon Fields",         year:2022, artistKey:"a4" },
  { _key:"al8",  title:"Pulse Driver",        year:2023, artistKey:"a4" },
  { _key:"al9",  title:"Suite Andina",        year:2018, artistKey:"a5" },
  { _key:"al10", title:"Cuerdas del Sur",     year:2022, artistKey:"a7" },
  { _key:"al11", title:"Río Eléctrico",       year:2024, artistKey:"a6" },
  { _key:"al12", title:"Kilómetro 34",        year:2021, artistKey:"a8" },

  // Álbumes agregados antes
  { _key:"al13", title:"Luz Marina",           year:2020, artistKey:"a9" },
  { _key:"al14", title:"Cruce de Vías",        year:2022, artistKey:"a9" },
  { _key:"al15", title:"Orbits",               year:2021, artistKey:"a10" },
  { _key:"al16", title:"Neón Solar",           year:2024, artistKey:"a10" },
  { _key:"al17", title:"Medianoche en Bogotá", year:2019, artistKey:"a11" },
  { _key:"al18", title:"Café Largo",           year:2022, artistKey:"a11" },
  { _key:"al19", title:"Plano Secuencia",      year:2023, artistKey:"a12" },
  { _key:"al20", title:"Flash",                year:2021, artistKey:"a12" },
  { _key:"al21", title:"Suite del Sur",        year:2020, artistKey:"a13" },
  { _key:"al22", title:"Andes Chamber",        year:2023, artistKey:"a13" },

  // 3 nuevos álbumes
  { _key:"al23", title:"Ciudad Verde",         year:2022, artistKey:"a14" },
  { _key:"al24", title:"Horizonte",            year:2021, artistKey:"a16" },
  { _key:"al25", title:"Noches Claras",        year:2023, artistKey:"a20" }
];
albums.insert(albumSeed);

// ==================== TRACKS ====================
function t(_key,title,duration,albumKey,artistKey,genres,plays){
  return {_key,title,duration,albumKey,artistKey,genres,plays};
}

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

  // al13 - Luz Marina (a9)
  t("t41","Costa Norte",210,"al13","a9",["rock","latin"],410),
  t("t42","Luz Marina",200,"al13","a9",["latin"],380),
  t("t43","Mareas Lentas",230,"al13","a9",["rock","latin"],395),
  t("t44","Puerto Gris",215,"al13","a9",["rock"],360),
  t("t45","Calle del Mar",205,"al13","a9",["latin"],402),

  // al14 - Cruce de Vías (a9)
  t("t46","Cruce de Vías",220,"al14","a9",["rock"],440),
  t("t47","Túnel Sur",208,"al14","a9",["rock","latin"],370),
  t("t48","Estación Noche",212,"al14","a9",["rock"],390),
  t("t49","Rieles",199,"al14","a9",["rock"],365),
  t("t50","Retorno",225,"al14","a9",["latin"],355),

  // al15 - Orbits (a10)
  t("t51","Inner Orbit",204,"al15","a10",["electronic","pop"],520),
  t("t52","Solar Drift",218,"al15","a10",["electronic"],545),
  t("t53","Echo Sun",210,"al15","a10",["pop","electronic"],510),
  t("t54","Apogee",230,"al15","a10",["electronic"],498),
  t("t55","Perigee",206,"al15","a10",["pop"],470),

  // al16 - Neón Solar (a10)
  t("t56","Neón Solar",216,"al16","a10",["electronic","pop"],560),
  t("t57","Radiación",209,"al16","a10",["electronic"],535),
  t("t58","Círculo Polar",222,"al16","a10",["electronic"],505),
  t("t59","Luz Fractal",214,"al16","a10",["electronic","pop"],495),
  t("t60","Halo",207,"al16","a10",["pop"],480),

  // al17 - Medianoche en Bogotá (a11)
  t("t61","Medianoche",232,"al17","a11",["jazz","latin"],430),
  t("t62","Plaza Central",220,"al17","a11",["jazz"],410),
  t("t63","Montaña Azul",215,"al17","a11",["jazz","latin"],405),
  t("t64","Café Nocturno",225,"al17","a11",["jazz"],398),
  t("t65","Lluvia Fina",210,"al17","a11",["latin"],385),

  // al18 - Café Largo (a11)
  t("t66","Café Largo",218,"al18","a11",["jazz"],420),
  t("t67","Taza 3",204,"al18","a11",["jazz"],400),
  t("t68","Ruta del Aroma",226,"al18","a11",["jazz","latin"],392),
  t("t69","Vapor",209,"al18","a11",["jazz"],378),
  t("t70","Último Sorbo",212,"al18","a11",["latin"],365),

  // al19 - Plano Secuencia (a12)
  t("t71","Toma 1",205,"al19","a12",["pop"],430),
  t("t72","Corte Final",210,"al19","a12",["pop"],415),
  t("t73","Luces de Estudio",208,"al19","a12",["pop"],405),
  t("t74","Foco Principal",214,"al19","a12",["pop"],398),
  t("t75","Crédito Inicial",202,"al19","a12",["pop"],390),

  // al20 - Flash (a12)
  t("t76","Flash",200,"al20","a12",["pop"],450),
  t("t77","Obturador",207,"al20","a12",["pop"],428),
  t("t78","ISO Alto",211,"al20","a12",["pop"],412),
  t("t79","Enfoque",206,"al20","a12",["pop"],405),
  t("t80","Exposición",213,"al20","a12",["pop"],395),

  // al21 - Suite del Sur (a13)
  t("t81","Preludio del Sur",240,"al21","a13",["classical","latin"],360),
  t("t82","Danza del Valle",232,"al21","a13",["classical","latin"],352),
  t("t83","Interludio Andino",245,"al21","a13",["classical"],342),
  t("t84","Camino Largo",238,"al21","a13",["classical"],338),
  t("t85","Final en Do",250,"al21","a13",["classical"],330),

  // al22 - Andes Chamber (a13)
  t("t86","Altiplano",236,"al22","a13",["classical","latin"],355),
  t("t87","Cuerda Alta",244,"al22","a13",["classical"],348),
  t("t88","Puna",229,"al22","a13",["classical","latin"],340),
  t("t89","Sala de Cámara",241,"al22","a13",["classical"],332),
  t("t90","Despedida",247,"al22","a13",["classical"],325),

  // ==================== 50 TRACKS NUEVOS ====================

  // al23 - Ciudad Verde (a14)
  t("t91","Parque Central",210,"al23","a14",["rock","pop"],420),
  t("t92","Semáforo Rojo",202,"al23","a14",["rock"],395),
  t("t93","Avenida Nueve",215,"al23","a14",["rock","latin"],388),
  t("t94","Auto Gris",208,"al23","a14",["pop"],375),
  t("t95","Luces Bajas",214,"al23","a14",["rock"],402),
  t("t96","Bicicleta Azul",206,"al23","a14",["pop"],365),
  t("t97","Bosque Urbano",220,"al23","a14",["rock","pop"],390),
  t("t98","Rojo y Verde",203,"al23","a14",["rock"],372),
  t("t99","Niebla en la Ciudad",217,"al23","a14",["rock"],360),
  t("t100","Callejón",211,"al23","a14",["latin"],355),
  t("t101","Líneas de Luz",205,"al23","a14",["pop"],348),
  t("t102","Semilla de Asfalto",219,"al23","a14",["rock"],341),
  t("t103","Cruce Peatonal",207,"al23","a14",["rock","pop"],339),
  t("t104","Esquina Norte",213,"al23","a14",["rock"],333),
  t("t105","Último Bus",224,"al23","a14",["rock","latin"],329),

  // al24 - Horizonte (a16)
  t("t106","Cielo Bajo",230,"al24","a16",["pop","latin"],410),
  t("t107","Horizonte",218,"al24","a16",["pop"],398),
  t("t108","Bruma de Verano",225,"al24","a16",["latin"],392),
  t("t109","Nube Rosa",212,"al24","a16",["pop"],385),
  t("t110","Línea del Mar",216,"al24","a16",["latin"],380),
  t("t111","Orilla",209,"al24","a16",["pop"],372),
  t("t112","Reflejos",221,"al24","a16",["pop","latin"],368),
  t("t113","Puerto Claro",214,"al24","a16",["latin"],360),
  t("t114","Marea Alta",207,"al24","a16",["pop"],355),
  t("t115","Viento Salado",219,"al24","a16",["latin"],350),
  t("t116","Postales",211,"al24","a16",["pop"],345),
  t("t117","Tarde Lenta",223,"al24","a16",["pop"],340),
  t("t118","Oriente",205,"al24","a16",["latin"],335),
  t("t119","Contorno",217,"al24","a16",["pop"],330),
  t("t120","Azul Profundo",228,"al24","a16",["pop","latin"],325),

  // al25 - Noches Claras (a20)
  t("t121","Noches Claras",210,"al25","a20",["electronic"],430),
  t("t122","Pulsos",204,"al25","a20",["electronic"],420),
  t("t123","Cielo Neón",218,"al25","a20",["electronic"],412),
  t("t124","Luz Blanca",213,"al25","a20",["electronic","pop"],408),
  t("t125","Ventana Azul",207,"al25","a20",["electronic"],402),
  t("t126","Cables",220,"al25","a20",["electronic"],398),
  t("t127","Parpadeo",202,"al25","a20",["electronic"],392),
  t("t128","Circuito",215,"al25","a20",["electronic"],387),
  t("t129","Techo Bajo",209,"al25","a20",["electronic"],382),
  t("t130","Filtro",216,"al25","a20",["electronic","pop"],377),
  t("t131","Anochecer",222,"al25","a20",["electronic"],371),
  t("t132","Piso 14",211,"al25","a20",["electronic"],366),
  t("t133","Sombras LED",219,"al25","a20",["electronic"],360),
  t("t134","Estática",206,"al25","a20",["electronic"],355),
  t("t135","Última Luz",224,"al25","a20",["electronic"],350),

  // Extras en álbumes existentes
  t("t136","Noche en Ruta",212,"al12","a8",["rock","latin"],345),
  t("t137","Río III",208,"al11","a6",["pop","electronic"],360),
  t("t138","Suite III",260,"al9","a5",["classical"],340),
  t("t139","Campo Abierto",234,"al21","a13",["classical","latin"],330),
  t("t140","Neón Andino",218,"al7","a4",["electronic"],355)
];
tracks.insert(trackSeed);

// ==================== USERS & PLAYLISTS ====================
const userSeed = [
  { _key:"u1", name:"Ana",   email:"ana@example.com" },
  { _key:"u2", name:"Luis",  email:"luis@example.com" },
  { _key:"u3", name:"Sofía", email:"sofia@example.com" },
  { _key:"u4", name:"Diego", email:"diego@example.com" },
  { _key:"u5", name:"Mia",   email:"mia@example.com" }
];
users.insert(userSeed);

const now = Date.now();
const playlistSeed = [
  { _key:"p1", title:"Mañanas Pop",     userKey:"u1", createdAt: now-86400000*5 },
  { _key:"p2", title:"Jazz Café",       userKey:"u2", createdAt: now-86400000*3 },
  { _key:"p3", title:"Electro Run",     userKey:"u3", createdAt: now-86400000*10 },
  { _key:"p4", title:"Clásicos PE",     userKey:"u4", createdAt: now-86400000*20 },
  { _key:"p5", title:"Rock Ruta",       userKey:"u5", createdAt: now-86400000*1  },
  { _key:"p6", title:"Focus Jazz",      userKey:"u1", createdAt: now-86400000*2  },
  { _key:"p7", title:"Relax Andina",    userKey:"u2", createdAt: now-86400000*7  },
  { _key:"p8", title:"Top Electrónica", userKey:"u3", createdAt: now-86400000*4  }
];
playlists.insert(playlistSeed);

// ==================== EDGES ====================
albumSeed.forEach(al => {
  rel_artist_album.insert({ _from:"artists/"+al.artistKey, _to:"albums/"+al._key });
});

trackSeed.forEach(tr => {
  rel_album_track.insert({ _from:"albums/"+tr.albumKey, _to:"tracks/"+tr._key, trackNumber:1 });
});

const genreKeysSet = new Set(genreKeys);
trackSeed.forEach(tr => {
  (tr.genres || []).forEach(g => { 
    if (genreKeysSet.has(g)) {
      rel_track_genre.insert({ _from:"tracks/"+tr._key, _to:"genres/"+g });
    }
  });
});

playlistSeed.forEach(p => {
  rel_user_playlist.insert({ _from:"users/"+p.userKey, _to:"playlists/"+p._key });
});

function pick(arr,n){ 
  const out=[]; 
  const copy=arr.slice(); 
  while(n-- >0 && copy.length){ 
    const i=Math.floor(Math.random()*copy.length); 
    out.push(copy.splice(i,1)[0]); 
  } 
  return out; 
}

const trackKeys = trackSeed.map(t=>t._key);
playlistSeed.forEach((p, idx) => {
  const chosen = pick(trackKeys, 6 + (idx % 3));
  chosen.forEach((tk, j) => {
    rel_playlist_track.insert({
      _from:"playlists/"+p._key,
      _to:"tracks/"+tk,
      createdAt: now - (idx*100000 + j*5000)
    });
  });
});

// ==================== GRAPH ====================
try {
  const graphs = require("@arangodb/general-graph");
  if (!graphs._list().includes(GRAPH_NAME)) {
    graphs._create(GRAPH_NAME, [
      { collection:"rel_artist_album",   from:["artists"],   to:["albums"] },
      { collection:"rel_album_track",    from:["albums"],    to:["tracks"] },
      { collection:"rel_track_genre",    from:["tracks"],    to:["genres"] },
      { collection:"rel_user_playlist",  from:["users"],     to:["playlists"] },
      { collection:"rel_playlist_track", from:["playlists"], to:["tracks"] }
    ]);
  }
} catch(e){}

print("\n✅ Seed completado en DB '"+DB_NAME+"'. Colecciones, índices y aristas listas.\n");
