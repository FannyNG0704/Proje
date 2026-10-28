# Generates layered cutaway illustrations (oblique projection) as SVG.
import sys
INK="#1d2430"
KX,KY=0.78,0.44          # depth projection: back goes up-right
OX,OY=30,252             # origin (front-bottom-left)
H=170                     # wall height
W=260                     # width of back layer

def P(x,y,d):
    return (OX+x+d*KX, OY-y-d*KY)

def poly(pts,fill,extra=""):
    s=" ".join(f"{a:.1f},{b:.1f}" for a,b in pts)
    return f'<polygon points="{s}" fill="{fill}" stroke="{INK}" stroke-width="1.2" stroke-linejoin="round" {extra}/>'

def shade(hexc,f):
    h=hexc.lstrip('#'); r,g,b=[int(h[i:i+2],16) for i in (0,2,4)]
    r,g,b=[max(0,min(255,int(c*f))) for c in (r,g,b)]
    return f"#{r:02x}{g:02x}{b:02x}"

def box(x0,x1,y0,y1,d0,d1,col,front_extra=""):
    """d0=front depth (smaller), d1=back depth"""
    out=[]
    # top face
    out.append(poly([P(x0,y1,d0),P(x1,y1,d0),P(x1,y1,d1),P(x0,y1,d1)],shade(col,1.08)))
    # right face
    out.append(poly([P(x1,y0,d0),P(x1,y0,d1),P(x1,y1,d1),P(x1,y1,d0)],shade(col,0.82)))
    # front face
    out.append(poly([P(x0,y0,d0),P(x1,y0,d0),P(x1,y1,d0),P(x0,y1,d0)],col,front_extra))
    return out

def front_clip(cid,x0,x1,y0,y1,d):
    pts=[P(x0,y0,d),P(x1,y0,d),P(x1,y1,d),P(x0,y1,d)]
    s=" ".join(f"{a:.1f},{b:.1f}" for a,b in pts)
    return f'<clipPath id="{cid}"><polygon points="{s}"/></clipPath>'

def brick_pattern(x0,x1,y0,y1,d,cid):
    # mortar lines on the front face
    g=[f'<g clip-path="url(#{cid})" stroke="#e9d8cc" stroke-width="2">']
    row=0; y=y0
    while y<y1:
        a=P(x0,y,d); b=P(x1,y,d)
        g.append(f'<line x1="{a[0]:.1f}" y1="{a[1]:.1f}" x2="{b[0]:.1f}" y2="{b[1]:.1f}"/>')
        off=0 if row%2==0 else 20
        x=x0+off
        while x<x1:
            p=P(x,y,d); q=P(x,min(y+17,y1),d)
            g.append(f'<line x1="{p[0]:.1f}" y1="{p[1]:.1f}" x2="{q[0]:.1f}" y2="{q[1]:.1f}"/>')
            x+=40
        y+=17; row+=1
    g.append('</g>'); return g

def badge(n,x,y):
    return [f'<circle cx="{x:.1f}" cy="{y:.1f}" r="11" fill="{INK}"/>',
            f'<text x="{x:.1f}" y="{y+4.2:.1f}" text-anchor="middle" font-size="12" font-weight="700" fill="#fff">{n}</text>']

def legend(items,top=282):
    out=[]; x=20; y=top
    for i,(n,name) in enumerate(items):
        col=i%2; row=i//2
        cx=24+col*200; cy=top+row*22
        out+= [f'<circle cx="{cx}" cy="{cy}" r="8" fill="{INK}"/>',
               f'<text x="{cx}" y="{cy+3.5}" text-anchor="middle" font-size="10" font-weight="700" fill="#fff">{n}</text>',
               f'<text x="{cx+14}" y="{cy+4}" font-size="12.5" fill="{INK}">{name}</text>']
    return out

def svg(body,h=340,title=""):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 {h}" role="img" aria-label="{title}" '
            f'font-family="system-ui,-apple-system,Segoe UI,Roboto,sans-serif">'
            f'<title>{title}</title>'
            f'<rect width="420" height="{h}" fill="#f4f5f7"/>'
            f'<ellipse cx="230" cy="262" rx="190" ry="14" fill="#1d2430" opacity="0.08"/>'
            + "".join(body)+'</svg>')

