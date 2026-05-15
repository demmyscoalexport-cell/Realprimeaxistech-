import {
  db,
  categoriesTable,
  authorsTable,
  articlesTable,
  reviewsTable,
  videosTable,
  newslettersTable,
  type ArticleBlock,
  type ReviewRating,
  type ReviewSection,
} from "@workspace/db";

const IMG = (name: string) => `/seed/${name}`;

const categoriesSeed = [
  {
    slug: "ai",
    name: "AI",
    description:
      "The intelligence economy, large model research, and the technologies redefining what software can do.",
    accentColor: "#22d3ee",
  },
  {
    slug: "gadgets",
    name: "Gadgets",
    description:
      "Phones, laptops, wearables, and the consumer hardware shaping how we live and work.",
    accentColor: "#a78bfa",
  },
  {
    slug: "gaming",
    name: "Gaming",
    description:
      "Consoles, PC, streaming, and the studios building the next decade of interactive entertainment.",
    accentColor: "#f472b6",
  },
  {
    slug: "startups",
    name: "Startups",
    description:
      "Founders, funding, and the companies racing to define the next platform shift.",
    accentColor: "#34d399",
  },
  {
    slug: "future-tech",
    name: "Future Tech",
    description:
      "Quantum, robotics, biotech, and the long-horizon science that will rewrite the next century.",
    accentColor: "#60a5fa",
  },
  {
    slug: "ev",
    name: "EV & Mobility",
    description:
      "Electric vehicles, autonomy, and the transformation of how the world moves.",
    accentColor: "#fbbf24",
  },
  {
    slug: "cybersecurity",
    name: "Cybersecurity",
    description:
      "Threats, defenders, and the geopolitics of the modern digital battlefield.",
    accentColor: "#f87171",
  },
  {
    slug: "robotics",
    name: "Robotics",
    description:
      "Humanoids, automation, and the machines moving from labs into everyday life.",
    accentColor: "#c084fc",
  },
  {
    slug: "vr-ar",
    name: "VR / AR",
    description:
      "Spatial computing, mixed reality headsets, and the next interface revolution.",
    accentColor: "#38bdf8",
  },
  {
    slug: "entertainment",
    name: "Entertainment",
    description:
      "Streaming, creators, and the platforms redefining global media.",
    accentColor: "#fb7185",
  },
];

const authorsSeed = [
  {
    slug: "amelia-okafor",
    name: "Amelia Okafor",
    role: "Editor-in-Chief",
    avatarUrl: IMG("avatar-1.png"),
    bio: "Two decades covering the intersection of technology, power, and culture. Previously senior editor at three global publications.",
    twitter: "amelia",
  },
  {
    slug: "daniel-reyes",
    name: "Daniel Reyes",
    role: "Senior AI Correspondent",
    avatarUrl: IMG("avatar-2.png"),
    bio: "Tracks frontier AI research, the chips that power it, and the labs racing to deploy it.",
    twitter: "danielreyes",
  },
  {
    slug: "yuki-tanaka",
    name: "Yuki Tanaka",
    role: "Reviews Editor",
    avatarUrl: IMG("avatar-3.png"),
    bio: "Tests every flagship that lands on the desk. Believes in long-term verdicts over launch-day hype.",
    twitter: "yukitanaka",
  },
  {
    slug: "marcus-bennett",
    name: "Marcus Bennett",
    role: "Investigations Lead",
    avatarUrl: IMG("avatar-4.png"),
    bio: "Long-form investigations across cybersecurity, antitrust, and the global semiconductor supply chain.",
    twitter: "mbennett",
  },
];

const newslettersSeed = [
  {
    slug: "the-axis",
    name: "The Axis",
    tagline:
      "A morning briefing on the technology stories shaping the global agenda. Sent every weekday at 06:00 GMT.",
    cadence: "Daily",
    accentColor: "#22d3ee",
    subscriberCount: 184_212,
  },
  {
    slug: "model-context",
    name: "Model Context",
    tagline:
      "A weekly deep read on AI research, the labs racing to deploy it, and the people building the future of intelligence.",
    cadence: "Weekly",
    accentColor: "#a78bfa",
    subscriberCount: 96_540,
  },
  {
    slug: "the-spec-sheet",
    name: "The Spec Sheet",
    tagline:
      "Our reviews team's verdicts on the gadgets actually worth your money — before you buy.",
    cadence: "Weekly",
    accentColor: "#f472b6",
    subscriberCount: 142_900,
  },
  {
    slug: "deep-current",
    name: "Deep Current",
    tagline:
      "Long-form investigations and ambitious essays from the PrimeAxis newsroom.",
    cadence: "Monthly",
    accentColor: "#34d399",
    subscriberCount: 51_320,
  },
];

type ArticleSeed = {
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  heroImageUrl: string;
  categorySlug: string;
  authorSlug: string;
  publishedAt: Date;
  updatedAt: Date;
  readingMinutes: number;
  tags: string[];
  body: ArticleBlock[];
  keyTakeaways: string[];
  aiSummary: string;
  viewCount: number;
  commentCount: number;
  isBreaking: boolean;
  isFeature: boolean;
  section: string;
};

const now = Date.now();
const hoursAgo = (h: number) => new Date(now - h * 3600_000);

const para = (content: string): ArticleBlock => ({ type: "paragraph", content });
const heading = (content: string): ArticleBlock => ({ type: "heading", content });
const quote = (content: string): ArticleBlock => ({ type: "quote", content });
const image = (url: string, caption: string): ArticleBlock => ({
  type: "image",
  content: url,
  caption,
});
const list = (items: string[]): ArticleBlock => ({
  type: "list",
  content: "",
  items,
});

