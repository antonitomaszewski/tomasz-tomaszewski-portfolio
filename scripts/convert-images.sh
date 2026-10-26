#!/bin/zsh
# Konwertuje oryginalne zdjęcia na webp dla strony.
#
# Wejście:  zdjecia-oryginalne/<realizacja>/*.jpg
# Wyjście:  data/images/realizacje/<realizacja>/<nazwa>.webp          (2000 px, do lightboxa i teł)
#           data/images/realizacje/<realizacja>/thumbs/<nazwa>.webp   (600 px, miniatury w siatce)
#
# Użycie:   ./scripts/convert-images.sh
# Już przekonwertowane zdjęcia są pomijane. Wymaga: cwebp (brew install webp).

set -e
cd "$(dirname "$0")/.."

SRC=zdjecia-oryginalne
OUT=data/images/realizacje
TMP=$(mktemp -d)

for dir in $SRC/*/; do
    name=$(basename "$dir")
    [[ "$name" == "do-opisania" ]] && continue
    mkdir -p "$OUT/$name/thumbs"

    for file in "$dir"*.(jpg|JPG|jpeg|JPEG)(N); do
        base=$(basename "${file%.*}" | tr 'A-Z' 'a-z')
        full="$OUT/$name/$base.webp"
        thumb="$OUT/$name/thumbs/$base.webp"
        [[ -f "$full" && -f "$thumb" ]] && continue

        # cwebp ignoruje obrót z EXIF, więc obracamy ręcznie
        cp "$file" "$TMP/in.jpg"
        case $(python3 scripts/exif_orientation.py "$file") in
            3) sips -r 180 "$TMP/in.jpg" >/dev/null ;;
            6) sips -r 90  "$TMP/in.jpg" >/dev/null ;;
            8) sips -r 270 "$TMP/in.jpg" >/dev/null ;;
        esac

        # -resize: dłuższy bok 2000 / 600 px
        w=$(sips -g pixelWidth  "$TMP/in.jpg" | awk '/pixelWidth/ {print $2}')
        h=$(sips -g pixelHeight "$TMP/in.jpg" | awk '/pixelHeight/ {print $2}')
        if (( w >= h )); then big="2000 0"; small="600 0"; else big="0 2000"; small="0 600"; fi
        # nie powiększamy małych zdjęć – to tylko zwiększa wagę, a nie dodaje szczegółów
        if (( (w > h ? w : h) <= 2000 )); then big="0 0"; fi

        cwebp -quiet -q 80 -resize ${=big}   "$TMP/in.jpg" -o "$full"
        cwebp -quiet -q 75 -resize ${=small} "$TMP/in.jpg" -o "$thumb"
        echo "✓ $name/$base.webp"
    done
done

rm -r "$TMP"
du -sh $OUT
