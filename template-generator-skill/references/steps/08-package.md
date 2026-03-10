# Step 8: Package & Export

## What We're Creating

Finalize your template, create a ZIP package, and provide download link.

## Preview

```
📦 {Template Name}
├── 📋 metadata.json (template info)
├── 📂 entities/ (lists, documents, files)
├── 📂 flows/ (automations, chat agents)
├── 📂 claude-ws/ (AI workspaces)
└── 📄 IMPORT.md (instructions)
```

Everything packaged into a downloadable ZIP file ready for import!

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

# Get template info
eval $(python3 scripts/core.py get | grep -E "^(SLUG|NAME|DESCRIPTION)=")
```

### Step 1: Show Preview (BEFORE Packaging)

```
Great! We've completed all the steps. Let me package everything up for you.

Here's what we've built:

📋 **Lists:** {count} - {list names}
📄 **Documents:** {count} (if any)
📁 **Files:** {count} (if any)
⚙️ **Automations:** {count} (if any)
🤖 **Chat Agents:** {count} (if any)
🧠 **AI Workspaces:** {count} (if any)

I'll now:
1. Create import instructions
2. Package everything into a ZIP file

Ready to package?
```

**STOP HERE until user confirms.**

### Step 2: Update metadata.json with Final Counts

```bash
# Update metadata with current counts
python3 scripts/core.py update_metadata "$TEMPLATE_DIR"
```

### Step 3: Get Summary Statistics

```bash
# Get progress summary
PROGRESS=$(python3 scripts/core.py progress)
LISTS=$(echo "$PROGRESS" | python3 -c "import sys,json; print(json.load(sys.stdin)['summary'].get('lists',0))")
DOCS=$(echo "$PROGRESS" | python3 -c "import sys,json; print(json.load(sys.stdin)['summary'].get('documents',0))")
FILES=$(echo "$PROGRESS" | python3 -c "import sys,json; print(json.load(sys.stdin)['summary'].get('files',0))")
AUTOS=$(echo "$PROGRESS" | python3 -c "import sys,json; print(json.load(sys.stdin)['summary'].get('automations',0))")
AGENTS=$(echo "$PROGRESS" | python3 -c "import sys,json; print(json.load(sys.stdin)['summary'].get('chatAgents',0))")
WS=$(echo "$PROGRESS" | python3 -c "import sys,json; print(json.load(sys.stdin)['summary'].get('claudeWorkspaces',0))")
```

### Step 4: Create IMPORT.md

```bash
cat > "${TEMPLATE_DIR}/IMPORT.md" << EOF
# ${NAME} - Import Instructions

## Overview

${DESCRIPTION}

## What's Included

- ${LISTS} Lists, ${DOCS} Documents, ${FILES} Files
- ${AUTOS} Automations, ${AGENTS} Chat Agents, ${WS} AI Workspaces

## Import Steps

1. Go to PrivOs app
2. Navigate to Templates
3. Click "Import Template"
4. Upload this ZIP file
5. Your template is ready to use!

## Getting Started

After importing, you'll find:
- Lists ready for your items
- Documents with helpful content
- File templates to work with
- Automations handling routine tasks
- AI agents ready to assist
- AI workspaces configured

Enjoy your new template! 🚀
EOF
```

### Step 5: Create ZIP Package

```bash
# TEMPLATE_DIR is already named correctly (e.g., "corp-recruitment-template")
# Just zip it with the same name
cd "$(dirname "${TEMPLATE_DIR}")"
zip -rq "$(basename "${TEMPLATE_DIR}").zip" "$(basename "${TEMPLATE_DIR}")/"
cd -
```

### Step 6: Upload to Cloud Server

```bash
# ZIP file matches template directory name
ZIP_FILE="$(basename "${TEMPLATE_DIR}").zip"
DOWNLOAD_URL=$(python3 scripts/core.py upload "$ZIP_FILE")

if [[ -z "${DOWNLOAD_URL}" || "${DOWNLOAD_URL}" == "null" ]]; then
  echo "❌ Upload failed. Would you like me to try again? (say 'retry')"
  exit 1
fi
```

**NOTE:** If user says "retry", attempt the upload again without recreating the ZIP file.

### Step 7: Clean Up Temporary Files

```bash
rm -rf "${TEMPLATE_DIR}/"
rm -f "${SESSION_FILE}"
```

### Step 8: Show Final Success Message (EXACTLY AS BELOW)

**⚠️ IMPORTANT: The download link MUST be clickable. Use markdown link format.**

```
✅ Done! Your ${NAME} template is ready!

📋 Template: ${NAME}
📝 Description: ${DESCRIPTION}

📦 Your template is ready with:
   📋 ${LISTS} lists  📄 ${DOCS} documents  📁 ${FILES} file templates  ⚙️ ${AUTOS} automations  🤖 ${AGENTS} agent workflows  🧠 ${WS} AI workspaces

📖 Plus import instructions to get you started!

📥 Download your template:
[${SLUG}-template.zip](${DOWNLOAD_URL})

🎯 Next: Download the file, then import it into PrivOs. Check IMPORT.md for detailed instructions.

🎉 Congratulations! You've built an amazing template!
```

### Step 9: Update State File (Final)

```bash
python3 scripts/core.py update 8 "complete" 1
```

## ✅ Template Complete!