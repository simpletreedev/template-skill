# Step: STEP 2B - LIST AUTOMATIONS (OPTIONAL)

## Purpose

Add `automation.json` configuration to individual lists, defining triggers and actions for automated workflows on items and stages.

## When To Use

- After completing list setup in Step 2 (02-lists.md)
- User wants to add automations to a list
- User mentions "automation" or "workflow automation" during list creation

---

## Automation Structure

### automation.json (per list)

```json
{
  "automations": [
    {
      "id": "automation_{key}",
      "isActive": true,
      "name": "Automation Name",
      "description": "What this automation does",
      "triggers": [
        {
          "type": "item_created|item_updated|item_stage_changed|schedule|webhook|email_received|...",
          "config": {
            "listKey": "list-{list_key}",
            "stageKey": "stage_{key}" // Optional: for stage-specific triggers
          },
          "conditions": [
            {
              "field": "field_key",
              "operator": "equals|not_equals|contains|is_empty|is_not_empty|greater_than|less_than",
              "value": "expected_value"
            }
          ]
        }
      ],
      "actions": [
        {
          "type": "send_notification|create_item|update_item|send_email|call_webhook|move_to_stage|assign_user|add_comment|...",
          "config": {
            // Action-specific configuration
          }
        }
      ],
      "order": 0
    }
  ]
}
```

---

## Trigger Types

### Item-Based Triggers

| Trigger Type | Description | Config |
|-------------|-------------|--------|
| `item_created` | When an item is created | `listKey` |
| `item_updated` | When any field changes | `listKey` |
| `item_stage_changed` | When item moves to new stage | `listKey`, `stageKey` (target stage) |
| `item_deleted` | When an item is deleted | `listKey` |
| `item_commented` | When someone comments on item | `listKey` |

### Stage-Based Triggers

| Trigger Type | Description | Config |
|-------------|-------------|--------|
| `stage_entry` | When item enters a stage | `listKey`, `stageKey` |
| `stage_exit` | When item leaves a stage | `listKey`, `stageKey` |
| `stage_duration` | After X time in stage | `listKey`, `stageKey`, `duration` |
| `stage_overdue` | When past due date in stage | `listKey`, `stageKey` |

### Schedule Triggers

| Trigger Type | Description | Config |
|-------------|-------------|--------|
| `schedule_daily` | Once per day | `time` (HH:MM) |
| `schedule_weekly` | Once per week | `dayOfWeek`, `time` |
| `schedule_monthly` | Once per month | `dayOfMonth`, `time` |
| `schedule_interval` | Every X hours | `intervalHours` |

### External Triggers

| Trigger Type | Description | Config |
|-------------|-------------|--------|
| `webhook` | HTTP webhook received | `endpoint` |
| `email_received` | Email received | `emailAddress` |
| `form_submitted` | Form submitted | `formId` |

---

## Action Types

### Notification Actions

| Action Type | Description | Config |
|-------------|-------------|--------|
| `send_notification` | Send in-app notification | `message`, `recipients` |
| `send_email` | Send email | `to`, `subject`, `body` |

### Item Actions

| Action Type | Description | Config |
|-------------|-------------|--------|
| `create_item` | Create new item | `listKey`, `stageKey`, `fields` |
| `update_item` | Update item fields | `fields` |
| `move_to_stage` | Change item stage | `stageKey` |
| `delete_item` | Delete item | - |
| `add_comment` | Add comment to item | `comment` |

### Assignment Actions

| Action Type | Description | Config |
|-------------|-------------|--------|
| `assign_user` | Assign to user | `userId`, `notify` |
| `assign_role` | Assign to role | `roleId` |

### External Actions

| Action Type | Description | Config |
|-------------|-------------|--------|
| `call_webhook` | Make HTTP request | `url`, `method`, `body` |
| `call_api` | Call API endpoint | `apiEndpoint`, `params` |

---

## Conditional Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `equals` | Exact match | field equals "High" |
| `not_equals` | Not matching | field not_equals "Low" |
| `contains` | Contains substring | field contains "urgent" |
| `is_empty` | Field is empty/null | field is_empty |
| `is_not_empty` | Field has value | field is_not_empty |
| `greater_than` | Number > value | priority > 2 |
| `less_than` | Number < value | estimated_hours < 8 |
| `in_list` | Value in list | status in ["todo","done"] |

---

## Interactive Workflow

### Step 1: Ask About Automations

```
Does your **{List Name}** need any automations?

Automations can:
🔔 Send notifications when items are created/updated
📧 Send emails when items move to specific stages
✅ Auto-assign tasks based on conditions
📋 Create follow-up items automatically
🔄 Move items between stages automatically

What would you like to automate?
```

