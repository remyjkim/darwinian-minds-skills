#!/usr/bin/env node
// ABOUTME: Validates SKILL.md frontmatter against the portable agentskills.io minimum contract.
// ABOUTME: Runs locally via `npm run validate:skills` and in CI.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const REQUIRED_FIELDS = ["name", "description"];
const ALLOWED_FIELDS = new Set(["name", "description"]);

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) {
    return null;
  }
  const result = {};
  for (const line of match[1].split("\n")) {
    if (!/^[a-zA-Z][\w-]*:/.test(line)) {
      continue;
    }
    const [key, ...rest] = line.split(":");
    result[key.trim()] = rest.join(":").trim();
  }
  return result;
}

function validateSkill(dir, skillName) {
  const path = join(dir, "SKILL.md");
  let content;
  try {
    content = readFileSync(path, "utf8");
  } catch (error) {
    return [`${skillName}: missing SKILL.md`];
  }

  const frontmatter = parseFrontmatter(content);
  if (!frontmatter) {
    return [`${skillName}: no frontmatter`];
  }

  const errors = [];
  for (const field of REQUIRED_FIELDS) {
    if (!frontmatter[field]) {
      errors.push(`${skillName}: missing required field "${field}"`);
    }
  }
  if (frontmatter.name && frontmatter.name !== skillName) {
    errors.push(`${skillName}: frontmatter name "${frontmatter.name}" does not match directory "${skillName}"`);
  }
  if (frontmatter.name && !/^[a-z][a-z0-9-]*$/.test(frontmatter.name)) {
    errors.push(`${skillName}: name "${frontmatter.name}" is not lowercase-kebab`);
  }
  for (const key of Object.keys(frontmatter)) {
    if (!ALLOWED_FIELDS.has(key)) {
      errors.push(`${skillName}: unknown frontmatter field "${key}"`);
    }
  }
  return errors;
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function listSkillDirs(dir) {
  return readdirSync(dir)
    .filter((entry) => statSync(join(dir, entry)).isDirectory())
    .sort();
}

function parseSyncScriptCardSkills(cardName) {
  const script = readFileSync(join("scripts", "sync-card-skills.mjs"), "utf8");
  const pattern = new RegExp(
    String.raw`targetDir:\s*join\(rootDir,\s*"cards",\s*"${cardName}",\s*"skills"\),\s*skills:\s*\[([\s\S]*?)\]`,
  );
  const match = script.match(pattern);
  if (!match) {
    return null;
  }
  return [...match[1].matchAll(/"([^"]+)"/g)].map((entry) => entry[1]);
}

const BASE_MIND_SKILLS = [
  "manage-active-mind-stack",
  "author-mind-content",
  "audit-mind-visibility",
];

function diffSets(expected, actual) {
  return {
    missing: expected.filter((value) => !actual.includes(value)),
    extra: actual.filter((value) => !expected.includes(value)),
  };
}

function validateSkillInventory(skillNames) {
  const errors = [];
  const bundle = readJson("bundle.json");
  const bundleSkills = bundle.skills ?? [];
  const bundleNames = bundleSkills.map((skill) => skill.name);
  const bundleByName = new Map();
  for (const skill of bundleSkills) {
    if (bundleByName.has(skill.name)) {
      errors.push(`bundle.json: duplicate skill "${skill.name}"`);
      continue;
    }
    bundleByName.set(skill.name, skill);
  }
  const bundleDiff = diffSets(skillNames, bundleNames);
  for (const name of bundleDiff.missing) {
    errors.push(`bundle.json: missing skill "${name}"`);
  }
  for (const name of bundleDiff.extra) {
    errors.push(`bundle.json: references unknown skill "${name}"`);
  }
  for (const name of skillNames) {
    const entry = bundleByName.get(name);
    if (!entry) {
      continue;
    }
    const expectedPath = `skills/${name}`;
    if (entry.path !== expectedPath) {
      errors.push(`bundle.json: skill "${name}" path is "${entry.path}", expected "${expectedPath}"`);
    }
  }

  const stableCard = readJson(join("cards", "harness-skills", "card.json"));
  const stableNames = stableCard.skills?.include ?? [];
  const expectedStableNames = skillNames.filter(
    (name) => name !== "organize-workspace" && !BASE_MIND_SKILLS.includes(name),
  );
  const stableDiff = diffSets(expectedStableNames, stableNames);
  for (const name of stableDiff.missing) {
    errors.push(`cards/harness-skills/card.json: missing skill "${name}"`);
  }
  for (const name of stableDiff.extra) {
    errors.push(`cards/harness-skills/card.json: references unexpected skill "${name}"`);
  }
  const stableCardDirs = listSkillDirs(join("cards", "harness-skills", "skills"));
  const stableCardDirDiff = diffSets(expectedStableNames, stableCardDirs);
  for (const name of stableCardDirDiff.missing) {
    errors.push(`cards/harness-skills/skills: missing bundled skill "${name}"`);
  }
  for (const name of stableCardDirDiff.extra) {
    errors.push(`cards/harness-skills/skills: unexpected bundled skill "${name}"`);
  }

  const scriptNames = parseSyncScriptCardSkills("harness-skills");
  if (!scriptNames) {
    errors.push("scripts/sync-card-skills.mjs: could not find harness-skills map");
  } else {
    const scriptDiff = diffSets(expectedStableNames, scriptNames);
    for (const name of scriptDiff.missing) {
      errors.push(`scripts/sync-card-skills.mjs: missing stable skill "${name}"`);
    }
    for (const name of scriptDiff.extra) {
      errors.push(`scripts/sync-card-skills.mjs: references unexpected stable skill "${name}"`);
    }
  }

  const experimentalCard = readJson(join("cards", "workspace-experimental", "card.json"));
  const experimentalNames = experimentalCard.skills?.include ?? [];
  if (experimentalNames.length !== 1 || experimentalNames[0] !== "organize-workspace") {
    errors.push("cards/workspace-experimental/card.json: expected only organize-workspace");
  }
  const experimentalCardDirs = listSkillDirs(join("cards", "workspace-experimental", "skills"));
  if (experimentalCardDirs.length !== 1 || experimentalCardDirs[0] !== "organize-workspace") {
    errors.push("cards/workspace-experimental/skills: expected only organize-workspace");
  }

  const expectedBaseMindNames = BASE_MIND_SKILLS.filter((name) => skillNames.includes(name));
  const baseMindCard = readJson(join("cards", "base-mind", "card.json"));
  const baseMindNames = baseMindCard.skills?.include ?? [];
  const baseMindDiff = diffSets(expectedBaseMindNames, baseMindNames);
  for (const name of baseMindDiff.missing) {
    errors.push(`cards/base-mind/card.json: missing skill "${name}"`);
  }
  for (const name of baseMindDiff.extra) {
    errors.push(`cards/base-mind/card.json: references unexpected skill "${name}"`);
  }
  const baseMindCardDirs = listSkillDirs(join("cards", "base-mind", "skills"));
  const baseMindCardDirDiff = diffSets(expectedBaseMindNames, baseMindCardDirs);
  for (const name of baseMindCardDirDiff.missing) {
    errors.push(`cards/base-mind/skills: missing bundled skill "${name}"`);
  }
  for (const name of baseMindCardDirDiff.extra) {
    errors.push(`cards/base-mind/skills: unexpected bundled skill "${name}"`);
  }
  const baseMindScriptNames = parseSyncScriptCardSkills("base-mind");
  if (!baseMindScriptNames) {
    errors.push("scripts/sync-card-skills.mjs: could not find base-mind map");
  } else {
    const baseMindScriptDiff = diffSets(expectedBaseMindNames, baseMindScriptNames);
    for (const name of baseMindScriptDiff.missing) {
      errors.push(`scripts/sync-card-skills.mjs: missing base-mind skill "${name}"`);
    }
    for (const name of baseMindScriptDiff.extra) {
      errors.push(`scripts/sync-card-skills.mjs: references unexpected base-mind skill "${name}"`);
    }
  }

  return errors;
}

function main() {
  const skillsDir = "skills";
  let errors = [];
  const skillNames = [];
  try {
    const entries = readdirSync(skillsDir);
    for (const entry of entries) {
      const full = join(skillsDir, entry);
      if (!statSync(full).isDirectory()) {
        continue;
      }
      skillNames.push(entry);
      errors = errors.concat(validateSkill(full, entry));
    }
  } catch (error) {
    console.error(`Error reading skills/: ${error.message}`);
    process.exit(1);
  }
  skillNames.sort();
  errors = errors.concat(validateSkillInventory(skillNames));

  if (errors.length > 0) {
    for (const error of errors) {
      console.error(`✘ ${error}`);
    }
    process.exit(1);
  }

  console.log(`✓ All skills valid (${skillNames.length} found)`);
}

main();
