#!/usr/bin/env node
/**
 * AI-Driven Template Generator for Privos Chat
 *
 * Usage:
 *   node ai_template.js --prompt "your workflow description" --roomId <room-id>
 *
 * The AI analyzes the prompt and generates:
 * - Appropriate field definitions for the workflow
 * - Relevant stages/phases
 * - Meaningful tasks with contextual custom field values
 */

const API_BASE = "https://privos-chat-dev.roxane.one/api/v1/internal";

// Available field types
const FIELD_TYPES = {
  TEXT: "TEXT",
  TEXTAREA: "TEXTAREA",
  NUMBER: "NUMBER",
  DATE: "DATE",
  DATE_TIME: "DATE_TIME",
  SELECT: "SELECT",
  MULTI_SELECT: "MULTI_SELECT",
  USER: "USER",
  CHECKBOX: "CHECKBOX",
  URL: "URL",
  FILE: "FILE",
  DOCUMENT: "DOCUMENT",
  ASSIGNEE: "ASSIGNEE",
  DEADLINE: "DEADLINE",
};

// Stage colors
const STAGE_COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899",
];

// Option colors for SELECT fields
const OPTION_COLORS = [
  "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899",
  "#06B6D4", "#84CC16", "#F97316", "#6366F1",
];

function formatOptions(options) {
  if (!options || !Array.isArray(options)) return [];
  return options.map((value, order) => ({
    value,
    color: OPTION_COLORS[order % OPTION_COLORS.length],
    order,
  }));
}

// AI-powered template generation
function generateAIStructure(userPrompt) {
  // This is where Claude/LLM would analyze and generate the structure
  // For now, return a structured response based on pattern matching

  return analyzeWorkflow(userPrompt);
}

