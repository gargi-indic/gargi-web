#!/usr/bin/env python3
"""
Thin client for the Jules API (https://jules.googleapis.com), used for
orchestration status checks and (when needed) sending instructions to an
in-progress Jules session.

Assignment still happens via GitHub (`gh issue edit --add-label jules`) per
docs/gargi-labs/ORCHESTRATOR.md. This script is read-mostly: it's for
watching progress in near-real-time between the sparse GitHub issue
comments, and occasionally for nudging a session directly instead of
re-toggling the `jules` label.

Auth: reads JULES_API_KEY from .env.jules.local (gitignored, repo root).
Never commit that file or print the key.

Usage:
  scripts/jules_api.py list
  scripts/jules_api.py status <session-id-or-task-url>
  scripts/jules_api.py activities <session-id-or-task-url> [--all] [--patch]
  scripts/jules_api.py send <session-id-or-task-url> "<message text>"
"""
import json
import os
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

API_BASE = "https://jules.googleapis.com/v1alpha"
REPO_ROOT = Path(__file__).resolve().parent.parent
ENV_FILE = REPO_ROOT / ".env.jules.local"


def load_api_key() -> str:
    if not ENV_FILE.exists():
        sys.exit(f"Missing {ENV_FILE} (expected JULES_API_KEY=... in it)")
    for line in ENV_FILE.read_text().splitlines():
        line = line.strip()
        if line.startswith("JULES_API_KEY="):
            return line.split("=", 1)[1].strip()
    sys.exit(f"JULES_API_KEY not found in {ENV_FILE}")


def session_id_from(arg: str) -> str:
    """Accepts a bare session id, a sessions/NNN name, or a jules.google.com/task/NNN URL."""
    m = re.search(r"(\d{6,})", arg)
    if not m:
        sys.exit(f"Could not extract a session id from: {arg}")
    return m.group(1)


def api_request(method: str, path: str, api_key: str, body: dict | None = None) -> dict:
    url = f"{API_BASE}/{path}"
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("X-Goog-Api-Key", api_key)
    if data is not None:
        req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req) as resp:
            return json.load(resp)
    except urllib.error.HTTPError as e:
        sys.exit(f"HTTP {e.code} on {method} {path}: {e.read().decode(errors='replace')}")


def list_sessions(api_key: str) -> None:
    data = api_request("GET", "sessions?pageSize=20", api_key)
    for s in data.get("sessions", []):
        print(f"{s['name']:<28} {s.get('state', '?'):<14} {s.get('title', '')[:70]}")


def get_status(api_key: str, sid: str) -> None:
    data = api_request("GET", f"sessions/{sid}", api_key)
    print(f"name:       {data.get('name')}")
    print(f"title:      {data.get('title')}")
    print(f"state:      {data.get('state')}")
    print(f"createTime: {data.get('createTime')}")
    print(f"updateTime: {data.get('updateTime')}")


def iter_activities(api_key: str, sid: str, all_pages: bool):
    page_token = None
    while True:
        path = f"sessions/{sid}/activities?pageSize=30"
        if page_token:
            path += f"&pageToken={page_token}"
        data = api_request("GET", path, api_key)
        for a in data.get("activities", []):
            yield a
        page_token = data.get("nextPageToken")
        if not page_token or not all_pages:
            break


def show_activities(api_key: str, sid: str, all_pages: bool, show_patch: bool) -> None:
    acts = list(iter_activities(api_key, sid, all_pages))
    for a in acts:
        kind = next((k for k in a if k not in ("name", "createTime", "originator", "id", "artifacts")), "?")
        detail = a.get(kind, {})
        title = detail.get("title") or detail.get("description") or ""
        print(f"[{a.get('createTime')}] {a.get('originator', '?'):<6} {kind:<18} {title[:100]}")
    if show_patch and acts:
        last_artifacts = acts[-1].get("artifacts") or []
        for art in last_artifacts:
            patch = art.get("changeSet", {}).get("gitPatch", {}).get("unidiffPatch")
            if patch:
                print("\n--- latest cumulative patch (may be partial/WIP) ---")
                print(patch)


def send_message(api_key: str, sid: str, message: str) -> None:
    api_request("POST", f"sessions/{sid}:sendMessage", api_key, {"prompt": message})
    print(f"Sent to sessions/{sid}: {message}")


def main() -> None:
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    api_key = load_api_key()
    cmd = sys.argv[1]

    if cmd == "list":
        list_sessions(api_key)
    elif cmd == "status":
        get_status(api_key, session_id_from(sys.argv[2]))
    elif cmd == "activities":
        sid = session_id_from(sys.argv[2])
        all_pages = "--all" in sys.argv
        show_patch = "--patch" in sys.argv
        show_activities(api_key, sid, all_pages, show_patch)
    elif cmd == "send":
        sid = session_id_from(sys.argv[2])
        send_message(api_key, sid, sys.argv[3])
    else:
        sys.exit(__doc__)


if __name__ == "__main__":
    main()
