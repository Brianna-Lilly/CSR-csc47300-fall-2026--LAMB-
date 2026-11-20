# Backend (FastAPI + Supabase)

## 1. Database
In Supabase, open **SQL Editor**, paste `supabase/schema.sql`, and run it.

## 2. Run the API
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # then fill in your Supabase URL and service role key
uvicorn main:app --reload
```
The API runs on http://localhost:8000 (docs at http://localhost:8000/docs).

The service role key is under **Project Settings → API**. Keep it in `backend/.env` only. Never put it in the frontend or commit it.

## 3. Frontend
Create `.env` in the project root:
```
VITE_API_URL=http://localhost:8000
```
Then `npm run dev` like normal.

## Endpoints
- `GET /api/status`: working + crowding for every piece of equipment that has data. Anything missing defaults to working / low traffic.
- `POST /api/reports`: `{ key, email, working, crowding, details }`. Returns `{ result: "changed" | "pending" | "none" }`.

## Rules
- Status flips only after 2 different emails report the same thing within 2 hours (since the last change).
- A status older than 24h resets to working.
- Crowding is a majority vote of the last 30 min, and ties go to the newest report. With no recent reports it's low traffic.
