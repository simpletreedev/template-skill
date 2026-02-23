# TEMPLATE FOLDER STRUCTURE

Room template structure for importing/exporting complete room configurations including entities, flows, and AI workspaces.

```
templates/
├── metadata.json                                    # Template metadata: name, version, author, tags
│
├── entities/
│   ├── lists/
│   │   ├── _lists.json                              # Metadata for all lists
│   │   └── data/                                    # Data folders for each list
│   │       ├── list-template-1/
│   │       │   └── data.json                        # {key, name, fieldDefinitions, stages, defaultItems}
│   │       ├── list-template-2/
│   │       │   └── data.json
│   │       └── ...
│   │
│   ├── documents/
│   │   ├── _documents.json                          # Metadata for all documents
│   │   └── data/                                    # Data folders for each document
│   │       ├── document-template-1/
│   │       │   └── data.json                        # {key, title, description, content}
│   │       ├── document-template-2/
│   │       │   └── data.json
│   │       └── ...
│   │
│   └── files/
│       ├── _manifest.json                           # File metadata: display_name, description, is_embedded
│       └── storage/                                 # Actual files (folder tree = actual hierarchy)
│           ├── folder-a/                            # Folder name = name in privos_folders
│           │   ├── report.pdf
│           │   └── data.xlsx
│           ├── folder-b/
│           │   └── subfolder-b1/
│           │       └── image.png
│           └── file.txt                             # Root-level file
│
├── flows/
│   ├── automations/
│   │   ├── _automations.json                        # Metadata for all automations
│   │   └── data/                                    # Data folders for each automation
│   │       ├── automation-1/
│   │       │   └── data.json                        # {flowId, triggers[], actions[], claudeWs?, description}
│   │       ├── automation-2/
│   │       │   └── data.json
│   │       └── ...
│   │
│   └── chat-agents/
│       ├── _agents.json                             # Metadata for all chat-agents
│       └── data/                                    # Data folders for each agent
│           ├── agent-1/
│           │   └── data.json                        # {flowId, name, claudeWs?, agentPrompt?, commands[]}
│           ├── agent-2/
│           │   └── data.json
│           └── ...
│
├── claude-ws/
│   ├── _workspaces.json                             # Metadata for all workspaces
│   └── data/                                        # Data folders for each workspace
│       ├── claude-ws-1/
│       │   ├── _config.json                         # {name, description, model?, temperature?, maxTokens?}
│       │   ├── system-prompt.md
│       │   ├── agents/                              # Agent prompt templates
│       │   │   ├── agent-1.md
│       │   │   └── agent-2.md
│       │   ├── skills/                              # AI capabilities
│       │   │   ├── skill-1.md
│       │   │   └── skill-2.md
│       │   └── commands/                            # Slash command prompts
│       │       ├── command-1.md
│       │       └── command-2.md
│       ├── claude-ws-2/
│       │   └── ...
│       └── ...
│
└── IMPORT.md                                        # Import instructions for AI
```

---

## METADATA FILES

### metadata.json (Template-level)

```json
{
  "name": "Project Management Template",
  "version": "1.0.0",
  "description": "Professional project management with tasks, milestones, and AI assistance",
  "icon": "briefcase",
  "author": "Privos Team",
  "tags": ["project-management", "tasks", "milestones"],
  "requires": {
    "minAppVersion": "1.0.0",
    "features": ["file-management", "ai-chat", "automations"]
  },
  "exports": {
    "lists": 3,
    "documents": 2,
    "files": 5,
    "automations": 2,
    "chatAgents": 1,
    "claudeWorkspaces": 1
  }
}
```

---

### entities/lists/_lists.json

```json
{
  "version": "1.0",
  "lists": [
    {
      "key": "list-template-1",
      "name": "Project Tasks",
      "description": "Track tasks across project stages",
      "file": "data/list-template-1/data.json",
      "order": 1
    },
    {
      "key": "list-template-2",
      "name": "Sprint Backlog",
      "description": "Agile sprint backlog management",
      "file": "data/list-template-2/data.json",
      "order": 2
    }
  ]
}
```

---

### entities/documents/_documents.json

```json
{
  "version": "1.0",
  "documents": [
    {
      "key": "document-template-1",
      "title": "Project Overview",
      "description": "High-level project description and goals",
      "file": "data/document-template-1/data.json",
      "order": 1
    },
    {
      "key": "document-template-2",
      "title": "Meeting Notes",
      "description": "Weekly meeting notes and action items",
      "file": "data/document-template-2/data.json",
      "order": 2
    }
  ]
}
```

---

### entities/files/_manifest.json

