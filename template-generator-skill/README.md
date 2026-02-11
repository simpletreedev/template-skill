# Template Skill Generator

Công cụ tổng hợp để tạo template skill packages - từ yêu cầu người dùng đến file ZIP hoàn chỉnh sẵn sàng import.

## Tổng quan

Tool này giúp bạn:

1. ✅ **Nhận yêu cầu** từ user (interactive hoặc config file)
2. ✅ **Generate JSON** template với cấu trúc chuẩn
3. ✅ **Tạo IMPORT.md** với hướng dẫn import chi tiết
4. ✅ **Đóng gói thành ZIP** chứa tất cả file cần thiết
5. ✅ **Sẵn sàng import** vào hệ thống khác

## Cấu trúc Package

Mỗi package ZIP chứa:

```
template-skill.zip
├── template.json     # Dữ liệu template với cấu trúc đầy đủ
├── IMPORT.md         # Hướng dẫn import cho tool khác
└── .env.example      # Template cho environment variables
```

## Cài đặt

```bash
# Clone repo
git clone <repo-url>
cd template-generator-skill

# Không cần install dependencies - pure Node.js!
```

## Sử dụng

### 1. Interactive Mode (Hỏi đáp)

```bash
node scripts/template-skill-generator.js --interactive
```

Tool sẽ hỏi các thông tin:
- Template name
- Description
- List name
- Stages (comma-separated)
- Fields (comma-separated)

### 2. Config File Mode (Từ file cấu hình)

```bash
node scripts/template-skill-generator.js --config my-template.json
```

**Ví dụ config file:**

```json
{
  "name": "Customer Support Tickets",
  "description": "Track and manage customer support tickets",
  "icon": "🎫",
  "category": "Customer Support",
  "tags": ["support", "tickets"],
  "lists": [
    {
      "name": "Support Tickets",
      "fields": [
        { "name": "Ticket Title", "type": "TEXT", "required": true },
        { "name": "Priority", "type": "SELECT", "options": [
          { "value": "High", "color": "#EF4444", "order": 0 },
          { "value": "Low", "color": "#10B981", "order": 1 }
        ]}
      ],
      "stages": [
        {
          "name": "New",
          "items": [
            {
              "key": "sample_ticket",
              "name": "Sample ticket",
              "order": 0,
              "customFields": [
                { "fieldKey": "priority", "value": "High" }
              ]
            }
          ]
        },
        { "name": "In Progress", "items": [] },
        { "name": "Resolved", "items": [] }
      ]
    }
  ]
}
```

### 3. Quick Mode (Nhanh)

```bash
node scripts/template-skill-generator.js --quick "Project Tracker"
```

Tạo template với cấu trúc mặc định: To Do → In Progress → Done

### 4. Chỉ định Output Path

```bash
node scripts/template-skill-generator.js --config my-config.json -o ./output/my-skill.zip
```

## Cấu trúc Template JSON

### Cấu trúc cơ bản

```typescript
interface ITemplate {
  templateKey: string;      // Unique identifier (snake_case)
  name: string;             // Display name
  description: string;      // Template description
  icon?: string;            // Emoji icon
  isActive: boolean;        // Always true
  lists: IList[];           // Danh sách các list
  documents?: IDocument[];  // Tài liệu đính kèm
  metadata: {
    version: string;
    author?: string;
    createdAt?: string;
    tags?: string[];
    category?: string;
  };
}
```

### List Structure

```typescript
interface IList {
  key: string;
  name: string;
  description: string;
  fieldDefinitions: IFieldDefinition[];
  stages: IStage[];  // Mỗi stage chứa items[]
}
```

### Stage Structure (MỚI!)

**Quan trọng:** Items giờ nằm TRONG stage, không còn `stageKey`

```typescript
interface IStage {
  key: string;
  name: string;
  color: string;    // Hex color
  order: number;
  items: IItem[];   // Items thuộc stage này
}
```

### Item Structure

```typescript
interface IItem {
  key: string;
  name: string;
  description?: string;
  order: number;
  // KHÔNG CÒN stageKey - vì item đã nằm trong stage
  customFields?: {
    fieldKey: string;
    value: any;
  }[];
}
```

## Field Types

| Type | Description | Example |
|------|-------------|---------|
| `TEXT` | Short text | "Task name" |
| `TEXTAREA` | Long text | "Description..." |
| `NUMBER` | Numeric value | 100 |
| `DATE` | Date only | "2026-02-10" |
| `DATE_TIME` | Date and time | "2026-02-10T10:00:00Z" |
| `SELECT` | Single select | "High" |
| `MULTI_SELECT` | Multiple select | ["tag1", "tag2"] |
| `CHECKBOX` | Boolean | true/false |
| `ASSIGNEE` | Assigned user | user_id |
| `DEADLINE` | Due date | "2026-02-15" |
| `FILE` | Single file | file object |
| `FILE_MULTIPLE` | Multiple files | [files] |

