from pathlib import Path
import html, json
from reportlab.platypus import SimpleDocTemplate,Paragraph,Spacer,PageBreak,Image,KeepTogether
from reportlab.lib.styles import getSampleStyleSheet,ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
root=Path(__file__).resolve().parents[2]
out=root/'docs/assessment';out.mkdir(parents=True,exist_ok=True)
live='https://orbit-ai-setup-assistant-aristote.netlify.app'
repo='https://github.com/Aristote-code/orbit-ai-setup-assistant'
pages=json.loads((out/'content.json').read_text())
styles=getSampleStyleSheet()
styles.add(ParagraphStyle(name='DocTitle',fontName='Helvetica-Bold',fontSize=25,leading=29,textColor=colors.HexColor('#20242d'),spaceAfter=17))
styles.add(ParagraphStyle(name='DocHeading',fontName='Helvetica-Bold',fontSize=11.5,leading=15,textColor=colors.HexColor('#252c38'),spaceBefore=13,spaceAfter=6))
styles.add(ParagraphStyle(name='DocBody',fontName='Helvetica',fontSize=9.3,leading=13.6,textColor=colors.HexColor('#535d6b'),spaceAfter=7))
styles.add(ParagraphStyle(name='DocLead',fontName='Helvetica-Bold',fontSize=16,leading=21,textColor=colors.HexColor('#375dfb'),spaceAfter=10))
styles.add(ParagraphStyle(name='DocBullet',parent=styles['DocBody'],leftIndent=11,firstLineIndent=-8,spaceAfter=6))
W,H=595.28,841.89
story=[]
def esc(t):return html.escape(t)
htmlpages=[]
for num,title,blocks in pages:
 story.append(Paragraph(num+' / '+esc(title),styles['DocTitle']))
 ht=['<section><div class="eyebrow">'+num+' / ASSESSMENT DOCUMENTATION</div><h1>'+esc(title)+'</h1>']
 for typ,content in blocks:
  if typ=='image':
   path=out/content
   img=Image(str(path));scale=min(480/img.imageWidth,210/img.imageHeight);img.drawWidth=img.imageWidth*scale;img.drawHeight=img.imageHeight*scale;story.extend([Spacer(1,6),img,Spacer(1,9)])
   ht.append('<figure><img src="'+content+'" alt="Corrected Orbit review flow"><figcaption>Corrected review flow: wider working area and included-item preview.</figcaption></figure>')
  elif typ=='link':
   label,url=content;story.append(Paragraph('<a href="'+url+'" color="#375dfb">'+esc(label)+'</a>',styles['DocBody']));ht.append('<p><a href="'+url+'">'+esc(label)+'</a></p>')
  else:
   text=esc(content);st={'h':'DocHeading','lead':'DocLead','p':'DocBody','b':'DocBullet'}[typ]
   story.append(Paragraph(('&#8226; '+text) if typ=='b' else text,styles[st]));tag={'h':'h2','lead':'p class="lead"','p':'p','b':'p class="bullet"'}[typ];ht.append('<'+tag+'>'+text+'</'+tag.split()[0]+'>')
 ht.append('</section>');htmlpages.append('\n'.join(ht))
 story.append(PageBreak())
story.pop()
def page_decoration(c,d):
 c.setStrokeColor(colors.HexColor('#e7eaf0'));c.line(48,39,W-48,39);c.setFont('Helvetica',8);c.setFillColor(colors.HexColor('#9299a4'));c.drawString(48,25,'ORBIT / UX ASSESSMENT / 18 OCTOBER 2026');c.drawRightString(W-48,25,str(d.page))
pdf=out/'Orbit-Assessment-Documentation.pdf'
SimpleDocTemplate(str(pdf),pagesize=(W,H),rightMargin=48,leftMargin=48,topMargin=44,bottomMargin=53,title='Orbit - UX Assessment Documentation',author='Orbit assessment collaboration').build(story,onFirstPage=page_decoration,onLaterPages=page_decoration)
css='''*{box-sizing:border-box}body{margin:0;background:#f6f7f9;color:#303743;font:15px/1.7 system-ui,sans-serif}nav{max-width:1000px;margin:28px auto;padding:0 25px;display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap}a{color:#375dfb}section{max-width:1000px;margin:24px auto;padding:46px 58px;background:#fff;border:1px solid #e6e9ef;border-radius:12px}.eyebrow{font-size:10px;letter-spacing:1.5px;color:#8d96a6}h1{font-size:31px;line-height:1.2;margin:12px 0 27px}h2{font-size:17px;color:#333d4d;margin:27px 0 8px}p{color:#657083}.lead{font-size:23px;color:#375dfb;font-weight:600}.bullet{padding-left:17px;position:relative}.bullet:before{content:'•';position:absolute;left:0;color:#375dfb}figure{margin:25px 0}img{width:100%;border:1px solid #e5e9f0;border-radius:9px}figcaption{font-size:11px;color:#8d96a6}@media(max-width:650px){section{margin:12px;padding:27px 23px}h1{font-size:26px}}@media print{body{background:white}nav{display:none}section{border:0;page-break-before:always;margin:0;padding:0;border-radius:0;max-width:none}section:first-of-type{page-break-before:auto}img{max-height:340px;object-fit:contain}}'''
(out/'index.html').write_text('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Orbit - Assessment documentation</title><style>'+css+'</style></head><body><nav><strong>Orbit / Assessment handoff</strong><div><a href="Orbit-Assessment-Documentation.pdf">Download PDF</a> &nbsp; <a href="'+live+'">Open prototype</a></div></nav>'+''.join(htmlpages)+'</body></html>')
(out/'content.json').write_text(json.dumps(pages,indent=2))
print(pdf)
