# Upload Guide - Template Generator Skill

## 📦 Package này chứa gì?

File `template-generator-skill.zip` chứa:

```
template-generator-skill.zip
├── SKILL.md                                    # AI skill instructions
├── README.md                                   # Documentation
├── scripts/
│   ├── template-skill-generator.js            # Main generator tool
│   └── inspect-zip.js                         # ZIP inspector utility
├── examples/
│   ├── project_management.template.json
│   └── recruitment_pipeline.template.json
└── templates/
    ├── bug_tracking.template.json
    └── recruitment.template.json
```

## 🎯 Hai Use Cases

### Use Case 1: Upload Tool như một Skill

**Upload `template-generator-skill.zip` vào platform:**

```
1. Mở platform (Claude, GPT, v.v.)
2. Upload Plugins/Skills
3. Chọn file: template-generator-skill.zip
4. Platform tự động:
   - Đọc SKILL.md → Hiểu cách dùng tool
   - Organize vào skills/ folder
   - AI có thể gọi tool để generate templates
```

**Khi nào dùng:**
- Muốn AI tự generate templates khi chat
- Cần tool luôn sẵn sàng trong platform
- Muốn tái sử dụng cho nhiều projects

### Use Case 2: Upload Template để Import

**Tool generate templates và đóng gói:**

```bash
# Generate template từ config
node scripts/template-skill-generator.js --config my-template.json

# Output: packages/my_template.zip
# Chứa: template.json, IMPORT.md, .env.example
```

**Upload template ZIP vào hệ thống:**

```
1. Upload my_template.zip vào hệ thống target
2. Hệ thống đọc IMPORT.md
3. Parse template.json
4. Import tự động vào database
```

**Khi nào dùng:**
- Cần import template vào Privos Chat
- Share template với team
- Deploy template lên production

## 📝 Platform Upload Instructions

### Theo hình ảnh bạn cung cấp:

```
✅ Upload Plugins Dialog:
   - Supports: .zip, .tar, .gz, .gzip, .tgz
   - Auto-organize:
     • Skills (SKILL.md) → skills/
     • Commands (@command) → commands/
     • Agents (@agent) → agents/
```

### Upload Steps:

1. **Chọn file**
   ```
   Click "Select files" hoặc drag & drop
   → template-generator-skill.zip
   ```

2. **Platform xử lý**
   ```
   Platform phát hiện SKILL.md
   → Tự động classify là "skill"
   → Move vào skills/ folder
   ```

3. **Xác nhận**
   ```
   ✅ Upload successful
   ✅ Skill available for AI
   ```

4. **Sử dụng**
   ```
   Chat: "Generate me a project management template"
   AI: [Gọi template-generator-skill]
   AI: [Tạo config và generate template]
   AI: "Here's your template package: project_management.zip"
   ```

## 🔧 Workflow Hoàn Chỉnh

### Workflow 1: Dùng Skill trên Platform

```
1. Upload template-generator-skill.zip → Platform
2. Chat với AI: "Create a bug tracking template"
3. AI dùng skill để generate
4. Nhận file bug_tracking.zip
5. Upload bug_tracking.zip vào hệ thống target
6. Import thành công!
```

### Workflow 2: Local Generation + Upload

```
1. Local: node scripts/template-skill-generator.js --config my-config.json
2. Local: packages/my_template.zip được tạo
3. Upload my_template.zip vào hệ thống
4. Hệ thống đọc IMPORT.md và import
```

## ⚙️ Config Platform

Một số platforms có thể cần config:

### Option 1: Environment Variables

```bash
# Nếu platform hỗ trợ .env
SKILL_NAME=template-generator
SKILL_VERSION=1.0.0
OUTPUT_DIR=./packages
```

### Option 2: Platform Settings

```json
{
  "skills": {
    "template-generator": {
      "enabled": true,
      "autoLoad": true,
      "outputPath": "./packages"
    }
  }
}
```

## 🎯 Kết luận

**CÓ!** Tool này có thể:

✅ **Đóng gói thành ZIP** (Done - 87KB)
✅ **Upload lên platforms khác** (Ready)
✅ **Tự động organize** (Platform handle)
✅ **AI sử dụng được** (Có SKILL.md)

**File cần upload:**
- `template-generator-skill.zip` - Tool itself (87KB)
- `packages/*.zip` - Generated templates

**Platform support:**
- ✅ Platforms có "Upload Plugins/Skills" dialog
- ✅ Support .zip format
- ✅ Auto-detect SKILL.md
- ✅ Organize vào skills/ folder

## 📚 Tham khảo

- [SKILL.md](SKILL.md) - AI instructions
- [README.md](README.md) - User documentation
- Tool source: `scripts/template-skill-generator.js`

---

**Version:** 1.0.0
**Package:** template-generator-skill.zip
**Size:** 87,526 bytes
**Ready to upload!** 🚀
