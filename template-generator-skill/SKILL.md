---
name: template-generator
description: Generate template.json files following Priovs data structure format for ANY industry/workflow based on user requirements
version: 4.2.0
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

**Works for ALL industries:** Development, Business, Healthcare, Education, Real Estate, Manufacturing, Retail, Services, Creative, Events, **ANY domain!**

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

**Examples (not limitations):**
- Bug tracking, Recruitment, Customer support
- Project management, Sales pipeline, Content creation
- Inventory, Orders, Appointments
- Custom workflows for your specific needs

**NOT for creating:**
- ❌ Web application templates
- ❌ Document templates (PDF/Markdown)
- ❌ Code templates
- ❌ Templates for other systems (Jira, Trello, Asana, etc.)

**IMPORTANT:**
- All templates follow Priovs data structure standards
- Can create templates for ANY industry/domain/workflow
- Never ask which system the user wants to use - it's always Priovs

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
- "Bạn muốn tạo template dưới dạng file nào?" (What file type?)
- "What format/type do you want?" (always JSON + ZIP)
- "How should I package this?" (always ZIP with IMPORT.md)
- Output format - it's FIXED as JSON + ZIP!

### Step 2: Build Template JSON Structure

**Create complete template object in memory with:**

1. **Basic info:**
   - templateKey (snake_case from name)
   - name, description, icon
   - metadata (version, author, tags, category)

2. **Lists with:**
   - Fields (TEXT, TEXTAREA, SELECT, DATE, etc.)
   - Stages (To Do, In Progress, Done, etc.)
   - Empty items (no sample data)

3. **Documents (in template.documents field):**
   - Add helpful documents directly to template.documents array
   - Each document has: `title`, `description`, `content` (markdown text)
   - **Examples by category:**
     - **Development**: Bug report template, testing checklist
     - **HR/Recruitment**: Interview questions, evaluation guide
     - **Customer Service**: Response templates, escalation procedures
     - **Project Management**: Project guidelines, meeting notes
     - **Sales/Business**: Sales process guide, objection handling
     - **Generic**: Getting started guide, team guidelines
   - **These documents are already in template.json - no need to create separate files!**

**⚠️ IMPORTANT - Documents Strategy:**
- **Markdown/Text documents**: Add to `template.documents` field (already in JSON)
- **Binary documents (docx/excel/pdf)**: Use `additionalFiles` parameter (Step 3)
- **Do NOT duplicate** - if content is in template.documents, don't create separate file

**Example structure:**
```javascript
{
  templateKey: "bug_tracking",
  name: "Bug Tracking",
  description: "Track and manage software bugs",
  icon: "🐛",
  isActive: true,
  lists: [{
    key: "bugs",
    name: "Bugs",
    fieldDefinitions: [
      { key: "title", name: "Title", type: "TEXT", required: true },
      { key: "priority", name: "Priority", type: "SELECT", options: [...] }
    ],
    stages: [
      { key: "new", name: "New", color: "#EF4444", order: 0, items: [] },
      { key: "in_progress", name: "In Progress", color: "#F59E0B", order: 1, items: [] },
      { key: "done", name: "Done", color: "#10B981", order: 2, items: [] }
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

### Step 3: Create Package Files

**AI executes packaging internally - DO NOT read script file!**

**How to use:**

AI builds the complete template JSON object in memory, then calls the packaging function:

```javascript
const { createSkillPackage } = require('./scripts/template-skill-generator.js');

// Basic usage - just template
const result = await createSkillPackage(template);