```json
{
  "version": "1.0",
  "files": {
    "folder-a/report.pdf": {
      "display_name": "Q4 2024 Report.pdf",
      "description": "Quarterly performance report",
      "is_embedded": true
    },
    "folder-a/data.xlsx": {
      "display_name": "Project Data.xlsx",
      "description": "Raw data for analysis",
      "is_embedded": false
    },
    "folder-b/subfolder-b1/image.png": {
      "display_name": "Homepage Mockup.png",
      "description": "Initial homepage design",
      "is_embedded": false
    },
    "file.txt": {
      "display_name": "README.txt",
      "description": "Template instructions",
      "is_embedded": false
    }
  }
}
```

---

### flows/automations/_automations.json

```json
{
  "version": "1.0",
  "automations": [
    {
      "key": "automation-1",
      "name": "Notify on Task Created",
      "description": "Sends notification when a new task is created",
      "file": "data/automation-1/data.json",
      "triggers": ["item_created"],
      "order": 1
    },
    {
      "key": "automation-2",
      "name": "Daily Digest",
      "description": "Sends daily summary of project activities",
      "file": "data/automation-2/data.json",
      "triggers": ["schedule"],
      "order": 2
    }
  ]
}
```

---

### flows/chat-agents/_agents.json

```json
{
  "version": "1.0",
  "agents": [
    {
      "key": "agent-1",
      "name": "Project Assistant",
      "description": "AI assistant for project management questions",
      "file": "data/agent-1/data.json",
      "claudeWs": "claude-ws-1",
      "order": 1
    },
    {
      "key": "agent-2",
      "name": "Code Reviewer",
      "description": "AI assistant for code review and quality checks",
      "file": "data/agent-2/data.json",
      "claudeWs": "claude-ws-2",
      "order": 2
    }
  ]
}
```

---

### claude-ws/_workspaces.json

```json
{
  "version": "1.0",
  "workspaces": [
    {
      "key": "claude-ws-1",
      "name": "Project AI Workspace",
      "description": "AI workspace for project management tasks",
      "folder": "data/claude-ws-1",
      "model": "claude-3-5-sonnet",
      "order": 1
    },
    {
      "key": "claude-ws-2",
      "name": "Code Review Workspace",
      "description": "AI workspace for code review tasks",
      "folder": "data/claude-ws-2",
      "model": "claude-3-5-sonnet",
      "order": 2
    }
  ]
}
```

---

## DATA FILES

### entities/lists/data/{list-slug}/data.json

```json
{
  "key": "list-project-tasks",
  "aliasKey": "TSK",
  "name": "Project Tasks",
  "description": "Track tasks across project stages",
  "fieldDefinitions": [
    {
      "_id": "field_priority",
      "name": "Priority",
      "type": "SELECT",
      "options": [
        { "_id": "pri_high", "value": "High", "color": "#FF4444", "order": 1 },
        { "_id": "pri_medium", "value": "Medium", "color": "#FFB800", "order": 2 },
        { "_id": "pri_low", "value": "Low", "color": "#00D449", "order": 3 }
      ],
      "order": 1
    },
    {
      "_id": "field_assignee",
      "name": "Assignee",
      "type": "USER",
      "order": 2
    }
  ],
  "stages": [
    { "key": "stage_backlog", "name": "Backlog", "order": 1, "color": "#8B8B8B" },
    { "key": "stage_in_progress", "name": "In Progress", "order": 2, "color": "#FFB800" },
    { "key": "stage_review", "name": "Review", "order": 3, "color": "#C377E0" },
    { "key": "stage_done", "name": "Done", "order": 4, "color": "#61BD4F" }
  ],
  "defaultItems": [
    {
      "key": "item_setup",
      "name": "Setup Project",
      "description": "Initialize project repository",
      "listKey": "list-project-tasks",
      "stageKey": "stage_done",
      "order": 1,
      "customFields": [
        { "fieldId": "field_priority", "value": "pri_high" }
      ]
    }
  ]
}
```

---

### entities/documents/data/{doc-slug}/data.json

```json
{
  "key": "doc-project-overview",
  "title": "Project Overview",
  "description": "High-level project description and goals",
  "content": "## Project Overview\n\nThis project aims to develop a comprehensive project management system with AI assistance.\n\n### Goals\n1. Provide intuitive task tracking\n2. Enable automated workflows\n3. Integrate AI-powered assistants\n\n### Success Criteria\n- All tasks tracked and managed efficiently\n- Automated notifications working correctly\n- AI assistants providing helpful responses"
}
```

---

### flows/automations/data/{automation-slug}/data.json

```json
{
  "flowId": "flow-task-notif",
  "name": "Notify on Task Created",
  "triggers": [
    {
      "type": "item_created",
      "listKey": "list-project-tasks"
    }
  ],
  "actions": [
    {
      "type": "send_notification",
      "message": "New task created: {{item.title}}"
    }
  ],
  "claudeWs": "claude-ws-1",
  "description": "Sends notification when a new task is created"
}
```

---

### flows/chat-agents/data/{agent-slug}/data.json

