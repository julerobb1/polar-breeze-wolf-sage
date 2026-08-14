import { useEffect } from "react";
import { HowItWorks } from "@/components/lab/how";
import { Inside } from "@/components/lab/inside";
import { Remote } from "@/components/lab/remote";
import { SetTop, Television } from "@/components/lab/tv";
import { CHANNELS } from "@/lib/lab/channels";
import { narrate } from "@/lib/lab/narrate";
import { useLab, type RemoteKey } from "@/lib/emu/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SPEEDS = [
  { id: "watch" as const, label: "Watch", n: 80 },
  { id: "run" as const, label: "Run", n: 2000 },
  { id: "turbo" as const, label: "Turbo", n: 8000 },
];

export function LabApp() {
  const snap = useLab((s) => s.snap);
  const running = useLab((s) => s.running);
  const speed = useLab((s) => s.speed);
  const powered = useLab((s) => s.powered);
  const sync = useLab((s) => s.sync);
  const pump = useLab((s) => s.pump);
  const remote = useLab((s) => s.remote);
  const tab = useLab((s) => s.tab);

  useEffect(() => {
    sync();
  }, [sync]);

  useEffect(() => {
    for (const ch of CHANNELS) {
      if (!ch.src) continue;
      const img = new Image();
      img.src = ch.src;
    }
  }, []);

  useEffect(() => {
    if (!running || !powered) return;
    let raf = 0;
    let lastHold = 0;
    const n = SPEEDS.find((s) => s.id === speed)?.n ?? 2000;
    const tick = (t: number) => {
      const s = useLab.getState().snap;
      const booting = s && s.programId === "ce" && s.stage > 0 && s.stage < 8;
      if (booting) {
        if (t - lastHold > 520) {
          pump(90);
          lastHold = t;
        }
      } else {
        pump(n);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, speed, powered, pump]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const map: Record<string, RemoteKey> = {
        " ": "power",
        arrowup: "ch+",
        arrowdown: "ch-",
        g: "guide",
        m: "menu",
        i: "info",
        escape: "exit",
        enter: "ok",
      };
      const key = map[e.key.toLowerCase()];
      if (!key) return;
      e.preventDefault();
      remote(key);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [remote]);

  if (!snap) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-muted">
        Warming the living room…
      </div>
    );
  }

  return (
    <div className="room-root min-h-dvh">
      <div className="room-photo" aria-hidden />
      <div className="room-veil" aria-hidden />
      <Header />
      <div className="relative mx-auto max-w-6xl px-3 pb-10 pt-4 md:px-6">
        {tab === "room" && <Room snap={snap} />}
        {tab === "how" && <HowItWorks />}
        {tab === "inside" && <Inside snap={snap} />}
      </div>
      <Intro />
    </div>
  );
}

function Header() {
  const tab = useLab((s) => s.tab);
  const setTab = useLab((s) => s.setTab);
  const powered = useLab((s) => s.powered);
  const items = [
    { id: "room" as const, label: "The box" },
    { id: "how" as const, label: "What is this" },
    { id: "inside" as const, label: "Inside" },
  ];
  return (
    <header className="relative border-b border-line/80">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-3 py-3 md:px-6">
        <div>
          <h1 className="text-sm font-semibold tracking-tight">Uverse Lab</h1>
          <p className="text-xs text-muted">A model set-top you can actually watch</p>
        </div>
        <nav className="ml-auto flex gap-1 rounded-md bg-surface/80 p-1 shadow-[var(--shadow-border)]">
          {items.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "h-9 rounded-sm px-3 text-sm font-medium transition-colors duration-150",
                tab === t.id ? "bg-elevated text-fg" : "text-muted hover:text-fg",
              )}
            >
              {t.label}
            </button>
          ))}
        </nav>
        <span
          className={cn(
            "hidden rounded-sm px-2 py-1 text-[0.65rem] uppercase tracking-wider sm:inline",
            powered ? "bg-ok/15 text-ok" : "bg-elevated text-subtle",
          )}
        >
          {powered ? "Box on" : "Standby"}
        </span>
      </div>
    </header>
  );
}

function Room({ snap }: { snap: Parameters<typeof narrate>[0] }) {
  const powered = useLab((s) => s.powered);
  const channelIndex = useLab((s) => s.channelIndex);
  const lastRemote = useLab((s) => s.lastRemote);
  const speed = useLab((s) => s.speed);
  const setSpeed = useLab((s) => s.setSpeed);
  const copy = narrate(snap, { powered, channelIndex, lastRemote });

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_240px] lg:items-start">
      <div>
        <Television snap={snap} />
        <div className="mx-auto mt-2 max-w-3xl">
          <SetTop on={powered} />
        </div>
        <section className="mx-auto mt-5 max-w-3xl rounded-lg bg-surface/90 p-4 shadow-[var(--shadow-border)] md:p-5">
          <h2 className="text-xl font-semibold tracking-tight">{copy.headline}</h2>
          <p className="mt-2 text-base leading-relaxed text-muted">{copy.body}</p>
          <p className="mt-3 text-sm text-subtle">{copy.whisper}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {SPEEDS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSpeed(s.id)}
                className={cn(
                  "h-9 rounded-sm px-3 text-sm",
                  speed === s.id ? "bg-elevated text-fg" : "text-muted hover:text-fg",
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </section>
        <p className="mx-auto mt-4 max-w-3xl text-xs text-subtle">
          Model box · the chip is real · the picture is ours · not AT&T firmware
        </p>
      </div>
      <Remote />
    </div>
  );
}

function Intro() {
  const open = useLab((s) => s.introOpen);
  const power = useLab((s) => s.power);
  const dismissIntro = useLab((s) => s.dismissIntro);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-standby/70 p-4 md:items-center">
      <div className="w-full max-w-lg rounded-xl bg-surface p-6 shadow-[var(--shadow-border)] md:p-8">
        <p className="text-xs uppercase tracking-[0.22em] text-subtle">You do not need to code</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
          This is a fake U-verse box in a dark room.
        </h2>
        <p className="mt-3 text-base leading-relaxed text-muted">
          Inside it, a real tiny computer is running. The hex dump from before
          was that computer with no TV attached — which is why it felt fake.
        </p>
        <p className="mt-3 text-base leading-relaxed text-muted">
          Press Power. Watch the TV come on. Change the channel. That is the
          whole point.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button onClick={power}>Press Power</Button>
          <Button variant="secondary" onClick={dismissIntro}>
            I will look around first
          </Button>
        </div>
      </div>
    </div>
  );
}
