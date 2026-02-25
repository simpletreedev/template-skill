# Step: STEP 1 - CREATE BASE STRUCTURE

## Purpose

Create the folder structure and initialize all metadata files.

---

## What To Do

### 1. Create Folder Structure

```bash
# Get template slug from state file
SLUG=$(jq -r '.templateSlug' .template-generator-state.json)

# Create directory structure
mkdir -p template-${SLUG}/entities/{lists,documents,files}/data
mkdir -p template-${SLUG}/flows/{automations,chat-agents}/data
mkdir -p template-${SLUG}/claude-ws/data
```

---

### 2. Create metadata.json

```bash
# Get template info from state
NAME=$(jq -r '.templateName' .template-generator-state.json)
DESCRIPTION=$(jq -r '.templateDescription // ""' .template-generator-state.json)

cat > template-${SLUG}/metadata.json << EOF
{
  "name": "${NAME}",
  "version": "1.0.0",
  "description": "${DESCRIPTION}",
  "icon": "📋",
  "author": "AI Template Generator",
  "tags": ["template", "workflow"],
  "requires": {
    "minAppVersion": "1.0.0",
    "features": []
  },
  "exports": {
    "lists": 0,
    "documents": 0,
    "files": 0,
    "automations": 0,
    "chatAgents": 0,
    "claudeWorkspaces": 0
  }
}
EOF
```

---

### 3. Create Empty Metadata Files

```bash
# Lists metadata
echo '{"version": "1.0", "lists": []}' > template-${SLUG}/entities/lists/_lists.json

# Documents metadata
echo '{"version": "1.0", "documents": []}' > template-${SLUG}/entities/documents/_documents.json

# Files manifest
echo '{"version": "1.0", "files": {}}' > template-${SLUG}/entities/files/_manifest.json

# Automations metadata
echo '{"version": "1.0", "automations": []}' > template-${SLUG}/flows/automations/_automations.json

# Chat agents metadata
echo '{"version": "1.0", "agents": []}' > template-${SLUG}/flows/chat-agents/_agents.json

# Workspaces metadata
echo '{"version": "1.0", "workspaces": []}' > template-${SLUG}/claude-ws/_workspaces.json
```

---

### 4. Update State File

```bash
jq '.currentStep = 1 | .steps["1_BASE_STRUCTURE"].status = "completed" | .lastUpdated = "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"' .template-generator-state.json > .tmp && mv .tmp .template-generator-state.json
```

---

### 5. Show PAUSE Prompt

```
✅ Great! The foundation is ready.

📊 We've set up:
   • Template folder created
   • All tracking files ready
   • Everything prepared for your content

📍 What's next: Lists & Boards
   This is where we set up what you want to track (tasks, bugs, features...)
   and how they move through your workflow.

What would you like to do?
• Continue to set up your lists? (say "continue")
• Want to know what details you can track? (say "tell me more")
• Skip lists for now? (say "skip")
• Change the template name or description? (say "go back")

Your choice! 🚀
```

**⚠️ PAUSE HERE - WAIT FOR USER RESPONSE**

---

## Data Format References

See `../references/template-structure.md` for complete data structure.

Key files created:
- `metadata.json` - Template information
- `entities/lists/_lists.json` - Lists tracking file
- `entities/documents/_documents.json` - Documents tracking file
- `entities/files/_manifest.json` - Files manifest
- `flows/automations/_automations.json` - Automations tracking file
- `flows/chat-agents/_agents.json` - Chat agents tracking file
- `claude-ws/_workspaces.json` - Workspaces tracking file

---

## Return Control

After user says "continue", return to main orchestrator.
Main orchestrator will load next step: `steps/02-lists.md`

If user says "skip", mark as skipped in state and move to next step.
