# Step: STEP 3 - DOCUMENTS (OPTIONAL)

## Purpose

Add document templates (wiki pages, guides, meeting notes).

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

"Do you need any **documents** in this template?
Documents are markdown/text files for documentation, guides, or notes.

Type 'skip' to continue, or tell me how many documents you need."

---

### 2. If User Skips

```bash
skip_state 3 "DOCUMENTS"
```

Show skip prompt and return control.

---

### 3. For EACH Document, Ask:

- "Document title?"
- "What's this document for? (brief description)"
- "What content should be included? (I'll help structure it)"

---

### 4. Create Document Data File

```bash
DOC_KEY="{doc-key}"

ensure_dir "template-${SLUG}/entities/documents/data/${DOC_KEY}"

cat > template-${SLUG}/entities/documents/data/${DOC_KEY}/data.json << 'EOF'
{
  "key": "doc-${DOC_KEY}",
  "title": "{Document Title}",
  "description": "{Document Description}",
  "content": "# {Document Title}\n\n{Markdown content}"
}
EOF
```

---

### 5. Update _documents.json

```bash
add_to_index "${SLUG}" "entities/documents/_documents.json" "doc-${DOC_KEY}" "{Doc Title}" "{Description}" "data/doc-${DOC_KEY}/data.json"
```

---

### 6. Update State File

```bash
DOC_COUNT=$(get_count "${SLUG}" "entities/documents/_documents.json" "documents")
update_state 3 "DOCUMENTS" "documents" ${DOC_COUNT}
```

---

### 7. Show PAUSE Prompt

```
✅ Documents are ready!

📊 We've added:
   • {count} document templates

📍 What's next: Files & Attachments (optional)
   This is for organizing files in folders - like reports, templates, images.
   Also optional - only if you need file management.

What's next?
• Add files to your template? (say "continue" or describe what files)
• Skip files for now? (say "skip")
• Want to adjust the documents? (say "go back")

What works for you? 📁
```

**⚠️ PAUSE HERE - WAIT FOR USER RESPONSE**

---

## Data Format References

See `../references/template-structure.md` for complete document structure.

---

## Return Control

After user says "continue", return to main orchestrator.
Main orchestrator will load next step: `04-files.md`

If user says "skip", this is already handled above.
