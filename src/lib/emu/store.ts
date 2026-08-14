import { create } from "zustand";
import { Hypervisor, runSelfTest, type HvSnapshot } from "./hypervisor";
import type { RoleId } from "./types";
import { wrapIndex } from "@/lib/lab/channels";

let hv: Hypervisor | null = null;

export function getHv(): Hypervisor {
  if (!hv) hv = new Hypervisor();
  if (typeof window !== "undefined") {
    (window as unknown as { __hv: () => Hypervisor }).__hv = getHv;
  }
  return hv;
}

export type Speed = "watch" | "run" | "turbo";
export type LabTab = "room" | "how" | "inside";
export type TvMode = "live" | "guide" | "menu";
export type RemoteKey =
  | "power"
  | "ch+"
  | "ch-"
  | "guide"
  | "menu"
  | "ok"
  | "exit"
  | "info";

const PANEL_BITS: Record<Exclude<RemoteKey, "power">, number> = {
  "ch+": 1,
  "ch-": 2,
  guide: 4,
  menu: 8,
  ok: 16,
  exit: 32,
  info: 64,
};

export interface Proof {
  ok: boolean;
  detail: string;
}

interface LabStore {
  snap: HvSnapshot | null;
  running: boolean;
  speed: Speed;
  tab: LabTab;
  powered: boolean;
  tvMode: TvMode;
  channelIndex: number;
  guideIndex: number;
  lastRemote: RemoteKey | null;
  introOpen: boolean;
  showInfo: boolean;
  proof: Proof | null;
  proving: boolean;
  sync: () => void;
  load: (id: string) => void;
  reset: () => void;
  step: () => void;
  toggle: () => void;
  setSpeed: (s: Speed) => void;
  setTab: (t: LabTab) => void;
  setRole: (r: RoleId) => void;
  pump: (n: number) => void;
  power: () => void;
  remote: (key: RemoteKey) => void;
  dismissIntro: () => void;
  proveChip: () => void;
  backToBox: () => void;
}

function readIntro(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem("uverse-lab-intro") !== "1";
  } catch {
    return true;
  }
}

export const useLab = create<LabStore>((set, get) => ({
  snap: null,
  running: false,
  speed: "run",
  tab: "room",
  powered: false,
  tvMode: "live",
  channelIndex: 0,
  guideIndex: 0,
  lastRemote: null,
  introOpen: readIntro(),
  showInfo: false,
  proof: null,
  proving: false,
  sync: () => {
    if (typeof window === "undefined") return;
    set({ snap: getHv().snapshot() });
  },
  load: (id) => {
    getHv().load(id);
    set({ running: false, snap: getHv().snapshot() });
  },
  reset: () => {
    getHv().reset();
    set({
      running: get().powered,
      tvMode: "live",
      snap: getHv().snapshot(),
    });
  },
  step: () => {
    getHv().step();
    set({ snap: getHv().snapshot() });
  },
  toggle: () => {
    const next = !get().running;
    set({ running: next, powered: next ? true : get().powered });
  },
  setSpeed: (speed) => set({ speed }),
  setTab: (tab) => set({ tab }),
  setRole: (r) => {
    getHv().setRole(r);
    getHv().reset();
    set({ running: false, powered: false, tvMode: "live", snap: getHv().snapshot() });
  },
  pump: (n) => {
    getHv().runBatch(n);
    const snap = getHv().snapshot();
    const stop = snap.halted || !!snap.panicked;
    set({ snap, running: stop ? false : get().running });
  },
  power: () => {
    const { powered, snap } = get();
    if (powered) {
      set({ powered: false, running: false, tvMode: "live", showInfo: false });
      return;
    }
    const cold = !snap || snap.stage === 0 || snap.programId !== "ce";
    if (cold || (snap && snap.stage < 8)) {
      getHv().load("ce");
      getHv().reset();
    }
    set({
      powered: true,
      running: true,
      tvMode: "live",
      lastRemote: "power",
      introOpen: false,
      snap: getHv().snapshot(),
    });
    try {
      window.localStorage.setItem("uverse-lab-intro", "1");
    } catch {
      /* ignore */
    }
  },
  remote: (key) => {
    if (key === "power") {
      get().power();
      return;
    }
    if (!get().powered) return;
    getHv().pressPanel(PANEL_BITS[key]);
    window.setTimeout(() => getHv().pressPanel(0), 280);

    const { tvMode, channelIndex, guideIndex } = get();
    if (key === "guide") {
      set({
        tvMode: tvMode === "guide" ? "live" : "guide",
        lastRemote: key,
        guideIndex: channelIndex,
        showInfo: false,
        snap: getHv().snapshot(),
      });
      return;
    }
    if (key === "menu") {
      set({
        tvMode: tvMode === "menu" ? "live" : "menu",
        lastRemote: key,
        showInfo: false,
        snap: getHv().snapshot(),
      });
      return;
    }
    if (key === "exit") {
      set({ tvMode: "live", lastRemote: key, showInfo: false, snap: getHv().snapshot() });
      return;
    }
    if (key === "info") {
      set({ showInfo: !get().showInfo, lastRemote: key, snap: getHv().snapshot() });
      return;
    }
    if (key === "ch+" || key === "ch-") {
      const dir = key === "ch+" ? 1 : -1;
      if (tvMode === "guide") {
        set({
          guideIndex: wrapIndex(guideIndex + dir),
          lastRemote: key,
          snap: getHv().snapshot(),
        });
      } else {
        set({
          channelIndex: wrapIndex(channelIndex + dir),
          lastRemote: key,
          tvMode: "live",
          showInfo: true,
          snap: getHv().snapshot(),
        });
        window.setTimeout(() => set({ showInfo: false }), 3200);
      }
      return;
    }
    if (key === "ok") {
      if (tvMode === "guide") {
        set({
          channelIndex: guideIndex,
          tvMode: "live",
          lastRemote: key,
          showInfo: true,
          snap: getHv().snapshot(),
        });
        window.setTimeout(() => set({ showInfo: false }), 3200);
      } else {
        set({ lastRemote: key, snap: getHv().snapshot() });
      }
    }
  },
  dismissIntro: () => {
    set({ introOpen: false });
    try {
      window.localStorage.setItem("uverse-lab-intro", "1");
    } catch {
      /* ignore */
    }
  },
  proveChip: () => {
    set({ proving: true, proof: null });
    const proof = runSelfTest();
    set({ proving: false, proof });
  },
  backToBox: () => {
    getHv().load("ce");
    getHv().reset();
    set({
      snap: getHv().snapshot(),
      powered: false,
      running: false,
      tvMode: "live",
      tab: "room",
    });
  },
}));
