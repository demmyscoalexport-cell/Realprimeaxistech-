import { Link } from "wouter";
import { ArrowLeft, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative flex min-h-[80vh] items-center justify-center overflow-hidden">
      <div className="dark:glow-aurora glow-aurora-light pointer-events-none absolute inset-0 -z-10" />
      <div className="container-page text-center">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border hairline bg-card/60 px-3 py-1 font-mono text-[10px] uppercase tracking-widest">
          <Compass className="h-3 w-3 text-primary" /> 404
        </div>
        <h1 className="mt-6 font-display text-6xl font-bold leading-none md:text-8xl">
          Off the <span className="gradient-text">axis.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-muted-foreground">
          The page you were looking for is not here. The story it would have
          told might still be on the homepage.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition hover:scale-[1.02]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to the homepage
        </Link>
      </div>
    </div>
  );
}
