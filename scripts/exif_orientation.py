"""Wypisuje tag EXIF Orientation (1-8) z pliku JPEG. Brak tagu -> 1."""
import struct, sys

def orientation(path):
    with open(path, 'rb') as f:
        data = f.read(128 * 1024)
    i = 2
    while i < len(data) - 4:
        if data[i] != 0xFF:
            return 1
        marker = data[i + 1]
        size = struct.unpack('>H', data[i + 2:i + 4])[0]
        if marker == 0xE1 and data[i + 4:i + 10] == b'Exif\0\0':
            t = i + 10
            endian = '<' if data[t:t + 2] == b'II' else '>'
            ifd = t + struct.unpack(endian + 'I', data[t + 4:t + 8])[0]
            count = struct.unpack(endian + 'H', data[ifd:ifd + 2])[0]
            for n in range(count):
                e = ifd + 2 + n * 12
                if struct.unpack(endian + 'H', data[e:e + 2])[0] == 0x0112:
                    return struct.unpack(endian + 'H', data[e + 8:e + 10])[0]
            return 1
        i += 2 + size
    return 1

print(orientation(sys.argv[1]))
