import type { HvSnapshot } from "@/lib/emu/hypervisor";
import { CHANNELS } from "./channels";

export const STAGE_STEPS = [
  { stage: 1, label: "Starting the box", detail: "The first tiny program wakes up." },
  { stage: 2, label: "Checking the board", detail: "It asks what kind of box it is sitting in." },
  { stage: 3, label: "Starting the system", detail: "A clock starts so it knows time is passing." },
  { stage: 4, label: "Finding the parts", detail: "Flash chip, tuner, front panel — we say they are here." },
  { stage: 5, label: "Who am I?", detail: "Living-room box, bedroom box, or slave." },
  { stage: 6, label: "Copy protection", detail: "It looks for a movie-license chip. We stub it." },
  { stage: 7, label: "TV software", detail: "The guide and live picture stack come up." },
  { stage: 8, label: "Live", detail: "The box is painting frames so it will not fall asleep." },
];

const DEVICE_PLAIN: Record<string, string> = {
  tuner: "the tuner — the part that finds a channel",
  panel: "the front-panel buttons",
  timer: "the box clock / watchdog",
  nand: "the flash chip, where software would live",
  drm: "the copy-protection chip",
  role: "the identity switch (living room vs bedroom)",
  irq: "the interrupt controller",
  uart: "a serial port used for debug text",
};

export function lastChipAsk(snap: HvSnapshot): string | null {
  const e = snap.mmio[snap.mmio.length - 1];
  if (!e) return null;
  const who = DEVICE_PLAIN[e.device] ?? e.device;
  if (e.rw === "R") return `The chip just asked ${who}: are you there? We said yes.`;
  if (e.device === "timer") return "The chip just fed the watchdog so the box will not reboot itself.";
  return `The chip just wrote to ${who}.`;
}

export function englishInsn(line: string): string {
  const s = line.trim().toLowerCase();
  if (!s || s === "nop") return "A pause. The chip waits one beat.";
  if (s.startsWith("lw") || s.startsWith("lbu") || s.startsWith("lh"))
    return "It is reading a number out of memory.";
  if (s.startsWith("sw") || s.startsWith("sb") || s.startsWith("sh"))
    return "It is writing a number into memory.";
  if (s.startsWith("addiu") || s.startsWith("addi") || s.startsWith("addu") || s.startsWith("add "))
    return "It is adding two numbers.";
  if (s.startsWith("sub")) return "It is subtracting.";
  if (s.startsWith("j ") || s.startsWith("jr") || s.startsWith("jal"))
    return "It is jumping to another part of the program.";
  if (s.startsWith("beq") || s.startsWith("bne") || s.startsWith("bgtz") || s.startsWith("blez"))
    return "It is deciding which way to go next.";
  if (s.startsWith("lui") || s.startsWith("ori") || s.startsWith("andi"))
    return "It is building a number in a register.";
  if (s.startsWith("syscall")) return "It is asking the host for a favor (print, exit).";
  if (s.startsWith("mult")) return "It is multiplying.";
  return "The chip is doing one small step.";
}

export function narrate(
  snap: HvSnapshot,
  extras: {
    powered: boolean;
    channelIndex: number;
    lastRemote: string | null;
  },
): { headline: string; body: string; whisper: string } {
  const ch = CHANNELS[extras.channelIndex] ?? CHANNELS[0]!;
  const ask = lastChipAsk(snap);

  if (!extras.powered) {
    return {
      headline: "The box is off.",
      body: "Press Power. A tiny program will start — the first thing a set-top runs when you wake it. You do not need to read any of the numbers.",
      whisper: "Standby. Red light on the front panel.",
    };
  }

  if (snap.panicked) {
    return {
      headline: "The box panicked.",
      body: "It asked for a part we did not fake well enough, and it froze. That is exactly what a real U-verse box does when the hardware looks wrong.",
      whisper: snap.panicked,
    };
  }

  if (snap.programId !== "ce") {
    return {
      headline: "A proof program is running.",
      body: "This is not the TV. This is a tiny test so you can see the chip actually compute something, then we put the box back.",
      whisper: snap.uart.trim() || englishInsn(snap.current),
    };
  }

  if (snap.stage > 0 && snap.stage < 8) {
    const step = STAGE_STEPS.find((s) => s.stage === snap.stage) ?? STAGE_STEPS[0]!;
    return {
      headline: step.label,
      body: step.detail,
      whisper: ask ?? englishInsn(snap.current),
    };
  }

  if (snap.stage >= 8) {
    const remote =
      extras.lastRemote === "ch+"
        ? `You pressed Channel Up. Now showing ${ch.number} ${ch.name}.`
        : extras.lastRemote === "ch-"
          ? `You pressed Channel Down. Now showing ${ch.number} ${ch.name}.`
          : extras.lastRemote === "guide"
            ? "Guide is open. The chip is still looping in the background."
            : extras.lastRemote === "menu"
              ? "Box menu. Role and honesty live here."
              : null;
    return {
      headline: "The TV is on.",
      body:
        remote ??
        `Channel ${ch.number} · ${ch.name}. The climbing frame count is the box painting the next picture so it will not fall asleep. The picture is ours. The heartbeat is the chip.`,
      whisper: ask ?? `Frame ${snap.frames.toLocaleString()} · still looping.`,
    };
  }

  return {
    headline: "Waking up…",
    body: "The chip has the program. It has not taken its first step yet.",
    whisper: "Waiting on Power.",
  };
}