const articlesSeed: ArticleSeed[] = [
  {
    slug: "the-machine-that-thinks",
    title:
      "The Machine That Thinks: Inside the Model That Just Crossed a Reasoning Threshold",
    subtitle:
      "A new generation of frontier systems is collapsing the gap between language and reasoning. Our six-month investigation goes inside the labs, the chips, and the politics shaping what comes next.",
    excerpt:
      "Researchers at three of the world's leading AI laboratories say the latest generation of reasoning models has crossed a threshold that even their architects did not expect to reach this decade.",
    heroImageUrl: IMG("hero-ai-neural.png"),
    categorySlug: "ai",
    authorSlug: "daniel-reyes",
    publishedAt: hoursAgo(3),
    updatedAt: hoursAgo(1),
    readingMinutes: 14,
    tags: ["frontier-models", "research", "investigation"],
    keyTakeaways: [
      "The newest reasoning models match expert humans on a closed benchmark of long-horizon problems for the first time.",
      "Compute requirements are doubling roughly every nine months, faster than any prior platform shift.",
      "Three of the four leading labs now route inference through custom silicon they did not own twelve months ago.",
      "Regulators in the EU, US, and China are quietly converging on a shared classification framework — for the first time.",
    ],
    aiSummary:
      "A new tier of reasoning-first AI systems has crossed a benchmark threshold ahead of schedule. Compute, custom silicon, and a quietly converging global policy framework are reshaping the competitive landscape — and the technology's risk profile.",
    body: [
      para(
        "On a Tuesday morning in late February, a small group of researchers at one of the world's three leading AI laboratories sat down to score the output of their newest model against a sealed benchmark they had been working on for nineteen months. The benchmark — never published, never shown to the model in any form — was designed to be unsolvable by any system that could not, in some functional sense, reason.",
      ),
      para(
        "By lunchtime, the model had crossed the threshold the researchers had quietly circulated in internal memos for almost a year. By the end of the week, two other laboratories had reproduced the result on systems of their own. None of them had expected this to happen in 2026.",
      ),
      heading("A threshold no one expected to cross this decade"),
      para(
        "For the better part of three years, the conversation inside frontier AI laboratories has been dominated by a single question: when, if ever, would models stop merely retrieving plausible answers and begin actually reasoning their way to new ones? The honest answer, until very recently, was that no one knew.",
      ),
      quote(
        "We were planning for 2028. We were planning the office space for the team that would work on this in 2028. The model crossed it on a Tuesday in February.",
      ),
      para(
        "What the labs have built is not a more confident chatbot. It is a system that can hold a problem in working memory for hours, decompose it, attempt approaches, recognize its own dead ends, and route around them. To the engineers who have spent the last decade building the previous generation, watching it work feels less like an upgrade than like a phase change.",
      ),
      image(IMG("article-chip.png"), "A new generation of inference silicon underwrites every reasoning step."),
      heading("The silicon underneath"),
      para(
        "None of this would be possible on the chips that powered the last generation of frontier models. Three of the four leading laboratories now run inference through custom silicon they did not own a year ago — chips designed in-house, fabbed in three different countries, and routed through a software stack that almost no one outside the labs has ever seen.",
      ),
      list([
        "Custom inference silicon now accounts for a majority of compute at three of four leading labs.",
        "Power consumption per query has fallen 11x in eighteen months — but total compute has risen faster.",
        "Memory bandwidth, not flops, is the binding constraint at the new scale.",
      ]),
      heading("The politics of intelligence"),
      para(
        "Quietly, and almost without anyone noticing, regulators in the EU, the United States, and China have spent the past nine months converging on something close to a shared classification framework for frontier systems. None of them will say so publicly. All of them are using the same vocabulary in their internal documents.",
      ),
      para(
        "What happens next depends less on the technology than on whether the institutions built to govern it can move at the speed of the labs that built it. So far, the answer is: not yet, but closer than at any prior moment.",
      ),
    ],
    viewCount: 184_320,
    commentCount: 1240,
    isBreaking: true,
    isFeature: true,
    section: "ai",
  },
  {
    slug: "axis-ultra-laptop-review-deep-dive",
    title:
      "The Laptop That Finally Justifies Its Price",
    subtitle:
      "After six weeks of full-time use, the new flagship is the first machine in years that earns the word 'professional' without an asterisk.",
    excerpt:
      "Six weeks of full-time use, a thousand hours of testing, and one unambiguous verdict: this is the first portable workstation in years that doesn't require an apology.",
    heroImageUrl: IMG("hero-laptop.png"),
    categorySlug: "gadgets",
    authorSlug: "yuki-tanaka",
    publishedAt: hoursAgo(8),
    updatedAt: hoursAgo(8),
    readingMinutes: 9,
    tags: ["laptops", "review", "buying-guide"],
    keyTakeaways: [
      "Sustained performance under load is the highest we have ever measured on a portable.",
      "Battery life under realistic professional load comfortably clears a full working day.",
      "The new display is the first 4K OLED panel that does not visibly age after a month of use.",
    ],
    aiSummary:
      "After six weeks of intensive testing, the new flagship laptop sets a new bar for sustained performance, display quality, and battery life — at a price that, for once, is genuinely defensible.",
    body: [
      para(
        "There is a particular kind of laptop review that anyone who has read more than a few of them will recognize: the brand-new flagship arrives, the benchmarks look extraordinary, the verdict is breathless, and then six months later the chassis has discolored, the hinge has loosened, and nobody mentions it again. This is not that review.",
      ),
      heading("Six weeks, one thousand hours"),
      para(
        "We have been using this machine as our primary workstation for six weeks. It has traveled across three continents, sat through every video call we could throw at it, compiled a small but real piece of production software roughly four hundred times, and spent more nights on a hotel desk than we would care to count. It has not flinched once.",
      ),
      quote(
        "It is the first portable workstation we have tested where the words 'no compromises' are not, on closer inspection, hiding three of them.",
      ),
      heading("What it is not"),
      para(
        "It is not a gaming laptop. It is not the cheapest option in its class, and it never will be. And it is not the right machine for anyone whose primary workload is browsing email and watching video — at that price, it would be absurd. But for the audience it is built for, it is the most defensible purchase in the category.",
      ),
      list([
        "Sustained CPU performance: highest we have ever measured on a portable.",
        "Battery life under professional load: comfortably clears a full working day.",
        "Display: 4K OLED that genuinely holds up to a month of full-brightness use.",
      ]),
      para(
        "We will retest at the six-month and twelve-month marks. If anything changes, we will say so. For now: buy it, if it is the right machine for you. It almost certainly is.",
      ),
    ],
    viewCount: 92_140,
    commentCount: 643,
    isBreaking: false,
    isFeature: false,
    section: "reviews",
  },
  {
    slug: "the-flagship-phone-shootout-2026",
    title:
      "The Flagship Phone Shootout: Three Devices, One Honest Verdict",
    subtitle:
      "We tested every flagship released this quarter against a single benchmark: would we actually carry it.",
    excerpt:
      "A clean comparison of the three flagship phones released this quarter, judged on the only metric that ultimately matters: which one we kept reaching for after the testing was over.",
    heroImageUrl: IMG("article-phone.png"),
    categorySlug: "gadgets",
    authorSlug: "yuki-tanaka",
    publishedAt: hoursAgo(14),
    updatedAt: hoursAgo(14),
    readingMinutes: 7,
    tags: ["smartphones", "comparison", "buying-guide"],
    keyTakeaways: [
      "All three devices are excellent. The differences only emerge after a week of real use.",
      "Battery life and thermal management remain the cleanest dividing lines.",
      "Camera quality is now defined more by image processing than by sensor hardware.",
    ],
    aiSummary:
      "Three flagship phones, four weeks of real-world testing. Hardware differences are smaller than ever; software, thermals, and the cameras' processing pipelines are now the deciding factors.",
    body: [
      para(
        "There used to be a clear winner in any flagship phone comparison. There is not anymore. The hardware has converged so completely that, on paper, the three devices we tested this quarter are nearly indistinguishable.",
      ),
      heading("The benchmark that matters"),
      para(
        "We do not run synthetic benchmarks for flagship phones anymore. After the first week, every reviewer on this team carried each phone for a full week as their only device. The verdict at the end of three weeks is the verdict in this article.",
      ),
      list([
        "Phone A: best camera, best display, runs warm under load.",
        "Phone B: best battery, best software polish, camera is merely excellent.",
        "Phone C: best build, best haptics, weakest cellular performance in dense urban areas.",
      ]),
    ],
    viewCount: 73_510,
    commentCount: 412,
    isBreaking: false,
    isFeature: false,
    section: "reviews",
  },
  {
    slug: "the-ev-pricing-war-finally-arrives",
    title:
      "The EV Pricing War the Industry Has Been Dreading Has Finally Arrived",
    subtitle:
      "Three of the world's largest automakers cut sticker prices in the same week. The winners and losers will be different than anyone expects.",
    excerpt:
      "Three of the world's largest automakers cut prices in the same week. What looks like a margin disaster is actually the moment the EV market becomes the auto market.",
    heroImageUrl: IMG("article-ev.png"),
    categorySlug: "ev",
    authorSlug: "amelia-okafor",
    publishedAt: hoursAgo(20),
    updatedAt: hoursAgo(20),
    readingMinutes: 8,
    tags: ["ev", "industry", "analysis", "investigation"],
    keyTakeaways: [
      "The price cuts are larger and more coordinated than the public statements suggest.",
      "Battery cell costs have fallen below the threshold at which sticker-price parity with combustion vehicles is structurally inevitable.",
      "The traditional automakers most exposed to mid-market sedans are in the most precarious position.",
    ],
    aiSummary:
      "A coordinated wave of EV price cuts marks the structural moment when electric vehicles stop being a premium category and become the default. The industry's winners and losers are not the ones the headlines suggest.",
    body: [
      para(
        "The week the price cuts landed, three different executives on three different continents called the same analyst within four hours of each other. None of them wanted to be quoted. All of them said a version of the same sentence.",
      ),
      quote(
        "This is the moment the market resets. We have been planning for it for two years. It is still going to hurt.",
      ),
      heading("Why now"),
      para(
        "Battery cell costs have crossed a structural threshold. Below it, the sticker price of a competently engineered electric vehicle is structurally lower than the equivalent combustion car. Above it, you needed a subsidy or a story. The story era is ending.",
      ),
      heading("Who is exposed"),
      para(
        "The automakers most exposed are the ones that built their last decade around mid-market sedans. The automakers least exposed are, surprisingly, not the EV-only entrants — many of whom are just as squeezed — but the legacy manufacturers who quietly invested in their own cell supply chains five years before anyone thought it mattered.",
      ),
    ],
    viewCount: 61_240,
    commentCount: 528,
    isBreaking: false,
    isFeature: false,
    section: "ev",
  },
  {
    slug: "the-quantum-machine-in-the-basement",
    title:
      "The Quantum Machine in the Basement",
    subtitle:
      "A single research lab in Zurich just demonstrated the kind of error correction the industry has been promising for a decade.",
    excerpt:
      "For ten years, fault-tolerant quantum computing has been five years away. A small team in Zurich just showed why it might actually be here.",
    heroImageUrl: IMG("article-quantum.png"),
    categorySlug: "future-tech",
    authorSlug: "daniel-reyes",
    publishedAt: hoursAgo(28),
    updatedAt: hoursAgo(28),
    readingMinutes: 10,
    tags: ["quantum", "research", "investigation"],
    keyTakeaways: [
      "The Zurich result is the cleanest demonstration of logical qubit stability ever published.",
      "If reproducible at scale, the architecture would shorten the path to commercially useful quantum computing by years, not months.",
      "Three other labs are believed to be quietly attempting reproduction.",
    ],
    aiSummary:
      "A small Zurich lab has demonstrated logical qubit error correction at a quality and stability previously thought to be years away. If it scales, the timeline for commercially useful quantum computing collapses.",
    body: [
      para(
        "Quantum computing has spent the better part of a decade as a field defined less by what it has done than by what it has promised. The promise — fault-tolerant, scalable, commercially useful machines — has remained, by polite consensus, perpetually five years away.",
      ),
      heading("What just changed"),
      para(
        "Last month, a relatively small research group in Zurich published a result that, on its surface, looked technical enough to escape mainstream attention. Inside the field, it did not. Three different physicists, in three different time zones, sent us the same paper within a forty-eight-hour window with some variant of: this one is real.",
      ),
    ],
    viewCount: 42_870,
    commentCount: 318,
    isBreaking: false,
    isFeature: false,
    section: "future-tech",
  },
  {
    slug: "the-humanoid-that-folded-the-laundry",
    title:
      "The Humanoid That Folded the Laundry — and What It Actually Means",
    subtitle:
      "A short demo video set the internet on fire. The reality, on closer inspection, is more interesting than the hype.",
    excerpt:
      "The viral demo was real. The robot did fold the laundry. The interesting question — and the one nobody is asking — is what it took to get it there.",
    heroImageUrl: IMG("article-robot.png"),
    categorySlug: "robotics",
    authorSlug: "daniel-reyes",
    publishedAt: hoursAgo(36),
    updatedAt: hoursAgo(36),
    readingMinutes: 6,
    tags: ["robotics", "ai", "analysis"],
    keyTakeaways: [
      "The demo was real and unstaged.",
      "The training pipeline that produced it relied on a much larger volume of teleoperated demonstrations than the public framing suggested.",
      "Generalization to a new fabric type still requires meaningful retraining.",
    ],
    aiSummary:
      "A viral humanoid demo is genuine — but the training pipeline behind it reveals how much hand-curated human teleoperation still underpins consumer-facing robotics.",
    body: [
      para(
        "The video circulated for forty-eight hours before anyone in the field had a chance to comment on it. By then, the framing had hardened. A humanoid robot. A pile of laundry. A clean, unedited fold. The conclusion most viewers reached was that general-purpose home robotics had arrived.",
      ),
      para(
        "The truth is more interesting and, in some ways, more impressive. The demo was real. It was also the result of a training pipeline considerably more elaborate than the public framing suggested.",
      ),
    ],
    viewCount: 128_900,
    commentCount: 974,
    isBreaking: false,
    isFeature: false,
    section: "robotics",
  },
  {
    slug: "the-game-engine-of-the-next-decade",
    title:
      "The Game Engine of the Next Decade Is Already Here",
    subtitle:
      "A small studio in Helsinki is shipping the rendering technology the AAA industry has been promising for five years.",
    excerpt:
      "The technology the largest studios in the world have been promising for half a decade is already shipping — from a studio you have probably never heard of.",
    heroImageUrl: IMG("article-gaming.png"),
    categorySlug: "gaming",
    authorSlug: "amelia-okafor",
    publishedAt: hoursAgo(40),
    updatedAt: hoursAgo(40),
    readingMinutes: 7,
    tags: ["gaming", "engines", "analysis"],
    keyTakeaways: [
      "The Helsinki studio's renderer ships the global illumination quality the AAA industry has been promising since 2021.",
      "Frame timing under load is more consistent than the largest commercial engines.",
      "Licensing terms are deliberately disruptive.",
    ],
    aiSummary:
      "A small Helsinki studio is shipping a renderer that matches what the largest engines have been promising for years. The licensing model may matter as much as the technology.",
    body: [
      para(
        "Every year, the largest game studios in the world publish renderings of what their next engine will do. Every year, those renderings circulate on social media, generate a wave of excitement, and then quietly fail to ship. The cycle is so reliable that most of the industry has stopped paying attention.",
      ),
      heading("Why this one is different"),
      para(
        "A small studio in Helsinki, working largely in public for the past three years, has just shipped a renderer that does what the AAA engines keep promising: real-time global illumination at production frame rates, with content authoring tools that a small team can actually use.",
      ),
    ],
    viewCount: 56_120,
    commentCount: 387,
    isBreaking: false,
    isFeature: false,
    section: "gaming",
  },
  {
    slug: "the-supply-chain-that-built-the-future",
    title:
      "The Supply Chain That Built the Future — and the Geopolitics Trying to Break It",
    subtitle:
      "A six-month investigation into the dozen factories the entire technology industry depends on.",
    excerpt:
      "An exclusive six-month investigation into the small handful of factories the entire global technology industry quietly depends on — and the geopolitics now trying to fracture them.",
    heroImageUrl: IMG("article-cloud.png"),
    categorySlug: "cybersecurity",
    authorSlug: "marcus-bennett",
    publishedAt: hoursAgo(48),
    updatedAt: hoursAgo(48),
    readingMinutes: 16,
    tags: ["investigation", "supply-chain", "geopolitics"],
    keyTakeaways: [
      "The number of factories that produce the leading-edge components the industry depends on is smaller than is publicly understood.",
      "Replacement timelines for any one of them, in the event of disruption, are measured in years.",
      "Three governments are quietly funding domestic alternatives. None will be ready before 2029.",
    ],
    aiSummary:
      "Behind the global technology industry sits a remarkably small set of factories whose disruption no one is prepared for. A six-month investigation maps the supply chain — and the slow-motion crisis surrounding it.",
    body: [
      para(
        "Most of what the global technology industry sells, in any given quarter, depends on components produced in a remarkably small number of factories. The exact count, depending on how strictly you draw the lines, is somewhere between nine and fourteen. The publicly available count is comfortably higher. The publicly available count is wrong.",
      ),
      heading("Six months, four continents, twenty-eight sources"),
      para(
        "We spent six months mapping the actual production base. The reporting took us across four continents and through twenty-eight sources, more than half of whom would only speak on background. What follows is the cleanest picture of the situation we have ever been able to assemble.",
      ),
      quote(
        "If any one of them goes offline for more than a quarter, every consumer technology product you buy in the following year is going to be different. Probably worse. Definitely more expensive.",
      ),
    ],
    viewCount: 39_410,
    commentCount: 412,
    isBreaking: false,
    isFeature: false,
    section: "investigation",
  },
  {
    slug: "the-encryption-attack-no-one-saw-coming",
    title:
      "The Encryption Attack No One Saw Coming",
    subtitle:
      "A research team has demonstrated a side-channel attack that defeats one of the most widely deployed cryptographic libraries in the world.",
    excerpt:
      "A side-channel attack against one of the most widely deployed cryptographic libraries in the world. The patch is out. The exposure window was longer than anyone wants to admit.",
    heroImageUrl: IMG("article-cyber.png"),
    categorySlug: "cybersecurity",
    authorSlug: "marcus-bennett",
    publishedAt: hoursAgo(60),
    updatedAt: hoursAgo(60),
    readingMinutes: 8,
    tags: ["security", "cryptography", "investigation"],
    keyTakeaways: [
      "The attack is a timing side-channel against a library deployed on a meaningful fraction of the public internet.",
      "A patch shipped within seventy-two hours of disclosure.",
      "The realistic exposure window is longer than the seventy-two hours most outlets are reporting.",
    ],
    aiSummary:
      "A timing side-channel attack against a widely deployed cryptographic library has been disclosed and patched, but the realistic exposure window is longer than the headlines suggest.",
    body: [
      para(
        "A small team of cryptographers, working for nearly two years and operating under the kind of voluntary disclosure embargo that the security community has worked very hard to make functional, last week disclosed a timing side-channel attack against a library that, by their own count, sits underneath a meaningful fraction of the encrypted public internet.",
      ),
      heading("What the patch fixes — and what it does not"),
      para(
        "The patch is real. It works. It shipped within seventy-two hours of disclosure, which by the standards of this industry is genuinely fast. The exposure window before the patch — the period during which a sufficiently sophisticated attacker could have known about the vulnerability — is longer than seventy-two hours, and the honest reporting on this incident has to begin there.",
      ),
    ],
    viewCount: 88_410,
    commentCount: 623,
    isBreaking: false,
    isFeature: false,
    section: "investigation",
  },
  {
    slug: "the-startup-rebuilding-the-cloud",
    title:
      "The Startup Quietly Rebuilding the Cloud",
    subtitle:
      "A two-year-old company in Lisbon has just signed three of the world's largest enterprise customers.",
    excerpt:
      "A two-year-old company in Lisbon has signed three of the world's largest enterprise customers. Their pitch is the cloud, rebuilt for the AI workloads the existing cloud was never designed for.",
    heroImageUrl: IMG("article-cloud.png"),
    categorySlug: "startups",
    authorSlug: "amelia-okafor",
    publishedAt: hoursAgo(72),
    updatedAt: hoursAgo(72),
    readingMinutes: 6,
    tags: ["startups", "cloud", "ai"],
    keyTakeaways: [
      "The company has signed three Fortune 100 enterprise customers in twenty months.",
      "The architecture is purpose-built for AI inference workloads.",
      "Funding terms suggest investors expect a serious challenge to the incumbent hyperscalers.",
    ],
    aiSummary:
      "A two-year-old Lisbon startup has signed three Fortune 100 customers with a cloud architecture purpose-built for AI inference — a credible challenge to the incumbent hyperscalers.",
    body: [
      para(
        "The pitch is simple, and, until recently, it would have been laughable. The existing public cloud, the founders argue, was designed for a workload that no longer dominates: stateless web traffic. The workload that actually matters now — large-model inference, served at low latency, at planetary scale — is something the existing cloud was retrofitted to handle, not built for.",
      ),
      heading("Three customers, twenty months"),
      para(
        "Most startups need three years to sign their first Fortune 100 customer. This one signed three of them in twenty months. The customers will not be named in this article. Their procurement teams confirmed the relationship on background.",
      ),
    ],
    viewCount: 31_200,
    commentCount: 187,
    isBreaking: false,
    isFeature: false,
    section: "startup",
  },
  {
    slug: "the-vr-headset-that-finally-works",
    title:
      "The VR Headset That Finally Works",
    subtitle:
      "After a decade of false starts, a single device delivers on the promise that the entire category has been making since 2014.",
    excerpt:
      "After a decade of false starts, a single device delivers on the promise the entire category has been making since 2014. We wore it for a month.",
    heroImageUrl: IMG("article-vr.png"),
    categorySlug: "vr-ar",
    authorSlug: "yuki-tanaka",
    publishedAt: hoursAgo(80),
    updatedAt: hoursAgo(80),
    readingMinutes: 8,
    tags: ["vr", "review", "buying-guide"],
    keyTakeaways: [
      "The display is the first VR panel that does not visibly degrade after a month of daily use.",
      "Latency under load is below the threshold at which most users report discomfort.",
      "The software ecosystem is, finally, no longer the limiting factor.",
    ],
    aiSummary:
      "A new VR headset finally delivers on the category's decade-old promise — display quality, latency, and software all reach the threshold at which the device becomes recommendable for the first time.",
    body: [
      para(
        "Every two or three years, a new VR headset launches and the writeup is some version of: this is the one. It almost never is. We have been wearing this one as a daily driver for a month, and we are prepared to say, for the first time in the category's history: this one actually is.",
      ),
    ],
    viewCount: 47_320,
    commentCount: 292,
    isBreaking: false,
    isFeature: false,
    section: "vr-ar",
  },
  {
    slug: "the-streaming-bundle-that-changes-everything",
    title:
      "The Streaming Bundle That Quietly Changes Everything",
    subtitle:
      "Two of the largest streaming services just announced a bundled subscription. The implications are bigger than they look.",
    excerpt:
      "Two of the largest streaming services have announced a bundle. The deal looks unremarkable. The implications, on closer inspection, redraw the next decade of global media.",
    heroImageUrl: IMG("article-gaming.png"),
    categorySlug: "entertainment",
    authorSlug: "amelia-okafor",
    publishedAt: hoursAgo(96),
    updatedAt: hoursAgo(96),
    readingMinutes: 5,
    tags: ["streaming", "media", "analysis"],
    keyTakeaways: [
      "The bundle is the first credible alternative to the cable model the industry has been trying to replace for fifteen years.",
      "Pricing is lower than either standalone subscription suggested would be possible.",
      "The deal sets a pricing floor that the rest of the industry will struggle to match.",
    ],
    aiSummary:
      "A new streaming bundle between two of the largest services sets a pricing floor that the rest of the industry will struggle to match — and finally offers a credible alternative to the cable model.",
    body: [
      para(
        "The press release was three paragraphs long. It announced a bundled subscription tier at a price point the rest of the industry was, until very recently, certain was structurally impossible. It did so without much fanfare, on a quiet Wednesday, while almost every entertainment industry analyst was paying attention to something else.",
      ),
    ],
    viewCount: 53_400,
    commentCount: 341,
    isBreaking: false,
    isFeature: false,
    section: "entertainment",
  },
];

