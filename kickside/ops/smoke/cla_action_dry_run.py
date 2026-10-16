#!/usr/bin/env python3
"""Offline transport harness for contributor-assistant/github-action at its workflow SHA."""
from __future__ import annotations

import argparse
import base64
import json
import os
import shutil
import urllib.request
import subprocess
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any
from urllib.parse import unquote, urlparse

ROOT = Path(__file__).resolve().parent
PIN = "ca4a40a7d1004f18d9960b404b97e5f30a505a08"
ACTION_URL = f"https://raw.githubusercontent.com/contributor-assistant/github-action/{PIN}/dist/index.js"
SIGNING_TEXT = "I have read and agree to the KickSide Individual Contributor License Agreement, Version 1.0."
CONTRIBUTOR = {"login": "fixture-contributor", "id": 424242}
RUN: Path
ACTION: Path
STORE_TEMPLATE: Path
SIGNATURE_PATH = "/repos/fixture-org/private-signatures/contents/signatures/kickside-cla-v1.json"
CALLER_PREFIX = "/repos/fixture-org/caller"


class GitHubFixture:
    def __init__(self) -> None:
        self.signature: dict[str, Any] | None = None
        self.comments: list[dict[str, Any]] = []
        self.requests: list[dict[str, Any]] = []
        self.next_comment_id = 100

    def handler(self):
        fixture = self

        class Handler(BaseHTTPRequestHandler):
            def log_message(self, _format: str, *_args: Any) -> None:
                return

            def read_json(self) -> dict[str, Any]:
                length = int(self.headers.get("content-length", "0"))
                raw = self.rfile.read(length)
                return json.loads(raw or b"{}")

            def write_json(self, status: int, payload: Any) -> None:
                body = json.dumps(payload).encode()
                self.send_response(status)
                self.send_header("content-type", "application/json")
                self.send_header("content-length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)

            def record(self, payload: Any = None) -> tuple[str, str]:
                parsed = urlparse(self.path)
                fixture.requests.append({"method": self.command, "path": parsed.path, "body": payload})
                return unquote(parsed.path), parsed.query

            def do_POST(self) -> None:
                payload = self.read_json()
                path, _ = self.record(payload)
                if path == "/graphql":
                    self.write_json(200, {
                        "data": {"repository": {"pullRequest": {"commits": {
                            "totalCount": 1,
                            "edges": [{"node": {"commit": {"author": {"email": "fixture@example.invalid", "name": "Fixture", "user": {"id": "MDQ6VXNlcjQyNDI0Mg==", "databaseId": 424242, "login": "fixture-contributor"}}, "committer": {"name": "Fixture", "user": {"id": "MDQ6VXNlcjQyNDI0Mg==", "databaseId": 424242, "login": "fixture-contributor"}}}}}],
                            "pageInfo": {"endCursor": "", "hasNextPage": False}
                        }}}}
                    })
                    return
                if path == f"{CALLER_PREFIX}/issues/17/comments":
                    item = {"id": fixture.next_comment_id, "body": payload["body"], "user": {"login": "github-actions[bot]", "id": 41898282}, "created_at": "2026-10-14T00:00:00Z"}
                    fixture.next_comment_id += 1
                    fixture.comments.append(item)
                    self.write_json(201, item)
                    return
                self.write_json(404, {"message": "unhandled POST"})

            def do_GET(self) -> None:
                path, _ = self.record()
                if path == SIGNATURE_PATH:
                    if fixture.signature is None:
                        self.write_json(404, {"message": "Not Found"})
                    else:
                        content = base64.b64encode(json.dumps(fixture.signature, indent=2).encode()).decode()
                        self.write_json(200, {"sha": "fixture-sha", "content": content})
                    return
                if path == f"{CALLER_PREFIX}/issues/17/comments":
                    self.write_json(200, fixture.comments)
                    return
                if path == f"{CALLER_PREFIX}/pulls/17":
                    self.write_json(200, {"head": {"ref": "fixture-branch"}})
                    return
                if path == f"{CALLER_PREFIX}/actions/workflows":
                    self.write_json(200, {"total_count": 1, "workflows": [{"id": 1, "name": "CLA"}]})
                    return
                if path == f"{CALLER_PREFIX}/actions/workflows/1/runs":
                    self.write_json(200, {"total_count": 0, "workflow_runs": []})
                    return
                self.write_json(404, {"message": "unhandled GET"})

            def do_PUT(self) -> None:
                payload = self.read_json()
                path, _ = self.record(payload)
                if path == SIGNATURE_PATH:
                    fixture.signature = json.loads(base64.b64decode(payload["content"]))
                    self.write_json(200, {"content": {"sha": "fixture-sha"}})
                    return
                self.write_json(404, {"message": "unhandled PUT"})

            def do_PATCH(self) -> None:
                payload = self.read_json()
                path, _ = self.record(payload)
                if path.startswith(f"{CALLER_PREFIX}/issues/comments/"):
                    comment_id = int(path.rsplit("/", 1)[1])
                    for comment in fixture.comments:
                        if comment["id"] == comment_id:
                            comment["body"] = payload["body"]
                            self.write_json(200, comment)
                            return
                self.write_json(404, {"message": "unhandled PATCH"})

        return Handler


def event(action: str) -> dict[str, Any]:
    return {"action": action, "issue": {"number": 17, "pull_request": {"url": "https://fixture.invalid/pr/17"}}, "repository": {"id": 7001, "owner": {"login": "fixture-org"}, "name": "caller"}}


def run_action(server: ThreadingHTTPServer, label: str, event_payload: dict[str, Any]) -> subprocess.CompletedProcess[str]:
    event_file = RUN / f"{label}-event.json"
    event_file.write_text(json.dumps(event_payload))
    environment = os.environ.copy()
    environment.update({
        "GITHUB_API_URL": f"http://127.0.0.1:{server.server_port}",
        "GITHUB_EVENT_PATH": str(event_file),
        "GITHUB_EVENT_NAME": "issue_comment" if label == "signed" else "pull_request",
        "GITHUB_REPOSITORY": "fixture-org/caller",
        "GITHUB_WORKFLOW": "CLA",
        "GITHUB_ACTOR": "fixture-contributor",
        "GITHUB_TOKEN": "fixture-caller-token",
        "PERSONAL_ACCESS_TOKEN": "fixture-private-store-token",
        "INPUT_PATH-TO-SIGNATURES": "signatures/kickside-cla-v1.json",
        "INPUT_BRANCH": "main",
        "INPUT_ALLOWLIST": "*[bot]",
        "INPUT_REMOTE-ORGANIZATION-NAME": "fixture-org",
        "INPUT_REMOTE-REPOSITORY-NAME": "private-signatures",
        "INPUT_PATH-TO-DOCUMENT": "https://fixture.invalid/CLA.md",
        "INPUT_CUSTOM-PR-SIGN-COMMENT": SIGNING_TEXT,
        "INPUT_CUSTOM-NOTSIGNED-PRCOMMENT": "Read the agreement and comment the exact statement.",
        "INPUT_USE-DCO-FLAG": "false",
        "INPUT_LOCK-PULLREQUEST-AFTERMERGE": "true",
        "INPUT_SUGGEST-RECHECK": "true",
        "NO_PROXY": "127.0.0.1,localhost",
        "no_proxy": "127.0.0.1,localhost",
        "HTTP_PROXY": "",
        "HTTPS_PROXY": "",
        "http_proxy": "",
        "https_proxy": "",
    })
    result = subprocess.run(["node", str(ACTION)], cwd=ROOT, env=environment, text=True, capture_output=True, check=False)
    (RUN / f"{label}.stdout.log").write_text(result.stdout)
    (RUN / f"{label}.stderr.log").write_text(result.stderr)
    return result


def main() -> None:
    global ACTION, RUN, STORE_TEMPLATE
    parser = argparse.ArgumentParser()
    parser.add_argument('--store', type=Path)
    parser.add_argument('--run-root', type=Path, default=ROOT / '.cla-action-dry-run')
    args = parser.parse_args()
    RUN = args.run_root.resolve() / str(os.getpid())
    if RUN.exists():
        shutil.rmtree(RUN)
    RUN.mkdir(parents=True)
    STORE_TEMPLATE = args.store.resolve() if args.store else RUN / 'signature-store.json'
    if not args.store:
        STORE_TEMPLATE.write_text('{\n   "signedContributors": []\n}\n')
    if not STORE_TEMPLATE.is_file():
        raise SystemExit(f"missing signature store: {STORE_TEMPLATE}")
    original_store = STORE_TEMPLATE.read_text()
    ACTION = RUN / 'index.js'
    with urllib.request.urlopen(ACTION_URL, timeout=30) as response:
        ACTION.write_bytes(response.read())
    fixture = GitHubFixture()
    server = ThreadingHTTPServer(("127.0.0.1", 0), fixture.handler())
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        missing = run_action(server, "missing-store", event("opened"))
        if missing.returncode == 0:
            raise AssertionError("missing signature store unexpectedly passes")
        if fixture.signature is not None:
            raise AssertionError("missing-store run unexpectedly creates a signature store")

        if not STORE_TEMPLATE.is_file():
            raise AssertionError(f"missing standard signature store template: {STORE_TEMPLATE}")
        fixture.signature = json.loads(STORE_TEMPLATE.read_text())
        if fixture.signature != {"signedContributors": []}:
            raise AssertionError(f"unexpected standard signature store schema: {fixture.signature}")
        unsigned = run_action(server, "unsigned", event("opened"))
        if unsigned.returncode == 0:
            raise AssertionError("unsigned contributor unexpectedly passes")
        if fixture.signature != {"signedContributors": []}:
            raise AssertionError("unsigned contributor changes signatures")
        if not any("CLA Assistant Lite bot" in item["body"] for item in fixture.comments):
            raise AssertionError("unsigned contributor does not receive CLA prompt")

        fixture.comments.append({"id": fixture.next_comment_id, "body": SIGNING_TEXT, "user": CONTRIBUTOR, "created_at": "2026-10-14T00:01:00Z"})
        fixture.next_comment_id += 1
        signed = run_action(server, "signed", event("created"))
        if signed.returncode != 0:
            raise AssertionError(f"exact signing comment fails: {signed.stdout}\n{signed.stderr}")
        if fixture.signature != {"signedContributors": [{"name": "fixture-contributor", "id": 424242, "comment_id": 101, "created_at": "2026-10-14T00:01:00Z", "repoId": 7001, "pullRequestNo": 17}]}:
            raise AssertionError(f"unexpected persisted identity: {fixture.signature}")

        subsequent = run_action(server, "subsequent", event("synchronize"))
        if subsequent.returncode != 0:
            raise AssertionError(f"stored signature does not pass: {subsequent.stdout}\n{subsequent.stderr}")
        (RUN / "persisted-signature-store.json").write_text(json.dumps(fixture.signature, indent=2) + "\n")
        (RUN / "requests.json").write_text(json.dumps(fixture.requests, indent=2) + "\n")
        result = {
            "source": "contributor-assistant/github-action@ca4a40a7d1004f18d9960b404b97e5f30a505a08",
            "missing_store_exit": missing.returncode,
            "unsigned_exit": unsigned.returncode,
            "signed_exit": signed.returncode,
            "subsequent_exit": subsequent.returncode,
            "persisted_contributor_id": 424242,
            "missing_store_created_signature": False,
        }
        if STORE_TEMPLATE.read_text() != original_store:
            raise AssertionError('offline fixture run changes the signature-store fixture')
        print(json.dumps(result, sort_keys=True))
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=5)
        if RUN.exists():
            shutil.rmtree(RUN)


if __name__ == "__main__":
    main()
