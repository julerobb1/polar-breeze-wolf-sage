import { useEffect, useState } from "react";
import { CHANNELS } from "@/lib/lab/channels";
import { STAGE_STEPS } from "@/lib/lab/narrate";
import type { HvSnapshot } from "@/lib/emu/hypervisor";
import { useLab } from "@/lib/emu/store";
import { cn } from "@/lib/utils";

export function Television({ snap }: { snap: HvSnapshot }) {
  const powered = useLab((s) => s.powered);
  return (
    <div className="tv-bezel">
      <div className="tv-glass">
        <TvRaster snap={snap} />
        <div className="tv-scan" aria-hidden />
        {!powered && <div className="tv-glint" aria-hidden />}
      </div>
    </div>
  );
}

function TvRaster({ snap }: { snap: HvSnapshot }) {
  const powered = useLab((s) => s.powered);
  const tvMode = useLab((s) => s.tvMode);
  const channelIndex = useLab((s) => s.channelIndex);
  const showInfo = useLab((s) => s.showInfo);
  const ch = CHANNELS[channelIndex] ?? CHANNELS[0]!;
  const booting = powered && snap.programId === "ce" && snap.stage < 8 && !snap.panicked;
  const live = powered && snap.stage >= 8 && !snap.panicked;

  if (!powered) return <StandbyClock />;
  if (snap.panicked) return <PanicScreen reason={snap.panicked} />;
  if (booting) return <BootScreen snap={snap} />;

  return (
    <div className="relative h-full min-h-0 overflow-hidden bg-standby">
      {live && ch.kind === "picture" && ch.src && (
        <img
          key={ch.number}
          src={ch.src}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
      )}
      {live && ch.kind === "snow" && <Snow />}
      {!live && <div className="absolute inset-0 bg-standby" />}

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3 md:p-4">
        <span className="rounded-sm bg-standby/70 px-2 py-1 font-mono text-xs tracking-wide text-fg">
          {snap.role === "slave" ? "Bedroom" : snap.role === "wireless-master" ? "Wireless" : "Living room"}
        </span>
        <span className="rounded-sm bg-standby/70 px-2 py-1 text-right">
          <span className="block font-mono text-sm font-medium tabular text-fg">
            {ch.number}
          </span>
          <span className="block text-[0.65rem] uppercase tracking-wider text-muted">
            {ch.name}
          </span>
        </span>
      </div>

      {showInfo && live && tvMode === "live" && (
        <div className="absolute inset-x-3 bottom-3 rounded-md bg-standby/80 px-3 py-2 md:inset-x-4 md:bottom-4">
          <p className="font-mono text-sm text-fg">
            CH {ch.number} {ch.name}
          </p>
          <p className="text-xs text-muted">{ch.line}</p>
        </div>
      )}

      {tvMode === "guide" && <GuideOverlay />}
      {tvMode === "menu" && <MenuOverlay snap={snap} />}
    </div>
  );
}

function StandbyClock() {
  const now = useClock();
  return (
    <div className="flex h-full min-h-56 flex-col items-center justify-center bg-standby text-center md:min-h-72">
      <p className="font-mono text-4xl font-medium tabular tracking-tight text-fg/90 md:text-5xl">
        {now}
      </p>
      <p className="mt-3 text-xs uppercase tracking-[0.22em] text-subtle">Standby</p>
    </div>
  );
}

