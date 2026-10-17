import fs from "fs";
import crypto from "crypto";

function hash(content: string) {
  return crypto.createHash("sha256").update(content).digest("hex");
}

function extractState(plan: string) {
  const milestones = (plan.match(/Status:\s*(done|in-progress|not-started)/g) || []).join(",");
  const deployment = (plan.match(/Deployment Target[\s\S]*?(?=\n##|\n---|$)/)?.[0]) || "";

  return hash(milestones + deployment);
}

const file = process.argv[2];
const content = fs.readFileSync(file, "utf-8");

const stateHash = extractState(content);

console.log(`STATE_HASH=${stateHash}`);