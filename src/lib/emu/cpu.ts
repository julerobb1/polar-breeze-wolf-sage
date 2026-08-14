import { decode, type Decoded } from "./decode";
import type { Memory } from "./memory";

export class Cpu {
  regs = new Uint32Array(32);
  hi = 0;
  lo = 0;
  pc = 0;
  pendingJump: number | null = null;
  insnCount = 0;
  halted = false;
  panicked: string | null = null;
  last: Decoded | null = null;
  cp0 = new Uint32Array(32);
  syscalls = 0;

  reset(entry = 0x80001000, sp = 0x80080000) {
    this.regs.fill(0);
    this.hi = 0;
    this.lo = 0;
    this.pc = entry >>> 0;
    this.pendingJump = null;
    this.insnCount = 0;
    this.halted = false;
    this.panicked = null;
    this.last = null;
    this.cp0.fill(0);
    this.syscalls = 0;
    this.regs[29] = sp >>> 0;
  }

  setReg(i: number, v: number) {
    if (i !== 0) this.regs[i] = v >>> 0;
  }

  panic(msg: string) {
    this.panicked = msg;
    this.halted = true;
  }
}

function sext8(n: number) {
  return (n << 24) >> 24;
}
function sext16(n: number) {
  return (n << 16) >> 16;
}

