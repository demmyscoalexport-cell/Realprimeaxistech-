import { createClient } from "@sanity/client";
import { randomUUID } from "node:crypto";
import Anthropic from "@anthropic-ai/sdk";
import { v2 as cloudinary } from "cloudinary";

const projectId = process.env.SANITY_PROJECT_ID || "jyppkgsk";
const dataset = process.env.SANITY_DATASET ?? "production";
const sanityToken = process.env.SANITY_API_TOKEN;
const wsKey = process.env.WAVESPEED_API_KEY;
if (!sanityToken || !wsKey)
  throw new Error("Missing SANITY_API_TOKEN / WAVESPEED_API_KEY env");

if (!process.env.CLOUDINARY_URL)
  throw new Error("Missing CLOUDINARY_URL env (cloudinary://key:secret@cloud)");
// SDK auto-reads CLOUDINARY_URL; explicitly enable HTTPS uploads.
cloudinary.config({ secure: true });

const sanity = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  token: sanityToken,
  useCdn: false,
});

const anthropic = new Anthropic({
  apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
});

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const uid = () => randomUUID().replace(/-/g, "").slice(0, 12);

// ---------- per-category visual & query profile ----------
const CAT_PROFILE: Record<string, { aesthetic: string; hnExtra: string[] }> = {
  ai: {
    aesthetic:
      "abstract data visualization, glowing neural network, deep indigo and electric cyan, volumetric light, particles, futuristic, dark cinematic mood",
    hnExtra: ["AI", "machine learning"],
  },
  "artificial-intelligence": {
    aesthetic:
      "frontier ai laboratory, holographic data streams, blue-violet palette, soft neon, cinematic editorial",
    hnExtra: ["AI research", "deep learning"],
  },
  gadgets: {
    aesthetic:
      "premium product photography, dramatic studio lighting, dark glossy backdrop, anodized aluminum and glass, macro detail, magazine quality",
    hnExtra: ["consumer electronics"],
  },
  gaming: {
    aesthetic:
      "epic cinematic game still, dramatic god rays, vivid color grade, particle effects, ultra wide composition, high fidelity render",
    hnExtra: ["gaming", "video game"],
  },
  ev: {
    aesthetic:
      "futuristic electric vehicle on a wet city street at dusk, neon reflections, bokeh, cinematic photograph",
    hnExtra: ["electric vehicle", "EV"],
  },
  "future-tech": {
    aesthetic:
      "abstract scientific concept, holographic interface, clean white lab with cyan accents, ultra detailed",
    hnExtra: ["science", "technology"],
  },
  "vr-ar": {
    aesthetic:
      "person wearing a sleek headset, holographic UI elements floating, dark room with cyan and magenta glow, cinematic",
    hnExtra: ["VR", "AR", "headset"],
  },
  robotics: {
    aesthetic:
      "humanoid or industrial robot in clean directional light, cinematic 35mm photograph, warm metallic palette",
    hnExtra: ["robot"],
  },
  cybersecurity: {
    aesthetic:
      "dark hooded silhouette, code walls, red and green terminal glow, fog, anamorphic lens flare, cyber noir",
    hnExtra: ["security", "hack"],
  },
  startups: {
    aesthetic:
      "modern startup office, golden hour through floor-to-ceiling windows, founder silhouettes, cinematic editorial",
    hnExtra: ["startup", "venture capital"],
  },
  entertainment: {
    aesthetic:
      "behind-the-scenes editorial photograph, warm cinematic color grade, dramatic lighting, premium magazine",
    hnExtra: ["entertainment", "streaming"],
  },
};

// ---------- per-subcategory search hints + visual nudge ----------
const SUB_PROFILE: Record<
  string,
  { keywords: string[]; visual: string; angle: string }
