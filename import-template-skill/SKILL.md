---
name: import-template
description: Import template packages (ZIP files) into Priovs system. Extracts ZIP, reads template.json, and imports to Priovs via API.
license: MIT
version: 1.0.0
---

# Import Template Skill

Import workflow/task tracking templates from ZIP packages into Priovs system.

## What This Tool Does

**This tool imports templates into the Priovs task management system.**

Process:
1. Receives ZIP file from user
2. Extracts template.json from ZIP
3. Sends template data to Priovs API (POST /.list.import-template)
4. Reports import status

## When to Use

- User uploads a template ZIP file
- User wants to import a template into Priovs
- User says "import this template" or "upload template"

## Execution Mode: SIMPLE & CLEAR

**Be helpful and clear. Guide user through the import process.**

### Required Input

**User must provide:**
- ZIP file path (e.g., "Import this: customer_support_tickets.zip")
- OR: User uploads/attaches a ZIP file

**Optional:**
- Priovs API URL (default: will ask if not in .env)
- API key/token (if authentication required)

### When to Ask Questions

Ask if missing critical information:
1. **No ZIP file provided**
   - "Could you provide the ZIP file path or upload the template ZIP file?"

2. **API URL not configured** (if .env doesn't exist)
   - "What's your Priovs system URL? (e.g., https://your-priovs.com)"

3. **Import error** (if API fails)
   - Show error and ask: "Would you like me to try again or check the template structure?"

**NEVER ask:**
- ❌ About file format (always ZIP with template.json)
- ❌ Technical details about import process
- ❌ Advanced configuration options

## Required Output

**Must provide:**
1. **Import status** - Success or failure
2. **Template details** - Name, key, category
3. **Clear next steps** - What to do after import

## Execution Workflow

### Phase 1: Receive & Validate ZIP

1. **Get ZIP file path from user**
   - From message text (e.g., "./recruitment_developer.zip")
   - From file upload/attachment

2. **Validate ZIP file exists**
   - Check file exists at path
   - Confirm it's a ZIP file

3. **Report start**
   ```
   📦 Importing template from: [filename].zip
   ```

### Phase 2: Extract & Read Template

1. **Extract ZIP file**
   - Use built-in extraction
   - Extract to temporary directory

2. **Read template.json**
   - Parse JSON data
   - Validate structure (has templateKey, lists, etc.)

3. **Read IMPORT.md (optional)**
   - For logging/reference
   - Not required for import

4. **Report template info**
   ```
   📋 Found template: [Template Name]
   🔑 Key: [templateKey]
   📁 Category: [category]
   ```

### Phase 3: Import to Priovs

1. **Prepare API request**
   - Endpoint: `POST /.list.import-template`
   - Body: Full template.json content
   - Headers: Content-Type: application/json

2. **Get Priovs URL**
   - From .env file (PRIOVS_URL)
   - OR ask user if not configured

3. **Send import request**
   ```javascript
   const response = await fetch(`${priovsUrl}/.list.import-template`, {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json'
     },
     body: JSON.stringify(templateData)
   });
   ```

4. **Handle response**
   - Success (200/201): Show success message
   - Error (4xx/5xx): Show error details

### Phase 4: Report Results

**On Success:**
```
✅ Template imported successfully!

📋 Template: [Template Name]
🔑 Key: [templateKey]
📁 Category: [category]

🎯 What's next?
   1. Open your Priovs system
   2. Find the template in your templates list
   3. Start using it to create lists and track items!

That's it! Your template is now in Priovs. 🚀
```

**On Error:**
```
❌ Import failed

Error: [error message]

💡 Common solutions:
   1. Check that your Priovs system is running
   2. Verify the API URL is correct
   3. Make sure the template.json structure is valid

Would you like me to:
   - Try again
   - Check the template structure
   - Show the full error details
```

## Template Structure Validation

**Before import, check:**
- ✅ Has `templateKey` field
- ✅ Has `name` field
- ✅ Has `lists` array
- ✅ Lists have `stages` array
- ✅ Stages have `items` array (can be empty)
- ✅ All keys are snake_case

**If invalid:**
```
⚠️ Template structure issue detected

The template.json file seems to have an issue:
- [specific issue found]

This might cause problems when importing. Would you like me to:
   1. Try importing anyway
   2. Show you the structure issue
   3. Help fix the template
```

## Configuration

**Environment Variables (.env):**
```bash
# Priovs system URL
PRIOVS_URL=https://your-priovs.com

# Optional: API authentication
PRIOVS_API_KEY=your-api-key
```

**If .env doesn't exist:**
- Ask user for Priovs URL on first import
- Offer to save it for future imports

## Error Handling

### Common Errors

1. **ZIP file not found**
   ```
   ❌ File not found: [path]

   Please check the file path and try again.
   ```

2. **Invalid ZIP format**
   ```
   ❌ Invalid ZIP file

   The file doesn't seem to be a valid ZIP archive.
   ```

3. **No template.json in ZIP**
   ```
   ❌ No template.json found in ZIP

   The ZIP file should contain:
   - template.json (required)
   - IMPORT.md (optional)
   ```

4. **Invalid template structure**
   ```
   ❌ Invalid template structure

   The template.json is missing required fields:
   - [list of missing fields]
   ```

5. **API connection error**
   ```
   ❌ Cannot connect to Priovs

   Please check:
   - Is Priovs running?
   - Is the URL correct? ([current URL])
   - Is your network connection working?
   ```

6. **API import error**
   ```
   ❌ Priovs rejected the import

   Server response: [error message]
   ```

## Examples

### Example 1: Basic Import

**User:** "Import customer_support_tickets.zip"

**Skill:**
```
📦 Importing template from: customer_support_tickets.zip

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

### Example 2: First Time Import (No Config)

**User:** "Import bug_tracking.zip"

**Skill:**
```
📦 Importing template from: bug_tracking.zip

📋 Found template: Bug Tracking
🔑 Key: bug_tracking
📁 Category: Development

⚙️ I need your Priovs system URL to import the template.
   What's your Priovs URL? (e.g., https://priovs.yourdomain.com)
```

**User:** "https://priovs.mycompany.com"

**Skill:**
```
✅ Saved! I'll use this URL for future imports.

🔄 Sending to Priovs...

✅ Template imported successfully!
[... rest of success message ...]
```

### Example 3: Import with Error

**User:** "Import recruitment.zip"

**Skill:**
```
📦 Importing template from: recruitment.zip

📋 Found template: Recruitment Pipeline
🔑 Key: recruitment_pipeline
📁 Category: HR & Recruitment

🔄 Sending to Priovs...

❌ Import failed

Error: Cannot connect to Priovs at https://priovs.mycompany.com

💡 Common solutions:
   1. Check that your Priovs system is running
   2. Verify the API URL is correct
   3. Check your network connection

Would you like me to:
   - Try again
   - Update the Priovs URL
   - Show the full error details
```

## Critical Rules

1. **BE HELPFUL** - Guide user clearly through import process
2. **VALIDATE FIRST** - Check ZIP and template before importing
3. **CLEAR ERRORS** - Explain errors in simple terms with solutions
4. **SAVE CONFIG** - Offer to save Priovs URL for future use
5. **SHOW PROGRESS** - Report each step (extracting, reading, importing)
6. **FRIENDLY OUTPUT** - Use simple language, avoid technical jargon

## Communication Guidelines

**Friendly & Clear:**
- ✅ "Importing template from..."
- ✅ "Template imported successfully!"
- ✅ "Cannot connect to Priovs"

**Avoid Technical Jargon:**
- ❌ "Extracting archive to tmp directory"
- ❌ "Parsing JSON payload"
- ❌ "Executing HTTP POST request"

**Use:**
- "Reading template" instead of "parsing JSON"
- "Sending to Priovs" instead of "making API request"
- "Cannot connect" instead of "connection refused"
- "Import failed" instead of "API returned 500"

## Tool Usage

Run import script:
```bash
node scripts/import-template.js <zip-file-path>
```

With custom Priovs URL:
```bash
PRIOVS_URL=https://custom.url node scripts/import-template.js template.zip
```

## Success Criteria

✅ ZIP file extracted successfully
✅ template.json read and validated
✅ Template structure is valid
✅ Successfully connected to Priovs API
✅ Template imported to Priovs (API returned success)
✅ User receives clear confirmation with template details
✅ User knows what to do next

## Remember

- **Be helpful and clear** - Guide user through each step
- **Validate before import** - Check ZIP and template structure
- **Handle errors well** - Show clear error messages with solutions
- **Save configuration** - Remember Priovs URL for convenience
- **Show progress** - Let user know what's happening
- **Friendly output** - Simple language, encouraging tone
