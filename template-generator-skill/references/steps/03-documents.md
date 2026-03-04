# Step: STEP 3 - DOCUMENTS (OPTIONAL)

## Purpose

Add document templates (wiki pages, guides, meeting notes).

---

## What To Do

### 1. Ask User

Use `templates/common-user-prompts.md` → Documents

---

### 2. If User Skips

```bash
skip_state 3
```

**Show skip prompt:**
Use `templates/common-responses.md` → Documents

---

### 3. For EACH Document, Gather Requirements

**Ask user:**

```
Let's create your document: **{Document Title}**

**1. What's this document for?** (brief description)

**2. What content should be included?** (I'll help structure it nicely)

📝 What would you like to start with? (or say **"you decide"** to let me design the best setup)
```

**Gather information FIRST, don't create anything yet.**

---

### 4. Show Preview (BEFORE Creating)

```
Perfect! Here's what I'll create:

📄 **{Document Title}**
   {Description}

   Content preview:
   {First few lines or summary of content}

This document will {purpose/benefit}.

Ready to create this document? (say **"yes"** to proceed)
```

---

### 5. Create Document Data File

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

### 6. Update \_documents.json

```bash
add_to_index "${SLUG}" "entities/documents/_documents.json" "doc-${DOC_KEY}" "{Doc Title}" "{Description}" "data/doc-${DOC_KEY}/data.json"
```

---

### 7. After Completion

```bash
update_step_state 3 "documents" "entities/documents/_documents.json"
```

**Show completion prompt:**
Use `templates/common-responses.md` → Documents

---

## Data Format References

See `../references/template-structure.md` for complete document structure.

---

## Return Control

After user says "continue", return to main orchestrator.
Main orchestrator will load next step: `04-files.md`

If user says "skip", this is already handled above.