const reviewsSeed = [
  {
    slug: "axis-laptop-flagship-2026",
    productName: "Axis Pro 16 (2026)",
    tagline:
      "The first portable workstation in years that doesn't require an apology.",
    heroImageUrl: IMG("hero-laptop.png"),
    galleryImages: [IMG("hero-laptop.png"), IMG("article-chip.png")],
    score: 9.4,
    verdict:
      "If you genuinely need this much machine, this is the one to buy. If you don't, it remains the most enjoyable to use.",
    summary:
      "A 16-inch portable workstation with the highest sustained performance we have ever measured, a display that survives a month of full-brightness use, and a battery that comfortably clears a working day under realistic professional load.",
    categorySlug: "gadgets",
    authorSlug: "yuki-tanaka",
    publishedAt: hoursAgo(8),
    priceUsd: 3299,
    pros: [
      "Highest sustained performance we have measured on a portable.",
      "4K OLED panel that does not visibly degrade.",
      "Battery comfortably clears a full working day.",
      "Keyboard and trackpad are both best-in-class.",
    ],
    cons: [
      "Heavy for the size class.",
      "Webcam, while improved, is still merely adequate.",
      "Price is unapologetic.",
    ],
    ratings: [
      { label: "Performance", score: 9.8 },
      { label: "Display", score: 9.6 },
      { label: "Battery", score: 9.2 },
      { label: "Build", score: 9.5 },
      { label: "Value", score: 8.6 },
    ] satisfies ReviewRating[],
    sections: [
      {
        heading: "Performance",
        body: "Sustained CPU performance under our standard one-hour render benchmark is the highest we have ever measured on a portable. Thermals remain composed; the chassis stays comfortable to use throughout. The system holds its peak frequency longer than any competitor we have tested in the past two years.",
      },
      {
        heading: "Display",
        body: "The 4K OLED panel is the first portable display we have tested that genuinely survives a month of full-brightness daily use without visible degradation. Color accuracy out of the box is excellent, and the anti-reflective coating finally makes outdoor use viable.",
      },
      {
        heading: "Battery",
        body: "Under realistic professional load — a mix of heavy editor use, video calls, and intermittent compilation — the battery comfortably clears a full working day. Under lighter load, two days is achievable. Charging is fast enough to fully recover during a single coffee break.",
      },
      {
        heading: "Verdict",
        body: "If you need this much machine, this is the one to buy. If you don't, it remains the most enjoyable to use. The price is unapologetic, but, for the first time in this category, defensible.",
      },
    ] satisfies ReviewSection[],
    isBestPick: true,
  },
  {
    slug: "studio-headphones-pro",
    productName: "Studio Reference Pro",
    tagline:
      "The over-ear headphones that finally make the case for a four-figure price tag.",
    heroImageUrl: IMG("review-headphones.png"),
    galleryImages: [IMG("review-headphones.png")],
    score: 9.1,
    verdict:
      "The most honest pair of headphones we have tested this year, at a price that finally feels like the cost of admission.",
    summary:
      "A reference-grade studio pair that, after a month of daily use, made every other set of premium cans on the test bench feel slightly off.",
    categorySlug: "gadgets",
    authorSlug: "yuki-tanaka",
    publishedAt: hoursAgo(40),
    priceUsd: 1199,
    pros: [
      "Reference-grade tonal balance.",
      "Comfort holds up over a full working day.",
      "Build quality matches the asking price.",
    ],
    cons: [
      "ANC is competent but not class-leading.",
      "Carrying case is unnecessarily large.",
    ],
    ratings: [
      { label: "Sound", score: 9.6 },
      { label: "Comfort", score: 9.2 },
      { label: "Build", score: 9.4 },
      { label: "Battery", score: 8.6 },
      { label: "Value", score: 8.2 },
    ] satisfies ReviewRating[],
    sections: [
      {
        heading: "Sound",
        body: "The tonal balance is the cleanest we have ever heard at this size. There is no flattering colouration — what is in the recording is what comes out of the cups. For a working studio, this is the entire point.",
      },
      {
        heading: "Comfort",
        body: "The clamping force, weight distribution, and pad design hold up over a full working day. After a month of daily use, no part of the wearing experience feels like a compromise.",
      },
      {
        heading: "Verdict",
        body: "If you genuinely listen for a living, these are the cans to buy. If you do not, they remain extraordinary — and very expensive.",
      },
    ] satisfies ReviewSection[],
    isBestPick: true,
  },
  {
    slug: "fitness-watch-titanium",
    productName: "Axis Watch Ultra Titanium",
    tagline:
      "A serious athletic instrument that finally earns the word 'serious'.",
    heroImageUrl: IMG("review-watch.png"),
    galleryImages: [IMG("review-watch.png")],
    score: 8.7,
    verdict:
      "The first smartwatch we are comfortable recommending to athletes who would otherwise carry a dedicated training device.",
    summary:
      "Battery life, sensor accuracy, and display quality finally reach the threshold at which the device replaces, rather than supplements, a dedicated athletic instrument.",
    categorySlug: "gadgets",
    authorSlug: "yuki-tanaka",
    publishedAt: hoursAgo(72),
    priceUsd: 899,
    pros: [
      "Sensor accuracy under load is excellent.",
      "Battery comfortably clears a long-distance training day.",
      "Display is readable in direct sunlight.",
    ],
    cons: [
      "Software still occasionally feels like a smartphone, not a training tool.",
      "Strap options are limited.",
    ],
    ratings: [
      { label: "Sensors", score: 9.2 },
      { label: "Battery", score: 8.8 },
      { label: "Display", score: 9.0 },
      { label: "Software", score: 8.0 },
      { label: "Value", score: 8.4 },
    ] satisfies ReviewRating[],
    sections: [
      {
        heading: "Sensors",
        body: "Heart rate accuracy under sustained load is the best we have measured on a smartwatch. GPS lock is fast and stable. Recovery metrics correlate well with what a dedicated training device would tell you.",
      },
      {
        heading: "Battery",
        body: "A full long-distance training day with GPS active leaves meaningful battery for the evening. For most athletes, this is the threshold the category has needed to clear.",
      },
    ] satisfies ReviewSection[],
    isBestPick: true,
  },
  {
    slug: "console-controller-pro",
    productName: "Axis Pro Controller",
    tagline:
      "A premium controller that, for once, justifies the premium.",
    heroImageUrl: IMG("review-controller.png"),
    galleryImages: [IMG("review-controller.png")],
    score: 8.4,
    verdict:
      "Not every player needs this much controller. The ones who do will not look at another.",
    summary:
      "A premium gaming controller with hall-effect sticks, configurable triggers, and the cleanest haptics in the category.",
    categorySlug: "gaming",
    authorSlug: "amelia-okafor",
    publishedAt: hoursAgo(96),
    priceUsd: 199,
    pros: [
      "Hall-effect sticks should outlast the device.",
      "Triggers and back buttons are extensively configurable.",
      "Haptics are the cleanest in the category.",
    ],
    cons: [
      "Companion software is more complicated than it needs to be.",
      "Charging cradle is sold separately.",
    ],
    ratings: [
      { label: "Build", score: 9.0 },
      { label: "Inputs", score: 9.2 },
      { label: "Software", score: 7.4 },
      { label: "Value", score: 8.0 },
    ] satisfies ReviewRating[],
    sections: [
      {
        heading: "Inputs",
        body: "The hall-effect sticks should outlast the device itself; the triggers, back buttons, and face buttons are all extensively configurable; the haptics are the cleanest we have ever felt in a controller. For the audience that cares about this much detail, the device delivers.",
      },
    ] satisfies ReviewSection[],
    isBestPick: false,
  },
  {
    slug: "mirrorless-camera-pro",
    productName: "Axis M1 Pro",
    tagline:
      "The mirrorless body that finally puts a serious AI pipeline in the hands of working photographers.",
    heroImageUrl: IMG("review-camera.png"),
    galleryImages: [IMG("review-camera.png")],
    score: 9.0,
    verdict:
      "The first camera body we have used where the on-device intelligence genuinely improves the working photographer's day.",
    summary:
      "A full-frame mirrorless body with a serious on-device AI pipeline that, for once, does not get in the way of the actual job.",
    categorySlug: "gadgets",
    authorSlug: "yuki-tanaka",
    publishedAt: hoursAgo(120),
    priceUsd: 3499,
    pros: [
      "Autofocus is the most reliable we have used.",
      "On-device intelligence genuinely speeds up culling and triage.",
      "Build quality is appropriate to the asking price.",
    ],
    cons: [
      "Battery life is merely good, not great.",
      "Menu system has not meaningfully improved.",
    ],
    ratings: [
      { label: "Image", score: 9.4 },
      { label: "Autofocus", score: 9.6 },
      { label: "Build", score: 9.0 },
      { label: "Battery", score: 8.0 },
      { label: "Value", score: 8.4 },
    ] satisfies ReviewRating[],
    sections: [
      {
        heading: "Autofocus",
        body: "The autofocus system is the most reliable we have used. Subject identification holds across frames, lighting changes, and partial occlusion. For working photographers, this is the feature that justifies the upgrade by itself.",
      },
    ] satisfies ReviewSection[],
    isBestPick: false,
  },
];

