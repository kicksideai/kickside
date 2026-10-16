#!/usr/bin/env python3
"""Ratchet native-error syntax in converted repository source modules."""
import argparse
from collections import Counter
import json
from pathlib import Path
import re

LONG = re.compile(r"\[(=*)\[")
NAME = re.compile(r"[A-Za-z_][A-Za-z_0-9]*")
ERROR_NAME = re.compile(r"(?:^|_)(?:err|error|failure|cause|reason|message)(?:$|_)")


def tokens(source):
    result = []
    offset, line = 0, 1
    while offset < len(source):
        start, start_line = offset, line
        comment = source.startswith("--", offset)
        content = offset + 2 if comment else offset
        long = LONG.match(source, content)
        if long:
            closing = "]" + long[1] + "]"
            end = source.find(closing, long.end())
            if end < 0:
                raise ValueError(f"unterminated Lua long string/comment at line {line}")
            offset = end + len(closing)
            if not comment:
                result.append(("string", source[start:offset], start_line))
        elif comment:
            end = source.find("\n", content)
            offset = len(source) if end < 0 else end
        elif source[offset] in "\"'":
            quote = source[offset]
            offset += 1
            while offset < len(source) and source[offset] != quote:
                offset += 2 if source[offset] == "\\" else 1
            if offset >= len(source):
                raise ValueError(f"unterminated Lua string at line {line}")
            offset += 1
            result.append(("string", source[start:offset], start_line))
        elif source[offset].isspace():
            offset += 1
        else:
            name = NAME.match(source, offset)
            operator = source[offset:offset + 2]
            if name:
                offset = name.end()
                result.append(("name", name[0], start_line))
            elif operator in {"==", "~=", "::", ".."}:
                offset += 2
                result.append(("symbol", operator, start_line))
            else:
                offset += 1
                result.append(("symbol", source[start:offset], start_line))
        line += source[start:offset].count("\n")
    return result


def operand_start(items, end):
    if end < 0:
        return 0
    start = end
    if items[start][1] == ")":
        depth = 1
        start -= 1
        while start >= 0 and depth:
            depth += (items[start][1] == ")") - (items[start][1] == "(")
            start -= 1
        start = max(0, start + 1)
        if start and items[start - 1][0] == "name":
            start -= 1
    while start >= 2 and items[start - 1][1] in {".", ":"}:
        start = operand_start(items, start - 2)
    return start


def error_operand(items):
    if not items or items[-1][1] in {"code", "kind", "error_kind", "failure_class"}:
        return False
    if len(items) >= 3 and items[0][1] == "type" and items[1][1] == "(" and items[-1][1] == ")":
        return False
    if len(items) >= 4 and [item[1] for item in items[-4:]] == [":", "kind", "(", ")"]:
        return False
    return any(kind == "name" and ERROR_NAME.search(value) for kind, value, _ in items)


def findings(source):
    items = tokens(source)
    rows = []

    def add(rule, start, end):
        rows.append({"rule": rule, "line": items[start][2],
                     "signature": " ".join(value for _, value, _ in items[start:end])})

    for index, (kind, value, _) in enumerate(items):
        if value == "return" and index + 3 < len(items):
            if items[index + 1][1] == "nil" and items[index + 2][1] == "," and items[index + 3][0] == "string":
                add("literal-error-return", index, index + 4)
        if value in {"find", "match"} and index > 1 and index + 1 < len(items) and items[index + 1][1] == "(":
            if items[index - 1][1] == ":":
                start = operand_start(items, index - 2)
                if error_operand(items[start:index - 1]):
                    add("error-text-decision", start, index + 2)
            elif items[index - 1][1] == "." and items[index - 2][1] == "string":
                end, depth = index + 2, 0
                while end < len(items):
                    current = items[end][1]
                    if current in {",", ")"} and depth == 0:
                        break
                    depth += (current == "(") - (current == ")")
                    end += 1
                if error_operand(items[index + 2:end]):
                    add("error-text-decision", index - 2, end)
        if value in {"==", "~="} and index and index + 1 < len(items):
            if items[index + 1][0] == "string":
                start = operand_start(items, index - 1)
                if error_operand(items[start:index]):
                    add("error-text-decision", start, index + 2)
            elif items[index - 1][0] == "string":
                end = index + 2
                while end + 1 < len(items) and items[end][1] in {".", ":"}:
                    end += 2
                if error_operand(items[index + 1:end]):
                    add("error-text-decision", index - 1, end)
    return rows


def source_path(path):
    return path.suffix == ".lua" and "src" in path.parts and not path.name.endswith("_test.lua") and not any(
        part in {"test", "tests", "eval", ".wippy", "node_modules"} for part in path.parts)


def key(row):
    return row["path"], row["rule"], row["signature"]


def ratchet(actual, allowances):
    expected = Counter()
    for row in allowances:
        if not isinstance(row.get("count"), int) or isinstance(row["count"], bool) or row["count"] <= 0 or not row.get("reason", "").strip():
            raise ValueError("every source allowance requires a positive count and a reason")
        identity = key(row)
        if identity in expected:
            raise ValueError("duplicate native-error source allowance")
        expected[identity] = row["count"]
    observed = Counter(key(row) for row in actual)
    return [f"{path}: {rule}: expected {expected[identity]}, found {observed[identity]}: {signature}"
            for identity in sorted(set(observed) | set(expected))
            if observed[identity] != expected[identity]
            for path, rule, signature in [identity]]


def collect(root, modules):
    rows = []
    if len(set(modules)) != len(modules):
        raise ValueError("duplicate native-error source module")
    for module in modules:
        relative = Path(module) / "src"
        if relative.is_absolute() or ".." in relative.parts or not (root / relative).is_dir():
            raise ValueError(f"invalid converted module source: {module}")
        for path in sorted((root / relative).rglob("*.lua")):
            rel = path.relative_to(root)
            if source_path(rel):
                rows.extend({"path": str(rel), **row} for row in findings(path.read_text()))
    return rows


def check(root, config):
    if config["schema_version"] != 1 or not config["modules"]:
        raise ValueError("native-error source config requires a version and converted modules")
    rows = collect(root, config["modules"])
    modules = set(config["modules"])
    if any(str(Path(row["path"]).parent).split("/src")[0] not in modules for row in config["allowances"]):
        raise ValueError("source allowance falls outside converted modules")
    return ratchet(rows, config["allowances"])


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[2])
    args = parser.parse_args()
    config = json.loads((args.root / "ops/scripts/native-error-source.json").read_text())
    failures = check(args.root, config)
    for failure in failures:
        print(failure)
    if failures:
        raise SystemExit(1)
    print(f"Native-error source ratchet passes for {len(config['modules'])} modules")


if __name__ == "__main__":
    main()
