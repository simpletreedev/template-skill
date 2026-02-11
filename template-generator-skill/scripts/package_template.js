#!/usr/bin/env node
/**
 * Template Skill Packager
 *
 * Packages a generated template into a ZIP file that can be imported
 * into other platforms. The ZIP contains:
 * - template.json: The template data
 * - SKILL.md: Instructions for AI to use this template
 * - README.md: Human-readable documentation
 *
 * Usage:
 *   node package_template.js --template <template.json> --output <output.zip>
 *   node package_template.js --template ./templates/recruitment.template.json
 */

const fs = require("fs");
const path = require("path");

// ==================== Simple ZIP Implementation ====================
// Pure Node.js ZIP creation without external dependencies

class SimpleZip {
  constructor() {
    this.files = [];
    this._crc32Table = null;
  }

  addFile(filename, content) {
    this.files.push({ filename, content: Buffer.from(content, "utf8") });
  }

  generate() {
    const centralDirectory = [];
    const fileEntries = [];
    let offset = 0;

    for (const file of this.files) {
      const filename = Buffer.from(file.filename, "utf8");
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

// ==================== Package Configuration ====================

const SKILL_TEMPLATE = `---
name: {{templateKey}}-template
description: {{description}}
license: MIT
version: {{version}}
---

# {{name}} Template

{{description}}

## When to Use

- User wants to create a {{name}} workflow
- User needs to track {{listNames}}
- User mentions keywords: {{keywords}}

## Template Structure

### Lists
{{listsSection}}

### Stages
{{stagesSection}}

### Fields
{{fieldsSection}}

## How to Import

1. Upload this template to your Privos Chat room
2. The system will automatically create:
   - Lists with predefined fields
   - Stages for workflow management
   - Sample items to get started
   - Documentation templates

## Customization

After importing, you can:
- Add/remove stages
- Modify field definitions
- Create additional items
- Update documentation

## API Integration

To import via API:

\`\`\`bash
curl -X POST "https://privos-chat-dev.roxane.one/api/v1/internal/templates.import" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d @template.json
\`\`\`

## Template Metadata

- **Version**: {{version}}
- **Author**: {{author}}
- **Created**: {{createdAt}}
- **Category**: {{category}}
`;

const README_TEMPLATE = `# {{name}}

{{description}}

## Overview

This template package contains everything needed to set up a {{name}} workflow in Privos Chat or compatible platforms.

## Contents

- \`template.json\` - The main template data file
- \`SKILL.md\` - AI skill instructions for using this template
- \`README.md\` - This documentation file

## Quick Start

### Option 1: Import via UI
1. Go to your Privos Chat room settings
2. Click "Import Template"
3. Upload this ZIP file
4. The template will be automatically applied

### Option 2: Import via API
\`\`\`bash
# Set your API key
export PRIVOS_API_KEY=your_api_key

# Import the template
curl -X POST "https://privos-chat-dev.roxane.one/api/v1/internal/templates.import" \\
  -H "Authorization: Bearer $PRIVOS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d @template.json
\`\`\`

### Option 3: Use with AI
Upload this ZIP to an AI assistant that supports Privos templates. The AI will:
1. Read the SKILL.md instructions
2. Understand the template structure
3. Help you customize and deploy it

## Template Details

### Lists
{{listsDetails}}

### Stages
{{stagesDetails}}

### Fields
{{fieldsDetails}}

### Documents
{{documentsDetails}}

## Customization Guide

### Adding New Stages
Edit the \`stages\` array in template.json:
\`\`\`json
{
  "key": "new_stage",
  "name": "New Stage",
  "color": "#3B82F6",
  "order": 5
}
\`\`\`

### Adding New Fields
Edit the \`fieldDefinitions\` array:
\`\`\`json
{
  "key": "new_field",
  "name": "New Field",
  "type": "TEXT",
  "order": 10
}
\`\`\`

## Support

For issues or feature requests, please contact the template author.

---

**Version**: {{version}}  
**Author**: {{author}}  
**Created**: {{createdAt}}
`;

// ==================== Helper Functions ====================

function loadTemplate(templatePath) {
  const content = fs.readFileSync(templatePath, "utf8");
  return JSON.parse(content);
}

function generateSkillMd(template) {
  const { templateKey, name, description, lists, metadata } = template;

  // Generate lists section
  const listNames = lists.map((l) => l.name).join(", ");
  const listsSection = lists
    .map((l) => `- **${l.name}**: ${l.description || "Main list"}`)
    .join("\n");

  // Generate stages section
  const stagesSection = lists
    .flatMap((l) => l.stages.map((s) => `- ${s.name} (${s.color})`))
    .join("\n");

  // Generate fields section
  const fieldsSection = lists
    .flatMap((l) =>
      l.fieldDefinitions.map(
        (f) => `- **${f.name}** (${f.type})${f.required ? " *required*" : ""}`,
      ),
    )
    .join("\n");

  // Generate keywords
  const keywords = [
    name.toLowerCase(),
    ...lists.map((l) => l.name.toLowerCase()),
    ...lists.flatMap((l) => l.stages.map((s) => s.name.toLowerCase())),
  ]
    .slice(0, 10)
    .join(", ");

  return SKILL_TEMPLATE.replace(/\{\{templateKey\}\}/g, templateKey)
    .replace(/\{\{name\}\}/g, name)
    .replace(/\{\{description\}\}/g, description)
    .replace(/\{\{version\}\}/g, metadata?.version || "1.0.0")
    .replace(/\{\{author\}\}/g, metadata?.author || "AI Template Generator")
    .replace(
      /\{\{createdAt\}\}/g,
      metadata?.createdAt || new Date().toISOString().split("T")[0],
    )
    .replace(/\{\{category\}\}/g, metadata?.category || "General")
    .replace(/\{\{listNames\}\}/g, listNames)
    .replace(/\{\{keywords\}\}/g, keywords)
    .replace(/\{\{listsSection\}\}/g, listsSection)
    .replace(/\{\{stagesSection\}\}/g, stagesSection)
    .replace(/\{\{fieldsSection\}\}/g, fieldsSection);
}

function generateReadmeMd(template) {
  const { name, description, lists, documents, metadata } = template;

  // Generate lists details
  const listsDetails = lists
    .map((l) => {
      const stageNames = l.stages.map((s) => s.name).join(" → ");
      const fieldCount = l.fieldDefinitions.length;
      const itemCount = l.items?.length || 0;
      return `#### ${l.name}\n- **Stages**: ${stageNames}\n- **Fields**: ${fieldCount} fields\n- **Sample Items**: ${itemCount} items`;
    })
    .join("\n\n");

  // Generate stages details
  const stagesDetails = lists.flatMap((l) =>
    l.stages.map((s) => `| ${s.name} | \`${s.key}\` | ${s.color} |`),
  );
  const stagesTable =
    "| Stage | Key | Color |\n|-------|-----|-------|\n" +
    stagesDetails.join("\n");

  // Generate fields details
  const fieldsDetails = lists.flatMap((l) =>
    l.fieldDefinitions.map((f) => {
      const options = f.options
        ? ` (${f.options.map((o) => o.value).join(", ")})`
        : "";
      return `| ${f.name} | ${f.type} | ${f.required ? "Yes" : "No"} |${options}`;
    }),
  );
  const fieldsTable =
    "| Field | Type | Required | Options |\n|-------|------|----------|--------|\n" +
    fieldsDetails.join("\n");

  // Generate documents details
  const documentsDetails =
    documents?.length > 0
      ? documents
          .map((d) => `- **${d.title}**: ${d.description || "Documentation"}`)
          .join("\n")
      : "No documents included.";

  return README_TEMPLATE.replace(/\{\{name\}\}/g, name)
    .replace(/\{\{description\}\}/g, description)
    .replace(/\{\{version\}\}/g, metadata?.version || "1.0.0")
    .replace(/\{\{author\}\}/g, metadata?.author || "AI Template Generator")
    .replace(
      /\{\{createdAt\}\}/g,
      metadata?.createdAt || new Date().toISOString().split("T")[0],
    )
    .replace(/\{\{listsDetails\}\}/g, listsDetails)
    .replace(/\{\{stagesDetails\}\}/g, stagesTable)
    .replace(/\{\{fieldsDetails\}\}/g, fieldsTable)
    .replace(/\{\{documentsDetails\}\}/g, documentsDetails);
}

function createPackage(template, outputPath) {
  const templateKey = template.templateKey;

  // Create ZIP file path
  const zipPath = outputPath.endsWith(".zip")
    ? outputPath
    : `${outputPath}.zip`;
  const zipDir = path.dirname(zipPath);
  if (!fs.existsSync(zipDir)) {
    fs.mkdirSync(zipDir, { recursive: true });
  }

  // Generate content
  const templateContent = JSON.stringify(template, null, 2);
  const skillContent = generateSkillMd(template);
  const readmeContent = generateReadmeMd(template);

  // Create ZIP using SimpleZip
  const zip = new SimpleZip();
  zip.addFile("template.json", templateContent);
  zip.addFile("SKILL.md", skillContent);
  zip.addFile("README.md", readmeContent);

  // Write ZIP file
  const zipBuffer = zip.generate();
  fs.writeFileSync(zipPath, zipBuffer);

  // Get absolute path for the ZIP file
  const absoluteZipPath = path.resolve(zipPath);

  console.log(`\n✅ Template package created successfully!`);
  console.log(`📦 ZIP file: ${absoluteZipPath}`);
  console.log(`\n📋 Package contents:`);
  console.log(`   - template.json (${template.name})`);
  console.log(`   - SKILL.md (AI instructions)`);
  console.log(`   - README.md (Documentation)`);

  return {
    success: true,
    zipPath: absoluteZipPath,
    templateKey,
    name: template.name,
  };
}

// ==================== Main Functions ====================

function packageTemplate(templatePath, outputPath = null) {
  // Load template
  const template = loadTemplate(templatePath);

  // Determine output path
  if (!outputPath) {
    const dir = path.dirname(templatePath);
    const packageDir = path.join(dir, "..", "packages");
    outputPath = path.join(packageDir, `${template.templateKey}.zip`);
  }

  // Create package
  return createPackage(template, outputPath);
}

function packageFromConfig(config, outputDir = "./packages") {
  // Import generateTemplate from generate_template.js
  const { generateTemplate, validateTemplate } = require("./generate_template");

  // Generate template
  const template = generateTemplate(config);

  // Validate
  const validation = validateTemplate(template);
  if (!validation.valid) {
    console.error("❌ Template validation failed:");
    validation.errors.forEach((e) => console.error(`   - ${e}`));
    return { success: false, errors: validation.errors };
  }

  // Save template first
  const templateDir = path.join(outputDir, "..", "templates");
  if (!fs.existsSync(templateDir)) {
    fs.mkdirSync(templateDir, { recursive: true });
  }
  const templatePath = path.join(
    templateDir,
    `${template.templateKey}.template.json`,
  );
  fs.writeFileSync(templatePath, JSON.stringify(template, null, 2), "utf8");
  console.log(`📄 Template saved: ${templatePath}`);

  // Create package
  const zipPath = path.join(outputDir, `${template.templateKey}.zip`);
  return createPackage(template, zipPath);
}

// ==================== CLI ====================

function printUsage() {
  console.log(`
Template Skill Packager

Creates a ZIP package from a template that can be imported into other platforms.

Usage:
  node package_template.js --template <template.json>              Package existing template
  node package_template.js --template <template.json> -o <output>  Specify output path
  node package_template.js --config <config.json>                  Generate and package

Options:
  -t, --template <file>   Path to template.json file
  -c, --config <file>     Path to config file (will generate template first)
  -o, --output <path>     Output ZIP file path (default: ./packages/<templateKey>.zip)
  -h, --help              Show this help

Examples:
  node package_template.js -t ./templates/recruitment.template.json
  node package_template.js -t ./templates/project.json -o ./my_package.zip
  node package_template.js -c ./my_config.json

Package Contents:
  - template.json   The template data
  - SKILL.md        AI skill instructions
  - README.md       Human-readable documentation
  `);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("-h") || args.includes("--help")) {
    printUsage();
    return;
  }

  let templatePath = null;
  let configPath = null;
  let outputPath = null;

  for (let i = 0; i < args.length; i++) {
    if ((args[i] === "-t" || args[i] === "--template") && args[i + 1]) {
      templatePath = args[i + 1];
      i++;
    } else if ((args[i] === "-c" || args[i] === "--config") && args[i + 1]) {
      configPath = args[i + 1];
      i++;
    } else if ((args[i] === "-o" || args[i] === "--output") && args[i + 1]) {
      outputPath = args[i + 1];
      i++;
    }
  }

  if (templatePath) {
    // Package existing template
    if (!fs.existsSync(templatePath)) {
      console.error(`❌ Template file not found: ${templatePath}`);
      process.exit(1);
    }
    packageTemplate(templatePath, outputPath);
  } else if (configPath) {
    // Generate and package
    if (!fs.existsSync(configPath)) {
      console.error(`❌ Config file not found: ${configPath}`);
      process.exit(1);
    }
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    const outputDir = outputPath ? path.dirname(outputPath) : "./packages";
    packageFromConfig(config, outputDir);
  } else {
    console.error("❌ Please provide --template or --config");
    printUsage();
    process.exit(1);
  }
}

// Export for module use
module.exports = {
  packageTemplate,
  packageFromConfig,
  generateSkillMd,
  generateReadmeMd,
  createPackage,
  loadTemplate,
};

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
