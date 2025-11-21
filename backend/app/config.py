import os
from dotenv import load_dotenv

load_dotenv()

ARANGO_ENDPOINT = os.getenv("ARANGO_ENDPOINT", "http://127.0.0.1:8529")
ARANGO_USER = os.getenv("ARANGO_USER", "root")
ARANGO_PASS = os.getenv("ARANGO_PASS", "changeme")
ARANGO_DB = os.getenv("ARANGO_DB", "musicdb")
PORT = int(os.getenv("PORT", "8000"))
