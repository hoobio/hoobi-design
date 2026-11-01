---
name: release
description: Release @hoobi/design and the NuGet packages to the Hoobi feed - verify, merge the release-please PR, watch the publish to green, then decide whether the Design System artifact sync is due. Use whenever library changes are ready for consumers ("release this", "publish the library", "bump the version"), or when mendarr needs a change repinned.
---

# release

release-please owns the version. Nobody runs `pnpm version` or pushes a tag by hand. The feed is
immutable: a wrong publish uses up the version number permanently, so verify before the release PR
merges.

1. **Verify**: `pnpm run typecheck` (runs check.mjs) and `pnpm run build` pass; every changed
   component was LOOKED at in the catalog (`pnpm run build` then `pnpm -C catalog dev`) -
   a component that was never rendered is not verified.
2. **Commit** on main (conventional-commit + gitmoji, no AI-attribution trailers) and push to
   `github.com/hoobio/hoobi-design`. `feat` gives a minor release, `fix` a patch; `ci`, `build`,
   `chore` and `docs` give none.
3. **Release PR**: the `Release` workflow keeps one open release-please PR,
   `chore(main): release <ver>`. It stamps `.release-please-manifest.json`, `react/package.json`
   (which `dotnet/Directory.Build.props` reads for the NuGet version) and `CHANGELOG.md`. Merge it
   (squash) when the release is due.
4. **Watch the run** that the merge starts (gh account `hoobio`):
   `GH_TOKEN=$(gh auth token -u hoobio) gh run list -R hoobio/hoobi-design --workflow Release --limit 1`.
   release-please creates the `v<ver>` tag and release, then `publish` (npm and NuGet) and
   `pages-build`/`pages-deploy` (the catalog site) run on that tag. The feed has the version only
   after `publish` is green; do not repin consumers before then.
5. **Design System sync** when the release added components or tokens, or changed a component's
   look or rules (skip for small fixes): the `design-sync` skill here builds the files with
   `catalog/ds/build.mjs` and publishes them to the "Hoobi Design" artifact with the Artifact tool.
6. Consumers: mendarr repins via ITS `ui-loop` skill (uninstall + `--save-exact` install - a
   plain version edit leaves the dev link in the lockfile).

## NuGet side

The same release publishes three NuGet packages to the Hoobi feed: `Hoobi.Design.Avalonia`,
`Hoobi.Design.Avalonia.Testing` and `Hoobi.Desktop.Windows`. The version is `react/package.json`'s,
so one release publishes npm and NuGet together. The `publish` job runs `dotnet test` for
`Hoobi.Design.Avalonia.Tests` only (the Windows test project cannot run on Linux), packs with
`-p:Version=<version>` and pushes with `--skip-duplicate`.

Before the release PR merges, `dotnet build dotnet/Hoobi.Design.slnx -c Release` and the Avalonia
and Windows test projects pass locally.

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
`hoobi-github-ado-artifacts` (Hoobi tenant, Contributor on the feed, federated for every `hoobio`
repo) with the repo secrets `ADO_HOOBI_ARTIFACTS_PULL_CLIENT_ID` and `ADO_HOOBI_TENANT_ID`. The
Hoobi feed rejects anonymous restore with 401.