function useClock() {
  const [t, setT] = useState(() =>
    new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
  );
  useEffect(() => {
    const tick = () =>
      setT(new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
    const id = window.setInterval(tick, 10_000);
    return () => window.clearInterval(id);
  }, []);
  return t;
}

function BootScreen({ snap }: { snap: HvSnapshot }) {
  return (
    <div className="flex h-full min-h-56 flex-col bg-standby px-5 py-5 md:min-h-72 md:px-8 md:py-7">
      <p className="text-xs uppercase tracking-[0.28em] text-subtle">Uverse Lab</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-fg md:text-3xl">
        Model set-top
      </h2>
      <p className="mt-1 max-w-sm text-sm text-muted">
        Not AT&T firmware. A tiny program walking the same steps.
      </p>
      <ol className="mt-6 flex flex-1 flex-col justify-center gap-2">
        {STAGE_STEPS.map((s) => {
          const done = snap.stage > s.stage || snap.stage === 8;
          const here = snap.stage === s.stage;
          return (
            <li
              key={s.stage}
              className={cn(
                "flex items-center gap-3 text-sm transition-opacity duration-200",
                here ? "text-fg" : done ? "text-muted" : "text-subtle/60",
              )}
            >
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  here ? "bg-crt" : done ? "bg-ok" : "bg-subtle/50",
                )}
              />
              {s.label}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function PanicScreen({ reason }: { reason: string }) {
  return (
    <div className="flex h-full min-h-56 flex-col items-center justify-center bg-standby px-6 text-center">
      <p className="text-xs uppercase tracking-[0.22em] text-bad">Panic</p>
      <p className="mt-3 max-w-sm text-sm text-muted">
        The program asked for a part that was not ready, and it froze. That is
        what a real box does.
      </p>
      <p className="mt-2 font-mono text-xs text-subtle">{reason}</p>
    </div>
  );
}

function Snow() {
  return <div className="tv-snow absolute inset-0" aria-hidden />;
}

function GuideOverlay() {
  const channelIndex = useLab((s) => s.channelIndex);
  const guideIndex = useLab((s) => s.guideIndex);
  return (
    <div className="absolute inset-0 flex flex-col bg-standby/88">
      <div className="border-b border-line px-4 py-3">
        <p className="text-xs uppercase tracking-[0.2em] text-subtle">Guide</p>
        <p className="text-sm text-muted">Channel Up / Down, then OK</p>
      </div>
      <ul className="flex-1 overflow-auto px-2 py-2">
        {CHANNELS.map((ch, i) => (
          <li
            key={ch.number}
            className={cn(
              "flex items-center justify-between rounded-sm px-3 py-2.5",
              i === guideIndex && "bg-elevated",
            )}
          >
            <div className="flex items-center gap-3">
              <span className="w-6 font-mono text-sm tabular text-fg">{ch.number}</span>
              <span className="text-sm text-fg">{ch.name}</span>
            </div>
            {i === channelIndex && (
              <span className="text-[0.65rem] uppercase tracking-wider text-crt">
                Now
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function MenuOverlay({ snap }: { snap: HvSnapshot }) {
  const setRole = useLab((s) => s.setRole);
  return (
    <div className="absolute inset-0 flex flex-col bg-standby/90 px-4 py-4">
      <p className="text-xs uppercase tracking-[0.2em] text-subtle">Box menu</p>
      <h3 className="mt-1 text-lg font-medium">What kind of box is this?</h3>
      <p className="mt-1 max-w-sm text-sm text-muted">
        A real U-verse house had a living-room box and optional bedroom boxes.
        The chip asks. We answer.
      </p>
      <div className="mt-4 flex flex-col gap-2">
        {(
          [
            ["master", "Living room", "The main box."],
            ["wireless-master", "Wireless main", "Same job, different radio."],
            ["slave", "Bedroom", "A thin box that follows the main one."],
          ] as const
        ).map(([id, title, blurb]) => (
          <button
            key={id}
            type="button"
            onClick={() => setRole(id)}
            className={cn(
              "rounded-md px-3 py-2.5 text-left transition-colors duration-150",
              snap.role === id ? "bg-elevated text-fg" : "text-muted hover:text-fg",
            )}
          >
            <span className="block text-sm font-medium">{title}</span>
            <span className="block text-xs text-subtle">{blurb}</span>
          </button>
        ))}
      </div>
      <p className="mt-auto pt-4 text-xs text-subtle">
        Changing role cold-boots the box. Press Power again.
      </p>
    </div>
  );
}

export function SetTop({ on }: { on: boolean }) {
  return (
    <div className="stb">
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2">
          <span
            className={cn("stb-led", on ? "stb-led-on" : "stb-led-off")}
            aria-hidden
          />
          <span className="text-[0.65rem] uppercase tracking-[0.18em] text-subtle">
            {on ? "On" : "Standby"}
          </span>
        </div>
        <span className="text-[0.65rem] uppercase tracking-[0.16em] text-subtle">
          Model box
        </span>
      </div>
    </div>
  );
}
