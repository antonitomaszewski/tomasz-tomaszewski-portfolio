# Tomasz Tomaszewski – rzeźbiarz

Strona-wizytówka: nagrobki artystyczne, pomniki i rzeźba na zamówienie.
Jedna strona z kotwicami i sticky menu: O twórcy · Realizacje · Oferta · Współpraca · FAQ · Kontakt.

## Jak pracować ze stroną

| Co | Gdzie |
|---|---|
| Teksty, FAQ, galerie, alt-y zdjęć | `data/content.json` |
| `<head>`: tytuł, meta description | `template.html` |
| Wygląd | `css/` |

Po każdej zmianie:

```bash
node build.js        # generuje index.html – NIE edytuj index.html ręcznie
```

Podgląd lokalnie:

```bash
python3 -m http.server 8080   # → http://localhost:8080
```

## Zdjęcia

Realizacje mają 4 kategorie – każda to folder:
`nagrobki`, `pomniki`, `meble`, `male-formy`.

1. Wrzuć oryginalne JPG do `zdjecia-oryginalne/<kategoria>/` (folder jest w `.gitignore`, nie idzie do repo).
   Dobrze dać przedrostek realizacji, np. `morawiecki-DSCF3026.JPG`.
2. `./scripts/convert-images.sh && node build.js`
3. Kategoria pojawia się na stronie sama, pusta jest ukryta.
   Opis zdjęcia (alt) i okładkę ustawisz w `data/content.json` (`alts`, `cover`).

## Przed publikacją na własnej domenie

Usuń z `template.html` linię `<meta name="robots" content="noindex">` (blokuje Google na czas wersji roboczej).
