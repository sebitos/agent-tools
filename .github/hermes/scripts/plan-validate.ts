import fs from "fs";
import path from "path";

const REQUIRED_SECTIONS = [
  "## Status",
  "## Task Description",
  "## Deployment Target",
  "## Milestones",
  "## Risk Register",
];

const MILESTONE_REQUIRED = [
  "Status:",
  "Acceptance Criteria:",
  "Verify Commands:",
  "Commit Message:",
];

interface ValidationError {
  type: "missing-section" | "incomplete-milestone" | "unfilled-placeholder" | "no-milestones";
  message: string;
}

function validatePlan(filePath: string): ValidationError[] {
  const errors: ValidationError[] = [];
  const content = fs.readFileSync(filePath, "utf-8");

  // Check required top-level sections
  for (const section of REQUIRED_SECTIONS) {
    if (!content.includes(section)) {
      errors.push({
        type: "missing-section",
        message: `Missing required section: "${section}"`,
      });
    }
  }

  // Check Deployment Target is not the template placeholder
  if (content.includes("Define exactly what") || content.includes("<taskname>")) {
    errors.push({
      type: "unfilled-placeholder",
      message: "Plan contains unfilled template placeholders",
    });
  }

  // Extract milestone blocks
  const milestoneBlocks = content.split(/### M\d+/).slice(1);

  if (milestoneBlocks.length === 0) {
    errors.push({
      type: "no-milestones",
      message: "Plan has no milestones defined",
    });
  }

  for (let i = 0; i < milestoneBlocks.length; i++) {
    const block = milestoneBlocks[i];
    for (const field of MILESTONE_REQUIRED) {
      if (!block.includes(field)) {
        errors.push({
          type: "incomplete-milestone",
          message: `Milestone M${i + 1} is missing required field: "${field}"`,
        });
      }
    }

    // Verify Commands must not be empty placeholder
    if (block.includes("Verify Commands:") && block.includes("- command here")) {
      errors.push({
        type: "incomplete-milestone",
        message: `Milestone M${i + 1} has unfilled Verify Commands`,
      });
    }

    // Acceptance Criteria must have at least one checked or unchecked item
    if (block.includes("Acceptance Criteria:") && !block.includes("- [ ]") && !block.includes("- [x]")) {
      errors.push({
        type: "incomplete-milestone",
        message: `Milestone M${i + 1} has no Acceptance Criteria items`,
      });
    }
  }

  return errors;
}

const filePath = process.argv[2];

if (!filePath) {
  console.error("Usage: npx ts-node scripts/plan-validate.ts plan/<task>.plan.md");
  process.exit(1);
}

if (!fs.existsSync(filePath)) {
  console.error(`File not found: ${filePath}`);
  process.exit(1);
}

const errors = validatePlan(filePath);

if (errors.length === 0) {
  console.log(`✓ Plan valid: ${path.basename(filePath)}`);
  process.exit(0);
} else {
  console.error(`✗ Plan validation failed: ${path.basename(filePath)}\n`);
  for (const err of errors) {
    console.error(`  [${err.type}] ${err.message}`);
  }
  process.exit(1);
}
