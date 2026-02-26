# Step: STEP 2 - LISTS & BOARDS

## Purpose

Configure lists (like Trello boards) with custom fields and workflow stages.

---

## What To Do

### 0. Initialize Step Variables

```bash
# Load common variables (helpers already loaded by SKILL.md)
init_step
# Now: SLUG, NAME, DESCRIPTION, TIMESTAMP are available
```

---

### 1. Ask About Lists

"How many lists do you need in this template?
(e.g., 'Tasks' list, 'Bugs' list, 'Sprint Backlog' list - or just 1 list is fine too)"

---

### 2. For EACH List, Ask:

"Great! Let's set up your **{List Name}**

1. **What information do you want to track?** (e.g., Title, Priority, Who's assigned, Due date)
   - For each detail, I'll ask: name, type (text/select/date/number/etc), required?

2. **What are the steps in your workflow?** (e.g., Backlog → In Progress → Review → Done)
   - For each step: name, color

3. **Do you need some items for each step?**
   - For each item: name, description, which stage it belongs to (stageKey), any custom field values

---

### 3. Create List Data File

**IMPORTANT: Structure**

- `stages` array: Contains all workflow stages
- `defaultItems` array (at same level as stages): Contains ALL example items
- Each item in `defaultItems` must have `stageKey` to reference its stage

For each list, create:

```bash
LIST_KEY="{list-key}"

ensure_dir "template-${SLUG}/entities/lists/data/${LIST_KEY}"

cat > template-${SLUG}/entities/lists/data/${LIST_KEY}/data.json << 'EOF'
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

**Field Types (for AI reference):**

- `TEXT` - Short text (like a title)
- `TEXTAREA` - Long text (like a description)
- `SELECT` - Dropdown choices (needs options)
- `DATE` - Date picker
- `DATE_TIME` - Date + time picker
- `NUMBER` - Numeric value
- `CHECKBOX` - Yes/No toggle
- `USER` - Person assignment
- `FILE` - File attachment

**Example with items:**

```json
{
  "key": "candidates",
  "name": "Candidates",
  "fieldDefinitions": [
    {
      "key": "name",
      "name": "Name",
      "type": "TEXT",
      "required": true,
      "order": 0
    },
    { "key": "position", "name": "Position", "type": "TEXT", "order": 1 }
  ],
  "stages": [
    { "key": "cv_review", "name": "CV Review", "order": 0, "color": "#6B7280" },
    { "key": "interview", "name": "Interview", "order": 1, "color": "#3B82F6" }
  ],
  "defaultItems": [
    {
      "key": "candidate_1",
      "name": "John Doe",
      "stageKey": "cv_review",
      "customFields": [
        { "fieldKey": "position", "value": "Frontend Developer" }
      ]
    },
    {
      "key": "candidate_2",
      "name": "Jane Smith",
      "stageKey": "interview",
      "customFields": [{ "fieldKey": "position", "value": "Backend Developer" }]
    }
  ]
}
```

---

### 4. Update \_lists.json

```bash
LIST_KEY="{list-key}"

add_to_index "${SLUG}" "entities/lists/_lists.json" "list-${LIST_KEY}" "{List Name}" "{List Description}" "data/list-${LIST_KEY}/data.json"
```

---

### 5. Update State File

```bash
LIST_COUNT=$(get_count "${SLUG}" "entities/lists/_lists.json" "lists")
update_state 2 "LISTS" "lists" ${LIST_COUNT}
```

---

### 6. Ask About Automations (Per List)

**IMPORTANT:** After completing EACH list configuration, ask:

```
✅ **{List Name}** configured!

Would you like to add **automations** to this list?

Automations can:
🔔 Send notifications when items are created/updated
📧 Send emails when items move to specific stages
✅ Auto-assign tasks based on conditions
📋 Create follow-up items automatically
🔄 Move items between stages automatically

What would you like?
• Add automations → say "add automations" or describe what you want
• Continue without automations → say "continue" or "skip"
```

If user says "add automations":
```bash
cat references/steps/02b-automation-lists.md
```

---

### 7. After All Lists Complete

```
✅ Awesome! Your lists are all set up.

📊 We've created:
   • {count} lists: {list names}
   • {total_fields} custom fields
   • {total_stages} workflow stages
   • {total_items} example items

📍 What's next: Documents (optional)
   Documents are like wiki pages - great for guides, meeting notes, process docs.
   Totally optional if you don't need them.

What would you like to do?
• Add documents to your template? (say "continue" or tell me how many)
• Skip documents and move on? (say "skip")
• Go back and change the lists? (say "go back")
• See an example of what documents look like? (say "tell me more")

Your call! 📝
```

**⚠️ PAUSE HERE - WAIT FOR USER RESPONSE**

---

## Data Format References

See `../references/template-structure.md` for complete list data structure.

**Key points:**

- `stages` array: All workflow stages
- `defaultItems` array: All example items (same level as stages)
- Each item needs `stageKey` to identify which stage it belongs to
- `customFields` array: Key-value pairs for field definitions

---

## Return Control

After user says "continue", return to main orchestrator.
Main orchestrator will load next step: `steps/03-documents.md`

If user says "skip", mark this step as `skipped` and proceed to next step.
