"""Bound shutdown of a run-owned process and its descendants by PID identity."""
import os
from pathlib import Path
import signal
import time

from harness import require


def _stat(pid):
    try:
        return Path(f'/proc/{pid}/stat').read_text().rsplit(')', 1)[1].split()
    except FileNotFoundError:
        return None


def owned_process(pid):
    state = _stat(pid)
    require(state is not None, 'Process exits before ownership is recorded')
    return {'pid': pid, 'identity': state[19]}


def _live(record):
    state = _stat(record['pid'])
    if state is None:
        return False
    require(state[19] == record['identity'], 'Process ownership no longer matches the PID')
    return state[0] != 'Z'


def _signal(record, value):
    if not _live(record):
        return
    try:
        os.kill(record['pid'], value)
    except ProcessLookupError:
        require(not _live(record), 'Owned process disappears before signalling')


def _tree(record, freeze=False):
    if not _live(record):
        return []
    if freeze:
        _signal(record, signal.SIGSTOP)
    pid = record['pid']
    result = [record]
    try:
        children = set()
        for task in Path(f'/proc/{pid}/task').iterdir():
            try:
                children.update((task / 'children').read_text().split())
            except FileNotFoundError:
                require(not task.exists(), 'Owned process task children are unavailable')
        for child in sorted(children, key=int):
            state = _stat(int(child))
            if state is not None and state[0] != 'Z':
                require(int(state[1]) == pid, 'Descendant ownership changes during shutdown')
                result.extend(_tree({'pid': int(child), 'identity': state[19]}, freeze))
    except BaseException:
        if freeze:
            for child in reversed(result):
                _signal(child, signal.SIGCONT)
        raise
    return result


def stop_owned_tree(record, *, grace_seconds=30):
    records = _tree(record)
    if not records:
        return {'status': 'exited', 'processes': []}
    for child in reversed(records):
        _signal(child, signal.SIGTERM)
    deadline = time.monotonic() + grace_seconds
    while any(_live(child) for child in records) and time.monotonic() < deadline:
        time.sleep(0.01)
    status = 'graceful'
    if any(_live(child) for child in records):
        status = 'forced'
        captured = {(child['pid'], child['identity']): child for child in records}
        try:
            for child in records:
                for descendant in _tree(child, freeze=True):
                    captured[(descendant['pid'], descendant['identity'])] = descendant
            records = list(captured.values())
            for child in reversed(records):
                _signal(child, signal.SIGKILL)
        finally:
            for child in reversed(list(captured.values())):
                _signal(child, signal.SIGCONT)
        deadline = time.monotonic() + 5
        while any(_live(child) for child in records) and time.monotonic() < deadline:
            time.sleep(0.01)
    result = [{'pid': child['pid'], 'identity': child['identity'], 'stopped': not _live(child)}
              for child in records]
    require(all(child['stopped'] for child in result), 'Owned process tree fails to stop')
    return {'status': status, 'processes': result}
