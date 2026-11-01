using Avalonia;
using Avalonia.Animation;
using Avalonia.Animation.Easings;
using Avalonia.Controls;
using Avalonia.Controls.Primitives;
using Avalonia.Controls.Shapes;
using Avalonia.Layout;
using Avalonia.Styling;
using Avalonia.VisualTree;

using FluentAvalonia.UI.Controls;

namespace Hoobi.Design.Avalonia.Tests;

public sealed class MotionTests(AvaloniaSession session)
{
    private static readonly (double, double, double, double) FastOutSlowIn = (0, 0, 0, 1);
    private static readonly string[] Segments = ["One", "Two"];

    [Fact]
    public void Motion_tokens_are_the_WinUI_values_and_match_the_resources() => session.Run(() =>
    {
        TimeSpan Ms(double ms) => Motion.Enabled ? TimeSpan.FromMilliseconds(ms) : TimeSpan.Zero;
        Assert.Equal(Ms(83), Motion.Faster);
        Assert.Equal(Ms(167), Motion.Fast);
        Assert.Equal(Ms(250), Motion.Normal);
        Assert.Equal(Ms(333), Motion.Expand);
        Assert.Equal(Motion.Faster, AvaloniaSession.Resource<TimeSpan>("HoobiDurationFaster"));
        Assert.Equal(Motion.Fast, AvaloniaSession.Resource<TimeSpan>("HoobiDurationFast"));
        Assert.Equal(Motion.Normal, AvaloniaSession.Resource<TimeSpan>("HoobiDurationNormal"));
        Assert.Equal(Motion.Expand, AvaloniaSession.Resource<TimeSpan>("HoobiDurationExpand"));
        Assert.Equal(FastOutSlowIn, Spline(Motion.Decelerate));
        Assert.Equal((1d, 0d, 1d, 1d), Spline(Motion.Accelerate));
        Assert.Equal((0.1, 0.9, 0.2, 1d), Spline(Motion.PointToPoint));
        Assert.Equal((1d, 1d, 0d, 1d), Spline(Motion.Collapse));
        Assert.Equal(Spline(Motion.PointToPoint), Spline(AvaloniaSession.Resource<SplineEasing>("HoobiEasePointToPoint")));
        Assert.Equal(Spline(Motion.Collapse), Spline(AvaloniaSession.Resource<SplineEasing>("HoobiEaseCollapse")));
    });

    [Fact]
    public void A_toggle_switch_fades_and_sizes_its_knob_over_83ms_and_slides_it_over_167ms() => session.Run(() =>
    {
        var toggle = new ToggleSwitch();
        var window = Host(toggle);
        try
        {
            var slide = Assert.IsType<DoubleTransition>(Assert.Single(toggle.KnobTransitions!));
            Assert.Equal((Motion.Fast, FastOutSlowIn), (slide.Duration, Spline(slide.Easing)));
            foreach (var knob in Parts<Ellipse>(toggle, "SwitchKnobOn", "SwitchKnobOff"))
            {
                Assert.All(knob.Transitions!.OfType<TransitionBase>(), size => Assert.Equal((Motion.Faster, FastOutSlowIn), (size.Duration, Spline(size.Easing))));
            }

            var outer = Parts<Border>(toggle, "OuterBorder").Single();
            var fill = Recorder(outer, Border.BackgroundProperty);
            ((IPseudoClasses)toggle.Classes).Add(":pointerover");
            AvaloniaSession.Pump();
            Assert.Equal((Motion.Faster, FastOutSlowIn), (fill[^1]!.Duration, Spline(fill[^1]!.Easing)));
        }
        finally
        {
            window.Close();
        }
    });

    [Fact]
    public void A_fluent_slider_thumb_scales_over_250ms_on_hover_and_167ms_back() => session.Run(() =>
    {
        var slider = new Slider { Orientation = Orientation.Vertical, Height = 120 };
        var window = Host(slider);
        try
        {
            var thumb = slider.GetVisualDescendants().OfType<Thumb>().Single();
            var inner = Parts<Ellipse>(slider, "SliderInnerThumb").Single();
            var scale = Recorder(inner, Visual.RenderTransformProperty);
            ((IPseudoClasses)thumb.Classes).Add(":pointerover");
            AvaloniaSession.Pump();
            Assert.Equal(Motion.Normal, scale[^1]!.Duration);
            ((IPseudoClasses)thumb.Classes).Remove(":pointerover");
            AvaloniaSession.Pump();
            Assert.Equal((Motion.Fast, FastOutSlowIn), (scale[^1]!.Duration, Spline(scale[^1]!.Easing)));
        }
        finally
        {
            window.Close();
        }
    });

    [Fact]
    public void A_chevron_opens_over_333ms_and_closes_over_167ms() => session.Run(() =>
    {
        var chevron = new TextBlock { Classes = { "Chevron" } };
        var button = new ToggleButton { Classes = { "Chevron" }, Content = chevron };
        var window = Host(button);
        try
        {
            var turn = Recorder(chevron, Visual.RenderTransformProperty);
            button.IsChecked = true;
            AvaloniaSession.Pump();
            Assert.Equal((Motion.Expand, FastOutSlowIn), (turn[^1]!.Duration, Spline(turn[^1]!.Easing)));
            button.IsChecked = false;
            AvaloniaSession.Pump();
            Assert.Equal((Motion.Fast, Spline(Motion.Collapse)), (turn[^1]!.Duration, Spline(turn[^1]!.Easing)));
        }
        finally
        {
            window.Close();
        }
    });

