# Music Library – Proyecto Final BD2



Universidad Católica San Pablo – Base de Datos 2 - CCOMP5-1



###### Integrantes:

* Diego Sebastián Astorga Cárdenas
* Ilenne Damaris Saravia Apaza
* Brysett Magely Valenzuela Lazarte



##### 🔶 1. Descripción general del proyecto

Este proyecto implementa una biblioteca musical tipo “Spotify local” utilizando una base de datos NoSQL ArangoDB, un backend en FastAPI, y un frontend en React.



La aplicación permite:

* Visualizar artistas, álbumes, tracks y playlists.
* Recorrer relaciones entre entidades.
* Realizar más de 10 consultas READ avanzadas, incluyendo traversal de grafo, búsquedas y recomendaciones.
* Ejecutar consultas parametrizadas desde una interfaz gráfica.
* Navegar entre artista → álbum → tracks con datos 100% reales provenientes de la base NoSQL.



##### 🔶 2. Justificación: ¿Qué haremos? ¿Con qué BD? ¿Por qué esa BD?



✔ ¿Qué haremos?

Una biblioteca musical completamente funcional que:

* Visualiza datos reales de artistas, álbumes, tracks y playlists.
* Ofrece consultas avanzadas y recomendaciones.
* Trabaja con un backend real y una BD NoSQL escalable.



✔ ¿Con qué BD?

Usamos ArangoDB, ejecutado en modo single server local mediante Docker.



✔ ¿Por qué ArangoDB?

* Porque cumple los requisitos del curso y aporta ventajas clave:
* Modelo Documental + Grafos en un solo motor.
* Permite joins naturales entre artista → álbum → track.
* Lenguaje AQL muy expresivo para filtros, estadísticas y traversals.
* Ideal para datos musicales con múltiples relaciones.
* No es MongoDB (prohibido por la docente).
* El modo Docker es local y no distribuido, cumpliendo la rúbrica.



##### 🔶 3. Arquitectura del sistema (MVC)



🟧 Modelo – ArangoDB

* Colecciones de documentos: artists, albums, tracks, playlists, users, genres.
* Colecciones de relaciones (edges):
* rel\_album\_track
* rel\_track\_genre
* rel\_playlist\_track
* Grafo musicGraph para traversals.
* Consultas en AQL para búsquedas, agrupaciones y recorridos.



🟦 Controlador – FastAPI

* Exposición de endpoints REST:
* READ complejos (10+ consultas)
* CRUD básicos
* Traversal de grafo
* Recomendaciones
* Middleware CORS para conectar con React.
* Función estándar aql() para ejecutar queries en Arango.



🟩 Vista – React

* Renderiza listas, detalles y secciones navegables.
* Página Home con datos reales del backend.
* Página de Artista, Álbum y Playlist completamente conectadas.
* Página “Consultas BD2” con filtros dinámicos.
* Total desac acoplamiento del modelo: todo se obtiene vía API.



##### 🔶 4. Flujo de datos

1️⃣ El frontend hace una petición a FastAPI

Ejemplo: 

GET /albums/al1/tracks



2️⃣ FastAPI construye una consulta AQL



Ejemplo:

FOR e IN rel\_album\_track

&nbsp; FILTER e.\_from == CONCAT("albums/", @albumKey)

&nbsp; FOR t IN tracks

&nbsp;   FILTER t.\_key == PARSE\_IDENTIFIER(e.\_to).key

&nbsp;   RETURN t



3️⃣ ArangoDB ejecuta la consulta y devuelve documentos JSON

4️⃣ FastAPI devuelve JSON limpio al frontend

5️⃣ React recibe los datos y los muestra en pantalla

&nbsp;	➡️ React nunca toca la BD directamente.

&nbsp;	➡️ FastAPI es el puente entre modelo y vista.



##### 🔶 5. Consultas implementadas (READ)



Listados simples

* /artists/all
* /albums/all
* /tracks/all
* /playlists/all
* Relaciones (tipo join)
* /albums/{id}/tracks
* /artists/{id}/albums
* /playlists/{id}/tracks
* /users/{id}/playlists
* /tracks/{id}/full



Búsquedas y filtros

* /search/tracks?prefix=X
* /genres/{genre}/tracks
* /artists/{id}/tracks-by-year



Estadísticas

* /tracks/top?n=10
* /counts/tracks-by-artist/{id}
* /stats/overview



Grafo y recomendaciones

* /graph/artist/{id}/tracks
* /tracks/{id}/recommendations



##### 🔶 6. Modo de ejecución (instrucciones rápidas)

1\. Iniciar ArangoDB (local single server)

docker run -e ARANGO\_ROOT\_PASSWORD=changeme -p 8529:8529 --name arango -d arangodb



2\. Backend (FastAPI)

cd music-backend

pip install -r requirements.txt

uvicorn app.main:app --reload --port 8000



3\. Frontend (React)

cd music-frontend

npm install

npm run dev



##### 🔶 7. Estado actual del proyecto

✔ Conexión full stack funcionando

✔ BD real en Arango

✔ 10+ consultas READ

✔ CRUD básico

✔ Navegación artista/álbum/playlist

✔ Sección dinámica para ejecutar consultas



##### 🔶 8. Proyección para la Entrega Final

* Mejoras UI (cards, tablas, estilos).
* Agregar gráfico estadístico simple.
* Actualizar documentación.
