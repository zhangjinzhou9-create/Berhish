from pathlib import Path
import html
import re

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import (
    Image,
    KeepTogether,
    ListFlowable,
    ListItem,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont


ROOT = Path(__file__).resolve().parents[1]
REPORT = ROOT / "report.md"
OUTPUT = ROOT / "CampusFlow_Report.pdf"


def register_fonts():
    # Embed a Windows CJK font so the Japanese name stays readable in the final PDF.
    font_path = Path("C:/Windows/Fonts/NotoSansJP-VF.ttf")
    if not font_path.exists():
        font_path = Path("C:/Windows/Fonts/meiryo.ttc")
    pdfmetrics.registerFont(TTFont("CampusSans", str(font_path)))


def styles():
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle(
            "title",
            parent=base["Title"],
            fontName="CampusSans",
            fontSize=20,
            leading=26,
            textColor=colors.HexColor("#111827"),
            spaceAfter=12,
        ),
        "h2": ParagraphStyle(
            "h2",
            parent=base["Heading2"],
            fontName="CampusSans",
            fontSize=14,
            leading=18,
            textColor=colors.HexColor("#111827"),
            spaceBefore=12,
            spaceAfter=8,
        ),
        "h3": ParagraphStyle(
            "h3",
            parent=base["Heading3"],
            fontName="CampusSans",
            fontSize=11,
            leading=15,
            textColor=colors.HexColor("#1f2937"),
            spaceBefore=8,
            spaceAfter=6,
        ),
        "body": ParagraphStyle(
            "body",
            parent=base["BodyText"],
            fontName="CampusSans",
            fontSize=9.2,
            leading=13,
            textColor=colors.HexColor("#1f2937"),
            spaceAfter=5,
        ),
        "code": ParagraphStyle(
            "code",
            parent=base["Code"],
            fontName="Courier",
            fontSize=7.7,
            leading=10,
            backColor=colors.HexColor("#f3f4f6"),
            borderPadding=5,
            leftIndent=4,
            rightIndent=4,
            spaceAfter=6,
        ),
        "caption": ParagraphStyle(
            "caption",
            parent=base["BodyText"],
            fontName="CampusSans",
            fontSize=8,
            leading=10,
            textColor=colors.HexColor("#4b5563"),
            alignment=1,
            spaceAfter=8,
        ),
    }


def clean_inline(text):
    text = html.escape(text)
    text = re.sub(r"\*\*(.*?)\*\*", r"<b>\1</b>", text)
    text = re.sub(r"`([^`]+)`", r"<font face='Courier'>\1</font>", text)
    return text


def scale_image(path, max_width=15.8 * cm, max_height=10.0 * cm):
    image = Image(str(path))
    width, height = image.imageWidth, image.imageHeight
    scale = min(max_width / width, max_height / height, 1)
    image.drawWidth = width * scale
    image.drawHeight = height * scale
    return image


def flush_table(rows, story, style_map):
    if not rows:
        return
    col_count = len(rows[0])
    available_width = 16.2 * cm
    widths = [available_width / col_count] * col_count
    table = Table(rows, colWidths=widths, repeatRows=1)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#111827")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, -1), "CampusSans"),
                ("FONTSIZE", (0, 0), (-1, -1), 7.5),
                ("LEADING", (0, 0), (-1, -1), 9),
                ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#d1d5db")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f9fafb")]),
                ("LEFTPADDING", (0, 0), (-1, -1), 4),
                ("RIGHTPADDING", (0, 0), (-1, -1), 4),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]
        )
    )
    story.append(table)
    story.append(Spacer(1, 6))


def build_story():
    style_map = styles()
    story = []
    lines = REPORT.read_text(encoding="utf-8").splitlines()
    in_code = False
    code_lines = []
    table_rows = []
    bullet_items = []

    def flush_bullets():
        nonlocal bullet_items
        if bullet_items:
            story.append(ListFlowable(bullet_items, bulletType="bullet", leftIndent=14))
            story.append(Spacer(1, 4))
            bullet_items = []

    for raw in lines:
        line = raw.rstrip()
        if line.startswith("```"):
            if in_code:
                story.append(Paragraph("<br/>".join(code_lines), style_map["code"]))
                code_lines = []
                in_code = False
            else:
                flush_table(table_rows, story, style_map)
                table_rows = []
                flush_bullets()
                in_code = True
            continue

        if in_code:
            code_lines.append(line.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))
            continue

        if not line:
            flush_table(table_rows, story, style_map)
            table_rows = []
            flush_bullets()
            story.append(Spacer(1, 4))
            continue

        image_match = re.match(r"!\[(.*?)\]\((.*?)\)", line)
        if image_match:
            flush_table(table_rows, story, style_map)
            table_rows = []
            flush_bullets()
            image_path = ROOT / image_match.group(2)
            if image_path.exists():
                story.append(KeepTogether([scale_image(image_path), Paragraph(image_match.group(1), style_map["caption"])]))
            continue

        if line.startswith("|") and line.endswith("|"):
            cells = [Paragraph(clean_inline(cell.strip()), style_map["body"]) for cell in line.strip("|").split("|")]
            if "---" not in line:
                table_rows.append(cells)
            continue
        else:
            flush_table(table_rows, story, style_map)
            table_rows = []

        if line.startswith("# "):
            flush_bullets()
            story.append(Paragraph(clean_inline(line[2:]), style_map["title"]))
            continue
        if line.startswith("## "):
            flush_bullets()
            story.append(Paragraph(clean_inline(line[3:]), style_map["h2"]))
            continue
        if line.startswith("### "):
            flush_bullets()
            story.append(Paragraph(clean_inline(line[4:]), style_map["h3"]))
            continue
        if line.startswith("- "):
            bullet_items.append(ListItem(Paragraph(clean_inline(line[2:]), style_map["body"])))
            continue

        flush_bullets()
        story.append(Paragraph(clean_inline(line), style_map["body"]))

    flush_table(table_rows, story, style_map)
    flush_bullets()
    return story


def add_footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("CampusSans", 8)
    canvas.setFillColor(colors.HexColor("#6b7280"))
    canvas.drawString(1.6 * cm, 1.1 * cm, "Campus Flow - ZHU FUXIN / M25W7195")
    canvas.drawRightString(A4[0] - 1.6 * cm, 1.1 * cm, f"Page {doc.page}")
    canvas.restoreState()


def main():
    register_fonts()
    doc = SimpleDocTemplate(
        str(OUTPUT),
        pagesize=A4,
        rightMargin=1.6 * cm,
        leftMargin=1.6 * cm,
        topMargin=1.5 * cm,
        bottomMargin=1.7 * cm,
    )
    doc.build(build_story(), onFirstPage=add_footer, onLaterPages=add_footer)
    print(OUTPUT)


if __name__ == "__main__":
    main()
