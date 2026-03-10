# Step 3: Documents (Optional)

## What We're Creating

Add document templates like wiki pages, guides, and meeting notes to provide context and knowledge base for your workflow.

## Preview

```
📄 {Document Title}
├── Description: {brief description}
└── Content: {markdown content}
```

Each document provides valuable information or templates for users.

## Let's Create This

### Step 0: Set up context

```bash
# Validate session file and get template path
SESSION_ID="${CLAUDE_SESSION_ID:-${SESSION_ID:-123}}"
SESSION_FILE="$(dirname "$(pwd)")/sid-${SESSION_ID}"

if [[ ! -f "$SESSION_FILE" ]]; then
    echo "❌ Error: Session file not found: sid-${SESSION_ID}"
    echo "   Please run: bash scripts/quick-init.sh <slug> <name> <description>"
    exit 1
fi

# Read and verify template path
export TEMPLATE_DIR=$(cat "$SESSION_FILE")
echo "📍 Template: $TEMPLATE_DIR"
```

### Step 1: Ask User

```
Documents are great for guides, meeting notes, process docs, and wikis. 📄

Would you like to add any documents to your template?

👉 Continue to add documents
⏭️ Skip documents
```

### Step 2: If User Skips

```bash
python3 scripts/core.py skip 3
```

**Show skip response:**

```
⏭️ Documents skipped

📍 What's next: Files (optional)
Great for attaching Excel sheets, Word docs, reports.

👉 Continue to add files
⏭️ Skip files
```

### Step 3: For EACH Document, Gather Requirements

```
Let's create your document: **{Document Title}**

**1. What's this document for?** (brief description)

**2. What content should be included?** (I'll help structure it nicely)

📝 What would you like to start with? (or say **"you decide"** to let me design the best setup)
```

**Gather information FIRST, don't create anything yet.**

### Step 4: Show Preview (BEFORE Creating)

```
Perfect! Here's what I'll create:

📄 **{Document Title}**
   {Description}

   Content preview:
   {First few lines or summary of content}

This document will {purpose/benefit}.

Ready to create this document? (say **"yes"** to proceed)
```

### Step 5: Create Document Data File

```bash
DOC_KEY="{doc-key}"

# Create directory
mkdir -p "${TEMPLATE_DIR}/entities/documents/data/${DOC_KEY}"

# Create data.json
cat > "${TEMPLATE_DIR}/entities/documents/data/${DOC_KEY}/data.json" << 'EOF'
{
  "key": "doc-${DOC_KEY}",
  "title": "{Document Title}",
  "description": "{Document Description}",
  "content": "# {Document Title}\n\n{Markdown content}"
}
EOF
```

### Step 6: Update _documents.json

```bash
DOC_KEY="{doc-key}"

# Read existing index
INDEX_FILE="${TEMPLATE_DIR}/entities/documents/_documents.json"
INDEX=$(cat "$INDEX_FILE")

# Add new document entry
python3 << PYTHON
import json
index = $INDEX
index['documents'].append({
    "key": "doc-${DOC_KEY}",
    "title": "{Doc Title}",
    "description": "{Description}",
    "dataPath": "data/doc-${DOC_KEY}/data.json"
})
with open('$INDEX_FILE', 'w') as f:
    json.dump(index, f, indent=2)
PYTHON
```

### Step 7: After Completion

```bash
# Count documents
DOC_COUNT=$(python3 -c "import json; print(len(json.load(open('${TEMPLATE_DIR}/entities/documents/_documents.json'))['documents']))")

# Update state
python3 scripts/core.py update 3 "documents" ${DOC_COUNT}
```

## ✅ Documents Ready!

**See `INDEX.md` for response template.**
