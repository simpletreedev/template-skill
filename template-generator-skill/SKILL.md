---
name: template-json-generator
description: Generate workflow/task tracking template.json files and package as ZIP. Takes workflow requirements, generates proper JSON structure, and outputs both JSON file and ZIP package ready for import into task management systems.
license: MIT
version: 3.2.0
---

# Template JSON Generator Skill

Generate **task tracking / workflow management templates** from user requirements.

## What This Tool Does

**This tool creates templates for TASK MANAGEMENT / WORKFLOW TRACKING systems.**

Examples of what to create:
- Bug tracking templates
- Recruitment pipeline templates
- Customer support ticket templates
- Project task templates
- Sales pipeline templates

**NOT for creating:**
- ❌ Web application templates
- ❌ Document templates (PDF/Markdown)
- ❌ Code templates
- ❌ Google Docs/Notion templates

## Output Format (FIXED - DO NOT ASK)

**The output format is ALWAYS:**
1. **JSON file**: `template.json` with task tracking structure
2. **ZIP package**: Contains template.json + IMPORT.md

**NEVER ask about format/type/structure - it's always JSON + ZIP!**

## ⚠️ CRITICAL: Output Files Only

**CREATE EXACTLY 2 FILES IN CURRENT DIRECTORY:**
1. `[templateKey].template.json` - Template data
2. `[templateKey].zip` - Package with template.json + IMPORT.md

**ABSOLUTELY DO NOT CREATE:**
- ❌ Folders (docs/, packages/, reports/, scripts/, templates/)
- ❌ Config files (package.json, package-lock.json, config-*.json)
- ❌ Documentation files (CLAUDE.md, README.md, .env.example)
- ❌ Any other files or directories

**Tools/scripts are already included in the skill package!**

## When to Use

- User wants to create a workflow/task tracking template
- User describes a process that needs tracking (e.g., "I need to track bugs", "manage recruitment")
- User mentions templates for: tracking, workflows, tasks, processes, pipelines

## Execution Mode: SMART GENERATION

**Ask questions ONLY when workflow details are unclear.**

### When to Ask Questions

Ask ONLY if these workflow-specific details are missing:
- What to track is unclear (e.g., just "create template" without context)
- Workflow stages are ambiguous (e.g., need specific steps)
- Required fields are not obvious from context

**Example questions (workflow-focused):**
- "What process do you want to track?" (e.g., bugs, candidates, tickets)
- "What are the workflow stages?" (e.g., Open → In Progress → Done)
- "What information should be tracked for each item?" (e.g., priority, assignee)

**NEVER ask:**
- ❌ "What format do you want?" (always JSON + ZIP)
- ❌ "What type of template?" (always task tracking)
- ❌ "Web app or document?" (always task tracking JSON)

### When to Auto-Generate

Generate immediately if user request is clear:
- Template purpose is obvious (e.g., "bug tracking", "customer support")
- Can infer reasonable workflow stages
- Can infer standard fields (title, description, priority)

**Examples of clear requests:**
- "Create bug tracking template" → Auto-generate immediately
- "I need to track customer support tickets" → Auto-generate immediately
- "Track recruitment pipeline" → Auto-generate immediately

## Required Output Format

**MUST output both files:**

1. **JSON file**: Write `template.json` to disk
2. **ZIP package**: Create ZIP containing:
   - `template.json` - Full template data
   - `IMPORT.md` - Import instructions
   - `.env.example` - Environment variables

## Execution Workflow

### Phase 1: Gather Information

1. **Parse user request** - Extract template name, purpose, stages, fields
2. **Check completeness** - Is information sufficient?
3. **Ask if needed** - If critical info missing, ask specific questions
4. **Build config** - Prepare complete configuration object in memory

### Phase 2: Generate JSON

1. **Create template structure in memory**
   - templateKey (snake_case)
   - name, description, icon
   - lists with fields and stages
   - metadata (version, author, tags)

2. **Write ONLY ONE JSON file to current directory**
   ```
   [templateKey].template.json
   ```

   **DO NOT create folders or additional files at this stage!**

### Phase 3: Create ZIP Package

