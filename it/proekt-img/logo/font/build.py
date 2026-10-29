# Шрифт-логотип HLD CASA: ті самі розміри, що в кресленні (SVG 356x80), 1 одиниця SVG = 10 одиниць шрифту
import pathops, ttfautohint
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.pens.cu2quPen import Cu2QuPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
K=0.5522847498
def rect(x0,y0,x1,y1):
    p=pathops.Path(); p.moveTo(x0,y0); p.lineTo(x1,y0); p.lineTo(x1,y1); p.lineTo(x0,y1); p.close(); return p
def arc_pts(cx,cy,rx,ry,quads):
    # quads: list of (start_angle_deg) quarter arcs going clockwise in screen coords; returns cubic segments
    import math
    segs=[]
    for a in quads:
        a0=math.radians(a); a1=math.radians(a+90)
        p0=(cx+rx*math.cos(a0),cy+ry*math.sin(a0)); p3=(cx+rx*math.cos(a1),cy+ry*math.sin(a1))
        c1=(p0[0]-K*rx*math.sin(a0),p0[1]+K*ry*math.cos(a0)); c2=(p3[0]+K*rx*math.sin(a1),p3[1]-K*ry*math.cos(a1))
        segs.append((p0,c1,c2,p3))
    return segs
def halfring(cx,cy,rxo,ryo,rxi,ryi,side):
    # side: 'right','left','top' — half of an elliptical ring
    start={'right':-90,'left':90,'top':180}[side]
    outer=arc_pts(cx,cy,rxo,ryo,[start,start+90])
    inner=arc_pts(cx,cy,rxi,ryi,[start,start+90])
    p=pathops.Path(); p.moveTo(*outer[0][0])
    for s in outer: p.cubicTo(*s[1],*s[2],*s[3])
    # back along inner, reversed
    end=inner[-1][3]; p.lineTo(*end)
    for s in reversed(inner): p.cubicTo(*s[2],*s[1],*s[0])
    p.close(); return p
def union(*ps):
    out=pathops.Path()
    b=pathops.OpBuilder()
    for q in ps: b.add(q,pathops.PathOp.UNION)
    return b.resolve()
def circle(cx,cy,r):
    import math
    segs=arc_pts(cx,cy,r,r,[0,90,180,270]); p=pathops.Path(); p.moveTo(*segs[0][0])
    for s in segs: p.cubicTo(*s[1],*s[2],*s[3])
    p.close(); return p
G={  # name: (unicode, origin_x_svg, advance_svg, path in SVG coords)
 'H':(0x48,0,40,union(rect(0,0,12,80),rect(12,34,40,46))),
 'L':(0x4C,40,40,union(rect(40,0,52,80),rect(52,68,92,80))),
 'eyeup':(0xE000,80,0,circle(66,22,6)),
 'eyedn':(0xE001,80,0,circle(66,40,6)),
 'D':(0x44,80,52,union(rect(80,0,92,80),rect(92,0,98,12),rect(92,68,98,80),halfring(98,40,34,40,22,28,'right'))),
 'C':(0x43,156,52,union(halfring(184,48,28,32,16,20,'left'),rect(184,16,194,28),rect(184,68,194,80))),
 'A':(0x41,0,52,None),
 'S':(0x53,260,52,union(rect(279,16,298,28),halfring(279,35,19,19,7,7,'left'),rect(279,42,285,54),halfring(285,61,19,19,7,7,'right'),rect(266,68,285,80))),
}
A=union(rect(208,48,220,80),rect(240,48,252,80),halfring(230,48,22,32,10,20,'top'),rect(208,48,252,60))
G['A']=(0x41,208,52,A)
fb=FontBuilder(1000,isTTF=True)
order=['.notdef','space']+list(G)
fb.setupGlyphOrder(order)
fb.setupCharacterMap({0x20:'space',**{v[0]:k for k,v in G.items()}})
glyphs={}; metrics={}
for name in ['.notdef','space']:
    pen=TTGlyphPen(None); glyphs[name]=pen.glyph(); metrics[name]=(300,0)
for name,(u,ox,adv,path) in G.items():
    pen=TTGlyphPen(None)
    tp=TransformPen(Cu2QuPen(pen,max_err=1,reverse_direction=True),(10,0,0,-10,-ox*10,800))
    path.draw(tp)
    glyphs[name]=pen.glyph(); metrics[name]=(adv*10,0)
fb.setupGlyf(glyphs)
for n,g in glyphs.items():
    g.recalcBounds(fb.font['glyf']) if hasattr(g,'recalcBounds') else None
fb.setupHorizontalMetrics({n:(metrics[n][0],(glyphs[n].xMin if hasattr(glyphs[n],'xMin') and glyphs[n].numberOfContours else 0)) for n in order})
fb.setupHorizontalHeader(ascent=800,descent=0)
fb.setupNameTable({'familyName':'HLD Casa Logo','styleName':'Regular'})
fb.setupOS2(sTypoAscender=800,sTypoDescender=0,sTypoLineGap=0,usWinAscent=800,usWinDescent=0,sCapHeight=800,sxHeight=640,fsType=0)
fb.setupPost(); fb.setupDummyDSIG() if hasattr(fb,'setupDummyDSIG') else None
fb.save('raw.ttf')
ttfautohint.ttfautohint(in_file='raw.ttf',out_file='hldcasa.ttf',windows_compatibility=True,no_info=True)
f=TTFont('hldcasa.ttf'); f.flavor='woff2'; f.save('hldcasa.woff2')
import os; print({p:os.path.getsize(p) for p in ['raw.ttf','hldcasa.ttf','hldcasa.woff2']})