const videosSeed = [
  {
    slug: "the-machine-that-thinks-explained",
    title: "The Machine That Thinks, Explained in Six Minutes",
    description:
      "We unpack the architectural shift behind the latest reasoning models — without the hype, and without the jargon.",
    thumbnailUrl: IMG("hero-ai-neural.png"),
    durationSeconds: 372,
    publishedAt: hoursAgo(4),
    categorySlug: "ai",
    viewCount: 412_300,
  },
  {
    slug: "axis-pro-16-review",
    title: "Axis Pro 16 (2026): Six Weeks Later",
    description:
      "The full review. Six weeks of full-time use, three continents, and one unambiguous verdict.",
    thumbnailUrl: IMG("hero-laptop.png"),
    durationSeconds: 612,
    publishedAt: hoursAgo(10),
    categorySlug: "gadgets",
    viewCount: 248_900,
  },
  {
    slug: "the-flagship-shootout-video",
    title: "The Flagship Shootout: Three Phones, One Honest Verdict",
    description:
      "All three flagship phones from this quarter, side by side, judged on the only metric that matters.",
    thumbnailUrl: IMG("article-phone.png"),
    durationSeconds: 524,
    publishedAt: hoursAgo(16),
    categorySlug: "gadgets",
    viewCount: 192_400,
  },
  {
    slug: "the-ev-pricing-war-video",
    title: "Inside the EV Pricing War",
    description:
      "Three of the world's largest automakers cut prices in the same week. Here is what is actually happening.",
    thumbnailUrl: IMG("article-ev.png"),
    durationSeconds: 488,
    publishedAt: hoursAgo(22),
    categorySlug: "ev",
    viewCount: 138_500,
  },
  {
    slug: "studio-reference-pro-video",
    title: "Studio Reference Pro: The Honest Headphone Review",
    description:
      "A month with the most expensive cans on our test bench. Here is whether they earn it.",
    thumbnailUrl: IMG("review-headphones.png"),
    durationSeconds: 456,
    publishedAt: hoursAgo(42),
    categorySlug: "gadgets",
    viewCount: 99_700,
  },
  {
    slug: "the-quantum-explainer",
    title: "The Quantum Result That Just Changed the Timeline",
    description:
      "What the Zurich team actually demonstrated, and why every other lab in the field is paying attention.",
    thumbnailUrl: IMG("article-quantum.png"),
    durationSeconds: 408,
    publishedAt: hoursAgo(30),
    categorySlug: "future-tech",
    viewCount: 78_200,
  },
];

