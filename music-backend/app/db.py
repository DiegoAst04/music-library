from arango import ArangoClient
from .config import ARANGO_ENDPOINT, ARANGO_USER, ARANGO_PASS, ARANGO_DB

# Cliente y DB compartidos
_client = ArangoClient(hosts=ARANGO_ENDPOINT)
db = _client.db(ARANGO_DB, username=ARANGO_USER, password=ARANGO_PASS)

def aql(query: str, bind_vars: dict | None = None):
    """Ejecuta AQL y retorna lista. Lanza excepción si hay error de AQL."""
    cursor = db.aql.execute(query, bind_vars=bind_vars or {})
    return list(cursor)

def exists_doc(collection: str, key: str) -> bool:
    return db.collection(collection).has(key)
