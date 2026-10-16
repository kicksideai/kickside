#!/usr/bin/env python3
"""Reconstruct transaction and empty-round boundaries from disposable PG logs.

Requires log_min_duration_statement=0 on a cluster owned by this run. No table,
trigger, or production timing hook is added to a measured round.
"""
import csv
import math
import re
import sys
from datetime import datetime, timedelta
from pathlib import Path

stamp = r"(?P<at>\d{4}-\d\d-\d\d \d\d:\d\d:\d\d\.\d+ UTC) \[(?P<pid>\d+)\]"
statement = re.compile(
    stamp + r" LOG:\s+duration: (?P<ms>\d+(?:\.\d+)?) ms\s+"
    r"(?P<kind>statement|parse [^:]+|bind [^:]+|execute [^:]+):\s*(?P<sql>.*)"
)
detail = re.compile(stamp + r" DETAIL:\s+parameters: (?P<params>.*)")
connection_end = re.compile(stamp + r" (?:LOG|FATAL):\s+.*(?:disconnection|unexpected EOF|terminating connection)", re.I)
param = re.compile(r"\$(?P<index>\d+) = '(?P<value>[^']*)'")


def instant(match):
    return datetime.fromisoformat(match["at"].replace(" UTC", "+00:00"))


def phase_instant(value):
    # Wippy/PG timestamps may carry 1–9 fractional digits; datetime parsing
    # here needs exactly six, so pad or truncate without moving the boundary.
    value = re.sub(r"\.(\d+)", lambda match: "." + match[1][:6].ljust(6, "0"), value)
    value = re.sub(r"([+-]\d{2})$", r"\1:00", value)
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def percentile(values, fraction):
    return sorted(values)[math.ceil(len(values) * fraction) - 1] if values else None


def reconstruct(path):
    active = {}
    prepared = {}
    pending_detail = {}
    rows = []
    claims = []
    completions = []
    statement_count = 0
    for line in path.open(errors="replace"):
        matched = statement.search(line)
        if matched:
            pid = matched["pid"]
            end = instant(matched)
            start = end - timedelta(milliseconds=float(matched["ms"]))
            kind = matched["kind"]
            sql = matched["sql"].strip().upper()
            if kind.startswith(("parse ", "bind ")):
                prepared.setdefault(pid, start)
                continue
            statement_count += 1
            pending_detail.pop(pid, None)
            if sql.startswith(("BEGIN", "START TRANSACTION")):
                active[pid] = {"start": start, "count": 1, "claim": None, "complete": None}
                prepared.pop(pid, None)
            elif sql.startswith(("COMMIT", "ROLLBACK")):
                record = active.pop(pid, None)
                if record:
                    rows.append((pid, record["start"], end,
                                 (end - record["start"]).total_seconds() * 1000,
                                 record["count"] + 1, "explicit" if sql.startswith("COMMIT") else "rollback"))
                    if sql.startswith("COMMIT"):
                        if record["claim"]:
                            claims.append((record["claim"], record["start"], end))
                        if record["complete"]:
                            completions.append((record["complete"], record["start"], end))
                else:
                    rows.append((pid, start, end, float(matched["ms"]), 1, "implicit-control"))
                prepared.pop(pid, None)
            elif pid in active:
                active[pid]["count"] += 1
                if kind.startswith("execute ") and sql.startswith("INSERT INTO KICKSIDE_JOB_RUN "):
                    pending_detail[pid] = "claim"
                elif kind.startswith("execute ") and sql.startswith("DELETE FROM KICKSIDE_JOB_RUN"):
                    pending_detail[pid] = "complete"
                prepared.pop(pid, None)
            else:
                first = prepared.pop(pid, start)
                rows.append((pid, first, end, (end - first).total_seconds() * 1000, 1, "implicit"))
            continue
        matched = detail.search(line)
        if matched and matched["pid"] in active:
            pid = matched["pid"]
            role = pending_detail.pop(pid, None)
            if role:
                params = {int(m["index"]): m["value"] for m in param.finditer(matched["params"])}
                job = params.get(4 if role == "claim" else 1)
                if job:
                    active[pid][role] = job
            continue
        matched = connection_end.search(line)
        if matched:
            pid = matched["pid"]
            record = active.pop(pid, None)
            if record:
                end = instant(matched)
                rows.append((pid, record["start"], end,
                             (end - record["start"]).total_seconds() * 1000,
                             record["count"], "aborted-disconnect"))
            prepared.pop(pid, None)
    return rows, statement_count, len(active), claims, completions