// With additional documents (docx, excel, pdf, etc.)
const additionalFiles = [
  {
    filename: 'interview_template.docx',
    buffer: Buffer.from(docxContent)  // Binary content for docx/pdf/excel
  },
  {
    filename: 'checklist.md',
    content: '# Checklist\n...'  // Text content for md/txt
  }
];
const result = await createSkillPackage(template, null, additionalFiles);
```

**⚠️ IMPORTANT:**
- **DO NOT** use Read tool to read the script file
- **DO NOT** inspect or analyze the script code
- **JUST CALL** the function with your template object
- The script is already available in the skill package

**Additional Files Parameter (Optional):**

**ONLY use for binary documents (docx, excel, pdf) - NOT for markdown/text!**

If you need to include binary documents:

```javascript
additionalFiles = [
  {
    filename: 'form_template.docx',  // Word document
    buffer: Buffer.from(...)          // Binary content
  },
  {
    filename: 'data_sheet.xlsx',     // Excel spreadsheet
    buffer: Buffer.from(...)          // Binary content
  },
  {
    filename: 'handbook.pdf',         // PDF document
    buffer: Buffer.from(...)          // Binary content
  }
]
```

**DO NOT add markdown/text files here - they're already in template.documents!**

**These files will be added to `docs/` folder in the ZIP package.**

**What the script does (you don't need to know, just call it):**

1. Writes `[templateKey].template.json` to current directory
   - **Includes all documents from template.documents field**
2. Generates `IMPORT.md` with template info and instructions
3. Creates `docs/` folder and writes additional binary files (if provided)
   - **ONLY for docx/excel/pdf - NOT for markdown/text**
4. Creates ZIP file containing:
   - `template.json` (with documents field)
   - `IMPORT.md`
   - `docs/` folder (only if binary files provided)
5. Uploads to service (if UPLOAD_SERVICE_URL is set)
6. Returns result object with file paths and download URL

**Important Notes:**
- Markdown/text documents are in template.json (template.documents field)
- Binary documents (docx/excel/pdf) go in docs/ folder
- Don't duplicate content between template.documents and additionalFiles

**Output location:** Current directory

**Files created:**
- `[templateKey].template.json` - Template data
- `[templateKey].zip` - Package ready for import
- `docs/` folder (if additional files provided)

**ZIP package structure:**
```
template.zip
├── template.json
├── IMPORT.md
└── docs/              (optional)
    ├── document.docx
    ├── spreadsheet.xlsx
    ├── guide.pdf
    └── notes.md
```

**⚠️ CRITICAL - DO NOT CREATE:**
- ❌ Folders OTHER THAN `docs/` (no packages/, reports/, scripts/, templates/)
- ❌ Config files (package.json, package-lock.json, config-*.json)
- ❌ Documentation files in root (CLAUDE.md, README.md, .env.example)
- ❌ Any other files or directories

**✅ ALLOWED TO CREATE:**
- `[templateKey].template.json` in current directory
- `[templateKey].zip` in current directory
- `docs/` folder with additional documents (optional)

### Step 4: Report Results to User

**Provide a friendly, clear summary:**

**✅ MUST include download link if available:**

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
   [SHOW THE ACTUAL DOWNLOAD URL HERE IF IT EXISTS]

🎯 What's next?
   1. Share this link with anyone who needs the template
   2. Or download and upload to your system
   3. The system will read the instructions and set everything up automatically

That's it! Your template is ready to use. 🚀
```

**Communication style:**
- Use simple, friendly language
- Avoid technical terms (use "settings" instead of "data structure")
- Be encouraging and clear
- **ALWAYS show download link if available**
- Show practical next steps

