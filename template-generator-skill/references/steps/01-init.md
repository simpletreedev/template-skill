# Step: STEP 1 - INITIALIZE & CREATE FOUNDATION

## Purpose

Create the foundation (state file + folder structure + metadata) for the template.

**Note:** User already confirmed "ready" in SKILL.md Phase 1. Questions were asked, structure was explained, and user agreed to proceed. This step only executes the foundation creation.

**Immediately execute (no preview, no stopping, no confirmation):**

---

## What To Do

### 1. Load Helper Scripts & Create State File

```bash
source scripts/template-helpers.sh
python3 scripts/template-manager.py init "{slug}" "{Template Name}" "{Description}"
```

---

### 2. Create Folder Structure

```bash
mkdir -p template-${SLUG}/entities/{lists,documents,files}/data \
         template-${SLUG}/flows/{automations,chat-agents}/data \
         template-${SLUG}/claude-ws/data
```

---

### 3. Create metadata.json

```bash
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

### 4. Create Empty Metadata Files

```bash
echo '{"version": "1.0", "lists": []}' > template-${SLUG}/entities/lists/_lists.json
echo '{"version": "1.0", "documents": []}' > template-${SLUG}/entities/documents/_documents.json
echo '{"version": "1.0", "files": {}}' > template-${SLUG}/entities/files/_manifest.json
echo '{"version": "1.0", "automations": []}' > template-${SLUG}/flows/automations/_automations.json
echo '{"version": "1.0", "agents": []}' > template-${SLUG}/flows/chat-agents/_agents.json
echo '{"version": "1.0", "workspaces": []}' > template-${SLUG}/claude-ws/_workspaces.json
```

---

### 5. Show Success

```
✅ Foundation is ready!

📍 What's next: Lists & Boards
   Define what you want to track and how it moves through your workflow.

👉 Continue to set up lists
```

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
