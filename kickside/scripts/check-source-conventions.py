#!/usr/bin/env python3
"""Source conventions the repository gate enforces.

- Harness replacements point at module package directories, never `/src`.
- Harness `app:db` maps use a caller-supplied `${sqlite_path}` file, and the
  harness config declares both the override and a `sqlite_path` default.
- Converted modules return native errors and classify them by kind/code.
- `json.decode` never receives a call expression as its final argument: a
  final call expands all Lua returns, so `json.decode(req:body())` passes the
  read error as the decode type.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Iterator

import yaml

SCAN_ROOTS = ("core", "platform", "app")
SKIP_PARTS = {"node_modules", ".wippy"}
DECODE_ROOTS = ("core", "platform", "app/src")
DECODE_ALLOWED_CALLEES = {"tostring", "type", "string.sub"}

SRC_REPLACEMENT = re.compile(r"kickside/[a-zA-Z0-9_-]+: .*/src/?$")
MEMORY_FILE = re.compile(r"""^\s+file: ["']?:memory:["']?\s*$""")
NAME_ITEM = re.compile(r"^(\s*)- name: (\S+)\s*$")
CALL_EXPR = re.compile(r"^([A-Za-z_][A-Za-z0-9_.:]*)\s*\(")


def walk(root: Path, bases: tuple[str, ...], name: str | None = None, suffix: str | None = None) -> Iterator[Path]:
    for base in bases:
        top = root / base
        if not top.is_dir():
            continue
        for path in sorted(top.rglob(name or "*")):
            if not path.is_file() or SKIP_PARTS.intersection(path.parts):
                continue
            if suffix is not None and path.suffix != suffix:
                continue
            yield path


def src_replacements(root: Path) -> list[str]:
    found = []
    for path in walk(root, SCAN_ROOTS, name=".wippy.yaml"):
        for lineno, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
            if SRC_REPLACEMENT.search(line):
                found.append(f"{path.relative_to(root)}:{lineno}: {line.strip()}")
    return found


def memory_db_maps(root: Path) -> list[str]:
    found = []
    for path in walk(root, SCAN_ROOTS, name="_index.yaml"):
        indent: str | None = None
        for lineno, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
            item = NAME_ITEM.match(line)
            if item:
                indent = item.group(1) if item.group(2) == "db" else None
                continue
            if indent is not None and MEMORY_FILE.match(line):
                found.append(f"{path.relative_to(root)}:{lineno}: {line.strip()}")
    return found


def sqlite_path_wiring(root: Path) -> list[str]:
    found = []
    for index in walk(root, SCAN_ROOTS, name="_index.yaml"):
        document = yaml.safe_load(index.read_text(encoding="utf-8")) or {}
        if not any(entry.get('kind') == 'db.sql.sqlite' and entry.get('file') == '${sqlite_path}'
                   for entry in document.get('entries', []) if isinstance(entry, dict)):
            continue
        cfg = next((c for c in (index.parent / ".wippy.yaml", index.parent.parent / ".wippy.yaml") if c.is_file()), None)
        rel = index.relative_to(root)
        if cfg is None:
            found.append(f"no .wippy.yaml for harness index: {rel}")
            continue
        config = yaml.safe_load(cfg.read_text(encoding="utf-8")) or {}
        if config.get('override', {}).get('app:db:file') != '${sqlite_path}':
            found.append(f"missing app:db:file sqlite_path override: {cfg.relative_to(root)} (for {rel})")
        if 'sqlite_path' not in config.get('vars', {}):
            found.append(f"missing vars.sqlite_path default: {cfg.relative_to(root)} (for {rel})")
    return found


def call_arguments(source: str, open_paren: int) -> tuple[list[str], int] | None:
    """Split the top-level arguments of the call whose `(` is at open_paren."""
    depth = 0
    quote: str | None = None
    args: list[str] = []
    start = open_paren + 1
    i = open_paren
    while i < len(source):
        ch = source[i]
        if quote:
            if ch == "\\":
                i += 2
                continue
            if ch == quote:
                quote = None
        elif ch in "\"'":
            quote = ch
        elif ch == "(" or ch == "{" or ch == "[":
            depth += 1
        elif ch == ")" or ch == "}" or ch == "]":
            depth -= 1
            if depth == 0:
                args.append(source[start:i].strip())
                return args, i
        elif ch == "," and depth == 1:
            args.append(source[start:i].strip())
            start = i + 1
        i += 1
    return None


def is_multi_return_call(arg: str) -> bool:
    """True when the argument is a bare call expression spanning the whole argument."""
    match = CALL_EXPR.match(arg)
    if not match or match.group(1) in DECODE_ALLOWED_CALLEES:
        return False
    parsed = call_arguments(arg, match.end() - 1)
    return parsed is not None and parsed[1] == len(arg) - 1


def decode_call_expansion(source: str) -> list[int]:
    offsets = []
    for match in re.finditer(r"json\.decode\s*\(", source):
        parsed = call_arguments(source, match.end() - 1)
        if parsed and parsed[0] and is_multi_return_call(parsed[0][-1]):
            offsets.append(match.start())
    return offsets


def json_decode_expansion(root: Path) -> list[str]:
    found = []
    for path in walk(root, DECODE_ROOTS, suffix=".lua"):
        source = path.read_text(encoding="utf-8")
        for offset in decode_call_expansion(source):
            lineno = source.count("\n", 0, offset) + 1
            found.append(f"{path.relative_to(root)}:{lineno}: {source.splitlines()[lineno - 1].strip()}")
    return found


LUA_LEXEMES = re.compile(
    r'(?P<comment>--\[(?P<comment_equals>=*)\[.*?\](?P=comment_equals)\]|--[^\n]*)'
    r'|(?P<long_string>\[(?P<string_equals>=*)\[.*?\](?P=string_equals)\])'
    r'|(?P<string>"(?:\\.|[^"\\])*"|\'(?:\\.|[^\'\\])*\')', re.S)
ERROR_NAME = r'(?:err(?:or)?|failure|[A-Za-z_]\w*_(?:err|error|failure)|(?:err|error)_\w+)'


def stage_error_result(code: str, offset: int, helpers: set[str]) -> bool:
    third = code[offset:].lstrip()
    if not third.startswith(','):
        return False
    third = third[1:].lstrip()
    variable = re.match(r'(?:err(?:or)?|[A-Za-z_]\w*_(?:err|error))\b', third)
    if variable:
        return bool(re.match(r'\s*(?:$|\n|;|end\b|elseif\b|else\b)', third[variable.end():]))
    call = CALL_EXPR.match(third)
    if not call or call.group(1) not in helpers | {'errors.new', 'errors.wrap'}:
        return False
    parsed = call_arguments(third, call.end() - 1)
    return parsed is not None and bool(re.match(r'\s*(?:$|\n|;|end\b|elseif\b|else\b)', third[parsed[1] + 1:]))


def without_case_conversion(code: str) -> str:
    """Expose case-converted expressions while preserving diagnostic offsets."""
    normalized = list(code)
    for match in re.finditer(r'\bstring\.(?:lower|upper)\s*\(', code):
        parsed = call_arguments(code, match.end() - 1)
        if parsed is None or len(parsed[0]) != 1:
            continue
        for index in [*range(match.start(), match.end()), parsed[1]]:
            if normalized[index] != '\n':
                normalized[index] = ' '
    return ''.join(normalized)


def native_error_violations(source: str) -> list[tuple[int, str]]:
    """Check literal failures and text classification, excluding error-carrying stage tuples."""
    def mask(match: re.Match) -> str:
        value = match.group()
        if match['comment'] is not None:
            return ''.join('\n' if ch == '\n' else ' ' for ch in value)
        inner = ''.join('\n' if ch == '\n' else ' ' for ch in value[1:-1])
        return '"' + inner + '"'

    code = without_case_conversion(LUA_LEXEMES.sub(mask, source))
    helpers = set(re.findall(r'\bfunction\s+([A-Za-z_]\w*(?:[.:][A-Za-z_]\w*)*)\s*\([^)]*\)\s*:\s*error\b', code))
    found = [(match.start(), 'literal error return') for match in
             re.finditer(r'\breturn\s+(?:nil|false)\s*,\s*(?:(?:nil|false)\s*,\s*)*"\s*"', code)
             if not stage_error_result(code, match.end(), helpers)]
    case_conversion = r'(?:\s*:\s*(?:lower|upper)\s*\(\s*\))*'
    render = rf'(?:tostring\s*\(\s*{ERROR_NAME}\b(?:\s+or\s+[A-Za-z_]\w*)?\s*\)|{ERROR_NAME}\s*:\s*message\s*\(\s*\)){case_conversion}'
    aliases: set[str] = set()
    while True:
        expression = render + (r'|\b(?:' + '|'.join(sorted(aliases)) + r')\b' if aliases else '')
        updated = aliases | {match[1] for match in re.finditer(
            rf'\b(?:local\s+)?([A-Za-z_]\w*)\s*=\s*(?:{expression})(?![\w.:])', code)}
        if updated == aliases:
            break
        aliases = updated
    expression = rf'(?:{expression}){case_conversion}'
    operand = rf'(?:{expression}|\b{ERROR_NAME}\b){case_conversion}'
    machine_or_literal = r'(?:"(?:\s*)"|\b[A-Za-z_]\w*\.ERROR(?:\.[A-Za-z_]\w*)+)'
    patterns = (
        rf'{operand}\s*:\s*(?:find|match)\s*\(',
        rf'\bstring\.(?:find|match)\s*\(\s*{operand}\s*,',
        rf'\b[A-Za-z_]\w*\s*\[\s*{expression}\s*\]',
        rf'{operand}\s*(?:==|~=)\s*{machine_or_literal}',
        rf'{machine_or_literal}\s*(?:==|~=)\s*{operand}',
    )
    offsets = {match.start() for pattern in patterns for match in re.finditer(pattern, code)}
    found.extend((offset, 'error text matching') for offset in sorted(offsets))
    return sorted(found)


def native_errors(root: Path) -> list[str]:
    ratchet = root / 'scripts/native-error-modules.json'
    modules = json.loads(ratchet.read_text(encoding='utf-8'))
    if not isinstance(modules, list) or not modules or len(set(modules)) != len(modules):
        raise ValueError('native-error-modules.json requires unique converted module paths')
    found = []
    for module in modules:
        if not isinstance(module, str) or Path(module).is_absolute() or '..' in Path(module).parts:
            raise ValueError('native-error module path must be relative to the repository')
        top = root / module / 'src'
        if not top.is_dir():
            found.append(f'{module}/src: converted module source is missing')
            continue
        for path in walk(root, (module + '/src',), suffix='.lua'):
            source = path.read_text(encoding='utf-8')
            for offset, reason in native_error_violations(source):
                lineno = source.count('\n', 0, offset) + 1
                found.append(f'{path.relative_to(root)}:{lineno}: {reason}')
    return found


CHECKS = (
    ("Converted modules require native error returns and kind/code classification", native_errors),
    ("Package-dir replacements required (found /src targets)", src_replacements),
    ("App database maps must use sqlite_path", memory_db_maps),
    ("Harness sqlite_path wiring incomplete", sqlite_path_wiring),
    ("Capture raw content and its error before calling json.decode", json_decode_expansion),
)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", default=Path(__file__).resolve().parent.parent, type=Path)
    root = parser.parse_args().root.resolve()
    failed = False
    for title, check in CHECKS:
        found = check(root)
        if found:
            failed = True
            print(f"{title}:", file=sys.stderr)
            for item in found:
                print(f"  {item}", file=sys.stderr)
    if failed:
        return 1
    print("Source conventions hold: package-dir replacements, sqlite_path harness databases, single-value json.decode input, native errors in converted modules.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