    [Fact]
    public void A_settings_card_chevron_follows_the_expander_timings() => session.Run(() =>
    {
        var card = new SettingsCard { Header = "Installs", IsClickEnabled = true, IsExpanded = false, ExpandedContent = new Border { Height = 40 } };
        var window = Host(card);
        try
        {
            var chevron = Parts<TextBlock>(card, "PART_Chevron").Single();
            var turn = Recorder(chevron, Visual.RenderTransformProperty);
            card.RaiseClick();
            AvaloniaSession.Pump();
            Assert.Equal((Motion.Expand, FastOutSlowIn), (turn[^1]!.Duration, Spline(turn[^1]!.Easing)));
            card.RaiseClick();
            AvaloniaSession.Pump();
            Assert.Equal((Motion.Fast, Spline(Motion.Collapse)), (turn[^1]!.Duration, Spline(turn[^1]!.Easing)));
        }
        finally
        {
            window.Close();
        }
    });

    [Fact]
    public void A_segmented_item_presses_over_167ms_fast_out_slow_in() => session.Run(() =>
    {
        var segmented = new ListBox { Theme = AvaloniaSession.Resource<ControlTheme>("SegmentedStyle"), ItemsSource = Segments };
        var window = Host(segmented);
        try
        {
            var hover = Parts<Border>(segmented, "PART_Hover").First();
            var press = hover.Transitions!.OfType<TransformOperationsTransition>().Single();
            Assert.Equal((Motion.Fast, FastOutSlowIn), (press.Duration, Spline(press.Easing)));
        }
        finally
        {
            window.Close();
        }
    });

    [Fact]
    public void A_scroll_bar_expands_over_167ms_and_fades_over_83ms() => session.Run(() =>
    {
        var viewer = new ScrollViewer { Height = 100, Content = new Border { Height = 400 } };
        var window = Host(viewer);
        try
        {
            var bar = viewer.GetVisualDescendants().OfType<ScrollBar>().First(scrollBar => scrollBar.Orientation == Orientation.Vertical);
            var thumb = Parts<Rectangle>(viewer, "ThumbVisual").First();
            Assert.Equal(Motion.Faster, bar.Transitions!.OfType<DoubleTransition>().Single().Duration);
            Assert.Equal(Motion.Fast, thumb.Transitions!.OfType<TransformOperationsTransition>().Single().Duration);
            Assert.Equal(Motion.Faster, thumb.Transitions!.OfType<BrushTransition>().Single().Duration);
            Assert.All(Parts<Rectangle>(bar, "TrackRect"), track => Assert.Equal(Motion.Faster, track.Transitions!.OfType<DoubleTransition>().Single().Duration));
        }
        finally
        {
            window.Close();
        }
    });

    [Fact]
    public void A_dialog_fades_in_and_out_over_83ms() => session.Run(() =>
    {
        var window = new Window { Width = 800, Height = 600 };
        window.Show();
        var dialog = new FAContentDialog { Title = "Title", Content = "Body", CloseButtonText = "Close" };
        var shown = AppDialogs.ShowAsync(dialog, window);
        AvaloniaSession.WaitFor(() => dialog.IsLoaded);
        AvaloniaSession.CloseDialog(dialog, shown);
        window.Close();

        Assert.True(Application.Current!.TryGetResource(typeof(FAContentDialog), ThemeVariant.Dark, out var resource));
        var animations = Assert.IsType<ControlTheme>(resource).Children.OfType<Style>().SelectMany(style => style.Animations).OfType<Animation>().ToList();
        var fades = animations.Where(animation => animation.Children.Any(frame => frame.Setters.OfType<Setter>().Any(setter => setter.Property == Visual.OpacityProperty))).ToList();
        Assert.Equal(2, fades.Count);
        Assert.All(fades, fade => Assert.Equal(TimeSpan.FromMilliseconds(83), fade.Duration));
        Assert.Equal([TimeSpan.FromMilliseconds(167), TimeSpan.FromMilliseconds(250)], animations.Except(fades).Select(scale => scale.Duration).Order());
    });

    private static (double, double, double, double) Spline(Easing? easing)
    {
        var spline = Assert.IsType<SplineEasing>(easing);
        return (spline.X1, spline.Y1, spline.X2, spline.Y2);
    }

    private static IEnumerable<T> Parts<T>(Visual root, params string[] names)
        where T : Control => root.GetVisualDescendants().OfType<T>().Where(part => names.Contains(part.Name));

    private static List<TransitionBase?> Recorder(Visual target, AvaloniaProperty property)
    {
        var seen = new List<TransitionBase?>();
        target.PropertyChanged += (_, e) =>
        {
            if (e.Property == property)
            {
                seen.Add(target.Transitions?.OfType<TransitionBase>().FirstOrDefault(transition => transition.Property == property));
            }
        };
        return seen;
    }

    private static Window Host(Control content)
    {
        var window = new Window { Width = 400, Height = 300, Content = content };
        window.Show();
        AvaloniaSession.Pump();
        return window;
    }
}
