# AI Portfolio — Backend (FastAPI, managed with uv)

    uv sync                                  # creates .venv and installs dependencies
    cp .env.example .env                     # then put your ANTHROPIC_API_KEY
    # edit resume.txt with your real resume
    uv run uvicorn main:app --reload --port 8000

Docs: http://localhost:8000/docs
Add a package later with: uv add <package>
