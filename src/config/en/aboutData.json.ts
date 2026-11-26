/**
 * Copy of the About us page (Figma "Plumber - Website - Ready", frame About us 2728:4912,
 * read from the file on 2026-11-18). Every string is the Figma text, including the ones that
 * look like placeholders ("September 2026" as the founding date) so the page stays identical
 * to the design until the designer changes them. The team eyebrow reads "Meet the Plumbers"
 * instead of the Figma "FAQ".
 */
import amine from "@assets/images/about/amine.jpg";
import aurelien from "@assets/images/about/aurelien.jpg";
import team from "@assets/images/about/team.jpg";
import thibaud from "@assets/images/about/thibaud.jpg";
import thibault from "@assets/images/about/thibault.jpg";
import thomas from "@assets/images/about/thomas.jpg";
import { PLUMBER_GITHUB_REPO_URL } from "@js/plumberGithubRepo";

export const aboutHero = {
  eyebrow: "About Plumber",
  /** grey part of the title, then the white part */
  title: "Keep every company safe in a world that writes",
  titleAccent: "more code than anyone can check.",
  paragraphs: [
    "AI now writes and changes software faster than any team can review it, and every part of the stack that can change unseen is a way in. Plumber is the security agent that checks those changes before they reach production.",
    "We started where attackers hit first, the CI/CD pipeline: Plumber checks every pipeline before it runs, grades it from A to E, and opens the pull request that fixes what it finds. Plumber started in September 2026; its founders have built CI/CD pipelines since 2020 and now work from San Francisco.",
  ],
  facts: [
    { label: "Founded", value: "September 2026" },
    { label: "Based in", value: "San Francisco" },
    { label: "Building pipelines", value: "Since 2020" },
  ],
  numbers: [
    { value: "120.000+", label: "Repositories scanned" },
    { value: "248.517", label: "Attack paths found" },
    { value: "140.000+", label: "Open-source downloads" },
  ],
};

export const aboutStory = {
  eyebrow: "Our story",
  title: "How Plumber",
  titleAccent: "started.",
  photo: team,
  photoAlt: "The Plumber founding team standing in a street",
  columns: {
    left: {
      title: "How it all started",
      text: "Aurélien Coget and Thomas Boni met in 2018 at a blockchain startup, where together they built and ran its software delivery, from source control to automated deployments. In 2020 they co-founded a DevOps firm that built thousands of CI/CD pipelines for clients, then a product that helped teams standardize them. They ran it all bootstrapped.",
    },
    right: [
      {
        title: "One crucial mistake",
        text: "Then they saw what a pipeline can do when nobody checks it. They were contributing code at a company with a strong security setup and plenty of security tools. They pushed a change, the pipeline ran, did its job and turned green every day. The company was hacked anyway, silently. Their code had nothing to do with it: a leaking pipeline did, and none of the tools in place caught it. Green means the build worked, not that it is safe.",
      },
      {
        title: "The solution",
        text: "In March 2025, attackers changed tj-actions, a pipeline building block used by more than 23,000 repositories. Every pipeline that ran it printed its cloud keys and access tokens into the build logs, and the builds still passed. The Shai-Hulud worm followed eight months later. Meanwhile, AI writes a growing share of the world’s pipelines, faster than anyone reviews them. In September 2026 Aurélien and Thomas started Plumber to close that gap: it checks every pipeline before it runs, so the next leak gets caught before it starts.",
      },
    ],
  },
};

export const aboutBeliefs = {
  eyebrow: "What we believe",
  title: "The most powerful system in your company is the one nobody watches.",
  text: "Your pipeline has more access than most engineers. It reaches your code, your secrets and your production environment, and it runs without anyone looking. When attackers get in through it, it still turns green. So we build Plumber on three rules.",
  rules: [
    {
      number: "01",
      title: "Trust nothing by default.",
      text: "A version tag can be rewritten after you approve it. Plumber treats every action, image and dependency as untrusted until it’s pinned to an exact version and given only the access it needs.",
    },
    {
      number: "02",
      title: "Check it before it runs.",
      text: "A leaked secret can’t be taken back. Plumber checks every pipeline change in the pull request, before a weak config ever gets the chance to run.",
    },
    {
      number: "03",
      title: "Every finding comes with the fix.",
      text: "A list of problems is just more work for a busy team. Plumber opens the pull request with the fix; a developer reviews it and merges.",
    },
    {
      number: "04",
      title: "Don’t take our word for it.",
      text: "The scanner is open source and every grade is reproducible. Run it yourself and you’ll get the same score.",
      link: { text: "View on GitHub", href: PLUMBER_GITHUB_REPO_URL, track: "See on GitHub" },
    },
  ],
};

export const aboutTeam = {
  eyebrow: "Meet the Plumbers",
  title: "Our",
  titleAccent: "team",
  members: [
    {
      name: "Aurélien Coget",
      role: "Co-founder & CEO",
      bio: "Aurélien leads Plumber's market, customers and investors. He has spent 15+ years shipping software where security isn't optional, from France's Ministry of Armed Forces to a blockchain startup, where he led delivery, to thousands of client CI/CD pipelines.",
      photo: aurelien,
    },
    {
      name: "Thomas Boni",
      role: "Co-founder & CPO",
      bio: "Thomas leads product and engineering. He has spent 10+ years building the infrastructure software runs on, from a 2,000-node supercomputer cluster behind France's national weather forecasts to CI/CD and Kubernetes platforms for engineering teams.",
      photo: thomas,
    },
    {
      name: "Thibaud Van den Berghe",
      role: "Lead dev frontend",
      bio: "Builds the platform in NextJS, React and TypeScript, with a focus on UX. CI/CD Security Open-source contributor on more than 100+ repositories",
      photo: thibaud,
    },
    {
      name: "Amine Saboni",
      role: "ML Engineer",
      bio: "Amine builds Plumber's AI agent, which helps developers secure their pipelines, with a focus on AI systems that are reliable and frugal. He joined from Pruna AI and contributes to CodeCarbon, an open-source project that measures the environmental footprint of AI.",
      photo: amine,
    },
    {
      name: "Thibault Condemine",
      role: "Software Engineer",
      bio: "Thibault leads Plumber Scanner, our open-source CLI. Before Plumber he worked in digital identity, where he spent three years building and running a real-time fraud detection system that handles hundreds of thousands of events a day.",
      photo: thibault,
    },
  ],
};

export const aboutBackedBy = {
  title: "Backed by",
  /** the paragraph, split into grey and white runs in the Figma order */
  runs: [
    { text: "Plumber was bootstrapped until September 2026, when " },
    { text: "it raised a €1.5M", accent: true },
    { text: " seed round led by " },
    { text: "OVNI Capital", accent: true },
    { text: ", an early-stage fund with offices in San Francisco, Paris and Berlin. " },
    { text: "Angel investors from Docker, Baseten and Evertrust", accent: true },
    { text: " joined the round." },
  ],
};

export const aboutCta = {
  cards: [
    {
      number: "01",
      title: "See how your pipelines grade.",
      text: "Book a 30-minute demo and we'll show you your CI/CD security exposure.",
      cta: { text: "Book a demo", href: "/#book-a-demo", track: "Book a demo" },
      accent: true,
    },
    {
      number: "02",
      title: "Build it with us.",
      text: "We're a small team, and every hire shapes the product. See which roles are open now.",
      cta: { text: "Open roles", href: "/contact", track: "Open roles" },
      accent: false,
    },
  ],
};
