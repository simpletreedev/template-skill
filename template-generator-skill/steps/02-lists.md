# Step: STEP 2 - LISTS & BOARDS

## Purpose

Configure lists (like Trello boards) with custom fields and workflow stages.

---

## What To Do

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

3. **Any example items to include?** (optional starter items)"

---

### 3. Create List Data File

For each list, create:

```bash
SLUG=$(jq -r '.templateSlug' .template-generator-state.json)
LIST_KEY="{list-key}"

mkdir -p template-${SLUG}/entities/lists/data/${LIST_KEY}

cat > template-${SLUG}/entities/lists/data/${LIST_KEY}/data.json << 'EOF'
{
  "key": "list-${LIST_KEY}",
  "aliasKey": "{3-letter alias}",
  "name": "{List Name}",
  "description": "{List Description}",
  "fieldDefinitions": [
    {
      "_id": "field_{field_key}",
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
    { "key": "stage_{key}", "name": "Stage Name", "order": 0, "color": "#HEX" }
  ],
  "defaultItems": []
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

---

### 4. Update _lists.json

```bash
LIST_KEY="{list-key}"
LIST_NAME="{List Name}"
LIST_DESC="{List Description}"

jq --arg key "list-${LIST_KEY}" \
   --arg name "${LIST_NAME}" \
   --arg desc "${LIST_DESC}" \
   '.lists += [{"key": $key, "name": $name, "description": $desc, "file": "data/list-'${LIST_KEY}'/data.json", "order": (.lists | length)}]' \
   template-${SLUG}/entities/lists/_lists.json > .tmp && mv .tmp template-${SLUG}/entities/lists/_lists.json
```

---

### 5. Update State File

```bash
LIST_COUNT=$(jq '.lists | length' template-${SLUG}/entities/lists/_lists.json)

jq '.currentStep = 2 | .steps["2_LISTS"].status = "completed" | .summary.lists = '${LIST_COUNT}' | .lastUpdated = "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"' \
  .template-generator-state.json > .tmp && mv .tmp .template-generator-state.json
```

---

### 6. Show PAUSE Prompt

```
✅ Awesome! Your lists are all set up.

📊 We've created:
   • {count} lists: {list names}
   • {total_fields} custom fields
   • {total_stages} workflow stages

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

---

## Return Control

After user says "continue", return to main orchestrator.
Main orchestrator will load next step: `steps/03-documents.md`

If user says "skip", mark this step as `skipped` and proceed to next step.