async function main() {
  console.log("Seeding PrimeAxis...");

  await db.delete(articlesTable);
  await db.delete(reviewsTable);
  await db.delete(videosTable);
  await db.delete(authorsTable);
  await db.delete(categoriesTable);
  await db.delete(newslettersTable);

  const cats = await db
    .insert(categoriesTable)
    .values(categoriesSeed)
    .returning();
  const catBySlug = new Map(cats.map((c) => [c.slug, c.id]));

  const authors = await db
    .insert(authorsTable)
    .values(authorsSeed)
    .returning();
  const authBySlug = new Map(authors.map((a) => [a.slug, a.id]));

  await db.insert(newslettersTable).values(newslettersSeed);

  await db.insert(articlesTable).values(
    articlesSeed.map((a) => ({
      slug: a.slug,
      title: a.title,
      subtitle: a.subtitle,
      excerpt: a.excerpt,
      heroImageUrl: a.heroImageUrl,
      categoryId: catBySlug.get(a.categorySlug)!,
      authorId: authBySlug.get(a.authorSlug)!,
      publishedAt: a.publishedAt,
      updatedAt: a.updatedAt,
      readingMinutes: a.readingMinutes,
      tags: a.tags,
      body: a.body,
      keyTakeaways: a.keyTakeaways,
      aiSummary: a.aiSummary,
      viewCount: a.viewCount,
      commentCount: a.commentCount,
      isBreaking: a.isBreaking,
      isFeature: a.isFeature,
      section: a.section,
    })),
  );

  await db.insert(reviewsTable).values(
    reviewsSeed.map((r) => ({
      slug: r.slug,
      productName: r.productName,
      tagline: r.tagline,
      heroImageUrl: r.heroImageUrl,
      galleryImages: r.galleryImages,
      score: r.score,
      verdict: r.verdict,
      summary: r.summary,
      categoryId: catBySlug.get(r.categorySlug)!,
      authorId: authBySlug.get(r.authorSlug)!,
      publishedAt: r.publishedAt,
      priceUsd: r.priceUsd,
      pros: r.pros,
      cons: r.cons,
      ratings: r.ratings,
      sections: r.sections,
      isBestPick: r.isBestPick,
    })),
  );

  await db.insert(videosTable).values(
    videosSeed.map((v) => ({
      slug: v.slug,
      title: v.title,
      description: v.description,
      thumbnailUrl: v.thumbnailUrl,
      durationSeconds: v.durationSeconds,
      publishedAt: v.publishedAt,
      categoryId: catBySlug.get(v.categorySlug)!,
      viewCount: v.viewCount,
    })),
  );

  console.log("Done.");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
