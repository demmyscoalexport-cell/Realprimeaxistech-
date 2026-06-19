import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { YouTubeEmbed } from "@/components/youtube-embed";
import { parseYouTubeVideoId } from "@/lib/youtube";
import { resolveMediaUrl } from "@/lib/format";

function isDirectVideoUrl(url: string): boolean {
  return /\.(mp4|webm|ogg)(\?|$)/i.test(url);
}

export function VideoLightbox({
  open,
  onClose,
  title,
  thumbnailUrl,
  videoUrl,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  thumbnailUrl: string;
  videoUrl?: string | null;
}) {
  const youTubeId = parseYouTubeVideoId(videoUrl);
  const directVideo = videoUrl && isDirectVideoUrl(videoUrl) ? videoUrl : null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-5xl overflow-hidden border hairline bg-background p-0">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        {youTubeId ? (
          <YouTubeEmbed videoId={youTubeId} title={title} autoplay />
        ) : directVideo ? (
          <div className="relative aspect-video bg-black">
            <video
              src={directVideo}
              controls
              autoPlay
              playsInline
              poster={thumbnailUrl ? resolveMediaUrl(thumbnailUrl, 1280) : undefined}
              className="h-full w-full"
            >
              <track kind="captions" />
            </video>
          </div>
        ) : videoUrl ? (
          <div className="relative aspect-video bg-black">
            <iframe
              src={videoUrl}
              title={title}
              className="absolute inset-0 h-full w-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="relative aspect-video bg-muted">
            {thumbnailUrl ? (
              <img
                src={resolveMediaUrl(thumbnailUrl, 1280)}
                alt={title}
                className="h-full w-full object-cover opacity-40"
              />
            ) : null}
            <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
              <p className="max-w-md text-sm text-muted-foreground">
                Playback is not available yet. Add a YouTube or direct MP4 URL in
                Sanity for this video.
              </p>
            </div>
          </div>
        )}
        <div className="border-t hairline px-5 py-4">
          <p className="font-display text-lg font-semibold tracking-tight">
            {title}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
