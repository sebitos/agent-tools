/**
 * plan-sync.ts
 *
 * Verifies that every skill, playbook, and instruction file is correctly wired into:
 *   - .github/AGENTS.md
 *   - .github/copilot-instructions.md
 *   - .github/instructions/agent-playbook-selection.md  (playbooks only)
 *
 * Run: npx ts-node .github/scripts/plan-sync.ts
 * Exit 0 = all wired correctly
 * Exit 1 = one or more gaps found
 */

import fs from "fs";
import path from "path";

// When run as `ts-node scripts/plan-sync.ts` from the .github folder,
// cwd is .github. Support being run from the repo root too.
const cwd = process.cwd();
const ROOT = path.basename(cwd) === ".github" ? cwd : path.join(cwd, ".github");

// ─── Paths ────────────────────────────────────────────────────────────────────

const AGENTS_MD            = path.join(ROOT, "AGENTS.md");
const COPILOT_MD           = path.join(ROOT, "copilot-instructions.md");
const PLAYBOOK_SELECTION   = path.join(ROOT, "instructions", "agent-playbook-selection.md");
const SKILLS_DIR           = path.join(ROOT, "skills");
const PLAYBOOKS_DIR        = path.join(ROOT, "playbooks");
const INSTRUCTIONS_DIR     = path.join(ROOT, "instructions");

// ─── Types ────────────────────────────────────────────────────────────────────

interface SyncError {
  file: string;
  missing_in: string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function readFile(filePath: string): string {
  return fs.readFileSync(filePath, "utf-8");
}

function listSubdirs(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);
}

function listFiles(dir: string, ext: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith(ext));
}

// ─── Checks ───────────────────────────────────────────────────────────────────

function checkSkills(): SyncError[] {
  const errors: SyncError[] = [];
  const agents    = readFile(AGENTS_MD);
  const copilot   = readFile(COPILOT_MD);
  const skillDirs = listSubdirs(SKILLS_DIR);

  for (const skill of skillDirs) {
    const skillFile = path.join(SKILLS_DIR, skill, "SKILL.md");
    if (!fs.existsSync(skillFile)) {
      // Skip dirs without a SKILL.md — not wired by definition
      continue;
    }

    const missingIn: string[] = [];
    if (!agents.includes(skill))  missingIn.push("AGENTS.md");
    if (!copilot.includes(skill)) missingIn.push("copilot-instructions.md");

    if (missingIn.length > 0) {
      errors.push({ file: `skills/${skill}/SKILL.md`, missing_in: missingIn });
    }
  }

  return errors;
}

function checkPlaybooks(): SyncError[] {
  const errors: SyncError[] = [];
  const agents     = readFile(AGENTS_MD);
  const copilot    = readFile(COPILOT_MD);
  const selection  = readFile(PLAYBOOK_SELECTION);
  const playbooks  = listFiles(PLAYBOOKS_DIR, ".md");

  for (const pb of playbooks) {
    const missingIn: string[] = [];
    if (!agents.includes(pb))    missingIn.push("AGENTS.md");
    if (!copilot.includes(pb))   missingIn.push("copilot-instructions.md");
    if (!selection.includes(pb)) missingIn.push("agent-playbook-selection.md");

    if (missingIn.length > 0) {
      errors.push({ file: `playbooks/${pb}`, missing_in: missingIn });
    }
  }

  return errors;
}

function checkInstructions(): SyncError[] {
  const errors: SyncError[] = [];
  const agents = readFile(AGENTS_MD);

  // Instruction files are auto-loaded by VS Code Copilot via their `applyTo` frontmatter,
  // so they only need to be listed in AGENTS.md (for autonomous agents that don't auto-load).
  const instructionFiles = listFiles(INSTRUCTIONS_DIR, ".md");

  for (const file of instructionFiles) {
    if (!agents.includes(file)) {
      errors.push({ file: `instructions/${file}`, missing_in: ["AGENTS.md"] });
    }
  }

  return errors;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const skillErrors       = checkSkills();
const playbookErrors    = checkPlaybooks();
const instructionErrors = checkInstructions();

const allErrors = [...skillErrors, ...playbookErrors, ...instructionErrors];

if (allErrors.length === 0) {
  console.log("✓ All skills, playbooks, and instructions are correctly wired.");
  process.exit(0);
} else {
  console.error("✗ Wiring gaps found:\n");
  for (const err of allErrors) {
    console.error(`  ${err.file}`);
    for (const loc of err.missing_in) {
      console.error(`    ✗ not referenced in ${loc}`);
    }
  }
  console.error(`\n${allErrors.length} gap(s) detected. Update the missing references and re-run.`);
  process.exit(1);
}