1. **Generate IMPORT.md content in memory**
   - Import instructions
   - Template structure overview
   - Usage examples

2. **Create ZIP in memory using native code**
   - Add: template.json (from Phase 2)
   - Add: IMPORT.md (generated in memory)
   - Package using built-in SimpleZip class

3. **Write ONLY ONE ZIP file to current directory**
   ```
   [templateKey].zip
   ```

**CRITICAL RULES - DO NOT CREATE:**
- ❌ NO folders (docs/, packages/, reports/, scripts/, templates/)
- ❌ NO config files (config-*.json, package.json, package-lock.json)
- ❌ NO additional documentation (CLAUDE.md, README.md)
- ❌ NO .env files in output

**ONLY CREATE EXACTLY 2 FILES:**
1. `[templateKey].template.json` - In current directory
2. `[templateKey].zip` - In current directory

### Phase 4: Report Results

**MUST provide summary:**

```
✅ Template generated successfully!

📋 Template: [Template Name]
🔑 Key: [templateKey]
📁 Category: [Category]

📄 Files created:
   1. [templateKey].template.json ([size] KB)
   2. [templateKey].zip ([size] KB)

📦 ZIP package contents:
   ✓ template.json - Template data structure
   ✓ IMPORT.md - Import instructions

🎯 Next steps:
   1. Upload [templateKey].zip to your target system
   2. System will read IMPORT.md and auto-import
   3. Template ready to use!
```

## Template Structure

### Root Level
```json
{
  "templateKey": "snake_case_key",
  "name": "Display Name",
  "description": "Description",
  "icon": "📋",
  "isActive": true,
  "lists": [],
  "documents": [],
  "metadata": {
    "version": "1.0.0",
    "author": "AI Template Generator",
    "createdAt": "YYYY-MM-DD",
    "tags": [],
    "category": "Category Name"
  }
}
```

### List Structure
```json
{
  "key": "snake_case",
  "name": "List Name",
  "description": "Description",
  "fieldDefinitions": [],
  "stages": []
}
```

### Stage Structure (CRITICAL)
```json
{
  "key": "snake_case",
  "name": "Stage Name",
  "color": "#HEX",
  "order": 0,
  "items": []  // Items INSIDE stage
}
```

### Item Structure
```json
{
  "key": "snake_case",
  "name": "Item Name",
  "description": "Description",
  "order": 0,
  "customFields": [
    {"fieldKey": "field_key", "value": "value"}
  ]
  // NO stageKey - items are inside their stage
}
```

## Field Types

| Type | Usage |
|------|-------|
| TEXT | Short text |
| TEXTAREA | Long text |
| NUMBER | Numbers |
| DATE | Date only |
| DATE_TIME | Date + time |
| SELECT | Single choice (needs options[]) |
| MULTI_SELECT | Multiple choices (needs options[]) |
| CHECKBOX | Boolean |
| ASSIGNEE | User assignment |
| DEADLINE | Due date |
| FILE | Single file |
| FILE_MULTIPLE | Multiple files |
| USER | User reference |

## SELECT/MULTI_SELECT Options Format
```json
{
  "value": "Option Label",
  "color": "#HEX",
  "order": 0
}
```

## Default Colors
```javascript
["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#6B7280"]
```

## Execution Examples

### Example 1: Sufficient Information

**User:** "Create a customer support ticket system"

**AI Decision:** Information is sufficient (name, purpose clear)

**Execute:**
1. Generate config automatically
2. Create template.json
3. Package as ZIP
4. Report results

**Output:**
```
✅ Template generated successfully!

📋 Template: Customer Support Tickets
🔑 Key: customer_support_tickets
📁 Category: Customer Support

📄 Files created:
   1. JSON file: ./templates/customer_support_tickets.template.json (3.2 KB)
   2. ZIP package: ./packages/customer_support_tickets.zip (7.5 KB)

📦 ZIP package contents:
   ✓ template.json - Template data structure
   ✓ IMPORT.md - Import instructions
   ✓ .env.example - Configuration template

🎯 Next steps:
   1. Upload customer_support_tickets.zip to your target system
   2. System will read IMPORT.md and auto-import
   3. Template ready to use!
```

