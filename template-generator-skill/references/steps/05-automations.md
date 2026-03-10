# Step 5: Automations (Optional)

## What We're Creating

Configure automation rules - smart "when X happens, do Y" rules that automate repetitive tasks.

## Preview

```
⚙️ {Automation Name}
├── 🎯 Trigger: {When it happens}
├── ⚡ Actions: {What it does}
└── 🔒 Conditions: {Any restrictions (optional)}
```

Each automation saves time by handling routine actions automatically.

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
Automations are smart rules that save time! ⚙️

They can:
🔔 Send notifications when items are created/updated
📧 Send emails when items move to specific stages
✅ Auto-assign tasks based on conditions
📋 Create follow-up items automatically
🔄 Move items between stages automatically

Would you like to add automations to your template?

👉 Continue to add automations
⏭️ Skip automations
```

### Step 2: If User Skips

```bash
python3 scripts/core.py skip 5
```

**Show skip response:**

```
⏭️ Automations skipped

📍 What's next: AI Chat Agents (optional)
AI assistants for specific tasks like project help, code review, data analysis.

👉 Continue to add chat agents
⏭️ Skip chat agents
```

### Step 3: For EACH Automation, Gather Requirements

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

### Step 4: Show Preview (BEFORE Creating)

```
Perfect! Here's what I'll create:

⚙️ **{Automation Name}**
   Trigger: {When it happens}
   Action: {What it does}
   Condition: {Any conditions (if applicable)}

This automation will {benefit/use case}.

Ready to create this automation? (say **"yes"** to proceed)
```

### Step 5: Create Automation Data File

```bash
AUTO_KEY="{auto-key}"

# Create directory
mkdir -p "${TEMPLATE_DIR}/flows/automations/data/${AUTO_KEY}"

# Create data.json
cat > "${TEMPLATE_DIR}/flows/automations/data/${AUTO_KEY}/data.json" << 'EOF'
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
- `schedule` - On a time schedule (cron: "0 9 * * 1" = 9am every Monday)

**Action types:**
- `send_notification` - Send notification to users
- `update_field` - Update a field value
- `call_ai` - Trigger AI workspace
- `create_item` - Create a new item

### Step 6: Update _automations.json

```bash
AUTO_KEY="{auto-key}"

# Read existing index
INDEX_FILE="${TEMPLATE_DIR}/flows/automations/_automations.json"
INDEX=$(cat "$INDEX_FILE")

# Add new automation entry
python3 << PYTHON
import json
index = $INDEX
index['automations'].append({
    "key": "automation-${AUTO_KEY}",
    "name": "{Automation Name}",
    "description": "{Description}",
    "dataPath": "data/automation-${AUTO_KEY}/data.json"
})
with open('$INDEX_FILE', 'w') as f:
    json.dump(index, f, indent=2)
PYTHON
```

### Step 7: After Completion

```bash
# Count automations
AUTO_COUNT=$(python3 -c "import json; print(len(json.load(open('${TEMPLATE_DIR}/flows/automations/_automations.json'))['automations']))")

# Update state
python3 scripts/core.py update 5 "automations" ${AUTO_COUNT}
```

## ✅ Automations Ready!

**See `INDEX.md` for response template.**