> = {
  "ai/llms": {
    keywords: ["GPT", "Claude", "Gemini", "Llama", "language model", "LLM"],
    visual: "glowing typography streams, token cascade",
    angle: "frontier large language model releases, benchmarks, capabilities",
  },
  "ai/generative-ai": {
    keywords: ["Stable Diffusion", "Midjourney", "Sora", "image generation", "generative"],
    visual: "iridescent diffusion clouds, swirling latent space",
    angle: "image, video and audio generation breakthroughs",
  },
  "ai/agents": {
    keywords: ["AI agent", "AutoGen", "LangChain", "browser agent", "Devin"],
    visual: "interconnected nodes performing tasks, branching flowchart of light",
    angle: "autonomous AI agents, tool use, reliability",
  },
  "ai/open-source": {
    keywords: ["open weights", "Llama", "Mistral", "Hugging Face", "open source AI"],
    visual: "open vault of glowing model weights, community network",
    angle: "open weight model releases and self-hosted AI",
  },
  "ai/safety": {
    keywords: ["AI safety", "alignment", "red team", "AI risk", "superalignment"],
    visual: "warning runes embedded in neural mesh, deep red accent",
    angle: "AI safety, alignment research, evals, red-teaming",
  },
  "ai/hardware": {
    keywords: ["NVIDIA", "TPU", "GPU", "Cerebras", "Groq", "AI chip"],
    visual: "macro shot of glowing silicon die, blue plasma traces",
    angle: "AI accelerators, GPUs, custom inference silicon",
  },
  "artificial-intelligence/foundation-models": {
    keywords: ["foundation model", "GPT", "Claude", "Gemini", "frontier model"],
    visual: "monolithic glowing pillar of code, holographic blueprint",
    angle: "frontier foundation model labs, releases, scaling",
  },
  "artificial-intelligence/multimodal": {
    keywords: ["multimodal", "vision language", "GPT-4V", "video understanding"],
    visual: "fused image-text-audio waveform converging in neural light",
    angle: "vision, audio and embodied multimodal AI",
  },
  "artificial-intelligence/enterprise": {
    keywords: ["enterprise AI", "Microsoft Copilot", "Salesforce AI", "AI deployment"],
    visual: "corporate skyscraper with cyan AI overlays, executive workspace",
    angle: "enterprise AI deployments at large companies",
  },
  "artificial-intelligence/research": {
    keywords: ["AI paper", "arxiv", "DeepMind", "AI research", "benchmark"],
    visual: "cluttered research lab with whiteboard equations and glowing screens",
    angle: "AI research papers, benchmarks, breakthroughs",
  },
  "artificial-intelligence/policy": {
    keywords: ["AI regulation", "EU AI Act", "AI executive order", "AI policy"],
    visual: "marble government hall with holographic AI charters floating",
    angle: "AI regulation, copyright, safety policy",
  },
  "artificial-intelligence/voice": {
    keywords: ["voice AI", "ElevenLabs", "speech model", "TTS", "Whisper"],
    visual: "glowing audio waveform spiraling around a microphone",
    angle: "speech AI, TTS, conversational voice agents",
  },
  "gadgets/phones": {
    keywords: ["iPhone", "Samsung Galaxy", "Pixel", "smartphone", "foldable"],
    visual: "flagship smartphone hero shot on dark glass plinth",
    angle: "smartphone launches and foldable hardware",
  },
  "gadgets/laptops": {
    keywords: ["MacBook", "ThinkPad", "Snapdragon laptop", "laptop review"],
    visual: "premium laptop open at angle, RGB-free, anodized finish, soft rim light",
    angle: "notebooks, convertibles, AI PCs",
  },
  "gadgets/wearables": {
    keywords: ["Apple Watch", "Fitbit", "Oura ring", "smart ring", "wearable"],
    visual: "wearable on wrist with health data overlay, premium product still",
    angle: "smartwatches, rings, health trackers",
  },
  "gadgets/audio": {
    keywords: ["AirPods", "Sony headphones", "earbuds", "Sonos", "audio tech"],
    visual: "premium headphones suspended in beam of light, dark studio",
    angle: "headphones, earbuds, premium speakers",
  },
  "gadgets/cameras": {
    keywords: ["Sony Alpha", "Canon", "Fujifilm", "camera review", "mirrorless"],
    visual: "mirrorless camera macro, lens reflections, studio key light",
    angle: "mirrorless, action cams, computational photography",
  },
  "gadgets/smart-home": {
    keywords: ["smart home", "Matter", "HomeKit", "smart bulb", "home automation"],
    visual: "modern living room at twilight glowing with ambient smart lights",
    angle: "connected appliances, lighting, home automation",
  },
  "gaming/aaa": {
    keywords: ["AAA game", "PlayStation", "Xbox", "Game Awards", "blockbuster game"],
    visual: "epic AAA game hero environment, cinematic key art quality",
    angle: "big-budget AAA releases and showcases",
  },
  "gaming/indie": {
    keywords: ["indie game", "indie dev", "Steam Next Fest", "indie hit"],
    visual: "stylized indie game keyframe, painterly, vivid palette",
    angle: "indie studios and breakout titles",
  },
  "gaming/esports": {
    keywords: ["esports", "League of Legends", "Valorant", "tournament", "pro gaming"],
    visual: "esports arena bathed in stadium light, crowd silhouettes",
    angle: "competitive scene and tournaments",
  },
  "gaming/hardware": {
    keywords: ["PS5", "Xbox Series", "Steam Deck", "Switch", "gaming PC"],
    visual: "console or handheld hero shot, dramatic key light",
    angle: "consoles, handhelds, gaming peripherals",
  },
  "gaming/mobile": {
    keywords: ["mobile game", "iOS game", "Genshin", "Roblox"],
    visual: "phone displaying glowing mobile game UI, neon backdrop",
    angle: "phone and tablet gaming",
  },
  "gaming/industry": {
    keywords: ["game studio layoffs", "Activision", "EA", "game industry", "Microsoft gaming"],
    visual: "empty game studio at night, corporate glass and screens",
    angle: "studios, M&A, layoffs and post-mortems",
  },
  "ev/tesla": {
    keywords: ["Tesla", "Cybertruck", "Elon Musk", "Model Y", "Model 3"],
    visual: "Tesla vehicle in stark minimalist light, electric blue accents",
    angle: "Tesla product, fleet, FSD and Musk-verse",
  },
  "ev/charging": {
    keywords: ["EV charging", "Supercharger", "Electrify America", "NACS", "fast charge"],
    visual: "bank of EV chargers glowing in rain at night, cinematic reflections",
    angle: "EV charging networks, fast-charging, NACS",
  },
  "ev/trucks": {
    keywords: ["electric truck", "Rivian", "Ford Lightning", "EV van"],
    visual: "muscular electric pickup at industrial site at golden hour",
    angle: "electric work vehicles, trucks, vans",
  },
  "ev/battery": {
    keywords: ["EV battery", "solid state battery", "LFP", "battery cell", "CATL"],
    visual: "macro of battery cells with glowing electrolyte traces",
    angle: "battery chemistry, solid state, supply chain",
  },
  "ev/policy": {
    keywords: ["EV tariff", "EV subsidy", "EV mandate", "California EV"],
    visual: "policy chamber with EVs as exhibits, daylight through tall windows",
    angle: "EV subsidies, tariffs and regulation",
  },
  "ev/two-wheelers": {
    keywords: ["electric bike", "ebike", "electric scooter", "electric motorcycle"],
    visual: "premium electric motorbike on rain-slick urban street, neon signage",
    angle: "ebikes, scooters, electric motorcycles",
  },
  "future-tech/quantum": {
    keywords: ["quantum computing", "qubit", "IBM quantum", "Google quantum"],
    visual: "intricate quantum dilution refrigerator, gold lattice, cyan glow",
    angle: "quantum computing milestones and chips",
  },
  "future-tech/biotech": {
    keywords: ["CRISPR", "biotech", "longevity", "AI drug discovery", "synthetic biology"],
    visual: "bioluminescent dna helix, sterile lab with violet accents",
    angle: "genomics, longevity, AI in biology",
  },
  "future-tech/space": {
    keywords: ["SpaceX", "Starship", "NASA", "rocket launch", "satellite"],
    visual: "rocket ascending through dawn clouds, dramatic atmospheric perspective",
    angle: "launches, missions, orbital economy",
  },
  "future-tech/energy": {
    keywords: ["fusion", "nuclear", "renewables", "Helion", "Commonwealth Fusion"],
    visual: "tokamak interior glowing with plasma, monumental scale",
    angle: "fusion, nuclear, renewable breakthroughs",
  },
  "future-tech/materials": {
    keywords: ["new material", "graphene", "metamaterial", "manufacturing breakthrough"],
    visual: "exotic crystalline material under microscope light, iridescent",
    angle: "novel materials and manufacturing",
  },
  "future-tech/bci": {
    keywords: ["Neuralink", "brain computer interface", "BCI", "neural implant"],
    visual: "translucent skull with luminous neural threads radiating outward",
    angle: "brain-computer interfaces and neural augmentation",
  },
  "vr-ar/headsets": {
    keywords: ["Vision Pro", "Quest 3", "Meta headset", "AR glasses", "VR headset"],
    visual: "premium MR headset hero shot, anamorphic glow",
    angle: "VR/MR/AR hardware launches",
  },
  "vr-ar/spatial": {
    keywords: ["spatial computing", "Vision Pro", "spatial app"],
    visual: "person interacting with floating spatial UI in modern apartment",
    angle: "spatial computing platforms beyond Vision Pro",
  },
  "vr-ar/mixed-reality": {
    keywords: ["mixed reality", "passthrough", "MR app"],
    visual: "passthrough view blending real room with virtual layers",
    angle: "passthrough mixed reality and hybrid use",
  },
  "vr-ar/apps": {
    keywords: ["VR app", "Quest game", "spatial software"],
    visual: "spatial app UI floating in dark void with cyan accents",
    angle: "spatial software and VR games",
  },
  "vr-ar/tracking": {
    keywords: ["hand tracking", "eye tracking", "body tracking", "VR tracking"],
    visual: "ghost hands traced by glowing tracking points in dark",
    angle: "hand, eye and body tracking advances",
  },
  "vr-ar/enterprise": {
    keywords: ["enterprise VR", "industrial AR", "training VR"],
    visual: "factory worker in AR headset overlaying machine schematics",
    angle: "enterprise XR for training and industry",
  },
  "robotics/humanoids": {
    keywords: ["humanoid robot", "Figure", "Tesla Optimus", "1X", "Boston Dynamics"],
    visual: "humanoid robot standing in soft directional light, cinematic 35mm",
    angle: "bipedal and general-purpose humanoid robots",
  },
  "robotics/industrial": {
    keywords: ["industrial robot", "factory automation", "robotic arm", "ABB", "Fanuc"],
    visual: "robotic arm assembly line glowing under sodium lamps",
    angle: "factory automation and arms",
  },
  "robotics/drones": {
    keywords: ["drone", "DJI", "delivery drone", "UAV"],
    visual: "drone over coastal landscape at golden hour",
    angle: "UAVs, delivery and inspection drones",
  },
  "robotics/surgical": {
    keywords: ["surgical robot", "da Vinci robot", "medical robotics"],
    visual: "sterile OR with surgical robot arms in soft blue light",
    angle: "medical and surgical robotics",
  },
  "robotics/service": {
    keywords: ["service robot", "delivery robot", "cleaning robot", "hospitality robot"],
    visual: "service robot navigating modern hotel lobby",
    angle: "cleaning, delivery and hospitality bots",
  },
  "robotics/research": {
    keywords: ["robotics paper", "robot learning", "robot research"],
    visual: "robotics lab with prototype on bench, scientists in lab coats",
    angle: "robotics lab breakthroughs and papers",
  },
  "cybersecurity/threats": {
    keywords: ["malware", "ransomware", "data breach", "zero day", "exploit"],
    visual: "ominous code walls cracking open, blood-red glyphs",
    angle: "malware, ransomware and breaches",
  },
  "cybersecurity/privacy": {
    keywords: ["encryption", "Signal", "privacy", "data rights", "Apple privacy"],
    visual: "padlock dissolving into data particles, cool blue palette",
    angle: "encryption and data rights",
  },
  "cybersecurity/enterprise": {
    keywords: ["zero trust", "SOC", "IAM", "Okta", "CrowdStrike"],
    visual: "corporate SOC with wall of monitors glowing amber and cyan",
    angle: "SOC, IAM, zero trust enterprise security",
  },
  "cybersecurity/crypto": {
    keywords: ["crypto hack", "wallet hack", "DeFi exploit", "bridge hack"],
    visual: "cracked digital wallet leaking glowing tokens, dark void",
    angle: "wallet hacks and on-chain risk",
  },
  "cybersecurity/nation-state": {
    keywords: ["APT", "nation state hack", "Volt Typhoon", "Russian cyberattack", "Chinese hackers"],
    visual: "geopolitical map glowing with attack vectors, dark war room",
    angle: "APTs and geopolitical cyber attacks",
  },
  "cybersecurity/vpn": {
    keywords: ["VPN", "ProtonVPN", "Mullvad", "VPN review"],
    visual: "tunnel of encrypted light pipes, gradient indigo",
    angle: "consumer and business VPN landscape",
  },
  "startups/fundraising": {
    keywords: ["Series A", "Series B", "seed round", "venture funding", "startup raise"],
    visual: "founders pitching in glass conference room, golden hour",
    angle: "seed to mega-round fundraising",
  },
  "startups/founders": {
    keywords: ["founder profile", "startup CEO", "Y Combinator founder"],
    visual: "founder portrait silhouette against city skyline at dusk",
    angle: "founder profiles and interviews",
  },
  "startups/acquisitions": {
    keywords: ["startup acquisition", "tech M&A", "acquihire"],
    visual: "two corporate towers merging in cinematic overlay",
    angle: "M&A activity in tech",
  },
  "startups/launches": {
    keywords: ["product launch", "Y Combinator demo day", "stealth startup"],
    visual: "stage spotlight on minimalist product reveal, dark crowd",
    angle: "new companies shipping products",
  },
  "startups/ipos": {
    keywords: ["IPO", "tech IPO", "direct listing", "SPAC"],
    visual: "NYSE bell ringing, confetti, balcony view, cinematic",
    angle: "public offerings and exits",
  },
  "startups/failures": {
    keywords: ["startup shutdown", "startup failure", "post-mortem", "tech bankruptcy"],
    visual: "abandoned startup office, chairs stacked, dust in beam of light",
    angle: "shutdowns and post-mortems",
  },
  "entertainment/streaming": {
    keywords: ["Netflix", "Disney+", "Max", "streaming wars", "Hulu"],
    visual: "wall of glowing streaming thumbnails curving around viewer",
    angle: "Netflix, Disney+, Max and streaming wars",
  },
  "entertainment/film": {
    keywords: ["movie", "box office", "Hollywood", "film release"],
    visual: "vintage film projector beam over movie theater curtain",
    angle: "movies and box office",
  },
  "entertainment/tv": {
    keywords: ["TV series", "TV show", "HBO", "Apple TV+"],
    visual: "cinematic TV set with crew silhouettes, warm key light",
    angle: "series and shows",
  },
  "entertainment/music": {
    keywords: ["Spotify", "Apple Music", "AI music", "music streaming", "music rights"],
    visual: "concert stage with vinyl record overlay, warm rim light",
    angle: "music streaming, AI music, rights",
  },
  "entertainment/creators": {
    keywords: ["YouTube creator", "TikTok creator", "MrBeast", "creator economy"],
    visual: "creator workspace bathed in ring-light glow, cameras and props",
    angle: "creator economy on YouTube and TikTok",
  },
  "entertainment/awards": {
    keywords: ["Oscars", "Emmys", "Grammys", "Golden Globes"],
    visual: "gold statuette on red carpet, dramatic spotlight",
    angle: "Oscars, Emmys, Grammys",
  },
};

