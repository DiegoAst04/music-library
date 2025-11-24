# backend/app/db.py
from arango import ArangoClient
from .config import settings
import time

# Variables globales que se inicializan una sola vez
_client = None
_db = None

def _connect():
    global _client, _db
    if _db is not None:
        return _db

    print("Conectando a ArangoDB...")
    for intento in range(1, 11):
        try:
            _client = ArangoClient(hosts=settings.ARANGO_ENDPOINT)
            _db = _client.db(
                settings.ARANGO_DB,
                username=settings.ARANGO_USER,
                password=settings.ARANGO_PASS
            )
            # Prueba real de conexión
            _db.collections()
            print("¡Conectado a ArangoDB correctamente!")
            return _db
        except Exception as e:
            print(f"Intento {intento}/10 falló: {e}")
            if intento < 10:
                time.sleep(2)

    raise Exception("No se pudo conectar a ArangoDB")

# Estas dos funciones son las que ya usas en main.py → NO LAS TOQUES
def aql(query: str, bind_vars: dict | None = None):
    db = _connect()
    cursor = db.aql.execute(query, bind_vars=bind_vars or {})
    return list(cursor)

def exists_doc(collection: str, key: str) -> bool:
    db = _connect()
    return db.collection(collection).has(key)