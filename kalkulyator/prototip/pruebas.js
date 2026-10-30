/* Золоті приклади (G — logika-01, S — logika-02, B — BAZA). Кожен: що рахуємо → очікуване. */
(function (g) {
  const casos = N => {
    const q = (u, partes, o) => N.cantidad(u, partes, o).neta;
    const P = (figura, datos, signo = 1, n = 1, nombre = '') => ({ figura, datos, signo, n, nombre });
    const baseC = (cant, precio) => N.base({ modo: 'u', cant, precio }).c;
    const err = f => { try { f(); return 'без помилки'; } catch (e) { return e.humano ? 'помилка' : 'збій: ' + e.message; } };
    return [
      ['G1', 'Траншея 12 ml × 10 €', () => baseC(q('ml', [P('segmento', { d: 12 })]), 10), 12000],
      ['G1b', 'Об\'єм траншеї 12 × 0,4 × 0,6', () => q('m3', [P('bloque', { d: 12, w: 0.4, h: 0.6 })]), 2.88],
      ['G2', '2,88 m³ × 35 €', () => baseC(q('m3', [P('bloque', { d: 12, w: 0.4, h: 0.6 })]), 35), 10080],
      ['G3', 'Траншея з укосом L10 b0,5 H1 m0,5', () => q('m3', [P('zanja_talud', { d: 10, b: 0.5, h: 1, m: 0.5 })]), 10],
      ['G4', 'Шар 40 m² × 20 см × 6 €/m³', () => baseC(q('m3', [P('capa', { s: 40, esp: 20 })]), 6), 4800],
      ['G5', 'Котлован 6×4×1,5, запас 0,5', () => q('m3', [P('excavacion', { d: 6, w: 4, h: 1.5, margen: 0.5 })]), 52.5],
      ['G6', '120 € + складність 30 % + дерево 80 €', () => { const b = 12000; return b + N.extra({ tipo: 'pct', v: 30 }, b).c + N.extra({ tipo: 'suma', v: 80 }, b).c; }, 23600],
      ['G7', 'Техніка 4×45 + 1×30, мін 200, доставка 120', () => N.maquinaria({ h: 4, ph: 45, hp: 1, pp: 30, min: 200, tr: 120 }).c, 33000],
      ['G8', 'Техніка 2×45, мін 200, доставка 120', () => N.maquinaria({ h: 2, ph: 45, hp: 0, pp: 0, min: 200, tr: 120 }).c, 32000],
      ['G9', '566 € − 5 % + IVA 21 %', () => N.resumen({ baseC: 56600, ajuste: { tipo: 'pct', v: -5 }, impuestos: [{ nombre: 'IVA', pct: 21, signo: 1 }] }).total, 65062],
      ['G10', 'G9 + retención 15 %', () => N.resumen({ baseC: 56600, ajuste: { tipo: 'pct', v: -5 }, impuestos: [{ nombre: 'IVA', pct: 21, signo: 1 }, { nombre: 'Ret', pct: 15, signo: -1 }] }).total, 56996],
      ['G11', 'Розпушення 2,88 × 1,30', () => 2.88 * 1.3, 3.744],
      ['G12', 'Глибина 0 → помилка', () => err(() => q('m3', [P('bloque', { d: 12, w: 0.4, h: 0 })])), 'помилка'],
      ['S1', '40 m² + 3 m² × 12 €', () => { const f = N.cantidadFinal(40, { reserva: { tipo: 'u', v: 3 } }); return [f.total, f.pct, baseC(f.total, 12)]; }, [43, 7.5, 51600]],
      ['S2', 'S1 + похибка 5 % + 10 % + IVA 21 %', () => N.resumen({ baseC: 51600, errorPct: 5, ajuste: { tipo: 'pct', v: 10 }, impuestos: [{ nombre: 'IVA', pct: 21, signo: 1 }] }).total, 72114],
      ['S3', 'Одна сума 700, собівартість 500', () => { const m = N.margen(70000, 50000); return [Number(m.margen.toFixed(1)), Number(m.recargo.toFixed(1))]; }, [28.6, 40]],
      ['S4', 'Стіни 4×3×2,6, вікно 1,2², двері 0,8×2, правило > 2,5', () => q('m2', [P('paredes', { d: 4, w: 3, h: 2.6 }), P('rect', { d: 1.2, w: 1.2 }, -1), P('rect', { d: 0.8, w: 2 }, -1)], { regla: { tipo: 'mayor', x: 2.5 } }), 36.4],
      ['S5', 'S4, правило «відняти всі»', () => q('m2', [P('paredes', { d: 4, w: 3, h: 2.6 }), P('rect', { d: 1.2, w: 1.2 }, -1), P('rect', { d: 0.8, w: 2 }, -1)], { regla: { tipo: 'todos' } }), 33.36],
      ['S6', 'Похила 50 m², ухил 30 %', () => q('m2', [P('inclinada', { s: 50, pend: 30 })]), 52.2015],
      ['S7', 'Похила довжина 4 м, перепад 3 м', () => q('ml', [P('inclinado', { d: 4, h: 3 })]), 5],
      ['S8', 'Змінна глибина 20 × 0,4 × (0,5..1,1)', () => q('m3', [P('prof_variable', { d: 20, w: 0.4, h1: 0.5, h2: 1.1 })]), 6.4],
      ['S9', 'Ями Ø30 см × 0,8 × 10', () => q('m3', [P('hoyo', { diam: 30, h: 0.8 }, 1, 10)]), 0.5655],
      ['S10', 'Стовпи: 25 м, крок 2,5, обидва кінці', () => N.simples.porPaso({ l: 25, paso: 2.5, extremos: 'ambos' }).v, 11],
      ['S11', '07:30–16:00, перерва 60 хв', () => N.simples.horasInicioFin({ ini: '07:30', fin: '16:00', pausa: 60 }).v, 7.5],
      ['S12', '22:00–06:00 (через північ)', () => N.simples.horasInicioFin({ ini: '22:00', fin: '06:00', pausa: 0 }).v, 8],
      ['S13', 'Техніка (G8) + дерево 80', () => N.maquinaria({ h: 2, ph: 45, hp: 0, pp: 0, min: 200, tr: 120 }).c + N.extra({ tipo: 'suma', v: 80 }, 0).c, 40000],
      ['B1', '+2,10×1,30 − вікно 1×1 × 10 €', () => baseC(q('m2', [P('rect', { d: 2.1, w: 1.3 }), P('rect', { d: 1, w: 1 }, -1)], { regla: { tipo: 'todos' } }), 10), 1730],
      ['B2', 'B1 з ручною правкою 2,00', () => baseC(N.cantidadFinal(1.73, { manual: 2 }).total, 10), 2000],
      ['B3', 'Ями як m² × глибина (= S9)', () => q('m3', [P('hoyo', { diam: 30, h: 0.8 }, 1, 10)]), 0.5655],
      ['B4', 'Етапи 7000 €: 30/50/20', () => N.etapas(700000, [30, 50, 20]), [210000, 350000, 140000]],
      ['B5', 'Етапи 30/50 → помилка', () => err(() => N.etapas(700000, [30, 50])), 'помилка'],
      ['X1', 'Віднімання більше за площу → помилка', () => err(() => q('m2', [P('rect', { d: 1, w: 1 }), P('rect', { d: 2, w: 2 }, -1)], { regla: { tipo: 'todos' } })), 'помилка'],
      ['X2', 'Округлення 541,8000000001 не ламає центи', () => N.redondear(51600 * 1.05), 54180],
    ];
  };
  function iguales(a, b) {
    if (Array.isArray(b)) return Array.isArray(a) && a.length === b.length && a.every((x, i) => iguales(x, b[i]));
    if (typeof b === 'number') return typeof a === 'number' && Math.abs(a - b) < 5e-5;
    return a === b;
  }
  function ejecutar(N) {
    return casos(N).map(([id, desc, f, esperado]) => { let real; try { real = f(); } catch (e) { real = 'збій: ' + e.message; } return { id, desc, real, esperado, ok: iguales(real, esperado) }; });
  }
  const api = { ejecutar }; g.Pruebas = api; if (typeof module !== 'undefined') module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
