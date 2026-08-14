import { assemble, type AssembleResult } from "./assembler";
import { Cpu, stepOne } from "./cpu";
import { DbtCache } from "./dbt";
import { decode, formatInsn } from "./decode";
import { createDevices } from "./devices";
import { programById, PROGRAMS } from "./firmware";
import { Memory } from "./memory";
import {
  ENTRY_PC,
  FB_COLS,
  FB_ROWS,
  FB_SIZE,
  FRAMEBUFFER,
  MAILBOX,
  ROLE_LABEL,
  STACK_TOP,
  STAGE_NAME,
  type BootCriteria,
  type RoleId,
} from "./types";

export interface HvSnapshot {
  pc: number;
  sp: number;
  hi: number;
  lo: number;
  regs: number[];
  insnCount: number;
  current: string;
  raw: number;
  halted: boolean;
  panicked: string | null;
  uart: string;
  stage: number;
  stageName: string;
  frames: number;
  roleWord: number;
  fb: string[];
  criteria: BootCriteria;
  dbtHits: number;
  dbtMisses: number;
  dbtBlocks: number;
  lastBlock: {
    start: number;
    hits: number;
    guest: string[];
    host: string[];
  } | null;
  hot: { start: number; hits: number; words: number }[];
  mmio: { n: number; pc: number; rw: "R" | "W"; addr: number; value: number; device: string }[];
  devices: { id: string; name: string; base: number; lastRead: number; lastWrite: number }[];
  listing: AssembleResult["listing"];
  programId: string;
  programTitle: string;
  role: RoleId;
  selfTest: { ok: boolean; detail: string };
  loaded: boolean;
  assembleErrors: string[];
}

export class Hypervisor {
  cpu = new Cpu();
  mem = new Memory();
  dbt = new DbtCache();
  devices = createDevices();
  uart = "";
  programId = "ce";
  assembled: AssembleResult | null = null;
  role: RoleId = "master";
  loaded = false;
  selfTest = { ok: false, detail: "not run" };

  constructor() {
    for (const d of this.devices.all) this.mem.registerDevice(d);
    this.mem.onUart = (ch) => {
      if (ch === 10) this.uart += "\n";
      else if (ch >= 32 && ch < 127) this.uart += String.fromCharCode(ch);
    };
    this.selfTest = runSelfTest();
    this.load("ce");
  }

  setRole(role: RoleId) {
    this.role = role;
    this.devices.role.setRole(role);
  }

  load(id: string) {
    const prog = programById(id);
    this.programId = prog.id;
    this.assembled = assemble(prog.source, ENTRY_PC);
    this.reset();
    this.mem.loadBinary(this.assembled.bytes, ENTRY_PC);
    this.loaded = true;
  }

  reset() {
    this.cpu.reset(ENTRY_PC, STACK_TOP);
    this.mem.reset();
    this.dbt.invalidate();
    this.uart = "";
    this.devices.role.setRole(this.role);
    if (this.assembled) this.mem.loadBinary(this.assembled.bytes, ENTRY_PC);
    this.loaded = !!this.assembled;
  }

  step() {
    if (this.cpu.halted || this.cpu.panicked) return;
    this.mem.lastPc = this.cpu.pc;
    stepOne(this.cpu, this.mem);
    this.devices.timer.tick(1);
  }

  stepBlock() {
    if (this.cpu.halted || this.cpu.panicked) return;
    this.dbt.runBlock(this.cpu, this.mem);
    this.devices.timer.tick(8);
  }

  runBatch(n: number) {
    const end = this.cpu.insnCount + n;
    while (this.cpu.insnCount < end && !this.cpu.halted && !this.cpu.panicked) {
      this.dbt.runBlock(this.cpu, this.mem);
      this.devices.timer.tick(4);
    }
  }

  mailbox() {
    return {
      stage: this.mem.read32(MAILBOX) >>> 0,
      role: this.mem.read32(MAILBOX + 4) >>> 0,
      frames: this.mem.read32(MAILBOX + 8) >>> 0,
    };
  }

