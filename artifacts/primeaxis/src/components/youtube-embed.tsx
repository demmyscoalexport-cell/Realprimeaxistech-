import { cn } from "@/lib/utils";
import { youTubeEmbedUrl } from "@/lib/youtube";

export function YouTubeEmbed({
  videoId,
  title,
  autoplay = false,
  className,
}: {
  videoId: string;
  title: string;
  autoplay?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("relative aspect-video overflow-hidden bg-black", className)}>
      <iframe
        src={youTubeEmbedUrl(videoId, autoplay)}
        title={title}
        className="absolute inset-0 h-full w-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    </div>
  );
}