```json
{
  "flowId": "flow-project-assistant",
  "name": "Project Assistant",
  "description": "AI assistant for project management questions",
  "claudeWs": "claude-ws-1",
  "agentPrompt": "project-assistant.md",
  "commands": [
    {
      "name": "/summary",
      "description": "Get project summary",
      "skill": "summarize.md"
    },
    {
      "name": "/tasks",
      "description": "List all tasks",
      "skill": "task-list.md"
    }
  ]
}
```

---

### claude-ws/data/{ws-slug}/_config.json

```json
{
  "name": "Project AI Workspace",
  "description": "AI workspace for project management tasks",
  "model": "claude-3-5-sonnet",
  "temperature": 0.7,
  "maxTokens": 4096
}
```

---

### claude-ws/data/{ws-slug}/system-prompt.md

```markdown
# System Prompt

You are a helpful AI assistant for project management. Your role is to help users:

1. Track and manage project tasks
2. Provide insights on project progress
3. Assist with sprint planning and retrospectives
4. Answer questions about project documentation

Always be concise, actionable, and friendly.
```

---

### claude-ws/data/{ws-slug}/agents/agent-1.md

```markdown
# Project Assistant Agent

You are the Project Assistant. You help users with:

- Task management and organization
- Sprint planning
- Progress tracking
- Team coordination

Be proactive in suggesting improvements and identifying potential issues.
```

---

### claude-ws/data/{ws-slug}/skills/skill-1.md

```markdown
# Task Analysis Skill

When analyzing tasks, consider:

1. **Priority**: Is this task urgent or important?
2. **Dependencies**: Does this task depend on other tasks?
3. **Effort**: How much work is required?
4. **Assignee**: Who is best suited for this task?

Provide a structured analysis with recommendations.
```

---

### claude-ws/data/{ws-slug}/commands/command-1.md

```markdown
# /summary Command

Generate a concise project summary including:

- Total tasks by stage (backlog, in progress, review, done)
- High priority tasks
- Upcoming deadlines
- Blockers or risks

Keep it under 200 words.
```

---

## IMPORT LOGIC

### Files & Folders Import

When importing files from template:

1. Walk through `storage/` directory recursively
2. For each directory:
   - Create `privos_folders` record with `name` = folder name, `father` = parent folder `_id`
3. For each file:
   - Look up metadata in `_manifest.json` using path
   - Upload to MinIO with path `{channelId}/{fileId}.{ext}`
   - Create `privos_files` record with `folder_id` = parent folder `_id`, metadata from manifest

### Lists Import

1. Parse `_lists.json` to get all list definitions
2. For each list entry:
   - Read corresponding `data/{list-slug}/data.json`
   - Create list record with fieldDefinitions, stages
   - Import defaultItems if present

### Documents Import

1. Parse `_documents.json` to get all document definitions
2. For each document entry:
   - Read corresponding `data/{doc-slug}/data.json`
   - Create document record with content

### Automations Import

1. Parse `_automations.json` to get all automation definitions
2. For each automation entry:
   - Read corresponding `data/{automation-slug}/data.json`
   - Register automation with AI server using `flowId`
   - Link to claude workspace if `claudeWs` provided

### Chat Agents Import

1. Parse `_agents.json` to get all agent definitions
2. For each agent entry:
   - Read corresponding `data/{agent-slug}/data.json`
   - Register chat agent with AI server using `flowId`
   - Link to claude workspace and load agent prompt if provided
   - Register commands with references to workspace skills

### Claude Workspaces Import

1. Parse `_workspaces.json` to get all workspace definitions
2. For each workspace entry:
   - Read `_config.json` for workspace settings
   - Load `system-prompt.md` as base system prompt
   - Load all `.md` files from `agents/`, `skills/`, `commands/` directories
   - Register workspace context with AI server

---

## KEY DESIGN DECISIONS

### Why metadata.json files for each entity type?

- **Consistency**: Every entity type has a central metadata file
- **Discoverability**: Can quickly see all items in a template without reading each data file
- **Flexibility**: Can add metadata (descriptions, ordering, tags) without changing data structure
- **Validation**: Metadata can include validation rules or dependencies

### Why separate data/ folders?

- **Clean separation**: Metadata vs actual data
- **Scalability**: Easy to add/remove items by updating metadata
- **Reusability**: Data files can be shared across templates if needed
- **Versioning**: Can track changes to metadata and data separately

### Why files/storage/ mirrors folder hierarchy?

- **Intuitive**: Folder structure on disk matches database structure
- **Simple import**: Walk directory tree, create records in order
- **Human-readable**: Easy to navigate and understand template contents
- **No need for separate folder metadata**: Folder names are self-describing

### Why _manifest.json for files?

- **Override capabilities**: Can set display_name different from filename
- **Metadata**: is_embedded, descriptions, and other file-specific settings
- **Future-proofing**: Can add more metadata without changing import logic
- **No folder metadata needed**: Folder structure in `storage/` maps directly to database (folder name on disk = folder name in `privos_folders`)