  criteria(): BootCriteria {
    const mb = this.mailbox();
    const panicked = this.cpu.panicked;
    const pcInUiLoop = mb.stage === 8 && !panicked;
    const technicallyBoots =
      mb.stage === 8 &&
      mb.frames >= 3 &&
      this.devices.timer.watchdogFed &&
      !panicked &&
      this.cpu.insnCount > 40 &&
      this.mem.mmioReads > 4;
    return {
      loaded: this.loaded,
      executed: this.cpu.insnCount > 0,
      insnCount: this.cpu.insnCount,
      stage: mb.stage,
      frames: mb.frames,
      mmioReads: this.mem.mmioReads,
      mmioWrites: this.mem.mmioWrites,
      watchdogFed: this.devices.timer.watchdogFed,
      tunerLocked: (this.devices.tuner.read(0) & 1) !== 0,
      drmPresent: (this.devices.drm.read(0) & 1) !== 0,
      role: mb.role,
      panicked,
      pcInUiLoop,
      technicallyBoots,
    };
  }

  framebuffer(): string[] {
    const raw = this.mem.ascii(FRAMEBUFFER, FB_SIZE);
    const lines: string[] = [];
    for (let r = 0; r < FB_ROWS; r++) {
      lines.push(raw.slice(r * FB_COLS, (r + 1) * FB_COLS));
    }
    return lines;
  }

  pressPanel(bits: number) {
    this.devices.panel.buttons = bits >>> 0;
  }

  snapshot(): HvSnapshot {
    const mb = this.mailbox();
    const last = this.dbt.last;
    const cur = this.cpu.last ?? decode(this.mem.read32(this.cpu.pc), this.cpu.pc);
    return {
      pc: this.cpu.pc >>> 0,
      sp: this.cpu.regs[29]! >>> 0,
      hi: this.cpu.hi >>> 0,
      lo: this.cpu.lo >>> 0,
      regs: Array.from(this.cpu.regs).map((n) => n >>> 0),
      insnCount: this.cpu.insnCount,
      current: formatInsn(cur),
      raw: cur.raw >>> 0,
      halted: this.cpu.halted,
      panicked: this.cpu.panicked,
      uart: this.uart,
      stage: mb.stage,
      stageName: STAGE_NAME[mb.stage] ?? `STAGE_${mb.stage}`,
      frames: mb.frames,
      roleWord: mb.role,
      fb: this.framebuffer(),
      criteria: this.criteria(),
      dbtHits: this.dbt.hits,
      dbtMisses: this.dbt.misses,
      dbtBlocks: this.dbt.blocks.size,
      lastBlock: last
        ? {
            start: last.startPc,
            hits: last.hits,
            guest: last.guest.map((d) => formatInsn(d)),
            host: last.host.map((h) => h.x64),
          }
        : null,
      hot: this.dbt.hottest(5).map((b) => ({
        start: b.startPc,
        hits: b.hits,
        words: b.words,
      })),
      mmio: this.mem.mmioLog.slice(-24),
      devices: this.devices.all.map((d) => ({
        id: d.id,
        name: d.name,
        base: d.base,
        lastRead: d.lastRead ?? 0,
        lastWrite: d.lastWrite ?? 0,
      })),
      listing: this.assembled?.listing ?? [],
      programId: this.programId,
      programTitle: programById(this.programId).title,
      role: this.role,
      selfTest: this.selfTest,
      loaded: this.loaded,
      assembleErrors: this.assembled?.errors ?? [],
    };
  }
}

export { PROGRAMS, ROLE_LABEL };

export function runSelfTest(): { ok: boolean; detail: string } {
  const mem = new Memory();
  const cpu = new Cpu();
  const assembled = assemble(programById("smoke").source, ENTRY_PC);
  if (assembled.errors.length) {
    return { ok: false, detail: assembled.errors[0]! };
  }
  mem.loadBinary(assembled.bytes, ENTRY_PC);
  cpu.reset(ENTRY_PC, STACK_TOP);
  for (let i = 0; i < 200 && !cpu.halted && !cpu.panicked; i++) stepOne(cpu, mem);
  const got = mem.read32(0x80002000) >>> 0;
  if (got !== 42) return { ok: false, detail: `smoke expected 42, got ${got}` };
  const fib = assemble(programById("fib").source, ENTRY_PC);
  const mem2 = new Memory();
  const cpu2 = new Cpu();
  mem2.loadBinary(fib.bytes, ENTRY_PC);
  cpu2.reset(ENTRY_PC, STACK_TOP);
  for (let i = 0; i < 4000 && !cpu2.halted && !cpu2.panicked; i++) stepOne(cpu2, mem2);
  const f = mem2.read32(0x80002000) >>> 0;
  if (f !== 144) return { ok: false, detail: `fib(12) expected 144, got ${f}` };
  return { ok: true, detail: "smoke=42  fib(12)=144" };
}