def round_samples(claims, completions, jobs, phase_start, release, phase_end):
    # Match full per-job history so an older claim cannot be attached to a
    # later completion. A claim before the release UPDATE has durably finished
    # is invalid for overhead: harness release I/O may overlap it.
    events = [(end, 0, job, start) for job, start, end in claims]
    events.extend((end, 1, job, start) for job, start, end in completions)
    latest_claim = {}
    samples = []
    settled = set()
    for end, kind, job, start in sorted(events):
        if kind == 0:
            latest_claim[job] = start
            continue
        started = latest_claim.pop(job, None)
        if (started is not None and job in jobs and job not in settled
                and phase_start <= started and release <= started
                and end <= phase_end):
            samples.append((job, started, end, (end - started).total_seconds() * 1000))
            settled.add(job)
    return samples


def release_boundary(path, phase_start, phase_end):
    boundary = None
    for line in path.open(errors="replace"):
        matched = statement.search(line)
        if matched and phase_start <= instant(matched) <= phase_end:
            sql = matched["sql"].upper()
            if sql.startswith("UPDATE KICKSIDE_JOB SET SCHEDULED_AT=") and "SOURCE_KIND='EVENT'" in sql:
                boundary = instant(matched)
    return boundary


def write_csv(path, header, rows):
    with path.open("w", newline="") as output:
        writer = csv.writer(output)
        writer.writerow(header)
        writer.writerows(rows)


def main():
    rows, statements, incomplete, claims, completions = reconstruct(Path(sys.argv[1]))
    write_csv(Path(sys.argv[2]),
              ("pid", "started_at_utc", "completed_at_utc", "duration_ms", "statements", "mode"),
              ((pid, start.isoformat(), end.isoformat(), f"{ms:.6f}", count, mode)
               for pid, start, end, ms, count, mode in rows))
    values = [row[3] for row in rows]
    if not values:
        raise SystemExit("No logged transactions; log_min_duration_statement=0 is required")
    print(f"{len(values)} {statements} {incomplete} {percentile(values, .99):.6f} {max(values):.6f}", end="")
    if len(sys.argv) > 3:
        phase_start = phase_instant(sys.argv[3])
        phase_end = phase_instant(sys.argv[4])
        jobs = set(Path(sys.argv[5]).read_text().splitlines())
        release = release_boundary(Path(sys.argv[1]), phase_start, phase_end)
        samples = round_samples(claims, completions, jobs, phase_start, release, phase_end) if release else []
        write_csv(Path(sys.argv[6]),
                  ("job_id", "claim_started_at_utc", "durably_completed_at_utc", "overhead_ms"),
                  ((job, start.isoformat(), end.isoformat(), f"{ms:.6f}") for job, start, end, ms in samples))
        durations = [row[3] for row in samples]
        if durations:
            first = min(row[1] for row in samples)
            last = max(row[2] for row in samples)
            rate = len(samples) / max((last - first).total_seconds(), .001)
            # Sub-millisecond log rounding can place a concurrent claim BEGIN
            # just before the release UPDATE line. Queue latency cannot be
            # negative; treat an overlap as zero waiting time.
            queue_ms = max(0.0, (first - release).total_seconds() * 1000)
            print(f" {len(samples)} {percentile(durations, .95):.6f} {max(durations):.6f} {rate:.6f} {queue_ms:.6f}")
        else:
            print(" 0 NaN NaN NaN NaN")
    else:
        print()


if __name__ == "__main__":
    main()
