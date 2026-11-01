using Avalonia;
using Avalonia.Controls;
using Avalonia.Controls.Presenters;
using Avalonia.Media;
using Avalonia.Threading;
using Avalonia.VisualTree;

namespace Hoobi.Design.Avalonia.Tests;

public sealed class TintedButtonTests(AvaloniaSession session)
{
    [Fact]
    public void Shading_mixes_toward_the_ground_and_keeps_alpha()
    {
        var shaded = ColorShade.Mix(Color.FromArgb(0x80, 200, 100, 0), Color.FromRgb(0, 0, 100), 0.25);

        Assert.Equal(Color.FromArgb(0x80, 150, 75, 25), shaded);
    }

    [Fact]
    public void A_tinted_button_hovers_and_presses_to_darker_shades_of_its_own_fill() => session.Run(() =>
    {
        var red = AvaloniaSession.Resource<Color>("HoobiDangerColor");
        var ground = AvaloniaSession.Resource<Color>("HoobiBgColor");
        var button = new Button { Classes = { "Tinted" }, Width = 56, Height = 56, Background = new SolidColorBrush(red) };
        var window = new Window { Content = button };
        window.Show();
        Dispatcher.UIThread.RunJobs();
        var presenter = button.GetVisualDescendants().OfType<ContentPresenter>().First(found => found.Name == "PART_ContentPresenter");
        Color Fill() => ((ISolidColorBrush)presenter.GetBaseValue(ContentPresenter.BackgroundProperty).GetValueOrDefault()!).Color;
        var pseudo = (IPseudoClasses)button.Classes;
        try
        {
            var rest = Fill();
            pseudo.Add(":pointerover");
            var over = Fill();
            pseudo.Add(":pressed");
            var pressed = Fill();

            Assert.Equal(red, rest);
            Assert.Equal(ColorShade.Mix(red, ground, 0.2), over);
            Assert.Equal(ColorShade.Mix(red, ground, 0.32), pressed);
        }
        finally
        {
            window.Close();
        }
    });
}
