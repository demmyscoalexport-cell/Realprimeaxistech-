import { Link } from "wouter";
import { motion } from "framer-motion";
import { Mail, Building2, Globe2, Newspaper, Shield, Scale } from "lucide-react";
import termsHtml from "@/legal/terms-and-conditions.html?raw";

function extractTermsBody(html: string) {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  return (
    bodyMatch?.[1]?.trim() ??
    html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "").trim()
  );
}

const termsBodyHtml = extractTermsBody(termsHtml);

function PageHero({
  eyebrow,
  title,
  lede,
  icon: Icon,
}: {
  eyebrow: string;
  title: string;
  lede: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <section className="relative overflow-hidden border-b hairline">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(40rem 26rem at 15% 0%, hsl(var(--primary) / 0.18), transparent 60%)",
        }}
      />
      <div className="container-page relative py-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-primary">
            <Icon className="h-3.5 w-3.5" />
            {eyebrow}
          </div>
          <h1 className="mt-3 font-display text-5xl font-bold tracking-tight md:text-6xl">
            {title}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            {lede}
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function Prose({ children }: { children: React.ReactNode }) {
  return (
    <section className="container-page py-16">
      <div className="prose prose-neutral dark:prose-invert mx-auto max-w-4xl prose-headings:font-display prose-headings:tracking-tight prose-h2:mt-12 prose-h2:text-3xl prose-h3:text-xl prose-p:text-foreground/80 prose-p:leading-relaxed prose-a:text-primary prose-strong:text-foreground">
        {children}
      </div>
    </section>
  );
}

function TermsProse({ html }: { html: string }) {
  return (
    <section className="container-page py-16">
      <div
        className="termly-terms prose prose-neutral dark:prose-invert mx-auto max-w-4xl prose-headings:font-display prose-headings:tracking-tight prose-h1:text-4xl prose-h2:mt-12 prose-h2:text-2xl prose-h3:text-xl prose-p:text-foreground/80 prose-p:leading-relaxed prose-a:text-primary prose-strong:text-foreground prose-li:text-foreground/80"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </section>
  );
}

export function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About PrimeAxis"
        title="Reporting from the axis where technology meets the future."
        lede="PrimeAxis Tech is a global newsroom covering artificial intelligence, consumer hardware, mobility, robotics, security, and the culture being rebuilt by all of them."
        icon={Newspaper}
      />
      <Prose>
        <h2>Our mission</h2>
        <p>
          We exist to give curious, busy readers a clear, honest, and beautifully
          presented view of the world of technology — from the lab benches of
          frontier AI labs to the assembly lines shipping the next billion
          devices. We believe technology journalism should be useful, skeptical
          and humane in equal measure.
        </p>

        <h2>What we cover</h2>
        <p>
          Eleven beats, every day: AI, gadgets, gaming, electric vehicles, future
          tech, VR / AR, robotics, cybersecurity, startups, entertainment, and
          long-form reviews. Our writers and editors live around the world so
          coverage never sleeps.
        </p>

        <h2>How we work</h2>
        <p>
          Every story is reported by a named human writer and read by at least
          one editor before it ships. We use generative tools the way a film
          studio uses a digital backlot — for visuals, simulation, and scale —
          but the reporting, judgment, and analysis are always ours.
        </p>
        <p>
          AI-assisted features such as article summaries, generated visuals, and
          narrated audio are reviewed as part of our editorial workflow and are
          never a substitute for human accountability.
        </p>

        <h2>Get in touch</h2>
        <p>
          Tips, story ideas, corrections, and pitches all go to{" "}
          <a href="mailto:news@primeaxishq.com">
            news@primeaxishq.com
          </a>
          . Press and partnership requests:{" "}
          <a href="mailto:press@primeaxishq.com">press@primeaxishq.com</a>.
          For everything else, see <Link href="/contact">our contact page</Link>.
        </p>
      </Prose>
    </>
  );
}

