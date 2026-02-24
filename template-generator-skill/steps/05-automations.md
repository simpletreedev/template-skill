# Step: STEP 5 - AUTOMATIONS (OPTIONAL)

## Purpose

Configure automation rules (smart rules: "when X happens, do Y").

---

## What To Do

### 0. Read State File

**ALWAYS start by reading current state:**

```bash
cat .template-generator-state.json
```

This ensures you're working with the latest data.

---

### 1. Ask User

"Do you need any **automations** in this template?
Automations trigger actions based on events (e.g., notify on task created).

Type 'skip' to continue, or tell me what automations you need."

---

### 2. If User Skips

**Update state file:**

```bash
jq '.currentStep = 5 | .steps["5_AUTOMATIONS"].status = "skipped" | .lastUpdated = "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"' \
  .template-generator-state.json > .tmp && mv .tmp .template-generator-state.json
```

**Show skip prompt:**

```
⏭️  Skipping automations

📊 Progress:
   • Automations: skipped

📍 What's next: Chat Agents (optional)

What's next?
• Continue to chat agents? (say "continue")
• See detailed progress? (say "progress")

Your call! 🤖
```

**⚠️ PAUSE HERE - WAIT FOR USER RESPONSE**

---

### 3. For EACH Automation, Ask

- "When should this trigger? (e.g., when task is created, updated, moved)"
- "What should happen? (e.g., send notification, update field, call AI)"
- "Should it use AI workspace? (optional)"

---

### 4. Create Automation Data File

For each automation, create:

```bash
SLUG=$(jq -r '.templateSlug' .template-generator-state.json)
AUTO_KEY="{auto-key}"

mkdir -p template-${SLUG}/flows/automations/data/${AUTO_KEY}

cat > template-${SLUG}/flows/automations/data/${AUTO_KEY}/data.json << 'EOF'
{
  "flowId": "flow-${AUTO_KEY}",
  "name": "{Automation Name}",
  "triggers": [
    {
      "type": "item_created|item_updated|item_moved|schedule",
      "listKey": "list-{key}"
    }
  ],
  "actions": [
    {
      "type": "send_notification|update_field|call_ai",
      "message": "{{item.title}}"
    }
  ],
  "claudeWs": "claude-ws-{key}",
  "description": "{Description}"
}
EOF
```

**Trigger types:**
- `item_created` - When a new item is added
- `item_updated` - When an item is modified
- `item_moved` - When an item changes stage
- `schedule` - On a time schedule

**Action types:**
- `send_notification` - Send notification to users
- `update_field` - Update a field value
- `call_ai` - Trigger AI workspace

---

### 5. Update _automations.json

```bash
SLUG=$(jq -r '.templateSlug' .template-generator-state.json)
AUTO_KEY="{auto-key}"
NAME="{Automation Name}"
DESC="{Description}"

jq --arg key "automation-${AUTO_KEY}" \
   --arg name "${NAME}" \
   --arg desc "${DESC}" \
   '.automations += [{
     "key": $key,
     "name": $name,
     "description": $desc,
     "file": "data/automation-'${AUTO_KEY}'/data.json",
     "triggers": ["item_created"],
     "order": (.automations | length)
   }]' \
   template-${SLUG}/flows/automations/_automations.json > .tmp && mv .tmp template-${SLUG}/flows/automations/_automations.json
```

---

### 6. Update State File

**CRITICAL: Update state after completing automations:**

```bash
SLUG=$(jq -r '.templateSlug' .template-generator-state.json)
AUTO_COUNT=$(jq '.automations | length' template-${SLUG}/flows/automations/_automations.json)

jq '.currentStep = 5 | .steps["5_AUTOMATIONS"].status = "completed" | .summary.automations = '${AUTO_COUNT}' | .lastUpdated = "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"' \
  .template-generator-state.json > .tmp && mv .tmp .template-generator-state.json
```

---

### 7. Show PAUSE Prompt

```
✅ Automations configured!

📊 We've added:
   • {count} automation rules

📍 What's next: Chat Agents (optional)
   Chat agents are AI assistants for specific tasks.
   Also optional - only if you need AI helpers.

What's next?
• Add chat agents? (say "continue" or tell me how many)
• Skip chat agents? (say "skip")
• Go back and change automations? (say "go back")
• See detailed progress? (say "progress")

Your call! 🤖
```

**⚠️ PAUSE HERE - WAIT FOR USER RESPONSE**

---

## Data Format References

See `../references/template-structure.md` for complete automation data structure.

---

## Return Control

After user says "continue", return to main orchestrator.
Main orchestrator will load next step: `steps/06-chat-agents.md`

If user says "skip", this is already handled above.
