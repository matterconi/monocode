import { useEffect, useRef, useState } from "react";
import { ArrowRight, Camera, Copy, Link2, MessageCircle } from "lucide-react";
import Hls from "hls.js";
import { motion, useScroll, useTransform } from "framer-motion";
import type { MotionValue } from "framer-motion";
import { SiteFooter } from "./components/SiteFooter";
import { Button } from "./components/ui/button";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6, delay, ease: "easeOut" as const },
});

const heroVideo =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260325_120549_0cd82c36-56b3-4dd9-b190-069cfc3a623f.mp4";
const missionVideo =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260325_132944_a0d124bb-eaa1-4082-aa30-2310efb42b4b.mp4";
const solutionVideo =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260325_125119_8e5ae31c-0021-4396-bc08-f7aebeb877a2.mp4";
const ctaHlsVideo = "https://stream.mux.com/8wrHPCX2dC3msyYU9ObwqNdm00u3ViXvOSHUMRYSEe5Q.m3u8";
const installCommand = "bunx @monocode/cli";

const navLinks = ["Home", "How It Works", "Philosophy", "Use Cases"];

const platformCards = [
  {
    name: "ChatGPT",
    description: "Agents now answer developer questions before users ever reach documentation.",
    icon: "loop",
  },
  {
    name: "Perplexity",
    description: "Search is becoming synthesis, citation, and decision support in one surface.",
    icon: "rays",
  },
  {
    name: "Google AI",
    description: "AI overviews compress product stories into a few lines of context.",
    icon: "grid",
  },
];

const features = [
  {
    title: "Context Files",
    description: "Keep project goals, architecture, standards, and decisions close to the coding loop.",
  },
  {
    title: "Local Tools",
    description: "Read, edit, search, and execute against the active workspace with clear boundaries.",
  },
  {
    title: "Session Memory",
    description: "Persist conversations with stable modes, model identity, and recoverable history.",
  },
  {
    title: "Build / Plan",
    description: "Switch between implementation and strategy without losing terminal flow.",
  },
];

function Mark({ className = "" }: { className?: string }) {
  return (
    <span className={`relative grid place-items-center rounded-full border-2 border-foreground/60 ${className}`}>
      <span className="h-1/2 w-1/2 rounded-full border border-foreground/60" />
    </span>
  );
}

