# AI Portfolio — Backend (FastAPI, managed with uv)

## Local Development Setup

1. Install dependencies:
   ```bash
   uv sync
   ```
2. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Fill in your configuration in `.env`:
   - `gemini_api_key` (from Google AI Studio for Gemini LLM inference and vector embeddings)
   - `MODEL` (defaults to gemini-3.5-flash; can be gemini-3.5-flash, gemini-3.1-flash-lite, gemini-2.5-pro, etc.)
   - `Qdrant_url` and `Qdrant_api_key` (optional locally, falls back to local embedded Qdrant)
   - `MONGO_URI` and `DB_NAME` (optional locally, falls back to local MongoDB or in-memory)
   - `EMBEDDING_MODEL` (defaults to models/gemini-embedding-001)
   - `EMBEDDING_DIM` (defaults to 768)
   - `FRONTEND_ORIGIN` (defaults to http://localhost:5173)
   - `INGEST_ADMIN_KEY` (secret key required to ingest new resume data)

3. Ingest your resume into the vector database:
   ```bash
   uv run python ingest.py
   ```

4. Start the backend server:
   ```bash
   uv run uvicorn main:app --reload --port 8000
   ```

- API Documentation: http://localhost:8000/docs
- Add a package: `uv add <package>`

---

## Deploy on Vercel

This repository is configured for serverless deployment on Vercel as two separate projects:
- **Backend Project**: Root Directory = repo root (`.`)
- **Frontend Project**: Root Directory = `ai-portfolio-frontend`

### Prerequisites

1. **Qdrant Cloud**:
   - Create a free cluster at [cloud.qdrant.io](https://cloud.qdrant.io).
   - Obtain your cluster URL (`Qdrant_url`) and API key (`Qdrant_api_key`).
2. **MongoDB Atlas**:
   - Create a database cluster at [cloud.mongodb.com](https://cloud.mongodb.com).
   - In **Network Access**, add `0.0.0.0/0` (Allow Access from Anywhere) so Vercel's dynamic serverless IPs can connect.
   - Obtain your connection string (`MONGO_URI`).
3. **Run Ingestion Locally Once Against Cloud**:
   - Set `Qdrant_url` and `Qdrant_api_key` (plus `gemini_api_key`) in your local `.env`.
   - Run the local ingestion script to populate the cloud vector collection:
     ```bash
     uv run python ingest.py
     ```
   - Verify that all semantic chunks are successfully indexed into Qdrant Cloud.

### Deployment Order

1. **Deploy Backend First**:
   - Create a new project in the Vercel dashboard.
   - Set **Root Directory** to `.` (repo root).
   - Add the following Environment Variables in Vercel:
     - `gemini_api_key`
     - `MODEL` (defaults to `gemini-3.5-flash`)
     - `EMBEDDING_MODEL` (e.g. `models/gemini-embedding-001`)
     - `EMBEDDING_DIM` (e.g. `768`)
     - `Qdrant_url`
     - `Qdrant_api_key`
     - `MONGO_URI`
     - `DB_NAME` (e.g. `ai_portfolio`)
     - `FRONTEND_ORIGIN` (temporarily set to `http://localhost:5173` or leave placeholder)
     - `INGEST_ADMIN_KEY`
   - Deploy the project and copy your production backend URL (e.g. `https://your-backend.vercel.app`).

2. **Deploy Frontend**:
   - Create a second project in the Vercel dashboard from the same repo.
   - Set **Root Directory** to `ai-portfolio-frontend`.
   - Framework Preset will be Vite.
   - Add Environment Variable:
     - `VITE_API_URL` = your backend production URL (e.g. `https://your-backend.vercel.app`).
   - Deploy the frontend and copy your production frontend URL (e.g. `https://your-frontend.vercel.app`).

3. **Update Backend CORS**:
   - In your backend Vercel project settings under **Environment Variables**, update `FRONTEND_ORIGIN` with your frontend production URL (e.g. `https://your-frontend.vercel.app`).
   - Trigger a redeployment of the backend for the updated CORS origin to take effect.
