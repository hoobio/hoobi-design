using System.Net;

using Avalonia;
using Avalonia.Media;
using Avalonia.Media.Imaging;

namespace Hoobi.Design.Avalonia.Tests;

public sealed class ImageLoaderTests(AvaloniaSession session)
{
    [Fact]
    public void The_cache_keeps_the_most_recent_images_up_to_its_capacity() => session.Run(() =>
    {
        using var http = new HttpClient(new Stub(_ => new HttpResponseMessage(HttpStatusCode.OK) { Content = new ByteArrayContent(Png()) }));
        var loader = new ImageLoader(http, capacity: 2);
        var first = loader.Load(Url(1));
        var second = loader.Load(Url(2));
        Assert.Same(first, loader.Load(Url(1)));
        loader.Load(Url(3));

        Assert.Same(first, loader.Load(Url(1)));
        Assert.NotSame(second, loader.Load(Url(2)));
        AvaloniaSession.WaitFor(() => first.Drawing is ImageDrawing { ImageSource: not null });
        Assert.False(first.HasFailed);
    });

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public void A_failed_load_marks_the_image_failed_and_the_icon_falls_back(bool notFound) => session.Run(() =>
    {
        using var http = new HttpClient(new Stub(_ => notFound
            ? new HttpResponseMessage(HttpStatusCode.NotFound)
            : new HttpResponseMessage(HttpStatusCode.OK) { Content = new ByteArrayContent([1, 2, 3, 4]) }));
        var loader = new ImageLoader(http);
        var fallback = new DrawingImage();
        var icon = new IconImage { FallbackSource = fallback };
        var failures = 0;
        icon.Failed += (_, _) => failures++;
        var image = loader.Load(Url(1), decodeWidth: 16);
        icon.Source = image;

        AvaloniaSession.WaitFor(() => image.HasFailed);
        AvaloniaSession.Pump();
        Assert.Equal(1, failures);
        Assert.Same(fallback, icon.Source);
        Assert.NotSame(image, loader.Load(Url(1), decodeWidth: 16));
    });

    [Fact]
    public void An_icon_given_an_image_that_already_failed_falls_back() => session.Run(() =>
    {
        var fallback = new DrawingImage();
        var failed = new RemoteImage();
        failed.MarkFailed();
        var icon = new IconImage { FallbackSource = fallback, Source = failed };
        AvaloniaSession.Pump();
        Assert.Same(fallback, icon.Source);
    });

    private static Uri Url(int index) => new($"https://example.com/{index}.png");

    private static byte[] Png()
    {
        using var bitmap = new RenderTargetBitmap(new PixelSize(4, 4));
        using var stream = new MemoryStream();
        bitmap.Save(stream, PngBitmapEncoderOptions.Default);
        return stream.ToArray();
    }

    private sealed class Stub(Func<HttpRequestMessage, HttpResponseMessage> respond) : HttpMessageHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken) =>
            Task.FromResult(respond(request));
    }
}
