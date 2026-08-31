---
name: design-sync
description: Sync the hoobi-design catalog to the "Hoobi Design" Claude Design project (claude.ai/design) via the DesignSync tool. Run after a library release (npm version + tag push), or when asked to "sync the design system", "update Claude Design", or "push the catalog to claude.ai". Diffs by hash manifest, so re-running is a no-op.
---

# design-sync

Push the static design-system bundle to the Claude Design project so Claude generates
Hoobi-shaped UI from the real components, rules and tokens.

- **Project:** "Hoobi Design", projectId `<project-id>`.
- **When:** after a release (`npm version` + `git push --follow-tags`), once the publish
  pipeline is green. The design system shows what consumers can `npm install`, so never
  sync unreleased `main` unless explicitly asked to preview.
- **Auth:** DesignSync needs an interactive claude.ai login (`/design-login`). If it errors
  on auth, ask the user to run that — it cannot happen headless, which is why this is a
  skill and not a pipeline step.

## Procedure

1. Build the bundle (library dist first — the catalog consumes `../` via `file:`):

   ```bash
   npm run build && cd catalog && npm run build:ds
   ```

   Output: `catalog/design-system/` — one standalone HTML card per page from
   `catalog/src/pages.tsx`, plus `tokens.json` and `_hashes.json`.

2. Diff against the remote:
   - `DesignSync get_file` on `_hashes.json` (the one small file; cards are ~400KB and
     `get_file` caps at 256KiB, so never try to read a card back).
   - Compare with the local `_hashes.json`: changed/new paths → writes, remote paths
     absent locally → deletes. If nothing differs, say so and stop.
   - If the remote has no `_hashes.json` (fresh project), everything is a write.

3. `finalize_plan` with exactly those writes and deletes,
   `localDir: <repo>/catalog/design-system`, then `write_files` (use `localPath` for
   every file) and `delete_files`. No `register_assets` — the `@dsCard` comment on each
   card's first line is the registration.

## Notes

- Every card is stamped with the library version, so a version bump changes every hash
  and a release syncs all ~34 files (~13MB). Expected and fine — the diff only saves
  work when re-running or iterating.
- A page removed from `pages.tsx` must end up in `deletes` — the hash diff catches this;
  do not skip the delete or the stale card lingers in the pane.
- Never wholesale-replace the project by deleting everything first; the plan is always
  the minimal diff.
