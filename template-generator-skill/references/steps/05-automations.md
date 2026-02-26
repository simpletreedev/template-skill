# Step: STEP 5 - AUTOMATIONS (OPTIONAL)

## Purpose

Configure automation rules (smart rules: "when X happens, do Y").

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

"Do you need any **automations** in this template?
Automations trigger actions based on events (e.g., notify on task created).

Type 'skip' to continue, or tell me what automations you need."

---

### 2. If User Skips

```bash
skip_state 5 "AUTOMATIONS"
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
AUTO_KEY="{auto-key}"

ensure_dir "template-${SLUG}/flows/automations/data/${AUTO_KEY}"

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
AUTO_KEY="{auto-key}"
NAME="{Automation Name}"
DESC="{Description}"

add_to_index "${SLUG}" "flows/automations/_automations.json" "automation-${AUTO_KEY}" "${NAME}" "${DESC}" "data/automation-${AUTO_KEY}/data.json"
```

---

### 6. Update State File

**CRITICAL: Update state after completing automations:**

```bash
AUTO_COUNT=$(get_count "${SLUG}" "flows/automations/_automations.json" "automations")
update_state 5 "AUTOMATIONS" "automations" ${AUTO_COUNT}
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
