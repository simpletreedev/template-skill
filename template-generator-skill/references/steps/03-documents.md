# Step: STEP 3 - DOCUMENTS (OPTIONAL)

## Purpose

Add document templates (wiki pages, guides, meeting notes).

---

## What To Do

### 1. Ask User

"Do you need any **documents** in this template?
Documents are markdown/text files for documentation, guides, or notes.

Type 'skip' to continue, or tell me how many documents you need."

---

### 2. If User Skips

```bash
jq '.currentStep = 3 | .steps["3_DOCUMENTS"].status = "skipped" | .lastUpdated = "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"' \
  .template-generator-state.json > .tmp && mv .tmp .template-generator-state.json
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
SLUG=$(jq -r '.templateSlug' .template-generator-state.json)
DOC_KEY="{doc-key}"

mkdir -p template-${SLUG}/entities/documents/data/${DOC_KEY}

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
jq --arg key "doc-${DOC_KEY}" \
   --arg title "{Doc Title}" \
   --arg desc "{Description}" \
   '.documents += [{"key": $key, "title": $title, "description": $desc, "file": "data/doc-'${DOC_KEY}'/data.json", "order": (.documents | length)}]' \
   template-${SLUG}/entities/documents/_documents.json > .tmp && mv .tmp template-${SLUG}/entities/documents/_documents.json
```

---

### 6. Update State File

```bash
DOC_COUNT=$(jq '.documents | length' template-${SLUG}/entities/documents/_documents.json)

jq '.currentStep = 3 | .steps["3_DOCUMENTS"].status = "completed" | .summary.documents = '${DOC_COUNT}' | .lastUpdated = "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"' \
  .template-generator-state.json > .tmp && mv .tmp .template-generator-state.json
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
