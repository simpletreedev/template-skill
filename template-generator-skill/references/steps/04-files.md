# Step: STEP 4 - FILES (OPTIONAL)

## Purpose

Add document files to template using Claude's built-in skills (xlsx, docx, pdf).

---

## What To Do

### 1. Ask User

Use `templates/common-user-prompts.md` → Files

---

### 2. If User Skips

```bash
skip_state 4
```

**Show skip prompt:**
Use `templates/common-responses.md` → Files

---

### 3. Setup Directory

```bash
BASE_DIR="template-${SLUG}/entities/files/storage"
ensure_dir "${BASE_DIR}/reports"
ensure_dir "${BASE_DIR}/documents"
```

---

### 4. For EACH File, Gather Requirements

**Ask user:**

```
What file do you need?

Tell me:

**1. File type** - Excel, Word, or PDF?
**2. File name** - What should it be called?
**3. Purpose** - What will this file be used for?
**4. Content** - What data/information should be included?

Or say 'samples' if you want me to create some example files to get you started.
```

**Gather information FIRST, don't create anything yet.**

---

### 5. Show Preview (BEFORE Creating)

```
Perfect! Here's what I'll create:

📄 **{File Name}** ({type})
   Location: {reports/documents}/
   Purpose: {purpose}

   Content preview:
   {Summary of what will be included}

This file will {benefit/use case}.

Ready to create this file? (say **"yes"** to proceed)
```

---

### 6. Generate Files Using Skills

#### Excel (.xlsx) - Use xlsx skill

```
Create ${BASE_DIR}/reports/{filename}.xlsx:
Title: {Sheet Title}
Columns: {col1}, {col2}, {col3}, ...
Rows:
- {row1 data}
- {row2 data}
```

#### Word (.docx) - Use docx skill

```
Create ${BASE_DIR}/documents/{filename}.docx:
Title: {Document Title}
Section: {Section Name} - {Content}
Section: {Section Name} - {Content}
```

#### PDF (.pdf) - Use pdf skill

```
Create ${BASE_DIR}/reports/{filename}.pdf:
Title: {Document Title}
Section: {Section Name} - {Content}
Section: {Section Name} - {Content}
```

#### Optional: CSV/MD/TXT (only if user requests)

```bash
# CSV (if requested)
cat > "${BASE_DIR}/exports/data.csv" << 'EOF'
Column1,Column2,Column3
value1,value2,value3
EOF

# Markdown (if requested)
cat > "${BASE_DIR}/documents/README.md" << 'EOF'
# {Title}

## Overview
{Content}

## Details
{More content}
EOF
```

---

### 7. Update \_manifest.json

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
```

---

### 8. Update State & Show Completion

```bash
update_step_state 4 "files" "entities/files/_manifest.json"
```

**Show completion prompt:**
Use `templates/common-responses.md` → Files

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
- Always update \_manifest.json with created files
- Keep file sizes reasonable (< 10MB each)

---

## Return Control

After user says "continue", return to main orchestrator.
Main orchestrator will load next step: `05-automations.md`

If user says "skip", this is already handled above.
