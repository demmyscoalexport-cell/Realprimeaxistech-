import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Play } from "lucide-react";
import { withBase } from "@/lib/format";

export function VideoLightbox({
  open,
  onClose,
  title,
  thumbnailUrl,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  thumbnailUrl: string;
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl overflow-hidden border-0 bg-black p-0">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <div className="relative aspect-video">
          <img
            src={withBase(thumbnailUrl)}
            alt={title}
            className="h-full w-full object-cover opacity-60"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-t from-black/90 via-black/40 to-black/40 p-8 text-center text-white">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/10 backdrop-blur-md ring-1 ring-white/30">
              <Play className="h-7 w-7 fill-white text-white" />
            </div>
            <div className="font-display text-2xl font-bold text-balance md:text-3xl">
              {title}
            </div>
            <div className="text-sm text-white/60">
              Player preview — full video playback coming to PrimeAxis Tech.
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
