(function(){
  if(!document.getElementById('pista'))return;
  // 0. Галерея: розмітку додаємо в кінець <body>, щоб не дописувати її в index.html
  document.body.insertAdjacentHTML('beforeend',`<div class="galeria" id="galeria" hidden role="dialog" aria-label="Galería">
  <div class="lienzo" id="lienzo"><img id="g-img" alt=""></div>
  <span class="g-ayuda" id="g-ayuda"></span>
  <button class="g-btn g-prev" id="g-prev" aria-label="Anterior">‹</button>
  <button class="g-btn g-next" id="g-next" aria-label="Siguiente">›</button>
  <button class="g-btn g-cerrar" id="g-cerrar" aria-label="Volver"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg></button>
  <span class="g-cont" id="g-cont"></span>
</div>`);

  const N=10, CL=3;
  const src=i=>'img/obras/obra-'+String(i+1).padStart(2,'0')+'.webp';
  // 1. Передзавантажуємо всі фото одразу — далі вони беруться з пам'яті
  const cache=[...Array(N)].map((_,i)=>{const im=new Image();im.decoding='async';im.src=src(i);return im;});

  // 2. Карусель по колу
  const pista=document.getElementById('pista');
  const orden=[...Array(CL).keys()].map(k=>N-CL+k).concat([...Array(N).keys()],[...Array(CL).keys()]);
  orden.forEach(i=>{
    const f=document.createElement('figure');f.className='slide';f.dataset.i=i;
    const img=document.createElement('img');img.alt='Proyecto '+(i+1);img.width=720;img.height=960;img.draggable=false;
    img.onload=()=>img.classList.add('ok');img.src=src(i);if(img.complete)img.classList.add('ok');
    f.appendChild(img);pista.appendChild(f);
  });
  const slides=[...pista.children];
  const centro=s=>s.offsetLeft+s.offsetWidth/2-pista.clientWidth/2;
  const reduce=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  function saltar(p){pista.style.scrollSnapType='none';pista.scrollLeft=centro(slides[p]);requestAnimationFrame(()=>pista.style.scrollSnapType='');}
  function cercano(){const c=pista.scrollLeft+pista.clientWidth/2;let b=0,d=1e9;slides.forEach((s,i)=>{const m=Math.abs(s.offsetLeft+s.offsetWidth/2-c);if(m<d){d=m;b=i}});return b;}
  function ir(p){pista.scrollTo({left:centro(slides[p]),behavior:reduce()?'auto':'smooth'});}
  let t;pista.addEventListener('scroll',()=>{clearTimeout(t);t=setTimeout(()=>{const p=cercano();if(p<CL)saltar(p+N);else if(p>=CL+N)saltar(p-N);},120)},{passive:true});
  document.getElementById('prev').onclick=()=>ir(cercano()-1);
  document.getElementById('next').onclick=()=>ir(cercano()+1);
  pista.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();ir(cercano()+1)}if(e.key==='ArrowLeft'){e.preventDefault();ir(cercano()-1)}if(e.key==='Enter'){abrir(+slides[cercano()].dataset.i)}});
  addEventListener('resize',()=>saltar(cercano()));
  requestAnimationFrame(()=>saltar(CL));

  // 3. Відкрити тільки КОРОТКИМ дотиком/кліком без руху (прокрутка й затискання не відкривають)
  let down=null;
  pista.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY,t:Date.now(),s:e.target.closest('.slide')};});
  pista.addEventListener('pointerup',e=>{
    if(!down||!down.s)return;
    const mov=Math.hypot(e.clientX-down.x,e.clientY-down.y), dur=Date.now()-down.t;
    if(mov<8&&dur<350)abrir(+down.s.dataset.i);
    down=null;
  });
  pista.addEventListener('pointercancel',()=>down=null);
  pista.addEventListener('contextmenu',e=>e.preventDefault());

  // 4. Галерея
  const gal=document.getElementById('galeria'),img=document.getElementById('g-img'),lienzo=document.getElementById('lienzo');
  const cont=document.getElementById('g-cont'),ayuda=document.getElementById('g-ayuda');
  const tactil=matchMedia('(pointer: coarse)').matches;
  let idx=0,esc=1,tx=0,ty=0;
  const aplicar=(anim=true)=>{img.classList.toggle('sin-trans',!anim);img.style.transform=`translate(${tx}px,${ty}px) scale(${esc})`;};
  function mostrar(i,dir=0){
    idx=(i+N)%N;esc=1;tx=ty=0;
    img.classList.add('sin-trans');img.style.transform=`translateX(${dir*40}px)`;img.style.opacity='0';
    img.src=cache[idx].src;img.alt='Proyecto '+(idx+1);
    requestAnimationFrame(()=>{img.classList.remove('sin-trans');img.style.opacity='1';img.style.transform='none';});
    cont.textContent=(idx+1)+' / '+N;
  }
  function abrir(i){gal.hidden=false;ayuda.textContent=tactil?'Desliza ← → · dos dedos para ampliar · desliza ↓ para cerrar':'Rueda para ampliar · ← → para cambiar · Esc para cerrar';mostrar(i);requestAnimationFrame(()=>gal.classList.add('abierta'));document.body.style.overflow='hidden';if(!tactil)document.getElementById('g-cerrar').focus({preventScroll:true});}
  function cerrar(){gal.classList.remove('abierta');document.body.style.overflow='';setTimeout(()=>gal.hidden=true,200);pista.focus({preventScroll:true});}
  document.getElementById('g-prev').onclick=e=>{e.stopPropagation();mostrar(idx-1,-1)};
  document.getElementById('g-next').onclick=e=>{e.stopPropagation();mostrar(idx+1,1)};
  document.getElementById('g-cerrar').onclick=e=>{e.stopPropagation();cerrar()};
  lienzo.addEventListener('click',e=>{if(esc!==1||Date.now()-ultimoGesto<400)return;const r=img.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)cerrar();});
  addEventListener('keydown',e=>{if(gal.hidden)return;if(e.key==='Escape')cerrar();if(e.key==='ArrowRight')mostrar(idx+1,1);if(e.key==='ArrowLeft')mostrar(idx-1,-1);});

  // ПК: колесо = зум у точці курсора; рух мишки = перегляд збільшеної частини
  lienzo.addEventListener('wheel',e=>{
    e.preventDefault();
    esc=Math.min(4,Math.max(1,esc*(e.deltaY<0?1.2:1/1.2)));
    if(esc===1){tx=ty=0}else{seguir(e)}
    aplicar();
  },{passive:false});
  function seguir(e){
    const r=img.getBoundingClientRect(), w=r.width/esc, h=r.height/esc;
    const cx=(e.clientX-innerWidth/2)/(w/2), cy=(e.clientY-innerHeight/2)/(h/2);
    const maxX=w*(esc-1)/2, maxY=h*(esc-1)/2;
    tx=-Math.max(-1,Math.min(1,cx))*maxX; ty=-Math.max(-1,Math.min(1,cy))*maxY;
  }
  lienzo.addEventListener('mousemove',e=>{if(esc>1&&!tactil){seguir(e);aplicar(false)}});

  // Телефон: свайп ←/→ — наступне, ↓ — закрити; два пальці — зум; подвійний дотик — зум
  const p=new Map();let ini=null,d0=0,e0=1,tap=0,ultimoGesto=0;
  lienzo.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')lienzo.setPointerCapture(e.pointerId);p.set(e.pointerId,e);
    if(p.size===2){const[a,b]=[...p.values()];d0=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);e0=esc;ini=null;}
    else{ini={x:e.clientX,y:e.clientY,tx,ty};
      const now=Date.now();if(tactil&&now-tap<280){esc=esc>1?1:2.2;tx=ty=0;aplicar();ini=null}tap=now;}
  });
  lienzo.addEventListener('pointermove',e=>{if(!p.has(e.pointerId))return;p.set(e.pointerId,e);
    if(p.size===2){const[a,b]=[...p.values()];esc=Math.min(4,Math.max(1,e0*Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY)/d0));if(esc===1){tx=ty=0}aplicar(false);return;}
    if(!ini||!tactil)return;
    const dx=e.clientX-ini.x,dy=e.clientY-ini.y;
    if(esc>1){tx=ini.tx+dx;ty=ini.ty+dy;aplicar(false);}
    else{img.classList.add('sin-trans');img.style.transform=`translate(${dx}px,${Math.max(0,dy)}px)`;gal.style.background=`rgba(10,18,13,${.97-Math.min(.6,Math.max(0,dy)/400)})`;}
  });
  const fin=e=>{
    if(!p.has(e.pointerId))return;p.delete(e.pointerId);
    if(!ini||esc>1||!tactil){ini=null;return;}
    const dx=e.clientX-ini.x,dy=e.clientY-ini.y;ini=null;gal.style.background='';if(Math.abs(dx)>8||Math.abs(dy)>8)ultimoGesto=Date.now();
    if(dy>110&&Math.abs(dx)<90){cerrar();return;}
    if(dx<-60)mostrar(idx+1,1);else if(dx>60)mostrar(idx-1,-1);else{img.classList.remove('sin-trans');img.style.transform='none';}
  };
  lienzo.addEventListener('pointerup',fin);lienzo.addEventListener('pointercancel',fin);
})();
