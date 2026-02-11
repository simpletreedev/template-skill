---
name: template-json-generator
description: Generate workflow/task tracking template.json files and package as ZIP. Takes workflow requirements, generates proper JSON structure, and outputs both JSON file and ZIP package ready for import into task management systems.
license: MIT
version: 3.3.0
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

## Execution Mode: SMART & FRIENDLY

**Be smart, friendly, and practical. Understand user needs without confusing them.**

### When to Ask Questions

Ask in a friendly way if these details are unclear:

1. **What to track** (if just "create template")
   - "What would you like to track? For example: bugs, customer requests, job candidates?"

2. **Workflow steps** (if stages unclear)
   - "What are the main steps in your workflow? Like: New → In Progress → Done?"

3. **Sample data preference** (ALWAYS ask for clarity)
   - "Would you like me to add some example items to see how it works, or just create an empty template?"

**Important Notes:**
- Use simple language, avoid technical jargon
- Be conversational and helpful
- Don't make assumptions about sample data

**NEVER ask:**
- ❌ "What format/type?" (always JSON + ZIP)
- ❌ Technical questions about JSON structure
- ❌ Questions about file locations or packaging

### Sample Items Policy

**CRITICAL: Do NOT create fake/dummy data!**

When generating sample items:
- ✅ **If user wants examples**: Create 1-2 generic items with placeholder names
  - Use neutral names: "Sample Task 1", "Example Item"
  - Use generic descriptions: "Description here"
- ❌ **NEVER create realistic fake data**:
  - Don't invent people's names (e.g., "John Doe", "Alice")
  - Don't make up real-sounding companies, projects, or details
  - Don't create fake bug reports, customer names, candidate info

**Default behavior**: Create empty template (no items) unless user explicitly asks for examples.

### When to Auto-Generate

Generate immediately if:
- User request is clear (e.g., "bug tracking", "customer support")
- Can infer reasonable workflow steps
- Can use standard fields (name, description, status)

**Auto-generate with empty stages** (no sample items) for:
- "Create bug tracking template"
- "I need to track customer support tickets"
- "Track recruitment pipeline"

Only add sample items if user specifically asks or confirms they want examples.

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
   - templateKey (snake_case from template name)
   - name, description, icon
   - lists with fields and workflow stages
   - metadata (version, author, tags)

2. **Add items based on user preference**
   - **Default**: Empty stages (no items)
   - **If user wants examples**: Add 1-2 simple placeholder items
     - Use generic names: "Sample Task 1", "Example Item"
     - Use placeholder text: "Description here"
     - **NEVER** use fake realistic data (no fake names, companies, etc.)

3. **Write ONLY ONE JSON file to current directory**
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

**Provide a friendly, clear summary:**

```
✅ Done! Your [Template Name] template is ready!

📋 Template: [Template Name]
🔑 ID: [templateKey]
📁 Category: [Category]

📄 Created 2 files:
   1. [templateKey].template.json ([size] KB) - Your template data
   2. [templateKey].zip ([size] KB) - Ready to import

📦 The ZIP file includes:
   ✓ template.json - All your template settings
   ✓ IMPORT.md - Simple instructions to import

🎯 What's next?
   1. Take the ZIP file ([templateKey].zip)
   2. Upload it to your system
   3. The system will read the instructions and set everything up automatically

That's it! Your template is ready to use. 🚀
```

**Communication style:**
- Use simple, friendly language
- Avoid technical terms (use "settings" instead of "data structure")
- Be encouraging and clear
- Show practical next steps

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

### Example 1: Clear Request - Auto-generate Empty Template

**User:** "Create a customer support ticket system"

**AI thinks:** Purpose is clear, can infer workflow. Create empty template.

**AI Response:**
```
✅ Done! Your Customer Support Tickets template is ready!

📋 Template: Customer Support Tickets
🔑 ID: customer_support_tickets
📁 Category: Customer Support

📄 Created 2 files:
   1. customer_support_tickets.template.json (3.2 KB) - Your template data
   2. customer_support_tickets.zip (7.5 KB) - Ready to import

📦 The ZIP file includes:
   ✓ template.json - All your template settings
   ✓ IMPORT.md - Simple instructions to import

🎯 What's next?
   1. Take the ZIP file (customer_support_tickets.zip)
   2. Upload it to your system
   3. The system will read the instructions and set everything up automatically

That's it! Your template is ready to use. 🚀
```

**Template created with:**
- Stages: New, In Progress, Waiting on Customer, Resolved
- Fields: Ticket Title, Customer Name, Description, Priority, Status
- **Items: Empty** (no sample data)

---

### Example 2: Vague Request - Ask Friendly Questions

**User:** "Create a template"

