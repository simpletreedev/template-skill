---
name: template-json-generator
description: Generate workflow/task tracking template.json files and package as ZIP. Takes workflow requirements, generates proper JSON structure, and outputs both JSON file and ZIP package ready for import into task management systems.
license: MIT
version: 3.8.0
---

# Template JSON Generator Skill

Generate **task tracking / workflow management templates** from user requirements.

## What This Tool Does

**This tool creates templates for PRIOVS TASK MANAGEMENT SYSTEM.**

The templates are specifically designed for Priovs - your task tracking and workflow management platform.

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
- ❌ Templates for other systems (Jira, Trello, Asana, etc.)

**IMPORTANT:** All templates are for Priovs system ONLY. Never ask which system the user wants to use.

## ⚠️ CRITICAL: Output Format is FIXED - NEVER ASK!

**The output format is ALWAYS and ONLY:**
1. **JSON file**: `[templateKey].template.json`
2. **ZIP package**: `[templateKey].zip` (contains template.json + IMPORT.md)

**🚨 ABSOLUTELY FORBIDDEN - DO NOT ASK:**
- ❌ "Bạn muốn tạo template theo định dạng nào?"
- ❌ "What format do you want?"
- ❌ "Would you like JSON or Excel?"
- ❌ "How should I output this?"
- ❌ ANY questions about output format/file type/structure

**✅ OUTPUT IS FIXED - NO QUESTIONS NEEDED!**

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

## Execution Mode: SMART & FRIENDLY

**Be smart, friendly, and practical. Understand user needs without confusing them.**

### When to Ask Questions

**ONLY ask about template DATA - NEVER ask about output format/processing!**

Ask in a friendly way if these details are unclear:

1. **What to track** (if purpose unclear)
   - ✅ "What would you like to track? For example: bugs, customer requests, job candidates?"

2. **Workflow steps** (if stages unclear)
   - ✅ "What are the main steps in your workflow? Like: New → In Progress → Done?"

**Important Notes:**
- Use simple language, avoid technical jargon
- Be conversational and helpful
- Focus ONLY on understanding what the user wants to track

**NEVER ask about output/processing:**
- ❌ "Bạn muốn tạo template dưới dạng file nào?" (What file type?)
- ❌ "What format/type do you want?" (always JSON + ZIP)
- ❌ "How should I package this?" (always ZIP with IMPORT.md)
- ❌ Technical questions about JSON structure
- ❌ Questions about file locations or packaging
- ❌ Any questions about output format - it's FIXED!

### Auto-Generate Behavior

**Always create empty templates** (no sample items):
- All templates are generated with empty stages
- No fake/dummy data created
- Users add their own real data after import

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
   - **documents** - Auto-generate helpful documents based on template type
   - metadata (version, author, tags)

2. **Auto-generate documents**
   - System automatically creates 2-3 helpful documents based on category:
     - **Bug Tracking**: Bug report template, testing checklist
     - **Recruitment**: Interview questions, evaluation guide
     - **Customer Support**: Response templates, escalation procedures
     - **Project Management**: Project guidelines, meeting notes template
     - **Sales**: Sales process guide, objection handling
     - **Generic**: Getting started guide, team guidelines
   - Each document has: `title`, `content` (markdown), `description`

3. **Create empty stages**
   - All stages are created empty (no items)
   - No sample/dummy data is added

4. **Write ONLY ONE JSON file to current directory**
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

**CRITICAL: If download link exists, MUST include it prominently in summary!**

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

🔗 Download link:
   [MUST SHOW THE ACTUAL DOWNLOAD URL HERE IF IT EXISTS]

🎯 What's next?
   1. Share this link with anyone who needs the template
   2. Or download and upload to your system
   3. The system will read the instructions and set everything up automatically

That's it! Your template is ready to use. 🚀
```

**MANDATORY RULES FOR SUMMARY:**

1. **If `downloadUrl` is returned from the tool:**
   - ✅ **MUST** include "🔗 Download link:" section
   - ✅ **MUST** show the actual URL prominently
   - ✅ **MUST** tell user they can share this link

2. **If `downloadUrl` is null/empty:**
   - ✅ Show local file paths instead
   - ✅ Tell user to upload manually

**Communication style:**
- Use simple, friendly language
- Avoid technical terms (use "settings" instead of "data structure")
- Be encouraging and clear
- **ALWAYS show download link if available**
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

### Document Structure
```json
{
  "title": "Document Title",
  "description": "Brief description of the document",
  "content": "Markdown or plain text content here..."
}
```

**Documents are auto-generated based on template category:**
- Bug Tracking → Bug report template, testing checklist
- Recruitment → Interview questions, evaluation guide
- Customer Support → Response templates, escalation procedures
- Project Management → Project guidelines, meeting notes
- Sales → Sales process guide, objection handling
- Generic → Getting started guide, team guidelines

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

## Tool Usage

AI will call the packaging script internally - no manual usage needed.

The script (`template-skill-generator.js`) receives template JSON from AI and creates the package automatically.

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

## Remember

- **Be friendly and helpful** - Use simple language, avoid technical jargon
- **Smart questioning** - Ask conversationally when info is unclear
- **No fake data** - Never create realistic fake names, companies, or details
- **Empty by default** - Create templates without sample items unless requested
- **Complete workflow** - Gather info → Generate JSON → Create ZIP → Report
- **Both files always** - JSON + ZIP in current directory
- **Proper structure** - Items inside stages, no stageKey
- **Clear summary** - Friendly report with practical next steps

## License

MIT
