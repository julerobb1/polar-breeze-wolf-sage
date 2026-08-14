import { REG_ALIASES } from "./types";

export interface AssembleResult {
  bytes: Uint8Array;
  words: Uint32Array;
  labels: Record<string, number>;
  listing: { addr: number; word: number; line: string }[];
  entry: number;
  errors: string[];
}

function parseReg(tok: string): number {
  const t = tok.trim().toLowerCase().replace(/,$/, "");
  if (t in REG_ALIASES) return REG_ALIASES[t]!;
  const m = /^\$?r?(\d{1,2})$/.exec(t);
  if (m) {
    const n = Number(m[1]);
    if (n >= 0 && n < 32) return n;
  }
  throw new Error(`bad register ${tok}`);
}

function parseNum(tok: string, labels: Record<string, number>): number {
  const t = tok.trim().replace(/,$/, "");
  if (t in labels) return labels[t]!;
  if (/^0x[0-9a-f]+$/i.test(t)) return parseInt(t, 16) >>> 0;
  if (/^-0x[0-9a-f]+$/i.test(t)) return (-parseInt(t.slice(1), 16)) | 0;
  if (/^-?\d+$/.test(t)) return Number(t);
  throw new Error(`bad number ${tok}`);
}

function encR(funct: number, rd: number, rs: number, rt: number, shamt = 0) {
  return ((0 << 26) | (rs << 21) | (rt << 16) | (rd << 11) | ((shamt & 31) << 6) | funct) >>> 0;
}
function encI(op: number, rs: number, rt: number, imm: number) {
  return ((op << 26) | (rs << 21) | (rt << 16) | (imm & 0xffff)) >>> 0;
}
function encJ(op: number, addr: number) {
  return ((op << 26) | ((addr >>> 2) & 0x03ffffff)) >>> 0;
}

type Emit = { words: number[]; line: string };

