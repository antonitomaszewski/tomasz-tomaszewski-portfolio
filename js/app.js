// Treść strony jest już w index.html (generuje ją build.js).
// Ten plik obsługuje tylko interakcje: lightbox galerii i okno z artykułem.

function initLightbox() {
    GLightbox({
        touchNavigation: true,
        loop: true,
        slideEffect: 'slide',
        moreLength: 0
    });

    // Kliknięcie w serię otwiera jej galerię od pierwszego zdjęcia
    document.querySelectorAll('.series-item').forEach(item => {
        item.addEventListener('click', () => {
            const seriesIndex = item.dataset.series;
            const seriesGallery = document.querySelector(`#series-${seriesIndex}`);
            const firstLink = seriesGallery.querySelector('a');
            firstLink.click();
        });
    });
}

async function openBlogPost(slug) {
    const modal = document.getElementById('blog-modal');
    const article = document.getElementById('blog-article');

    try {
        const response = await fetch(`data/blog/${slug}.md`);
        if (!response.ok) throw new Error(response.status);
        const markdown = await response.text();
        article.innerHTML = marked.parse(markdown);
    } catch (error) {
        article.innerHTML = `<h1>Błąd</h1><p>Nie można załadować artykułu "${slug}"</p>`;
    }

    modal.style.display = 'block';
}

function closeBlogModal() {
    document.getElementById('blog-modal').style.display = 'none';
}

function initBlogModal() {
    document.querySelectorAll('.blog-link[data-slug]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            openBlogPost(link.dataset.slug);
        });
    });

    document.querySelector('#blog-modal .close').addEventListener('click', closeBlogModal);
    document.getElementById('blog-modal').addEventListener('click', (e) => {
        if (e.target.id === 'blog-modal') {
            closeBlogModal();
        }
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeBlogModal();
        }
    });
}

function init() {
    initLightbox();
    initBlogModal();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