### Step 2: For Each Automation

#### 2.1 Name & Description

```
Let's create your automation.

**Name:** (e.g., "Notify on High Priority Tasks")
**Description:** (e.g., "Send notification when high priority task is created")
```

#### 2.2 Choose Trigger

```
**When should this automation run?**

Choose a trigger:
1. When item is created
2. When item is updated
3. When item moves to specific stage
4. On a schedule (daily/weekly)
5. When item stays in stage too long
```

Based on choice, ask for:
- **Stage-specific**: "Which stage?"
- **Schedule**: "What time/frequency?"

#### 2.3 Set Conditions (Optional)

```
**Should this run for ALL items or only some?**

• All items → skip conditions
• Only some items → add conditions

For each condition:
- Which field? (list field definitions)
- What operator? (equals/contains/is_empty/etc)
- What value?
```

#### 2.4 Add Actions

```
**What should happen when this automation runs?**

Choose an action:
1. Send notification
2. Send email
3. Create new item
4. Update this item
5. Move to different stage
6. Assign to someone
7. Call webhook/API
```

Based on choice, ask for:
- **Notification**: "Message content?"
- **Email**: "To, subject, body?"
- **Create item**: "Which list? Which stage? What fields?"
- **Update**: "Which fields to change?"
- **Move**: "Which stage?"
- **Assign**: "Who to assign?"

#### 2.5 More Actions?

```
✅ Action added!

Add another action to this automation?
• Yes → repeat Step 2.4
• No → continue
```

### Step 3: More Automations?

```
✅ Automation created!

Add more automations to this list?
• Yes → repeat from Step 2
• No → finish
```

---

## Creation Script

```bash
create_automation() {
  local LIST_KEY="$1"
  local AUTOMATION_ID="$2"
  local SLUG=$(get_slug)

  mkdir -p "template-${SLUG}/entities/lists/data/${LIST_KEY}"

  cat > "template-${SLUG}/entities/lists/data/${LIST_KEY}/automation.json" << EOF
{
  "automations": [
    {
      "id": "${AUTOMATION_ID}",
      "isActive": true,
      "name": "Automation Name",
      "description": "Description here",
      "triggers": [
        {
          "type": "item_created",
          "config": {
            "listKey": "list-${LIST_KEY}"
          }
        }
      ],
      "actions": [
        {
          "type": "send_notification",
          "config": {
            "message": "New item created"
          }
        }
      ],
      "order": 0
    }
  ]
}
EOF

  echo "✓ Created automation.json for list-${LIST_KEY}"
}
```

---

## Examples

### Example 1: Notify on High Priority Items

```json
{
  "automations": [
    {
      "id": "automation_notify_high_priority",
      "isActive": true,
      "name": "Notify on High Priority",
      "description": "Send notification when high priority task is created",
      "triggers": [
        {
          "type": "item_created",
          "config": {
            "listKey": "list-tasks"
          },
          "conditions": [
            {
              "field": "priority",
              "operator": "equals",
              "value": "High"
            }
          ]
        }
      ],
      "actions": [
        {
          "type": "send_notification",
          "config": {
            "message": "🚨 High priority task created: {{item.name}}"
          }
        }
      ],
      "order": 0
    }
  ]
}
```

### Example 2: Auto-Move to Review Stage

```json
{
  "automations": [
    {
      "id": "automation_auto_review",
      "isActive": true,
      "name": "Auto-assign Reviewer",
      "description": "Assign senior developer when task moves to In Progress",
      "triggers": [
        {
          "type": "item_stage_changed",
          "config": {
            "listKey": "list-tasks",
            "stageKey": "stage_in_progress"
          }
        }
      ],
      "actions": [
        {
          "type": "assign_user",
          "config": {
            "userId": "senior_dev_lead",
            "notify": true
          }
        }
      ],
      "order": 0
    }
  ]
}
```

### Example 3: Daily Digest Email

```json
{
  "automations": [
    {
      "id": "automation_daily_summary",
      "isActive": true,
      "name": "Daily Task Summary",
      "description": "Send daily email summary at 9 AM",
      "triggers": [
        {
          "type": "schedule_daily",
          "config": {
            "time": "09:00"
          }
        }
      ],
      "actions": [
        {
          "type": "send_email",
          "config": {
            "to": "{{team.email}}",
            "subject": "Daily Task Summary - {{date}}",
            "body": "Tasks completed yesterday: {{stats.completed}}"
          }
        }
      ],
      "order": 0
    }
  ]
}
```

