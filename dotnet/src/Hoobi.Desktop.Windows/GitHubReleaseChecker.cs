using System.Net.Http.Headers;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Hoobi.Desktop.Windows;

public sealed record ReleaseInfo(string Version, string Url, bool IsNewer);

public sealed class GitHubReleaseChecker(HttpClient http, string owner, string repo, string userAgent)
{
    public string ReleasesPageUrl { get; } = $"https://github.com/{owner}/{repo}/releases";

    public async Task<ReleaseInfo?> CheckAsync(string currentVersion, bool includePreReleases, CancellationToken cancellationToken = default)
    {
        if (AppVersion.Compare(currentVersion, currentVersion) is null)
        {
            throw new FormatException($"The current version '{currentVersion}' is not a version number.");
        }

        using var request = new HttpRequestMessage(HttpMethod.Get, $"https://api.github.com/repos/{owner}/{repo}/releases");
        request.Headers.UserAgent.ParseAdd(userAgent);
        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/vnd.github+json"));
        using var response = await http.SendAsync(request, cancellationToken).ConfigureAwait(false);
        response.EnsureSuccessStatusCode();

        await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken).ConfigureAwait(false);
        var releases = await JsonSerializer
            .DeserializeAsync(stream, GitHubJsonContext.Default.GitHubReleaseArray, cancellationToken)
            .ConfigureAwait(false);

        if (SelectLatest(releases ?? [], includePreReleases) is not { } latest)
        {
            return null;
        }

        return new ReleaseInfo(
            latest.Name is { Length: > 0 } name ? name : latest.TagName!,
            latest.HtmlUrl is { Length: > 0 } url ? url : ReleasesPageUrl,
            AppVersion.IsNewer(latest.TagName!, currentVersion));
    }

    internal static GitHubRelease? SelectLatest(IEnumerable<GitHubRelease> releases, bool includePreReleases)
    {
        GitHubRelease? best = null;
        foreach (var release in releases)
        {
            if (release.Draft || (!includePreReleases && release.Prerelease) || release.TagName is null)
            {
                continue;
            }

            if (best is null ? AppVersion.Compare(release.TagName, release.TagName) is not null : AppVersion.Compare(release.TagName, best.TagName!) > 0)
            {
                best = release;
            }
        }

        return best;
    }
}

[JsonSerializable(typeof(GitHubRelease[]))]
internal sealed partial class GitHubJsonContext : JsonSerializerContext;

internal sealed class GitHubRelease
{
    [JsonPropertyName("tag_name")]
    public string? TagName { get; set; }

    [JsonPropertyName("name")]
    public string? Name { get; set; }

    [JsonPropertyName("html_url")]
    public string? HtmlUrl { get; set; }

    [JsonPropertyName("prerelease")]
    public bool Prerelease { get; set; }

    [JsonPropertyName("draft")]
    public bool Draft { get; set; }
}