// ---------- Hacker News ----------
async function fetchHN(query: string): Promise<string[]> {
  try {
    const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=15`;
    const r = await fetch(url);
    if (!r.ok) return [];
    const j = (await r.json()) as { hits: { title?: string; url?: string }[] };
    return j.hits
      .map((h) => h.title)
      .filter((t): t is string => !!t && t.length > 12 && t.length < 160)
      .slice(0, 12);
  } catch {
    return [];
  }
}

// ---------- Claude generation ----------
type Section =
  | { type: "h2"; content: string }
  | { type: "p"; content: string }
  | { type: "quote"; content: string }
  | { type: "bullets"; items: string[] };

type Idea = {
  title: string;
  subtitle: string;
  excerpt: string;
  tags: string[];
  body: Section[];
  keyTakeaways: string[];
  aiSummary: string;
};

const SYSTEM = `You are a senior tech editor at a publication that mixes Engadget, The Verge, and Wired. You write for sophisticated, busy readers. Sharp, specific, evidence-led prose. Concrete details, real numbers, named sources, second-order analysis. Never breathless or marketing-y.

Output ONLY a JSON array (no markdown, no prose) of N article objects:
[{
  "title": string,           // 8-14 words, journalistic, distinct from each other and from any prior coverage
  "subtitle": string,        // <= 180 chars dek that adds new info beyond the title
  "excerpt": string,         // 2 sentences, <= 260 chars
  "tags": string[],          // 3-5 lowercase hyphenated tags
  "body": Array<             // 1500-2000 word body
    | { "type": "h2", "content": string }
    | { "type": "p",  "content": string }
    | { "type": "quote", "content": string }
    | { "type": "bullets", "items": string[] }
  >,
  "keyTakeaways": string[],  // exactly 4 punchy bullets <= 120 chars
  "aiSummary": string        // 2 paragraphs, ~80 words
}]

Body rules:
- Open with a 2-3 paragraph lede that sets stakes immediately. NO filler.
- 5-7 H2 sections after the lede with named, journalistic headers.
- Each H2 has 2-4 paragraphs.
- Include ONE pull quote (type "quote") in the middle.
- Include ONE bullet list section.
- Real industry context: name companies, people, dollar figures, dates.
- End with a forward-looking section titled "What to watch next".
- No emojis, hashtags, or marketing speak.

CRITICAL: every article in the array must be on a DIFFERENT angle / story. No two should be paraphrases of each other.`;

async function generateIdeas(
  catSlug: string,
  subSlug: string,
  subName: string,
  subDesc: string,
  count: number,
  hnTopics: string[],
): Promise<Idea[]> {
  const profileKey = `${catSlug}/${subSlug}`;
  const profile = SUB_PROFILE[profileKey];
  const angle = profile?.angle ?? subDesc;

  const topicsBlock = hnTopics.length
    ? `Recent real headlines from Hacker News in this space (use as factual anchors / inspiration, do NOT copy verbatim):\n${hnTopics.map((t, i) => `${i + 1}. ${t}`).join("\n")}\n\n`
    : "";

  const userMsg = `Write ${count} DISTINCT longform articles for the "${subName}" subcategory of our "${catSlug}" section.

Focus area: ${angle}.
${topicsBlock}Each article must be on a different angle — different companies, different stories, different framings. Vary the tone (breaking news, deep dive, profile, opinion, analysis).

Return ONLY a JSON array of ${count} article objects per the schema. No prose, no markdown fences.`;

  const msg = await anthropic.messages.create({
    model: process.env.MODEL ?? "claude-haiku-4-5",
    max_tokens: 16000,
    system: SYSTEM,
    messages: [{ role: "user", content: userMsg }],
  });
  const txt = msg.content
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("");
  let cleaned = txt
    .replace(/^```json\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  // Extract the outermost JSON array even if Claude appended commentary
  const start = cleaned.indexOf("[");
  if (start > 0) cleaned = cleaned.slice(start);
  // Walk and find matching close bracket, respecting strings
  let depth = 0;
  let inStr = false;
  let esc = false;
  let end = -1;
  for (let i = 0; i < cleaned.length; i++) {
    const c = cleaned[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === "\\") esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') inStr = true;
    else if (c === "[" || c === "{") depth++;
    else if (c === "]" || c === "}") {
      depth--;
      if (depth === 0 && c === "]") {
        end = i + 1;
        break;
      }
    }
  }
  if (end > 0) cleaned = cleaned.slice(0, end);
  let arr: Idea[];
  try {
    arr = JSON.parse(cleaned) as Idea[];
  } catch (e) {
    // Last-ditch: try to repair trailing comma / remove last partial item
    const lastClose = cleaned.lastIndexOf("},");
    if (lastClose > 0) {
      const repaired = cleaned.slice(0, lastClose + 1) + "]";
      arr = JSON.parse(repaired) as Idea[];
    } else {
      throw e;
    }
  }
  if (!Array.isArray(arr) || arr.length === 0) throw new Error("empty array");
  return arr.slice(0, count);
}

// ---------- portable text ----------
type PtSpan = { _type: "span"; _key: string; text: string; marks: string[] };
type PtBlock = {
  _type: "block";
  _key: string;
  style: string;
  children: PtSpan[];
  markDefs: never[];
  listItem?: "bullet";
  level?: number;
};
const span = (text: string): PtSpan => ({
  _type: "span",
  _key: uid(),
  text,
  marks: [],
});
const blk = (style: string, text: string, listItem?: "bullet"): PtBlock => {
  const b: PtBlock = {
    _type: "block",
    _key: uid(),
    style,
    children: [span(text)],
    markDefs: [],
  };
  if (listItem) {
    b.listItem = listItem;
    b.level = 1;
  }
  return b;
};
function toPortableText(sections: Section[]): PtBlock[] {
  const out: PtBlock[] = [];
  for (const s of sections) {
    if (s.type === "h2") out.push(blk("h2", s.content));
    else if (s.type === "p") out.push(blk("normal", s.content));
    else if (s.type === "quote") out.push(blk("blockquote", s.content));
    else if (s.type === "bullets")
      for (const it of s.items) out.push(blk("normal", it, "bullet"));
  }
  return out;
}

// ---------- WaveSpeed image gen ----------
const WS_BASE = "https://api.wavespeed.ai/api/v3";
async function generateImage(prompt: string): Promise<string> {
  const create = await fetch(`${WS_BASE}/wavespeed-ai/flux-schnell`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${wsKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      size: "1280*720",
      num_inference_steps: 4,
      enable_safety_checker: true,
    }),
  });
  if (!create.ok)
    throw new Error(
      `WaveSpeed create ${create.status}: ${(await create.text()).slice(0, 200)}`,
    );
  const cj = (await create.json()) as {
    data: { id: string; urls: { get: string } };
  };
  for (let i = 0; i < 60; i++) {
    await sleep(1200);
    const r = await fetch(cj.data.urls.get, {
      headers: { Authorization: `Bearer ${wsKey}` },
    });
    if (!r.ok) continue;
    const j = (await r.json()) as {
      data: { status: string; outputs: string[]; error?: string };
    };
    if (j.data.status === "completed") return j.data.outputs[0];
    if (j.data.status === "failed") throw new Error(`WS failed: ${j.data.error}`);
  }
  throw new Error("WS timeout");
}

