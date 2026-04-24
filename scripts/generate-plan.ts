import fs from "fs";
import path from "path";

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
}

function generatePlan(taskText: string) {
  const taskname = slugify(taskText);
  const planPath = path.join("plan", `${taskname}.plan.md`);

  const template = fs.readFileSync(
    "plan/taskplan_TEMPLATE.md",
    "utf-8"
  );

  const filled = template.replace("<taskname>", taskname);

  fs.writeFileSync(planPath, filled);

  console.log(`Plan created: ${planPath}`);
}

// Example usage:
// generatePlan(process.argv[2]);