def mark(bg,fg,lc,s,W=34,H=56,grid=False,size=(440,260)):
    pad=22; t=pad; b=pad+H; m=t+H/2
    x0=pad; x1=x0+W; x2=x1+W; x3=x2+W
    a=W*0.3; rx=x3-(x2+a); ry=H/2
    hd=(f'M{x0} {t} V{b} M{x0} {m} H{x1} '
        f'M{x2} {b} V{t} H{x2+a} A{rx} {ry} 0 0 1 {x2+a} {b} H{x2}')
    l=f'M{x1} {t} V{b} H{x2}'
    vbw=x3+pad; vbh=b+pad; g=''
    if grid:
        g='<g stroke="#e07a3a" stroke-width="0.4" opacity=".8">'
        for x in (x0,x1,x2,x3): g+=f'<line x1="{x}" y1="{t-8}" x2="{x}" y2="{b+8}"/>'
        for y in (t,m,b): g+=f'<line x1="{x0-8}" y1="{y}" x2="{x3+8}" y2="{y}"/>'
        g+='</g>'
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{size[0]}" height="{size[1]}" viewBox="0 0 {vbw} {vbh}" style="background:{bg};border-radius:18px">'
            f'<path d="{hd}" fill="none" stroke="{fg}" stroke-width="{s}" stroke-linecap="square" stroke-linejoin="miter"/>'
            f'<path d="{l}" fill="none" stroke="{lc}" stroke-width="{s}" stroke-linecap="square" stroke-linejoin="miter"/>{g}</svg>')
G,C,O,O2='#2f4a36','#f3efe6','#e07a3a','#b8541a'
cells=[(mark(G,C,C,7,grid=True),'Сітка: D тепер доходить до лінії'),
       (mark(G,C,O,7),'L помаранчева (світлий помаранчевий)'),
       (mark(G,C,O2,7),'L темніший помаранчевий'),
       (mark(C,G,O2,7),'на світлому фоні')]
html='<html><body style="margin:0;background:#f4f1ea;font-family:system-ui,Arial"><div style="display:grid;grid-template-columns:repeat(2,440px);gap:24px;padding:24px">'
html+=''.join(f'<figure style="margin:0;text-align:center">{m}<figcaption>{c}</figcaption></figure>' for m,c in cells)
open('sheet5.html','w').write(html+'</div></body></html>')
