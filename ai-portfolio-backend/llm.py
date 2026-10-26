import json, os, re
from dotenv import load_dotenv
from groq import Groq

load_dotenv()
client = Groq()  # reads GROQ_API_KEY from env
MODEL = os.getenv("MODEL", "llama-3.3-70b-versatile")


def ask(
    system: str,
    messages: list[dict],
    max_tokens: int = 1000,
    deterministic: bool = False,
    json_mode: bool = False,
) -> str:
    kwargs = {}
    if deterministic:
        kwargs["temperature"] = 0
    if json_mode:
        kwargs["response_format"] = {"type": "json_object"}
    r = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "system", "content": system}] + messages,
        max_tokens=max_tokens,
        **kwargs,
    )
    return (r.choices[0].message.content or "").strip()


def ask_json(system: str, user: str, max_tokens: int = 1500) -> dict:
    raw = ask(
        system,
        [{"role": "user", "content": user}],
        max_tokens,
        deterministic=True,
        json_mode=True,
    )
    raw = re.sub(r"^```(?:json)?|```$", "", raw.strip(), flags=re.M).strip()
    return json.loads(raw)

def ask_stream(system: str, messages: list[dict], max_tokens: int = 1000):
    stream = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "system", "content": system}] + messages,
        max_tokens=max_tokens,
        stream=True,
    )
    for chunk in stream:
        delta = chunk.choices[0].delta.content if chunk.choices else None
        if delta:
            yield delta