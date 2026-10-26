// Treść strony jest już w index.html (generuje ją build.js).
// Ten plik obsługuje tylko lightbox galerii.

function initLightbox() {
    GLightbox({
        touchNavigation: true,
        loop: true,
        slideEffect: 'slide',
        moreLength: 0
    });

    // Kliknięcie w kategorię otwiera jej galerię od pierwszego zdjęcia
    document.querySelectorAll('.series-item').forEach(item => {
        item.addEventListener('click', () => {
            const seriesIndex = item.dataset.series;
            const seriesGallery = document.querySelector(`#series-${seriesIndex}`);
            const firstLink = seriesGallery.querySelector('a');
            firstLink.click();
        });
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLightbox);
} else {
    initLightbox();
}