function expand(mnem: string, args: string[], labels: Record<string, number>, pc: number): number[] {
  const a = args;
  const num = (i: number) => parseNum(a[i]!, labels);
  const reg = (i: number) => parseReg(a[i]!);
  const memop = (tok: string) => {
    const m = /^(-?(?:0x[0-9a-f]+|\d+))\((.+)\)$/i.exec(tok.trim());
    if (m) return { off: parseNum(m[1]!, labels), rs: parseReg(m[2]!) };
    if (tok in labels) return { off: 0, rs: parseReg(tok) };
    return { off: parseNum(tok, labels), rs: 0 };
  };

  switch (mnem) {
    case "nop":
      return [0];
    case "sll":
      return [encR(0x00, reg(0), 0, reg(1), num(2))];
    case "srl":
      return [encR(0x02, reg(0), 0, reg(1), num(2))];
    case "sra":
      return [encR(0x03, reg(0), 0, reg(1), num(2))];
    case "sllv":
      return [encR(0x04, reg(0), reg(2), reg(1))];
    case "srlv":
      return [encR(0x06, reg(0), reg(2), reg(1))];
    case "srav":
      return [encR(0x07, reg(0), reg(2), reg(1))];
    case "jr":
      return [encR(0x08, 0, reg(0), 0)];
    case "jalr":
      return a.length === 1 ? [encR(0x09, 31, reg(0), 0)] : [encR(0x09, reg(0), reg(1), 0)];
    case "syscall":
      return [encR(0x0c, 0, 0, 0)];
    case "break":
      return [encR(0x0d, 0, 0, 0)];
    case "mfhi":
      return [encR(0x10, reg(0), 0, 0)];
    case "mthi":
      return [encR(0x11, 0, reg(0), 0)];
    case "mflo":
      return [encR(0x12, reg(0), 0, 0)];
    case "mtlo":
      return [encR(0x13, 0, reg(0), 0)];
    case "mult":
      return [encR(0x18, 0, reg(0), reg(1))];
    case "multu":
      return [encR(0x19, 0, reg(0), reg(1))];
    case "div":
      return [encR(0x1a, 0, reg(0), reg(1))];
    case "divu":
      return [encR(0x1b, 0, reg(0), reg(1))];
    case "add":
      return [encR(0x20, reg(0), reg(1), reg(2))];
    case "addu":
      return [encR(0x21, reg(0), reg(1), reg(2))];
    case "sub":
      return [encR(0x22, reg(0), reg(1), reg(2))];
    case "subu":
      return [encR(0x23, reg(0), reg(1), reg(2))];
    case "and":
      return [encR(0x24, reg(0), reg(1), reg(2))];
    case "or":
      return [encR(0x25, reg(0), reg(1), reg(2))];
    case "xor":
      return [encR(0x26, reg(0), reg(1), reg(2))];
    case "nor":
      return [encR(0x27, reg(0), reg(1), reg(2))];
    case "slt":
      return [encR(0x2a, reg(0), reg(1), reg(2))];
    case "sltu":
      return [encR(0x2b, reg(0), reg(1), reg(2))];
    case "bltz":
      return [encI(0x01, reg(0), 0, ((num(1) - (pc + 4)) >> 2))];
    case "bgez":
      return [encI(0x01, reg(0), 1, ((num(1) - (pc + 4)) >> 2))];
    case "beq":
      return [encI(0x04, reg(0), reg(1), ((num(2) - (pc + 4)) >> 2))];
    case "bne":
      return [encI(0x05, reg(0), reg(1), ((num(2) - (pc + 4)) >> 2))];
    case "blez":
      return [encI(0x06, reg(0), 0, ((num(1) - (pc + 4)) >> 2))];
    case "bgtz":
      return [encI(0x07, reg(0), 0, ((num(1) - (pc + 4)) >> 2))];
    case "addi":
      return [encI(0x08, reg(1), reg(0), num(2))];
    case "addiu":
      return [encI(0x09, reg(1), reg(0), num(2))];
    case "slti":
      return [encI(0x0a, reg(1), reg(0), num(2))];
    case "sltiu":
      return [encI(0x0b, reg(1), reg(0), num(2))];
    case "andi":
      return [encI(0x0c, reg(1), reg(0), num(2))];
    case "ori":
      return [encI(0x0d, reg(1), reg(0), num(2))];
    case "xori":
      return [encI(0x0e, reg(1), reg(0), num(2))];
    case "lui":
      return [encI(0x0f, 0, reg(0), num(1))];
    case "lb": {
      const m = memop(a[1]!);
      return [encI(0x20, m.rs, reg(0), m.off)];
    }
    case "lh": {
      const m = memop(a[1]!);
      return [encI(0x21, m.rs, reg(0), m.off)];
    }
    case "lw": {
      const m = memop(a[1]!);
      return [encI(0x23, m.rs, reg(0), m.off)];
    }
    case "lbu": {
      const m = memop(a[1]!);
      return [encI(0x24, m.rs, reg(0), m.off)];
    }
    case "lhu": {
      const m = memop(a[1]!);
      return [encI(0x25, m.rs, reg(0), m.off)];
    }
    case "sb": {
      const m = memop(a[1]!);
      return [encI(0x28, m.rs, reg(0), m.off)];
    }
    case "sh": {
      const m = memop(a[1]!);
      return [encI(0x29, m.rs, reg(0), m.off)];
    }
    case "sw": {
      const m = memop(a[1]!);
      return [encI(0x2b, m.rs, reg(0), m.off)];
    }
    case "j":
      return [encJ(0x02, num(0))];
    case "jal":
      return [encJ(0x03, num(0))];
    case "mfc0":
      return [((0x10 << 26) | (0 << 21) | (reg(0) << 16) | (num(1) << 11)) >>> 0];
    case "mtc0":
      return [((0x10 << 26) | (4 << 21) | (reg(0) << 16) | (num(1) << 11)) >>> 0];
    case "move":
      return [encR(0x21, reg(0), reg(1), 0)];
    case "clear":
    case "cl":
      return [encR(0x21, reg(0), 0, 0)];
    case "not":
      return [encR(0x27, reg(0), reg(1), 0)];
    case "neg":
      return [encR(0x22, reg(0), 0, reg(1))];
    case "b":
      return [encI(0x04, 0, 0, ((num(0) - (pc + 4)) >> 2))];
    case "bal":
      return [encI(0x01, 0, 17, ((num(0) - (pc + 4)) >> 2))];
    case "li": {
      const rt = reg(0);
      const imm = num(1) >>> 0;
      const lo = imm & 0xffff;
      const hi = (imm >>> 16) & 0xffff;
      if (hi === 0) return [encI(0x09, 0, rt, lo)];
      if (lo === 0) return [encI(0x0f, 0, rt, hi)];
      return [encI(0x0f, 0, rt, hi), encI(0x0d, rt, rt, lo)];
    }
    case "la": {
      const rt = reg(0);
      const imm = num(1) >>> 0;
      const lo = imm & 0xffff;
      const hi = (imm >>> 16) & 0xffff;
      if (lo === 0) return [encI(0x0f, 0, rt, hi)];
      return [encI(0x0f, 0, rt, hi), encI(0x0d, rt, rt, lo)];
    }
    default:
      throw new Error(`unknown mnemonic ${mnem}`);
  }
}

