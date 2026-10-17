/**
 * Installer for Antigravity Skills
 * Installs, uninstalls, and inspects skills across Global and Workspace scopes.
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

export function getGlobalSkillsDir() {
  const home = os.homedir();
  return path.join(home, '.gemini', 'config', 'skills');
}

export function getWorkspaceSkillsDir(cwd = process.cwd()) {
  return path.join(cwd, '.agents', 'skills');
}

/**
 * List all skills installed in a specific directory
 */
export function listInstalledSkills(targetDir) {
  if (!fs.existsSync(targetDir)) return [];

  const entries = fs.readdirSync(targetDir, { withFileTypes: true });
  const skills = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const skillFile = path.join(targetDir, entry.name, 'SKILL.md');
      if (fs.existsSync(skillFile)) {
        try {
          const content = fs.readFileSync(skillFile, 'utf8');
          const descMatch = content.match(/description:\s*>-?\s*\n?([\s\S]*?)(\n---|\n[a-z]+:)/);
          const desc = descMatch ? descMatch[1].trim() : 'No description provided';
          skills.push({
            name: entry.name,
            path: skillFile,
            description: desc,
            size: fs.statSync(skillFile).size
          });
        } catch {
          // Ignore read errors
        }
      }
    }
  }

  return skills;
}

/**
 * Install a skill into target directory
 */
export function installSkill(adaptedSkill, options = {}) {
  const scope = options.scope || 'global'; // 'global' | 'workspace'
  const baseDir = scope === 'workspace' ? getWorkspaceSkillsDir(options.cwd) : getGlobalSkillsDir();
  const skillDir = path.join(baseDir, adaptedSkill.name);

  if (!fs.existsSync(skillDir)) {
    fs.mkdirSync(skillDir, { recursive: true });
  }

  const skillFile = path.join(skillDir, 'SKILL.md');
  fs.writeFileSync(skillFile, adaptedSkill.content, 'utf8');

  return {
    success: true,
    name: adaptedSkill.name,
    installedPath: skillFile,
    scope
  };
}

/**
 * Remove/Uninstall a skill
 */
export function uninstallSkill(skillName, scope = 'global', cwd = process.cwd()) {
  const baseDir = scope === 'workspace' ? getWorkspaceSkillsDir(cwd) : getGlobalSkillsDir();
  const skillDir = path.join(baseDir, skillName);

  if (!fs.existsSync(skillDir)) {
    return { success: false, error: `Skill "${skillName}" not found in ${scope} scope.` };
  }

  fs.rmSync(skillDir, { recursive: true, force: true });
  return { success: true, name: skillName, scope };
}
