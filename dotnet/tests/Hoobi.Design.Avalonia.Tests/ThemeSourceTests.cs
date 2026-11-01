using System.Text.RegularExpressions;

namespace Hoobi.Design.Avalonia.Tests;

public sealed partial class ThemeSourceTests
{
    private static readonly string[] PaletteFiles = ["Tokens.axaml", "Resources.axaml"];

    [Fact]
    public void No_axaml_outside_the_palette_files_holds_a_literal_hex_colour()
    {
        var library = Path.Combine(AvaloniaSession.DotnetRoot(), "src", "Hoobi.Design.Avalonia");
        var files = Directory.EnumerateFiles(library, "*.axaml", SearchOption.AllDirectories)
            .Where(file => !file.Split(Path.DirectorySeparatorChar).Any(part => part is "bin" or "obj"))
            .ToList();
        Assert.NotEmpty(files);

        var hits = files
            .Where(file => !PaletteFiles.Contains(Path.GetFileName(file)))
            .SelectMany(file => File.ReadLines(file).Select((line, index) => (file, line, index)))
            .Where(hit => HexValue().IsMatch(hit.line))
            .Select(hit => $"{Path.GetRelativePath(library, hit.file)}:{hit.index + 1}: {hit.line.Trim()}")
            .ToList();

        Assert.True(hits.Count == 0, string.Join(Environment.NewLine, hits));
    }

    [GeneratedRegex(@"(?<=[""'>])#[0-9A-Fa-f]{3,8}(?=[""'<])")]
    private static partial Regex HexValue();
}
