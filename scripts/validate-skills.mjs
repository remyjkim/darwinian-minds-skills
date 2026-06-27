#!/usr/bin/env node
// ABOUTME: Validates SKILL.md frontmatter against the portable agentskills.io minimum contract.
// ABOUTME: Runs locally via `npm run validate:skills` and in CI.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { cardMaps } from "./card-map.mjs";

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

  for (const card of cardMaps) {
    const cardJson = readJson(join("cards", card.slug, "card.json"));
    if (cardJson.name !== card.name) {
      errors.push(`cards/${card.slug}/card.json: name is "${cardJson.name}", expected "${card.name}"`);
    }
    const cardSkillNames = cardJson.skills?.include ?? [];
    const cardDiff = diffSets(card.skills, cardSkillNames);
    for (const name of cardDiff.missing) {
      errors.push(`cards/${card.slug}/card.json: missing skill "${name}"`);
    }
    for (const name of cardDiff.extra) {
      errors.push(`cards/${card.slug}/card.json: references unexpected skill "${name}"`);
    }
    const cardDirs = listSkillDirs(join("cards", card.slug, "skills"));
    const dirDiff = diffSets(card.skills, cardDirs);
    for (const name of dirDiff.missing) {
      errors.push(`cards/${card.slug}/skills: missing bundled skill "${name}"`);
    }
    for (const name of dirDiff.extra) {
      errors.push(`cards/${card.slug}/skills: unexpected bundled skill "${name}"`);
    }
    for (const name of card.skills) {
      if (!skillNames.includes(name)) {
        errors.push(`cards/${card.slug}/card.json: references unknown skill "${name}"`);
      }
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
