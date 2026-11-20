from collections import Counter
from datetime import datetime, timedelta

REPORTS_TO_CHANGE = 2
REPORT_WINDOW = timedelta(hours=2)
STATUS_EXPIRY = timedelta(hours=24)
CROWDING_WINDOW = timedelta(minutes=30)


def parse_time(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def current_working(status_row: dict | None, now: datetime) -> str:
    if not status_row:
        return "yes"
    if now - parse_time(status_row["confirmed_at"]) >= STATUS_EXPIRY:
        return "yes"
    return status_row["working"]


def pick_crowding(reports: list[dict], now: datetime) -> str:
    recent = [
        r for r in reports
        if r["crowding"] != "unknown"
        and now - parse_time(r["created_at"]) < CROWDING_WINDOW
    ]
    if not recent:
        return "low"

    counts = Counter(r["crowding"] for r in recent)
    top = max(counts.values())
    tied = {level for level, count in counts.items() if count == top}

    latest = max(
        (r for r in recent if r["crowding"] in tied),
        key=lambda r: parse_time(r["created_at"]),
    )
    return latest["crowding"]


def should_change(
    status_row: dict | None, reports: list[dict], new_working: str, now: datetime
) -> bool:
    since = now - REPORT_WINDOW
    if status_row:
        since = max(since, parse_time(status_row["confirmed_at"]))

    reporters = {
        r["email"].strip().lower()
        for r in reports
        if r["working"] == new_working and parse_time(r["created_at"]) >= since
    }
    return len(reporters) >= REPORTS_TO_CHANGE
