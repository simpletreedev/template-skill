# Step 4: Files (Optional)

## What We're Creating

Add document files (Excel, Word, PDF) to provide templates and resources for users.

## Preview

```
📁 Files
├── 📊 reports/
│   └── {filename}.xlsx
└── 📝 documents/
    └── {filename}.docx
```

Each file provides ready-to-use templates or reference materials.

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
Files are great for Excel templates, Word docs, PDF reports, and other resources. 📁

Would you like to add any files to your template?

👉 Continue to add files

⏭️ Skip files
```

### Step 2: If User Skips

```bash
python3 scripts/core.py skip 4
```

**Show skip response:**

```
⏭️ Files skipped

📍 What's next: Automations (optional)

Smart rules that trigger actions automatically.

👉 Continue to add automations

⏭️ Skip automations
```

### Step 3: Setup Directory

```bash
BASE_DIR="${TEMPLATE_DIR}/entities/files/storage"
mkdir -p "${BASE_DIR}/reports"
mkdir -p "${BASE_DIR}/documents"
```

### Step 4: For EACH File, Gather Requirements

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

### Step 5: Show Preview (BEFORE Creating)

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

### Step 6: Generate Files Using Skills

**Use Claude's built-in skills:**

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

### Step 7: Update _manifest.json

```bash
# Create manifest with all files
python3 << PYTHON
import json
from pathlib import Path

base_dir = Path("${BASE_DIR}")
files = {}

for file_path in base_dir.rglob("*"):
    if file_path.is_file():
        rel_path = str(file_path.relative_to(base_dir))
        files[rel_path] = {
            "display_name": file_path.name,
            "description": "Generated file",
            "is_embedded": False
        }

manifest = {
    "version": "1.0",
    "files": files
}

with open('${TEMPLATE_DIR}/entities/files/_manifest.json', 'w') as f:
    json.dump(manifest, f, indent=2)
PYTHON
```

### Step 8: After Completion

```bash
# Count files
FILE_COUNT=$(python3 -c "import json; print(len(json.load(open('${TEMPLATE_DIR}/entities/files/_manifest.json'))['files']))")

# Update state
python3 scripts/core.py update 4 "files" ${FILE_COUNT}
```

## ✅ Files Ready!

**See `INDEX.md` for response template.**
