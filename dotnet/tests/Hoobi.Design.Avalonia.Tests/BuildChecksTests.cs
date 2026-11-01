using System.Diagnostics;

namespace Hoobi.Design.Avalonia.Tests;

public sealed class BuildChecksTests : IDisposable
{
    private const string Version = "0.0.0-fixture";
#if DEBUG
    private const string Configuration = "Debug";
#else
    private const string Configuration = "Release";
#endif

    private readonly string _root = Directory.CreateTempSubdirectory("hoobi-design-checks-").FullName;
    private readonly string _cachedPackage = Path.Combine(
        Environment.GetEnvironmentVariable("NUGET_PACKAGES") ?? Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile), ".nuget", "packages"),
        "hoobi.design.avalonia",
        Version);

    [Fact]
    public void A_consuming_build_fails_on_literal_colours_and_owned_keys_with_the_escape_and_opt_outs_honoured()
    {
        var library = Path.Combine(AvaloniaSession.DotnetRoot(), "src", "Hoobi.Design.Avalonia", "Hoobi.Design.Avalonia.csproj");
        var feed = Path.Combine(_root, "feed");
        var consumer = Path.Combine(_root, "consumer");
        DeleteCachedPackage();
        AssertBuild(0, "pack", library, "-c", Configuration, "--no-build", "-o", feed, $"-p:Version={Version}");

        Directory.CreateDirectory(consumer);
        File.WriteAllText(Path.Combine(_root, "Directory.Build.props"), "<Project />");
        File.WriteAllText(Path.Combine(_root, "Directory.Build.targets"), "<Project />");
        File.WriteAllText(Path.Combine(_root, "Directory.Packages.props"), "<Project />");
        File.WriteAllText(Path.Combine(consumer, "nuget.config"), $"""
            <configuration>
              <packageSources>
                <clear />
                <add key="fixture" value="{feed}" />
                <add key="nuget.org" value="https://api.nuget.org/v3/index.json" />
              </packageSources>
            </configuration>
            """);
        File.WriteAllText(Path.Combine(consumer, "Consumer.csproj"), $"""
            <Project Sdk="Microsoft.NET.Sdk">
              <PropertyGroup>
                <OutputType>Exe</OutputType>
                <TargetFramework>net10.0</TargetFramework>
              </PropertyGroup>
              <ItemGroup>
                <PackageReference Include="Hoobi.Design.Avalonia" Version="{Version}" />
                <HoobiDesignChecksExclude Include="Bad.axaml" Condition="'$(ExcludeBad)' == 'true'" />
                <RuntimeHostConfigurationOption Update="System.GC.ConserveMemory" Value="7" Condition="'$(ConserveSeven)' == 'true'" />
              </ItemGroup>
            </Project>
            """);
        File.WriteAllText(Path.Combine(consumer, "Program.cs"), "return;");
        File.WriteAllText(Path.Combine(consumer, "Clean.axaml"), """
            <ResourceDictionary xmlns="https://github.com/avaloniaui" xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml">
              <!-- hex-ok: fixture brand colour -->
              <Color x:Key="FixtureColor">#FF112233</Color>
              <SolidColorBrush x:Key="FixtureBrush" Color="{StaticResource FixtureColor}" />
              <SolidColorBrush x:Key="FixtureHitTest" Color="Transparent" />
              <ResourceDictionary.ThemeDictionaries>
                <ResourceDictionary x:Key="Dark" />
              </ResourceDictionary.ThemeDictionaries>
            </ResourceDictionary>
            """);

        var runtimeConfig = Path.Combine(consumer, "bin", "Debug", "net10.0", "Consumer.runtimeconfig.json");
        AssertBuild(0, "build", consumer);
        var defaults = File.ReadAllText(runtimeConfig);
        Assert.Contains("\"System.GC.Concurrent\": false", defaults, StringComparison.Ordinal);
        Assert.Contains("\"System.GC.ConserveMemory\": 5", defaults, StringComparison.Ordinal);
        Assert.Contains("\"System.GC.Gen0MaxBudget\": 8388608", defaults, StringComparison.Ordinal);

        AssertBuild(0, "build", consumer, "--no-restore", "-p:ConserveSeven=true", "-p:ConcurrentGarbageCollection=true");
        var overridden = File.ReadAllText(runtimeConfig);
        Assert.Contains("\"System.GC.Concurrent\": true", overridden, StringComparison.Ordinal);
        Assert.Contains("\"System.GC.ConserveMemory\": 7", overridden, StringComparison.Ordinal);

        AssertBuild(0, "build", consumer, "--no-restore", "-p:HoobiDesignGcDefaults=false");
        Assert.DoesNotContain("System.GC.", File.ReadAllText(runtimeConfig), StringComparison.Ordinal);

        File.WriteAllText(Path.Combine(consumer, "Bad.axaml"), """
            <ResourceDictionary xmlns="https://github.com/avaloniaui" xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml">
              <Color x:Key="FixtureHex">#123</Color>
              <SolidColorBrush x:Key="FixtureNamed" Color="White" />
              <x:Double x:Key="HoobiBgColor">1</x:Double>
            </ResourceDictionary>
            """);
        var failed = AssertBuild(1, "build", consumer, "--no-restore");
        Assert.Contains("Bad.axaml(2,", failed, StringComparison.Ordinal);
        Assert.Contains("Bad.axaml(3,", failed, StringComparison.Ordinal);
        Assert.Contains("Bad.axaml(4,", failed, StringComparison.Ordinal);
        Assert.Equal(2, Count(failed, "error HOOBI001"));
        Assert.Equal(1, Count(failed, "error HOOBI002"));
        Assert.DoesNotContain("Clean.axaml(", failed, StringComparison.Ordinal);

        AssertBuild(0, "build", consumer, "--no-restore", "-p:HoobiDesignChecks=false");
        AssertBuild(0, "build", consumer, "--no-restore", "-p:ExcludeBad=true");
    }

    public void Dispose()
    {
        DeleteCachedPackage();
        Directory.Delete(_root, recursive: true);
    }

    private void DeleteCachedPackage()
    {
        if (Directory.Exists(_cachedPackage))
        {
            Directory.Delete(_cachedPackage, recursive: true);
        }
    }

    private static int Count(string text, string value) =>
        text.Split('\n').Where(line => line.Contains(value, StringComparison.Ordinal)).Select(line => line.Trim()).Distinct().Count();

    private static string AssertBuild(int expectedExit, string command, string target, params string[] arguments)
    {
        var start = new ProcessStartInfo("dotnet") { RedirectStandardOutput = true, RedirectStandardError = true, WorkingDirectory = Path.GetDirectoryName(target) ?? target };
        foreach (var argument in (string[])[command, target, "-nologo", "-nodeReuse:false", "-p:UseSharedCompilation=false", "-clp:NoSummary", .. arguments])
        {
            start.ArgumentList.Add(argument);
        }

        foreach (var name in start.Environment.Keys.Where(name => name.StartsWith("MSBuild", StringComparison.OrdinalIgnoreCase)).ToList())
        {
            start.Environment.Remove(name);
        }

        using var process = Process.Start(start)!;
        var error = process.StandardError.ReadToEndAsync(TestContext.Current.CancellationToken);
        var output = process.StandardOutput.ReadToEnd() + error.GetAwaiter().GetResult();
        process.WaitForExit();
        Assert.True(expectedExit == 0 ? process.ExitCode == 0 : process.ExitCode != 0, $"dotnet {command} exited {process.ExitCode}:\n{output}");
        return output;
    }
}
