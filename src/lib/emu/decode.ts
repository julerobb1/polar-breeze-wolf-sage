export type { Decoded } from "./types";
import { signed16 } from "@/lib/utils";
import { REG_NAMES, type Decoded } from "./types";


function rname(i: number) {
  return "$" + (REG_NAMES[i] ?? i);
}

const FUNCT: Record<number, string> = {
  0x00: "sll",
  0x02: "srl",
  0x03: "sra",
  0x04: "sllv",
  0x06: "srlv",
  0x07: "srav",
  0x08: "jr",
  0x09: "jalr",
  0x0c: "syscall",
  0x0d: "break",
  0x10: "mfhi",
  0x11: "mthi",
  0x12: "mflo",
  0x13: "mtlo",
  0x18: "mult",
  0x19: "multu",
  0x1a: "div",
  0x1b: "divu",
  0x20: "add",
  0x21: "addu",
  0x22: "sub",
  0x23: "subu",
  0x24: "and",
  0x25: "or",
  0x26: "xor",
  0x27: "nor",
  0x2a: "slt",
  0x2b: "sltu",
};

const IOPS: Record<number, string> = {
  0x04: "beq",
  0x05: "bne",
  0x06: "blez",
  0x07: "bgtz",
  0x08: "addi",
  0x09: "addiu",
  0x0a: "slti",
  0x0b: "sltiu",
  0x0c: "andi",
  0x0d: "ori",
  0x0e: "xori",
  0x0f: "lui",
  0x20: "lb",
  0x21: "lh",
  0x23: "lw",
  0x24: "lbu",
  0x25: "lhu",
  0x28: "sb",
  0x29: "sh",
  0x2b: "sw",
};

export function decode(raw: number, pc: number): Decoded {
  const op = (raw >>> 26) & 0x3f;
  const rs = (raw >>> 21) & 0x1f;
  const rt = (raw >>> 16) & 0x1f;
  const rd = (raw >>> 11) & 0x1f;
  const shamt = (raw >>> 6) & 0x1f;
  const funct = raw & 0x3f;
  const imm = raw & 0xffff;
  const simm = signed16(imm);
  const target = raw & 0x03ffffff;

  let mnemonic = "???";
  let operands = "";
  let isControl = false;
  let isStore = false;
  let isLoad = false;
  let isSyscall = false;

  if (raw === 0) {
    mnemonic = "nop";
  } else if (op === 0) {
    mnemonic = FUNCT[funct] ?? `spec.${funct.toString(16)}`;
    if (mnemonic === "syscall" || mnemonic === "break") {
      isSyscall = mnemonic === "syscall";
      isControl = mnemonic === "break";
      operands = "";
    } else if (mnemonic === "jr") {
      isControl = true;
      operands = rname(rs);
    } else if (mnemonic === "jalr") {
      isControl = true;
      operands = rd === 31 ? rname(rs) : `${rname(rd)}, ${rname(rs)}`;
    } else if (mnemonic === "mfhi" || mnemonic === "mflo") {
      operands = rname(rd);
    } else if (mnemonic === "mthi" || mnemonic === "mtlo") {
      operands = rname(rs);
    } else if (mnemonic === "mult" || mnemonic === "multu" || mnemonic === "div" || mnemonic === "divu") {
      operands = `${rname(rs)}, ${rname(rt)}`;
    } else if (mnemonic === "sll" || mnemonic === "srl" || mnemonic === "sra") {
      operands = `${rname(rd)}, ${rname(rt)}, ${shamt}`;
    } else if (mnemonic === "sllv" || mnemonic === "srlv" || mnemonic === "srav") {
      operands = `${rname(rd)}, ${rname(rt)}, ${rname(rs)}`;
    } else {
      operands = `${rname(rd)}, ${rname(rs)}, ${rname(rt)}`;
    }
  } else if (op === 1) {
    const kind = rt === 0 ? "bltz" : rt === 1 ? "bgez" : rt === 16 ? "bltzal" : rt === 17 ? "bgezal" : `regimm.${rt}`;
    mnemonic = kind;
    isControl = true;
    const dest = (pc + 4 + (simm << 2)) >>> 0;
    operands = `${rname(rs)}, ${dest.toString(16)}`;
  } else if (op === 2 || op === 3) {
    mnemonic = op === 2 ? "j" : "jal";
    isControl = true;
    const dest = ((pc + 4) & 0xf0000000) | (target << 2);
    operands = dest.toString(16);
  } else if (op === 0x10) {
    if (rs === 0) {
      mnemonic = "mfc0";
      operands = `${rname(rt)}, $${rd}`;
    } else if (rs === 4) {
      mnemonic = "mtc0";
      operands = `${rname(rt)}, $${rd}`;
    } else {
      mnemonic = "cop0";
    }
  } else {
    mnemonic = IOPS[op] ?? `op.${op.toString(16)}`;
    if (op === 4 || op === 5) {
      isControl = true;
      const dest = (pc + 4 + (simm << 2)) >>> 0;
      operands = `${rname(rs)}, ${rname(rt)}, ${dest.toString(16)}`;
    } else if (op === 6 || op === 7) {
      isControl = true;
      const dest = (pc + 4 + (simm << 2)) >>> 0;
      operands = `${rname(rs)}, ${dest.toString(16)}`;
    } else if (op === 0x0f) {
      operands = `${rname(rt)}, 0x${imm.toString(16)}`;
    } else if (op >= 0x20 && op <= 0x25) {
      isLoad = true;
      operands = `${rname(rt)}, ${simm}(${rname(rs)})`;
    } else if (op === 0x28 || op === 0x29 || op === 0x2b) {
      isStore = true;
      operands = `${rname(rt)}, ${simm}(${rname(rs)})`;
    } else {
      operands = `${rname(rt)}, ${rname(rs)}, ${simm}`;
    }
  }

  return {
    raw: raw >>> 0,
    pc: pc >>> 0,
    op,
    rs,
    rt,
    rd,
    shamt,
    funct,
    imm,
    simm,
    target,
    mnemonic,
    operands,
    isControl,
    isStore,
    isLoad,
    isSyscall,
  };
}

export function formatInsn(d: Decoded): string {
  return d.operands ? `${d.mnemonic.padEnd(7)} ${d.operands}` : d.mnemonic;
}