### Example 4: Stage Overdue Alert

```json
{
  "automations": [
    {
      "id": "automation_review_overdue",
      "isActive": true,
      "name": "Review Overdue Alert",
      "description": "Alert if item in Review stage for more than 2 days",
      "triggers": [
        {
          "type": "stage_overdue",
          "config": {
            "listKey": "list-tasks",
            "stageKey": "stage_review",
            "duration": "2d"
          }
        }
      ],
      "actions": [
        {
          "type": "send_notification",
          "config": {
            "message": "⚠️ Item {{item.name}} has been in Review for 2+ days"
          }
        }
      ],
      "order": 0
    }
  ]
}
```

---

---

## What To Do

### 1. Ask User (After List Setup)

```
✅ List configured with stages and fields!

Would you like to add **automations** to this list?

Automations can:
🔔 Send notifications when items are created/updated
📧 Send emails when items move to specific stages
✅ Auto-assign tasks based on conditions
📋 Create follow-up items automatically
🔄 Move items between stages automatically

What would you like?
• Add automations to this list (say "add automations" or describe what you want)
• Skip and continue to next step (say "skip" or "continue")
```

---

### 2. If Skipped

```bash
echo "⏭️  No automations for this list"
# Return to Step 2 (lists.md) to continue with next list
```

---

### 3. For Each Automation

#### 3.1 Name & Description

```
Let's create your automation.

**Name:** (e.g., "Notify on High Priority Tasks")
**Description:** (e.g., "Send notification when high priority task is created")
```

#### 3.2 Choose Trigger

```
**When should this automation run?**

Choose a trigger:
1. When item is created
2. When item is updated
3. When item moves to specific stage
4. On a schedule (daily/weekly)
5. When item stays in stage too long
```

Based on choice, ask for:
- **Stage-specific**: "Which stage?"
- **Schedule**: "What time/frequency?"

#### 3.3 Set Conditions (Optional)

```
**Should this run for ALL items or only some?**

• All items → skip conditions
• Only some items → add conditions

For each condition:
- Which field? (show list's field definitions)
- What operator? (equals/contains/is_empty/etc)
- What value?
```

#### 3.4 Add Actions

```
**What should happen when this automation runs?**

Choose an action:
1. Send notification
2. Send email
3. Create new item
4. Update this item
5. Move to different stage
6. Assign to someone
7. Call webhook/API
```

Based on choice, ask for:
- **Notification**: "Message content?"
- **Email**: "To, subject, body?"
- **Create item**: "Which list? Which stage? What fields?"
- **Update**: "Which fields to change?"
- **Move**: "Which stage?"
- **Assign**: "Who to assign?"

#### 3.5 More Actions?

```
✅ Action added!

Add another action to this automation?
• Yes → repeat Step 3.4
• No → continue
```

### 4. More Automations?

```
✅ Automation created!

Add more automations to this list?
• Yes → repeat from Step 3
• No → finish
```

---

### 5. Create automation.json File

```bash
create_automation_file() {
  local LIST_KEY="$1"
  local SLUG=$(get_slug)

  # Read all automations from user input and build JSON array
  cat > "template-${SLUG}/entities/lists/data/${LIST_KEY}/automation.json" << EOF
{
  "automations": [
    // Each automation from user input
  ]
}
EOF

  echo "✓ Created automation.json for list-${LIST_KEY}"
}
```

---

### 6. Return to List Setup

After finishing automations, return to Step 2 (02-lists.md) to continue with next list or complete list setup.

---

## Return Control

After creating automations for a list:

1. **Return to Step 2** (`02-lists.md`) to continue with next list or complete list setup
2. **DO NOT** proceed to Step 3 (`03-documents.md`) until all lists are configured

**IMPORTANT:**

- This step (`02b`) creates **list-specific** `automation.json` files in:
  ```
  entities/lists/data/{list_key}/automation.json
  ```
- Step 5 (`05-automations.md`) creates **global** automations in:
  ```
  flows/automations/data/{automation_key}/data.json
  ```
- These are **separate** automation systems:
  - List automations: Run on specific lists, stored with the list
  - Global automations: Can span multiple lists/entities, stored centrally

---

## Data Format References

See `../template-structure.md` for complete automation data structure.

**Key points:**

- List automations: `entities/lists/data/{list_key}/automation.json`
- Each automation: `id`, `isActive`, `name`, `triggers[]`, `actions[]`, `order`
- Trigger types: item events, stage events, schedules, external events
- Action types: notifications, emails, item operations, assignments, webhooks
- Conditions (optional): Filter when automation runs based on field values
