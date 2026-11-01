using Avalonia.Controls;

namespace Hoobi.Design.Gallery;

public partial class ActionsPage : UserControl
{
    public ActionsPage()
    {
        InitializeComponent();
        PinnedStates.Apply(this);
    }
}
