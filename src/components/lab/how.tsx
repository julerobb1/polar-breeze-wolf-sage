import { Button } from "@/components/ui/button";
import { useLab } from "@/lib/emu/store";

export function HowItWorks() {
  const proof = useLab((s) => s.proof);
  const proving = useLab((s) => s.proving);
  const proveChip = useLab((s) => s.proveChip);
  const setTab = useLab((s) => s.setTab);

  return (
    <article className="mx-auto flex max-w-2xl flex-col gap-8 px-1 py-2">
      <header>
        <p className="text-xs uppercase tracking-[0.22em] text-subtle">Plain English</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">
          Copilot described a real idea. This is that idea, in a box you can watch.
        </h2>
      </header>

      <section className="space-y-3">
        <h3 className="text-lg font-medium">What you were looking at before</h3>
        <p className="text-base leading-relaxed text-muted">
          That wall of green numbers was not a movie. A tiny computer inside this
          page was running. It only speaks MIPS — the language old U-verse boxes
          used. Your laptop does not speak MIPS, so every instruction gets
          translated as it happens. That is the “runtime translation” Copilot
          was talking about.
        </p>
        <p className="text-base leading-relaxed text-muted">
          The problem: if you do not read assembly, a working chip looks exactly
          like a screensaver. Numbers go up. Nothing on the screen means
          anything. It feels fake.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-medium">What this is now</h3>
        <p className="text-base leading-relaxed text-muted">
          Same chip. Same translation. Now it has a TV. Press Power and you can
          watch the box boot, lock a fake tuner, and sit in a live loop. Change
          the channel and the picture changes. That is cause and effect.
        </p>
      </section>

      <ol className="grid gap-4 md:grid-cols-3">
        <li className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
          <p className="text-xs uppercase tracking-[0.18em] text-subtle">1 · Chip</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            A real MIPS program is executing in this page. It is not a video of
            a CPU. It is a CPU.
          </p>
        </li>
        <li className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
          <p className="text-xs uppercase tracking-[0.18em] text-subtle">2 · Fake parts</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            A real box panics if the tuner or flash chip is missing. We do not
            have those, so when the program asks “are you there?” we say yes.
          </p>
        </li>
        <li className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
          <p className="text-xs uppercase tracking-[0.18em] text-subtle">3 · Picture</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Nobody has AT&T’s firmware. The TV picture is a model we put on top
            so you can see the box live, instead of reading hex.
          </p>
        </li>
      </ol>

      <section className="rounded-lg bg-surface p-5 shadow-[var(--shadow-border)]">
        <h3 className="text-lg font-medium">Prove the chip is not a movie</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          This runs two tiny programs that have only one correct answer: 40+2
          must be 42, and the 12th Fibonacci number must be 144. If the chip
          were fake, we could print any number. The test fails if the math is
          wrong.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button onClick={proveChip} disabled={proving}>
            {proving ? "Running…" : "Run the proof"}
          </Button>
          {proof && (
            <p className={proof.ok ? "text-sm text-ok" : "text-sm text-bad"}>
              {proof.ok ? "Both answers came back right." : "The chip failed."}{" "}
              <span className="font-mono text-xs text-muted">{proof.detail}</span>
            </p>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-medium">What this is not</h3>
        <p className="text-base leading-relaxed text-muted">
          Not stolen AT&T software. Not a real tuner. Not PlayReady movie keys.
          Pace, Motorola, Cisco, Ericsson — they do not have the schematics
          anymore. So this can never be a perfect clone. It can be honest: a
          model box whose CPU is real, whose parts are stubbed, and whose TV
          you can actually watch.
        </p>
      </section>

      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setTab("room")}>Back to the TV</Button>
        <Button variant="secondary" onClick={() => setTab("inside")}>
          Peek at the chip
        </Button>
      </div>
    </article>
  );
}
