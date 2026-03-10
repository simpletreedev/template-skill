# Step 2: Lists & Boards

## What We're Creating

Configure lists with custom fields, workflow stages, and example items to help users get started quickly.

## Preview

Here's the structure we'll create for each list:

```
📋 {List Name}
├── 🔧 Fields (custom data)
│   ├── {Field 1} (type)
│   ├── {Field 2} (type)
│   └── ...
├── 🔄 Workflow Stages
│   {Stage 1} → {Stage 2} → {Stage 3}
└── 📝 Example Items
    ├── {Item 1} ({stage})
    ├── {Item 2} ({stage})
    └── ...
```

Each list helps track different aspects of your workflow.

## Let's Create This

### Step 0: Set up context

```bash
# Session file format: sid-{SESSION_ID} at skill root level
SESSION_ID="${CLAUDE_SESSION_ID:-${SESSION_ID:-123}}"
SESSION_FILE="$(dirname "$(pwd)")/sid-${SESSION_ID}"

# Validate session file exists
if [[ ! -f "$SESSION_FILE" ]]; then
    echo "❌ Error: Session file not found: sid-${SESSION_ID}"
    echo "   Please run: bash scripts/quick-init.sh <slug> <name> <description>"
    exit 1
fi

# Read template path from session file
export TEMPLATE_DIR=$(cat "$SESSION_FILE")
cd "$TEMPLATE_DIR"

# Now $TEMPLATE_DIR is set, and you're already in the directory
# Session file ensures each user/chat gets their own template context
```

### Step 1: Ask About Lists

```
Perfect! Let's design your lists & boards. 💡

Based on your {domain/industry}, here are some ideas:

{Show 2-3 RELEVANT options based on user's domain}

🎯 For example (if recruitment):

• **Candidates** - Track people through hiring pipeline (Application → Interview → Offer)

• **Open Positions** - Manage job vacancies and requirements

• **Interview Schedule** - Coordinate upcoming interviews

Or if you have something else in mind, just tell me!

**What lists would work best for you?** (You can pick from above or describe your own)
```

**Gather requirements FIRST:**
- Exact number of lists
- Name of EACH list

### Step 2: For EACH List, Gather Requirements

```
Awesome choice! Let's make **{List Name}** perfect for you. 🎯

Quick questions to set it up:

**1. What info matters most?**

   Examples: Name, Priority, Assignee, Status, Due date...

**2. What's your workflow like?**

   Examples: New → In Progress → Review → Done

**3. Want some example items to get started?**

   This helps you (and others) understand how to use the list

💡 Or just say **"you decide"** and I'll design something great!
```

**Gather information FIRST, don't create anything yet.**

### Step 3: Show Preview (BEFORE Creating)

```
Perfect! Here's what I'll create for **{List Name}**:

📋 Fields ({count}):

   • {Field 1} ({type})
   • {Field 2} ({type})
   • ...

🔄 Workflow Stages ({count}):

   {Stage 1} → {Stage 2} → {Stage 3}

📝 Example Items ({count}) to get you started:

   • {Item 1} ({stage})
   • {Item 2} ({stage})

🎯 This setup will help you {benefit - what this achieves}

**Sound good?** Just say **"yes"** and I'll create it!
```

### Step 4: Create List Data File

For each list:

```bash
LIST_KEY="{list-key}"

# Create directory
mkdir -p "${TEMPLATE_DIR}/entities/lists/data/${LIST_KEY}"

# Create data.json
cat > "${TEMPLATE_DIR}/entities/lists/data/${LIST_KEY}/data.json" << 'EOF'
{
  "key": "list-${LIST_KEY}",
  "aliasKey": "{3-letter alias}",
  "name": "{List Name}",
  "description": "{List Description}",
  "fieldDefinitions": [
    {
      "_id": "field_{field_key}",
      "key": "{field_key}",
      "name": "{Field Name}",
      "type": "TEXT|TEXTAREA|SELECT|DATE|DATE_TIME|NUMBER|CHECKBOX|USER|FILE",
      "required": true|false,
      "order": 0,
      "options": [
        { "_id": "opt_{key}", "value": "Option", "color": "#HEX", "order": 0 }
      ]
    }
  ],
  "stages": [
    {
      "key": "stage_{key}",
      "name": "Stage Name",
      "order": 0,
      "color": "#HEX"
    }
  ],
  "defaultItems": [
    {
      "_id": "item_{item_key}",
      "key": "{item_key}",
      "name": "{Item Name}",
      "description": "{Item Description}",
      "order": 0,
      "stageKey": "stage_{key}",
      "customFields": [
        { "fieldKey": "{field_key}", "value": "{value}" }
      ]
    }
  ]
}
EOF
```

**Field Types:**
- `TEXT` - Short text (title)
- `TEXTAREA` - Long text (description)
- `SELECT` - Dropdown (needs options)
- `DATE` - Date picker
- `DATE_TIME` - Date + time
- `NUMBER` - Numeric value
- `CHECKBOX` - Yes/No toggle
- `USER` - Person assignment
- `FILE` - File attachment

### Step 5: Update _lists.json

```bash
LIST_KEY="{list-key}"

# Read existing index
INDEX_FILE="${TEMPLATE_DIR}/entities/lists/_lists.json"
INDEX=$(cat "$INDEX_FILE")

# Add new list entry using python
python3 << PYTHON
import json
index = $INDEX
index['lists'].append({
    "key": "list-${LIST_KEY}",
    "name": "{List Name}",
    "description": "{List Description}",
    "dataPath": "data/list-${LIST_KEY}/data.json"
})
with open('$INDEX_FILE', 'w') as f:
    json.dump(index, f, indent=2)
PYTHON
```

### Step 6: After Completion

```bash
# Count lists
LIST_COUNT=$(python3 -c "import json; print(len(json.load(open('${TEMPLATE_DIR}/entities/lists/_lists.json'))['lists']))")

# Update state
python3 scripts/core.py update 2 "lists" ${LIST_COUNT}
```

## ✅ Lists Ready!

**See `INDEX.md` for response template.**
