#!/usr/bin/env python3
"""Detect host contention, excluding this gate's process ancestry and children."""
import os
import sys
from pathlib import Path


def processes():
    found = {}
    for entry in Path('/proc').iterdir():
        if not entry.name.isdigit():
            continue
        try:
            fields = (entry / 'stat').read_text()
            closing = fields.rfind(')')
            pid = int(entry.name)
            ppid = int(fields[closing + 2:].split()[1])
            comm = (entry / 'comm').read_text().strip()
            command = (entry / 'cmdline').read_bytes().replace(b'\0', b' ').decode(errors='replace')
            found[pid] = (ppid, comm, command)
        except (OSError, ValueError, IndexError):
            continue
    return found


def own_processes(table, root):
    ancestors = {root}
    parent = table.get(root, (0, '', ''))[0]
    while parent > 1 and parent not in ancestors:
        ancestors.add(parent)
        parent = table.get(parent, (0, '', ''))[0]
    descendants = {root}
    changed = True
    while changed:
        changed = False
        for pid, (ppid, _, _) in table.items():
            if ppid in descendants and pid not in descendants:
                descendants.add(pid)
                changed = True
    return ancestors | descendants


def main():
    root = int(sys.argv[1])
    table = processes()
    own = own_processes(table, root)
    others = [(pid, comm) for pid, (_, comm, command) in table.items()
              if pid not in own and (comm == 'wippy' or (comm == 'codex' and ' exec ' in f' {command} '))]
    load = os.getloadavg()[0]
    cores = os.cpu_count() or 1
    print(f'UTC sample: load_1m={load:.2f}, logical_cpus={cores}, other_wippy_codex={len(others)}')
    for pid, comm in sorted(others):
        print(f'  {pid} {comm}')
    if others or load > cores * .7:
        print('UNISOLATED')
        return 1
    print('ISOLATED')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
