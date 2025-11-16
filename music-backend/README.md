### 🎧 Music Library – Backend (FastAPI + ArangoDB)

🚀 Instalación

pip install -r requirements.txt



▶ Ejecución

uvicorn app.main:app --reload --port 8000



🔗 Documentación automática

Swagger UI:

http://127.0.0.1:8000/docs



🗃 Base de datos

El backend se conecta a ArangoDB (http://localhost:8529) usando credenciales del archivo .env.



Esquema:

* Colecciones:
  artists, albums, tracks, playlists, users, genres
* Relaciones (edges):
  rel\_album\_track, rel\_track\_genre, rel\_playlist\_track



📌 Funcionalidades

* Endpoints READ avanzados
* CRUD básico de tracks
* Traversal del grafo



Recomendaciones

* Búsquedas por prefijo
* Estadísticas de la BD