function Navbar() {
  return (
    <header className="fixed top-0 z-50 flex w-full items-center justify-between px-8 py-4 md:px-28">
      <a href="#" className="flex items-center gap-3" aria-label="Monocode home">
        <Mark className="h-7 w-7" />
        <span className="text-base font-bold tracking-[-0.02em]">Monocode</span>
      </a>

      <nav className="hidden items-center gap-3 text-sm md:flex" aria-label="Primary navigation">
        {navLinks.map((link, index) => (
          <span key={link} className="flex items-center gap-3">
            <a href={`#${link.toLowerCase().replaceAll(" ", "-")}`} className="text-muted-foreground transition-colors hover:text-foreground">
              {link}
            </a>
            {index < navLinks.length - 1 ? <span className="text-muted-foreground/50">•</span> : null}
          </span>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        {[Camera, Link2, MessageCircle].map((Icon, index) => (
          <a key={index} href="#" className="liquid-glass grid h-10 w-10 place-items-center rounded-full" aria-label="Social link">
            <Icon className="h-4 w-4" />
          </a>
        ))}
      </div>
    </header>
  );
}

function AvatarRow() {
  return (
    <motion.div {...fadeUp(0)} className="mb-8 flex items-center justify-center gap-4">
      <div className="flex -space-x-2">
        {["M", "C", "D"].map((letter) => (
          <span key={letter} className="grid h-8 w-8 place-items-center rounded-full border-2 border-background bg-foreground text-xs font-semibold text-background">
            {letter}
          </span>
        ))}
      </div>
      <span className="text-sm text-muted-foreground">7,000+ developers already building with context</span>
    </motion.div>
  );
}

function HeroCtas() {
  const [copied, setCopied] = useState(false);

  async function copyInstallCommand() {
    await navigator.clipboard.writeText(installCommand);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <motion.div {...fadeUp(0.24)} className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
      <motion.button
        type="button"
        className="inline-flex items-center gap-3 rounded-full bg-foreground px-8 py-3 text-sm font-semibold text-background"
        onClick={copyInstallCommand}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
      >
        <span>{copied ? "COPIED" : installCommand}</span>
        <Copy className="h-4 w-4" />
      </motion.button>
      <a href="https://github.com/matterconi/monocode" target="_blank" rel="noreferrer">
        <Button variant="glass" className="rounded-full px-8 py-3 gap-3">
          <span>DOCS</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </a>
    </motion.div>
  );
}

function HeroSection() {
  return (
    <section id="home" className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 text-center">
      <video className="absolute inset-0 h-full w-full object-cover opacity-50" src={heroVideo} autoPlay loop muted playsInline />
      <div className="absolute inset-0 bg-background/35" />
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-background to-transparent" />

      <div className="relative z-10 mx-auto max-w-6xl pt-28 md:pt-32">
        <AvatarRow />
        <motion.h1 {...fadeUp(0.08)} className="text-5xl font-medium tracking-[-2px] md:text-7xl lg:text-8xl">
          Code with <span className="font-serif font-normal italic">context</span> in motion
        </motion.h1>
        <motion.p {...fadeUp(0.16)} className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-[hsl(var(--hero-subtitle))]">
          Monocode brings your agent, project memory, local tools, and terminal workflow into one focused loop for building software with depth and direction.
        </motion.p>
        <HeroCtas />
      </div>
    </section>
  );
}

function PlatformIcon({ kind }: { kind: string }) {
  return (
    <div className="relative grid h-[200px] w-[200px] place-items-center rounded-full border border-border bg-card">
      {kind === "loop" ? <Mark className="h-24 w-24" /> : null}
      {kind === "rays" ? <div className="h-24 w-24 rounded-full border border-foreground/60 bg-[repeating-conic-gradient(from_0deg,rgba(255,255,255,0.7)_0deg,rgba(255,255,255,0.7)_8deg,transparent_8deg,transparent_24deg)]" /> : null}
      {kind === "grid" ? <div className="grid h-24 w-24 grid-cols-3 gap-2">{Array.from({ length: 9 }).map((_, index) => <span key={index} className="rounded-full bg-foreground/80" />)}</div> : null}
    </div>
  );
}

function SearchSection() {
  return (
    <section id="how-it-works" className="px-6 pt-52 pb-6 text-center md:pt-64 md:pb-9">
      <motion.h2 {...fadeUp(0)} className="text-5xl font-medium tracking-[-2px] md:text-7xl lg:text-8xl">
        Coding has <span className="font-serif font-normal italic">changed.</span> Have you?
      </motion.h2>
      <motion.p {...fadeUp(0.08)} className="mx-auto mt-6 mb-24 max-w-2xl text-lg text-muted-foreground">
        The interface for software work is shifting from isolated editors to context-aware systems that understand your project as it evolves.
      </motion.p>

      <div className="mx-auto mb-20 grid max-w-6xl gap-12 md:grid-cols-3 md:gap-8">
        {platformCards.map((card, index) => (
          <motion.article key={card.name} {...fadeUp(index * 0.08)} className="flex flex-col items-center">
            <PlatformIcon kind={card.icon} />
            <h3 className="mt-8 text-base font-semibold">{card.name}</h3>
            <p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">{card.description}</p>
          </motion.article>
        ))}
      </div>

      <motion.p {...fadeUp(0.08)} className="text-sm text-muted-foreground">
        If your tools do not understand the project, someone else will set the context.
      </motion.p>
    </section>
  );
}

function RevealedWord({ children, progress, index, total, highlight }: { children: string; progress: MotionValue<number>; index: number; total: number; highlight?: boolean }) {
  const start = index / total;
  const opacity = useTransform(progress, [start, Math.min(start + 0.12, 1)], [0.15, 1]);

  return (
    <motion.span style={{ opacity }} className={highlight ? "text-foreground" : "text-[hsl(var(--hero-subtitle))]"}>
      {children}{" "}
    </motion.span>
  );
}

function ScrollText({ text, className, highlights = [] }: { text: string; className: string; highlights?: string[] }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.35"] });
  const words = text.split(" ");

  return (
    <p ref={ref} className={className}>
      {words.map((word, index) => (
        <RevealedWord key={`${word}-${index}`} progress={scrollYProgress} index={index} total={words.length} highlight={highlights.includes(word.replace(/[—,.]/g, ""))}>
          {word}
        </RevealedWord>
      ))}
    </p>
  );
}

function MissionSection() {
  return (
    <section id="philosophy" className="px-6 pt-0 pb-32 md:pb-44">
      <motion.video {...fadeUp(0)} className="mx-auto aspect-square w-full max-w-[800px] object-cover opacity-85" src={missionVideo} autoPlay loop muted playsInline />
      <div className="mx-auto mt-16 max-w-5xl text-center">
        <ScrollText
          className="text-2xl font-medium tracking-[-1px] md:text-4xl lg:text-5xl"
          highlights={["context", "meets", "execution"]}
          text="We're building a space where context meets execution — where agents read the codebase, developers keep momentum, and every session becomes a decision trail worth keeping."
        />
        <ScrollText
          className="mt-10 text-xl font-medium md:text-2xl lg:text-3xl"
          text="A platform where code, memory, and local tools flow together — with less noise, less friction, and more meaning for every change shipped."
        />
      </div>
    </section>
  );
}

function SolutionSection() {
  return (
    <section id="use-cases" className="border-t border-border/30 px-6 py-32 md:py-44">
      <div className="mx-auto max-w-6xl">
        <motion.p {...fadeUp(0)} className="text-xs font-semibold uppercase tracking-[3px] text-muted-foreground">Solution</motion.p>
        <motion.h2 {...fadeUp(0.08)} className="mt-5 max-w-4xl text-4xl font-medium tracking-[-1.5px] md:text-6xl">
          The platform for <span className="font-serif font-normal italic">meaningful</span> development
        </motion.h2>
        <motion.video {...fadeUp(0.16)} className="mt-14 aspect-[3/1] w-full rounded-2xl object-cover opacity-90" src={solutionVideo} autoPlay loop muted playsInline />
        <div className="mt-12 grid gap-8 md:grid-cols-4">
          {features.map((feature, index) => (
            <motion.article key={feature.title} {...fadeUp(index * 0.06)}>
              <h3 className="text-base font-semibold">{feature.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{feature.description}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(ctaHlsVideo);
      hls.attachMedia(video);
      return () => hls.destroy();
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = ctaHlsVideo;
    }
  }, []);

  return <video ref={ref} className="absolute inset-0 z-0 h-full w-full object-cover opacity-70" autoPlay loop muted playsInline />;
}

function CtaSection() {
  return (
    <section className="relative overflow-hidden border-t border-border/30 px-6 py-32 text-center md:py-44">
      <CtaVideo />
      <div className="absolute inset-0 z-[1] bg-background/45" />
      <div className="relative z-10 mx-auto max-w-3xl">
        <motion.div {...fadeUp(0)} className="flex justify-center"><Mark className="h-10 w-10" /></motion.div>
        <motion.h2 {...fadeUp(0.08)} className="mt-8 text-5xl font-medium tracking-[-1px] md:text-7xl">
          Start Your <span className="font-serif font-normal italic">Loop</span>
        </motion.h2>
        <motion.p {...fadeUp(0.16)} className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
          Bring Monocode into the workspace where your code, context, and decisions already live.
        </motion.p>
        <motion.div {...fadeUp(0.24)} className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button>Install CLI</Button>
          <Button variant="glass">Read the Workflow</Button>
        </motion.div>
      </div>
    </section>
  );
}

export function App() {
  return (
    <main className="min-h-screen bg-background font-sans text-foreground">
      <Navbar />
      <HeroSection />
      <SearchSection />
      <MissionSection />
      <SolutionSection />
      <CtaSection />
      <SiteFooter />
    </main>
  );
}
