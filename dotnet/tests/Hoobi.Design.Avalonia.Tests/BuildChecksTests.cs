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
                <HoobiDesignChecksExclude Include="Bad.axaml;Popup.axaml" Condition="'$(ExcludeBad)' == 'true'" />
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
        File.WriteAllText(Path.Combine(consumer, "Local.axaml"), """
            <UserControl xmlns="https://github.com/avaloniaui" xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml" xmlns:sty="using:FluentAvalonia.Styling">
              <UserControl.Resources>
                <x:Double x:Key="ContentDialogMinWidth">520</x:Double>
              </UserControl.Resources>
              <UserControl.Styles>
                <Style Selector="#Add" />
                <sty:FluentAvaloniaTheme PreferUserAccentColor="False" />
              </UserControl.Styles>
              <StackPanel>
                <TextBlock Text="#1234" />
                <TextBlock>#100</TextBlock>
                <Border BoxShadow="None" />
              </StackPanel>
            </UserControl>
            """);

        var runtimeConfig = Path.Combine(consumer, "bin", "Debug", "net10.0", "Consumer.runtimeconfig.json");
        AssertBuild(0, "build", consumer);
        var defaults = File.ReadAllText(runtimeConfig);
        Assert.Contains("\"System.GC.Concurrent\": false", defaults, StringComparison.Ordinal);
        Assert.Contains("\"System.GC.ConserveMemory\": 5", defaults, StringComparison.Ordinal);
        Assert.Contains("\"System.GC.Gen0MaxBudget\": 8388608", defaults, StringComparison.Ordinal);
        var licences = Path.Combine(consumer, "bin", "Debug", "net10.0", "licenses", "fonts");
        Assert.Equal(["LICENSE-FluentSystemIcons.txt", "OFL-CascadiaCode.txt", "OFL-HankenGrotesk.txt"], Directory.GetFiles(licences).Select(Path.GetFileName).Order(StringComparer.Ordinal));

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
              <LinearGradientBrush x:Key="FixtureGradient"><GradientStop Color="#123456" Offset="0" /></LinearGradientBrush>
              <BoxShadows x:Key="FixtureShadows">0 8 16 0 #47000000</BoxShadows>
              <ControlTheme x:Key="FixtureTheme" TargetType="Border"><Setter Property="BoxShadow" Value="0 0 2 0 #3D000000" /></ControlTheme>
              <ControlTheme x:Key="FixtureTextBox" TargetType="TextBox"><Setter Property="PlaceholderForeground" Value="#123456" /></ControlTheme>
              <ResourceDictionary.ThemeDictionaries>
                <ResourceDictionary x:Key="Dark">
                  <x:Double x:Key="HoobiTextColor">1</x:Double>
                </ResourceDictionary>
              </ResourceDictionary.ThemeDictionaries>
            </ResourceDictionary>
            """);
        File.WriteAllText(Path.Combine(consumer, "Popup.axaml"), """
            <UserControl xmlns="https://github.com/avaloniaui" xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml" xmlns:hoobi="using:Hoobi.Design.Avalonia">
              <UserControl.Resources>
                <SolidColorBrush x:Key="FlyoutPresenterBackground" Color="{DynamicResource HoobiSurfaceColor}" />
                <!-- popup-ok: fixture exemption -->
                <SolidColorBrush x:Key="MenuFlyoutPresenterBackground" Color="{DynamicResource HoobiSurfaceColor}" />
                <x:Double x:Key="HoobiFlyoutAcrylicTintOpacity">1</x:Double>
              </UserControl.Resources>
              <UserControl.Styles>
                <Style Selector="FlyoutPresenter.Mine"><Setter Property="Background" Value="{DynamicResource HoobiSurfaceBrush}" /></Style>
                <Style Selector="ComboBox /template/ Border#PopupBorder"><Setter Property="hoobi:Acrylic.IsEnabled" Value="False" /></Style>
                <Style Selector="FlyoutPresenter TextBlock"><Setter Property="Background" Value="{DynamicResource HoobiSurfaceBrush}" /></Style>
              </UserControl.Styles>
              <StackPanel>
                <ToolTip Background="{DynamicResource HoobiSurfaceBrush}" />
                <Border hoobi:Acrylic.IsEnabled="False" />
                <Border hoobi:Acrylic.IsEnabled="True" />
              </StackPanel>
            </UserControl>
            """);
        var failed = AssertBuild(1, "build", consumer, "--no-restore");
        foreach (var line in new[] { 2, 3, 4, 5, 6, 7, 8, 11 })
        {
            Assert.Contains($"Bad.axaml({line},", failed, StringComparison.Ordinal);
        }

        foreach (var line in new[] { 3, 6, 9, 10, 14, 15 })
        {
            Assert.Contains($"Popup.axaml({line},", failed, StringComparison.Ordinal);
        }

        Assert.Equal(6, Count(failed, "error HOOBI001"));
        Assert.Equal(2, Count(failed, "error HOOBI002"));
        Assert.Equal(6, Count(failed, "error HOOBI003"));
        Assert.DoesNotContain("Clean.axaml(", failed, StringComparison.Ordinal);
        Assert.DoesNotContain("Local.axaml(", failed, StringComparison.Ordinal);

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
