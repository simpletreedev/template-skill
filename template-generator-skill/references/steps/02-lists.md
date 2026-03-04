# Step: STEP 2 - LISTS & BOARDS

## Purpose

Configure lists with custom fields and workflow stages.

---

## What To Do

### 1. Ask About Lists

```
How many lists do you need in this template?

I recommend:

{Show 2-3 relevant options based on their domain}

• Option 1: {Brief description} - {Why it's good}

• Option 2: {Brief description} - {Why it's good}

• Option 3: {Brief description} - {Why it's good}

What works best for you? Or tell me if you have a different setup in mind!
```

**DO NOT proceed to step 2 until you have:**

- Exact number of lists
- Name of EACH list

---

### 2. For EACH List, Gather Requirements

**Ask user:**

**CRITICAL: Follow the EXACT format below.**

```
Great! Let's set up your **{List Name}**

I need to know:

**1. What information do you want to track?**

   Examples: Title, Priority, Who's assigned, Due date, Status, Tags...

**2. What are the steps in your workflow?**

   Examples: Backlog → In Progress → Review → Done

**3. Do you want some example items?**

   These help users understand how to use the template

📝 What would you like to start with? (or say **"you decide"** to let me design the best setup)
```

**Gather information FIRST, don't create anything yet.**

---

### 3. Show Preview (BEFORE Creating)

```
Perfect! Here's what I'll create for **{List Name}**:

📋 Fields ({count}):

   • {Field 1} ({type})
   • {Field 2} ({type})
   • ...

🔄 Workflow Stages ({count}):

   {Stage 1} → {Stage 2} → {Stage 3} → ...

📝 Example Items ({count}):

   • {Item 1} ({stage})
   • {Item 2} ({stage})
   • ...

This will let you track {what they want to track} through {workflow description}.

👉 Ready to create this list? (say **"yes"** to proceed)
```

---

### 4. Create List Data File

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

### 5. Update \_lists.json

```bash
LIST_KEY="{list-key}"

add_to_index "${SLUG}" "entities/lists/_lists.json" "list-${LIST_KEY}" "{List Name}" "{List Description}" "data/list-${LIST_KEY}/data.json"
```

---

### 6. Show Success & Ask About Automations

**After EACH list is created:**

```
✅ **{List Name}** created!

Would you like to add **automations** to this list?

Automations can:

🔔 Send notifications when items are created/updated
📧 Send emails when items move to specific stages
✅ Auto-assign tasks based on conditions
📋 Create follow-up items automatically
🔄 Move items between stages automatically

What would you like?

• Add automations? (say "continue" or describe what you want)
• Skip for now (say "skip")
```

If user says "continue":

```bash
cat references/steps/02b-automation-lists.md
```

---

### 7. After Completion

```bash
LIST_COUNT=$(get_count "${SLUG}" "entities/lists/_lists.json" "lists")
update_state 2 "lists" ${LIST_COUNT}
```

**Show completion prompt:**

```
✅ Awesome! Your lists are all set up.

📊 We've created:

   • {count} lists: {list names}
   • {total_fields} custom fields
   • {total_stages} workflow stages
   • {total_items} example items

📍 What's next: Documents (optional)
   Great for guides, meeting notes, process docs.

👉 Continue to add documents
⏭️ Skip documents
```

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
