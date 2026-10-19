# Tomasz Tomaszewski – rzeźbiarz

Strona-wizytówka: nagrobki artystyczne, pomniki i rzeźba na zamówienie.
Jedna strona z kotwicami i sticky menu: O twórcy · Realizacje · Oferta · Współpraca · FAQ · Artykuły · Media · Kontakt.

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

1. Wrzuć oryginalne JPG do `zdjecia-oryginalne/<nazwa-realizacji>/` (folder jest w `.gitignore`, nie idzie do repo).
2. `./scripts/convert-images.sh` → webp w `data/images/realizacje/<nazwa-realizacji>/` (2000 px + miniatury 600 px).
3. Dodaj zdjęcia do odpowiedniej serii w `data/content.json` i uruchom `node build.js`.

## Przed publikacją na własnej domenie

Usuń z `template.html` linię `<meta name="robots" content="noindex">` (blokuje Google na czas wersji roboczej).
