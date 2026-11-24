// GitHub Copilot CLI: instrucciones en ~/.copilot/copilot-instructions.md y agentes en
// ~/.copilot/agents/*.agent.md. Lee las skills de forma nativa desde ~/.agents/skills.
import path from 'node:path';
import { GENERATED_NOTE, buildGlobalInstructions, yamlString } from '../scripts/lib.mjs';

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
    const base = path.join(ctx.root, '.copilot');
    const models = ctx.models.copilot ?? {};
    const actions = [
      { type: 'block', path: path.join(base, 'copilot-instructions.md'), content: buildGlobalInstructions(ctx) },
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
