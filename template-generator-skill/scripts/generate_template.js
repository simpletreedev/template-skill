#!/usr/bin/env node
/**
 * Template JSON Generator Script
 *
 * Generates template.json files based on user input.
 * Can be run standalone or called from AI skill.
 *
 * Usage:
 *   node generate_template.js --config <config.json>
 *   node generate_template.js --interactive
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");

// ==================== Color Palettes ====================
const STAGE_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
];

const OPTION_COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#84CC16",
  "#F97316",
  "#6366F1",
];

// ==================== Helper Functions ====================

function toKey(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function getStageColor(index) {
  return STAGE_COLORS[index % STAGE_COLORS.length];
}

function getOptionColor(index) {
  return OPTION_COLORS[index % OPTION_COLORS.length];
}

function createFieldDefinition(name, type, order, options = null) {
  const field = {
    key: toKey(name),
    name,
    type,
    order,
  };

  if (options && (type === "SELECT" || type === "MULTI_SELECT")) {
    field.options = options.map((value, idx) => ({
      value,
      color: getOptionColor(idx),
      order: idx,
    }));
  }

  return field;
}

function createStage(name, order, color = null) {
  return {
    key: toKey(name),
    name,
    color: color || getStageColor(order),
    order,
  };
}

function createItem(
  name,
  stageKey,
  order,
  description = null,
  customFields = null,
) {
  const item = {
    key: toKey(name),
    name,
    stageKey,
    order,
  };
  if (description) item.description = description;
  if (customFields) item.customFields = customFields;
  return item;
}

function createDocument(title, content, description = null) {
  const doc = {
    key: toKey(title),
    title,
    content,
  };
  if (description) doc.description = description;
  return doc;
}

// ==================== Template Generator ====================

function generateTemplate(config) {
  const {
    templateKey,
    name,
    description,
    icon,
    lists: listConfigs = [],
    documents: docConfigs = [],
    metadata = {},
  } = config;

  const template = {
    templateKey: templateKey || toKey(name),
    name,
    description,
    icon: icon || "📋",
    isActive: true,
    lists: [],
    documents: [],
    metadata: {
      version: metadata.version || "1.0.0",
      author: metadata.author || "AI Template Generator",
      createdAt: metadata.createdAt || new Date().toISOString().split("T")[0],
      ...metadata,
    },
  };

  // Generate lists
  listConfigs.forEach((listConfig, listIdx) => {
    const list = {
      key: listConfig.key || toKey(listConfig.name),
      name: listConfig.name,
      description: listConfig.description || "",
      fieldDefinitions: [],
      stages: [],
      items: [],
    };

    // Generate field definitions
    (listConfig.fields || []).forEach((fieldConfig, fieldIdx) => {
      const field = createFieldDefinition(
        fieldConfig.name,
        fieldConfig.type,
        fieldIdx,
        fieldConfig.options,
      );
      if (fieldConfig.required !== undefined)
        field.required = fieldConfig.required;
      if (fieldConfig.defaultValue !== undefined)
        field.defaultValue = fieldConfig.defaultValue;
      list.fieldDefinitions.push(field);
    });

    // Generate stages
    (listConfig.stages || []).forEach((stageConfig, stageIdx) => {
      const stageName =
        typeof stageConfig === "string" ? stageConfig : stageConfig.name;
      const stageColor =
        typeof stageConfig === "string" ? null : stageConfig.color;
      list.stages.push(createStage(stageName, stageIdx, stageColor));
    });

    // Generate items
    (listConfig.items || []).forEach((itemConfig, itemIdx) => {
      const stageKey = itemConfig.stageKey || list.stages[0]?.key || "default";
      const item = createItem(
        itemConfig.name,
        stageKey,
        itemIdx,
        itemConfig.description,
        itemConfig.customFields,
      );
      if (itemConfig.parentKey) item.parentKey = itemConfig.parentKey;
      list.items.push(item);
    });

    template.lists.push(list);
  });

  // Generate documents
  docConfigs.forEach((docConfig) => {
    template.documents.push(
      createDocument(docConfig.title, docConfig.content, docConfig.description),
    );
  });

  return template;
}

// ==================== Validation ====================

function validateTemplate(template) {
  const errors = [];

  if (!template.templateKey) errors.push("templateKey is required");
  if (!template.name) errors.push("name is required");
  if (!template.description) errors.push("description is required");
  if (!Array.isArray(template.lists)) errors.push("lists must be an array");
  if (!Array.isArray(template.documents))
    errors.push("documents must be an array");
  if (!template.metadata) errors.push("metadata is required");

  const listKeys = new Set();
  (template.lists || []).forEach((list, listIdx) => {
    if (!list.key) errors.push(`List ${listIdx}: key is required`);
    if (listKeys.has(list.key))
      errors.push(`List ${listIdx}: duplicate key "${list.key}"`);
    listKeys.add(list.key);

    const fieldKeys = new Set();
    (list.fieldDefinitions || []).forEach((field, fieldIdx) => {
      if (!field.key)
        errors.push(`List "${list.key}" Field ${fieldIdx}: key is required`);
      if (fieldKeys.has(field.key))
        errors.push(`List "${list.key}" Field ${fieldIdx}: duplicate key`);
      fieldKeys.add(field.key);
    });

    const stageKeys = new Set();
    (list.stages || []).forEach((stage, stageIdx) => {
      if (!stage.key)
        errors.push(`List "${list.key}" Stage ${stageIdx}: key is required`);
      if (stageKeys.has(stage.key))
        errors.push(`List "${list.key}" Stage ${stageIdx}: duplicate key`);
      stageKeys.add(stage.key);
    });

    (list.items || []).forEach((item, itemIdx) => {
      if (!stageKeys.has(item.stageKey)) {
        errors.push(
          `List "${list.key}" Item ${itemIdx}: stageKey "${item.stageKey}" not found`,
        );
      }
      (item.customFields || []).forEach((cf, cfIdx) => {
        if (!fieldKeys.has(cf.fieldKey)) {
          errors.push(
            `List "${list.key}" Item ${itemIdx} CF ${cfIdx}: fieldKey "${cf.fieldKey}" not found`,
          );
        }
      });
    });
  });

  const docKeys = new Set();
  (template.documents || []).forEach((doc, docIdx) => {
    if (!doc.key) errors.push(`Document ${docIdx}: key is required`);
    if (docKeys.has(doc.key)) errors.push(`Document ${docIdx}: duplicate key`);
    docKeys.add(doc.key);
  });

  return { valid: errors.length === 0, errors };
}

// ==================== File Operations ====================

function saveTemplate(template, outputPath) {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(outputPath, JSON.stringify(template, null, 2), "utf8");
  console.log(`✅ Template saved to: ${outputPath}`);
}

function loadConfig(configPath) {
  const content = fs.readFileSync(configPath, "utf8");
  return JSON.parse(content);
}

// ==================== Sample Templates ====================

const SAMPLE_TEMPLATES = {
  project_management: {
    name: "Project Management",
    description: "Project management with stages from planning to completion",
    icon: "📋",
    lists: [
      {
        name: "Project Tasks",
        description: "Project task list",
        fields: [
          { name: "Task Name", type: "TEXT", required: true },
          { name: "Description", type: "TEXTAREA" },
          {
            name: "Priority",
            type: "SELECT",
            options: ["High", "Medium", "Low"],
            required: true,
          },
          { name: "Assignee", type: "ASSIGNEE" },
          { name: "Deadline", type: "DEADLINE" },
          { name: "Estimated Hours", type: "NUMBER" },
        ],
        stages: ["Backlog", "To Do", "In Progress", "Review", "Done"],
        items: [
          {
            name: "Define project scope",
            stageKey: "backlog",
            description: "Define project scope and objectives",
            customFields: [{ fieldKey: "priority", value: "High" }],
          },
          {
            name: "Create project timeline",
            stageKey: "backlog",
            description: "Create timeline and milestones",
          },
          {
            name: "Assign team members",
            stageKey: "to_do",
            description: "Assign personnel to tasks",
          },
          {
            name: "Setup development environment",
            stageKey: "to_do",
            description: "Setup dev environment",
          },
          {
            name: "Weekly status meeting",
            stageKey: "in_progress",
            description: "Weekly progress report meeting",
          },
        ],
      },
    ],
    documents: [
      {
        title: "Project Charter",
        content:
          "# Project Charter\n\n## Objectives\n\n## Scope\n\n## Timeline\n\n## Stakeholders\n\n## Budget",
        description: "Project initialization document",
      },
    ],
  },

  recruitment: {
    name: "Recruitment Pipeline",
    description: "Recruitment process from CV review to onboarding",
    icon: "👥",
    lists: [
      {
        name: "Candidates",
        description: "Candidate list",
        fields: [
          { name: "Candidate Name", type: "TEXT", required: true },
          { name: "Position", type: "TEXT", required: true },
          { name: "Email", type: "TEXT" },
          { name: "Phone", type: "TEXT" },
          { name: "Salary Expectation", type: "NUMBER" },
          {
            name: "Source",
            type: "SELECT",
            options: ["LinkedIn", "Referral", "Job Board", "Direct Apply"],
          },
          {
            name: "Rating",
            type: "SELECT",
            options: ["⭐⭐⭐⭐⭐", "⭐⭐⭐⭐", "⭐⭐⭐", "⭐⭐", "⭐"],
          },
          { name: "Resume", type: "FILE" },
          { name: "Interview Date", type: "DATE_TIME" },
        ],
        stages: [
          "CV Review",
          "Phone Screen",
          "Technical Interview",
          "Final Interview",
          "Offer",
          "Hired",
          "Rejected",
        ],
        items: [
          {
            name: "John Doe - Frontend Developer",
            stageKey: "cv_review",
            customFields: [
              { fieldKey: "position", value: "Frontend Developer" },
              { fieldKey: "source", value: "LinkedIn" },
            ],
          },
          {
            name: "Jane Smith - Backend Developer",
            stageKey: "technical_interview",
            customFields: [
              { fieldKey: "position", value: "Backend Developer" },
              { fieldKey: "rating", value: "⭐⭐⭐⭐" },
            ],
          },
        ],
      },
    ],
    documents: [
      {
        title: "Interview Guide",
        content:
          "# Interview Guide\n\n## Technical Questions\n\n## Behavioral Questions\n\n## Evaluation Criteria",
        description: "Interview guide for HR and Hiring Managers",
      },
    ],
  },

  marketing_campaign: {
    name: "Marketing Campaign",
    description: "Marketing campaign management from planning to launch",
    icon: "📣",
    lists: [
      {
        name: "Campaign Tasks",
        description: "Campaign tasks",
        fields: [
          { name: "Task Name", type: "TEXT", required: true },
          { name: "Description", type: "TEXTAREA" },
          {
            name: "Channel",
            type: "SELECT",
            options: ["Facebook", "Google", "LinkedIn", "Email", "TikTok"],
          },
          { name: "Budget", type: "NUMBER" },
          { name: "Deadline", type: "DEADLINE" },
          {
            name: "Status",
            type: "SELECT",
            options: ["Not Started", "In Progress", "Completed"],
          },
        ],
        stages: [
          "Planning",
          "Content Creation",
          "Review",
          "Scheduled",
          "Live",
          "Completed",
        ],
        items: [
          { name: "Define target audience", stageKey: "planning" },
          { name: "Create content calendar", stageKey: "planning" },
          { name: "Design banner ads", stageKey: "content_creation" },
          { name: "Write ad copy", stageKey: "content_creation" },
          { name: "Setup tracking pixels", stageKey: "review" },
        ],
      },
    ],
    documents: [
      {
        title: "Campaign Brief",
        content:
          "# Campaign Brief\n\n## Objectives\n\n## Target Audience\n\n## Key Messages\n\n## Budget\n\n## Timeline",
        description: "Campaign brief document",
      },
    ],
  },

  sales_pipeline: {
    name: "Sales Pipeline",
    description: "Sales pipeline management from lead to closed",
    icon: "💰",
    lists: [
      {
        name: "Deals",
        description: "Deals list",
        fields: [
          { name: "Company Name", type: "TEXT", required: true },
          { name: "Contact Person", type: "TEXT" },
          { name: "Email", type: "TEXT" },
          { name: "Phone", type: "TEXT" },
          { name: "Deal Value", type: "NUMBER", required: true },
          {
            name: "Probability",
            type: "SELECT",
            options: ["10%", "25%", "50%", "75%", "90%"],
          },
          { name: "Expected Close Date", type: "DATE" },
          {
            name: "Source",
            type: "SELECT",
            options: ["Inbound", "Outbound", "Referral", "Partner"],
          },
        ],
        stages: [
          "Lead",
          "Qualified",
          "Proposal",
          "Negotiation",
          "Closed Won",
          "Closed Lost",
        ],
        items: [
          {
            name: "ABC Corp - Enterprise License",
            stageKey: "lead",
            customFields: [{ fieldKey: "deal_value", value: 50000 }],
          },
          {
            name: "XYZ Inc - Starter Plan",
            stageKey: "qualified",
            customFields: [{ fieldKey: "deal_value", value: 5000 }],
          },
        ],
      },
    ],
    documents: [
      {
        title: "Sales Playbook",
        content:
          "# Sales Playbook\n\n## Qualification Criteria\n\n## Objection Handling\n\n## Pricing Guide",
        description: "Sales guide document",
      },
    ],
  },
};

// ==================== Interactive Mode ====================

async function interactiveMode() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt) =>
    new Promise((resolve) => rl.question(prompt, resolve));

  console.log("\n🎨 Template JSON Generator - Interactive Mode\n");
  console.log("Available sample templates:");
  Object.keys(SAMPLE_TEMPLATES).forEach((key, idx) => {
    console.log(`  ${idx + 1}. ${SAMPLE_TEMPLATES[key].name} (${key})`);
  });
  console.log(
    `  ${Object.keys(SAMPLE_TEMPLATES).length + 1}. Custom template\n`,
  );

  const choice = await question("Choose template (number): ");
  const choiceNum = parseInt(choice);
  const templateKeys = Object.keys(SAMPLE_TEMPLATES);

  let config;
  if (choiceNum > 0 && choiceNum <= templateKeys.length) {
    const key = templateKeys[choiceNum - 1];
    config = { ...SAMPLE_TEMPLATES[key], templateKey: key };
  } else {
    // Custom template
    const name = await question("Template name: ");
    const description = await question("Description: ");
    const stagesInput = await question("Stages (comma-separated): ");
    const stages = stagesInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    config = {
      name,
      description,
      lists: [
        {
          name: "Main List",
          fields: [
            { name: "Name", type: "TEXT", required: true },
            { name: "Description", type: "TEXTAREA" },
            {
              name: "Priority",
              type: "SELECT",
              options: ["High", "Medium", "Low"],
            },
            { name: "Deadline", type: "DEADLINE" },
          ],
          stages,
          items: [],
        },
      ],
      documents: [],
    };
  }

  const template = generateTemplate(config);
  const validation = validateTemplate(template);

  if (!validation.valid) {
    console.log("\n❌ Validation errors:");
    validation.errors.forEach((e) => console.log(`  - ${e}`));
    rl.close();
    return;
  }

  const outputDir =
    (await question("Output directory (default: ./templates): ")) ||
    "./templates";
  const filename = `${template.templateKey}.template.json`;
  const outputPath = path.join(outputDir, filename);

  saveTemplate(template, outputPath);
  rl.close();
}

// ==================== CLI ====================

function printUsage() {
  console.log(`
Template JSON Generator

Usage:
  node generate_template.js --config <config.json>    Generate from config file
  node generate_template.js --interactive             Interactive mode
  node generate_template.js --sample <template_key>   Generate sample template
  node generate_template.js --list-samples            List available samples

Options:
  -c, --config <file>     Config file path
  -i, --interactive       Interactive mode
  -s, --sample <key>      Sample template key
  -o, --output <dir>      Output directory (default: ./templates)
  -l, --list-samples      List available sample templates
  -h, --help              Show this help
  `);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("-h") || args.includes("--help")) {
    printUsage();
    return;
  }

  if (args.includes("-l") || args.includes("--list-samples")) {
    console.log("\nAvailable sample templates:");
    Object.keys(SAMPLE_TEMPLATES).forEach((key) => {
      console.log(`  - ${key}: ${SAMPLE_TEMPLATES[key].name}`);
    });
    return;
  }

  if (args.includes("-i") || args.includes("--interactive")) {
    await interactiveMode();
    return;
  }

  let config = null;
  let outputDir = "./templates";

  for (let i = 0; i < args.length; i++) {
    if ((args[i] === "-c" || args[i] === "--config") && args[i + 1]) {
      config = loadConfig(args[i + 1]);
      i++;
    } else if ((args[i] === "-s" || args[i] === "--sample") && args[i + 1]) {
      const sampleKey = args[i + 1];
      if (SAMPLE_TEMPLATES[sampleKey]) {
        config = { ...SAMPLE_TEMPLATES[sampleKey], templateKey: sampleKey };
      } else {
        console.error(`❌ Unknown sample: ${sampleKey}`);
        return;
      }
      i++;
    } else if ((args[i] === "-o" || args[i] === "--output") && args[i + 1]) {
      outputDir = args[i + 1];
      i++;
    }
  }

  if (!config) {
    console.error(
      "❌ No config provided. Use --config, --sample, or --interactive",
    );
    return;
  }

  const template = generateTemplate(config);
  const validation = validateTemplate(template);

  if (!validation.valid) {
    console.log("\n❌ Validation errors:");
    validation.errors.forEach((e) => console.log(`  - ${e}`));
    return;
  }

  const filename = `${template.templateKey}.template.json`;
  const outputPath = path.join(outputDir, filename);
  saveTemplate(template, outputPath);
}

// Export for module use
module.exports = {
  generateTemplate,
  validateTemplate,
  saveTemplate,
  SAMPLE_TEMPLATES,
  createFieldDefinition,
  createStage,
  createItem,
  createDocument,
  toKey,
};

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
