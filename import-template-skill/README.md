# Import Template Skill

Import workflow/task tracking templates from ZIP packages into Priovs system.

## What it does

This skill helps you import templates into your Priovs system:

1. **Receives** template ZIP file from you
2. **Extracts** and reads template.json
3. **Imports** to Priovs via API
4. **Reports** success or errors

## Quick Start

### 1. Install the skill

Upload `import-template-skill.zip` to your AI platform (Claude Code, etc.)

### 2. Configure Priovs URL

Create a `.env` file:

```bash
PRIOVS_URL=https://your-priovs.com
```

### 3. Import a template

Just tell Claude:

```
Import customer_support_tickets.zip
```

Claude will:
- Extract the ZIP
- Read template.json
- Send it to Priovs
- Tell you if it worked!

## How to Use

### Basic Import

```
Import recruitment_pipeline.zip
```

### First Time (No Config)

```
You: Import bug_tracking.zip

Claude: I need your Priovs system URL to import the template.
        What's your Priovs URL? (e.g., https://priovs.yourdomain.com)

You: https://priovs.mycompany.com

Claude: ✅ Saved! I'll use this URL for future imports.
        🔄 Sending to Priovs...
        ✅ Template imported successfully!
```

## Manual Script Usage

You can also run the import script directly:

```bash
# Basic usage
node scripts/import-template.js template.zip

# With custom URL
PRIOVS_URL=https://custom.url node scripts/import-template.js template.zip
```

## What Gets Imported

The skill reads `template.json` from your ZIP file and sends the entire JSON data to Priovs:

```javascript
POST /.list.import-template
Content-Type: application/json

{
  "templateKey": "customer_support_tickets",
  "name": "Customer Support Tickets",
  "lists": [...],
  "metadata": {...}
}
```

## Error Handling

The skill handles common errors gracefully:

### File Not Found
```
❌ File not found: template.zip
Please check the file path and try again.
```

### No template.json
```
❌ No template.json found in ZIP
The ZIP file should contain:
- template.json (required)
- IMPORT.md (optional)
```

### Cannot Connect to Priovs
```
❌ Cannot connect to Priovs
Please check:
- Is Priovs running?
- Is the URL correct?
- Is your network connection working?
```

## Configuration

### Environment Variables (.env)

```bash
# Priovs system URL (required)
PRIOVS_URL=https://your-priovs.com

# Optional: API authentication
PRIOVS_API_KEY=your-api-key
```

## Template ZIP Structure

Your ZIP file should contain:

```
template.zip
├── template.json   (required - template data)
└── IMPORT.md       (optional - import instructions)
```

## Requirements

- Node.js 14+
- Access to Priovs system
- Template ZIP file (generated from template-generator-skill)

## Examples

### Example 1: Import Customer Support Template

```
You: Import customer_support_tickets.zip

Claude: 📦 Importing template from: customer_support_tickets.zip

        📋 Found template: Customer Support Tickets
        🔑 Key: customer_support_tickets
        📁 Category: Customer Support

        🔄 Sending to Priovs...

        ✅ Template imported successfully!

        📋 Template: Customer Support Tickets
        🔑 Key: customer_support_tickets
        📁 Category: Customer Support

        🎯 What's next?
           1. Open your Priovs system
           2. Find the template in your templates list
           3. Start using it to create lists and track items!

        That's it! Your template is now in Priovs. 🚀
```

### Example 2: Import Multiple Templates

```
You: Import these templates:
     - bug_tracking.zip
     - recruitment.zip
     - project_tasks.zip

Claude: I'll import them one by one!

        [imports each template and reports results]
```

## How It Works

1. **Receive ZIP** - Get template ZIP file path from user
2. **Extract** - Unzip to temporary directory
3. **Read** - Parse template.json
4. **Validate** - Check required fields (templateKey, name, lists)
5. **Import** - POST to Priovs API: `/.list.import-template`
6. **Report** - Show success or error message
7. **Cleanup** - Remove temporary files

## API Details

### Priovs Import Endpoint

```
POST /.list.import-template
Content-Type: application/json

Body: <full template.json content>
```

**Success Response:**
```json
{
  "success": true,
  "templateKey": "customer_support_tickets"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message"
}
```

## Troubleshooting

### "Cannot connect to Priovs"

- Check PRIOVS_URL in .env
- Make sure Priovs is running
- Test URL in browser

### "Invalid template structure"

- Make sure ZIP contains template.json
- Check template.json has required fields
- Validate JSON syntax

### "Import failed - API error"

- Check Priovs logs
- Verify API endpoint is correct
- Check network connectivity

## License

MIT

## Related Skills

- **template-generator-skill** - Generate template ZIP files
- Use together: Generate → Import workflow!