export function ContactPage() {
  const channels = [
    {
      icon: Newspaper,
      title: "Newsroom & Tips",
      desc: "Confidential tips, story ideas, leaked documents.",
      email: "news@primeaxishq.com",
    },
    {
      icon: Mail,
      title: "Press & Partnerships",
      desc: "Media requests, interview bookings, brand collaborations.",
      email: "press@primeaxishq.com",
    },
    {
      icon: Building2,
      title: "Advertising",
      desc: "Sponsorships, brand studio, newsletter placements.",
      email: "advertise@primeaxishq.com",
    },
    {
      icon: Shield,
      title: "Corrections",
      desc: "Spot something off in a story? We want to know.",
      email: "corrections@primeaxishq.com",
    },
  ];
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Reach the newsroom."
        lede="We read everything that comes in — even if we can't always respond. The fastest path to the right person is choosing the inbox below."
        icon={Mail}
      />
      <section className="container-page py-16">
        <div className="grid gap-5 md:grid-cols-2">
          {channels.map((c) => (
            <a
              key={c.email}
              href={`mailto:${c.email}`}
              className="group relative overflow-hidden rounded-2xl border hairline bg-card/40 p-7 transition hover:bg-card"
            >
              <div className="flex items-center gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border hairline bg-background/60">
                  <c.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold">{c.title}</h3>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{c.desc}</p>
              <div className="mt-5 inline-flex items-center gap-2 font-mono text-xs text-foreground/80 transition group-hover:text-foreground">
                {c.email} →
              </div>
            </a>
          ))}
        </div>
        <div className="mt-12 grid gap-5 rounded-2xl border hairline bg-card/30 p-8 md:grid-cols-3">
          <div className="flex items-start gap-3">
            <Globe2 className="h-5 w-5 text-primary" />
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Headquarters
              </div>
              <div className="mt-1 text-sm">
                PrimeAxis Tech Media, Inc.
                <br />
                228 Broadway, Floor 14
                <br />
                New York, NY 10038
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Globe2 className="h-5 w-5 text-primary" />
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                London Bureau
              </div>
              <div className="mt-1 text-sm">
                10 Brick Lane
                <br />
                London E1 6RF
                <br />
                United Kingdom
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Globe2 className="h-5 w-5 text-primary" />
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Asia Pacific
              </div>
              <div className="mt-1 text-sm">
                Marunouchi 2-4-1
                <br />
                Chiyoda-ku, Tokyo
                <br />
                100-6390 Japan
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Privacy Policy"
        title="What we collect, why, and how to control it."
        lede="Last updated May 16, 2026. This policy describes how PrimeAxis Tech Media, Inc. handles personal information for visitors to primeaxishq.com and subscribers to our newsletters."
        icon={Shield}
      />
      <Prose>
        <h2>1. Information we collect</h2>
        <p>
          We collect three categories of information: (a) information you give
          us directly, such as your email address when you subscribe to a
          newsletter or send us a tip; (b) information collected automatically
          when you visit, such as device type, browser, referring page, and
          general geographic region; and (c) information from cookies and
          similar technologies used for session continuity, security, and
          analytics.
        </p>

        <h2>2. How we use it</h2>
        <p>
          We use this information to deliver the site, send the newsletters you
          ask for, understand which stories matter to readers, prevent abuse,
          and meet our legal obligations. We do not sell personal information.
        </p>

        <h2>3. Cookies & analytics</h2>
        <p>
          We use a small number of first-party cookies for essentials such as
          theme preference, and we use privacy-respecting analytics that record
          page views in aggregate. You can clear cookies at any time in your
          browser, and our analytics honor the Global Privacy Control signal.
        </p>

        <h2>4. Sharing</h2>
        <p>
          We share information with vetted service providers who help us operate
          the site (hosting, email delivery, error monitoring) under contracts
          that limit their use to those purposes. We will disclose information
          if required by law or to protect the safety of our readers or staff.
        </p>

        <h2>5. Your rights</h2>
        <p>
          Depending on where you live, you may have the right to access,
          correct, port, or delete personal information we hold about you, and
          to object to certain processing. To exercise any of these rights,
          email{" "}
          <a href="mailto:privacy@primeaxishq.com">
            privacy@primeaxishq.com
          </a>
          .
        </p>

        <h2>6. Children</h2>
        <p>
          PrimeAxis Tech is not directed to children under 16, and we do not
          knowingly collect their personal information.
        </p>

        <h2>7. Changes</h2>
        <p>
          We may update this policy as the product evolves; material changes
          will be highlighted at the top of this page for at least 30 days.
        </p>
      </Prose>
    </>
  );
}

export function TermsPage() {
  return (
    <>
      <PageHero
        eyebrow="Terms and Conditions"
        title="The agreement between you and PAWRA LLC."
        lede="Last updated June 05, 2026. PAWRA LLC, doing business as Primeaxistech, provides these Legal Terms governing your access to our Services. By using the Services, you agree to be bound by all of these terms."
        icon={Scale}
      />
      <TermsProse html={termsBodyHtml} />
    </>
  );
}