## Sử dụng Package ZIP

### Import vào hệ thống khác

```bash
# Tool khác sẽ:
1. Đọc IMPORT.md để hiểu cách import
2. Sử dụng template.json cho dữ liệu
3. Import tự động vào hệ thống

# Ví dụ với API:
curl -X POST "https://api.example.com/templates/import" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d @template.json
```

### Xem nội dung ZIP

```bash
node scripts/inspect-zip.js packages/my-template.zip
```

## Ví dụ hoàn chỉnh

### 1. Tạo config file

`recruitment-template.json`:
```json
{
  "name": "Recruitment Pipeline",
  "description": "Recruitment process from CV review to hiring",
  "icon": "👥",
  "category": "HR",
  "lists": [{
    "name": "Candidates",
    "fields": [
      { "name": "Candidate Name", "type": "TEXT", "required": true },
      { "name": "Position", "type": "TEXT", "required": true },
      { "name": "Rating", "type": "SELECT", "options": [
        { "value": "⭐⭐⭐⭐⭐", "color": "#10B981", "order": 0 },
        { "value": "⭐⭐⭐⭐", "color": "#3B82F6", "order": 1 }
      ]}
    ],
    "stages": [
      { "name": "CV Review", "items": [] },
      { "name": "Interview", "items": [] },
      { "name": "Hired", "items": [] }
    ]
  }]
}
```

### 2. Generate package

```bash
node scripts/template-skill-generator.js --config recruitment-template.json
```

### 3. Output

```
✅ Template skill package created successfully!

📦 Package: /path/to/packages/recruitment_pipeline.zip
📋 Template: Recruitment Pipeline (v1.0.0)

📁 Contents:
   ✓ template.json - Template data
   ✓ IMPORT.md - Import instructions
   ✓ .env.example - Environment variables

🚀 Next Steps:
   1. Upload recruitment_pipeline.zip to your import tool
   2. The tool will read IMPORT.md for instructions
   3. Template will be imported into the system
```

## Templates có sẵn

Thư mục `examples/` chứa các template mẫu:

- ✅ [project_management.template.json](examples/project_management.template.json) - Project management
- ✅ [recruitment_pipeline.template.json](examples/recruitment_pipeline.template.json) - Recruitment
- ✅ [bug_tracking.template.json](templates/bug_tracking.template.json) - Bug tracking
- ✅ [recruitment.template.json](templates/recruitment.template.json) - Recruitment simple

## Tools khác

### inspect-zip.js

Xem nội dung package ZIP:

```bash
node scripts/inspect-zip.js packages/my-template.zip
```

### Old Tools (Deprecated)

- ❌ `generate_template.js` - Gộp vào template-skill-generator.js
- ❌ `package_template.js` - Gộp vào template-skill-generator.js

## API Reference

### Module Usage

```javascript
const {
  generateTemplate,
  createSkillPackage,
  generateImportMd
} = require('./scripts/template-skill-generator.js');

// Generate template from config
const template = generateTemplate(config);

// Create ZIP package
const result = createSkillPackage(template, './output.zip');

// Generate IMPORT.md content only
const importMd = generateImportMd(template);
```

## Troubleshooting

### ZIP file không đọc được

```bash
# Verify ZIP signature
node -e "
const fs = require('fs');
const buf = fs.readFileSync('./packages/my-template.zip');
console.log('Valid ZIP:', buf.readUInt32LE(0) === 0x04034b50);
"
```

### Template không đúng format

Dùng tool inspect để kiểm tra:

```bash
node scripts/inspect-zip.js packages/my-template.zip | grep -A 20 "template.json"
```

## Thay đổi từ version cũ

### Items giờ nằm trong stages

**TRƯỚC:**
```json
{
  "stages": [
    { "key": "todo", "name": "To Do" }
  ],
  "items": [
    { "key": "item1", "stageKey": "todo" }
  ]
}
```

**SAU:**
```json
{
  "stages": [
    {
      "key": "todo",
      "name": "To Do",
      "items": [
        { "key": "item1" }
      ]
    }
  ]
}
```

### Không còn stageKey

Items không còn trường `stageKey` vì đã nằm trong stage tương ứng.

## License

MIT

## Support

Báo lỗi: [GitHub Issues](https://github.com/your-repo/issues)
