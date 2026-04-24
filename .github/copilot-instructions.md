# Copilot Agent Bootstrap

This repository uses an autonomous agent system.

---

## BOOT SEQUENCE (MANDATORY)

Before doing any work:

1. Read `/.github/instructions/agent-planning-framework.md`
2. Read `/.github/instructions/agent-execution-protocol.md`
3. Read `/.github/instructions/agent-code-practices-framework.md`
4. Read `/.github/instructions/agent-safety.instructions.md`
5. Read `/.github/instructions/agent-playbook-selection.md`
6. Read `/.github/instructions/agent-plan-generation.md`
7. Locate active plan in `/.github/plan/*.plan.md`

If no plan exists:
→ STOP  
→ Select applicable skills from `/.github/skills/` before generating the plan  
→ Create `/plan/<task>.plan.md` using `/.github/plan/taskplan_TEMPLATE.md`  
→ Do not write code before plan completion  

---

## EXECUTION RULE

All work must follow the milestone execution system defined in `/.github/instructions/agent-execution-protocol.md`.

The plan file in `/.github/plan/` is the source of truth for all execution state.

---

## HARD CONSTRAINT

No plan → no code.  
No milestone → no work.  
No verify → no completion.  

---

## NO-DRIFT RULE

All work must strictly follow the plan file in `/.github/plan/`.

If something is not in the plan → do not implement it.

Plan is the source of truth. Code must never drift from it.

---

## CODE PRACTICES ENFORCEMENT

All code written MUST comply with `/.github/instructions/agent-code-practices-framework.md`.

This is not optional.

- Code that violates these practices must be refactored before completion.
- If a milestone requires code that conflicts with these practices:
  → STOP  
  → Raise the conflict  
  → Request clarification before proceeding  

---

## FAILURE CONDITIONS

The agent must STOP execution immediately if:

- Required instruction files are missing or unreadable
- The plan file is missing or invalid
- A milestone is unclear or incomplete
- Requirements conflict with code practices
- The agent is forced to assume missing critical information

In all cases:
→ Ask clarifying questions  
→ Do not proceed with assumptions  

---

## SKILLS

On-demand specialist capabilities live in `/.github/skills/`. Each skill has a `SKILL.md` with a `description` that defines when to load it. Read the `SKILL.md` before executing any task the skill covers.

Categories available:
- **Agent & AI safety**: agent-governance, agent-owasp-compliance, agent-supply-chain, agentic-eval, ai-prompt-engineering-safety-review
- **Azure**: az-cost-optimize, azure-architecture-autopilot, azure-deployment-preflight, azure-devops-cli
- **Codebase knowledge**: acquire-codebase-knowledge
- **Documentation & specs**: create-llms, create-readme, create-specification, documentation-writer
- **GDPR & compliance**: gdpr-compliant, secret-scanning, security-review
- **Go & MCP**: go-mcp-server-generator, mcp-cli, mcp-copilot-studio-server-generator, mcp-create-adaptive-cards, mcp-create-declarative-agent, mcp-deploy-manage-agents, mcp-security-audit
- **GTM**: gtm-0-to-1-launch, gtm-ai-gtm, gtm-board-and-investor-communication, gtm-developer-ecosystem, gtm-enterprise-account-planning, gtm-enterprise-onboarding, gtm-operating-cadence, gtm-partnership-architecture, gtm-positioning-strategy, gtm-product-led-growth, gtm-technical-product-pricing
- **React**: react-audit-grep-patterns, react18-batching-patterns, react18-dep-compatibility, react18-enzyme-to-rtl, react18-legacy-context, react18-lifecycle-patterns, react18-string-refs, react19-concurrent-patterns, react19-source-patterns, react19-test-patterns
- **Game development**: game-architecture, unity-game-builder, unreal-game-builder, godot-game-builder, gamemaker-game-builder, phaser-game-builder, love2d-game-builder, game-design-patterns, game-narrative, game-theory, game-level-design, game-audio, game-ui-ux
- **Mobile**: ios-app-builder, android-app-builder, mobile-app-architecture
- **Web & Full-stack**: web-app-builder, fullstack-cross-platform

## PLAYBOOKS

Playbooks live in `/.github/playbooks/` and define HOW to implement work for specific task types. `agent-playbook-selection.md` auto-detects which apply. Available playbooks:
- `api-development.playbook.md`
- `accessibility-compliance.playbook.md`
- `debugging.playbook.md`
- `refactoring.playbook.md`
- `testing.playbook.md`
- `performance.playbook.md`
- `game-development.playbook.md`
- `game-testing.playbook.md`
- `narrative-design.playbook.md`
- `game-level-design.playbook.md`
- `game-balancing.playbook.md`
- `mobile-development.playbook.md`
- `monorepo-workflow.playbook.md`

---

## EXECUTION MINDSET

- Plan first, then execute
- Validate at every milestone
- Prefer correctness over speed
- Never guess when uncertain
- Produce production-quality code only