export const REG_NAMES = [
  "zero",
  "at",
  "v0",
  "v1",
  "a0",
  "a1",
  "a2",
  "a3",
  "t0",
  "t1",
  "t2",
  "t3",
  "t4",
  "t5",
  "t6",
  "t7",
  "s0",
  "s1",
  "s2",
  "s3",
  "s4",
  "s5",
  "s6",
  "s7",
  "t8",
  "t9",
  "k0",
  "k1",
  "gp",
  "sp",
  "fp",
  "ra",
] as const;

export const REG_ALIASES: Record<string, number> = Object.fromEntries([
  ...REG_NAMES.map((n, i) => [n, i] as const),
  ...REG_NAMES.map((n, i) => ["$" + n, i] as const),
  ...Array.from({ length: 31 }, (_, i) => [`$${i}`, i] as const),
  ["$0", 0],
]);

export type RoleId = "master" | "wireless-master" | "slave";

export const ROLE_VALUE: Record<RoleId, number> = {
  master: 1,
  "wireless-master": 2,
  slave: 3,
};

export const ROLE_LABEL: Record<RoleId, string> = {
  master: "MASTER",
  "wireless-master": "WIRELESS MASTER",
  slave: "SLAVE",
};

export const PHYS_RAM_SIZE = 16 * 1024 * 1024;
export const KSEG0 = 0x80000000;
export const KSEG1 = 0xa0000000;
export const ENTRY_PC = 0x80001000;
export const STACK_TOP = 0x80080000;
export const MAILBOX = 0x80010000;
export const FRAMEBUFFER = 0x80020000;
export const FB_COLS = 40;
export const FB_ROWS = 16;
export const FB_SIZE = FB_COLS * FB_ROWS;

export const STAGE = {
  RESET: 0,
  BOOTLOADER: 1,
  OEMINIT: 2,
  KERNEL: 3,
  DRIVERS: 4,
  ROLE: 5,
  DRM: 6,
  MIDDLEWARE: 7,
  UI_LOOP: 8,
  PANIC: 0xff,
} as const;

export const STAGE_NAME: Record<number, string> = {
  0: "RESET",
  1: "BOOTLOADER",
  2: "OEMINIT",
  3: "KERNEL",
  4: "DRIVERS",
  5: "ROLE",
  6: "PLAYREADY",
  7: "MIDDLEWARE",
  8: "UI_LOOP",
  255: "PANIC",
};

export const MMIO = {
  IRQ: 0x1f000000,
  TIMER: 0x1f010000,
  UART: 0x1f020000,
  NAND: 0x1f030000,
  TUNER: 0x1f040000,
  PANEL: 0x1f050000,
  DRM: 0x1f060000,
  ROLE: 0x1f070000,
} as const;

export interface IDeviceEmulator {
  id: string;
  name: string;
  base: number;
  size: number;
  read(offset: number): number;
  write(offset: number, value: number): void;
  reset(): void;
  lastRead?: number;
  lastWrite?: number;
}

export interface Decoded {
  raw: number;
  pc: number;
  op: number;
  rs: number;
  rt: number;
  rd: number;
  shamt: number;
  funct: number;
  imm: number;
  simm: number;
  target: number;
  mnemonic: string;
  operands: string;
  isControl: boolean;
  isStore: boolean;
  isLoad: boolean;
  isSyscall: boolean;
}

export type HostOpKind =
  | "li"
  | "mov"
  | "alu"
  | "shift"
  | "load"
  | "store"
  | "mul"
  | "div"
  | "mfhi"
  | "mflo"
  | "mthi"
  | "mtlo"
  | "br"
  | "jmp"
  | "jal"
  | "jr"
  | "syscall"
  | "mfc0"
  | "mtc0"
  | "nop";

export interface HostOp {
  kind: HostOpKind;
  x64: string;
  guest: string;
}

export interface TranslatedBlock {
  startPc: number;
  endPc: number;
  words: number;
  guest: Decoded[];
  host: HostOp[];
  hits: number;
  execute: () => number;
}

export interface MmioEvent {
  n: number;
  pc: number;
  rw: "R" | "W";
  addr: number;
  value: number;
  device: string;
}

export interface BootCriteria {
  loaded: boolean;
  executed: boolean;
  insnCount: number;
  stage: number;
  frames: number;
  mmioReads: number;
  mmioWrites: number;
  watchdogFed: boolean;
  tunerLocked: boolean;
  drmPresent: boolean;
  role: number;
  panicked: string | null;
  pcInUiLoop: boolean;
  technicallyBoots: boolean;
}

export interface ProgramDef {
  id: string;
  title: string;
  blurb: string;
  kind: "probe" | "demo" | "ce";
  source: string;
}

export function virtToPhys(addr: number): number {
  const a = addr >>> 0;
  if (a >= 0x80000000 && a <= 0xbfffffff) return a & 0x1fffffff;
  return a;
}

export function kseg1(phys: number): number {
  return (0xa0000000 + (phys & 0x1fffffff)) >>> 0;
}
