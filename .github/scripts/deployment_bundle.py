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


def build_bundle(source, snapshot, tag, commit, runtime_version, runtime_digest):
    version = read_file(source / "app/version.txt", 128).decode().strip()
    if not re.fullmatch(r"[0-9]+\.[0-9]+\.[0-9]+", version) or tag != "kickside-v" + version:
        raise ValueError("the source must match the application release tag")
    if not re.fullmatch(r"[0-9a-f]{40}", commit):
        raise ValueError("the source commit is invalid")
    if not re.fullmatch(r"[0-9]+\.[0-9]+\.[0-9]+[a-z]?", runtime_version):
        raise ValueError("the runtime version is invalid")
    if not re.fullmatch(r"sha256:[0-9a-f]{64}", runtime_digest):
        raise ValueError("the runtime digest is invalid")
    lock = read_file(source / "app/wippy.lock", 4 << 20)
    config = read_file(source / "app/.wippy.yaml", 4 << 20)
    pack = read_file(snapshot, MAX_BUNDLE_BYTES - (1 << 20))
    metadata = {
        "format": "kickside-deployment-bundle-v1",
        "source": SOURCE,
        "tag": tag,
        "source_commit": commit,
        "version": version,
        "runtime_version": runtime_version,
        "runtime_digest": runtime_digest,
        "lock_digest": digest(lock),
        "config_digest": digest(config),
        "workspace_policy": "published-modules-only-v1",
        "snapshot_digest": digest(pack),
    }
    encoded = json.dumps(metadata, sort_keys=True, separators=(",", ":")).encode()
    result = io.BytesIO()
    with gzip.GzipFile(fileobj=result, mode="wb", filename="", mtime=0) as compressed:
        with tarfile.open(fileobj=compressed, mode="w|", format=tarfile.USTAR_FORMAT) as archive:
            for name, data in (("kickside.wapp", pack), ("deployment-manifest.json", encoded)):
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
    for name in ("source", "snapshot", "tag", "commit", "runtime-version", "runtime-digest", "output"):
        parser.add_argument("--" + name, required=True)
    args = parser.parse_args()
    bundle = build_bundle(pathlib.Path(args.source), pathlib.Path(args.snapshot), args.tag, args.commit,
                          args.runtime_version, args.runtime_digest)
    with pathlib.Path(args.output).open("xb") as output:
        output.write(bundle)


if __name__ == "__main__":
    main()
