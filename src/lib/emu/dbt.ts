import { decode, formatInsn, type Decoded } from "./decode";
import { executeDecoded, type Cpu } from "./cpu";
import type { Memory } from "./memory";
import { REG_NAMES, type HostOp, type TranslatedBlock } from "./types";

function rn(i: number) {
  return REG_NAMES[i] ?? `r${i}`;
}

function toHost(d: Decoded): HostOp {
  const g = formatInsn(d);
  const r = (i: number) => `[r15+${rn(i)}]`;
  switch (d.mnemonic) {
    case "nop":
      return { kind: "nop", x64: "nop", guest: g };
    case "lui":
      return { kind: "li", x64: `mov  eax, 0x${(d.imm << 16 >>> 0).toString(16)}; mov  ${r(d.rt)}, eax`, guest: g };
    case "addiu":
    case "addi":
      return { kind: "alu", x64: `mov  eax, ${r(d.rs)}; add  eax, ${d.simm}; mov  ${r(d.rt)}, eax`, guest: g };
    case "addu":
    case "add":
      return { kind: "alu", x64: `mov  eax, ${r(d.rs)}; add  eax, ${r(d.rt)}; mov  ${r(d.rd)}, eax`, guest: g };
    case "subu":
    case "sub":
      return { kind: "alu", x64: `mov  eax, ${r(d.rs)}; sub  eax, ${r(d.rt)}; mov  ${r(d.rd)}, eax`, guest: g };
    case "and":
      return { kind: "alu", x64: `mov  eax, ${r(d.rs)}; and  eax, ${r(d.rt)}; mov  ${r(d.rd)}, eax`, guest: g };
    case "or":
      return { kind: "alu", x64: `mov  eax, ${r(d.rs)}; or   eax, ${r(d.rt)}; mov  ${r(d.rd)}, eax`, guest: g };
    case "xor":
      return { kind: "alu", x64: `mov  eax, ${r(d.rs)}; xor  eax, ${r(d.rt)}; mov  ${r(d.rd)}, eax`, guest: g };
    case "ori":
      return { kind: "alu", x64: `mov  eax, ${r(d.rs)}; or   eax, 0x${d.imm.toString(16)}; mov  ${r(d.rt)}, eax`, guest: g };
    case "andi":
      return { kind: "alu", x64: `mov  eax, ${r(d.rs)}; and  eax, 0x${d.imm.toString(16)}; mov  ${r(d.rt)}, eax`, guest: g };
    case "lw":
      return { kind: "load", x64: `mov  eax, ${r(d.rs)}; mov  eax, dword [eax+${d.simm}]; mov  ${r(d.rt)}, eax`, guest: g };
    case "sw":
      return { kind: "store", x64: `mov  eax, ${r(d.rs)}; mov  edx, ${r(d.rt)}; mov  dword [eax+${d.simm}], edx`, guest: g };
    case "lbu":
      return { kind: "load", x64: `mov  eax, ${r(d.rs)}; movzx eax, byte [eax+${d.simm}]; mov  ${r(d.rt)}, eax`, guest: g };
    case "sb":
      return { kind: "store", x64: `mov  eax, ${r(d.rs)}; mov  edx, ${r(d.rt)}; mov  byte [eax+${d.simm}], dl`, guest: g };
    case "beq":
    case "bne":
    case "blez":
    case "bgtz":
    case "bltz":
    case "bgez":
      return { kind: "br", x64: `cmp  ${r(d.rs)}, ${r(d.rt)}; jcc  0x${((d.pc + 4 + (d.simm << 2)) >>> 0).toString(16)}`, guest: g };
    case "j":
      return { kind: "jmp", x64: `jmp  0x${((((d.pc + 4) & 0xf0000000) | (d.target << 2)) >>> 0).toString(16)}`, guest: g };
    case "jal":
      return { kind: "jal", x64: `mov  ${r(31)}, 0x${((d.pc + 8) >>> 0).toString(16)}; call 0x${((((d.pc + 4) & 0xf0000000) | (d.target << 2)) >>> 0).toString(16)}`, guest: g };
    case "jr":
      return { kind: "jr", x64: `jmp  ${r(d.rs)}`, guest: g };
    case "jalr":
      return { kind: "jal", x64: `mov  ${r(d.rd || 31)}, 0x${((d.pc + 8) >>> 0).toString(16)}; jmp  ${r(d.rs)}`, guest: g };
    case "syscall":
      return { kind: "syscall", x64: "syscall  ; host ABI shim", guest: g };
    case "mult":
    case "multu":
      return { kind: "mul", x64: `mov  eax, ${r(d.rs)}; mul  ${r(d.rt)}; mov  [hi], edx; mov  [lo], eax`, guest: g };
    case "mflo":
      return { kind: "mflo", x64: `mov  ${r(d.rd)}, [lo]`, guest: g };
    case "mfhi":
      return { kind: "mfhi", x64: `mov  ${r(d.rd)}, [hi]`, guest: g };
    default:
      return { kind: "alu", x64: `; ${g}`, guest: g };
  }
}

export class DbtCache {
  blocks = new Map<number, TranslatedBlock>();
  translations = 0;
  hits = 0;
  misses = 0;
  last: TranslatedBlock | null = null;

  invalidate() {
    this.blocks.clear();
    this.translations = 0;
    this.hits = 0;
    this.misses = 0;
    this.last = null;
  }

  translate(start: number, cpu: Cpu, mem: Memory): TranslatedBlock {
    const guest: Decoded[] = [];
    let pc = start >>> 0;
    for (let i = 0; i < 24; i++) {
      const raw = mem.read32(pc);
      const d = decode(raw, pc);
      guest.push(d);
      pc = (pc + 4) >>> 0;
      if (d.isControl) {
        const delay = decode(mem.read32(pc), pc);
        guest.push(delay);
        pc = (pc + 4) >>> 0;
        break;
      }
    }
    const host = guest.map(toHost);
    const block: TranslatedBlock = {
      startPc: start >>> 0,
      endPc: pc >>> 0,
      words: guest.length,
      guest,
      host,
      hits: 0,
      execute: () => {
        for (const d of guest) {
          mem.lastPc = cpu.pc;
          cpu.last = d;
          cpu.insnCount += 1;
          if (cpu.pendingJump !== null) {
            const target = cpu.pendingJump;
            cpu.pendingJump = null;
            executeDecoded(cpu, mem, d);
            cpu.pc = target >>> 0;
            return cpu.pc;
          }
          const jump = executeDecoded(cpu, mem, d);
          if (jump !== undefined) {
            cpu.pendingJump = jump >>> 0;
            cpu.pc = (cpu.pc + 4) >>> 0;
          } else {
            cpu.pc = (cpu.pc + 4) >>> 0;
          }
          if (cpu.halted || cpu.panicked) return cpu.pc;
        }
        return cpu.pc;
      },
    };
    this.blocks.set(start >>> 0, block);
    this.translations += 1;
    return block;
  }

  runBlock(cpu: Cpu, mem: Memory): TranslatedBlock {
    let block = this.blocks.get(cpu.pc);
    if (!block) {
      this.misses += 1;
      block = this.translate(cpu.pc, cpu, mem);
    } else {
      this.hits += 1;
    }
    block.hits += 1;
    this.last = block;
    block.execute();
    return block;
  }

  hottest(n = 6): TranslatedBlock[] {
    return [...this.blocks.values()].sort((a, b) => b.hits - a.hits).slice(0, n);
  }
}