## Template Structure Reference

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
  "items": []  // Items INSIDE stage - no stageKey needed
}
```

### Document Structure
```json
{
  "title": "Document Title",
  "description": "Brief description",
  "content": "Markdown or plain text content..."
}
```

## Field Types

| Type | Usage | Example |
|------|-------|---------|
| TEXT | Short text | "Task name" |
| TEXTAREA | Long text | "Description..." |
| NUMBER | Numeric value | 100 |
| DATE | Date only | "2026-02-10" |
| DATE_TIME | Date + time | "2026-02-10T10:00:00Z" |
| SELECT | Single choice | "High" |
| MULTI_SELECT | Multiple choices | ["tag1", "tag2"] |
| CHECKBOX | Boolean | true/false |
| ASSIGNEE | User assignment | user_id |
| DEADLINE | Due date | "2026-02-15" |
| FILE | Single file | file object |
| FILE_MULTIPLE | Multiple files | [files] |
| USER | User reference | user_id |

## Default Inference

If user doesn't specify:

**Stages:**
```javascript
["To Do", "In Progress", "Done"]
```

**Fields:**
```javascript
[
  { name: "Title", type: "TEXT", required: true },
  { name: "Description", type: "TEXTAREA" },
  { name: "Priority", type: "SELECT", options: [
    { value: "High", color: "#EF4444", order: 0 },
    { value: "Medium", color: "#F59E0B", order: 1 },
    { value: "Low", color: "#10B981", order: 2 }
  ]}
]
```

**Default Colors:**
```javascript
["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#6B7280"]
```

## Upload Service Integration

**Configuration:**

Set environment variable:
```bash
UPLOAD_SERVICE_URL=https://your-upload-service.com
```

**How it works:**

1. After creating ZIP → Uploads to service
2. POST to `/uploads` endpoint with multipart/form-data
3. Receives download URL in response
4. Returns URL to AI for display to user

**If not configured:**
- ZIP saved locally only
- No download link available
- User uploads manually

## Common Issues

### Files Not Created

**Symptoms:** No .template.json or .zip files in directory

**Solutions:**
- Check that `createSkillPackage()` was called with valid template
- Verify template has required fields (templateKey, name, lists)
- Check file write permissions in current directory

### Download Link Not Shown

**Symptoms:** Files created but no download link in summary

**Solutions:**
- Verify UPLOAD_SERVICE_URL is set in environment
- Check upload service is accessible
- Ensure service returns valid URL in response
- **CRITICAL:** AI must display downloadUrl from result object

### Invalid Template Structure

**Symptoms:** Template fails validation on import

**Solutions:**
- Verify all keys are snake_case
- Check items are nested inside stages (not separate with stageKey)
- Ensure colors are valid hex codes (#RRGGBB)
- Validate fieldDefinitions have required properties

### Documents Not Generated

**Symptoms:** documents array is empty

**Solutions:**
- Auto-generation works based on category/name detection
- If category doesn't match presets → generic documents are added
- Documents are always added (either specific or generic)

## Integration with Development Workflow

### Template Creation Flow

1. User requests template
2. AI gathers requirements (asks if needed)
3. AI builds template JSON in memory
4. AI calls `createSkillPackage(template)`
5. Script creates files and uploads
6. AI displays summary with download link

### After Template Creation

1. User downloads ZIP or shares link
2. User uploads to Priovs system
3. System reads IMPORT.md for instructions
4. System imports template.json structure
5. Template ready to use in Priovs

## Best Practices

- **Always create empty templates**: No sample items unless explicitly requested
- **Documents in template.json**: Add markdown/text documents to template.documents field
- **Binary files separate**: Only use additionalFiles for docx/excel/pdf
- **Don't duplicate content**: If in template.documents, don't create separate file
- **Show download link**: If available, display prominently in summary
- **Use simple language**: Avoid technical jargon when communicating with user
- **Be conversational**: Make interaction friendly and helpful
- **Never ask about format**: Output is always JSON + ZIP
- **Proper structure**: Items inside stages, all keys snake_case
- **Complete workflow**: Gather → Build → Package → Upload → Report

## Success Criteria

✅ Files created in current directory:
   - `[templateKey].template.json` (always)
   - `[templateKey].zip` (always)
   - `docs/` folder (optional - if additional files provided)
✅ NO folders created OTHER THAN `docs/` (no packages/, scripts/, templates/)
✅ NO config files created (no package.json, CLAUDE.md, etc.)
✅ JSON has valid structure (lists → stages → items)
✅ All keys are snake_case
✅ Colors are valid hex codes
✅ At least 1 list, 2+ stages, 2+ fields
✅ ZIP contains: template.json + IMPORT.md + docs/ (if provided)
✅ User receives complete summary with file paths and download link
✅ Documents auto-generated based on category
✅ Additional files (docx/excel/pdf) in docs/ folder if AI generated them