**AI Response:**
```
I'd be happy to help you create a template!

To make it useful for you, could you tell me:
1. What would you like to track? (like bugs, customer requests, job candidates, tasks, etc.)
2. What are the main steps in your process? (for example: New → In Progress → Done)

This will help me set up the right workflow for you!
```

**User:** "Track job candidates in our hiring process"

**AI Response:**
```
Perfect! One more quick question - would you like me to add a couple of example candidates to show how it works, or just create an empty template?
```

**User:** "Just empty, we'll add our own candidates"

**AI generates:** Empty recruitment template with stages but no sample items.

---

### Example 3: Request with Sample Data Preference

**User:** "Create bug tracking template with some examples"

**AI Response:**
```
✅ Done! Your Bug Tracking template is ready!

📋 Template: Bug Tracking
🔑 ID: bug_tracking
📁 Category: Development

📄 Created 2 files:
   1. bug_tracking.template.json (3.8 KB) - Your template data
   2. bug_tracking.zip (8.1 KB) - Ready to import

📦 The ZIP file includes:
   ✓ template.json - All your template settings (with 2 example bugs)
   ✓ IMPORT.md - Simple instructions to import

🎯 What's next?
   1. Take the ZIP file (bug_tracking.zip)
   2. Upload it to your system
   3. The system will read the instructions and set everything up automatically

That's it! Your template is ready to use. 🚀

ℹ️ Note: I added 2 simple example bugs so you can see how it works.
   Feel free to delete them and add your real bugs!
```

**Sample items added (generic placeholders):**
- "Sample Bug 1" - Description here
- "Sample Bug 2" - Another example

**NOT added (fake realistic data):**
- ❌ "Login page crashes when..." (too specific/realistic)
- ❌ "John Doe reported..." (fake person name)

---

### Example 4: Recruitment Template - Empty (Realistic Use Case)

**User:** "I need a template for tracking developer recruitment"

**AI thinks:** This is for real recruitment, they have real candidates. Should NOT create fake candidate names!

**AI Response:**
```
✅ Done! Your Developer Recruitment template is ready!

📋 Template: Developer Recruitment
🔑 ID: developer_recruitment
📁 Category: HR & Recruitment

📄 Created 2 files:
   1. developer_recruitment.template.json (2.9 KB) - Your template data
   2. developer_recruitment.zip (6.8 KB) - Ready to import

📦 The ZIP file includes:
   ✓ template.json - All your template settings
   ✓ IMPORT.md - Simple instructions to import

🎯 What's next?
   1. Take the ZIP file (developer_recruitment.zip)
   2. Upload it to your system
   3. The system will read the instructions and set everything up automatically

That's it! Your template is ready to use. 🚀

ℹ️ Your template has these workflow stages:
   → CV Screening → Phone Interview → Technical Test → Final Interview → Offer → Hired

   The template is empty and ready for you to add your real candidates!
```

**Template created with:**
- Stages: CV Screening, Phone Interview, Technical Test, Final Interview, Offer, Hired
- Fields: Candidate Name, Email, Phone, Resume, Skills, Experience, Notes
- **Items: EMPTY** - User will add real candidates, not fake ones!

## Critical Rules

1. **BE FRIENDLY** - Use simple language, be helpful and encouraging
2. **ASK SMART** - Only ask when truly needed, in a conversational way
3. **NO FAKE DATA** - Never create fake realistic names, companies, or details
4. **EMPTY BY DEFAULT** - Create empty templates unless user asks for examples
5. **BOTH FILES ALWAYS** - Always create JSON + ZIP files
6. **ITEMS IN STAGES** - Never use stageKey, items array is inside each stage
7. **SNAKE_CASE KEYS** - All keys must be snake_case
8. **SEQUENTIAL ORDER** - Start from 0, increment
9. **VALID COLORS** - Use hex colors from default palette
10. **CLEAR SUMMARY** - Always provide friendly, clear result summary

## Communication Guidelines

**Friendly & Clear:**
- ✅ "Done! Your template is ready!"
- ✅ "What would you like to track?"
- ✅ "Take the ZIP file and upload it"

**Avoid Technical Jargon:**
- ❌ "Template data structure generated"
- ❌ "Execute package creation process"
- ❌ "Initialize metadata object"

**Use:**
- "Template settings" instead of "data structure"
- "Create" instead of "generate/initialize"
- "Upload" instead of "deploy/provision"
- "Ready to use" instead of "production-ready"

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

- **Be friendly and helpful** - Use simple language, avoid technical jargon
- **Smart questioning** - Ask conversationally when info is unclear
- **No fake data** - Never create realistic fake names, companies, or details
- **Empty by default** - Create templates without sample items unless requested
- **Complete workflow** - Gather info → Generate JSON → Create ZIP → Report
- **Both files always** - JSON + ZIP in current directory
- **Proper structure** - Items inside stages, no stageKey
- **Clear summary** - Friendly report with practical next steps
