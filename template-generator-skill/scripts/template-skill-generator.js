#!/usr/bin/env node
/**
 * Template Skill Generator - All-in-One Tool
 *
 * This tool:
 * 1. Takes user requirements (interactive or config file)
 * 2. Generates template JSON with proper structure
 * 3. Creates IMPORT.md with import instructions
 * 4. Packages everything into a ZIP file
 *
 * The ZIP file can be uploaded to another tool which will:
 * - Read IMPORT.md for instructions
 * - Use template.json for data
 * - Import into the system
 *
 * Usage:
 *   node template-skill-generator.js --interactive              # Interactive mode
 *   node template-skill-generator.js --config config.json       # From config file
 *   node template-skill-generator.js --quick "Project Tracker"  # Quick mode
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// ==================== ZIP Implementation ====================

class SimpleZip {
  constructor() {
    this.files = [];
    this._crc32Table = null;
  }

  addFile(filename, content) {
    this.files.push({ filename, content: Buffer.from(content, 'utf8') });
  }

  generate() {
    const centralDirectory = [];
    const fileEntries = [];
    let offset = 0;

    for (const file of this.files) {
      const filename = Buffer.from(file.filename, 'utf8');
      const content = file.content;
      const crc = this.crc32(content);

      // Local file header
      const localHeader = Buffer.alloc(30 + filename.length);
      localHeader.writeUInt32LE(0x04034b50, 0);
      localHeader.writeUInt16LE(20, 4);
      localHeader.writeUInt16LE(0, 6);
      localHeader.writeUInt16LE(0, 8);
      localHeader.writeUInt16LE(0, 10);
      localHeader.writeUInt16LE(0, 12);
      localHeader.writeUInt32LE(crc, 14);
      localHeader.writeUInt32LE(content.length, 18);
      localHeader.writeUInt32LE(content.length, 22);
      localHeader.writeUInt16LE(filename.length, 26);
      localHeader.writeUInt16LE(0, 28);
      filename.copy(localHeader, 30);

      fileEntries.push(localHeader, content);

      // Central directory header
      const centralHeader = Buffer.alloc(46 + filename.length);
      centralHeader.writeUInt32LE(0x02014b50, 0);
      centralHeader.writeUInt16LE(20, 4);
      centralHeader.writeUInt16LE(20, 6);
      centralHeader.writeUInt16LE(0, 8);
      centralHeader.writeUInt16LE(0, 10);
      centralHeader.writeUInt16LE(0, 12);
      centralHeader.writeUInt16LE(0, 14);
      centralHeader.writeUInt32LE(crc, 16);
      centralHeader.writeUInt32LE(content.length, 20);
      centralHeader.writeUInt32LE(content.length, 24);
      centralHeader.writeUInt16LE(filename.length, 28);
      centralHeader.writeUInt16LE(0, 30);
      centralHeader.writeUInt16LE(0, 32);
      centralHeader.writeUInt16LE(0, 34);
      centralHeader.writeUInt16LE(0, 36);
      centralHeader.writeUInt32LE(0, 38);
      centralHeader.writeUInt32LE(offset, 42);
      filename.copy(centralHeader, 46);

      centralDirectory.push(centralHeader);
      offset += localHeader.length + content.length;
    }

    const centralDirBuffer = Buffer.concat(centralDirectory);
    const centralDirOffset = offset;

    // End of central directory record
    const endRecord = Buffer.alloc(22);
    endRecord.writeUInt32LE(0x06054b50, 0);
    endRecord.writeUInt16LE(0, 4);
    endRecord.writeUInt16LE(0, 6);
    endRecord.writeUInt16LE(this.files.length, 8);
    endRecord.writeUInt16LE(this.files.length, 10);
    endRecord.writeUInt32LE(centralDirBuffer.length, 12);
    endRecord.writeUInt32LE(centralDirOffset, 16);
    endRecord.writeUInt16LE(0, 20);

    return Buffer.concat([...fileEntries, centralDirBuffer, endRecord]);
  }

  crc32(buffer) {
    let crc = 0xffffffff;
    const table = this.getCrc32Table();
    for (let i = 0; i < buffer.length; i++) {
      crc = (crc >>> 8) ^ table[(crc ^ buffer[i]) & 0xff];
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  getCrc32Table() {
    if (this._crc32Table) return this._crc32Table;
    const table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
      table[i] = c;
    }
    this._crc32Table = table;
    return table;
  }
}

// ==================== Template Generator ====================

function toSnakeCase(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

function generateTemplate(config) {
  const templateKey = config.templateKey || toSnakeCase(config.name);

  const template = {
    templateKey,
    name: config.name,
    description: config.description,
    icon: config.icon || '📋',
    isActive: true,
    lists: [],
    documents: config.documents || [],
    metadata: {
      version: config.version || '1.0.0',
      author: config.author || 'AI Template Generator',
      createdAt: new Date().toISOString().split('T')[0],
      tags: config.tags || [],
      category: config.category || 'General'
    }
  };

  // Generate lists
  if (config.lists) {
    template.lists = config.lists.map(listConfig => {
      const list = {
        key: listConfig.key || toSnakeCase(listConfig.name),
        name: listConfig.name,
        description: listConfig.description || `${listConfig.name} list`,
        fieldDefinitions: [],
        stages: []
      };

      // Generate field definitions
      if (listConfig.fields) {
        list.fieldDefinitions = listConfig.fields.map((field, idx) => {
          const fieldDef = {
            key: field.key || toSnakeCase(field.name),
            name: field.name,
            type: field.type || 'TEXT',
            order: field.order !== undefined ? field.order : idx
          };

          if (field.required) fieldDef.required = true;
          if (field.options) fieldDef.options = field.options;

          return fieldDef;
        });
      }

      // Generate stages with items
      if (listConfig.stages) {
        list.stages = listConfig.stages.map((stage, idx) => {
          return {
            key: stage.key || toSnakeCase(stage.name),
            name: stage.name,
            color: stage.color || getDefaultColor(idx),
            order: stage.order !== undefined ? stage.order : idx,
            items: stage.items || []
          };
        });
      }

      return list;
    });
  }

  return template;
}

function getDefaultColor(index) {
  const colors = [
    '#3B82F6', // blue
    '#10B981', // green
    '#F59E0B', // yellow
    '#EF4444', // red
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#6B7280', // gray
  ];
  return colors[index % colors.length];
}

// ==================== IMPORT.md Template ====================

const IMPORT_MD_TEMPLATE = `# Template Import Instructions

## Overview

This package contains a complete template for **{{name}}**.

**Description:** {{description}}

## Package Contents

- \`template.json\` - Complete template data with structure and sample items
- \`IMPORT.md\` - This file with import instructions
- \`.env.example\` - Environment variables template (if needed)

## Import Methods

### Method 1: API Import (Recommended)

Use the Privos Chat API to import this template:

\`\`\`bash
# Set your API credentials
export API_URL="https://privos-chat-dev.roxane.one/api/v1"
export API_KEY="your_api_key_here"

# Import the template
curl -X POST "$API_URL/internal/templates.import" \\
  -H "Authorization: Bearer $API_KEY" \\
  -H "Content-Type: application/json" \\
  -d @template.json
\`\`\`

### Method 2: UI Import

1. Log in to Privos Chat
2. Navigate to Room Settings → Templates
3. Click "Import Template"
4. Upload this ZIP file or \`template.json\`
5. Confirm import

### Method 3: Programmatic Import

\`\`\`javascript
const fs = require('fs');
const axios = require('axios');

const template = JSON.parse(fs.readFileSync('template.json', 'utf8'));

await axios.post('https://privos-chat-dev.roxane.one/api/v1/internal/templates.import',
  template,
  {
    headers: {
      'Authorization': \`Bearer \${process.env.API_KEY}\`,
      'Content-Type': 'application/json'
    }
  }
);
\`\`\`

## Template Structure

### Lists
{{listsInfo}}

### Stages
{{stagesInfo}}

### Fields
{{fieldsInfo}}

### Sample Items
{{itemsInfo}}

## Post-Import Steps

1. **Verify Import**: Check that all lists, stages, and fields are created correctly
2. **Review Items**: Examine sample items and customize as needed
3. **Configure Permissions**: Set up user permissions for each list
4. **Customize**: Modify stages, fields, or add new items based on your workflow
5. **Test**: Create a few test items to ensure everything works

## Environment Variables

If this template requires environment variables, create a \`.env\` file:

\`\`\`bash
# Copy from example
cp .env.example .env

# Edit with your values
nano .env
\`\`\`

## Troubleshooting

### Import Failed
- Check API credentials are correct
- Verify API endpoint is accessible
- Ensure JSON format is valid

### Missing Data
- Re-import the template
- Check that all required fields are present in template.json

### Permission Errors
- Verify your API key has template import permissions
- Contact administrator if needed

## Support

- **Version**: {{version}}
- **Author**: {{author}}
- **Created**: {{createdAt}}
- **Category**: {{category}}

For issues or questions, refer to the Privos Chat documentation or contact support.

## API Response

Successful import will return:

\`\`\`json
{
  "success": true,
  "templateKey": "{{templateKey}}",
  "message": "Template imported successfully",
  "data": {
    "lists": [...],
    "stages": [...],
    "items": [...]
  }
}
\`\`\`
`;

// ==================== Content Generators ====================

function generateImportMd(template) {
  const { name, description, lists, metadata, templateKey } = template;

  // Generate lists info
  const listsInfo = lists.map(list =>
    `- **${list.name}**: ${list.description}\n  - ${list.fieldDefinitions.length} fields\n  - ${list.stages.length} stages`
  ).join('\n');

  // Generate stages info
  const stagesInfo = lists.flatMap(list =>
    list.stages.map(s => `- **${s.name}** (\`${s.key}\`) - ${s.color}`)
  ).join('\n');

  // Generate fields info
  const fieldsInfo = lists.flatMap(list =>
    list.fieldDefinitions.map(f =>
      `- **${f.name}** (\`${f.type}\`)${f.required ? ' *required*' : ''}`
    )
  ).join('\n');

  // Generate items info
  const itemsCount = lists.reduce((sum, list) =>
    sum + list.stages.reduce((stageSum, stage) =>
      stageSum + (stage.items?.length || 0), 0), 0
  );
  const itemsInfo = itemsCount > 0
    ? `Template includes ${itemsCount} sample items across all stages.`
    : 'No sample items included. Create items after import.';

  return IMPORT_MD_TEMPLATE
    .replace(/\{\{name\}\}/g, name)
    .replace(/\{\{description\}\}/g, description)
    .replace(/\{\{templateKey\}\}/g, templateKey)
    .replace(/\{\{version\}\}/g, metadata?.version || '1.0.0')
    .replace(/\{\{author\}\}/g, metadata?.author || 'AI Template Generator')
    .replace(/\{\{createdAt\}\}/g, metadata?.createdAt || new Date().toISOString().split('T')[0])
    .replace(/\{\{category\}\}/g, metadata?.category || 'General')
    .replace(/\{\{listsInfo\}\}/g, listsInfo)
    .replace(/\{\{stagesInfo\}\}/g, stagesInfo)
    .replace(/\{\{fieldsInfo\}\}/g, fieldsInfo)
    .replace(/\{\{itemsInfo\}\}/g, itemsInfo);
}

function generateEnvExample(template) {
  return `# API Configuration
API_URL=https://privos-chat-dev.roxane.one/api/v1
API_KEY=your_api_key_here

# Template Configuration
TEMPLATE_KEY=${template.templateKey}
TEMPLATE_VERSION=${template.metadata?.version || '1.0.0'}

# Optional: Customize import behavior
AUTO_CREATE_ITEMS=true
IMPORT_DOCUMENTS=true
`;
}

// ==================== Package Creator ====================

function createSkillPackage(template, outputPath) {
  const templateKey = template.templateKey;
  const zipPath = outputPath || `./packages/${templateKey}.zip`;
  const zipDir = path.dirname(zipPath);

  // Ensure output directory exists
  if (!fs.existsSync(zipDir)) {
    fs.mkdirSync(zipDir, { recursive: true });
  }

  // Generate all content
  const templateJson = JSON.stringify(template, null, 2);
  const importMd = generateImportMd(template);
  const envExample = generateEnvExample(template);

  // Create ZIP
  const zip = new SimpleZip();
  zip.addFile('template.json', templateJson);
  zip.addFile('IMPORT.md', importMd);
  zip.addFile('.env.example', envExample);

  // Write ZIP file
  const zipBuffer = zip.generate();
  fs.writeFileSync(zipPath, zipBuffer);

  const absolutePath = path.resolve(zipPath);

  console.log('\n✅ Template skill package created successfully!\n');
  console.log(`📦 Package: ${absolutePath}`);
  console.log(`📋 Template: ${template.name} (v${template.metadata?.version || '1.0.0'})`);
  console.log(`\n📁 Contents:`);
  console.log(`   ✓ template.json - Template data`);
  console.log(`   ✓ IMPORT.md - Import instructions`);
  console.log(`   ✓ .env.example - Environment variables template`);
  console.log(`\n🚀 Next Steps:`);
  console.log(`   1. Upload ${path.basename(zipPath)} to your import tool`);
  console.log(`   2. The tool will read IMPORT.md for instructions`);
  console.log(`   3. Template will be imported into the system`);

  return {
    success: true,
    zipPath: absolutePath,
    templateKey,
    name: template.name
  };
}

// ==================== Interactive Mode ====================

async function interactiveMode() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (prompt) => new Promise(resolve => rl.question(prompt, resolve));

  console.log('\n🎨 Template Skill Generator - Interactive Mode\n');

  const name = await question('Template name: ');
  const description = await question('Description: ');
  const listName = await question('List name (e.g., "Tasks", "Candidates"): ');
  const stagesInput = await question('Stages (comma-separated, e.g., "To Do, In Progress, Done"): ');
  const fieldsInput = await question('Fields (comma-separated, e.g., "Name, Priority, Deadline"): ');

  rl.close();

  const stages = stagesInput.split(',').map(s => ({ name: s.trim() }));
  const fields = fieldsInput.split(',').map(f => ({ name: f.trim(), type: 'TEXT' }));

  const config = {
    name,
    description,
    lists: [{
      name: listName,
      fields,
      stages
    }]
  };

  const template = generateTemplate(config);
  return createSkillPackage(template);
}

// ==================== Quick Mode ====================

function quickMode(templateName) {
  const config = {
    name: templateName,
    description: `${templateName} workflow template`,
    lists: [{
      name: 'Tasks',
      fields: [
        { name: 'Task Name', type: 'TEXT', required: true },
        { name: 'Description', type: 'TEXTAREA' },
        { name: 'Priority', type: 'SELECT', options: [
          { value: 'High', color: '#EF4444', order: 0 },
          { value: 'Medium', color: '#F59E0B', order: 1 },
          { value: 'Low', color: '#10B981', order: 2 }
        ]}
      ],
      stages: [
        { name: 'To Do' },
        { name: 'In Progress' },
        { name: 'Done' }
      ]
    }]
  };

  const template = generateTemplate(config);
  return createSkillPackage(template);
}

// ==================== CLI ====================

function printUsage() {
  console.log(`
🎨 Template Skill Generator - All-in-One Tool

Generates complete template skill packages ready for import.

Usage:
  node template-skill-generator.js --interactive           Interactive mode
  node template-skill-generator.js --config config.json    From config file
  node template-skill-generator.js --quick "My Template"   Quick template
  node template-skill-generator.js --help                  Show this help

Options:
  -i, --interactive       Interactive mode (asks questions)
  -c, --config <file>     Generate from config file
  -q, --quick <name>      Quick mode with default structure
  -o, --output <path>     Output ZIP file path
  -h, --help              Show this help

Examples:
  node template-skill-generator.js --interactive
  node template-skill-generator.js --config ./my-template.json
  node template-skill-generator.js --quick "Project Tracker" -o ./tracker.zip

Output:
  Creates a ZIP file containing:
  - template.json       Template data with proper structure
  - IMPORT.md          Import instructions for the tool
  - .env.example       Environment variables template

The ZIP can be uploaded to an import tool which will:
  1. Read IMPORT.md for instructions
  2. Use template.json for data structure
  3. Import into the system automatically
  `);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
    printUsage();
    return;
  }

  let mode = null;
  let configPath = null;
  let quickName = null;
  let outputPath = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '-i' || args[i] === '--interactive') {
      mode = 'interactive';
    } else if ((args[i] === '-c' || args[i] === '--config') && args[i + 1]) {
      mode = 'config';
      configPath = args[i + 1];
      i++;
    } else if ((args[i] === '-q' || args[i] === '--quick') && args[i + 1]) {
      mode = 'quick';
      quickName = args[i + 1];
      i++;
    } else if ((args[i] === '-o' || args[i] === '--output') && args[i + 1]) {
      outputPath = args[i + 1];
      i++;
    }
  }

  try {
    if (mode === 'interactive') {
      await interactiveMode();
    } else if (mode === 'config') {
      if (!fs.existsSync(configPath)) {
        console.error(`❌ Config file not found: ${configPath}`);
        process.exit(1);
      }
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      const template = generateTemplate(config);
      createSkillPackage(template, outputPath);
    } else if (mode === 'quick') {
      quickMode(quickName);
    } else {
      console.error('❌ Please specify a mode: --interactive, --config, or --quick');
      printUsage();
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Export for module use
module.exports = {
  generateTemplate,
  createSkillPackage,
  generateImportMd,
  generateEnvExample
};

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
