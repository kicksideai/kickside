# SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

import argparse
import base64
import hashlib
import pathlib
import re
import struct
import subprocess
import tempfile
import urllib.parse
import urllib.request


PUBLISHER_ED25519_PUBLIC = "xcLLvYAfv/BCYborznp5nrm6qdIU/o9c2xJi0tr0fhw="
SOURCE = "https://github.com/wippyai/runtime/releases/download/"
MAX_BINARY_BYTES = 256 << 20


class ReleaseRedirect(urllib.request.HTTPRedirectHandler):
    max_redirections = 3

    def redirect_request(self, request, response, code, message, headers, target):
        url = urllib.parse.urlsplit(target)
        if url.scheme != "https" or url.hostname not in (
                "release-assets.githubusercontent.com", "objects.githubusercontent.com"):
            raise ValueError("release redirect is not trusted")
        return super().redirect_request(request, response, code, message, headers, target)


def fetch(url, limit):
    request = urllib.request.Request(url, headers={"User-Agent": "Kickside-release-verification"})
    with urllib.request.build_opener(ReleaseRedirect()).open(request, timeout=60) as response:
        if response.status != 200:
            raise ValueError("release download failed")
        data = response.read(limit + 1)
    if not data or len(data) > limit:
        raise ValueError("release size is invalid")
    return data


def install(version, destination, architecture="amd64"):
    if not re.fullmatch(r"[0-9]+\.[0-9]+\.[0-9]+[a-z]?", version):
        raise ValueError("runtime version is invalid")
    if architecture not in ("amd64", "arm64"):
        raise ValueError("runtime architecture is invalid")
    url = SOURCE + "v" + version + "/wippy-linux-" + architecture
    data = fetch(url, MAX_BINARY_BYTES)
    signature = base64.b64decode(fetch(url + ".sig", 256).strip(), validate=True)
    machine = 62 if architecture == "amd64" else 183
    if len(signature) != 64 or len(data) < 20 or data[:6] != b"\x7fELF\x02\x01" or struct.unpack_from("<H", data, 18)[0] != machine:
        raise ValueError("runtime platform or signature is invalid")
    destination.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(dir=destination.parent) as directory:
        work = pathlib.Path(directory)
        key = work / "public.der"
        key.write_bytes(bytes.fromhex("302a300506032b6570032100") + base64.b64decode(PUBLISHER_ED25519_PUBLIC))
        binary = work / "wippy"
        binary.write_bytes(data)
        detached = work / "signature"
        detached.write_bytes(signature)
        subprocess.run(["openssl", "pkeyutl", "-verify", "-pubin", "-keyform", "DER", "-inkey", str(key),
                        "-rawin", "-in", str(binary), "-sigfile", str(detached)], check=True, capture_output=True)
        with destination.open("xb") as output:
            output.write(data)
    destination.chmod(0o755)
    return "sha256:" + hashlib.sha256(data).hexdigest()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--version", required=True)
    parser.add_argument("--output", type=pathlib.Path, required=True)
    parser.add_argument("--architecture", choices=("amd64", "arm64"), required=True)
    args = parser.parse_args()
    print(install(args.version, args.output, args.architecture))
