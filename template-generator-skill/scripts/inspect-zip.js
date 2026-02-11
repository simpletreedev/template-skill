#!/usr/bin/env node
/**
 * ZIP Inspector - View contents of template skill packages
 */

const fs = require('fs');
const path = require('path');

function readZipCentralDirectory(buffer) {
  // Find end of central directory record
  let eocdOffset = buffer.length - 22;
  while (eocdOffset >= 0) {
    if (buffer.readUInt32LE(eocdOffset) === 0x06054b50) break;
    eocdOffset--;
  }

  if (eocdOffset < 0) throw new Error('Invalid ZIP file');

  const centralDirOffset = buffer.readUInt32LE(eocdOffset + 16);
  const totalEntries = buffer.readUInt16LE(eocdOffset + 10);

  const files = [];
  let offset = centralDirOffset;

  for (let i = 0; i < totalEntries; i++) {
    if (buffer.readUInt32LE(offset) !== 0x02014b50) break;

    const compressedSize = buffer.readUInt32LE(offset + 20);
    const uncompressedSize = buffer.readUInt32LE(offset + 24);
    const filenameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const localHeaderOffset = buffer.readUInt32LE(offset + 42);

    const filename = buffer.toString('utf8', offset + 46, offset + 46 + filenameLength);

    // Read file content from local file header
    const localOffset = localHeaderOffset;
    const localFilenameLength = buffer.readUInt16LE(localOffset + 26);
    const localExtraLength = buffer.readUInt16LE(localOffset + 28);
    const dataOffset = localOffset + 30 + localFilenameLength + localExtraLength;

    const content = buffer.toString('utf8', dataOffset, dataOffset + uncompressedSize);

    files.push({
      filename,
      size: uncompressedSize,
      content
    });

    offset += 46 + filenameLength + extraLength + commentLength;
  }

  return files;
}

function inspectZip(zipPath) {
  const buffer = fs.readFileSync(zipPath);
  const files = readZipCentralDirectory(buffer);

  console.log(`\n📦 ZIP Package: ${path.basename(zipPath)}\n`);
  console.log(`📁 Contains ${files.length} files:\n`);

  files.forEach(file => {
    console.log(`   📄 ${file.filename} (${file.size} bytes)`);
  });

  console.log('\n' + '='.repeat(80) + '\n');

  files.forEach(file => {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📄 ${file.filename}`);
    console.log('='.repeat(80) + '\n');
    console.log(file.content);
  });
}

const zipPath = process.argv[2];
if (!zipPath) {
  console.log('Usage: node inspect-zip.js <path-to-zip>');
  process.exit(1);
}

if (!fs.existsSync(zipPath)) {
  console.error(`File not found: ${zipPath}`);
  process.exit(1);
}

inspectZip(zipPath);
