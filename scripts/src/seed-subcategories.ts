import { createClient } from "@sanity/client";

const sanity = createClient({
  projectId: process.env.SANITY_PROJECT_ID || "jyppkgsk",
  dataset: process.env.SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

type Sub = { name: string; slug: string; description: string };

const SUBS: Record<string, Sub[]> = {
  ai: [
    { name: "LLMs", slug: "llms", description: "Frontier large language models" },
    { name: "Generative AI", slug: "generative-ai", description: "Image, video and audio generation" },
    { name: "AI Agents", slug: "agents", description: "Autonomous workflows and tool use" },
    { name: "Open Source AI", slug: "open-source", description: "Open weights and self-hosted models" },
    { name: "AI Safety", slug: "safety", description: "Alignment, evals and red-teaming" },
    { name: "AI Hardware", slug: "hardware", description: "GPUs, TPUs and inference chips" },
  ],
  "artificial-intelligence": [
    { name: "Foundation Models", slug: "foundation-models", description: "Frontier AI labs and releases" },
    { name: "Multimodal", slug: "multimodal", description: "Vision, audio and embodied AI" },
    { name: "Enterprise AI", slug: "enterprise", description: "Deployments inside large companies" },
    { name: "Research", slug: "research", description: "Papers, benchmarks and breakthroughs" },
    { name: "Policy & Ethics", slug: "policy", description: "Regulation, copyright and safety" },
    { name: "Voice AI", slug: "voice", description: "Speech, TTS and conversational agents" },
  ],
  gadgets: [
    { name: "Phones", slug: "phones", description: "Smartphones and foldables" },
    { name: "Laptops", slug: "laptops", description: "Notebooks and convertibles" },
    { name: "Wearables", slug: "wearables", description: "Watches, rings and trackers" },
    { name: "Audio", slug: "audio", description: "Headphones, earbuds and speakers" },
    { name: "Cameras", slug: "cameras", description: "Mirrorless, action and AI cams" },
    { name: "Smart Home", slug: "smart-home", description: "Connected appliances and lighting" },
  ],
  gaming: [
    { name: "AAA", slug: "aaa", description: "Big-budget releases" },
    { name: "Indie", slug: "indie", description: "Independent studios and breakouts" },
    { name: "Esports", slug: "esports", description: "Competitive scene and tournaments" },
    { name: "Hardware", slug: "hardware", description: "Consoles, handhelds and peripherals" },
    { name: "Mobile Gaming", slug: "mobile", description: "Phone and tablet titles" },
    { name: "Industry", slug: "industry", description: "Studios, layoffs and acquisitions" },
  ],
  ev: [
    { name: "Tesla", slug: "tesla", description: "All things Tesla and Musk-verse" },
    { name: "Charging", slug: "charging", description: "Networks, fast-charging and standards" },
    { name: "Trucks & Vans", slug: "trucks", description: "Electric work vehicles" },
    { name: "Battery Tech", slug: "battery", description: "Cells, chemistry and supply chain" },
    { name: "Policy", slug: "policy", description: "Subsidies, tariffs and regulation" },
    { name: "Two-Wheelers", slug: "two-wheelers", description: "E-bikes, scooters and motorcycles" },
  ],
  robotics: [
    { name: "Humanoids", slug: "humanoids", description: "Bipedal and general-purpose robots" },
    { name: "Industrial", slug: "industrial", description: "Factory automation and arms" },
    { name: "Drones", slug: "drones", description: "UAVs, delivery and inspection" },
    { name: "Surgical", slug: "surgical", description: "Medical and surgical robotics" },
    { name: "Service Bots", slug: "service", description: "Cleaning, delivery and hospitality" },
    { name: "Research", slug: "research", description: "Lab breakthroughs and papers" },
  ],
  cybersecurity: [
    { name: "Threats", slug: "threats", description: "Malware, ransomware and breaches" },
    { name: "Privacy", slug: "privacy", description: "Encryption and data rights" },
    { name: "Enterprise", slug: "enterprise", description: "SOC, IAM and zero trust" },
    { name: "Crypto Security", slug: "crypto", description: "Wallet hacks and on-chain risk" },
    { name: "Nation State", slug: "nation-state", description: "APTs and geopolitical attacks" },
    { name: "VPN", slug: "vpn", description: "Consumer and business VPN" },
  ],
  "vr-ar": [
    { name: "Headsets", slug: "headsets", description: "VR/MR/AR hardware launches" },
    { name: "Spatial Computing", slug: "spatial", description: "Vision Pro and beyond" },
    { name: "Mixed Reality", slug: "mixed-reality", description: "Passthrough and hybrid use" },
    { name: "Apps", slug: "apps", description: "Spatial software and games" },
    { name: "Tracking", slug: "tracking", description: "Hand, eye and body tracking" },
    { name: "Enterprise XR", slug: "enterprise", description: "Training and industrial use" },
  ],
  startups: [
    { name: "Fundraising", slug: "fundraising", description: "Seed to mega-rounds" },
    { name: "Founders", slug: "founders", description: "Profiles and interviews" },
    { name: "Acquisitions", slug: "acquisitions", description: "M&A activity" },
    { name: "Product Launches", slug: "launches", description: "New companies shipping" },
    { name: "IPOs", slug: "ipos", description: "Public offerings and exits" },
    { name: "Failures", slug: "failures", description: "Shutdowns and post-mortems" },
  ],
  entertainment: [
    { name: "Streaming", slug: "streaming", description: "Netflix, Disney+, Max and more" },
    { name: "Film", slug: "film", description: "Movies and box office" },
    { name: "TV", slug: "tv", description: "Series and shows" },
    { name: "Music Tech", slug: "music", description: "Streaming, AI music and rights" },
    { name: "Creators", slug: "creators", description: "YouTube, TikTok and the creator economy" },
    { name: "Awards", slug: "awards", description: "Oscars, Emmys, Grammys" },
  ],
  "future-tech": [
    { name: "Quantum", slug: "quantum", description: "Quantum computing and networking" },
    { name: "Biotech", slug: "biotech", description: "Genomics, longevity and AI in bio" },
    { name: "Space", slug: "space", description: "Launches, missions and orbital economy" },
    { name: "Energy", slug: "energy", description: "Fusion, nuclear and renewables" },
    { name: "Materials", slug: "materials", description: "New materials and manufacturing" },
    { name: "Brain–Computer", slug: "bci", description: "Neural interfaces and augmentation" },
  ],
};

async function main() {
  const cats = await sanity.fetch<{ _id: string; slug: string }[]>(
    `*[_type=="category" && defined(slug.current)]{_id,"slug":slug.current}`,
  );
  console.log(`Found ${cats.length} categories`);

  // 1) Patch subcategories onto each category
  const tx1 = sanity.transaction();
  for (const c of cats) {
    const subs = SUBS[c.slug];
    if (!subs) {
      console.warn(`  no subs defined for ${c.slug}`);
      continue;
    }
    tx1.patch(c._id, { set: { subcategories: subs } });
  }
  await tx1.commit();
  console.log("✓ Patched subcategories onto all categories");

  // 2) Assign each article to a subcategory, deterministic by slug hash
  const arts = await sanity.fetch<
    { _id: string; slug: string; catSlug: string; subcategorySlug?: string }[]
  >(
    `*[_type=="article" && defined(slug.current)]{_id,"slug":slug.current,"catSlug":category->slug.current,subcategorySlug}`,
  );
  console.log(`Assigning subs to ${arts.length} articles…`);

  const hash = (s: string) => {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    return Math.abs(h);
  };

  const tx2 = sanity.transaction();
  let assigned = 0;
  let kept = 0;
  for (const a of arts) {
    const subs = SUBS[a.catSlug];
    if (!subs?.length) continue;
    if (a.subcategorySlug && subs.some((s) => s.slug === a.subcategorySlug)) {
      kept++;
      continue;
    }
    const pick = subs[hash(a.slug) % subs.length].slug;
    tx2.patch(a._id, { set: { subcategorySlug: pick } });
    assigned++;
  }
  await tx2.commit();
  console.log(`✓ Assigned ${assigned} articles, kept ${kept} existing`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
