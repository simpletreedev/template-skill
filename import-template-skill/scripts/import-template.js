#!/usr/bin/env node

/**
 * Import Template Script
 *
 * Imports template from ZIP file into Priovs system
 * Usage: node import-template.js <zip-file-path>
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const mkdir = promisify(fs.mkdir);

// Simple ZIP extraction (pure Node.js, no dependencies)
class SimpleUnzip {
  static async extract(zipPath, outputDir) {
    const AdmZip = require('adm-zip'); // Will use native implementation

    // Fallback: Manual extraction using zlib
    const buffer = await readFile(zipPath);
    const files = {};

    // Simple ZIP parsing (Local File Header format)
    let offset = 0;

    while (offset < buffer.length - 4) {
      const signature = buffer.readUInt32LE(offset);

      // Local file header signature: 0x04034b50
      if (signature === 0x04034b50) {
        const nameLength = buffer.readUInt16LE(offset + 26);
        const extraLength = buffer.readUInt16LE(offset + 28);
        const compressedSize = buffer.readUInt32LE(offset + 18);
        const compressionMethod = buffer.readUInt16LE(offset + 8);

        const nameStart = offset + 30;
        const fileName = buffer.toString('utf8', nameStart, nameStart + nameLength);

        const dataStart = nameStart + nameLength + extraLength;
        const dataEnd = dataStart + compressedSize;
        let fileData = buffer.slice(dataStart, dataEnd);

        // Decompress if needed (method 8 = DEFLATE)
        if (compressionMethod === 8) {
          const zlib = require('zlib');
          fileData = zlib.inflateRawSync(fileData);
        }

        files[fileName] = fileData;
        offset = dataEnd;
      } else {
        offset++;
      }
    }

    // Write extracted files
    await mkdir(outputDir, { recursive: true });

    for (const [fileName, content] of Object.entries(files)) {
      if (!fileName.endsWith('/')) {
        const filePath = path.join(outputDir, fileName);
        const dir = path.dirname(filePath);
        await mkdir(dir, { recursive: true });
        await writeFile(filePath, content);
      }
    }

    return files;
  }
}

// Load .env file
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env');

  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
      const match = line.match(/^\s*([^#][^=]+?)\s*=\s*(.+?)\s*$/);
      if (match) {
        const key = match[1];
        const value = match[2].replace(/^["']|["']$/g, '');
        process.env[key] = value;
      }
    });
  }
}

// Main import function
async function importTemplate(zipPath, priovsUrl = null) {
  console.log('📦 Importing template from:', path.basename(zipPath));
  console.log('');

  // Validate ZIP file exists
  if (!fs.existsSync(zipPath)) {
    console.error('❌ File not found:', zipPath);
    console.error('');
    console.error('Please check the file path and try again.');
    process.exit(1);
  }

  // Extract ZIP
  const tmpDir = path.join(process.cwd(), '.tmp-import');
  let files;

  try {
    files = await SimpleUnzip.extract(zipPath, tmpDir);
  } catch (error) {
    console.error('❌ Failed to extract ZIP file');
    console.error('');
    console.error('Error:', error.message);
    console.error('');
    console.error('Make sure the file is a valid ZIP archive.');
    process.exit(1);
  }

  // Read template.json
  const templateJsonPath = path.join(tmpDir, 'template.json');

  if (!fs.existsSync(templateJsonPath)) {
    console.error('❌ No template.json found in ZIP');
    console.error('');
    console.error('The ZIP file should contain:');
    console.error('- template.json (required)');
    console.error('- IMPORT.md (optional)');

    // Cleanup
    fs.rmSync(tmpDir, { recursive: true, force: true });
    process.exit(1);
  }

  let templateData;

  try {
    const content = await readFile(templateJsonPath, 'utf8');
    templateData = JSON.parse(content);
  } catch (error) {
    console.error('❌ Invalid template.json format');
    console.error('');
    console.error('Error:', error.message);

    // Cleanup
    fs.rmSync(tmpDir, { recursive: true, force: true });
    process.exit(1);
  }

  // Validate template structure
  const requiredFields = ['templateKey', 'name', 'lists'];
  const missingFields = requiredFields.filter(field => !templateData[field]);

  if (missingFields.length > 0) {
    console.error('❌ Invalid template structure');
    console.error('');
    console.error('The template.json is missing required fields:');
    missingFields.forEach(field => console.error(`- ${field}`));

    // Cleanup
    fs.rmSync(tmpDir, { recursive: true, force: true });
    process.exit(1);
  }

  // Show template info
  console.log('📋 Found template:', templateData.name);
  console.log('🔑 Key:', templateData.templateKey);
  if (templateData.metadata?.category) {
    console.log('📁 Category:', templateData.metadata.category);
  }
  console.log('');

  // Get Priovs URL
  if (!priovsUrl) {
    priovsUrl = process.env.PRIOVS_URL;
  }

  if (!priovsUrl) {
    console.error('⚙️ Priovs URL not configured');
    console.error('');
    console.error('Please set PRIOVS_URL in .env file or pass as argument:');
    console.error('  PRIOVS_URL=https://your-priovs.com node import-template.js file.zip');

    // Cleanup
    fs.rmSync(tmpDir, { recursive: true, force: true });
    process.exit(1);
  }

  // Import to Priovs
  console.log('🔄 Sending to Priovs...');

  const apiUrl = `${priovsUrl}/.list.import-template`;

  try {
    const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(templateData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API returned ${response.status}: ${errorText}`);
    }

    const result = await response.json();

    console.log('');
    console.log('✅ Template imported successfully!');
    console.log('');
    console.log('📋 Template:', templateData.name);
    console.log('🔑 Key:', templateData.templateKey);
    if (templateData.metadata?.category) {
      console.log('📁 Category:', templateData.metadata.category);
    }
    console.log('');
    console.log('🎯 What\'s next?');
    console.log('   1. Open your Priovs system');
    console.log('   2. Find the template in your templates list');
    console.log('   3. Start using it to create lists and track items!');
    console.log('');
    console.log('That\'s it! Your template is now in Priovs. 🚀');

  } catch (error) {
    console.error('');
    console.error('❌ Import failed');
    console.error('');
    console.error('Error:', error.message);
    console.error('');
    console.error('💡 Common solutions:');
    console.error('   1. Check that your Priovs system is running');
    console.error('   2. Verify the API URL is correct:', priovsUrl);
    console.error('   3. Check your network connection');

    // Cleanup
    fs.rmSync(tmpDir, { recursive: true, force: true });
    process.exit(1);
  }

  // Cleanup
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

// CLI
if (require.main === module) {
  loadEnv();

  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: node import-template.js <zip-file-path>');
    console.error('');
    console.error('Example:');
    console.error('  node import-template.js customer_support_tickets.zip');
    process.exit(1);
  }

  const zipPath = args[0];
  const priovsUrl = args[1] || null;

  importTemplate(zipPath, priovsUrl).catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
}

module.exports = { importTemplate };
