/* ===== Loader: lógica (módulo reutilizable) =====
   1) En <head>, ANTES de todo, pon el mini-script (ver README abajo) que marca si ya se vio.
   2) Este archivo va con <script src="loader.js" defer></script>.
   Se cierra cuando: la página cargó + las fotos de PRELOAD están listas + pasó el tiempo mínimo. */
(function(){
  const CFG={
    minMs:3400,          // mínimo: lo que dura la animación completa
    reducedMs:500,       // si el usuario desactivó animaciones
    maxMs:8000,          // máximo de espera (si algo va lento, se cierra igualmente)
    key:'hld-loader',    // nombre de la marca en sessionStorage
    preload:window.LOADER_PRELOAD||[]   // fotos a precargar mientras suena la animación
  };
  const el=document.getElementById('loader'),root=document.documentElement;
  if(!el)return;
  if(root.classList.contains('ld-visto')){el.remove();return;}
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  const loaded=new Promise(r=>document.readyState==='complete'?r():addEventListener('load',r,{once:true}));
  const fotos=Promise.all(CFG.preload.map(s=>new Promise(r=>{const i=new Image();i.onload=i.onerror=r;i.src=s;})));
  Promise.race([Promise.all([loaded,fotos,wait(reduced?CFG.reducedMs:CFG.minMs)]),wait(CFG.maxMs)]).then(()=>{
    el.classList.add('ld-fuera');
    root.classList.remove('ld-activo');
    try{sessionStorage.setItem(CFG.key,'1')}catch(e){}
    setTimeout(()=>el.remove(),600);
  });
})();
