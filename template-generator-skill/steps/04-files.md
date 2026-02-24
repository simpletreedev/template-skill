# Step: STEP 4 - FILES (OPTIONAL)

## Purpose

Generate document files using Python.

---

## What To Do

### 1. Ask User

"Do you need any **document files** in this template?
I can generate:
   📊 Excel files (.xlsx)
   📄 Word files (.docx)
   📋 PDF files (.pdf)
   📝 Text/CSV/Markdown files

Type 'skip' to continue, or tell me what files you need."

---

### 2. If Skipped

Update state to `skipped`, show skip prompt, return control.

---

### 3. Ask About Structure

- "What folders do you need?"
- "What files in each folder?" (name, type, content description)

---

### 4. Create Folder Structure

```bash
SLUG=$(jq -r '.templateSlug' .template-generator-state.json)
mkdir -p template-${SLUG}/entities/files/storage/{folder-name}/{subfolder}
```

---

### 5. Generate Files with Python

#### Excel Files (.xlsx):

```bash
python3 << 'PYTHON_EOF'
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side

wb = openpyxl.Workbook()
ws = wb.active
ws.title = 'Sheet1'

# Styles
header_font = Font(bold=True, color='FFFFFF')
header_fill = PatternFill(start_color='4472C4', end_color='4472C4', fill_type='solid')
thin_border = Border(
    left=Side(style='thin'), right=Side(style='thin'),
    top=Side(style='thin'), bottom=Side(style='thin')
)

# Add headers based on context
headers = [{Generate appropriate headers for template}]

for col, header in enumerate(headers, 1):
    cell = ws.cell(row=1, column=col, value=header)
    cell.font = header_font
    cell.fill = header_fill
    cell.alignment = Alignment(horizontal='center', vertical='center')
    cell.border = thin_border

# Add sample rows
for row in range(2, 7):
    for col in range(1, len(headers) + 1):
        cell = ws.cell(row=row, column=col)
        cell.border = thin_border

# Add title
ws.insert_rows(1)
ws['A1'] = '{Document Title}'
ws['A1'].font = Font(bold=True, size=14, color='FFFFFF')
ws['A1'].fill = PatternFill(start_color='203864', end_color='203864', fill_type='solid')
ws['A1'].alignment = Alignment(horizontal='center', vertical='center')
ws.merge_cells(f'A1:{chr(64+len(headers))}1')

# Save
wb.save('template-${SLUG}/entities/files/storage/{folder}/{filename}.xlsx')
print('✓ Created')
PYTHON_EOF
```

---

#### Word Files (.docx):

```bash
python3 << 'PYTHON_EOF'
from docx import Document
from docx.shared import Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH

doc = Document()

# Title
title = doc.add_heading('{Document Title}', 0)
title.alignment = WD_ALIGN_PARAGRAPH.CENTER

# Content sections based on template context
doc.add_heading('{Section 1}', 1)
doc.add_paragraph('{Content for section 1}')

doc.add_heading('{Section 2}', 1)
doc.add_paragraph('{Content for section 2}')

# Save
doc.save('template-${SLUG}/entities/files/storage/{folder}/{filename}.docx')
print('✓ Created')
PYTHON_EOF
```

---

#### PDF Files (.pdf):

```bash
python3 << 'PYTHON_EOF'
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

doc = SimpleDocTemplate(
    'template-${SLUG}/entities/files/storage/{folder}/{filename}.pdf',
    pagesize=A4
)

styles = getSampleStyleSheet()
story = []

# Title
title_style = ParagraphStyle(
    'CustomTitle',
    parent=styles['Heading1'],
    fontSize=18,
    textColor=colors.HexColor('#203864'),
    alignment=1
)
story.append(Paragraph('{Document Title}', title_style))
story.append(Spacer(1, 12))

# Content
story.append(Paragraph('{Content for section 1}', styles['Normal']))
story.append(Spacer(1, 12))
story.append(Paragraph('{Content for section 2}', styles['Normal']))

# Build
doc.build(story)
print('✓ Created')
PYTHON_EOF
```

---

#### CSV/Text Files:

```bash
cat > "template-${SLUG}/entities/files/storage/{folder}/{filename}.csv" << 'EOF'
{Header 1},{Header 2},{Header 3}
{Row 1 Col 1},{Row 1 Col 2},{Row 1 Col 3}
EOF
```

---

### 6. Update _manifest.json

```bash
cat > template-${SLUG}/entities/files/_manifest.json << 'EOF'
{
  "version": "1.0",
  "files": {
    "folder-a/file.xlsx": {
      "display_name": "{Display Name}.xlsx",
      "description": "{Description}",
      "is_embedded": false
    }
  }
}
EOF
```

---

### 7. Update State & PAUSE

Update state with file count, show PAUSE prompt.

---

## Notes

- Python will generate appropriate content based on template context
- Adjust headers, sections, and content dynamically
- Error handling: if library not available, inform user and skip

---

## Return Control

Return to main orchestrator → next skill: `05-automations.md`
