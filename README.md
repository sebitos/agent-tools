# agent-tools

> A structured, plan-first agent execution system for GitHub Copilot and autonomous AI agents.

Drop this `.github/` folder into any project to give Copilot a deterministic, milestone-based workflow with auto-loaded skills, context-aware playbooks, and built-in safety constraints.

---

## How it works

Every task follows a single loop:

```
Plan → Execute → Verify → Log → Repeat
```

No code is written without a valid plan. No milestone is closed without verification. The plan file is the single source of truth — implementation never drifts from it.

```
User request
    │
    ▼
Agent reads instructions & detects playbooks
    │
    ▼
Agent generates plan → .github/plan/<task>.plan.md
    │
    ▼
Plan validated (npx ts-node scripts/plan-validate.ts)
    │
    ▼
Milestone execution (skills loaded on demand)
    │
    ▼
Verify → mark complete → next milestone
```

---

## Getting started

1. **Copy** the `.github/` folder into your project (or use this repo as a template).
2. **Commit** it — Copilot picks it up automatically via `copilot-instructions.md`.
3. Start a task: Copilot will boot, detect context, and generate a plan before writing any code.

> [!NOTE]
> When using GitHub Copilot agent mode, the boot sequence is triggered automatically on every new task.

---

## Structure

```
.github/
├── AGENTS.md                        # Agent system entry point & directory
├── copilot-instructions.md          # Copilot bootstrap (auto-loaded)
├── instructions/                    # System behavior definitions
│   ├── agent-planning-framework.md
│   ├── agent-execution-protocol.md
│   ├── agent-code-practices-framework.md
│   ├── agent-playbook-selection.md
│   ├── agent-plan-generation.md
│   ├── agent-safety.instructions.md
│   └── ...language-specific instructions (go, python, typescript, etc.)
├── playbooks/                       # HOW to implement specific task types
│   ├── api-development.playbook.md
│   ├── testing.playbook.md
│   ├── mobile-development.playbook.md
│   ├── monorepo-workflow.playbook.md
│   └── ...
├── skills/                          # On-demand specialist capabilities
│   ├── create-readme/
│   ├── create-llms/
│   ├── security-review/
│   ├── web-app-builder/
│   └── ...
├── plan/
│   ├── taskplan_TEMPLATE.md         # Plan scaffold template
│   └── *.plan.md                    # Live task plans (created per task)
└── scripts/
    ├── generate-plan.ts             # Scaffold a new plan file
    ├── plan-validate.ts             # Validate plan before execution
    ├── plan-checksum.ts             # Detect plan drift via SHA-256 hash
    └── plan-sync.ts                 # Verify all skills/playbooks are wired
```

---

## Plans

Plans live in `.github/plan/` and are the source of truth for every task. Generate one with:

```bash
npx ts-node .github/scripts/generate-plan.ts "my task name"
```

Validate before execution:

```bash
npx ts-node .github/scripts/plan-validate.ts .github/plan/my-task-name.plan.md
```

Each plan contains: task description, deployment target, playbooks applied, architecture overview, and numbered milestones with scope, files, and completion criteria.

---

## Playbooks

Playbooks define how to implement a particular type of work. They are auto-selected by `agent-playbook-selection.md` based on task keywords and codebase content. Multiple playbooks can be active simultaneously.

| Playbook | When it applies |
|---|---|
| `api-development` | REST APIs, OpenAPI, endpoints, request validation |
| `testing` | Unit, integration, e2e test authoring |
| `debugging` | Error tracing, root cause analysis |
| `refactoring` | Code restructuring without behavior change |
| `performance` | Profiling, bottlenecks, optimization |
| `accessibility-compliance` | WCAG, ARIA, screen reader support |
| `game-development` | Game loops, ECS, Unity, Unreal |
| `game-testing` | Playtesting, simulation, game-specific QA |
| `mobile-development` | iOS, Android, adaptive layouts, app submission |
| `monorepo-workflow` | Web + mobile + backend in a single repo, Turborepo |

---

## Skills

Skills are on-demand specialist modules loaded when a task matches their domain. Each `SKILL.md` defines exactly when it should be invoked.

**Categories:**

| Category | Skills |
|---|---|
| Agent & AI safety | `agent-governance`, `agent-owasp-compliance`, `agent-supply-chain`, `agentic-eval`, `ai-prompt-engineering-safety-review` |
| Azure | `az-cost-optimize`, `azure-architecture-autopilot`, `azure-deployment-preflight`, `azure-devops-cli` |
| Documentation & specs | `create-readme`, `create-llms`, `create-specification`, `documentation-writer` |
| GDPR & compliance | `gdpr-compliant`, `secret-scanning`, `security-review` |
| Go & MCP | `go-mcp-server-generator`, `mcp-cli`, `mcp-copilot-studio-server-generator`, `mcp-create-adaptive-cards`, `mcp-create-declarative-agent`, `mcp-deploy-manage-agents`, `mcp-security-audit` |
| GTM | `gtm-0-to-1-launch`, `gtm-positioning-strategy`, `gtm-product-led-growth`, and more |
| React | React 18/19 upgrade, migration, and pattern skills |
| Game development | `game-architecture`, `unity-game-builder`, `unreal-game-builder`, `game-design-patterns` |
| Mobile | `ios-app-builder`, `android-app-builder`, `mobile-app-architecture` |
| Web & Full-stack | `web-app-builder`, `fullstack-cross-platform` |
| Codebase knowledge | `acquire-codebase-knowledge` |

---

## Scripts

| Script | Purpose |
|---|---|
| `generate-plan.ts` | Scaffold a new plan from the template |
| `plan-validate.ts` | Validate that a plan is complete and ready to execute |
| `plan-checksum.ts` | Hash milestone statuses to detect plan drift |
| `plan-sync.ts` | Verify all skills, playbooks, and instructions are wired in `AGENTS.md` and `copilot-instructions.md` |

Run `plan-sync` after adding any new skill, playbook, or instruction file:

```bash
npx ts-node .github/scripts/plan-sync.ts
```

It exits `0` if everything is wired, or prints a gap list and exits `1`.

---

## Core rules

- **No plan → no code.** The agent must create and validate a plan before any implementation.
- **No milestone → no work.** Every change is scoped to an active milestone.
- **No verify → no completion.** Each milestone requires verification before it can be closed.
- **No drift.** Implementation must not diverge from the approved plan. If requirements change, update the plan first.

> [!WARNING]
> If a milestone requires code that conflicts with `agent-code-practices-framework.md`, the agent must stop, raise the conflict, and wait for clarification. No exceptions.

---

## Adding new skills or playbooks

1. Create the file: `skills/<name>/SKILL.md` or `playbooks/<name>.playbook.md`
2. Run `plan-sync.ts` — it will report what needs to be wired
3. Add the entry to `AGENTS.md`, `copilot-instructions.md`, and (for playbooks) `instructions/agent-playbook-selection.md`
4. Run `plan-sync.ts` again to confirm exit `0`
