# Step: STEP 1 - CREATE BASE STRUCTURE

## Purpose

Create the folder structure and initialize all metadata files.

---

## What To Do

### 1. Initialize Step Variables

```bash
# Load common variables (helpers already loaded by SKILL.md)
init_step
# Now: SLUG, NAME, DESCRIPTION, TIMESTAMP are available
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

### 3. Create Empty Metadata Files

```bash
{
  echo '{"version": "1.0", "lists": []}' > template-${SLUG}/entities/lists/_lists.json
  echo '{"version": "1.0", "documents": []}' > template-${SLUG}/entities/documents/_documents.json
  echo '{"version": "1.0", "files": {}}' > template-${SLUG}/entities/files/_manifest.json
  echo '{"version": "1.0", "automations": []}' > template-${SLUG}/flows/automations/_automations.json
  echo '{"version": "1.0", "agents": []}' > template-${SLUG}/flows/chat-agents/_agents.json
  echo '{"version": "1.0", "workspaces": []}' > template-${SLUG}/claude-ws/_workspaces.json
}
```

---

### 4. Update State File

```bash
update_state 1 "BASE_STRUCTURE" "dummy" 0
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
