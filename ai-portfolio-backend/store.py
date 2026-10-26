"""MongoDB memory: chat messages and JD match results, keyed by session id (sid)."""

import os, time
from dotenv import load_dotenv
from pymongo import MongoClient, ASCENDING, DESCENDING

load_dotenv()
_client = MongoClient(
    os.getenv("MONGO_URI", "mongodb://localhost:27017"), serverSelectionTimeoutMS=5000
)
_db = _client[os.getenv("DB_NAME", "ai_portfolio")]
messages = _db["messages"]
matches = _db["matches"]


def init():
    messages.create_index([("sid", ASCENDING), ("ts", ASCENDING)])
    matches.create_index([("sid", ASCENDING), ("ts", DESCENDING)])


def add_exchange(sid, user_text, bot_text):
    now = time.time()
    messages.insert_many(
        [
            {"sid": sid, "role": "user", "content": user_text, "ts": now},
            {"sid": sid, "role": "assistant", "content": bot_text, "ts": now + 0.001},
        ]
    )


def history(sid, limit=20):
    rows = (
        messages.find({"sid": sid}, {"_id": 0, "role": 1, "content": 1})
        .sort("ts", DESCENDING)
        .limit(limit)
    )
    return list(rows)[::-1]


def add_match(sid, title, score, verdict, matched, missing):
    matches.insert_one(
        {
            "sid": sid,
            "title": title,
            "score": score,
            "verdict": verdict,
            "matched": matched,
            "missing": missing,
            "ts": time.time(),
        }
    )


def recent_matches(sid, n=3):
    return list(matches.find({"sid": sid}, {"_id": 0}).sort("ts", DESCENDING).limit(n))
