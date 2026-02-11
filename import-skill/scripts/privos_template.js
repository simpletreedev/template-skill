#!/usr/bin/env node
/**
 * Generate Privos Chat template with lists, stages, and items.
 *
 * Usage:
 *   node privos_template.js --domain marketing --roomId <room-id>
 */

const API_BASE = "https://privos-chat-dev.roxane.one/api/v1/internal";

// Domain field definitions
const DOMAIN_FIELDS = {
  marketing: [
    { name: "Task Name", type: "TEXT", required: true },
    { name: "Description", type: "TEXT", required: true },
    { name: "Deadline", type: "DATE", required: true },
    {
      name: "Priority",
      type: "SELECT",
      options: ["High", "Medium", "Low"],
      required: true,
    },
    {
      name: "Status",
      type: "SELECT",
      options: ["Pending", "In Progress", "Done"],
      required: true,
    },
    {
      name: "Channel",
      type: "SELECT",
      options: ["Facebook", "Google", "LinkedIn", "Email"],
      required: false,
    },
    { name: "Budget", type: "NUMBER", required: false },
  ],
  recruitment: [
    { name: "Task Name", type: "TEXT", required: true },
    { name: "Description", type: "TEXT", required: true },
    { name: "Deadline", type: "DATE", required: true },
    {
      name: "Priority",
      type: "SELECT",
      options: ["High", "Medium", "Low"],
      required: true,
    },
    {
      name: "Status",
      type: "SELECT",
      options: ["Pending", "In Progress", "Done"],
      required: true,
    },
    { name: "Candidate", type: "TEXT", required: false },
    { name: "Position", type: "TEXT", required: false },
    { name: "Salary Range", type: "TEXT", required: false },
  ],
  sales: [
    { name: "Task Name", type: "TEXT", required: true },
    { name: "Description", type: "TEXT", required: true },
    { name: "Deadline", type: "DATE", required: true },
    {
      name: "Priority",
      type: "SELECT",
      options: ["High", "Medium", "Low"],
      required: true,
    },
    {
      name: "Status",
      type: "SELECT",
      options: ["Pending", "In Progress", "Done"],
      required: true,
    },
    { name: "Company", type: "TEXT", required: false },
    { name: "Deal Value", type: "NUMBER", required: false },
  ],
};

// Stage colors by order
const STAGE_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

// Option colors for SELECT fields
const OPTION_COLORS = [
  "#3B82F6", // blue
  "#10B981", // green
  "#F59E0B", // yellow
  "#EF4444", // red
  "#8B5CF6", // purple
  "#EC4899", // pink
  "#06B6D4", // cyan
  "#84CC16", // lime
  "#F97316", // orange
  "#6366F1", // indigo
];

// Helper to convert options array to proper format
function formatOptions(options) {
  if (!options || !Array.isArray(options)) return [];
  return options.map((value, order) => ({
    // _id: `opt_${Date.now()}_${order}_${Math.random().toString(36).substr(2, 9)}`,
    value,
    color: OPTION_COLORS[order % OPTION_COLORS.length],
    order,
  }));
}

