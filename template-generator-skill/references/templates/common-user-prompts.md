# Common User Prompt Templates

This file contains reusable user prompt templates for optional steps.

---

## Optional Step Introduction Prompt

**Use this to introduce ALL optional steps:**

```
Do you need any **{section}** in this template?

{section_description}

Type 'skip' to continue, or tell me what {item_type} you need.
```

---

## Section Descriptions & Examples

| Step        | section     | section_description                                              | item_type   | Examples                                                                                                                                                                                                                               |
| ----------- | ----------- | ---------------------------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Documents   | Documents   | Documents are like wiki pages - great for:                       | documents   | 📖 Project documentation, 📋 Process guides, 📝 Meeting notes, 📚 Standard operating procedures                                                                                                                                        |
| Files       | Files       | I can generate:                                                  | files       | 📊 Excel files (.xlsx) - For budgets, trackers, data tables; 📄 Word files (.docx) - For guides, reports, documents; 📋 PDF files (.pdf) - For finalized reports, summaries                                                            |
| Automations | Automations | Automations are smart rules that save time:                      | automations | 🔔 Send notifications when tasks are created/updated; 📧 Send emails when items move to specific stages; ✅ Auto-assign tasks based on conditions; 📋 Create follow-up items automatically; 🔄 Move items between stages automatically |
| Chat Agents | Chat Agents | Chat agents are AI assistants that can help with specific tasks: | agents      | 🔍 Code review and analysis; 📝 Writing and editing assistance; 📊 Data analysis and reporting; 🎯 Task management and coordination; 💬 Customer support and Q&A                                                                       |

---

## AI Instructions

**When introducing an optional step:**

1. Use the Optional Step Introduction Prompt above
2. Replace placeholders using the table below:
   - `{section}` → Section name from table
   - `{section_description}` → Pick appropriate description OR use the emoji list above
   - `{item_type}` → Item type from table (for "tell me what..." part)

**Example for Documents:**

```
Do you need any **Documents** in this template?

Documents are like wiki pages - great for:
📖 Project documentation
📋 Process guides
📝 Meeting notes
📚 Standard operating procedures

Type 'skip' to continue, or tell me what documents you need.
```

**Example for Files:**

```
Do you need any **Files** in this template?

I can generate:
📊 Excel files (.xlsx) - For budgets, trackers, data tables
📄 Word files (.docx) - For guides, reports, documents
📋 PDF files (.pdf) - For finalized reports, summaries

Type 'skip' to continue, or tell me what files you need.
```
