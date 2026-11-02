// Páginas de servicio: поява блоків при прокрутці.
// Без JavaScript усе видно одразу — клас .js вмикає анімацію тільки тут.
document.documentElement.classList.add('js');

const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
            entrada.target.classList.add('on');
            observador.unobserve(entrada.target);
        }
    });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach((elemento, i) => {
    elemento.style.transitionDelay = (i % 4) * 70 + 'ms';
    observador.observe(elemento);
});
