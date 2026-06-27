// ABOUTME: Declares which canonical skills are bundled into each card source.
// ABOUTME: Shared by sync, validation, card validation, and smoke scripts.

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));

export const PRIMARY_STABLE_SKILLS = [
  "bootstrap-project",
  "apply-mind-card",
  "author-mind-card",
  "install-harness-project",
  "inspect-harness",
  "materialize-harness",
  "manage-harness-library",
  "repair-harness",
  "manage-defaults",
  "recommend-harness",
  "share-mind-card",
  "support-harness",
  "sync-card-skills",
  "import-mcp-from-claude",
  "manage-active-mind-stack",
  "author-mind-content",
  "audit-mind-visibility",
];

export const COMPATIBILITY_ALIAS_SKILLS = [
  "apply-harness-card",
  "author-harness-card",
  "share-harness-card",
];

export const BASE_MIND_SKILLS = [
  "manage-active-mind-stack",
  "author-mind-content",
  "audit-mind-visibility",
];

export const WORKSPACE_EXPERIMENTAL_SKILLS = ["organize-workspace"];

export const cardMaps = [
  {
    name: "@darwinian/mind-skills",
    slug: "mind-skills",
    cardDir: join(rootDir, "cards", "mind-skills"),
    targetDir: join(rootDir, "cards", "mind-skills", "skills"),
    skills: PRIMARY_STABLE_SKILLS,
  },
  {
    name: "@darwinian/harness-skills",
    slug: "harness-skills",
    cardDir: join(rootDir, "cards", "harness-skills"),
    targetDir: join(rootDir, "cards", "harness-skills", "skills"),
    skills: [...PRIMARY_STABLE_SKILLS, ...COMPATIBILITY_ALIAS_SKILLS],
  },
  {
    name: "@darwinian/workspace-experimental",
    slug: "workspace-experimental",
    cardDir: join(rootDir, "cards", "workspace-experimental"),
    targetDir: join(rootDir, "cards", "workspace-experimental", "skills"),
    skills: WORKSPACE_EXPERIMENTAL_SKILLS,
  },
  {
    name: "@darwinian/base-mind",
    slug: "base-mind",
    cardDir: join(rootDir, "cards", "base-mind"),
    targetDir: join(rootDir, "cards", "base-mind", "skills"),
    skills: BASE_MIND_SKILLS,
  },
];
