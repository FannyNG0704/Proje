def mark(bg,fg,lc,s=7,W=34,H=56,grid=False,size=(440,260),rad=18,bgfill=True):
    pad=22; t=pad; b=pad+H; m=t+H/2; h=s/2
    x0=pad; x1=x0+W; x2=x1+W; x3=x2+W
    a=W*0.3; rx=x3-(x2+a); ry=H/2
    hd=(f'M{x0} {t} V{b} M{x0} {m} H{x1} '
        f'M{x2} {b} V{t} H{x2+a} A{rx} {ry} 0 0 1 {x2+a} {b} H{x2}')
    # L як заливка: ніжка + низ, низ закінчується рівно на лівому краю ніжки D
    L=(f'<rect x="{x1-h}" y="{t-h}" width="{s}" height="{H+s}" fill="{lc}"/>'
       f'<rect x="{x1-h}" y="{b-h}" width="{(x2-h)-(x1-h)}" height="{s}" fill="{lc}"/>')
    vbw=x3+pad; vbh=b+pad; g=''
    if grid:
        g='<g stroke="#e07a3a" stroke-width="0.4" opacity=".8">'
        for x in (x0,x1,x2,x3): g+=f'<line x1="{x}" y1="{t-8}" x2="{x}" y2="{b+8}"/>'
        for y in (t,m,b): g+=f'<line x1="{x0-8}" y1="{y}" x2="{x3+8}" y2="{y}"/>'
        g+='</g>'
    st=f' style="background:{bg};border-radius:{rad}px"' if bgfill else ''
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{size[0]}" height="{size[1]}" viewBox="0 0 {vbw} {vbh}"{st}>'
            f'<path d="{hd}" fill="none" stroke="{fg}" stroke-width="{s}" stroke-linecap="square" stroke-linejoin="miter"/>{L}{g}</svg>')
if __name__=='__main__':
    G,C,O2='#2f4a36','#f3efe6','#b8541a'
    cells=[(mark(G,C,O2,grid=True),'Сітка'),(mark(G,C,O2),'L закінчується там, де починається D'),
           (mark(C,G,O2),'на світлому фоні'),(mark(G,C,'#e07a3a'),'світліший помаранчевий')]
    html='<html><body style="margin:0;background:#f4f1ea;font-family:system-ui,Arial"><div style="display:grid;grid-template-columns:repeat(2,440px);gap:24px;padding:24px">'
    html+=''.join(f'<figure style="margin:0;text-align:center">{m}<figcaption>{c}</figcaption></figure>' for m,c in cells)
    open('sheet6.html','w').write(html+'</div></body></html>')
