import type { HvSnapshot } from "@/lib/emu/hypervisor";
import { englishInsn, lastChipAsk, STAGE_STEPS } from "@/lib/lab/narrate";
import { useLab } from "@/lib/emu/store";
import { Button } from "@/components/ui/button";
import { cn, hex } from "@/lib/utils";

export function Inside({ snap }: { snap: HvSnapshot }) {
  const ask = lastChipAsk(snap);
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="flex flex-col gap-4">
        <section className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
          <h2 className="text-lg font-medium">What the chip is doing, in English</h2>
          <p className="mt-2 text-base text-fg">{englishInsn(snap.current)}</p>
          <p className="mt-2 text-sm text-muted">
            {ask ?? "No device traffic in the last moment."}
          </p>
          <p className="mt-3 font-mono text-xs text-subtle">
            {hex(snap.pc)} · {snap.current}
          </p>
        </section>

        <section className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
          <h3 className="text-sm font-medium">Boot checklist</h3>
          <ol className="mt-3 flex flex-col gap-2">
            {STAGE_STEPS.map((s) => {
              const done = snap.stage > s.stage || (snap.stage === 8 && s.stage === 8);
              const here = snap.stage === s.stage;
              return (
                <li key={s.stage} className="flex items-start gap-3">
                  <span
                    className={cn(
                      "mt-1.5 size-1.5 shrink-0 rounded-full",
                      here ? "bg-crt" : done ? "bg-ok" : "bg-subtle",
                    )}
                  />
                  <div>
                    <p className={cn("text-sm", done || here ? "text-fg" : "text-subtle")}>
                      {s.label}
                    </p>
                    <p className="text-xs text-muted">{s.detail}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <section className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
          <h3 className="text-sm font-medium">How translation works</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            The first time the chip hits a stretch of code, we decode it and
            remember the translation. The next million times through that loop,
            we reuse the memory. That is why “hits” climb and “misses” stay
            small. We never convert the whole program up front.
          </p>
          <dl className="mt-4 grid grid-cols-3 gap-2">
            <Stat label="Hits" value={snap.dbtHits} />
            <Stat label="First times" value={snap.dbtMisses} />
            <Stat label="Remembered" value={snap.dbtBlocks} />
          </dl>
        </section>
      </div>

      <aside className="flex flex-col gap-4">
        <section className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
          <h3 className="text-sm font-medium">Alive?</h3>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            <Row ok={snap.criteria.loaded} label="Program loaded" />
            <Row ok={snap.insnCount > 0} label="Chip has taken a step" />
            <Row ok={snap.criteria.tunerLocked} label="Tuner says locked" />
            <Row ok={snap.criteria.watchdogFed} label="Watchdog fed" />
            <Row ok={snap.stage >= 8} label="Sitting in the live loop" />
            <Row ok={!snap.panicked} label="Has not panicked" />
          </ul>
          <p className="mt-3 font-mono text-xs text-subtle">
            {snap.insnCount.toLocaleString()} steps · {snap.frames.toLocaleString()} frames
          </p>
        </section>
        <TransportMini />
      </aside>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-sm bg-inset px-3 py-2">
      <dt className="text-[0.65rem] uppercase tracking-wider text-subtle">{label}</dt>
      <dd className="mt-1 font-mono text-lg tabular text-fg">{value.toLocaleString()}</dd>
    </div>
  );
}

function Row({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className="flex items-center justify-between gap-2">
      <span className={ok ? "text-fg" : "text-muted"}>{label}</span>
      <span className={ok ? "text-ok" : "text-subtle"}>{ok ? "yes" : "no"}</span>
    </li>
  );
}

function TransportMini() {
  const running = useLab((s) => s.running);
  const toggle = useLab((s) => s.toggle);
  const step = useLab((s) => s.step);
  const reset = useLab((s) => s.reset);
  const powered = useLab((s) => s.powered);
  return (
    <section className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
      <h3 className="text-sm font-medium">Slow it down</h3>
      <p className="mt-1 text-xs text-muted">
        Pause and step if you want to watch one instruction at a time.
      </p>
      <div className="mt-3 flex gap-2">
        <Button variant="secondary" onClick={toggle} disabled={!powered}>
          {running ? "Pause" : "Run"}
        </Button>
        <Button variant="secondary" onClick={step} disabled={!powered}>
          One step
        </Button>
        <Button variant="secondary" onClick={reset}>
          Reset
        </Button>
      </div>
    </section>
  );
}
