using Avalonia;
using Avalonia.Controls;
using Avalonia.Controls.Primitives;
using Avalonia.Layout;

namespace Hoobi.Design.Avalonia.Tests;

public sealed class PopupGapTests(AvaloniaSession session)
{
    private static readonly Rect Target = new(100, 100, 80, 32);

    [Theory]
    [InlineData(PlacementMode.Bottom, 100, 132, PopupSide.Below)]
    [InlineData(PlacementMode.BottomEdgeAlignedLeft, 100, 136, PopupSide.Below)]
    [InlineData(PlacementMode.BottomEdgeAlignedRight, 100, 0, PopupSide.Above)]
    [InlineData(PlacementMode.BottomEdgeAlignedLeft, 100, 4, PopupSide.Above)]
    [InlineData(PlacementMode.Top, 100, 0, PopupSide.Above)]
    [InlineData(PlacementMode.TopEdgeAlignedLeft, 100, 132, PopupSide.Below)]
    [InlineData(PlacementMode.Right, 180, 100, PopupSide.Right)]
    [InlineData(PlacementMode.RightEdgeAlignedTop, 0, 100, PopupSide.Left)]
    [InlineData(PlacementMode.Left, 0, 100, PopupSide.Left)]
    [InlineData(PlacementMode.LeftEdgeAlignedBottom, 180, 100, PopupSide.Right)]
    [InlineData(PlacementMode.Pointer, 100, 132, PopupSide.None)]
    [InlineData(PlacementMode.Center, 100, 132, PopupSide.None)]
    public void The_gap_side_is_where_the_popup_ended_up(PlacementMode placement, double x, double y, PopupSide side) =>
        Assert.Equal(side, PopupGap.Side(placement, Target, new Rect(x, y, 100, 100)));

    [Theory]
    [InlineData(PopupSide.Below, 0, 4)]
    [InlineData(PopupSide.Above, 0, -4)]
    [InlineData(PopupSide.Right, 4, 0)]
    [InlineData(PopupSide.Left, -4, 0)]
    [InlineData(PopupSide.None, 0, 0)]
    public void The_gap_points_away_from_the_target(PopupSide side, double x, double y) =>
        Assert.Equal(new Vector(x, y), PopupGap.Offset(side, 4));

    [Theory]
    [InlineData(40, true)]
    [InlineData(440, false)]
    public void A_menu_keeps_a_4px_gap_from_its_button_whichever_way_it_opens(double top, bool below) => session.Run(() =>
    {
        var menu = new MenuFlyout { Placement = PlacementMode.BottomEdgeAlignedLeft, Items = { new MenuItem { Header = "One" }, new MenuItem { Header = "Two" }, new MenuItem { Header = "Three" } } };
        var button = new Button { Content = "More", Flyout = menu, Margin = new Thickness(40, top, 0, 0), HorizontalAlignment = HorizontalAlignment.Left, VerticalAlignment = VerticalAlignment.Top };
        var window = new Window { Width = 400, Height = 480, Content = button };
        window.Show();
        AvaloniaSession.Pump();
        menu.ShowAt(button);
        AvaloniaSession.Pump(8);

        var presenter = Assert.IsType<MenuFlyoutPresenter>(window.OpenedPopups.Single().Child);
        var bounds = new Rect(presenter.TranslatePoint(default, window)!.Value, presenter.Bounds.Size);
        var anchor = new Rect(button.TranslatePoint(default, window)!.Value, button.Bounds.Size);
        Assert.Equal(default, presenter.Margin);
        Assert.Null(presenter.RenderTransform);
        Assert.Equal(4, below ? bounds.Top - anchor.Bottom : anchor.Top - bounds.Bottom, 1);

        menu.Hide();
        window.Close();
    });
}
