# Step: STEP 5 - AUTOMATIONS (OPTIONAL)

## Purpose

Configure automation rules (smart rules: "when X happens, do Y").

---

## What To Do

### 1. Ask User

Use `templates/common-user-prompts.md` → Automations

---

### 2. If User Skips

```bash
skip_state 5
```

**Show skip prompt:**
Use `templates/common-responses.md` → Automations

---

### 3. For EACH Automation, Gather Requirements

**Ask user:**

```
Let's create your automation: **{Automation Name}**

I need to know:

1. **When should this trigger?**
   Examples:
   - When a new item is created
   - When an item is updated
   - When an item moves to a specific stage
   - On a schedule (daily, weekly, etc.)

2. **What should happen?**
   Examples:
   - Send notification to someone
   - Update a field value
   - Call an AI workspace to process it
   - Create a follow-up item

3. **Any conditions?** (optional)
   Examples:
   - Only if priority is high
   - Only if assigned to specific person
   - Only if stage is "Review"

Tell me about this automation and I'll put it together for you.
```

**Gather information FIRST, don't create anything yet.**

---

### 4. Show Preview (BEFORE Creating)

```
Perfect! Here's what I'll create:

⚙️ **{Automation Name}**
   Trigger: {When it happens}
   Action: {What it does}
   Condition: {Any conditions (if applicable)}

This automation will {benefit/use case}.

Ready to create this automation? (say **"yes"** to proceed)
```

---

### 5. Create Automation Data File

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
      "listKey": "list-{key}",
      "stageKey": "stage-{key}",
      "schedule": "0 9 * * 1"
    }
  ],
  "actions": [
    {
      "type": "send_notification|update_field|call_ai|create_item",
      "message": "{{item.title}}",
      "fieldKey": "{field_key}",
      "value": "{value}",
      "claudeWs": "claude-ws-{key}",
      "targetList": "list-{key}",
      "targetStage": "stage-{key}"
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
- `schedule` - On a time schedule (cron: "0 9 \* \* 1" = 9am every Monday)

**Action types:**

- `send_notification` - Send notification to users
- `update_field` - Update a field value
- `call_ai` - Trigger AI workspace
- `create_item` - Create a new item

**Examples:**

```json
// Notify when item moves to Review stage
{
  "name": "Notify on Review",
  "triggers": [
    { "type": "item_moved", "listKey": "list-tasks", "stageKey": "stage_review" }
  ],
  "actions": [
    { "type": "send_notification", "message": "{{item.title}} is ready for review" }
  ]
}

// Auto-assign high priority items
{
  "name": "Auto-assign High Priority",
  "triggers": [
    { "type": "item_created", "listKey": "list-tasks" }
  ],
  "actions": [
    { "type": "update_field", "fieldKey": "assignee", "value": "team-lead" }
  ],
  "condition": {
    "fieldKey": "priority",
    "value": "high"
  }
}
```

---

### 6. Update \_automations.json

```bash
AUTO_KEY="{auto-key}"
NAME="{Automation Name}"
DESC="{Description}"

add_to_index "${SLUG}" "flows/automations/_automations.json" "automation-${AUTO_KEY}" "${NAME}" "${DESC}" "data/automation-${AUTO_KEY}/data.json"
```

---

### 7. Update State & Show Completion

```bash
update_step_state 5 "automations" "flows/automations/_automations.json"
```

**Show completion prompt:**
Use `templates/common-responses.md` → Automations

---

## Data Format References

See `../references/template-structure.md` for complete automation data structure.

---

## Return Control

After user says "continue", return to main orchestrator.
Main orchestrator will load next step: `steps/06-chat-agents.md`

If user says "skip", this is already handled above.
