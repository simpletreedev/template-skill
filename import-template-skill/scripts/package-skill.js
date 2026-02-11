#!/usr/bin/env node

/**
 * Package Import Template Skill
 *
 * Creates a ZIP package of the import-template skill for distribution
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// Simple ZIP creation class
class SimpleZip {
  constructor() {
    this.files = [];
  }

  addFile(name, content) {
    if (typeof content === 'string') {
      content = Buffer.from(content, 'utf8');
    }
    this.files.push({ name, content });
  }

  async generate() {
    const files = [];

    // Create local file header for each file
    for (const file of this.files) {
      const { name, content } = file;
      const nameBuffer = Buffer.from(name, 'utf8');

      const localHeader = Buffer.alloc(30 + nameBuffer.length);

      // Local file header signature
      localHeader.writeUInt32LE(0x04034b50, 0);
      // Version needed to extract
      localHeader.writeUInt16LE(20, 4);
      // General purpose bit flag
      localHeader.writeUInt16LE(0, 6);
      // Compression method (0 = no compression)
      localHeader.writeUInt16LE(0, 8);
      // File modification time
      localHeader.writeUInt16LE(0, 10);
      // File modification date
      localHeader.writeUInt16LE(0, 12);
      // CRC-32
      localHeader.writeUInt32LE(this.crc32(content), 14);
      // Compressed size
      localHeader.writeUInt32LE(content.length, 18);
      // Uncompressed size
      localHeader.writeUInt32LE(content.length, 22);
      // File name length
      localHeader.writeUInt16LE(nameBuffer.length, 26);
      // Extra field length
      localHeader.writeUInt16LE(0, 28);
      // File name
      nameBuffer.copy(localHeader, 30);

      files.push({
        localHeader,
        content,
        name: nameBuffer,
        offset: 0
      });
    }

    // Calculate offsets
    let offset = 0;
    for (const file of files) {
      file.offset = offset;
      offset += file.localHeader.length + file.content.length;
    }

    const centralDirStart = offset;
    const centralDir = [];

    // Create central directory headers
    for (const file of files) {
      const header = Buffer.alloc(46 + file.name.length);

      // Central directory file header signature
      header.writeUInt32LE(0x02014b50, 0);
      // Version made by
      header.writeUInt16LE(20, 4);
      // Version needed to extract
      header.writeUInt16LE(20, 6);
      // General purpose bit flag
      header.writeUInt16LE(0, 8);
      // Compression method
      header.writeUInt16LE(0, 10);
      // File modification time
      header.writeUInt16LE(0, 12);
      // File modification date
      header.writeUInt16LE(0, 14);
      // CRC-32
      header.writeUInt32LE(this.crc32(file.content), 16);
      // Compressed size
      header.writeUInt32LE(file.content.length, 20);
      // Uncompressed size
      header.writeUInt32LE(file.content.length, 24);
      // File name length
      header.writeUInt16LE(file.name.length, 28);
      // Extra field length
      header.writeUInt16LE(0, 30);
      // File comment length
      header.writeUInt16LE(0, 32);
      // Disk number start
      header.writeUInt16LE(0, 34);
      // Internal file attributes
      header.writeUInt16LE(0, 36);
      // External file attributes
      header.writeUInt32LE(0, 38);
      // Relative offset of local header
      header.writeUInt32LE(file.offset, 42);
      // File name
      file.name.copy(header, 46);

      centralDir.push(header);
    }

    const centralDirSize = centralDir.reduce((sum, buf) => sum + buf.length, 0);

    // End of central directory record
    const endRecord = Buffer.alloc(22);
    // End of central directory signature
    endRecord.writeUInt32LE(0x06054b50, 0);
    // Number of this disk
    endRecord.writeUInt16LE(0, 4);
    // Disk where central directory starts
    endRecord.writeUInt16LE(0, 6);
    // Number of central directory records on this disk
    endRecord.writeUInt16LE(files.length, 8);
    // Total number of central directory records
    endRecord.writeUInt16LE(files.length, 10);
    // Size of central directory
    endRecord.writeUInt32LE(centralDirSize, 12);
    // Offset of start of central directory
    endRecord.writeUInt32LE(centralDirStart, 16);
    // ZIP file comment length
    endRecord.writeUInt16LE(0, 20);

    // Combine all parts
    const parts = [];

    for (const file of files) {
      parts.push(file.localHeader);
      parts.push(file.content);
    }

    for (const header of centralDir) {
      parts.push(header);
    }

    parts.push(endRecord);

    return Buffer.concat(parts);
  }

  crc32(buffer) {
    let crc = 0xffffffff;
    for (let i = 0; i < buffer.length; i++) {
      crc = crc ^ buffer[i];
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
      }
    }
    return (crc ^ 0xffffffff) >>> 0;
  }
}

async function packageSkill() {
  const rootDir = path.join(__dirname, '..');
  const outputPath = path.join(rootDir, 'import-template-skill.zip');

  const zip = new SimpleZip();

  // Files to include
  const files = [
    'SKILL.md',
    'README.md',
    '.env.example',
    'scripts/import-template.js'
  ];

  console.log('📦 Packaging Import Template Skill...\n');

  for (const file of files) {
    const filePath = path.join(rootDir, file);

    if (fs.existsSync(filePath)) {
      const content = await readFile(filePath);
      zip.addFile(file, content);
      console.log(`   ✓ ${file}`);
    }
  }

  const zipBuffer = await zip.generate();
  await writeFile(outputPath, zipBuffer);

  console.log('\n✅ Skill package created successfully!\n');
  console.log('📦 Package:', outputPath);
  console.log('📋 Size:', zipBuffer.length, 'bytes\n');
  console.log('📁 Contents:');
  console.log('   ✓ SKILL.md - AI skill instructions');
  console.log('   ✓ README.md - Documentation');
  console.log('   ✓ .env.example - Configuration template');
  console.log('   ✓ scripts/import-template.js - Import script\n');
  console.log('🚀 Upload this to any platform that supports skills!');
  console.log('   → The platform will auto-organize into skills/ folder\n');
}

packageSkill().catch(error => {
  console.error('Error packaging skill:', error);
  process.exit(1);
});
