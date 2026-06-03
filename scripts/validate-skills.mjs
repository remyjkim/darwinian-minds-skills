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

function main() {
  const skillsDir = "skills";
  let errors = [];
  let count = 0;
  try {
    const entries = readdirSync(skillsDir);
    for (const entry of entries) {
      const full = join(skillsDir, entry);
      if (!statSync(full).isDirectory()) {
        continue;
      }
      count += 1;
      errors = errors.concat(validateSkill(full, entry));
    }
  } catch (error) {
    console.error(`Error reading skills/: ${error.message}`);
    process.exit(1);
  }

  if (errors.length > 0) {
    for (const error of errors) {
      console.error(`✘ ${error}`);
    }
    process.exit(1);
  }

  console.log(`✓ All skills valid (${count} found)`);
}

main();