### Example 2: Insufficient Information

**User:** "Create a template"

**AI Decision:** Too vague, need more information

**AI Response:**
```
I'd be happy to create a template for you! To make it useful, I need a bit more information:

1. What would you like to name this template?
2. What is the purpose? (e.g., task tracking, bug management, recruitment)
3. What stages/workflow steps are needed?

For example:
- "Bug Tracking" → stages: Open, In Progress, Fixed, Closed
- "Recruitment" → stages: CV Review, Interview, Offer, Hired
```

**After user provides info:**
```
✅ Template generated successfully!
[... full report as above ...]
```

### Example 3: Partial Information

**User:** "Track project tasks"

**AI Decision:** Name clear, can infer defaults

**Execute:** Auto-generate with reasonable defaults

**Output:**
```
✅ Template generated successfully!

📋 Template: Project Task Tracking
🔑 Key: project_task_tracking
📁 Category: Project Management

📄 Files created:
   1. JSON file: ./templates/project_task_tracking.template.json (2.8 KB)
   2. ZIP package: ./packages/project_task_tracking.zip (6.2 KB)

📦 ZIP package contents:
   ✓ template.json - Template data structure
   ✓ IMPORT.md - Import instructions
   ✓ .env.example - Configuration template

🎯 Next steps:
   1. Upload project_task_tracking.zip to your target system
   2. System will read IMPORT.md and auto-import
   3. Template ready to use!

ℹ️ Note: Generated with default stages (Backlog, To Do, In Progress, Done).
   You can customize these after import.
```

## Critical Rules

1. **ASK WHEN NEEDED** - Ask questions if critical information is missing
2. **BOTH OUTPUTS** - Always create JSON + ZIP
3. **ITEMS IN STAGES** - Never use stageKey, items array is inside each stage
4. **SNAKE_CASE KEYS** - All keys must be snake_case
5. **SEQUENTIAL ORDER** - Start from 0, increment
6. **VALID COLORS** - Use hex colors from default palette
7. **REQUIRED FIELDS** - Mark essential fields as required: true
8. **COMPLETE SUMMARY** - Always provide full result summary

## Default Inference

If user doesn't specify:
- **Stages**: Use ["To Do", "In Progress", "Done"]
- **Fields**: Use [
    {"name": "Title", "type": "TEXT", "required": true},
    {"name": "Description", "type": "TEXTAREA"},
    {"name": "Priority", "type": "SELECT", "options": [
      {"value": "High", "color": "#EF4444", "order": 0},
      {"value": "Medium", "color": "#F59E0B", "order": 1},
      {"value": "Low", "color": "#10B981", "order": 2}
    ]}
  ]

## File Locations

**Write files to CURRENT DIRECTORY only:**

- Template JSON: `[templateKey].template.json`
- ZIP package: `[templateKey].zip`

**DO NOT create folders or subdirectories!**

## Tool Usage

Generate template using script:
```bash
node scripts/template-skill-generator.js --quick "[Template Name]"
```

Or use config file:
```bash
node scripts/template-skill-generator.js --config my-config.json
```

## Success Criteria

✅ ONLY 2 files created in current directory:
   - `[templateKey].template.json`
   - `[templateKey].zip`
✅ NO folders created (no docs/, packages/, scripts/, templates/)
✅ NO config files created (no package.json, CLAUDE.md, etc.)
✅ JSON has valid structure (lists → stages → items)
✅ All keys are snake_case
✅ Colors are valid hex codes
✅ At least 1 list, 2+ stages, 2+ fields
✅ ZIP contains ONLY: template.json + IMPORT.md
✅ User receives complete summary with file paths and sizes
✅ ZIP contains: template.json, IMPORT.md, .env.example

## Remember

- **Smart questioning** - Ask only when information is insufficient
- **Complete workflow** - Generate JSON → Create ZIP → Report results
- **Both outputs** - Always JSON + ZIP files
- **Proper structure** - Items inside stages, no stageKey
- **Clear summary** - Show all files created with sizes and next steps
