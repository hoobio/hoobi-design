using System.Net;
using System.Text;

namespace Hoobi.Desktop.Windows.Tests;

public sealed class GitHubReleaseCheckerTests
{
    private const string Releases = """
        [
          {"tag_name":"v1.2.0","name":"1.2.0","html_url":"https://github.com/o/r/releases/tag/v1.2.0","prerelease":false,"draft":false},
          {"tag_name":"v1.3.0-preview.2","name":"","html_url":"","prerelease":true,"draft":false},
          {"tag_name":"v9.0.0","name":"9.0.0","html_url":"x","prerelease":false,"draft":true},
          {"tag_name":"nightly","name":"nightly","html_url":"x","prerelease":false,"draft":false}
        ]
        """;

    [Fact]
    public async Task Stable_IgnoresPreReleasesDraftsAndUnparseableTags()
    {
        var info = await Checker(Releases).CheckAsync("1.1.0", includePreReleases: false, TestContext.Current.CancellationToken);

        Assert.Equal(new ReleaseInfo("1.2.0", "https://github.com/o/r/releases/tag/v1.2.0", true), info);
    }

    [Fact]
    public async Task PreReleaseBuild_SeesPreReleases_AndFallsBackToTheTagAndReleasesPage()
    {
        var info = await Checker(Releases).CheckAsync("1.2.0", includePreReleases: true, TestContext.Current.CancellationToken);

        Assert.Equal(new ReleaseInfo("v1.3.0-preview.2", "https://github.com/o/r/releases", true), info);
    }

    [Fact]
    public async Task CurrentIsLatest_IsNotNewer()
    {
        var info = await Checker(Releases).CheckAsync("1.2.0", includePreReleases: false, TestContext.Current.CancellationToken);

        Assert.False(info!.IsNewer);
    }

    [Fact]
    public async Task NoComparableRelease_IsNull() =>
        Assert.Null(await Checker("[]").CheckAsync("1.0.0", includePreReleases: true, TestContext.Current.CancellationToken));

    [Fact]
    public async Task UnparseableCurrentVersion_Throws() =>
        await Assert.ThrowsAsync<FormatException>(() => Checker(Releases).CheckAsync("dev", includePreReleases: false, TestContext.Current.CancellationToken));

    [Fact]
    public async Task FailedRequest_Throws() =>
        await Assert.ThrowsAsync<HttpRequestException>(() => Checker(Releases, HttpStatusCode.Forbidden).CheckAsync("1.0.0", includePreReleases: false, TestContext.Current.CancellationToken));

    [Fact]
    public async Task Request_CarriesTheUserAgentAndTargetsTheRepo()
    {
        var handler = new StubHandler(Releases, HttpStatusCode.OK);
        using var http = new HttpClient(handler);

        await new GitHubReleaseChecker(http, "o", "r", "App/1.0").CheckAsync("1.0.0", includePreReleases: false, TestContext.Current.CancellationToken);

        Assert.Equal("https://api.github.com/repos/o/r/releases", handler.Request!.RequestUri!.ToString());
        Assert.Equal("App/1.0", handler.Request.Headers.UserAgent.ToString());
    }

    private static GitHubReleaseChecker Checker(string json, HttpStatusCode status = HttpStatusCode.OK) =>
        new(new HttpClient(new StubHandler(json, status)), "o", "r", "App/1.0");

    private sealed class StubHandler(string json, HttpStatusCode status) : HttpMessageHandler
    {
        public HttpRequestMessage? Request { get; private set; }

        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            Request = request;
            return Task.FromResult(new HttpResponseMessage(status) { Content = new StringContent(json, Encoding.UTF8, "application/json") });
        }
    }
}
