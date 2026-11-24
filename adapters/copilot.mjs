// GitHub Copilot CLI: instrucciones en ~/.copilot/copilot-instructions.md y agentes en
// ~/.copilot/agents/*.agent.md. Lee las skills de forma nativa desde ~/.agents/skills.
// En modo proyecto: .github/copilot-instructions.md (solo si no existe) y .github/agents.
import path from 'node:path';
import { GENERATED_NOTE, buildGeneratedRules, buildGlobalInstructions, yamlString } from '../scripts/lib.mjs';

const TOOLS = {
  coordinator: ['read', 'search', 'edit', 'execute', 'agent'],
  planner: ['read', 'search', 'edit'],
  implementer: ['read', 'search', 'edit', 'execute'],
  reviewer: ['read', 'search', 'execute'],
};

export default {
  id: 'copilot',
  label: 'GitHub Copilot',
  plan(ctx) {
    const isProject = ctx.scope === 'project';
    const base = path.join(ctx.root, isProject ? '.github' : '.copilot');
    const models = ctx.models.copilot ?? {};
    const rulesPath = path.join(base, 'copilot-instructions.md');
    const actions = [
      isProject
        ? { type: 'file', path: rulesPath, content: buildGeneratedRules(ctx) }
        : { type: 'block', path: rulesPath, content: buildGlobalInstructions(ctx) },
    ];
    for (const role of ctx.roles) {
      const model = models[role.tier];
      const frontmatter = [
        '---',
        `name: ${role.name}`,
        `description: ${yamlString(role.description)}`,
        `tools: [${(TOOLS[role.name] ?? ['read', 'search']).map((t) => `'${t}'`).join(', ')}]`,
        model ? `model: ${model}` : null,
        '---',
      ].filter(Boolean).join('\n');
      actions.push({
        type: 'file',
        path: path.join(base, 'agents', `${role.name}.agent.md`),
        content: `${frontmatter}\n${GENERATED_NOTE}\n\n${role.body}`,
      });
    }
    return actions;
  },
};
