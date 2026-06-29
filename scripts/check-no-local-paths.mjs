#!/usr/bin/env node
// ABOUTME: Fails when a tracked file contains a local machine home path.
// ABOUTME: Keeps personal filesystem layout out of this public repo's history.

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

// Absolute home paths that leak a machine's username/layout. Repo-relative paths
// and "~" references are fine; these literal prefixes are not.
const PATTERNS = [/\/Users\/[^/\s]+/, /\/home\/[^/\s]+/];

const trackedFiles = execFileSync("git", ["ls-files"], { encoding: "utf8" })
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);

const findings = [];
for (const file of trackedFiles) {
  let content;
  try {
    content = readFileSync(file, "utf8");
  } catch {
    continue; // binary or unreadable; skip
  }
  content.split("\n").forEach((line, index) => {
    for (const pattern of PATTERNS) {
      if (pattern.test(line)) {
        findings.push(`${file}:${index + 1}: ${line.trim()}`);
        break;
      }
    }
  });
}

if (findings.length > 0) {
  console.error("Local machine paths must not be committed to this public repo:");
  for (const finding of findings) {
    console.error(`  ${finding}`);
  }
  console.error("\nReplace them with repo-relative paths or a '~' reference.");
  process.exit(1);
}

console.log(`check:paths OK — scanned ${trackedFiles.length} tracked files, no local paths found.`);