def layered(layers,title):
    """layers: list back->front of dict(name, t, col, kind, step)"""
    body=[]; defs=[]
    total=sum(L['t'] for L in layers)
    d_back=total
    x1=W; badges=[]
    d=d_back
    for i,L in enumerate(layers):
        d1=d; d0=d-L['t']
        xr=x1
        cid=f"c{i}"
        defs.append(front_clip(cid,0,xr,0,H,d0))
        if L['kind']=='studs':
            # vertical metal profiles only, with insulation between
            if L.get('wool'):
                body+=box(0,xr,0,H,d0+1.5,d1-1.5,"#f2cf63")
                # wool waves
                wv=['<g clip-path="url(#%s)" fill="none" stroke="#d9a93a" stroke-width="1.4">'%f"cw{i}"]
                defs.append(front_clip(f"cw{i}",0,xr,0,H,d0+1.5))
                for yy in range(8,H,16):
                    pts=[]
                    for xx in range(0,int(xr)+1,6):
                        pts.append(P(xx,yy+(4 if (xx//6)%2 else -4),d0+1.5))
                    wv.append('<polyline points="%s"/>'%" ".join(f"{a:.1f},{b:.1f}" for a,b in pts))
                wv.append('</g>'); body+=wv
            sx=10
            while sx<xr-4:
                body+=box(sx,sx+9,0,H,d0,d1,"#a9b4bf")
                sx+=60
        elif L['kind']=='tape':
            for jx in L['joints']:
                body+=box(jx-8,jx+8,0,H,d0,d1,"#f3e6c4")
                body.append('<g stroke="#d8c79c" stroke-width="0.8">'+''.join(
                    f'<line x1="{P(jx-8,yy,d0)[0]:.1f}" y1="{P(jx-8,yy,d0)[1]:.1f}" x2="{P(jx+8,yy+6,d0)[0]:.1f}" y2="{P(jx+8,yy+6,d0)[1]:.1f}"/>' for yy in range(4,H-8,10))+'</g>')
        else:
            extra=""
            body+=box(0,xr,0,H,d0,d1,L['col'])
            if L['kind']=='brick': body+=brick_pattern(0,xr,0,H,d0,cid)
            if L['kind']=='speckle':
                g=[f'<g clip-path="url(#{cid})" fill="{shade(L["col"],0.86)}">']
                import random; random.seed(i*7+3)
                for _ in range(90):
                    px=random.uniform(0,xr); py=random.uniform(0,H)
                    a=P(px,py,d0); g.append(f'<circle cx="{a[0]:.1f}" cy="{a[1]:.1f}" r="{random.uniform(.6,1.5):.1f}"/>')
                g.append('</g>'); body+=g
            if L['kind']=='notched':
                g=[f'<g clip-path="url(#{cid})" stroke="{shade(L["col"],0.75)}" stroke-width="2.2">']
                for yy in range(6,H,9):
                    a=P(0,yy,d0); b=P(xr,yy,d0)
                    g.append(f'<line x1="{a[0]:.1f}" y1="{a[1]:.1f}" x2="{b[0]:.1f}" y2="{b[1]:.1f}"/>')
                g.append('</g>'); body+=g
            if L['kind']=='tiles':
                g=[f'<g clip-path="url(#{cid})" stroke="#c3c9d1" stroke-width="2.4">']
                ts=L.get('size',38)
                yy=0
                while yy<=H:
                    a=P(0,yy,d0); b=P(xr,yy,d0); g.append(f'<line x1="{a[0]:.1f}" y1="{a[1]:.1f}" x2="{b[0]:.1f}" y2="{b[1]:.1f}"/>'); yy+=ts
                xx=0
                while xx<=xr:
                    a=P(xx,0,d0); b=P(xx,H,d0); g.append(f'<line x1="{a[0]:.1f}" y1="{a[1]:.1f}" x2="{b[0]:.1f}" y2="{b[1]:.1f}"/>'); xx+=ts
                g.append('</g>'); body+=g
                # spacers (crosses) at a few joints
                for cx_ in range(int(ts), int(xr), int(ts)):
                    for cy_ in range(int(ts), H, int(ts)):
                        a=P(cx_,cy_,d0)
                        body.append(f'<path d="M{a[0]-4:.1f} {a[1]:.1f}h8M{a[0]:.1f} {a[1]-4:.1f}v8" stroke="{L.get("spacer","#e0483e")}" stroke-width="1.6"/>')
            if L['kind']=='paint':
                pass
        # badge on the revealed strip of this layer (between next layer's edge and this edge)
        nxt = xr - layers[i+1]['step'] if i+1<len(layers) else 0
        bx=(nxt+xr)/2 if i+1<len(layers) else 30
        if L['kind']=='tape': bx=L['joints'][0]
        bpt=P(bx,H*0.5 if i+1<len(layers) else H*0.5,d0)
        badges.append((i+1,bpt))
        d=d0
        if i+1<len(layers): x1=xr-layers[i+1]['step']
    for n,(x,y) in badges: body+=badge(n,x,y)
    body+=legend([(i+1,L['name']) for i,L in enumerate(layers)])
    rows=(len(layers)+1)//2
    return svg(['<defs>'+''.join(defs)+'</defs>']+body, h=282+rows*22, title=title)

ILU={
 'yeso': ("Capas de un enlucido de yeso",[
    dict(name="Ladrillo",t=46,col="#c9785a",kind='brick',step=0),
    dict(name="Guarnecido de yeso",t=14,col="#ddd3c4",kind='speckle',step=75),
    dict(name="Enlucido (acabado fino)",t=6,col="#f3efe8",kind='plain',step=60),
    dict(name="Pintura",t=3,col="#cfdcff",kind='paint',step=60),
 ]),
 'pladur': ("Capas de un tabique de pladur",[
    dict(name="Perfiles y lana mineral",t=40,col="#a9b4bf",kind='studs',wool=True,step=0),
    dict(name="Placa de pladur",t=12,col="#e9ecef",kind='plain',step=100),
    dict(name="Cinta en juntas",t=1.5,col="#f3e6c4",kind='tape',joints=[118],step=0),
    dict(name="Masilla (2–3 manos)",t=3.5,col="#f7f7f5",kind='plain',step=70),
    dict(name="Pintura",t=3,col="#cfdcff",kind='paint',step=55),
 ]),
 'alicatado': ("Capas de un alicatado",[
    dict(name="Pared base",t=40,col="#c4c8ce",kind='speckle',step=0),
    dict(name="Adhesivo con llana dentada",t=9,col="#b7bcc4",kind='notched',step=80),
    dict(name="Azulejo y crucetas",t=10,col="#ffffff",kind='tiles',size=40,step=80),
 ]),
}
for k,(title,layers) in ILU.items():
    open(f"{k}.svg","w").write(layered(layers,title))
print("ok")
