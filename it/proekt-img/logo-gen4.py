def mark(bg,fg,s,W,H,grid=False,size=(440,260)):
    pad=22; t=pad; b=pad+H; m=t+H/2
    x0=pad; x1=x0+W; x2=x1+W; x3=x2+W
    p=(f'M{x0} {t} V{b} M{x0} {m} H{x1} '
       f'M{x1} {t} V{b} H{x2} '
       f'M{x2} {b} V{t} H{x2+W*0.3} '
       f'C{x3} {t} {x3} {b} {x2+W*0.3} {b} H{x2}')
    vbw=x3+pad; vbh=b+pad; g=''
    if grid:
        g='<g stroke="#e07a3a" stroke-width="0.4" opacity=".8">'
        for x in (x0,x1,x2,x3): g+=f'<line x1="{x}" y1="{t-8}" x2="{x}" y2="{b+8}"/>'
        for y in (t,m,b): g+=f'<line x1="{x0-8}" y1="{y}" x2="{x3+8}" y2="{y}"/>'
        g+='</g>'
    return f'<svg width="{size[0]}" height="{size[1]}" viewBox="0 0 {vbw} {vbh}" style="background:{bg};border-radius:18px"><path d="{p}" fill="none" stroke="{fg}" stroke-width="{s}" stroke-linecap="square" stroke-linejoin="miter"/>{g}</svg>'
G,C='#2f4a36','#f3efe6'
cells=[(mark(G,C,7,34,56,grid=True),'Сітка: H = L = D за шириною, однакова висота'),
       (mark(G,C,7,34,56),'1 · лінія 7'),
       (mark(G,C,9,34,56),'2 · жирніше, лінія 9'),
       (mark(C,G,7,34,56),'1 на світлому фоні')]
html='<html><body style="margin:0;background:#f4f1ea;font-family:system-ui,Arial"><div style="display:grid;grid-template-columns:repeat(2,440px);gap:24px;padding:24px">'
html+=''.join(f'<figure style="margin:0;text-align:center">{m}<figcaption>{c}</figcaption></figure>' for m,c in cells)
open('sheet4.html','w').write(html+'</div></body></html>')
