---
name: template-generator
description: Generate template.json files following Priovs data structure format for ANY industry/workflow based on user requirements
version: 6.0.0
---

# Template Generator Skill

## Overview

Generates **template.json files** that follow the **Priovs standard data structure** for tracking workflows/tasks in ANY industry or domain.

**This skill creates templates based on user requirements - no industry limitations!**

**Announce at start:** "I'm using the template-generator skill to create your template."

## When to Use

- User wants to create a template for tracking ANY type of workflow/tasks
- User needs to organize and track items/processes in their work
- User describes a workflow they want to manage
- User asks to generate task/workflow management templates

## What This Tool Does

Creates templates specifically designed for **Priovs** - following the standard data structure of Priovs task management system.

**Can create templates for ANY workflow:**
- Business: Sales, Marketing, Operations, Finance, HR
- Development: Bug tracking, Feature requests, Sprints, Code reviews
- Service: Customer support, Helpdesk, Ticketing, Service requests
- Creative: Content pipeline, Design projects, Video production
- Education: Course management, Student tracking, Assignment workflows
- Healthcare: Patient tracking, Appointment scheduling, Treatment plans
- Real estate: Property listings, Client management, Deal pipeline
- Event: Event planning, Vendor management, Guest tracking
- **ANY other workflow you can imagine!**

**NOT for creating:**
- ❌ Web application templates
- ❌ Document templates (PDF/Markdown)
- ❌ Code templates
- ❌ Templates for other systems (Jira, Trello, Asana, etc.)

## The Process

### Step 1: Understand User Requirements

**Ask ONLY about template DATA - NEVER about output format!**

**✅ What to ask if unclear:**

1. **What to track** (if purpose unclear)
   - "What would you like to track? For example: bugs, customer requests, job candidates?"

2. **Workflow steps** (if stages unclear)
   - "What are the main steps in your workflow? Like: New → In Progress → Done?"

**Important:**
- Use simple language, avoid technical jargon
- Be conversational and helpful
- Focus ONLY on understanding what the user wants to track

**❌ NEVER ask about:**
- Output format (always JSON + ZIP)
- File types (always creates JSON)
- How to package (always ZIP with docs/)

### Step 2: Build Template JSON Structure

**Create complete template object:**

```javascript
{
  templateKey: "bug_tracking",
  name: "Bug Tracking",
  description: "Track and manage software bugs",
  icon: "🐛",
  isActive: true,
  lists: [{
    name: "Bugs",
    fieldDefinitions: [
      { name: "Title", type: "TEXT", required: true },
      { name: "Priority", type: "SELECT", options: [...] }
    ],
    stages: [
      { name: "New", color: "#EF4444", order: 0, items: [] },
      { name: "In Progress", color: "#F59E0B", order: 1, items: [] },
      { "Done", color: "#10B981", order: 2, items: [] }
    ]
  }],
  documents: [
    {
      title: "Bug Report Template",
      description: "Standard template for reporting bugs",
      content: "# Bug Report Template\n\n## Description\n..."
    }
  ],
  metadata: {
    version: "1.0.0",
    author: "AI Template Generator",
    createdAt: "2026-02-12",
    tags: ["bugs", "development"],
    category: "Development"
  }
}
```

### Step 3: Generate Documentation Files (Excel/PDF/Word)

**After creating template.json, generate helpful documentation files:**

**3.1. Read the template.json you just created:**
```bash
const template = JSON.parse(fs.readFileSync('[templateKey].template.json', 'utf8'));
```

**3.2. Create JavaScript file(s) to generate docs:**

Create `generate-docs.js` that:
- Reads the template.json
- Generates Excel file (.xlsx) with template data
- Generates PDF file (.pdf) with template guide
- Generates Word file (.docx) with template overview
- Saves files to `docs/` folder

**Example structure:**
```javascript
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

const template = JSON.parse(fs.readFileSync('[templateKey].template.json', 'utf8'));
const outputDir = path.join(__dirname, 'docs');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateDocs() {
  // Create Excel with template data
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Template Overview');
  // ... generate Excel based on template data

  await workbook.xlsx.writeFile(path.join(outputDir, 'template_data.xlsx'));

  // Similar for PDF and Word files
  // ...

  console.log('✅ Documentation files created');
}

generateDocs().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
```

**3.3. Execute the generator:**
```bash
node generate-docs.js
```

**3.4. Clean up generator file:**
```bash
rm generate-docs.js
```

**Documentation files to create:**
- `template_data.xlsx` - Excel spreadsheet with fields, stages, workflow
- `template_guide.pdf` - PDF guide with template overview
- `template_overview.docx` - Word document with detailed information

**All files should be saved in `docs/` folder.**

### Step 4: Package Everything

**Call the packaging function:**

