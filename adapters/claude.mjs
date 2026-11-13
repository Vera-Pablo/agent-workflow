// Claude Code: instrucciones en ~/.claude/CLAUDE.md, skills en ~/.claude/skills,
// subagentes en ~/.claude/agents y confirmación obligatoria para git commit/push.
import path from 'node:path';
import { GENERATED_NOTE, buildGlobalInstructions, yamlString } from '../scripts/lib.mjs';

const TOOLS = {
  planner: 'Read, Grep, Glob, Write, Edit, Skill',
  implementer: 'Read, Grep, Glob, Write, Edit, Bash, Skill',
  reviewer: 'Read, Grep, Glob, Bash, Skill',
};

export default {
  id: 'claude',
  label: 'Claude Code',
  plan(ctx) {
    const base = path.join(ctx.home, '.claude');
    const models = ctx.models.claude ?? {};
    const actions = [
      { type: 'block', path: path.join(base, 'CLAUDE.md'), content: buildGlobalInstructions(ctx) },
      {
        type: 'json-ensure',
        path: path.join(base, 'settings.json'),
        ensure: { 'permissions.ask': ['Bash(git commit:*)', 'Bash(git push:*)'] },
        summary: 'pedir confirmación antes de git commit / git push',
      },
    ];
    for (const skill of ctx.skills) {
      actions.push({ type: 'link', path: path.join(base, 'skills', skill), target: path.join(ctx.repoDir, 'skills', skill) });
    }
    for (const role of ctx.roles.filter((r) => r.mode === 'subagent')) {
      const model = models[role.tier];
      const frontmatter = [
        '---',
        `name: ${role.name}`,
        `description: ${yamlString(role.description)}`,
        `tools: ${TOOLS[role.name.replace('-complex', '')] ?? 'Read, Grep, Glob, Skill'}`,
        model ? `model: ${model}` : null,
        // Sin `skills:` — en Claude Code precarga el texto COMPLETO de cada skill en cada
        // invocación. Con la herramienta Skill el subagente carga solo la que necesita.
        '---',
      ].filter(Boolean).join('\n');
      actions.push({
        type: 'file',
        path: path.join(base, 'agents', `${role.name}.md`),
        content: `${frontmatter}\n${GENERATED_NOTE}\n\n${role.body}`,
      });
    }
    return actions;
  },
};
