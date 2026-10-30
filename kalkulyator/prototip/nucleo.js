/* Ядро калькулятора (прототип). Чисті функції, без DOM. Шари — як у BAZA.md.
   Гроші: центи (цілі). Ціна за одиницю: десятитисячні € (цілі). Кількості не округлюються. */
(function (g) {
  'use strict';

  // ---------- Шар 0: спільне ядро ----------
  function err(msg) { const e = new Error(msg); e.humano = true; throw e; }
  // «половина вгору» без похибок float: спершу прибрати шум (1e-6), потім округлити
  function redondear(x) { const s = x < 0 ? -1 : 1; const a = Math.round(Math.abs(x) * 1e6) / 1e6; return s * Math.floor(a + 0.5); }
  const aCentimos = eur => redondear(Number(eur) * 100);
  const aDiezmil = eur => redondear(Number(eur) * 10000);
  const importe = (cant, precioDiezmil) => redondear(cant * precioDiezmil / 100); // → центи
  function dinero(c, sym = '€') { return eur(c).replace(' €', sym ? ' ' + sym : ''); }
  function eur(c) { const s = c < 0 ? '−' : ''; const a = Math.abs(c); return s + Math.floor(a / 100).toLocaleString('es-ES') + ',' + String(a % 100).padStart(2, '0') + ' €'; }
  function num(x, d = 3) { return Number(x.toFixed(d)).toLocaleString('es-ES', { maximumFractionDigits: d }); }
  function pos(v, nombre) { v = Number(v); if (!(v > 0)) err(`«${nombre}» має бути більше 0`); return v; }
  function noNeg(v, nombre) { v = Number(v || 0); if (v < 0) err(`«${nombre}» не може бути від'ємним`); return v; }
  const r = (v, exp) => ({ v, exp });

  // ---------- Шар 4A: довжина (ml) ----------
  const lineal = {
    segmento: d => r(pos(d.d, 'Довжина'), `${num(d.d)} м`),
    perimetro: d => { const a = pos(d.d, 'Довжина'), b = pos(d.w, 'Ширина'); return r(2 * (a + b), `2 × (${num(a)} + ${num(b)})`); },
    inclinado: d => { const a = pos(d.d, 'Довжина в плані');
      if (d.h !== undefined && d.h !== '') { const h = noNeg(d.h, 'Перепад'); return r(Math.sqrt(a * a + h * h), `√(${num(a)}² + ${num(h)}²)`); }
      const p = noNeg(d.pend, 'Ухил %'); return r(a * Math.sqrt(1 + (p / 100) ** 2), `${num(a)} × √(1 + ${num(p / 100)}²)`); },
    circulo: d => { const D = pos(d.diam, 'Діаметр'); return r(Math.PI * D, `π × ${num(D)}`); },
    arco: d => { const R = pos(d.r, 'Радіус'), A = pos(d.ang, 'Кут'); return r(2 * Math.PI * R * A / 360, `2π × ${num(R)} × ${num(A)}/360`); },
  };
  // ---------- Шар 4B: площа (m²), стоїть на 4A ----------
  const superficie = {
    rect: d => { const a = pos(d.d, 'Довжина'), b = pos(d.w, 'Ширина'); return r(a * b, `${num(a)} × ${num(b)}`); },
    triangulo: d => { const a = pos(d.b, 'Основа'), h = pos(d.h, 'Висота'); return r(a * h / 2, `½ × ${num(a)} × ${num(h)}`); },
    trapecio: d => { const a = pos(d.a, 'Сторона a'), b = pos(d.b, 'Сторона b'), h = pos(d.h, 'Висота'); return r((a + b) / 2 * h, `(${num(a)} + ${num(b)})/2 × ${num(h)}`); },
    circulo: d => { const R = pos(d.diam, 'Діаметр') / 2; return r(Math.PI * R * R, `π × ${num(R)}²`); },
    semicirculo: d => { const R = pos(d.diam, 'Діаметр') / 2; return r(Math.PI * R * R / 2, `π × ${num(R)}² / 2`); },
    paredes: d => { const p = lineal.perimetro(d), h = pos(d.h, 'Висота'); return r(p.v * h, `${p.exp} × ${num(h)}`); },
    mocheta: d => { const w = pos(d.w, 'Ширина отвору'), h = pos(d.h, 'Висота отвору'), t = pos(d.prof, 'Глибина відкосу');
      const P = 2 * h + w + (d.bajo ? w : 0); return r(P * t, `(${d.bajo ? '2×(' + num(w) + ' + ' + num(h) + ')' : '2×' + num(h) + ' + ' + num(w)}) × ${num(t)}`); },
    inclinada: d => { const s = pos(d.s, 'Площа в плані');
      if (d.ang !== undefined && d.ang !== '') { const a = Number(d.ang); if (!(a >= 0 && a < 90)) err('Кут має бути від 0 до 90°'); return r(s / Math.cos(a * Math.PI / 180), `${num(s)} ÷ cos ${num(a)}°`); }
      const p = noNeg(d.pend, 'Ухил %'); return r(s * Math.sqrt(1 + (p / 100) ** 2), `${num(s)} × √(1 + ${num(p / 100)}²)`); },
  };
  // ---------- Шар 4C: об'єм (m³) = фігура m² × глибина ----------
  const volumen = {
    bloque: d => { const s = superficie.rect(d), h = pos(d.h, 'Глибина'); return r(s.v * h, `${s.exp} × ${num(h)}`); },
    capa: d => { const s = pos(d.s, 'Площа'), t = pos(d.esp, 'Товщина (см)') / 100; return r(s * t, `${num(s)} × ${num(t)}`); },
    zanja_talud: d => { const L = pos(d.d, 'Довжина'), b = pos(d.b, 'Ширина дна'), h = pos(d.h, 'Глибина'), m = noNeg(d.m, 'Укіс m');
      const T = b + 2 * m * h; return r((b + T) / 2 * h * L, `(${num(b)} + ${num(T)})/2 × ${num(h)} × ${num(L)}`); },
    prof_variable: d => { const L = pos(d.d, 'Довжина'), w = pos(d.w, 'Ширина'), h1 = pos(d.h1, 'Глибина на початку'), h2 = pos(d.h2, 'Глибина в кінці');
      return r(L * w * (h1 + h2) / 2, `${num(L)} × ${num(w)} × (${num(h1)} + ${num(h2)})/2`); },
    excavacion: d => { const L = pos(d.d, 'Довжина'), w = pos(d.w, 'Ширина'), h = pos(d.h, 'Глибина'), z = noNeg(d.margen, 'Робочий запас');
      return r((L + 2 * z) * (w + 2 * z) * h, `(${num(L)} + 2×${num(z)}) × (${num(w)} + 2×${num(z)}) × ${num(h)}`); },
    hoyo: d => { const R = pos(d.diam, 'Діаметр (см)') / 200, h = pos(d.h, 'Глибина'); return r(Math.PI * R * R * h, `π × ${num(R)}² × ${num(h)}`); },
  };
  const GEO = { ml: lineal, m2: superficie, m3: volumen };

  // ---------- Шар 3: кількість (каркас однаковий для ml, m², m³) ----------
  // partes: [{signo:+1|-1, figura, datos, n, nombre}]; figura 'numero' → datos.v
  // regla (тільки m²): {tipo:'todos'|'ninguno'|'mayor', x}
  function cantidad(unidad, partes, opts = {}) {
    if (!partes || !partes.length) err('Додай хоча б одну частину або впиши кількість');
    let mas = 0, menos = 0; const lineas = [];
    for (const p of partes) {
      const n = p.n === undefined || p.n === '' ? 1 : Number(p.n);
      if (!(n > 0) || !Number.isInteger(n)) err('Кількість однакових частин (× N) — ціле число більше 0');
      const g = p.figura === 'numero' ? r(pos(p.datos.v, 'Кількість'), num(Number(p.datos.v))) : GEO[unidad][p.figura](p.datos);
      let v = g.v * n, nota = '';
      if (p.signo < 0 && unidad === 'm2' && opts.regla) {
        const rg = opts.regla;
        if (rg.tipo === 'ninguno' || (rg.tipo === 'mayor' && g.v <= Number(rg.x))) { nota = rg.tipo === 'ninguno' ? ' (не віднімається за правилом)' : ` (≤ ${num(Number(rg.x))} m² — не віднімається)`; v = 0; }
      }
      if (p.signo < 0) menos += v; else mas += v;
      lineas.push(`${p.signo < 0 ? '−' : '+'} ${p.nombre ? p.nombre + ': ' : ''}${g.exp}${n > 1 ? ' × ' + n : ''} = ${num(g.v * n)}${nota}`);
    }
    if (menos > mas + 1e-9) err('Віднімаєш більше, ніж додаєш: перевір отвори/мінуси');
    const neta = mas - menos;
    return { neta, mas, menos, lineas };
  }
  // ручна правка + запас
  function cantidadFinal(neta, { manual, reserva } = {}) {
    let q = neta, exp = [];
    if (manual !== undefined && manual !== '' && manual !== null) { const m = pos(manual, 'Ручна правка'); exp.push(`${num(neta)} → ${num(m)} (ручна правка)`); q = m; }
    let extra = 0, pct = 0;
    if (reserva && reserva.v !== '' && reserva.v !== undefined && Number(reserva.v) !== 0) {
      const v = noNeg(reserva.v, 'Запас');
      if (reserva.tipo === 'pct') { extra = q * v / 100; pct = v; } else { extra = v; pct = q > 0 ? v / q * 100 : 0; }
      exp.push(`запас +${num(extra)} = +${num(pct, 1)} %`);
    }
    return { base: q, extra, pct, total: q + extra, exp };
  }

  // ---------- Шар 5: прості режими ----------
  const simples = {
    porPaso: d => { const L = pos(d.l, 'Довжина'), s = pos(d.paso, 'Крок'); const k = Math.ceil(L / s - 1e-9);
      const add = d.extremos === 'ambos' ? 1 : d.extremos === 'ninguno' ? -1 : 0; const v = Math.max(0, k + add);
      return r(v, `вгору(${num(L)} ÷ ${num(s)}) ${add > 0 ? '+ 1' : add < 0 ? '− 1' : ''}`.trim()); },
    porArea: d => { const s = pos(d.s, 'Площа'), k = pos(d.k, 'Шт на m²'); return r(Math.ceil(s * k - 1e-9), `вгору(${num(s)} × ${num(k)})`); },
    horasInicioFin: d => { const t = x => { const m = /^(\d{1,2}):(\d{2})$/.exec(String(x || '').trim()); if (!m || +m[1] > 23 || +m[2] > 59) err('Час у форматі ГГ:ХХ'); return +m[1] * 60 + +m[2]; };
      let a = t(d.ini), b = t(d.fin); if (b <= a) b += 24 * 60; const p = noNeg(d.pausa, 'Перерва'); const min = b - a - p; if (min <= 0) err('Перерва довша за зміну');
      return r(min / 60, `(${d.fin} − ${d.ini}${b - a > 0 && t(d.fin) <= t(d.ini) ? ' +24 год' : ''}) − ${num(p)} хв`); },
    horasDias: d => { const a = pos(d.dias, 'Днів'), b = pos(d.h, 'Годин на день'); return r(a * b, `${num(a)} × ${num(b)}`); },
    horasPersonas: d => { const a = pos(d.p, 'Людей'), b = pos(d.h, 'Годин'); return r(a * b, `${num(a)} × ${num(b)}`); },
  };
  function etapas(totalC, pcts) {
    const ps = pcts.map(x => noNeg(x, 'Етап %')); const s = ps.reduce((a, b) => a + b, 0);
    if (Math.abs(s - 100) > 1e-9) err(`Етапи разом ${num(s, 2)} %, а має бути 100 %`);
    const out = []; let acc = 0;
    ps.forEach((p, i) => { const c = i === ps.length - 1 ? totalC - acc : redondear(totalC * p / 100); acc += c; out.push(c); });
    return out; // останній етап бере залишок → сума завжди = total
  }

  // ---------- Шар 2: ціна ----------
  function base({ modo, cant, precio }) {
    if (modo === 'global') { const c = aCentimos(noNeg(precio, 'Сума')); return { c, exp: `одна сума ${eur(c)}` }; }
    const p = aDiezmil(noNeg(precio, 'Ціна')); const c = importe(cant, p);
    return { c, exp: `${num(cant)} × ${num(p / 10000, 4)} € = ${eur(c)}` };
  }
  function margen(precioC, costeC) {
    if (!(costeC > 0) || !(precioC > 0)) return null;
    return { margen: (precioC - costeC) / precioC * 100, recargo: (precioC - costeC) / costeC * 100, beneficio: precioC - costeC };
  }

  // ---------- Шар 1: «Додатково» і підсумок ----------
  function maquinaria(d) {
    const h = noNeg(d.h, 'Години'), ph = aCentimos(noNeg(d.ph, '€/год')), hp = noNeg(d.hp, 'Простій'), pp = aCentimos(noNeg(d.pp, '€/год простою'));
    const min = aCentimos(noNeg(d.min, 'Мінімум')), tr = aCentimos(noNeg(d.tr, 'Доставка'));
    const trabajo = redondear(h * ph + hp * pp), c = Math.max(trabajo, min) + tr;
    return { c, exp: `МАКС(${num(h)}×${eur(ph)} + ${num(hp)}×${eur(pp)} = ${eur(trabajo)}, мін. ${eur(min)}) + доставка ${eur(tr)} = ${eur(c)}` };
  }
  function extra(fila, baseC) {
    switch (fila.tipo) {
      case 'suma': { const c = aCentimos(Number(fila.v || 0)); return { c, exp: eur(c) }; }
      case 'uds': { const n = noNeg(fila.n, 'Кількість'), p = aDiezmil(noNeg(fila.p, 'Ціна')); const c = importe(n, p); return { c, exp: `${num(n)} × ${num(p / 10000, 4)} € = ${eur(c)}` }; }
      case 'pct': { const p = Number(fila.v || 0); const c = redondear(baseC * p / 100); return { c, exp: `${num(p, 2)} % від ${eur(baseC)} = ${eur(c)}` }; }
      case 'maq': return maquinaria(fila);
      default: err('Невідомий тип рядка');
    }
  }
  // impuestos: [{nombre, pct, signo:+1|-1}]
  // похибка: errorPct (число, %) або error {tipo:'pct'|'eur', v}
  function resumen({ baseC, extrasC = 0, errorPct = 0, error, ajuste = { tipo: 'pct', v: 0 }, impuestos = [] }) {
    const p = []; const s13 = baseC + extrasC; p.push(['Сума позиції', s13, `${eur(baseC)} + ${eur(extrasC)}`]);
    let s14;
    if (error && error.tipo === 'eur') { const c = aCentimos(Number(error.v || 0)); s14 = s13 + c; p.push(['З похибкою', s14, `+ ${eur(c)}`]); }
    else { const e = Number(error ? error.v || 0 : errorPct || 0); if (e < -100) err('Похибка не може бути менше −100 %');
      s14 = redondear(s13 * (1 + e / 100)); p.push(['З похибкою', s14, `× (1 + ${num(e, 2)} %)`]); }
    let s15; if (ajuste.tipo === 'eur') { s15 = s14 + aCentimos(Number(ajuste.v || 0)); p.push(['Скориговано', s15, `${eur(s14)} ${Number(ajuste.v) < 0 ? '−' : '+'} ${eur(Math.abs(aCentimos(Number(ajuste.v || 0))))}`]); }
    else { const a = Number(ajuste.v || 0); if (a < -100) err('Знижка не може бути більше 100 %'); s15 = redondear(s14 * (1 + a / 100)); p.push(['Скориговано', s15, `× (1 ${a < 0 ? '−' : '+'} ${num(Math.abs(a), 2)} %)`]); }
    if (s15 < 0) err('Сума після корекції менша за 0');
    let total = s15; const imp = [];
    for (const t of impuestos) { const c = redondear(s15 * Number(t.pct) / 100); total += t.signo < 0 ? -c : c; imp.push([t.nombre, t.signo < 0 ? -c : c, `${eur(s15)} × ${num(Number(t.pct), 2)} %`]); }
    return { pasos: p, base: s15, impuestos: imp, total };
  }

  const api = { dinero, redondear, aCentimos, aDiezmil, importe, eur, num, lineal, superficie, volumen, cantidad, cantidadFinal, simples, etapas, base, margen, maquinaria, extra, resumen };
  g.Nucleo = api; if (typeof module !== 'undefined') module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
