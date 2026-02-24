---
name: template-generator
description: Generate template following data structure format for any industry based on user requirements
version: 1.0.0
---

# Template Generator Skill

## Overview

Generates **template.json file** that follow the **standard data structure** for any industry.

**Announce at start:** "I'll help you build a template that fits your needs perfectly."

## When to Use

- User wants to create a template for tracking ANY type of workflow/tasks
- User needs to organize and track items/processes in their work
- User asks to generate task/workflow management templates

## What This Tool Does

Creates templates following the standard data structure of task management system.

**Work for any workflow, you can imagine!**

**NOT for creating:**

- ❌ Web application templates
- ❌ Document templates (PDF/Markdown)
- ❌ Code templates
- ❌ Templates for other systems (Jira, Trello, Asana, etc.)

---

## The Process

### Step 1: Understand Requirements

**Ask 3-5 questions about template information (if needed):**

- "What would you like to track?" (e.g., bugs, candidates, tasks)
- "What are the main steps in your workflow?" (e.g., New → In Progress → Done)
- "What information do you need for each item?" (e.g., title, priority, assignee)

**Important:** Use simple language, be conversational, focus on understanding - NOT technical details.

---

### Step 2: Build Template JSON Structure

**Create complete template object:**

```javascript
{
  templateKey: "unique_snake_case_id",
  name: "Display Name",
  description: "Brief description",
  icon: "📋",
  isActive: true,
  lists: [{
    name: "List Name",
    fieldDefinitions: [
      {
        key: "field_key",              // snake_case, unique within list
        name: "Field Display Name",
        type: "TEXT|TEXTAREA|SELECT|DATE|DATE_TIME|NUMBER|CHECKBOX|ASSIGNEE|FILE",
        required: true|false,
        order: 0,
        options: [...]                 // For SELECT type: [{value, color, order}]
      }
    ],
    stages: [
      {
        name: "Stage Name",
        color: "#HEX_COLOR",
        order: 0,
        items: []                      // ALWAYS empty for new templates
      }
    ]
  }],
  documents: [                         // Optional: markdown/text documents
    {
      title: "Document Title",
      description: "Brief description",
      content: "Markdown content..."
    }
  ],
  metadata: {
    version: "1.0.0",
    author: "AI Template Generator",
    createdAt: "2026-02-23",
    tags: ["tag1", "tag2"],
    category: "Category"
  }
}
```

**Key Rules:**

- ✅ All keys must be **snake_case**
- ✅ Field `key` must be unique within list
- ✅ `items` arrays should be **empty** for new templates
- ✅ Items must be nested inside stages

---

### Step 3: Write JSON & Generate Documentation

**3.1 Write ONLY ONE JSON file to current directory**

```
template.json
```

**3.2 Generate documentation:**

**Create docs directory:**

```bash
mkdir -p docs
```

**Generate 2-3 files (excel, pdf, word) based on template context:**

- Auto-generate appropriate filenames

---

### Step 4: Package Everything

**Write IMPORT.md:**

**Create template.zip:**

```bash
zip -r template.zip template.json IMPORT.md docs/
```

**ZIP package structure:**

```
template.zip
├── template.json
├── IMPORT.md
└── docs/
    ├── *.xlsx       (Excel file - auto-generated name)
    ├── *.pdf        (PDF file - auto-generated name)
    └── *.docx       (Word file - auto-generated name)
```

### Step 5: Report Success

**Remove temporary files:**

```bash
rm template.json IMPORT.md
rm -rf docs/
```

**Present results to user in friendly format:**

```
✅ Done! Your [Template Name] template is ready!

📋 Template: [Template Name]

📦 The ZIP file includes:
   ✓ template.json - All your template settings
   ✓ IMPORT.md - Simple instructions to import
   ✓ docs/ folder with helpful documents:
     • [List each file with brief description]

🔗 Download link:
   https://your-bucket.s3.amazonaws.com/templates/template.zip

🎯 What's next?
   1. Click the link above to download
   2. Import into your system following IMPORT.md instructions
   3. Start tracking!

🚀 Ready to use!
```

**Note:** The download link is a placeholder S3 URL. When you integrate S3 upload, replace with actual uploaded URL.

**End**

## Best Practices

**Critical:**

- ❌ NEVER write Python code to generate documents
- ❌ NEVER install any libraries (openpyxl, reportlab, python-docx...)
- ❌ NEVER ask about output format (always JSON + ZIP)