// Domain templates (phases -> tasks)
const DOMAIN_TEMPLATES = {
  marketing: {
    name: "Marketing Campaign",
    description: "Manage marketing campaigns from planning to launch",
    phases: {
      Planning: [
        {
          name: "Define campaign objectives",
          description: "Establish SMART goals",
        },
        {
          name: "Identify target audience",
          description: "Create user personas",
        },
        {
          name: "Set budget allocation",
          description: "Determine budget across channels",
        },
        {
          name: "Choose marketing channels",
          description: "Select optimal channels",
        },
        {
          name: "Create campaign timeline",
          description: "Build project schedule",
        },
        {
          name: "Analyze competitors",
          description: "Research competitor strategies",
        },
      ],
      Content: [
        {
          name: "Write landing page copy",
          description: "Create compelling copy",
        },
        {
          name: "Design ad creatives",
          description: "Produce image and video ads",
        },
        { name: "Create content calendar", description: "Schedule posts" },
        { name: "Write email sequence", description: "Draft nurturing emails" },
        {
          name: "Create lead magnet",
          description: "Develop downloadable content",
        },
      ],
      Setup: [
        {
          name: "Configure Facebook Ads",
          description: "Setup campaigns and ad sets",
        },
        { name: "Setup Google Ads", description: "Configure search campaigns" },
        {
          name: "Setup tracking pixels",
          description: "Install conversion tracking",
        },
        {
          name: "Connect CRM integration",
          description: "Link marketing to CRM",
        },
      ],
      Launch: [
        { name: "QA all landing pages", description: "Test forms and links" },
        { name: "Launch campaign", description: "Go-live across channels" },
        { name: "Monitor performance", description: "Track KPIs daily" },
        { name: "Optimize ads", description: "Pause underperforming ads" },
        { name: "Report results", description: "Compile performance report" },
      ],
    },
  },
  recruitment: {
    name: "Recruitment Process",
    description: "Full-cycle recruitment from job definition to onboarding",
    phases: {
      Definition: [
        {
          name: "Define job requirements",
          description: "List skills and qualifications",
        },
        { name: "Create job description", description: "Write compelling JD" },
        { name: "Set salary range", description: "Research market rates" },
        { name: "Approve job requisition", description: "Get budget approval" },
        { name: "Choose posting channels", description: "Select job boards" },
        { name: "Define evaluation criteria", description: "Create scorecard" },
      ],
      Sourcing: [
        {
          name: "Post on company website",
          description: "Publish to careers page",
        },
        { name: "Post on LinkedIn", description: "Create job posting" },
        { name: "Post on job boards", description: "List on major boards" },
        {
          name: "Request employee referrals",
          description: "Launch referral program",
        },
        { name: "Source from database", description: "Review past candidates" },
        { name: "Contact recruiters", description: "Engage external agencies" },
      ],
      Interview: [
        { name: "Review applications", description: "Screen resumes" },
        { name: "Conduct phone screens", description: "Initial screenings" },
        { name: "Schedule interviews", description: "Coordinate with team" },
        {
          name: "Conduct technical tests",
          description: "Send and review assessments",
        },
        {
          name: "Complete reference checks",
          description: "Contact previous employers",
        },
      ],
      Onboarding: [
        { name: "Select candidate", description: "Make hiring decision" },
        {
          name: "Prepare offer letter",
          description: "Draft compensation package",
        },
        { name: "Extend job offer", description: "Send and negotiate" },
        { name: "Conduct background check", description: "Verify employment" },
        { name: "Prepare onboarding plan", description: "Create 90-day plan" },
        { name: "Setup workspace", description: "Prepare equipment" },
      ],
    },
  },
  sales: {
    name: "Sales Pipeline",
    description: "Manage sales opportunities from prospecting to closing",
    phases: {
      Setup: [
        { name: "Define ICP", description: "Create ideal customer profile" },
        { name: "Build prospect list", description: "Compile targets" },
        { name: "Setup CRM pipeline", description: "Configure stages" },
        {
          name: "Create email templates",
          description: "Build outreach templates",
        },
        { name: "Set activity targets", description: "Define quotas" },
      ],
      Prospecting: [
        { name: "Research prospects", description: "Review backgrounds" },
        { name: "Find decision makers", description: "Identify contacts" },
        { name: "Send cold emails", description: "Execute outreach" },
        { name: "Make cold calls", description: "Phone outreach" },
        { name: "Connect on LinkedIn", description: "Build network" },
      ],
      Deals: [
        { name: "Schedule discovery calls", description: "Book meetings" },
        {
          name: "Conduct needs analysis",
          description: "Deep dive into pain points",
        },
        { name: "Prepare demos", description: "Tailor presentations" },
        { name: "Present proposals", description: "Submit pricing" },
        { name: "Handle objections", description: "Address concerns" },
      ],
      Closing: [
        { name: "Negotiate terms", description: "Finalize details" },
        { name: "Prepare contracts", description: "Draft agreements" },
        { name: "Collect signatures", description: "Execute contracts" },
        { name: "Setup billing", description: "Configure invoicing" },
        { name: "Handoff to CS", description: "Customer success transition" },
      ],
    },
  },
};

// Simple API call function
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

  if (!response.ok)
    throw new Error(`API Error (${response.status}): ${responseText}`);

  return JSON.parse(responseText);
}

