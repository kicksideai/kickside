# SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

import argparse
import gzip
import hashlib
import io
import json
import pathlib
import re
import tarfile


MAX_BUNDLE_BYTES = 256 << 20
MAX_EXPANDED_BYTES = 1 << 30
SOURCE = "https://github.com/kicksideai/kickside"


def read_file(path, limit=MAX_BUNDLE_BYTES):
    if path.is_symlink() or not path.is_file():
        raise ValueError("input must be a regular file")
    if path.stat().st_size <= 0 or path.stat().st_size > limit:
        raise ValueError("input size is invalid")
    with path.open("rb") as source:
        data = source.read(limit + 1)
    if len(data) > limit:
        raise ValueError("input exceeds the size limit")
    return data


def digest(data):
    return "sha256:" + hashlib.sha256(data).hexdigest()


def build_bundle(source, snapshot, tag, commit, runtime_version, runtime_digest, architecture, dependencies, launcher):
    version = read_file(source / "app/version.txt", 128).decode().strip()
    if not re.fullmatch(r"[0-9]+\.[0-9]+\.[0-9]+", version) or tag != "kickside-v" + version:
        raise ValueError("the source must match the application release tag")
    if not re.fullmatch(r"[0-9a-f]{40}", commit):
        raise ValueError("the source commit is invalid")
    if not re.fullmatch(r"[0-9]+\.[0-9]+\.[0-9]+[a-z]?", runtime_version):
        raise ValueError("the runtime version is invalid")
    if not re.fullmatch(r"sha256:[0-9a-f]{64}", runtime_digest):
        raise ValueError("the runtime digest is invalid")
    if architecture not in ("amd64", "arm64"):
        raise ValueError("the deployment architecture is invalid")
    lock = read_file(source / "app/wippy.lock", 4 << 20)
    config = read_file(source / "app/.wippy.yaml", 4 << 20)
    pack = read_file(snapshot, MAX_BUNDLE_BYTES - (1 << 20))
    executable = read_file(launcher, 32 << 20)
    metadata = {
        "format": "kickside-deployment-bundle-v2",
        "source": SOURCE,
        "tag": tag,
        "source_commit": commit,
        "version": version,
        "architecture": architecture,
        "runtime_version": runtime_version,
        "runtime_digest": runtime_digest,
        "lock_digest": digest(lock),
        "config_digest": digest(config),
        "workspace_policy": "published-modules-only-v1",
        "snapshot_digest": digest(pack),
        "launcher_digest": digest(executable),
        "launcher_bytes": len(executable),
    }
    index = json.loads(read_file(dependencies, 4 << 20))
    if not isinstance(index, list) or not 1 <= len(index) <= 1024:
        raise ValueError("the dependency index is invalid")
    previous = ""
    artifacts = []
    expanded_bytes = len(pack) + len(lock) + len(config) + len(executable)
    for entry in index:
        name, checksum = entry["path"], entry["sha256"]
        if not re.fullmatch(r"\.wippy/vendor/[a-z0-9][a-z0-9_-]*/[a-z0-9][a-z0-9_.+-]*\.sha256-[0-9a-f]{64}\.wapp", name) or name <= previous:
            raise ValueError("the dependency path is invalid")
        original = entry["source"]
        if original == "kickside.wapp":
            if name != ".wippy/vendor/kickside/kickside-" + version + ".sha256-" + checksum + ".wapp":
                raise ValueError("the application dependency path is invalid")
            data = pack
        else:
            if original != name.replace(".sha256-" + checksum, ""):
                raise ValueError("the dependency source path is invalid")
            data = read_file(source / "app" / original)
        if hashlib.sha256(data).hexdigest() != checksum:
            raise ValueError("the dependency digest is invalid")
        expanded_bytes += len(data)
        if expanded_bytes > MAX_EXPANDED_BYTES:
            raise ValueError("the expanded bundle exceeds the size limit")
        artifacts.append((name, data))
        previous = name
    metadata["dependencies"] = [{"path": entry["path"], "sha256": entry["sha256"]} for entry in index]
    encoded = json.dumps(metadata, sort_keys=True, separators=(",", ":")).encode()
    if len(encoded) > 64 << 10:
        raise ValueError("the deployment manifest exceeds its limit")
    files = [("kickside.wapp", pack), ("deployment-manifest.json", encoded), ("wippy.lock", lock),
             ("runtime.json", config), ("kickside-launch", executable)] + artifacts
    if expanded_bytes + len(encoded) > MAX_EXPANDED_BYTES:
        raise ValueError("the expanded bundle exceeds the size limit")
    result = io.BytesIO()
    with gzip.GzipFile(fileobj=result, mode="wb", filename="", mtime=0) as compressed:
        with tarfile.open(fileobj=compressed, mode="w|", format=tarfile.USTAR_FORMAT) as archive:
            for name, data in files:
                header = tarfile.TarInfo(name)
                header.size = len(data)
                header.mode = 0o444
                archive.addfile(header, io.BytesIO(data))
    bundle = result.getvalue()
    if len(bundle) > MAX_BUNDLE_BYTES:
        raise ValueError("the bundle exceeds the size limit")
    return bundle


def main():
    parser = argparse.ArgumentParser()
    for name in ("source", "snapshot", "tag", "commit", "runtime-version", "runtime-digest", "architecture", "dependencies", "launcher", "output"):
        parser.add_argument("--" + name, required=True)
    args = parser.parse_args()
    bundle = build_bundle(pathlib.Path(args.source), pathlib.Path(args.snapshot), args.tag, args.commit,
                          args.runtime_version, args.runtime_digest, args.architecture, pathlib.Path(args.dependencies), pathlib.Path(args.launcher))
    with pathlib.Path(args.output).open("xb") as output:
        output.write(bundle)


if __name__ == "__main__":
    main()
