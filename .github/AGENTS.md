# Agent System Entry Point

This repository is controlled by an autonomous agent execution system.

# 🚨 MANDATORY AGENT EXECUTION PROTOCOL

You MUST follow this sequence on EVERY task:

1. Load all required instruction files from `.github/instructions/`
2. Determine if a valid plan exists in `.github/plan/`
3. If NO plan exists:
   - You MUST generate a plan using `agent-plan-generation.md`
   - You MUST select playbooks using `agent-playbook-selection.md`
   - You MUST NOT write code
4. If a plan EXISTS:
   - You MUST follow `agent-execution-protocol.md`
   - You MUST execute ONE milestone at a time
   - You MUST NOT skip steps

🚫 HARD RULES:
- Writing code without a plan is FORBIDDEN
- Skipping the planning phase is FORBIDDEN
- Ignoring playbooks is FORBIDDEN

If a user asks for code without a plan:
→ You MUST refuse and trigger planning instead

---

## 🧠 What this repo contains

This project uses a structured agent workflow:

- Planning system (task definitions)
- Execution system (milestone-based runtime)
- Code practices system (implementation standards)
- Plan files (live task state)

---

## 🚀 How the system works

All work follows this loop:

Plan → Execute → Verify → Log → Repeat

No code is written without a valid plan.

---

## 📁 Key directories

### `/.github/instructions/`
System behavior definitions:

- agent-planning-framework.md
- agent-execution-protocol.md
- agent-code-practices-framework.md
- agent-playbook-selection.md
- agent-plan-generation.md
- agent-safety.instructions.md
- agent-skills.instructions.md
- ai-prompt-engineering-safety-best-practices.instructions.md
- context-engineering.instructions.md
- go.instructions.md
- python.instructions.md
- typescript.instructions.md
- csharp.instructions.md
- cpp.instructions.md
- swift.instructions.md
- kotlin.instructions.md

### `/.github/playbooks/`
How-to patterns applied during milestone execution:

- api-development.playbook.md
- accessibility-compliance.playbook.md
- debugging.playbook.md
- refactoring.playbook.md
- testing.playbook.md
- performance.playbook.md
- game-development.playbook.md
- game-testing.playbook.md
- mobile-development.playbook.md
- monorepo-workflow.playbook.md

### `/.github/skills/`
On-demand specialist capabilities (loaded per task):

**Agent & AI safety:** agent-governance, agent-owasp-compliance, agent-supply-chain, agentic-eval, ai-prompt-engineering-safety-review  
**Azure:** az-cost-optimize, azure-architecture-autopilot, azure-deployment-preflight, azure-devops-cli  
**Codebase knowledge:** acquire-codebase-knowledge  
**Documentation & specs:** create-llms, create-readme, create-specification, documentation-writer  
**GDPR & compliance:** gdpr-compliant, secret-scanning, security-review  
**Go & MCP:** go-mcp-server-generator, mcp-cli, mcp-copilot-studio-server-generator, mcp-create-adaptive-cards, mcp-create-declarative-agent, mcp-deploy-manage-agents, mcp-security-audit  
**GTM:** gtm-0-to-1-launch, gtm-ai-gtm, gtm-board-and-investor-communication, gtm-developer-ecosystem, gtm-enterprise-account-planning, gtm-enterprise-onboarding, gtm-operating-cadence, gtm-partnership-architecture, gtm-positioning-strategy, gtm-product-led-growth, gtm-technical-product-pricing  
**React:** react-audit-grep-patterns, react18-batching-patterns, react18-dep-compatibility, react18-enzyme-to-rtl, react18-legacy-context, react18-lifecycle-patterns, react18-string-refs, react19-concurrent-patterns, react19-source-patterns, react19-test-patterns  
**Game development:** game-architecture, unity-game-builder, unreal-game-builder, game-design-patterns  
**Mobile:** ios-app-builder, android-app-builder, mobile-app-architecture  
**Web & Full-stack:** web-app-builder, fullstack-cross-platform

Each skill has a `SKILL.md` with a `description` field that defines when it should be invoked. Load a skill when the task matches its description.

### `/.github/scripts/`
Utility scripts for plan management:

- `generate-plan.ts` — Scaffolds a new plan file from `taskplan_TEMPLATE.md`. Run: `npx ts-node scripts/generate-plan.ts "<task name>"`
- `plan-validate.ts` — Validates a plan file has all required sections and no unfilled placeholders. Run: `npx ts-node scripts/plan-validate.ts plan/<task>.plan.md`. Must pass before execution starts.
- `plan-checksum.ts` — Computes a SHA-256 hash of all milestone statuses and deployment target. Run: `npx ts-node scripts/plan-checksum.ts plan/<task>.plan.md`. Use to detect plan drift.
- `plan-sync.ts` — Verifies every skill, playbook, and instruction is referenced in AGENTS.md and copilot-instructions.md. Run: `npx ts-node scripts/plan-sync.ts`. Fails with a gap list if anything is unwired.

### `/.github/plan/`
Active task state:

- taskplan_TEMPLATE.md
- *.plan.md (live plans)

### `.github/`
Copilot + GitHub integration layer:

- copilot-instructions.md

---

## ⚙️ Boot sequence (for AI agents)

1. Read `/.github/instructions/agent-planning-framework.md`
2. Read `/.github/instructions/agent-execution-protocol.md`
3. Read `/.github/instructions/agent-code-practices-framework.md`
4. Read `/.github/instructions/agent-safety.instructions.md`
5. Read `/.github/instructions/agent-playbook-selection.md`
6. Read `/.github/instructions/agent-plan-generation.md`
7. Load active plan from `/.github/plan/*.plan.md`

8. If no plan exists:
  → Run Agent Plan Generation Framework
  → Detect playbooks
  → Select applicable skills from `/.github/skills/`
  → Generate plan using playbooks
  → Run `npx ts-node scripts/plan-validate.ts` to verify plan before execution
  → Save to `/.github/plan/<task>.plan.md`
  → Do not write code before plan completion

---

## 📌 Core rules

- No plan → no code
- Plan is the source of truth
- Work is executed in milestones only
- All changes must be verified before completion
- All code must comply with the code practices framework

---

## 🧭 Human entry points

If you are a developer or reviewer:

1. Check `/.github/plan/` for active tasks
2. Read the relevant `*.plan.md`
3. Review milestone progress
4. Validate code against `agent-code-practices-framework.md`

---

## 🧠 System principle

This repository is designed for deterministic, step-based execution of software tasks by an AI agent.

---

## System Integrity Rule

This repository operates under a NO-DRIFT design:

- All execution is plan-driven
- No implementation may diverge from approved milestones
- The plan file is the authoritative state machine

---

## Code Integrity Rule

All implementation must comply with `/.github/instructions/agent-code-practices-framework.md`:

- Code quality is enforced, not suggested
- Violations must be corrected before milestone completion
- If a plan conflicts with code practices:
  → STOP  
  → Raise the conflict  
  → Request clarification  

No exceptions.