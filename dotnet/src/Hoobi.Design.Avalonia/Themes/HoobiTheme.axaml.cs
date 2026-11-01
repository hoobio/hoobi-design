using Avalonia.Markup.Xaml;
using Avalonia.Styling;

namespace Hoobi.Design.Avalonia;

public class HoobiTheme : Styles
{
    public HoobiTheme(IServiceProvider? serviceProvider = null)
    {
        AvaloniaXamlLoader.Load(serviceProvider, this);
        Resources["HoobiDurationFaster"] = Motion.Faster;
        Resources["HoobiDurationFast"] = Motion.Fast;
        Resources["HoobiDurationNormal"] = Motion.Normal;
        Resources["HoobiDurationExpand"] = Motion.Expand;
    }
}