function tokenizeArgs(s: string): string[] {
  if (!s.trim()) return [];
  const out: string[] = [];
  let cur = "";
  let depth = 0;
  for (const ch of s) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && depth === 0) {
      if (cur.trim()) out.push(cur.trim());
      cur = "";
    } else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

export function assemble(source: string, origin = 0x80001000): AssembleResult {
  const errors: string[] = [];
  const rawLines = source.replace(/\r/g, "").split("\n");
  type Row =
    | { kind: "org"; addr: number; text: string }
    | { kind: "label"; name: string; text: string }
    | { kind: "op"; mnem: string; args: string[]; text: string }
    | { kind: "ascii"; bytes: number[]; text: string }
    | { kind: "word"; values: number[]; text: string }
    | { kind: "space"; n: number; text: string };

  const rows: Row[] = [];
  for (let i = 0; i < rawLines.length; i++) {
    let line = rawLines[i]!;
    const hash = line.indexOf("#");
    const semi = line.indexOf(";");
    const cut = [hash, semi].filter((x) => x >= 0);
    if (cut.length) line = line.slice(0, Math.min(...cut));
    line = line.trim();
    if (!line) continue;
    const text = line;
    if (line.startsWith(".org")) {
      const addr = parseInt(line.slice(4).trim(), line.includes("0x") ? 16 : 10) >>> 0;
      rows.push({ kind: "org", addr, text });
      continue;
    }
    while (true) {
      const lm = /^([A-Za-z_][\w.]*):\s*/.exec(line);
      if (!lm) break;
      rows.push({ kind: "label", name: lm[1]!, text: lm[1] + ":" });
      line = line.slice(lm[0].length);
    }
    if (!line) continue;
    if (line.startsWith(".asciiz") || line.startsWith(".ascii")) {
      const m = /"((?:\\.|[^"])*)"/.exec(line);
      if (!m) {
        errors.push(`line ${i + 1}: bad string`);
        continue;
      }
      const raw = m[1]!.replace(/\\n/g, "\n").replace(/\\t/g, "\t").replace(/\\0/g, "\0");
      const bytes = [...raw].map((c) => c.charCodeAt(0));
      if (line.startsWith(".asciiz")) bytes.push(0);
      rows.push({ kind: "ascii", bytes, text });
      continue;
    }
    if (line.startsWith(".word")) {
      const vals = line
        .slice(5)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => parseInt(s, s.includes("0x") ? 16 : 10) >>> 0);
      rows.push({ kind: "word", values: vals, text });
      continue;
    }
    if (line.startsWith(".space")) {
      rows.push({ kind: "space", n: parseInt(line.slice(6).trim(), 10) || 0, text });
      continue;
    }
    const parts = line.split(/\s+/);
    const mnem = parts[0]!.toLowerCase();
    const args = tokenizeArgs(parts.slice(1).join(" "));
    rows.push({ kind: "op", mnem, args, text });
  }

  const labels: Record<string, number> = {};
  const sizeOf = (row: Row, _pc: number): number => {
    if (row.kind === "org") return 0;
    if (row.kind === "label") return 0;
    if (row.kind === "ascii") return (row.bytes.length + 3) & ~3;
    if (row.kind === "word") return row.values.length * 4;
    if (row.kind === "space") return (row.n + 3) & ~3;
    try {
      return expand(row.mnem, row.args, { ...labels, ...(Object.fromEntries(row.args.map((a) => [a.replace(/,$/, ""), 0])) ) }, _pc).length * 4;
    } catch {
      if (row.mnem === "li" || row.mnem === "la") return 8;
      return 4;
    }
  };

  let pc = origin >>> 0;
  let entry = origin >>> 0;
  for (const row of rows) {
    if (row.kind === "org") {
      pc = row.addr;
      continue;
    }
    if (row.kind === "label") {
      labels[row.name] = pc;
      continue;
    }
    if (row.kind === "op" && (row.mnem === "li" || row.mnem === "la")) {
      const immTok = row.args[1] ?? "0";
      const known = immTok in labels || /^-?(0x[0-9a-f]+|\d+)$/i.test(immTok.replace(/,$/, ""));
      let imm = 0;
      try {
        imm = known ? parseNum(immTok, labels) >>> 0 : 0xffffffff;
      } catch {
        imm = 0xffffffff;
      }
      const lo = imm & 0xffff;
      const hi = (imm >>> 16) & 0xffff;
      pc = (pc + (hi !== 0 && lo !== 0 ? 8 : 4)) >>> 0;
      continue;
    }
    pc = (pc + sizeOf(row, pc)) >>> 0;
  }

  pc = origin >>> 0;
  const listing: AssembleResult["listing"] = [];
  const allWords: number[] = [];
  const base = origin >>> 0;
  const poke = (addr: number, word: number, line: string) => {
    const idx = (addr - base) / 4;
    while (allWords.length <= idx) allWords.push(0);
    allWords[idx] = word >>> 0;
    listing.push({ addr, word: word >>> 0, line });
  };

  for (const row of rows) {
    if (row.kind === "org") {
      pc = row.addr;
      continue;
    }
    if (row.kind === "label") continue;
    if (row.kind === "ascii") {
      const padded = row.bytes.slice();
      while (padded.length % 4) padded.push(0);
      for (let i = 0; i < padded.length; i += 4) {
        const w =
          padded[i]! |
          (padded[i + 1]! << 8) |
          (padded[i + 2]! << 16) |
          (padded[i + 3]! << 24);
        poke(pc, w, i === 0 ? row.text : "");
        pc = (pc + 4) >>> 0;
      }
      continue;
    }
    if (row.kind === "word") {
      for (const v of row.values) {
        poke(pc, v, row.text);
        pc = (pc + 4) >>> 0;
      }
      continue;
    }
    if (row.kind === "space") {
      const n = (row.n + 3) & ~3;
      for (let i = 0; i < n; i += 4) {
        poke(pc, 0, i === 0 ? row.text : "");
        pc = (pc + 4) >>> 0;
      }
      continue;
    }
    try {
      const words = expand(row.mnem, row.args, labels, pc);
      for (let i = 0; i < words.length; i++) {
        poke(pc, words[i]!, i === 0 ? row.text : `  +${i} ${row.text}`);
        pc = (pc + 4) >>> 0;
      }
    } catch (e) {
      errors.push(`${row.text}: ${e instanceof Error ? e.message : String(e)}`);
      poke(pc, 0, row.text);
      pc = (pc + 4) >>> 0;
    }
  }

  const words = Uint32Array.from(allWords);
  const bytes = new Uint8Array(words.length * 4);
  const view = new DataView(bytes.buffer);
  for (let i = 0; i < words.length; i++) view.setUint32(i * 4, words[i]!, true);
  return { bytes, words, labels, listing, entry, errors };
}
