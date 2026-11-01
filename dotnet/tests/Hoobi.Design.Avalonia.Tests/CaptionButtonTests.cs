using Avalonia.Controls;
using Avalonia.Media;
using Avalonia.VisualTree;

using FluentAvalonia.UI.Controls;

namespace Hoobi.Design.Avalonia.Tests;

public sealed class CaptionButtonTests(AvaloniaSession session)
{
    [Theory]
    [InlineData("HoobiWindowDecorations", true, "HoobiTextColor")]
    [InlineData("HoobiWindowDecorations", false, "HoobiTextMuteColor")]
    [InlineData("HoobiCloseOnlyDecorations", true, "HoobiTextColor")]
    [InlineData("HoobiCloseOnlyDecorations", false, "HoobiTextMuteColor")]
    public void Caption_glyphs_take_the_text_colour_and_dim_while_inactive(string theme, bool active, string colour) => session.Run(() =>
    {
        var window = DecorationsPreview.Show(theme, active);
        try
        {
            var expected = AvaloniaSession.Resource<Color>(colour);
            var buttons = window.GetVisualDescendants().OfType<Button>().Where(button => button.Classes.Contains("CaptionButton")).ToList();
            Assert.NotEmpty(buttons);
            Assert.All(buttons, button =>
            {
                var glyph = button.GetVisualDescendants().OfType<FAFontIcon>().Single();
                Assert.Equal(expected, Assert.IsAssignableFrom<ISolidColorBrush>(glyph.Foreground).Color);
                Assert.Equal(48, button.Bounds.Width);
            });
        }
        finally
        {
            window.Close();
        }
    });
}
