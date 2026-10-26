---
name: design-sync
description: Sync @hoobi/design to the "Hoobi Design" Claude Design System artifact (https://claude.ai/artifact/N5rDQuXjYLMJ7VQ6Q8wxHB) - build the files with catalog/ds/build.mjs, then publish them with the Artifact tool. Run after a library release (pnpm version + tag push), or when asked to "sync the design system" or "update the design system artifact".
---

# design-sync

Publish the library's tokens, brand book and live component cards to the Design System artifact
so Claude generates Hoobi-shaped UI from the real components, rules and tokens.

- **Target:** "Hoobi Design", https://claude.ai/artifact/N5rDQuXjYLMJ7VQ6Q8wxHB. Its content is
  files under `project/`; everything else in the artifact belongs to the Design System type and is
  refused.
- **When:** after a release (`pnpm version` + `git push --follow-tags`), once the publish pipeline
  is green. The system shows what consumers can `pnpm add`, so never sync unreleased `main` unless
  explicitly asked to preview.
- **Mode:** the index carries `"editing": "code"`, so the page is read-only and every change comes
  from this repo. Keep it on every sync.

## Procedure

1. Build (library `dist` first, the catalog consumes `../` via `workspace:*`):

   ```bash
   pnpm run build && pnpm -C catalog build:ds
   ```

   Output: `catalog/design-system/project/`. The generator checks the tree against the format
   (paths, caps, token grammar, preview markers, the bundle header) and fails on a breach.

2. Read the live artifact in one message: `Artifact` `read` with `url` and
   `path: "project/design-system.json"`, and `list` with `scope: "files"`.
   - The live index has a `createdOnFiles` marker: copy the local index's `title`, `namespace`,
     `libraries`, `editing` and `lastChange` onto it, keep every other live key (`createdOnFiles`,
     `sections`, `groups`, `assetGroups`, `blobs`, `docs`), and write the result over
     `catalog/design-system/project/design-system.json`.
   - A live `project/design-system.json` without a marker is not an index: stop and say so.
   - No live index: publish the local one as built.

3. Publish to the `url` with `root`, `file_path` one local file by its full path, and `files`
   mapping each other `project/<path>` to itself.
   - `root` must sit under the session's working directory or scratchpad. From another repo, copy
     `catalog/design-system/project` into the scratchpad first. Use the long scratchpad path
     (`C:\Users\<user>\...`), never the 8.3 short form (`<USER>~1`), which a Read rule
     blocks.
   - `project/components/index.d.ts` goes as `{"from": "...", "contentType": "text/plain"}`; the
     publish cannot infer a type for `.d.ts`.
   - Send every file in `project/` except the index, plus `"project/<path>": null` for each live
     `project/` path the build no longer produces.
   - At most 255 paths a call; a larger set goes in several calls.
   - The index goes ONCE, alone, in the LAST call: `read` it again right before and redo step 2's
     merge on that copy.
   - Refused because someone saved meanwhile: read those files again and redo the change once;
     refused again, stop and tell the user.

4. Report the artifact link, the commit the files came from (`lastChange.via`), and the "Not
   synced" list at the end of `project/README.md`.

## Notes

- The format rules are the Design System type's `SKILL.md` and `artifact-type/reference/*.md`,
  readable on the artifact's url with `read`. `catalog/ds/build.mjs` implements them; when a
  publish is refused for format, read those, fix the generator, rebuild.
- Inputs live in `catalog/ds/`: `brand.md` (the README), `guidance.md` (per-component rules),
  `usage.json` (a note per token, required), `examples.mjs` (preview examples where the catalog's
  own `<Demo>` children cannot render alone, and overlays shown open), `cover.html`.
- Previews load React 18 from jsDelivr (the index's `libraries`); the library targets React 19, so
  a preview that needs a React 19 feature renders degraded there.
