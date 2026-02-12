#!/usr/bin/env node
/**
 * Package Template Generator Skill
 *
 * Đóng gói tool template-generator thành skill ZIP
 * để upload lên các platform khác
 */

const fs = require('fs');
const path = require('path');

// Reuse SimpleZip from template-skill-generator.js
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

function packageSkill() {
  const zip = new SimpleZip();

  // Add SKILL.md (now contains all documentation)
  const skillMd = fs.readFileSync('./SKILL.md', 'utf8');
  zip.addFile('SKILL.md', skillMd);

  // Add main script
  const mainScript = fs.readFileSync('./scripts/template-skill-generator.js', 'utf8');
  zip.addFile('scripts/template-skill-generator.js', mainScript);

  // Add inspect script
  const inspectScript = fs.readFileSync('./scripts/inspect-zip.js', 'utf8');
  zip.addFile('scripts/inspect-zip.js', inspectScript);

  // Add example templates
  const exampleFiles = [
    'examples/project_management.template.json',
    'examples/recruitment_pipeline.template.json',
    'templates/bug_tracking.template.json',
    'templates/recruitment.template.json'
  ];

  exampleFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      zip.addFile(file, content);
    }
  });

  // Generate ZIP
  const zipBuffer = zip.generate();
  const outputPath = './template-generator-skill.zip';
  fs.writeFileSync(outputPath, zipBuffer);

  console.log('\n✅ Skill package created successfully!\n');
  console.log(`📦 Package: ${path.resolve(outputPath)}`);
  console.log(`📋 Size: ${zipBuffer.length} bytes`);
  console.log('\n📁 Contents:');
  console.log('   ✓ SKILL.md - Complete documentation & AI instructions');
  console.log('   ✓ scripts/template-skill-generator.js - Main tool');
  console.log('   ✓ scripts/inspect-zip.js - ZIP inspector');
  console.log('   ✓ examples/*.template.json - Example templates');
  console.log('\n🚀 Upload this to any platform that supports skills!');
  console.log('   → The platform will auto-organize into skills/ folder');
}

packageSkill();