async function uploadImg(url: string, publicId: string): Promise<string> {
  const r = await cloudinary.uploader.upload(url, {
    folder: "primeaxis/ai",
    public_id: publicId,
    overwrite: true,
    resource_type: "image",
  });
  return r.secure_url;
}

function buildImagePrompt(title: string, catSlug: string, subSlug: string): string {
  const cat = CAT_PROFILE[catSlug];
  const sub = SUB_PROFILE[`${catSlug}/${subSlug}`];
  const aesthetic = cat?.aesthetic ?? "cinematic editorial photograph, dramatic lighting";
  const visualNudge = sub?.visual ?? "";
  return `${title}. ${aesthetic}. ${visualNudge}. shot on Arri Alexa, 35mm anamorphic, hyper detailed, 8k, photorealistic, magazine cover quality. no text, no watermark, no logo, no captions`;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/'/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

// ---------- main ----------
type ArticleRow = {
  _id: string;
  slug: string;
  title: string;
  catId: string;
  catSlug: string;
  subSlug?: string;
  subName?: string;
  subDesc?: string;
  authorRef?: string;
  publishedAt?: string;
  tags?: string[];
  regenTag?: string;
};

const REGEN_MARKER = "regen-v3";

async function main() {
  const onlySub = process.env.SUB; // e.g. "ai/llms"
  const onlyCat = process.env.CATEGORY; // e.g. "ai"
  const subConcurrency = Number(process.env.SUB_CONCURRENCY ?? "3");
  const imgConcurrency = Number(process.env.IMG_CONCURRENCY ?? "6");
  const limitSubs = Number(process.env.LIMIT_SUBS ?? "999");

  const cats = await sanity.fetch<
    { _id: string; slug: string; subs: { slug: string; name: string; description?: string }[] }[]
  >(
    `*[_type=="category"]{_id,"slug":slug.current,"subs":subcategories[]{slug,name,description}}`,
  );
  const catBySlug = new Map(cats.map((c) => [c.slug, c]));

  const articles = await sanity.fetch<ArticleRow[]>(
    `*[_type=="article"]{_id,"slug":slug.current,title,"catId":category._ref,"catSlug":category->slug.current,"subSlug":subcategorySlug,"authorRef":author._ref,publishedAt,tags}`,
  );

  // group by cat/sub
  const groups = new Map<string, ArticleRow[]>();
  for (const a of articles) {
    if (!a.catSlug || !a.subSlug) continue;
    const key = `${a.catSlug}/${a.subSlug}`;
    if (onlySub && key !== onlySub) continue;
    if (onlyCat && a.catSlug !== onlyCat) continue;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(a);
  }

  // Skip groups already regenerated (every article tagged)
  const remaining = Array.from(groups.entries()).filter(([, list]) => {
    return !list.every((a) => (a.tags ?? []).includes(REGEN_MARKER));
  });

  console.log(
    `Total subs with articles: ${groups.size}, remaining to regen: ${remaining.length}`,
  );
  const targets = remaining.slice(0, limitSubs);
  console.log(`Processing ${targets.length} subs this run`);

  let subsDone = 0;
  let subsFailed = 0;
  let articlesDone = 0;
  let imagesDone = 0;
  let imagesFailed = 0;

  const subQueue = [...targets];

  async function subWorker(workerId: number) {
    while (subQueue.length) {
      const next = subQueue.shift();
      if (!next) return;
      const [key, list] = next;
      const [catSlug, subSlug] = key.split("/");
      const cat = catBySlug.get(catSlug);
      const subMeta = cat?.subs?.find((s) => s.slug === subSlug);
      const subName = subMeta?.name ?? subSlug;
      const subDesc = subMeta?.description ?? "";
      const N = list.length;
      const profileKw = SUB_PROFILE[key]?.keywords ?? [subName];
      const catKw = CAT_PROFILE[catSlug]?.hnExtra ?? [];

      const t0 = Date.now();
      console.log(`[s${workerId}] ▶ ${key} (${N} articles) — fetching HN…`);
      // fetch HN topics from a couple of keywords merged
      const hnPromises = [...profileKw.slice(0, 3), ...catKw.slice(0, 1)].map(
        (k) => fetchHN(k),
      );
      const hnResults = await Promise.all(hnPromises);
      const hnTopics = Array.from(
        new Set(hnResults.flat().filter(Boolean)),
      ).slice(0, 14);

      let ideas: Idea[];
      try {
        ideas = await generateIdeas(catSlug, subSlug, subName, subDesc, N, hnTopics);
      } catch (e) {
        subsFailed++;
        console.error(
          `[s${workerId}] ✗ ${key} ideas failed: ${(e as Error).message.slice(0, 200)}`,
        );
        continue;
      }
      if (ideas.length < N) {
        // pad by recycling
        while (ideas.length < N) ideas.push(ideas[ideas.length % ideas.length]);
      }

      // 1) Write text content first (parallel patches)
      const usedSlugs = new Set<string>();
      const updates: { article: ArticleRow; idea: Idea; newSlug: string }[] = [];
      for (let i = 0; i < N; i++) {
        const idea = ideas[i];
        const article = list[i];
        let s = slugify(idea.title);
        if (!s) s = `${article.slug}-v3`;
        let unique = s;
        let n = 2;
        while (usedSlugs.has(unique)) {
          unique = `${s}-${n++}`;
        }
        usedSlugs.add(unique);
        updates.push({ article, idea, newSlug: unique });
      }

      // patch all in parallel
      await Promise.all(
        updates.map(async ({ article, idea, newSlug }) => {
          try {
            const tags = Array.from(
              new Set([...(idea.tags ?? []), REGEN_MARKER]),
            );
            await sanity
              .patch(article._id)
              .set({
                title: idea.title,
                slug: { _type: "slug", current: newSlug },
                subtitle: idea.subtitle,
                excerpt: idea.excerpt,
                tags,
                body: toPortableText(idea.body || []),
                keyTakeaways: (idea.keyTakeaways ?? []).slice(0, 5),
                aiSummary: idea.aiSummary ?? "",
              })
              .commit();
            articlesDone++;
          } catch (e) {
            console.error(
              `   ✗ patch ${article._id}:`,
              (e as Error).message.slice(0, 160),
            );
          }
        }),
      );
      console.log(
        `[s${workerId}]   • text done for ${key} (${N}), starting images…`,
      );

      // 2) Generate images sequentially within sub (parallelism is across subs)
      let i = 0;
      const imgQ = [...updates];
      async function imgWorker() {
        while (imgQ.length) {
          const job = imgQ.shift();
          if (!job) return;
          try {
            const prompt = buildImagePrompt(job.idea.title, catSlug, subSlug);
            const wsUrl = await generateImage(prompt);
            const publicId = `article-hero-${job.newSlug}`;
            const cdn = await uploadImg(wsUrl, publicId);
            await sanity.patch(job.article._id).set({ heroImageUrl: cdn }).commit();
            imagesDone++;
          } catch (e) {
            imagesFailed++;
            console.error(
              `   ✗ img ${job.newSlug}:`,
              (e as Error).message.slice(0, 160),
            );
          }
          i++;
        }
      }
      const imgWorkers = Math.min(imgConcurrency, updates.length);
      await Promise.all(Array.from({ length: imgWorkers }, () => imgWorker()));

      subsDone++;
      console.log(
        `[s${workerId}] ✓ ${key} done in ${Math.round((Date.now() - t0) / 1000)}s — articles ${articlesDone}, imgs ok ${imagesDone}/fail ${imagesFailed}`,
      );
    }
  }

  await Promise.all(
    Array.from({ length: subConcurrency }, (_, i) => subWorker(i + 1)),
  );

  console.log(
    `\n=== DONE === subs ok=${subsDone} fail=${subsFailed} | articles updated=${articlesDone} | images ok=${imagesDone} fail=${imagesFailed}`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
