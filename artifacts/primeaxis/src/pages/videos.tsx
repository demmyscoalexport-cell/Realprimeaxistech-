import { useListVideos } from "@workspace/api-client-react";
import { VideoCard } from "@/components/cards";
import { VideoLightbox } from "@/components/video-lightbox";
import { useState } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";

export default function VideosPage() {
  const { data, isLoading } = useListVideos({ limit: 30 });
  const [video, setVideo] = useState<{
    title: string;
    thumbnailUrl: string;
    videoUrl?: string | null;
  } | null>(null);

  return (
    <>
      <section className="relative overflow-hidden border-b hairline bg-black">
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            background:
              "radial-gradient(50rem 30rem at 50% 0%, hsl(265 90% 65% / 0.4), transparent 60%)",
          }}
        />
        <div className="container-page py-20 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 font-mono text-[10px] uppercase tracking-widest backdrop-blur">
              <Play className="h-3 w-3 fill-white" /> PrimeAxis Watch
            </div>
            <h1 className="mx-auto mt-5 max-w-3xl font-display text-5xl font-bold leading-tight text-balance md:text-7xl">
              Long-form. Hands-on. <span className="gradient-text">Cinematic.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-white/70">
              Explainers, reviews, and field reports from the PrimeAxis video
              team. Made to watch full-screen.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="container-page py-16">
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-video animate-pulse rounded-2xl bg-muted"
              />
            ))}
          </div>
        ) : data && data.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.map((v, i) => (
              <VideoCard
                key={v.id}
                video={v}
                index={i}
                onPlay={() =>
                  setVideo({
                    title: v.title,
                    thumbnailUrl: v.thumbnailUrl,
                    videoUrl: v.videoUrl,
                  })
                }
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">No videos yet.</p>
        )}
      </section>

      <VideoLightbox
        open={!!video}
        onClose={() => setVideo(null)}
        title={video?.title ?? ""}
        thumbnailUrl={video?.thumbnailUrl ?? ""}
        videoUrl={video?.videoUrl}
      />
    </>
  );
}
