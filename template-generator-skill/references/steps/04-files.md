# Step: STEP 4 - FILES (OPTIONAL)

## Purpose

Add document files to template using Claude's built-in skills (xlsx, docx, pdf).

---

## What To Do

### 0. Initialize Step Variables

```bash
# Load common variables (helpers already loaded by SKILL.md)
init_step
# Now: SLUG, NAME, DESCRIPTION, TIMESTAMP are available
```

---

### 1. Ask User

"Do you need any **document files** in this template?
I can generate:
   📊 Excel files (.xlsx)
   📄 Word files (.docx)
   📋 PDF files (.pdf)

Type 'skip' to continue, or tell me what files you need."

---

### 2. If Skipped

```bash
skip_state 4
echo "╭──────────────────────────────────────╮"
echo "│  📁 FILES STEP SKIPPED               │"
echo "│  No document files added             │"
echo "╰──────────────────────────────────────╯"
read
return 0
```

---

### 3. Setup Directory

```bash
BASE_DIR="template-${SLUG}/entities/files/storage"
ensure_dir "${BASE_DIR}/reports"
ensure_dir "${BASE_DIR}/documents"
```

---

### 4. Ask User About Files

"What files do you need? Tell me:
- File type (Excel/Word/PDF)
- File name and location
- Content/data

Or say 'samples' to generate example files (budget.xlsx, guide.docx, summary.pdf)."

---

### 5. Generate Files Using Skills

#### Excel (.xlsx) - Use xlsx skill
```
"Create ${BASE_DIR}/reports/budget.xlsx:
Title: Campaign Budget Tracker
Columns: Campaign, Category, Budget, Spent, Remaining
Rows:
- Summer Sale, Social Media, 5000, 3200, 1800
- Q2 Launch, Email Marketing, 3000, 2800, 200
- Brand Awareness, PPC Ads, 8000, 6500, 1500"
```

#### Word (.docx) - Use docx skill
```
"Create ${BASE_DIR}/documents/guide.docx:
Title: User Guide
Section: Introduction - Welcome to the template
Section: Getting Started - 3 bullet points: Configure settings, Add campaigns, Track performance
Section: Tips - Update budget regularly, Review weekly, Use automations"
```

#### PDF (.pdf) - Use pdf skill
```
"Create ${BASE_DIR}/reports/summary.pdf:
Title: Campaign Summary Report
Section: Overview - Total campaigns: 3, Budget: $16,000, Spent: $12,500
Section: Top Performers - Summer Sale (64% utilized), Brand Awareness (81% utilized)
Section: Recommendations - Continue investing in Social Media, Optimize PPC spend"
```

#### Optional: CSV/MD/TXT (only if user requests)
```bash
# CSV (if requested)
cat > "${BASE_DIR}/exports/data.csv" << 'EOF'
Campaign,Category,Budget,Spent
Summer Sale,Social Media,5000,3200
EOF

# Markdown (if requested)
cat > "${BASE_DIR}/documents/README.md" << 'EOF'
# Template Name

## Overview
Template description here.

## Features
- Feature 1
- Feature 2
EOF
```

---

### 6. Update _manifest.json

```bash
FILE_COUNT=$(find "${BASE_DIR}" -type f | wc -l)

cat > "template-${SLUG}/entities/files/_manifest.json" << EOF
{
  "version": "1.0",
  "files": {
$(find "${BASE_DIR}" -type f | sed "s|${BASE_DIR}/||" | while read file; do
  echo "    \"${file}\": {"
  echo "      \"display_name\": \"$(basename ${file})\","
  echo "      \"description\": \"Generated file\","
  echo "      \"is_embedded\": false"
  echo "    },"
done | sed '$ s/,$//')
  }
}
EOF

echo "✓ Manifest updated with ${FILE_COUNT} files"
```

---

### 7. Update State & PAUSE

```bash
jq --argjson count ${FILE_COUNT} \
   '.steps["4_FILES"].status = "completed" | .summary.files = $count | .lastUpdated = "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"' \
   .template-generator-state.json > .tmp && mv .tmp .template-generator-state.json

echo ""
echo "╭──────────────────────────────────────────╮"
echo "│  ✅ FILES STEP COMPLETED                 │"
echo "╜──────────────────────────────────────────╤"
echo "│  Files created: ${FILE_COUNT}             │"
echo "│  📁 Location: entities/files/storage/    │"
echo "│                                          │"
echo "│  Press Enter to continue...              │"
echo "╰──────────────────────────────────────────╯"
echo ""
read
```

---

## Notes

**Priority Files (always offer first):**
- ✅ Excel (.xlsx) - For data tables, budgets, trackers
- ✅ Word (.docx) - For documents, guides, reports
- ✅ PDF (.pdf) - For finalized reports, summaries

**Optional Files (only if requested):**
- CSV - Simple data export
- Markdown - Documentation
- Text - Plain notes

**Best Practices:**
- Use Claude skills (xlsx, docx, pdf) for best results
- Only create CSV/MD/TXT if user explicitly requests
- Always update _manifest.json with created files
- Keep file sizes reasonable (< 10MB each)

---

## Return Control

Return to main orchestrator → next step: `05-automations.md`
