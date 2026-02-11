# Template Generator Skill

Generate business system templates with structured tasks, API integration, and documentation.

## Features

- **Multi-domain templates**: Marketing, Recruitment, Sales
- **Task generation**: 20-30 tasks with name, description, and deadline
- **Bulk API creation**: POST tasks to your API endpoint
- **Documentation**: Auto-generate 3 txt files (description, tasks, objectives)
- **Standalone**: No dependencies required, just Node.js 18+

## Requirements

- Node.js 18+ (for native `fetch` and ES modules)

## Quick Start

### 1. Generate Tasks

```bash
node scripts/generate_tasks.js \
  --domain marketing \
  --requirements "Launch Q2 product campaign" \
  --output tasks.json
```

### 2. Generate Documentation

```bash
node scripts/generate_docs.js \
  --input tasks.json \
  --output ./docs
```

Creates 3 files:
- `docs/description.txt` - Project overview
- `docs/tasks.txt` - Detailed task list
- `docs/objectives.txt` - Goals and KPIs

### 3. Bulk Create via API

```bash
node scripts/bulk_create.js \
  --input tasks.json \
  --api-url https://your-api.com
```

With API key:
```bash
API_KEY=your_key node scripts/bulk_create.js --input tasks.json
```

Dry run (preview without sending):
```bash
node scripts/bulk_create.js --input tasks.json --dry-run
```

## Configuration

Environment variables (optional):

```bash
# For API calls
API_BASE_URL=https://your-api.com
API_KEY=your_api_key_here
```

## Domains

| Domain | Description |
|--------|-------------|
| `marketing` | Campaign planning, content, ads, optimization |
| `recruitment` | Job posting, screening, interviews, onboarding |
| `sales` | Prospecting, pipeline, demos, closing |

## CLI Reference

### generate_tasks.js

```
Usage: node generate_tasks.js [options]

Options:
  -d, --domain <domain>        Domain: marketing, recruitment, sales
  -r, --requirements <text>    Project requirements
  -o, --output <file>          Output JSON file (default: tasks.json)
  -c, --count <number>         Number of tasks (20-30, default: 25)
  -s, --start-date <date>      Start date YYYY-MM-DD
  -h, --help                   Show help
```

### generate_docs.js

```
Usage: node generate_docs.js [options]

Options:
  -i, --input <file>       Input tasks JSON file
  -o, --output <dir>       Output directory (default: ./docs)
  -d, --domain <domain>    Override domain from metadata
  -h, --help               Show help
```

### bulk_create.js

```
Usage: node bulk_create.js [options]

Options:
  -i, --input <file>       Input tasks JSON file
  -u, --api-url <url>      API base URL
  -k, --api-key <key>      API key
  -n, --dry-run            Preview without sending
  -o, --output <file>      Save API response
  -t, --timeout <secs>     Request timeout (default: 30)
  -h, --help               Show help
```

## API Specification

### POST /tasks

**Request:**
```json
{
  "tasks": [
    {
      "name": "Task name",
      "description": "Task description",
      "deadline": "2025-03-15",
      "priority": "high",
      "status": "pending",
      "tags": ["marketing", "planning"]
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "created": 25,
  "failed": 0,
  "tasks": [...],
  "errors": []
}
```

## License

MIT