```javascript
const { createSkillPackage } = require('./scripts/template-skill-generator.js');

const result = await createSkillPackage(template);
console.log(JSON.stringify(result, null, 2));
```

**What the script does (you don't need to know, just call it):**

1. Writes `[templateKey].template.json` to current directory
2. Generates `IMPORT.md` with template info and instructions
3. Scans `docs/` folder and includes all files found
4. Creates ZIP file containing:
   - `template.json`
   - `IMPORT.md`
   - `docs/` folder (with all your generated files)
5. Uploads to service (if UPLOAD_SERVICE_URL is set)
6. Returns result object with file paths and download URL

**Important Notes:**
- Markdown/text documents are in template.json (template.documents field)
- Excel/PDF/Word files go in docs/ folder (you generate them)
- Script automatically includes all files from docs/ in the ZIP

**ZIP package structure:**
```
template.zip
├── template.json
├── IMPORT.md
└── docs/
    ├── template_data.xlsx       (you generated this)
    ├── template_guide.pdf        (you generated this)
    └── template_overview.docx    (you generated this)
```

**⚠️ IMPORTANT:**
- **DO NOT** use Read tool to read the script file
- **DO NOT** inspect or analyze the script code
- **JUST CALL** the function with your template object
- Script handles all packaging, upload, and file management

### Step 5: Report Success

**Present results to user in friendly format:**

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
   ✓ docs/ folder with helpful documents:
     • template_data.xlsx - Excel spreadsheet with all data
     • template_guide.pdf - PDF guide with overview
     • template_overview.docx - Word document with details

🔗 Download link:
   [SHOW THE ACTUAL DOWNLOAD URL HERE IF IT EXISTS]

🎯 What's next?
   1. Share this link with anyone who needs the template
   2. Or download and upload to your system
   3. Open the Excel file to see all fields and stages
   4. Open the PDF guide for a printable overview
   5. Open the Word document to review detailed information
   6. The system will read the instructions and set everything up automatically

That's it! Your template is ready to use. 🚀
```

## Template Structure Reference

### Required Fields

```javascript
{
  templateKey: "unique_snake_case_id",
  name: "Display Name",
  description: "Brief description",
  icon: "📋",
  isActive: true,
  lists: [...],
  documents: [...],
  metadata: {...}
}
```

### List Structure

```javascript
{
  name: "List Name",
  description: "Optional description",
  fieldDefinitions: [...],
  stages: [...]
}
```

### Field Definitions

```javascript
{
  name: "Field Display Name",
  type: "TEXT | TEXTAREA | SELECT | DATE | NUMBER | CHECKBOX | USER",
  required: true/false,
  options: [...]  // For SELECT type
}
```

### Stages

```javascript
{
  name: "Stage Name",
  color: "#HEX_COLOR",
  order: 0,
  items: []  // Always empty
}
```

### Documents (Markdown/Text only)

```javascript
{
  title: "Document Title",
  description: "Brief description",
  content: "Markdown or text content here..."
}
```

## Field Types

- **TEXT**: Single line text
- **TEXTAREA**: Multi-line text
- **SELECT**: Dropdown with options
- **DATE**: Date picker
- **NUMBER**: Numeric input
- **CHECKBOX**: Yes/No toggle
- **USER**: User assignment

## Common Issues

### 1. All keys must be snake_case

**❌ Wrong:** `camelCase`, `PascalCase`, `kebab-case`
**✅ Correct:** `snake_case`

## Best Practices

- **Always create empty templates**: No sample items unless explicitly requested
- **Documents in template.json**: Add markdown/text documents to template.documents field
- **Generate docs files**: After template.json, create Excel/PDF/Word files in docs/
- **Clean up generator**: Delete the generator JavaScript file after execution
- **Show download link**: If available, display prominently in summary
- **Use simple language**: Avoid technical jargon when communicating with user
- **Be conversational**: Make interaction friendly and helpful
- **Never ask about format**: Output is always JSON + ZIP with generated docs
- **Proper structure**: Items inside stages, all keys snake_case
- **Complete workflow**: Gather → Build → Generate Docs → Package → Upload → Report

## Success Criteria

✅ Template.json created with complete structure
✅ All keys in snake_case format
✅ Items nested inside stages (empty arrays)
✅ Documents added to template.documents (markdown/text)
✅ Excel/PDF/Word files generated in docs/ folder
✅ Generator script cleaned up (deleted)
✅ ZIP contains: template.json + IMPORT.md + docs/ (with generated files)
✅ User receives complete summary with file paths and download link
✅ Clear, helpful communication throughout

## Files Created

- `[templateKey].template.json` - Template data
- `[templateKey].zip` - Package ready for import
- `docs/` folder (created by you):
  - `template_data.xlsx` - Excel spreadsheet
  - `template_guide.pdf` - PDF guide
  - `template_overview.docx` - Word document
- `generate-docs.js` (temporary - delete after use)