// Workflow analyzer - determines fields, stages, and tasks based on prompt
function analyzeWorkflow(prompt) {
  // Common workflow patterns
  const patterns = {
    recruitment: {
      keywords: ["recruit", "hire", "candidate", "interview", "job", "application", "onboard"],
      fields: [
        { name: "Candidate Name", type: "TEXT" },
        { name: "Position", type: "TEXT" },
        { name: "Status", type: "SELECT", options: ["Applied", "Screening", "Interview", "Offer", "Hired", "Rejected"] },
        { name: "Priority", type: "SELECT", options: ["High", "Medium", "Low"] },
        { name: "Applied Date", type: "DATE" },
        { name: "Source", type: "SELECT", options: ["LinkedIn", "Referral", "Job Board", "Website", "Agency"] },
        { name: "Salary Expectation", type: "TEXT" },
        { name: "Experience", type: "TEXT" },
        { name: "Assignee", type: "USER" },
        { name: "Notes", type: "TEXTAREA" },
      ],
      stages: [
        {
          name: "Applications",
          tasks: ["Review resume", "Screen application", "Initial assessment"]
        },
        {
          name: "Screening",
          tasks: ["Phone screen", "Skills assessment", "Background check"]
        },
        {
          name: "Interview",
          tasks: ["Technical interview", "Cultural fit interview", "Panel interview"]
        },
        {
          name: "Offer",
          tasks: ["Prepare offer", "Negotiate salary", "Send contract"]
        },
        {
          name: "Onboarding",
          tasks: ["Setup account", "Orientation", "Training assignment"]
        }
      ]
    },

    marketing: {
      keywords: ["marketing", "campaign", "advertise", "promote", "content", "social media", "ads"],
      fields: [
        { name: "Campaign Name", type: "TEXT" },
        { name: "Status", type: "SELECT", options: ["Planning", "Active", "Paused", "Completed"] },
        { name: "Channel", type: "SELECT", options: ["Facebook", "Google", "LinkedIn", "Email", "TikTok", "Instagram"] },
        { name: "Budget", type: "NUMBER" },
        { name: "Spent", type: "NUMBER" },
        { name: "Start Date", type: "DATE" },
        { name: "End Date", type: "DATE" },
        { name: "Target Audience", type: "TEXT" },
        { name: "Assignee", type: "USER" },
        { name: "Notes", type: "TEXTAREA" },
      ],
      stages: [
        {
          name: "Planning",
          tasks: ["Define objectives", "Identify target audience", "Set budget", "Choose channels"]
        },
        {
          name: "Content",
          tasks: ["Create ad copy", "Design creatives", "Build landing page", "Setup tracking"]
        },
        {
          name: "Launch",
          tasks: ["Configure campaigns", "QA all assets", "Go live", "Monitor initial performance"]
        },
        {
          name: "Optimization",
          tasks: ["Analyze metrics", "A/B test variations", "Adjust targeting", "Optimize bids"]
        }
      ]
    },

    sales: {
      keywords: ["sales", "deal", "prospect", "lead", "pipeline", "revenue", "customer", "close"],
      fields: [
        { name: "Company", type: "TEXT" },
        { name: "Contact", type: "TEXT" },
        { name: "Stage", type: "SELECT", options: ["Prospect", "Qualified", "Proposal", "Negotiation", "Won", "Lost"] },
        { name: "Deal Value", type: "NUMBER" },
        { name: "Probability", type: "SELECT", options: ["10%", "25%", "50%", "75%", "90%"] },
        { name: "Expected Close", type: "DATE" },
        { name: "Source", type: "SELECT", options: ["Inbound", "Outbound", "Referral", "Partner", "Event"] },
        { name: "Assignee", type: "USER" },
        { name: "Notes", type: "TEXTAREA" },
      ],
      stages: [
        {
          name: "Prospecting",
          tasks: ["Research company", "Find decision maker", "Send outreach", "Connect on LinkedIn"]
        },
        {
          name: "Qualification",
          tasks: ["Discovery call", "Assess needs", "Verify budget", "Confirm timeline"]
        },
        {
          name: "Proposal",
          tasks: ["Prepare demo", "Create proposal", "Present pricing", "Handle objections"]
        },
        {
          name: "Closing",
          tasks: ["Negotiate terms", "Prepare contract", "Get signature", "Setup billing"]
        }
      ]
    },

    project: {
      keywords: ["project", "task", "milestone", "sprint", "deadline", "deliverable"],
      fields: [
        { name: "Task Name", type: "TEXT" },
        { name: "Status", type: "SELECT", options: ["Backlog", "To Do", "In Progress", "Review", "Done"] },
        { name: "Priority", type: "SELECT", options: ["Critical", "High", "Medium", "Low"] },
        { name: "Assignee", type: "USER" },
        { name: "Due Date", type: "DATE" },
        { name: "Story Points", type: "NUMBER" },
        { name: "Sprint", type: "TEXT" },
        { name: "Notes", type: "TEXTAREA" },
      ],
      stages: [
        {
          name: "Backlog",
          tasks: ["Gather requirements", "Create user stories", "Prioritize features"]
        },
        {
          name: "In Progress",
          tasks: ["Development", "Code review", "Unit testing"]
        },
        {
          name: "Review",
          tasks: ["QA testing", "Bug fixes", "Documentation"]
        },
        {
          name: "Done",
          tasks: ["Deploy to staging", "Client approval", "Production release"]
        }
      ]
    },

    customer_support: {
      keywords: ["support", "ticket", "help", "issue", "customer service", "resolve"],
      fields: [
        { name: "Ticket", type: "TEXT" },
        { name: "Customer", type: "TEXT" },
        { name: "Status", type: "SELECT", options: ["Open", "In Progress", "Waiting", "Resolved", "Closed"] },
        { name: "Priority", type: "SELECT", options: ["Urgent", "High", "Normal", "Low"] },
        { name: "Category", type: "SELECT", options: ["Bug", "Feature", "Question", "Complaint"] },
        { name: "Assigned To", type: "USER" },
        { name: "Created", type: "DATE" },
        { name: "Resolution", type: "TEXTAREA" },
      ],
      stages: [
        {
          name: "New",
          tasks: ["Acknowledge ticket", "Categorize issue", "Assign agent"]
        },
        {
          name: "Investigating",
          tasks: ["Reproduce issue", "Research solution", "Consult team"]
        },
        {
          name: "Solving",
          tasks: ["Implement fix", "Test solution", "Document workaround"]
        },
        {
          name: "Resolved",
          tasks: ["Notify customer", "Verify resolution", "Close ticket"]
        }
      ]
    }
  };

  // Analyze prompt to find matching pattern
  const lowerPrompt = prompt.toLowerCase();
  let bestMatch = null;
  let bestScore = 0;

  for (const [type, config] of Object.entries(patterns)) {
    let score = 0;
    for (const keyword of config.keywords) {
      if (lowerPrompt.includes(keyword)) {
        score++;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = config;
    }
  }

  // If no good match, use a generic template
  if (!bestMatch || bestScore === 0) {
    return generateGenericTemplate(prompt);
  }

  return bestMatch;
}

function generateGenericTemplate(prompt) {
  return {
    name: `Custom Workflow: ${prompt.substring(0, 30)}...`,
    description: `AI-generated workflow based on: ${prompt}`,
    fields: [
      { name: "Task Name", type: "TEXT" },
      { name: "Description", type: "TEXTAREA" },
      { name: "Status", type: "SELECT", options: ["Not Started", "In Progress", "Completed"] },
      { name: "Priority", type: "SELECT", options: ["High", "Medium", "Low"] },
      { name: "Assignee", type: "USER" },
      { name: "Due Date", type: "DATE" },
      { name: "Notes", type: "TEXTAREA" },
    ],
    stages: [
      {
        name: "To Do",
        tasks: ["Define requirements", "Plan approach", "Set timeline"]
      },
      {
        name: "In Progress",
        tasks: ["Execute main task", "Track progress", "Handle blockers"]
      },
      {
        name: "Review",
        tasks: ["Review work", "Make adjustments", "Get approval"]
      },
      {
        name: "Done",
        tasks: ["Finalize deliverable", "Document outcome", "Archive project"]
      }
    ]
  };
}

// API functions
async function apiCall(endpoint, data, apiKey) {
  const response = await fetch(`${API_BASE}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify(data),
  });

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(`API Error (${response.status}): ${responseText}`);
  }

  return JSON.parse(responseText);
}

async function apiGet(endpoint, apiKey) {
  const url = `${API_BASE}/${endpoint}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API Error (${response.status}): ${text}`);
  }

  return response.json();
}

// Main create function
async function createAIGeneratedTemplate(prompt, roomId, apiKey) {
  console.log(`\n🤖 Analyzing: "${prompt}"`);

  // Generate structure based on prompt
  const structure = generateAIStructure(prompt);

  console.log(`\n📋 Template: ${structure.name}`);
  console.log(`   ${structure.description}`);

  const stageNames = structure.stages.map(s => s.name);
  const stagesPayload = stageNames.map((name, order) => ({
    name,
    color: STAGE_COLORS[order % STAGE_COLORS.length],
    order: order + 1,
  }));

  // Prepare field definitions
  const fieldDefinitions = structure.fields.map((f, i) => ({
    name: f.name,
    type: f.type,
    options: formatOptions(f.options),
    order: i + 1,
  }));

  console.log(`\n1️⃣  Creating list with ${fieldDefinitions.length} fields...`);
  const listResult = await apiCall(
    "lists.create",
    {
      name: structure.name,
      description: structure.description,
      roomId,
      fieldDefinitions,
      stages: stagesPayload,
    },
    apiKey,
  );

  const listId = listResult.list?._id || listResult.list?.id;
  console.log(`   ✓ List ID: ${listId}`);
  console.log(`   ✓ Fields: ${fieldDefinitions.map(f => f.name).join(", ")}`);

  // Get stage IDs
  console.log(`\n2️⃣  Fetching stage IDs...`);
  const stagesResult = await apiGet(`stages.byListId?listId=${listId}`, apiKey);
  const stagesMap = {};
  stagesResult.stages.forEach((stage) => {
    stagesMap[stage.name] = stage._id;
    console.log(`   ✓ ${stage.name}: ${stage._id}`);
  });

  // Get field IDs and build option map
  console.log(`\n3️⃣  Fetching field IDs...`);
  const listDetail = await apiGet(`lists/${listId}`, apiKey);
  const fieldMap = {};
  const optionMap = {};

  listDetail.list.fieldDefinitions?.forEach((field) => {
    fieldMap[field.name] = field._id;
    if (field.type === "SELECT" && field.options) {
      optionMap[field.name] = {};
      field.options.forEach((opt) => {
        optionMap[field.name][opt.value] = opt._id;
      });
    }
  });

  // Create items with contextual custom field values
  console.log(`\n4️⃣  Creating items with contextual values...`);
  const allItems = [];

  for (const stageConfig of structure.stages) {
    const stageId = stagesMap[stageConfig.name];

    for (const taskName of stageConfig.tasks) {
      const item = {
        name: taskName,
        description: `Auto-generated task for ${stageConfig.name} phase`,
        stageId,
        parentId: null,
        customFields: [],
      };

      // Add contextual custom field values
      for (const fieldDef of structure.fields) {
        const fieldId = fieldMap[fieldDef.name];
        if (!fieldId) continue;

        const value = generateContextualValue(fieldDef, taskName, stageConfig.name, optionMap);
        if (value !== null && value !== undefined) {
          item.customFields.push({ fieldId, value });
        }
      }

      allItems.push(item);
    }
  }

  const batchResult = await apiCall(
    "items.batch-create",
    { listId, items: allItems },
    apiKey,
  );

  console.log(`   ✓ Created ${batchResult.totalCreated || allItems.length} items`);

  console.log(`\n✅ Template created successfully!`);
  console.log(`   List: ${structure.name}`);
  console.log(`   Stages: ${stageNames.length}`);
  console.log(`   Items: ${batchResult.totalCreated || allItems.length}`);

  return {
    listId,
    stageCount: stageNames.length,
    itemCount: batchResult.totalCreated || allItems.length,
  };
}

// Generate contextual value based on field, task, and stage
function generateContextualValue(fieldDef, taskName, stageName, optionMap) {
  const isSelectField = fieldDef.type === "SELECT";

  // Skip certain fields for auto-generated items
  if (["Candidate Name", "Customer", "Contact", "Company"].includes(fieldDef.name)) {
    return "TBD"; // To be filled by user
  }

  // Context-aware defaults
  switch (fieldDef.name) {
    case "Task Name":
      return taskName;

    case "Status":
      if (stageName.includes("Planning") || stageName.includes("Backlog") || stageName.includes("New")) {
        return isSelectField ? optionMap["Status"]?.["Not Started"] || "Not Started" : "Not Started";
      }
      return isSelectField ? optionMap["Status"]?.["In Progress"] || "In Progress" : "In Progress";

    case "Priority":
      return isSelectField ? optionMap["Priority"]?.["Medium"] || "Medium" : "Medium";

    case "Due Date":
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);
      return dueDate.toISOString().split("T")[0];

    case "Start Date":
    case "Created":
      const today = new Date();
      return today.toISOString().split("T")[0];

    default:
      return null; // Don't set value, let user fill
  }
}

// Parse args
function parseArgs() {
  const args = process.argv.slice(2);
  const result = { prompt: null, roomId: null };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--prompt":
      case "-p":
        result.prompt = args[++i];
        break;
      case "--roomId":
      case "-r":
        result.roomId = args[++i];
        break;
      case "--help":
      case "-h":
        console.log(`
Usage: node ai_template.js --prompt "<workflow description>" --roomId <room-id>

Options:
  -p, --prompt <text>       Description of your workflow (required)
  -r, --roomId <id>         Room ID (required)

Environment:
  PRIVOS_API_KEY            API authentication key (required)

Examples:
  node ai_template.js -p "I need a recruitment pipeline for software engineers" -r abc123
  node ai_template.js -p "Help me track customer support tickets" -r xyz789
  node ai_template.js -p "Sales pipeline for B2B SaaS products" -r def456
        `);
        process.exit(0);
    }
  }

  return result;
}

// Main
async function main() {
  try {
    const { prompt, roomId } = parseArgs();

    if (!prompt || !roomId) {
      console.error("Error: --prompt and --roomId are required");
      process.exit(1);
    }

    const apiKey = process.env.PRIVOS_API_KEY;
    if (!apiKey) {
      console.error("Error: PRIVOS_API_KEY environment variable is required");
      process.exit(1);
    }

    await createAIGeneratedTemplate(prompt, roomId, apiKey);

  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    process.exit(1);
  }
}

main();
