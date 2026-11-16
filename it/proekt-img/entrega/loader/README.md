# Loader з логотипом HLD Casa (модуль для повторного використання)

Файли:
- `loader.css` — вигляд і анімація (кольори `--ld-bg`, `--ld-fg`; розмір `--ld-size` кратний 25px; темп `--ld-t`).
- `loader.js` — логіка: чекає load + фото зі списку + мінімум часу; раз за сеанс (sessionStorage `hld-loader`); запобіжник 9 с; reduced-motion.
- `demo.html` — приклад підключення (відкрити в браузері; кнопка «Ver el loader otra vez»).
- `fonts/hldcasa.woff2` — шрифт логотипу (літери H L D C A S + очі U+E000, U+E001).
- `img/obras/obra-01..03.webp` — тільки для демо (список попереднього завантаження).

## Як підключити (коротко)
1. У `<head>` ПЕРШИМ — маленький скрипт: ставить клас `ld-visto` (вже бачили) або `ld-activo` (ще ні). Див. `demo.html`.
2. `<link rel="stylesheet" href="loader.css">`; `@font-face "HLD Casa Logo"` має бути підключений (у HLDcasa він вже є в style.css).
3. `<script>window.LOADER_PRELOAD=['img/obras/obra-01.webp', …]</script>` — фото, які треба підвантажити під час анімації.
4. `<script src="loader.js" defer></script>`.
5. Одразу після `<body>` — блок `#loader` з розмітки `demo.html`.
6. `<noscript><style>.ld{display:none}</style></noscript>` — щоб без JavaScript сайт був видний.

## Налаштування
- Темп: у `loader.css` `--ld-t` (1 нормально; 0.8 швидше; 1.2 повільніше) + `minMs` у `loader.js`.
- Інший проєкт: змінити `--ld-bg`, `--ld-fg`, слово CASA у розмітці й шрифт.

## Підводні камені
- Лоадер не лікує повільний сайт: це маска. Головне — легкі фото і `loading="lazy"`.
- Показувати раз за сеанс, інакше дратує.
- Розміри 25/50/75/100px — щоб штрихи логотипу падали на цілі пікселі.
