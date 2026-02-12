#!/usr/bin/env node
/**
 * Template Skill Packager
 *
 * Takes a template JSON and creates a ZIP package
 * Usage: Call this from AI with template JSON data
 */

const fs = require("fs");
const path = require("path");
const http = require("http");
const https = require("https");

// ==================== ZIP Implementation ====================

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
    if (!this._crc32Table) {
      this._crc32Table = [];
      for (let i = 0; i < 256; i++) {
        let c = i;
        for (let j = 0; j < 8; j++) {
          c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        }
        this._crc32Table[i] = c;
      }
    }

    let crc = 0xffffffff;
    for (let i = 0; i < buffer.length; i++) {
      crc = this._crc32Table[(crc ^ buffer[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  }
}

// ==================== IMPORT.md Generator ====================

function generateImportMd(template) {
  return `# Import Template: ${template.name}

## Overview
${template.description}

## Template Structure

**Template Key:** \`${template.templateKey}\`
**Category:** ${template.metadata?.category || "General"}
**Version:** ${template.metadata?.version || "1.0.0"}

### Lists
${template.lists
  .map(
    (list) => `
- **${list.name}**
  - Fields: ${list.fieldDefinitions.length}
  - Stages: ${list.stages.length}
`,
  )
  .join("")}

### Documents
${
  template.documents && template.documents.length > 0
    ? template.documents.map((doc) => `- ${doc.title}`).join("\n")
    : "No documents included"
}

## How to Import

1. Upload this ZIP file to your Priovs system
2. The system will automatically:
   - Extract the template.json
   - Create the template structure
   - Set up all fields and stages
   - Add documentation

## Technical Details

- **Format:** JSON
- **Structure:** Lists → Stages → Items
- **Items:** Nested inside stages (no stageKey)
- **All keys:** snake_case format

Ready to import!
`;
}

// ==================== Upload Service ====================

async function uploadZipToService(zipPath) {
  const uploadUrl = process.env.UPLOAD_SERVICE_URL;

  if (!uploadUrl) {
    return null;
  }

  try {
    const url = new URL(uploadUrl + "/uploads");
    const protocol = url.protocol === "https:" ? https : http;

    const boundary =
      "----WebKitFormBoundary" + Math.random().toString(36).substring(2);
    const fileContent = fs.readFileSync(zipPath);
    const fileName = path.basename(zipPath);

    const parts = [];
    parts.push(`--${boundary}\r\n`);
    parts.push(
      `Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n`,
    );
    parts.push(`Content-Type: application/zip\r\n\r\n`);

    const header = Buffer.from(parts.join(""));
    const footer = Buffer.from(`\r\n--${boundary}--\r\n`);
    const body = Buffer.concat([header, fileContent, footer]);

    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === "https:" ? 443 : 80),
      path: url.pathname,
      method: "POST",
      headers: {
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
        "Content-Length": body.length,
      },
    };

    return new Promise((resolve, reject) => {
      const req = protocol.request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const result = JSON.parse(data);
            const downloadUrl = result.url;
            resolve(downloadUrl);
          } catch (e) {
            resolve(null);
          }
        });
      });

      req.on("error", () => resolve(null));
      req.write(body);
      req.end();
    });
  } catch (error) {
    return null;
  }
}

// ==================== Package Creator ====================

async function createSkillPackage(template, outputPath, additionalFiles = []) {
  const templateKey = template.templateKey;
  const zipPath = outputPath || `${templateKey}.zip`;
  const jsonPath = `${templateKey}.template.json`;

  // Write JSON file
  const templateJson = JSON.stringify(template, null, 2);
  fs.writeFileSync(jsonPath, templateJson);

  // Generate IMPORT.md
  const importMd = generateImportMd(template);

  // Create ZIP
  const zip = new SimpleZip();
  zip.addFile("template.json", templateJson);
  zip.addFile("IMPORT.md", importMd);

  // Add additional files to docs/ folder if provided
  if (additionalFiles && additionalFiles.length > 0) {
    // Create docs/ folder and write files
    const docsDir = "docs";
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir);
    }

    additionalFiles.forEach((file) => {
      // Write file to docs/ folder
      const filePath = `${docsDir}/${file.filename}`;
      if (file.buffer) {
        // Binary file (docx, pdf, excel)
        fs.writeFileSync(filePath, file.buffer);
      } else {
        // Text file (md, txt)
        fs.writeFileSync(filePath, file.content);
      }

      // Add to ZIP with docs/ prefix
      zip.addFile(`docs/${file.filename}`, file.buffer || file.content);
    });
  }

  const zipBuffer = zip.generate();
  fs.writeFileSync(zipPath, zipBuffer);

  // Get file sizes
  const jsonStats = fs.statSync(jsonPath);
  const zipStats = fs.statSync(zipPath);
  const jsonSizeKB = (jsonStats.size / 1024).toFixed(2);
  const fileSizeKB = (zipStats.size / 1024).toFixed(2);

  // Get absolute paths
  const absolutePath = path.resolve(zipPath);
  const absoluteJsonPath = path.resolve(jsonPath);

  // Upload to service if configured
  console.log("📤 Uploading to service...");
  const downloadUrl = await uploadZipToService(absolutePath);

  if (downloadUrl) {
    console.log("✅ Upload successful!\n");
  }

  // Return result
  return {
    success: true,
    jsonPath: absoluteJsonPath,
    zipPath: absolutePath,
    downloadUrl,
    templateKey,
    name: template.name,
    category: template.metadata?.category || "General",
    filesCreated: [
      { path: jsonPath, size: jsonSizeKB + " KB" },
      { path: zipPath, size: fileSizeKB + " KB" },
    ],
    additionalFilesCount: additionalFiles.length,
  };
}

// Export for module use
module.exports = {
  createSkillPackage,
  generateImportMd,
};