// GET request helper
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
async function createTemplate(domain, roomId, apiKey) {
  if (!DOMAIN_TEMPLATES[domain])
    throw new Error(
      `Unknown domain: ${domain}. Available: ${Object.keys(DOMAIN_TEMPLATES).join(", ")}`,
    );
  if (!roomId) throw new Error("roomId is required");

  const template = DOMAIN_TEMPLATES[domain];
  const fields = DOMAIN_FIELDS[domain];

  console.log(`\n📋 Creating ${template.name} template...`);
  console.log(`   Domain: ${domain}`);
  console.log(`   Room: ${roomId}`);

  // Prepare stages for list creation
  const stageNames = Object.keys(template.phases);
  const stagesPayload = stageNames.map((name, order) => ({
    name,
    color: STAGE_COLORS[order % STAGE_COLORS.length],
    order: order + 1,
  }));

  // 1. Create List with stages included
  console.log("\n1️⃣  Creating list with stages...");
  const fieldDefinitions = fields.map((f, i) => ({
    name: f.name,
    type: f.type,
    options: formatOptions(f.options),
    order: i + 1,
  }));
  const listResult = await apiCall(
    "lists.create",
    {
      name: template.name,
      roomId,
      fieldDefinitions,
      stages: stagesPayload,
    },
    apiKey,
  );

  const listId = listResult.list?._id || listResult.list?.id;
  console.log(`   ✓ List ID: ${listId}`);
  console.log(`   ✓ Stages created: ${stageNames.join(", ")}`);

  // 2. Get stages to retrieve stage IDs
  console.log("\n2️⃣  Fetching stage IDs...");
  const stagesResult = await apiGet(`stages.byListId?listId=${listId}`, apiKey);
  const stagesMap = {};
  stagesResult.stages.forEach((stage) => {
    stagesMap[stage.name] = stage._id;
    console.log(`   ✓ ${stage.name}: ${stage._id}`);
  });

  // 3. Get the list with field definitions to retrieve field IDs
  console.log("\n3️⃣  Fetching field definition IDs...");
  const listDetail = await apiGet(`lists/${listId}`, apiKey);
  const fieldMap = {};
  const optionMap = {}; // Maps fieldName -> optionValue -> optionId
  listDetail.list.fieldDefinitions?.forEach((field) => {
    fieldMap[field.name] = field._id;
    console.log(`   ✓ ${field.name} (${field.type}): ${field._id}`);

    // Build option map for SELECT fields
    if (field.type === "SELECT" && field.options) {
      optionMap[field.name] = {};
      field.options.forEach((opt) => {
        optionMap[field.name][opt.value] = opt._id;
      });
    }
  });

  // 4. Batch create all items with customFields
  console.log("\n4️⃣  Batch creating items with custom fields...");
  const allItems = [];

  for (const [phaseName, tasks] of Object.entries(template.phases)) {
    const stageId = stagesMap[phaseName];

    for (const task of tasks) {
      const item = {
        name: task.name,
        description: task.description || "",
        stageId,
        parentId: null,
        customFields: [],
        // order:
      };

      // Add custom field values based on domain field definitions
      for (const fieldDef of fields) {
        const fieldId = fieldMap[fieldDef.name];
        if (!fieldId) continue;

        let value = null;
        // For SELECT fields, we need to use the option _id, not the string value
        const isSelectField = fieldDef.type === "SELECT";

        switch (fieldDef.name) {
          case "Task Name":
            value = task.name;
            break;
          case "Description":
            value = task.description || "";
            break;
          case "Deadline":
            // Set deadline to 7 days from now
            const deadline = new Date();
            deadline.setDate(deadline.getDate() + 7);
            value = deadline.toISOString().split("T")[0];
            break;
          case "Priority":
            value = isSelectField
              ? optionMap["Priority"]?.["Medium"] || "Medium"
              : "Medium";
            break;
          case "Status":
            value = isSelectField
              ? optionMap["Status"]?.["Pending"] || "Pending"
              : "Pending";
            break;
          case "Channel":
            value = isSelectField
              ? optionMap["Channel"]?.["Google"] || "Google"
              : "Google";
            break;
          case "Budget":
            value = 1000;
            break;
          case "Candidate":
            value = "TBD";
            break;
          case "Position":
            value = "TBD";
            break;
          case "Salary Range":
            value = "Competitive";
            break;
          case "Company":
            value = "TBD";
            break;
          case "Deal Value":
            value = 5000;
            break;
        }

        if (value !== null && value !== undefined) {
          item.customFields.push({
            fieldId,
            value,
          });
        }
      }

      allItems.push(item);
    }
  }

  const batchResult = await apiCall(
    "items.batch-create",
    {
      listId,
      items: allItems,
    },
    apiKey,
  );

  console.log(
    `   ✓ Created ${batchResult.totalCreated || allItems.length} items`,
  );
  if (batchResult.totalFailed > 0) {
    console.log(`   ⚠ Failed: ${batchResult.totalFailed}`);
    batchResult.errors?.forEach((err) => console.log(`      - ${err.error}`));
  }

  console.log("\n✅ Template created successfully!");
  console.log(`   List: ${template.name}`);
  console.log(`   Stages: ${stageNames.length}`);
  console.log(`   Items: ${batchResult.totalCreated || allItems.length}`);

  return {
    listId,
    stageCount: stageNames.length,
    itemCount: batchResult.totalCreated || allItems.length,
  };
}

// Parse args
function parseArgs() {
  const args = process.argv.slice(2);
  const result = { domain: null, roomId: null };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--domain":
      case "-d":
        result.domain = args[++i];
        break;
      case "--roomId":
      case "-r":
        result.roomId = args[++i];
        break;
      case "--help":
      case "-h":
        console.log(`
Usage: node privos_template.js --domain <domain> --roomId <room-id>

Options:
  -d, --domain <domain>     Domain: marketing, recruitment, sales
  -r, --roomId <id>         Room ID (required)

Environment:
  PRIVOS_API_KEY            API authentication key (required)

Example:
  node privos_template.js --domain recruitment --roomId abc123
        `);
        process.exit(0);
    }
  }

  return result;
}

// Main
async function main() {
  try {
    const { domain, roomId } = parseArgs();

    if (!domain || !roomId) {
      console.error("Error: --domain and --roomId are required");
      process.exit(1);
    }

    const apiKey = process.env.PRIVOS_API_KEY;
    if (!apiKey) {
      console.error("Error: PRIVOS_API_KEY environment variable is required");
      process.exit(1);
    }

    await createTemplate(domain, roomId, apiKey);
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    process.exit(1);
  }
}

main();
