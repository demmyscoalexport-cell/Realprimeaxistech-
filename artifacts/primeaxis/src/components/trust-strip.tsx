import { ShieldCheck, Scale, FileSearch, Users } from "lucide-react";

const ITEMS = [
  {
    icon: ShieldCheck,
    title: "Independently reported",
    body: "No advertiser influences a story. Sponsorships are clearly marked.",
  },
  {
    icon: Scale,
    title: "Editorial standards",
    body: "Sources verified. Claims checked. Corrections published in full.",
  },
  {
    icon: FileSearch,
    title: "Open methodology",
    body: "Every review explains how it was tested, for how long, and on what.",
  },
  {
    icon: Users,
    title: "Reader-supported",
    body: "Funded by subscribers and partners — never by tracking your data.",
  },
];

export function TrustStrip() {
  return (
    <section className="container-page py-16">
      <div className="grid gap-6 rounded-3xl border hairline bg-card/30 p-8 md:grid-cols-4 md:p-12">
        {ITEMS.map((it) => (
          <div key={it.title}>
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border hairline bg-card">
              <it.icon className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-4 font-display text-base font-semibold">
              {it.title}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">{it.body}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
