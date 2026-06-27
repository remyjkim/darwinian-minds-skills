#!/usr/bin/env node
// ABOUTME: Copies canonical skill directories into the stable and experimental card sources.
// ABOUTME: Keeps card-bundled skill content aligned with the repo's main skills/ tree.

import { cpSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));

const cardMaps = [
  {
    targetDir: join(rootDir, "cards", "harness-skills", "skills"),
    skills: [
      "bootstrap-project",
      "apply-harness-card",
      "author-harness-card",
      "install-harness-project",
      "inspect-harness",
      "materialize-harness",
      "manage-harness-library",
      "repair-harness",
      "manage-defaults",
      "recommend-harness",
      "share-harness-card",
      "support-harness",
      "sync-card-skills",
      "import-mcp-from-claude",
    ],
  },
  {
    targetDir: join(rootDir, "cards", "workspace-experimental", "skills"),
    skills: ["organize-workspace"],
  },
  {
    targetDir: join(rootDir, "cards", "base-mind", "skills"),
    skills: [
      "manage-active-mind-stack",
      "author-mind-content",
      "audit-mind-visibility",
    ],
  },
];

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
