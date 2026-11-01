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
3. **Version + tag**: `pnpm -C react version patch|minor` from the repo root (additive
   props/components -> minor; visual or behavioural fixes -> patch). It commits `react/package.json`
   and tags `v<ver>`. Then `git push origin main --follow-tags`.
4. **Monitor pipeline 23** for the `refs/tags/v<ver>` run to `succeeded` (background poll ~30s):
   `az pipelines runs list --org https://dev.azure.com/Hoobi --project Hoobi --pipeline-ids 23
   --branch refs/tags/v<ver> --top 1`. The feed has the version only after this is green; do
   not repin mendarr before then.
5. **Design System sync** when the release added components or tokens, or changed a component's
   look or rules (skip for small fixes): the `design-sync` skill here builds the files with
   `catalog/ds/build.mjs` and publishes them to the "Hoobi Design" artifact with the Artifact tool.
6. Consumers: mendarr repins via ITS `ui-loop` skill (uninstall + `--save-exact` install - a
   plain version edit leaves the dev link in the lockfile).

## NuGet side

The same `v*` tag publishes three NuGet packages to the Hoobi feed: `Hoobi.Design.Avalonia`,
`Hoobi.Design.Avalonia.Testing` and `Hoobi.Desktop.Windows`. The version is `react/package.json`'s, so
one bump releases npm and NuGet together. Pipeline 23 packs with `-p:Version=<tag version>` and
pushes with `--skip-duplicate`. It runs `dotnet test` for `Hoobi.Design.Avalonia.Tests` only: the
Windows test project cannot run on the Linux agent.

Before the tag, `dotnet build dotnet/Hoobi.Design.slnx -c Release` and the Avalonia and Windows test
projects pass locally.

Verify the packages landed (read-only, Hoobi org token from `~/.azure-profile`):

```powershell
$env:AZURE_CONFIG_DIR = "$env:USERPROFILE\.azure-profile"
$t = az account get-access-token --resource 499b84ac-1321-427f-aa17-267ca6975798 --query accessToken -o tsv
Invoke-RestMethod -Headers @{Authorization="Bearer $t"} -Uri 'https://feeds.dev.azure.com/Hoobi/Hoobi/_apis/packaging/Feeds/Hoobi/packages?protocolType=NuGet&packageNameQuery=Hoobi&api-version=7.1' | % value | % { "$($_.name) $($_.versions.version)" }
```

All three names must list the new version. Do not repin consumers before they do.

Avalonia consumers (steward-companion, earmark, command-palette-bitwarden): bump
`Hoobi.Design.Avalonia` and `Hoobi.Desktop.Windows` in their `Directory.Packages.props` to the new
version. Their GitHub Actions restore authenticates through OIDC: the Entra app
`hoobi-github-ado-nuget-pull` (Hoobi tenant, Reader on the feed, federated for every `hoobio` repo)
with the repo variables `ADO_HOOBI_ARTIFACTS_PULL_CLIENT_ID` and `ADO_HOOBI_TENANT_ID`. The Hoobi
feed rejects anonymous restore with 401.