export function executeDecoded(cpu: Cpu, mem: Memory, d: Decoded): number | undefined {
  const r = cpu.regs;
  const rs = r[d.rs]!;
  const rt = r[d.rt]!;
  let jump: number | undefined;

  if (d.raw === 0) return undefined;

  if (d.op === 0) {
    switch (d.funct) {
      case 0x00:
        cpu.setReg(d.rd, rt << d.shamt);
        break;
      case 0x02:
        cpu.setReg(d.rd, rt >>> d.shamt);
        break;
      case 0x03:
        cpu.setReg(d.rd, (rt | 0) >> d.shamt);
        break;
      case 0x04:
        cpu.setReg(d.rd, rt << (rs & 31));
        break;
      case 0x06:
        cpu.setReg(d.rd, rt >>> (rs & 31));
        break;
      case 0x07:
        cpu.setReg(d.rd, (rt | 0) >> (rs & 31));
        break;
      case 0x08:
        jump = rs >>> 0;
        break;
      case 0x09:
        cpu.setReg(d.rd || 31, (d.pc + 8) >>> 0);
        jump = rs >>> 0;
        break;
      case 0x0c: {
        cpu.syscalls += 1;
        const code = r[2]!;
        if (code === 10) {
          cpu.halted = true;
        } else if (code === 11) {
          mem.onUart?.(r[4]! & 0xff);
        } else if (code === 4) {
          let addr = r[4]!;
          for (let i = 0; i < 256; i++) {
            const ch = mem.read8(addr + i);
            if (ch === 0) break;
            mem.onUart?.(ch);
          }
        } else if (code === 1) {
          const s = String(r[4]! | 0);
          for (const ch of s) mem.onUart?.(ch.charCodeAt(0));
        }
        break;
      }
      case 0x0d:
        cpu.panic(`break at ${d.pc.toString(16)}`);
        break;
      case 0x10:
        cpu.setReg(d.rd, cpu.hi);
        break;
      case 0x11:
        cpu.hi = rs >>> 0;
        break;
      case 0x12:
        cpu.setReg(d.rd, cpu.lo);
        break;
      case 0x13:
        cpu.lo = rs >>> 0;
        break;
      case 0x18: {
        const prod = BigInt(rs | 0) * BigInt(rt | 0);
        cpu.lo = Number(prod & 0xffffffffn) >>> 0;
        cpu.hi = Number((prod >> 32n) & 0xffffffffn) >>> 0;
        break;
      }
      case 0x19: {
        const prod = BigInt(rs >>> 0) * BigInt(rt >>> 0);
        cpu.lo = Number(prod & 0xffffffffn) >>> 0;
        cpu.hi = Number((prod >> 32n) & 0xffffffffn) >>> 0;
        break;
      }
      case 0x1a:
        if (rt === 0) {
          cpu.lo = 0;
          cpu.hi = 0;
        } else {
          cpu.lo = ((rs | 0) / (rt | 0)) | 0;
          cpu.hi = ((rs | 0) % (rt | 0)) | 0;
        }
        break;
      case 0x1b:
        if (rt === 0) {
          cpu.lo = 0;
          cpu.hi = 0;
        } else {
          cpu.lo = ((rs >>> 0) / (rt >>> 0)) >>> 0;
          cpu.hi = ((rs >>> 0) % (rt >>> 0)) >>> 0;
        }
        break;
      case 0x20:
      case 0x21:
        cpu.setReg(d.rd, (rs + rt) >>> 0);
        break;
      case 0x22:
      case 0x23:
        cpu.setReg(d.rd, (rs - rt) >>> 0);
        break;
      case 0x24:
        cpu.setReg(d.rd, rs & rt);
        break;
      case 0x25:
        cpu.setReg(d.rd, rs | rt);
        break;
      case 0x26:
        cpu.setReg(d.rd, rs ^ rt);
        break;
      case 0x27:
        cpu.setReg(d.rd, ~(rs | rt));
        break;
      case 0x2a:
        cpu.setReg(d.rd, (rs | 0) < (rt | 0) ? 1 : 0);
        break;
      case 0x2b:
        cpu.setReg(d.rd, rs >>> 0 < rt >>> 0 ? 1 : 0);
        break;
      default:
        cpu.panic(`unimplemented special 0x${d.funct.toString(16)} at ${d.pc.toString(16)}`);
    }
    return jump;
  }

  if (d.op === 1) {
    const s = rs | 0;
    const take = d.rt === 0 || d.rt === 16 ? s < 0 : s >= 0;
    if (d.rt === 16 || d.rt === 17) cpu.setReg(31, (d.pc + 8) >>> 0);
    if (take) jump = (d.pc + 4 + (d.simm << 2)) >>> 0;
    return jump;
  }

  if (d.op === 2) {
    return (((d.pc + 4) & 0xf0000000) | (d.target << 2)) >>> 0;
  }
  if (d.op === 3) {
    cpu.setReg(31, (d.pc + 8) >>> 0);
    return (((d.pc + 4) & 0xf0000000) | (d.target << 2)) >>> 0;
  }

  if (d.op === 0x10) {
    if (d.rs === 0) cpu.setReg(d.rt, cpu.cp0[d.rd]!);
    else if (d.rs === 4) cpu.cp0[d.rd] = rt >>> 0;
    return undefined;
  }

  switch (d.op) {
    case 0x04:
      if (rs === rt) jump = (d.pc + 4 + (d.simm << 2)) >>> 0;
      break;
    case 0x05:
      if (rs !== rt) jump = (d.pc + 4 + (d.simm << 2)) >>> 0;
      break;
    case 0x06:
      if ((rs | 0) <= 0) jump = (d.pc + 4 + (d.simm << 2)) >>> 0;
      break;
    case 0x07:
      if ((rs | 0) > 0) jump = (d.pc + 4 + (d.simm << 2)) >>> 0;
      break;
    case 0x08:
    case 0x09:
      cpu.setReg(d.rt, (rs + d.simm) >>> 0);
      break;
    case 0x0a:
      cpu.setReg(d.rt, (rs | 0) < d.simm ? 1 : 0);
      break;
    case 0x0b:
      cpu.setReg(d.rt, rs >>> 0 < (d.simm >>> 0) ? 1 : 0);
      break;
    case 0x0c:
      cpu.setReg(d.rt, rs & d.imm);
      break;
    case 0x0d:
      cpu.setReg(d.rt, rs | d.imm);
      break;
    case 0x0e:
      cpu.setReg(d.rt, rs ^ d.imm);
      break;
    case 0x0f:
      cpu.setReg(d.rt, d.imm << 16);
      break;
    case 0x20:
      cpu.setReg(d.rt, sext8(mem.read8((rs + d.simm) >>> 0)));
      break;
    case 0x21:
      cpu.setReg(d.rt, sext16(mem.read16((rs + d.simm) >>> 0)));
      break;
    case 0x23:
      cpu.setReg(d.rt, mem.read32((rs + d.simm) >>> 0));
      break;
    case 0x24:
      cpu.setReg(d.rt, mem.read8((rs + d.simm) >>> 0));
      break;
    case 0x25:
      cpu.setReg(d.rt, mem.read16((rs + d.simm) >>> 0));
      break;
    case 0x28:
      mem.write8((rs + d.simm) >>> 0, rt);
      break;
    case 0x29:
      mem.write16((rs + d.simm) >>> 0, rt);
      break;
    case 0x2b:
      mem.write32((rs + d.simm) >>> 0, rt);
      break;
    default:
      cpu.panic(`unimplemented opcode 0x${d.op.toString(16)} at ${d.pc.toString(16)}`);
  }
  return jump;
}

export function stepOne(cpu: Cpu, mem: Memory): Decoded {
  mem.lastPc = cpu.pc;
  const raw = mem.read32(cpu.pc);
  const d = decode(raw, cpu.pc);
  cpu.last = d;
  cpu.insnCount += 1;

  if (cpu.pendingJump !== null) {
    const target = cpu.pendingJump;
    cpu.pendingJump = null;
    executeDecoded(cpu, mem, d);
    cpu.pc = target >>> 0;
    return d;
  }

  const jump = executeDecoded(cpu, mem, d);
  if (jump !== undefined) {
    cpu.pendingJump = jump >>> 0;
    cpu.pc = (cpu.pc + 4) >>> 0;
  } else {
    cpu.pc = (cpu.pc + 4) >>> 0;
  }
  return d;
}
