---
name: template-generator
description: Generate business system templates for Privos Chat. Creates lists with field definitions, stages, and items via API. Use when user asks to create templates for marketing campaigns, recruitment processes, or sales workflows. Supports 3 domains. User must provide domain, roomId, and PRIVOS_API_KEY.
license: MIT
version: 1.0.0
---

# Template Generator Skill for Privos Chat

Generate business system templates directly in Privos Chat.

## When to Use

- User requests templates for: marketing, recruitment, sales
- User mentions "Privos", "roomId", or wants to create a template
- Need 20-30 tasks organized by stages

## Required Information

**User must provide:**
- `domain` - marketing, recruitment, or sales
- `roomId` - Room ID where template will be created
- `PRIVOS_API_KEY` - Set in environment

**AI should ask if missing:**
- "Which domain do you need? (marketing, recruitment, sales)"
- "What is the roomId?"

## Quick Start

```bash
# Set API key
export PRIVOS_API_KEY=your_api_key_here

# Create template
node scripts/privos_template.js --domain recruitment --roomId <room-id>
```

## Domain Templates

| Domain | Name | Stages | Tasks | Fields |
|--------|------|-------|-------|-------|
| `marketing` | Marketing Campaign | Planning, Content, Setup, Launch | 22 | Task Name, Description, Deadline, Priority, Status, Channel, Budget |
| `recruitment` | Recruitment Process | Definition, Sourcing, Interview, Onboarding | 23 | Task Name, Description, Deadline, Priority, Status, Candidate, Position, Salary |
| `sales` | Sales Pipeline | Setup, Prospecting, Deals, Closing | 20 | Task Name, Description, Deadline, Priority, Status, Company, Deal Value |

## Script Options

```
node privos_template.js --domain <domain> --roomId <room-id>

-d, --domain <domain>     Domain: marketing, recruitment, sales (required)
-r, --roomId <id>         Room ID (required)
```

## Examples

```
User: "Create marketing template for room abc123"
→ node scripts/privos_template.js --domain marketing --roomId abc123

User: "Sales template for room xyz"
→ node scripts/privos_template.js --domain sales --roomId xyz
```

## API Flow

1. **lists.create** - Create list with fieldDefinitions and stages (all at once)
2. **stages.byListId** - GET to retrieve stage IDs
3. **items.batch-create** - Create all items in one batch call

**Base URL:** `https://privos-chat-dev.roxane.one/api/v1/internal`
