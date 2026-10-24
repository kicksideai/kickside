"""Small, dependency-only reader for native WIPPYPACK registry entries."""
from pathlib import Path
import struct

import msgpack
import zstandard


def read_pack(path):
    """Return native packed entries keyed by their namespace identity."""
    raw = Path(path).read_bytes()
    offset, size = struct.unpack('<QQ', raw[-16:])
    decoder = zstandard.ZstdDecompressor()
    index = msgpack.unpackb(decoder.decompress(raw[offset:offset + size]), raw=False)
    frame = index['Entries']
    entries = msgpack.unpackb(
        decoder.decompress(raw[frame['Offset']:frame['Offset'] + frame['Size']],
                           max_output_size=frame['UncompressedSize']),
        raw=False, strict_map_key=False)
    result = {}
    for row in entries:
        identity = row['ID']['ns'] + ':' + row['ID']['name']
        if identity in result:
            raise ValueError(f'{identity}: duplicate packed entry')
        result[identity] = {key: row.get(key) or {} for key in ('Kind', 'Meta', 'Data')}
    return result
