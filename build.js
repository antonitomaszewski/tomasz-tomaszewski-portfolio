// Generuje gotowy index.html z template.html + data/content.json.
// Dzięki temu cała treść jest w HTML (dobre dla Google), a JS obsługuje tylko lightbox.
//
// Użycie: node build.js

const fs = require('fs');

const IMAGES = 'data/images';
const data = JSON.parse(fs.readFileSync('data/content.json', 'utf8'));
const template = fs.readFileSync('template.html', 'utf8');

// Escapowanie tekstu wstawianego do atrybutów (alt, title)
const esc = text => String(text)
    .replace(/&/g, '&amp;').replace(/"/g, '&quot;')
    .replace(/</g, '&lt;').replace(/>/g, '&gt;');

const img = path => `${IMAGES}/${path}`;

function renderNavigation(sections) {
    return sections.map(section =>
        `        <a href="#${section.id}">${section.nav}</a>`
    ).join('\n');
}

function renderAbout(section) {
    return `
        <section class="content-section" id="${section.id}">
            <h2>${section.title}</h2>
            <div class="about-content">
                <div class="profile-image">
                    <img src="${img('profile.webp')}" alt="Tomasz Tomaszewski, rzeźbiarz, przy Pomniku Wspólnej Pamięci we Wrocławiu">
                </div>
                <div>${section.content}</div>
            </div>
        </section>`;
}

// Realizacje: każda kategoria to folder data/images/realizacje/<folder>/ (webp + thumbs/).
// Zdjęcia czytamy z folderu, więc wystarczy je wrzucić – pusta kategoria się nie pokazuje.
// Opis zdjęcia (alt) bierzemy z "alts" w content.json, a gdy go brak – z nazwy kategorii.
function realizationCategories(categories) {
    return categories.map(category => {
        const dir = `${IMAGES}/realizacje/${category.folder}`;
        const files = fs.existsSync(dir)
            ? fs.readdirSync(dir).filter(file => file.endsWith('.webp')).sort()
            : [];
        const alts = category.alts || {};
        const cover = category.cover || files[0];
        return {
            title: category.title,
            thumbnail: `realizacje/${category.folder}/thumbs/${cover}`,
            images: files.map(file => ({
                src: `realizacje/${category.folder}/${file}`,
                alt: alts[file] || `${category.title} – Tomasz Tomaszewski, rzeźbiarz`,
            })),
        };
    }).filter(category => category.images.length);
}

function renderPortfolio(section) {
    return renderSeries({ ...section, series: realizationCategories(section.categories) });
}

function renderSeries(section) {
    const seriesGrid = section.series.map((serie, index) =>
        `<div class="series-item" data-series="${index}">
                        <img src="${img(serie.thumbnail)}" alt="${esc(serie.title)}" loading="lazy">
                        <h3>${serie.title}</h3>
                        <div class="series-gallery" id="series-${index}" style="display: none;">
                            ${serie.images.map(image =>
                                `<a href="${img(image.src)}" class="glightbox" data-gallery="series-${index}" data-title="${esc(image.alt)}" aria-label="${esc(image.alt)}"></a>`
                            ).join('\n                            ')}
                        </div>
                    </div>`
    ).join('\n                    ');

    return `
        <section class="content-section" id="${section.id}">
            <h2>${section.title}</h2>
            <div class="series-content">
                <div>${section.content}</div>
                <div class="series-grid">
                    ${seriesGrid}
                </div>
            </div>
        </section>`;
}

// FAQ na <details>: rozwijanie działa bez JS, a Google widzi pytania i odpowiedzi
function renderFaq(section) {
    const items = section.items.map(item =>
        `<details class="faq-item">
                        <summary>${item.q}</summary>
                        <p>${item.a}</p>
                    </details>`
    ).join('\n                    ');

    return `
        <section class="content-section" id="${section.id}">
            <h2>${section.title}</h2>
            <div class="faq-content">
                <div>${section.content}</div>
                <div class="faq-list">
                    ${items}
                </div>
            </div>
        </section>`;
}

function renderText(section) {
    return `
        <section class="content-section" id="${section.id}">
            <h2>${section.title}</h2>
            <div>${section.content}</div>
        </section>`;
}

const renderers = {
    about: renderAbout,
    portfolio: renderPortfolio,
    faq: renderFaq,
    text: renderText,
};

// Tło to ścieżka do zdjęcia albo {src, position}, gdy trzeba pokazać inny fragment niż środek
// (np. pionowe zdjęcie w szerokim pasie: position "center 20%" = bliżej góry kadru).
function renderBackground(background) {
    const { src, position } = typeof background === 'string' ? { src: background } : background;
    const positionStyle = position ? `; background-position: ${position}` : '';
    return `
        <div class="background-section" style="background-image: url('${img(src)}')${positionStyle}"></div>`;
}

// Sekcje z tłami pomiędzy – tło po każdej sekcji, dopóki starczy zdjęć
function renderSections(sections, backgrounds) {
    return sections.map((section, index) => {
        let html = renderers[section.type](section);
        if (index < backgrounds.length) {
            html += renderBackground(backgrounds[index]);
        }
        return html;
    }).join('\n');
}

// Dane strukturalne schema.org: osoba + FAQ (Google może pokazać pytania w wynikach)
function renderStructuredData(sections) {
    const person = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'Tomasz Tomaszewski',
        jobTitle: 'Rzeźbiarz',
        description: 'Rzeźbiarz: nagrobki artystyczne, pomniki, meble artystyczne i małe formy rzeźbiarskie na zamówienie.',
        image: img('profile.webp'),
        telephone: ['+48 600 941 844', '+48 664 746 666'],
        email: 'tomasz.ewski@wp.pl',
        knowsAbout: ['rzeźba', 'rzeźba nagrobna', 'nagrobki artystyczne', 'pomniki', 'meble artystyczne', 'małe formy rzeźbiarskie', 'statuetki na zamówienie', 'płaskorzeźba', 'rzeźba w kamieniu'],
    };
    const scripts = [person];

    const faq = sections.find(section => section.type === 'faq');
    if (faq) {
        scripts.push({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faq.items.map(item => ({
                '@type': 'Question',
                name: item.q,
                acceptedAnswer: { '@type': 'Answer', text: item.a },
            })),
        });
    }

    return scripts.map(json =>
        `<script type="application/ld+json">\n${JSON.stringify(json, null, 4)}\n    </script>`
    ).join('\n    ');
}

// Wszystkie zdjęcia z content.json muszą istnieć – łapie literówki przed publikacją
function checkImages(html) {
    const missing = [...html.matchAll(/(?:src|href)="(data\/images\/[^"]+)"|url\('(data\/images\/[^']+)'\)/g)]
        .map(match => match[1] || match[2])
        .filter(path => !fs.existsSync(path));
    if (missing.length) {
        console.error('Brakujące zdjęcia:\n  ' + [...new Set(missing)].join('\n  '));
        process.exit(1);
    }
}

// Funkcja w .replace, żeby znaki "$" w treści nie były traktowane specjalnie
const html = template
    .replace('{{structured_data}}', () => renderStructuredData(data.sections))
    .replace('{{hero}}', () => img(data.hero))
    .replace('{{title}}', () => data.title)
    .replace('{{subtitle}}', () => data.subtitle)
    .replace('{{nav}}', () => renderNavigation(data.sections))
    .replace('{{content}}', () => renderSections(data.sections, data.backgrounds));

checkImages(html);
fs.writeFileSync('index.html', html);
console.log('✓ index.html wygenerowany');
