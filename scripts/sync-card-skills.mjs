#!/usr/bin/env node
// ABOUTME: Copies canonical skill directories into the stable and experimental card sources.
// ABOUTME: Keeps card-bundled skill content aligned with the repo's main skills/ tree.

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { cardMaps, rootDir } from "./card-map.mjs";

const checkMode = process.argv.includes("--check");

function listFiles(dir, prefix = "") {
  if (!existsSync(dir)) {
    return [];
  }
  const files = [];
  for (const entry of readdirSync(dir).sort()) {
    const fullPath = join(dir, entry);
    const relPath = prefix ? join(prefix, entry) : entry;
    if (statSync(fullPath).isDirectory()) {
      files.push(...listFiles(fullPath, relPath));
    } else {
      files.push(relPath);
    }
  }
  return files;
}

function compareDirectories(sourceDir, destinationDir) {
  const sourceFiles = listFiles(sourceDir);
  const destinationFiles = listFiles(destinationDir);
  const allFiles = [...new Set([...sourceFiles, ...destinationFiles])].sort();
  const diffs = [];

  for (const file of allFiles) {
    const sourcePath = join(sourceDir, file);
    const destinationPath = join(destinationDir, file);
    if (!existsSync(sourcePath)) {
      diffs.push(`extra ${relative(rootDir, destinationPath)}`);
      continue;
    }
    if (!existsSync(destinationPath)) {
      diffs.push(`missing ${relative(rootDir, destinationPath)}`);
      continue;
    }
    if (readFileSync(sourcePath, "utf8") !== readFileSync(destinationPath, "utf8")) {
      diffs.push(`changed ${relative(rootDir, destinationPath)}`);
    }
  }

  return diffs;
}

function checkCard(card) {
  const errors = [];
  const expectedSkillDirs = [...card.skills].sort();
  const actualSkillDirs = existsSync(card.targetDir)
    ? readdirSync(card.targetDir).filter((entry) => statSync(join(card.targetDir, entry)).isDirectory()).sort()
    : [];
  const allSkillDirs = [...new Set([...expectedSkillDirs, ...actualSkillDirs])].sort();

  for (const skillName of allSkillDirs) {
    const sourceDir = join(rootDir, "skills", skillName);
    const destinationDir = join(card.targetDir, skillName);
    if (!expectedSkillDirs.includes(skillName)) {
      errors.push(`${card.slug}: unexpected bundled skill ${skillName}`);
      continue;
    }
    if (!actualSkillDirs.includes(skillName)) {
      errors.push(`${card.slug}: missing bundled skill ${skillName}`);
      continue;
    }
    errors.push(...compareDirectories(sourceDir, destinationDir).map((diff) => `${card.slug}: ${diff}`));
  }

  return errors;
}

if (checkMode) {
  const errors = cardMaps.flatMap((card) => checkCard(card));
  if (errors.length > 0) {
    for (const error of errors) {
      console.error(`✘ ${error}`);
    }
    process.exit(1);
  }
  console.log("✓ Card-bundled skills are in sync.");
  process.exit(0);
}

for (const { targetDir, skills } of cardMaps) {
  mkdirSync(targetDir, { recursive: true });

  for (const entry of readdirSync(targetDir)) {
    const fullPath = join(targetDir, entry);
    rmSync(fullPath, { recursive: true, force: true });
  }

  for (const skillName of skills) {
    const sourceDir = join(rootDir, "skills", skillName);
    const destinationDir = join(targetDir, skillName);
    cpSync(sourceDir, destinationDir, { recursive: true, force: false });
  }
}

console.log("Synced card-bundled skills.");
