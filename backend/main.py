import os
from collections import defaultdict
from datetime import datetime, timezone
from typing import Literal

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from supabase import create_client

from logic import (
    CROWDING_WINDOW,
    REPORT_WINDOW,
    current_working,
    pick_crowding,
    should_change,
)

load_dotenv()

supabase = create_client(
    os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_ROLE_KEY"]
)

app = FastAPI(title="Campus Facilities Manager API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("FRONTEND_ORIGIN", "http://localhost:5173").split(","),
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


class ReportIn(BaseModel):
    key: str = Field(min_length=1, max_length=100)
    email: EmailStr
    working: Literal["yes", "no", "unknown"] = "unknown"
    crowding: Literal["low", "moderate", "heavy", "unknown"] = "unknown"
    details: str = Field("", max_length=500)


def get_status_row(key: str) -> dict | None:
    rows = (
        supabase.table("equipment_status")
        .select("*")
        .eq("equipment_key", key)
        .execute()
        .data
    )
    return rows[0] if rows else None


@app.get("/api/status")
def get_statuses():
    now = datetime.now(timezone.utc)

    statuses = {
        row["equipment_key"]: row
        for row in supabase.table("equipment_status").select("*").execute().data
    }

    recent = (
        supabase.table("reports")
        .select("equipment_key, crowding, created_at")
        .neq("crowding", "unknown")
        .gte("created_at", (now - CROWDING_WINDOW).isoformat())
        .execute()
        .data
    )
    crowding_reports = defaultdict(list)
    for r in recent:
        crowding_reports[r["equipment_key"]].append(r)

    return {
        key: {
            "working": current_working(statuses.get(key), now),
            "crowding": pick_crowding(crowding_reports[key], now),
        }
        for key in set(statuses) | set(crowding_reports)
    }


@app.post("/api/reports")
def create_report(report: ReportIn):
    now = datetime.now(timezone.utc)

    supabase.table("reports").insert({
        "equipment_key": report.key,
        "email": report.email.strip().lower(),
        "working": report.working,
        "crowding": report.crowding,
        "details": report.details.strip(),
        "created_at": now.isoformat(),
    }).execute()

    if report.working == "unknown":
        return {"result": "none"}

    status_row = get_status_row(report.key)
    if current_working(status_row, now) == report.working:
        return {"result": "none"}

    matching = (
        supabase.table("reports")
        .select("email, working, created_at")
        .eq("equipment_key", report.key)
        .eq("working", report.working)
        .gte("created_at", (now - REPORT_WINDOW).isoformat())
        .execute()
        .data
    )

    if not should_change(status_row, matching, report.working, now):
        return {"result": "pending"}

    supabase.table("equipment_status").upsert({
        "equipment_key": report.key,
        "working": report.working,
        "confirmed_at": now.isoformat(),
    }).execute()

    return {"result": "changed"}
