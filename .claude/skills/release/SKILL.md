---
name: release
description: Release @hoobi/design to the ADO feed - verify, version bump, tag push, publish
  pipeline to green, then decide whether the Design System artifact sync is due. Use whenever library
  changes are ready for consumers ("release this", "publish the library", "bump the version"),
  or when mendarr needs a change repinned.
---

# release

The feed is immutable: a wrong publish burns the version number permanently. Verify before the
tag exists.

1. **Verify**: `pnpm run typecheck` (runs check.mjs) and `pnpm run build` pass; every changed
   component was LOOKED at in the catalog (`pnpm run build` then `pnpm -C catalog dev`) -
   a component that was never rendered is not verified.
2. **Commit** on main (conventional-commit + gitmoji, no AI-attribution trailers).
3. **Version + tag**: `pnpm version patch|minor` (additive props/components -> minor; visual or
   behavioural fixes -> patch), then `git push origin main --follow-tags`.
4. **Monitor pipeline 23** for the `refs/tags/v<ver>` run to `succeeded` (background poll ~30s):
   `az pipelines runs list --org https://dev.azure.com/Hoobi --project Hoobi --pipeline-ids 23
   --branch refs/tags/v<ver> --top 1`. The feed has the version only after this is green; do
   not repin mendarr before then.
5. **Design System sync** when the release added components or tokens, or changed a component's
   look or rules (skip for small fixes): the `design-sync` skill here builds the files with
   `catalog/ds/build.mjs` and publishes them to the "Hoobi Design" artifact with the Artifact tool.
6. Consumers: mendarr repins via ITS `ui-loop` skill (uninstall + `--save-exact` install - a
   plain version edit leaves the dev link in the lockfile).
