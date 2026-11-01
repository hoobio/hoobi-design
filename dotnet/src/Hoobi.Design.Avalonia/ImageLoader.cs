using Avalonia;
using Avalonia.Media;
using Avalonia.Media.Imaging;
using Avalonia.Threading;

namespace Hoobi.Design.Avalonia;

public sealed class RemoteImage : DrawingImage
{
    public bool HasFailed { get; private set; }

    public event EventHandler? Failed;

    public void MarkFailed()
    {
        HasFailed = true;
        Failed?.Invoke(this, EventArgs.Empty);
    }
}

public sealed class ImageLoader(HttpClient http, int capacity = 256)
{
    private readonly HttpClient _http = http ?? throw new ArgumentNullException(nameof(http));
    private readonly Dictionary<(Uri Uri, int? Width), LinkedListNode<((Uri Uri, int? Width) Key, RemoteImage Image)>> _cache = [];
    private readonly LinkedList<((Uri Uri, int? Width) Key, RemoteImage Image)> _recent = new();

    public double Scaling { get; set; } = 1;

    public RemoteImage Load(Uri uri, int? decodeWidth = null)
    {
        ArgumentNullException.ThrowIfNull(uri);
        var key = (uri, decodeWidth);
        if (_cache.TryGetValue(key, out var node))
        {
            _recent.Remove(node);
            _recent.AddFirst(node);
            return node.Value.Image;
        }

        var size = decodeWidth ?? 0;
        var image = new RemoteImage { Drawing = new ImageDrawing { Rect = new Rect(0, 0, size, size) } };
        _cache[key] = _recent.AddFirst((key, image));
        if (_cache.Count > capacity && _recent.Last is { } oldest)
        {
            _recent.RemoveLast();
            _cache.Remove(oldest.Value.Key);
        }

        _ = LoadAsync(key, image, Scaling);
        return image;
    }

    private static Bitmap Decode(byte[] bytes, int? decodeWidth)
    {
        using var stream = new MemoryStream(bytes);
        try
        {
            return decodeWidth is { } width ? Bitmap.DecodeToWidth(stream, width, BitmapInterpolationMode.HighQuality) : new Bitmap(stream);
        }
        catch (NullReferenceException ex)
        {
            // Avalonia.Skia 12.1.4 throws NullReferenceException when no codec recognises the bytes.
            throw new ArgumentException("The bytes are not an image Skia can decode.", nameof(bytes), ex);
        }
    }

    private async Task LoadAsync((Uri Uri, int? Width) key, RemoteImage image, double scaling)
    {
        try
        {
            var bytes = await _http.GetByteArrayAsync(key.Uri).ConfigureAwait(false);
            var bitmap = Decode(bytes, key.Width is { } width ? (int)Math.Ceiling(width * scaling) : null);
            await Dispatcher.UIThread.InvokeAsync(() =>
            {
                var width = key.Width ?? bitmap.Size.Width;
                image.Drawing = new ImageDrawing { ImageSource = bitmap, Rect = new Rect(0, 0, width, width * bitmap.Size.Height / bitmap.Size.Width) };
            });
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException or ArgumentException or InvalidOperationException or IOException or NotSupportedException)
        {
            Dispatcher.UIThread.Post(() =>
            {
                if (_cache.TryGetValue(key, out var node) && ReferenceEquals(node.Value.Image, image))
                {
                    _cache.Remove(key);
                    _recent.Remove(node);
                }

                image.MarkFailed();
            });
        }
    }
}
