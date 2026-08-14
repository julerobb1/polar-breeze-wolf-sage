import { r as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Slot } from "../_libs/radix-ui__react-slot.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { t as create } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-1rRZnH8R.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function hex(n, width = 8) {
	return (n >>> 0).toString(16).toUpperCase().padStart(width, "0");
}
function signed16(n) {
	const v = n & 65535;
	return v & 32768 ? v - 65536 : v;
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium transition-[opacity,transform,background-color,box-shadow] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4 [&_svg]:shrink-0", {
	variants: {
		variant: {
			default: "bg-accent text-accent-fg hover:opacity-90 active:scale-[0.98]",
			secondary: "bg-elevated text-fg shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]",
			ghost: "text-muted hover:bg-elevated hover:text-fg",
			danger: "bg-bad/15 text-bad hover:bg-bad/25"
		},
		size: {
			default: "h-10 px-3.5",
			sm: "h-8 px-2.5 text-xs",
			lg: "h-11 px-4",
			icon: "size-10"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant, size, asChild = false, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		...props
	});
}
var REG_NAMES = [
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
	"ra"
];
var REG_ALIASES = Object.fromEntries([
	...REG_NAMES.map((n, i) => [n, i]),
	...REG_NAMES.map((n, i) => ["$" + n, i]),
	...Array.from({ length: 31 }, (_, i) => [`$${i}`, i]),
	["$0", 0]
]);
var ROLE_VALUE = {
	master: 1,
	"wireless-master": 2,
	slave: 3
};
var PHYS_RAM_SIZE = 16777216;
var ENTRY_PC = 2147487744;
var STACK_TOP = 2148007936;
var MAILBOX = 2147549184;
var FRAMEBUFFER = 2147614720;
var STAGE_NAME = {
	0: "RESET",
	1: "BOOTLOADER",
	2: "OEMINIT",
	3: "KERNEL",
	4: "DRIVERS",
	5: "ROLE",
	6: "PLAYREADY",
	7: "MIDDLEWARE",
	8: "UI_LOOP",
	255: "PANIC"
};
var MMIO = {
	IRQ: 520093696,
	TIMER: 520159232,
	UART: 520224768,
	NAND: 520290304,
	TUNER: 520355840,
	PANEL: 520421376,
	DRM: 520486912,
	ROLE: 520552448
};
function virtToPhys(addr) {
	const a = addr >>> 0;
	if (a >= 2147483648 && a <= 3221225471) return a & 536870911;
	return a;
}
function parseReg(tok) {
	const t = tok.trim().toLowerCase().replace(/,$/, "");
	if (t in REG_ALIASES) return REG_ALIASES[t];
	const m = /^\$?r?(\d{1,2})$/.exec(t);
	if (m) {
		const n = Number(m[1]);
		if (n >= 0 && n < 32) return n;
	}
	throw new Error(`bad register ${tok}`);
}
function parseNum(tok, labels) {
	const t = tok.trim().replace(/,$/, "");
	if (t in labels) return labels[t];
	if (/^0x[0-9a-f]+$/i.test(t)) return parseInt(t, 16) >>> 0;
	if (/^-0x[0-9a-f]+$/i.test(t)) return -parseInt(t.slice(1), 16) | 0;
	if (/^-?\d+$/.test(t)) return Number(t);
	throw new Error(`bad number ${tok}`);
}
function encR(funct, rd, rs, rt, shamt = 0) {
	return (0 | rs << 21 | rt << 16 | rd << 11 | (shamt & 31) << 6 | funct) >>> 0;
}
function encI(op, rs, rt, imm) {
	return (op << 26 | rs << 21 | rt << 16 | imm & 65535) >>> 0;
}
function encJ(op, addr) {
	return (op << 26 | addr >>> 2 & 67108863) >>> 0;
}
function expand(mnem, args, labels, pc) {
	const a = args;
	const num = (i) => parseNum(a[i], labels);
	const reg = (i) => parseReg(a[i]);
	const memop = (tok) => {
		const m = /^(-?(?:0x[0-9a-f]+|\d+))\((.+)\)$/i.exec(tok.trim());
		if (m) return {
			off: parseNum(m[1], labels),
			rs: parseReg(m[2])
		};
		if (tok in labels) return {
			off: 0,
			rs: parseReg(tok)
		};
		return {
			off: parseNum(tok, labels),
			rs: 0
		};
	};
	switch (mnem) {
		case "nop": return [0];
		case "sll": return [encR(0, reg(0), 0, reg(1), num(2))];
		case "srl": return [encR(2, reg(0), 0, reg(1), num(2))];
		case "sra": return [encR(3, reg(0), 0, reg(1), num(2))];
		case "sllv": return [encR(4, reg(0), reg(2), reg(1))];
		case "srlv": return [encR(6, reg(0), reg(2), reg(1))];
		case "srav": return [encR(7, reg(0), reg(2), reg(1))];
		case "jr": return [encR(8, 0, reg(0), 0)];
		case "jalr": return a.length === 1 ? [encR(9, 31, reg(0), 0)] : [encR(9, reg(0), reg(1), 0)];
		case "syscall": return [encR(12, 0, 0, 0)];
		case "break": return [encR(13, 0, 0, 0)];
		case "mfhi": return [encR(16, reg(0), 0, 0)];
		case "mthi": return [encR(17, 0, reg(0), 0)];
		case "mflo": return [encR(18, reg(0), 0, 0)];
		case "mtlo": return [encR(19, 0, reg(0), 0)];
		case "mult": return [encR(24, 0, reg(0), reg(1))];
		case "multu": return [encR(25, 0, reg(0), reg(1))];
		case "div": return [encR(26, 0, reg(0), reg(1))];
		case "divu": return [encR(27, 0, reg(0), reg(1))];
		case "add": return [encR(32, reg(0), reg(1), reg(2))];
		case "addu": return [encR(33, reg(0), reg(1), reg(2))];
		case "sub": return [encR(34, reg(0), reg(1), reg(2))];
		case "subu": return [encR(35, reg(0), reg(1), reg(2))];
		case "and": return [encR(36, reg(0), reg(1), reg(2))];
		case "or": return [encR(37, reg(0), reg(1), reg(2))];
		case "xor": return [encR(38, reg(0), reg(1), reg(2))];
		case "nor": return [encR(39, reg(0), reg(1), reg(2))];
		case "slt": return [encR(42, reg(0), reg(1), reg(2))];
		case "sltu": return [encR(43, reg(0), reg(1), reg(2))];
		case "bltz": return [encI(1, reg(0), 0, num(1) - (pc + 4) >> 2)];
		case "bgez": return [encI(1, reg(0), 1, num(1) - (pc + 4) >> 2)];
		case "beq": return [encI(4, reg(0), reg(1), num(2) - (pc + 4) >> 2)];
		case "bne": return [encI(5, reg(0), reg(1), num(2) - (pc + 4) >> 2)];
		case "blez": return [encI(6, reg(0), 0, num(1) - (pc + 4) >> 2)];
		case "bgtz": return [encI(7, reg(0), 0, num(1) - (pc + 4) >> 2)];
		case "addi": return [encI(8, reg(1), reg(0), num(2))];
		case "addiu": return [encI(9, reg(1), reg(0), num(2))];
		case "slti": return [encI(10, reg(1), reg(0), num(2))];
		case "sltiu": return [encI(11, reg(1), reg(0), num(2))];
		case "andi": return [encI(12, reg(1), reg(0), num(2))];
		case "ori": return [encI(13, reg(1), reg(0), num(2))];
		case "xori": return [encI(14, reg(1), reg(0), num(2))];
		case "lui": return [encI(15, 0, reg(0), num(1))];
		case "lb": {
			const m = memop(a[1]);
			return [encI(32, m.rs, reg(0), m.off)];
		}
		case "lh": {
			const m = memop(a[1]);
			return [encI(33, m.rs, reg(0), m.off)];
		}
		case "lw": {
			const m = memop(a[1]);
			return [encI(35, m.rs, reg(0), m.off)];
		}
		case "lbu": {
			const m = memop(a[1]);
			return [encI(36, m.rs, reg(0), m.off)];
		}
		case "lhu": {
			const m = memop(a[1]);
			return [encI(37, m.rs, reg(0), m.off)];
		}
		case "sb": {
			const m = memop(a[1]);
			return [encI(40, m.rs, reg(0), m.off)];
		}
		case "sh": {
			const m = memop(a[1]);
			return [encI(41, m.rs, reg(0), m.off)];
		}
		case "sw": {
			const m = memop(a[1]);
			return [encI(43, m.rs, reg(0), m.off)];
		}
		case "j": return [encJ(2, num(0))];
		case "jal": return [encJ(3, num(0))];
		case "mfc0": return [(1073741824 | reg(0) << 16 | num(1) << 11) >>> 0];
		case "mtc0": return [(1082130432 | reg(0) << 16 | num(1) << 11) >>> 0];
		case "move": return [encR(33, reg(0), reg(1), 0)];
		case "clear":
		case "cl": return [encR(33, reg(0), 0, 0)];
		case "not": return [encR(39, reg(0), reg(1), 0)];
		case "neg": return [encR(34, reg(0), 0, reg(1))];
		case "b": return [encI(4, 0, 0, num(0) - (pc + 4) >> 2)];
		case "bal": return [encI(1, 0, 17, num(0) - (pc + 4) >> 2)];
		case "li": {
			const rt = reg(0);
			const imm = num(1) >>> 0;
			const lo = imm & 65535;
			const hi = imm >>> 16 & 65535;
			if (hi === 0) return [encI(9, 0, rt, lo)];
			if (lo === 0) return [encI(15, 0, rt, hi)];
			return [encI(15, 0, rt, hi), encI(13, rt, rt, lo)];
		}
		case "la": {
			const rt = reg(0);
			const imm = num(1) >>> 0;
			const lo = imm & 65535;
			const hi = imm >>> 16 & 65535;
			if (lo === 0) return [encI(15, 0, rt, hi)];
			return [encI(15, 0, rt, hi), encI(13, rt, rt, lo)];
		}
		default: throw new Error(`unknown mnemonic ${mnem}`);
	}
}
function tokenizeArgs(s) {
	if (!s.trim()) return [];
	const out = [];
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
function assemble(source, origin = 2147487744) {
	const errors = [];
	const rawLines = source.replace(/\r/g, "").split("\n");
	const rows = [];
	for (let i = 0; i < rawLines.length; i++) {
		let line = rawLines[i];
		const cut = [line.indexOf("#"), line.indexOf(";")].filter((x) => x >= 0);
		if (cut.length) line = line.slice(0, Math.min(...cut));
		line = line.trim();
		if (!line) continue;
		const text = line;
		if (line.startsWith(".org")) {
			const addr = parseInt(line.slice(4).trim(), line.includes("0x") ? 16 : 10) >>> 0;
			rows.push({
				kind: "org",
				addr,
				text
			});
			continue;
		}
		while (true) {
			const lm = /^([A-Za-z_][\w.]*):\s*/.exec(line);
			if (!lm) break;
			rows.push({
				kind: "label",
				name: lm[1],
				text: lm[1] + ":"
			});
			line = line.slice(lm[0].length);
		}
		if (!line) continue;
		if (line.startsWith(".asciiz") || line.startsWith(".ascii")) {
			const m = /"((?:\\.|[^"])*)"/.exec(line);
			if (!m) {
				errors.push(`line ${i + 1}: bad string`);
				continue;
			}
			const bytes = [...m[1].replace(/\\n/g, "\n").replace(/\\t/g, "	").replace(/\\0/g, "\0")].map((c) => c.charCodeAt(0));
			if (line.startsWith(".asciiz")) bytes.push(0);
			rows.push({
				kind: "ascii",
				bytes,
				text
			});
			continue;
		}
		if (line.startsWith(".word")) {
			const vals = line.slice(5).split(",").map((s) => s.trim()).filter(Boolean).map((s) => parseInt(s, s.includes("0x") ? 16 : 10) >>> 0);
			rows.push({
				kind: "word",
				values: vals,
				text
			});
			continue;
		}
		if (line.startsWith(".space")) {
			rows.push({
				kind: "space",
				n: parseInt(line.slice(6).trim(), 10) || 0,
				text
			});
			continue;
		}
		const parts = line.split(/\s+/);
		const mnem = parts[0].toLowerCase();
		const args = tokenizeArgs(parts.slice(1).join(" "));
		rows.push({
			kind: "op",
			mnem,
			args,
			text
		});
	}
	const labels = {};
	const sizeOf = (row, _pc) => {
		if (row.kind === "org") return 0;
		if (row.kind === "label") return 0;
		if (row.kind === "ascii") return row.bytes.length + 3 & -4;
		if (row.kind === "word") return row.values.length * 4;
		if (row.kind === "space") return row.n + 3 & -4;
		try {
			return expand(row.mnem, row.args, {
				...labels,
				...Object.fromEntries(row.args.map((a) => [a.replace(/,$/, ""), 0]))
			}, _pc).length * 4;
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
				imm = known ? parseNum(immTok, labels) >>> 0 : 4294967295;
			} catch {
				imm = 4294967295;
			}
			const lo = imm & 65535;
			const hi = imm >>> 16 & 65535;
			pc = pc + (hi !== 0 && lo !== 0 ? 8 : 4) >>> 0;
			continue;
		}
		pc = pc + sizeOf(row, pc) >>> 0;
	}
	pc = origin >>> 0;
	const listing = [];
	const allWords = [];
	const base = origin >>> 0;
	const poke = (addr, word, line) => {
		const idx = (addr - base) / 4;
		while (allWords.length <= idx) allWords.push(0);
		allWords[idx] = word >>> 0;
		listing.push({
			addr,
			word: word >>> 0,
			line
		});
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
				const w = padded[i] | padded[i + 1] << 8 | padded[i + 2] << 16 | padded[i + 3] << 24;
				poke(pc, w, i === 0 ? row.text : "");
				pc = pc + 4 >>> 0;
			}
			continue;
		}
		if (row.kind === "word") {
			for (const v of row.values) {
				poke(pc, v, row.text);
				pc = pc + 4 >>> 0;
			}
			continue;
		}
		if (row.kind === "space") {
			const n = row.n + 3 & -4;
			for (let i = 0; i < n; i += 4) {
				poke(pc, 0, i === 0 ? row.text : "");
				pc = pc + 4 >>> 0;
			}
			continue;
		}
		try {
			const words = expand(row.mnem, row.args, labels, pc);
			for (let i = 0; i < words.length; i++) {
				poke(pc, words[i], i === 0 ? row.text : `  +${i} ${row.text}`);
				pc = pc + 4 >>> 0;
			}
		} catch (e) {
			errors.push(`${row.text}: ${e instanceof Error ? e.message : String(e)}`);
			poke(pc, 0, row.text);
			pc = pc + 4 >>> 0;
		}
	}
	const words = Uint32Array.from(allWords);
	const bytes = new Uint8Array(words.length * 4);
	const view = new DataView(bytes.buffer);
	for (let i = 0; i < words.length; i++) view.setUint32(i * 4, words[i], true);
	return {
		bytes,
		words,
		labels,
		listing,
		entry,
		errors
	};
}
function rname(i) {
	return "$" + (REG_NAMES[i] ?? i);
}
var FUNCT = {
	0: "sll",
	2: "srl",
	3: "sra",
	4: "sllv",
	6: "srlv",
	7: "srav",
	8: "jr",
	9: "jalr",
	12: "syscall",
	13: "break",
	16: "mfhi",
	17: "mthi",
	18: "mflo",
	19: "mtlo",
	24: "mult",
	25: "multu",
	26: "div",
	27: "divu",
	32: "add",
	33: "addu",
	34: "sub",
	35: "subu",
	36: "and",
	37: "or",
	38: "xor",
	39: "nor",
	42: "slt",
	43: "sltu"
};
var IOPS = {
	4: "beq",
	5: "bne",
	6: "blez",
	7: "bgtz",
	8: "addi",
	9: "addiu",
	10: "slti",
	11: "sltiu",
	12: "andi",
	13: "ori",
	14: "xori",
	15: "lui",
	32: "lb",
	33: "lh",
	35: "lw",
	36: "lbu",
	37: "lhu",
	40: "sb",
	41: "sh",
	43: "sw"
};
function decode(raw, pc) {
	const op = raw >>> 26 & 63;
	const rs = raw >>> 21 & 31;
	const rt = raw >>> 16 & 31;
	const rd = raw >>> 11 & 31;
	const shamt = raw >>> 6 & 31;
	const funct = raw & 63;
	const imm = raw & 65535;
	const simm = signed16(imm);
	const target = raw & 67108863;
	let mnemonic = "???";
	let operands = "";
	let isControl = false;
	let isStore = false;
	let isLoad = false;
	let isSyscall = false;
	if (raw === 0) mnemonic = "nop";
	else if (op === 0) {
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
		} else if (mnemonic === "mfhi" || mnemonic === "mflo") operands = rname(rd);
		else if (mnemonic === "mthi" || mnemonic === "mtlo") operands = rname(rs);
		else if (mnemonic === "mult" || mnemonic === "multu" || mnemonic === "div" || mnemonic === "divu") operands = `${rname(rs)}, ${rname(rt)}`;
		else if (mnemonic === "sll" || mnemonic === "srl" || mnemonic === "sra") operands = `${rname(rd)}, ${rname(rt)}, ${shamt}`;
		else if (mnemonic === "sllv" || mnemonic === "srlv" || mnemonic === "srav") operands = `${rname(rd)}, ${rname(rt)}, ${rname(rs)}`;
		else operands = `${rname(rd)}, ${rname(rs)}, ${rname(rt)}`;
	} else if (op === 1) {
		mnemonic = rt === 0 ? "bltz" : rt === 1 ? "bgez" : rt === 16 ? "bltzal" : rt === 17 ? "bgezal" : `regimm.${rt}`;
		isControl = true;
		const dest = pc + 4 + (simm << 2) >>> 0;
		operands = `${rname(rs)}, ${dest.toString(16)}`;
	} else if (op === 2 || op === 3) {
		mnemonic = op === 2 ? "j" : "jal";
		isControl = true;
		operands = (pc + 4 & 4026531840 | target << 2).toString(16);
	} else if (op === 16) {
		if (rs === 0) {
			mnemonic = "mfc0";
			operands = `${rname(rt)}, $${rd}`;
		} else if (rs === 4) {
			mnemonic = "mtc0";
			operands = `${rname(rt)}, $${rd}`;
		} else mnemonic = "cop0";
	} else {
		mnemonic = IOPS[op] ?? `op.${op.toString(16)}`;
		if (op === 4 || op === 5) {
			isControl = true;
			const dest = pc + 4 + (simm << 2) >>> 0;
			operands = `${rname(rs)}, ${rname(rt)}, ${dest.toString(16)}`;
		} else if (op === 6 || op === 7) {
			isControl = true;
			const dest = pc + 4 + (simm << 2) >>> 0;
			operands = `${rname(rs)}, ${dest.toString(16)}`;
		} else if (op === 15) operands = `${rname(rt)}, 0x${imm.toString(16)}`;
		else if (op >= 32 && op <= 37) {
			isLoad = true;
			operands = `${rname(rt)}, ${simm}(${rname(rs)})`;
		} else if (op === 40 || op === 41 || op === 43) {
			isStore = true;
			operands = `${rname(rt)}, ${simm}(${rname(rs)})`;
		} else operands = `${rname(rt)}, ${rname(rs)}, ${simm}`;
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
		isSyscall
	};
}
function formatInsn(d) {
	return d.operands ? `${d.mnemonic.padEnd(7)} ${d.operands}` : d.mnemonic;
}
var Cpu = class {
	regs = /* @__PURE__ */ new Uint32Array(32);
	hi = 0;
	lo = 0;
	pc = 0;
	pendingJump = null;
	insnCount = 0;
	halted = false;
	panicked = null;
	last = null;
	cp0 = /* @__PURE__ */ new Uint32Array(32);
	syscalls = 0;
	reset(entry = 2147487744, sp = 2148007936) {
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
	setReg(i, v) {
		if (i !== 0) this.regs[i] = v >>> 0;
	}
	panic(msg) {
		this.panicked = msg;
		this.halted = true;
	}
};
function sext8(n) {
	return n << 24 >> 24;
}
function sext16(n) {
	return n << 16 >> 16;
}
function executeDecoded(cpu, mem, d) {
	const r = cpu.regs;
	const rs = r[d.rs];
	const rt = r[d.rt];
	let jump;
	if (d.raw === 0) return void 0;
	if (d.op === 0) {
		switch (d.funct) {
			case 0:
				cpu.setReg(d.rd, rt << d.shamt);
				break;
			case 2:
				cpu.setReg(d.rd, rt >>> d.shamt);
				break;
			case 3:
				cpu.setReg(d.rd, (rt | 0) >> d.shamt);
				break;
			case 4:
				cpu.setReg(d.rd, rt << (rs & 31));
				break;
			case 6:
				cpu.setReg(d.rd, rt >>> (rs & 31));
				break;
			case 7:
				cpu.setReg(d.rd, (rt | 0) >> (rs & 31));
				break;
			case 8:
				jump = rs >>> 0;
				break;
			case 9:
				cpu.setReg(d.rd || 31, d.pc + 8 >>> 0);
				jump = rs >>> 0;
				break;
			case 12: {
				cpu.syscalls += 1;
				const code = r[2];
				if (code === 10) cpu.halted = true;
				else if (code === 11) mem.onUart?.(r[4] & 255);
				else if (code === 4) {
					let addr = r[4];
					for (let i = 0; i < 256; i++) {
						const ch = mem.read8(addr + i);
						if (ch === 0) break;
						mem.onUart?.(ch);
					}
				} else if (code === 1) {
					const s = String(r[4] | 0);
					for (const ch of s) mem.onUart?.(ch.charCodeAt(0));
				}
				break;
			}
			case 13:
				cpu.panic(`break at ${d.pc.toString(16)}`);
				break;
			case 16:
				cpu.setReg(d.rd, cpu.hi);
				break;
			case 17:
				cpu.hi = rs >>> 0;
				break;
			case 18:
				cpu.setReg(d.rd, cpu.lo);
				break;
			case 19:
				cpu.lo = rs >>> 0;
				break;
			case 24: {
				const prod = BigInt(rs | 0) * BigInt(rt | 0);
				cpu.lo = Number(prod & 4294967295n) >>> 0;
				cpu.hi = Number(prod >> 32n & 4294967295n) >>> 0;
				break;
			}
			case 25: {
				const prod = BigInt(rs >>> 0) * BigInt(rt >>> 0);
				cpu.lo = Number(prod & 4294967295n) >>> 0;
				cpu.hi = Number(prod >> 32n & 4294967295n) >>> 0;
				break;
			}
			case 26:
				if (rt === 0) {
					cpu.lo = 0;
					cpu.hi = 0;
				} else {
					cpu.lo = (rs | 0) / (rt | 0) | 0;
					cpu.hi = (rs | 0) % (rt | 0) | 0;
				}
				break;
			case 27:
				if (rt === 0) {
					cpu.lo = 0;
					cpu.hi = 0;
				} else {
					cpu.lo = (rs >>> 0) / (rt >>> 0) >>> 0;
					cpu.hi = (rs >>> 0) % (rt >>> 0) >>> 0;
				}
				break;
			case 32:
			case 33:
				cpu.setReg(d.rd, rs + rt >>> 0);
				break;
			case 34:
			case 35:
				cpu.setReg(d.rd, rs - rt >>> 0);
				break;
			case 36:
				cpu.setReg(d.rd, rs & rt);
				break;
			case 37:
				cpu.setReg(d.rd, rs | rt);
				break;
			case 38:
				cpu.setReg(d.rd, rs ^ rt);
				break;
			case 39:
				cpu.setReg(d.rd, ~(rs | rt));
				break;
			case 42:
				cpu.setReg(d.rd, (rs | 0) < (rt | 0) ? 1 : 0);
				break;
			case 43:
				cpu.setReg(d.rd, rs >>> 0 < rt >>> 0 ? 1 : 0);
				break;
			default: cpu.panic(`unimplemented special 0x${d.funct.toString(16)} at ${d.pc.toString(16)}`);
		}
		return jump;
	}
	if (d.op === 1) {
		const s = rs | 0;
		const take = d.rt === 0 || d.rt === 16 ? s < 0 : s >= 0;
		if (d.rt === 16 || d.rt === 17) cpu.setReg(31, d.pc + 8 >>> 0);
		if (take) jump = d.pc + 4 + (d.simm << 2) >>> 0;
		return jump;
	}
	if (d.op === 2) return (d.pc + 4 & 4026531840 | d.target << 2) >>> 0;
	if (d.op === 3) {
		cpu.setReg(31, d.pc + 8 >>> 0);
		return (d.pc + 4 & 4026531840 | d.target << 2) >>> 0;
	}
	if (d.op === 16) {
		if (d.rs === 0) cpu.setReg(d.rt, cpu.cp0[d.rd]);
		else if (d.rs === 4) cpu.cp0[d.rd] = rt >>> 0;
		return;
	}
	switch (d.op) {
		case 4:
			if (rs === rt) jump = d.pc + 4 + (d.simm << 2) >>> 0;
			break;
		case 5:
			if (rs !== rt) jump = d.pc + 4 + (d.simm << 2) >>> 0;
			break;
		case 6:
			if ((rs | 0) <= 0) jump = d.pc + 4 + (d.simm << 2) >>> 0;
			break;
		case 7:
			if ((rs | 0) > 0) jump = d.pc + 4 + (d.simm << 2) >>> 0;
			break;
		case 8:
		case 9:
			cpu.setReg(d.rt, rs + d.simm >>> 0);
			break;
		case 10:
			cpu.setReg(d.rt, (rs | 0) < d.simm ? 1 : 0);
			break;
		case 11:
			cpu.setReg(d.rt, rs >>> 0 < d.simm >>> 0 ? 1 : 0);
			break;
		case 12:
			cpu.setReg(d.rt, rs & d.imm);
			break;
		case 13:
			cpu.setReg(d.rt, rs | d.imm);
			break;
		case 14:
			cpu.setReg(d.rt, rs ^ d.imm);
			break;
		case 15:
			cpu.setReg(d.rt, d.imm << 16);
			break;
		case 32:
			cpu.setReg(d.rt, sext8(mem.read8(rs + d.simm >>> 0)));
			break;
		case 33:
			cpu.setReg(d.rt, sext16(mem.read16(rs + d.simm >>> 0)));
			break;
		case 35:
			cpu.setReg(d.rt, mem.read32(rs + d.simm >>> 0));
			break;
		case 36:
			cpu.setReg(d.rt, mem.read8(rs + d.simm >>> 0));
			break;
		case 37:
			cpu.setReg(d.rt, mem.read16(rs + d.simm >>> 0));
			break;
		case 40:
			mem.write8(rs + d.simm >>> 0, rt);
			break;
		case 41:
			mem.write16(rs + d.simm >>> 0, rt);
			break;
		case 43:
			mem.write32(rs + d.simm >>> 0, rt);
			break;
		default: cpu.panic(`unimplemented opcode 0x${d.op.toString(16)} at ${d.pc.toString(16)}`);
	}
	return jump;
}
function stepOne(cpu, mem) {
	mem.lastPc = cpu.pc;
	const d = decode(mem.read32(cpu.pc), cpu.pc);
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
	if (jump !== void 0) {
		cpu.pendingJump = jump >>> 0;
		cpu.pc = cpu.pc + 4 >>> 0;
	} else cpu.pc = cpu.pc + 4 >>> 0;
	return d;
}
function rn(i) {
	return REG_NAMES[i] ?? `r${i}`;
}
function toHost(d) {
	const g = formatInsn(d);
	const r = (i) => `[r15+${rn(i)}]`;
	switch (d.mnemonic) {
		case "nop": return {
			kind: "nop",
			x64: "nop",
			guest: g
		};
		case "lui": return {
			kind: "li",
			x64: `mov  eax, 0x${(d.imm << 16 >>> 0).toString(16)}; mov  ${r(d.rt)}, eax`,
			guest: g
		};
		case "addiu":
		case "addi": return {
			kind: "alu",
			x64: `mov  eax, ${r(d.rs)}; add  eax, ${d.simm}; mov  ${r(d.rt)}, eax`,
			guest: g
		};
		case "addu":
		case "add": return {
			kind: "alu",
			x64: `mov  eax, ${r(d.rs)}; add  eax, ${r(d.rt)}; mov  ${r(d.rd)}, eax`,
			guest: g
		};
		case "subu":
		case "sub": return {
			kind: "alu",
			x64: `mov  eax, ${r(d.rs)}; sub  eax, ${r(d.rt)}; mov  ${r(d.rd)}, eax`,
			guest: g
		};
		case "and": return {
			kind: "alu",
			x64: `mov  eax, ${r(d.rs)}; and  eax, ${r(d.rt)}; mov  ${r(d.rd)}, eax`,
			guest: g
		};
		case "or": return {
			kind: "alu",
			x64: `mov  eax, ${r(d.rs)}; or   eax, ${r(d.rt)}; mov  ${r(d.rd)}, eax`,
			guest: g
		};
		case "xor": return {
			kind: "alu",
			x64: `mov  eax, ${r(d.rs)}; xor  eax, ${r(d.rt)}; mov  ${r(d.rd)}, eax`,
			guest: g
		};
		case "ori": return {
			kind: "alu",
			x64: `mov  eax, ${r(d.rs)}; or   eax, 0x${d.imm.toString(16)}; mov  ${r(d.rt)}, eax`,
			guest: g
		};
		case "andi": return {
			kind: "alu",
			x64: `mov  eax, ${r(d.rs)}; and  eax, 0x${d.imm.toString(16)}; mov  ${r(d.rt)}, eax`,
			guest: g
		};
		case "lw": return {
			kind: "load",
			x64: `mov  eax, ${r(d.rs)}; mov  eax, dword [eax+${d.simm}]; mov  ${r(d.rt)}, eax`,
			guest: g
		};
		case "sw": return {
			kind: "store",
			x64: `mov  eax, ${r(d.rs)}; mov  edx, ${r(d.rt)}; mov  dword [eax+${d.simm}], edx`,
			guest: g
		};
		case "lbu": return {
			kind: "load",
			x64: `mov  eax, ${r(d.rs)}; movzx eax, byte [eax+${d.simm}]; mov  ${r(d.rt)}, eax`,
			guest: g
		};
		case "sb": return {
			kind: "store",
			x64: `mov  eax, ${r(d.rs)}; mov  edx, ${r(d.rt)}; mov  byte [eax+${d.simm}], dl`,
			guest: g
		};
		case "beq":
		case "bne":
		case "blez":
		case "bgtz":
		case "bltz":
		case "bgez": return {
			kind: "br",
			x64: `cmp  ${r(d.rs)}, ${r(d.rt)}; jcc  0x${(d.pc + 4 + (d.simm << 2) >>> 0).toString(16)}`,
			guest: g
		};
		case "j": return {
			kind: "jmp",
			x64: `jmp  0x${((d.pc + 4 & 4026531840 | d.target << 2) >>> 0).toString(16)}`,
			guest: g
		};
		case "jal": return {
			kind: "jal",
			x64: `mov  ${r(31)}, 0x${(d.pc + 8 >>> 0).toString(16)}; call 0x${((d.pc + 4 & 4026531840 | d.target << 2) >>> 0).toString(16)}`,
			guest: g
		};
		case "jr": return {
			kind: "jr",
			x64: `jmp  ${r(d.rs)}`,
			guest: g
		};
		case "jalr": return {
			kind: "jal",
			x64: `mov  ${r(d.rd || 31)}, 0x${(d.pc + 8 >>> 0).toString(16)}; jmp  ${r(d.rs)}`,
			guest: g
		};
		case "syscall": return {
			kind: "syscall",
			x64: "syscall  ; host ABI shim",
			guest: g
		};
		case "mult":
		case "multu": return {
			kind: "mul",
			x64: `mov  eax, ${r(d.rs)}; mul  ${r(d.rt)}; mov  [hi], edx; mov  [lo], eax`,
			guest: g
		};
		case "mflo": return {
			kind: "mflo",
			x64: `mov  ${r(d.rd)}, [lo]`,
			guest: g
		};
		case "mfhi": return {
			kind: "mfhi",
			x64: `mov  ${r(d.rd)}, [hi]`,
			guest: g
		};
		default: return {
			kind: "alu",
			x64: `; ${g}`,
			guest: g
		};
	}
}
var DbtCache = class {
	blocks = /* @__PURE__ */ new Map();
	translations = 0;
	hits = 0;
	misses = 0;
	last = null;
	invalidate() {
		this.blocks.clear();
		this.translations = 0;
		this.hits = 0;
		this.misses = 0;
		this.last = null;
	}
	translate(start, cpu, mem) {
		const guest = [];
		let pc = start >>> 0;
		for (let i = 0; i < 24; i++) {
			const d = decode(mem.read32(pc), pc);
			guest.push(d);
			pc = pc + 4 >>> 0;
			if (d.isControl) {
				const delay = decode(mem.read32(pc), pc);
				guest.push(delay);
				pc = pc + 4 >>> 0;
				break;
			}
		}
		const host = guest.map(toHost);
		const block = {
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
					if (jump !== void 0) {
						cpu.pendingJump = jump >>> 0;
						cpu.pc = cpu.pc + 4 >>> 0;
					} else cpu.pc = cpu.pc + 4 >>> 0;
					if (cpu.halted || cpu.panicked) return cpu.pc;
				}
				return cpu.pc;
			}
		};
		this.blocks.set(start >>> 0, block);
		this.translations += 1;
		return block;
	}
	runBlock(cpu, mem) {
		let block = this.blocks.get(cpu.pc);
		if (!block) {
			this.misses += 1;
			block = this.translate(cpu.pc, cpu, mem);
		} else this.hits += 1;
		block.hits += 1;
		this.last = block;
		block.execute();
		return block;
	}
	hottest(n = 6) {
		return [...this.blocks.values()].sort((a, b) => b.hits - a.hits).slice(0, n);
	}
};
var BaseDevice = class {
	id;
	name;
	base;
	size;
	lastRead = 0;
	lastWrite = 0;
	constructor(id, name, base, size) {
		this.id = id;
		this.name = name;
		this.base = base;
		this.size = size;
	}
	read(_offset) {
		return 0;
	}
	write(_offset, _value) {}
	reset() {
		this.lastRead = 0;
		this.lastWrite = 0;
	}
};
var IrqController = class extends BaseDevice {
	status = 0;
	mask = 4294967295;
	constructor() {
		super("irq", "Interrupt controller", MMIO.IRQ, 4096);
	}
	read(offset) {
		this.lastRead = offset;
		if (offset === 0) return this.status >>> 0;
		if (offset === 4) return this.mask >>> 0;
		return 0;
	}
	write(offset, value) {
		this.lastWrite = offset;
		if (offset === 4) this.mask = value >>> 0;
		if (offset === 8) this.status &= ~(value >>> 0);
	}
	raise(bit) {
		this.status |= 1 << bit;
	}
	reset() {
		super.reset();
		this.status = 0;
		this.mask = 4294967295;
	}
};
var TimerDevice = class extends BaseDevice {
	count = 0;
	compare = 1e3;
	control = 1;
	status = 1;
	watchdog = 0;
	watchdogFed = false;
	fired = false;
	constructor() {
		super("timer", "Timer / watchdog", MMIO.TIMER, 4096);
	}
	read(offset) {
		this.lastRead = offset;
		if (offset === 0) return this.status;
		if (offset === 4) return this.count >>> 0;
		if (offset === 8) return this.compare >>> 0;
		if (offset === 12) return this.control;
		if (offset === 256) return 0;
		if (offset === 260) return this.fired ? 1 : 0;
		return 0;
	}
	write(offset, value) {
		this.lastWrite = offset;
		if (offset === 8) this.compare = value >>> 0;
		if (offset === 12) this.control = value & 1;
		if (offset === 256) {
			this.watchdog = 0;
			this.watchdogFed = true;
			this.fired = false;
		}
	}
	tick(n = 1) {
		if (!this.control) return;
		this.count = this.count + n >>> 0;
		this.watchdog += n;
		if (this.count >= this.compare) {
			this.status |= 2;
			this.count = 0;
		}
		if (this.watchdog > 2e5) this.fired = true;
	}
	reset() {
		super.reset();
		this.count = 0;
		this.compare = 1e3;
		this.control = 1;
		this.status = 1;
		this.watchdog = 0;
		this.watchdogFed = false;
		this.fired = false;
	}
};
var UartDevice = class extends BaseDevice {
	tx = [];
	constructor() {
		super("uart", "UART console", MMIO.UART, 4096);
	}
	read(offset) {
		this.lastRead = offset;
		if (offset === 0) return 0;
		if (offset === 4) return 1;
		return 0;
	}
	write(offset, value) {
		this.lastWrite = offset;
		if (offset === 0) this.tx.push(value & 255);
	}
	reset() {
		super.reset();
		this.tx = [];
	}
};
var NandDevice = class extends BaseDevice {
	constructor() {
		super("nand", "NAND flash", MMIO.NAND, 4096);
	}
	read(offset) {
		this.lastRead = offset;
		if (offset === 0) return 1;
		if (offset === 4) return 60417;
		return 0;
	}
};
var TunerDevice = class extends BaseDevice {
	locked = true;
	constructor() {
		super("tuner", "Tuner / demod", MMIO.TUNER, 4096);
	}
	read(offset) {
		this.lastRead = offset;
		if (offset === 0) return this.locked ? 3 : 2;
		if (offset === 4) return 40;
		if (offset === 8) return 108e3;
		return 0;
	}
};
var FrontPanelDevice = class extends BaseDevice {
	leds = 0;
	buttons = 0;
	constructor() {
		super("panel", "Front-panel MCU", MMIO.PANEL, 4096);
	}
	read(offset) {
		this.lastRead = offset;
		if (offset === 0) return 1;
		if (offset === 4) return this.buttons;
		if (offset === 8) return this.leds;
		return 0;
	}
	write(offset, value) {
		this.lastWrite = offset;
		if (offset === 4) this.buttons = value >>> 0;
		if (offset === 8) this.leds = value >>> 0;
	}
	reset() {
		super.reset();
		this.leds = 0;
		this.buttons = 0;
	}
};
var PlayReadyDevice = class extends BaseDevice {
	inited = 0;
	constructor() {
		super("drm", "PlayReady stub", MMIO.DRM, 4096);
	}
	read(offset) {
		this.lastRead = offset;
		if (offset === 0) return 1;
		if (offset === 4) return 2;
		if (offset === 8) return this.inited;
		return 0;
	}
	write(offset, value) {
		this.lastWrite = offset;
		if (offset === 8 && value & 1) this.inited = 1;
	}
	reset() {
		super.reset();
		this.inited = 0;
	}
};
var RoleDevice = class extends BaseDevice {
	role = "master";
	constructor() {
		super("role", "MASTER / identity", MMIO.ROLE, 4096);
	}
	read(offset) {
		this.lastRead = offset;
		if (offset === 0) return ROLE_VALUE[this.role];
		if (offset === 4) return 1122867;
		if (offset === 8) return 1146447479;
		return 0;
	}
	setRole(role) {
		this.role = role;
	}
	reset() {
		super.reset();
	}
};
function createDevices() {
	const irq = new IrqController();
	const timer = new TimerDevice();
	const uart = new UartDevice();
	const nand = new NandDevice();
	const tuner = new TunerDevice();
	const panel = new FrontPanelDevice();
	const drm = new PlayReadyDevice();
	const role = new RoleDevice();
	return {
		irq,
		timer,
		uart,
		nand,
		tuner,
		panel,
		drm,
		role,
		all: [
			irq,
			timer,
			uart,
			nand,
			tuner,
			panel,
			drm,
			role
		]
	};
}
var PROGRAMS = [
	{
		id: "ce",
		title: "CE 5.0 boot",
		blurb: "A made-up boot that walks the same steps a U-verse box would, then sits in a live loop.",
		kind: "ce",
		source: `
.org 0x80001000
_start:
  li    $sp, 0x80080000
  li    $s0, 0x80010000
  sw    $zero, 8($s0)
  li    $a0, 1
  jal   setstage
  nop
  li    $a0, s_boot
  li    $a1, 0
  jal   putline
  nop

oeminit:
  li    $a0, 2
  jal   setstage
  nop
  li    $a0, s_oem
  li    $a1, 1
  jal   putline
  nop
  li    $t1, 0xBF010000
  lw    $t2, 0($t1)
  andi  $t2, $t2, 1
  beq   $t2, $zero, panic
  nop

kernel:
  li    $a0, 3
  jal   setstage
  nop
  li    $a0, s_kern
  li    $a1, 2
  jal   putline
  nop
  li    $t1, 0xBF010000
  addiu $t3, $zero, 1
  sw    $t3, 12($t1)

drivers:
  li    $a0, 4
  jal   setstage
  nop
  li    $t1, 0xBF000000
  lw    $t2, 0($t1)
  li    $t1, 0xBF030000
  lw    $t2, 0($t1)
  andi  $t2, $t2, 1
  beq   $t2, $zero, panic
  nop
  li    $t1, 0xBF040000
  lw    $t2, 0($t1)
  andi  $t2, $t2, 1
  beq   $t2, $zero, panic
  nop
  li    $t1, 0xBF050000
  lw    $t2, 0($t1)
  andi  $t2, $t2, 1
  beq   $t2, $zero, panic
  nop
  li    $a0, s_drv
  li    $a1, 3
  jal   putline
  nop

role:
  li    $a0, 5
  jal   setstage
  nop
  li    $t1, 0xBF070000
  lw    $t2, 0($t1)
  sw    $t2, 4($s0)
  li    $a0, s_role
  li    $a1, 4
  jal   putline
  nop

drm:
  li    $a0, 6
  jal   setstage
  nop
  li    $t1, 0xBF060000
  lw    $t2, 0($t1)
  andi  $t2, $t2, 1
  beq   $t2, $zero, panic
  nop
  addiu $t3, $zero, 1
  sw    $t3, 8($t1)
  li    $a0, s_drm
  li    $a1, 5
  jal   putline
  nop

middleware:
  li    $a0, 7
  jal   setstage
  nop
  li    $a0, s_mid
  li    $a1, 6
  jal   putline
  nop
  li    $a0, s_ban
  li    $a1, 8
  jal   putline
  nop
  li    $a0, s_ch
  li    $a1, 10
  jal   putline
  nop
  li    $a0, s_ok
  li    $a1, 12
  jal   putline
  nop

ui_loop:
  li    $a0, 8
  jal   setstage
  nop
  lw    $t3, 8($s0)
  addiu $t3, $t3, 1
  sw    $t3, 8($s0)
  li    $t1, 0xBF010100
  sw    $t3, 0($t1)
  li    $t1, 0xBF050000
  lw    $t2, 0($t1)
  li    $t1, 0xBF040000
  lw    $t2, 0($t1)
  j     ui_loop
  nop

panic:
  addiu $t0, $zero, 255
  sw    $t0, 0($s0)
  li    $a0, s_panic
  li    $a1, 14
  jal   putline
  nop
hang:
  j     hang
  nop

setstage:
  sw    $a0, 0($s0)
  jr    $ra
  nop

putline:
  addiu $sp, $sp, -8
  sw    $ra, 0($sp)
  sw    $a0, 4($sp)
  addiu $t0, $zero, 40
  mult  $a1, $t0
  mflo  $t1
  li    $t2, 0x80020000
  addu  $a1, $t2, $t1
  lw    $a0, 4($sp)
  jal   strcpy
  nop
  lw    $ra, 0($sp)
  addiu $sp, $sp, 8
  jr    $ra
  nop

strcpy:
  lbu   $t0, 0($a0)
  sb    $t0, 0($a1)
  beq   $t0, $zero, strcpy_done
  nop
  addiu $a0, $a0, 1
  addiu $a1, $a1, 1
  j     strcpy
  nop
strcpy_done:
  jr    $ra
  nop

s_boot:
  .asciiz "BOOTLOADER   nk.bin  CE 5.0"
s_oem:
  .asciiz "OEMInit      BSP probe"
s_kern:
  .asciiz "KERNEL       timers online"
s_drv:
  .asciiz "DRIVERS      nand tuner panel"
s_role:
  .asciiz "IDENTITY     MASTER check"
s_drm:
  .asciiz "PLAYREADY    present, no license"
s_mid:
  .asciiz "MIDDLEWARE   mediaroom start"
s_ban:
  .asciiz "  MEDIAROOM  * TECHNICALLY UP *"
s_ch:
  .asciiz "  CH 2  LAB FEED     TUNER LOCK"
s_ok:
  .asciiz "  GUIDE  DVR  MENU     LIVE"
s_panic:
  .asciiz "PANIC  device not ready"
`
	},
	{
		id: "smoke",
		title: "CPU smoke",
		blurb: "Adds 40 + 2 and writes 42. If this fails, the chip is lying.",
		kind: "probe",
		source: `
.org 0x80001000
_start:
  addiu $t0, $zero, 40
  addiu $t1, $zero, 2
  addu  $t2, $t0, $t1
  li    $t3, 0x80002000
  sw    $t2, 0($t3)
  li    $a0, msg
  li    $v0, 4
  syscall
  li    $v0, 10
  syscall
msg:
  .asciiz "smoke: 40+2 written to 80002000\\n"
`
	},
	{
		id: "fib",
		title: "Fibonacci",
		blurb: "Counts the 12th Fibonacci number. The answer has to be 144.",
		kind: "demo",
		source: `
.org 0x80001000
_start:
  li    $sp, 0x80080000
  li    $a0, 12
  jal   fib
  nop
  li    $t0, 0x80002000
  sw    $v0, 0($t0)
  li    $a0, msg
  li    $v0, 4
  syscall
  move  $a0, $v0
  li    $v0, 1
  syscall
  li    $v0, 10
  syscall

fib:
  addiu $sp, $sp, -8
  sw    $s0, 0($sp)
  sw    $s1, 4($sp)
  move  $s0, $zero
  addiu $s1, $zero, 1
  beq   $a0, $zero, fib_zero
  nop
loop:
  addiu $a0, $a0, -1
  beq   $a0, $zero, fib_done
  nop
  addu  $t0, $s0, $s1
  move  $s0, $s1
  move  $s1, $t0
  j     loop
  nop
fib_zero:
  move  $v0, $zero
  j     fib_ret
  nop
fib_done:
  move  $v0, $s1
fib_ret:
  lw    $s0, 0($sp)
  lw    $s1, 4($sp)
  addiu $sp, $sp, 8
  jr    $ra
  nop
msg:
  .asciiz "fib(12)="
`
	},
	{
		id: "uart",
		title: "UART hello",
		blurb: "Writes a hello message through a fake serial port.",
		kind: "demo",
		source: `
.org 0x80001000
_start:
  li    $a0, hello
  jal   puts
  nop
  li    $v0, 10
  syscall

puts:
  lbu   $t0, 0($a0)
  beq   $t0, $zero, puts_done
  nop
  li    $t1, 0xBF020000
  sw    $t0, 0($t1)
  addiu $a0, $a0, 1
  j     puts
  nop
puts_done:
  jr    $ra
  nop
hello:
  .asciiz "MIPS guest talking through emulated UART.\\n"
`
	}
];
function programById(id) {
	return PROGRAMS.find((p) => p.id === id) ?? PROGRAMS[0];
}
var Memory = class {
	ram;
	devices = [];
	littleEndian = true;
	mmioLog = [];
	mmioReads = 0;
	mmioWrites = 0;
	lastPc = 0;
	seq = 0;
	onUart;
	constructor(size = PHYS_RAM_SIZE) {
		this.ram = new Uint8Array(size);
	}
	reset() {
		this.ram.fill(0);
		this.mmioLog = [];
		this.mmioReads = 0;
		this.mmioWrites = 0;
		this.seq = 0;
		for (const d of this.devices) d.reset();
	}
	registerDevice(device) {
		this.devices.push(device);
	}
	deviceAt(phys) {
		return this.devices.find((d) => phys >= d.base && phys < d.base + d.size);
	}
	log(rw, addr, value, device) {
		this.seq += 1;
		if (this.mmioLog.length > 400) this.mmioLog.splice(0, 80);
		this.mmioLog.push({
			n: this.seq,
			pc: this.lastPc,
			rw,
			addr: addr >>> 0,
			value: value >>> 0,
			device
		});
	}
	read8(addr) {
		const phys = virtToPhys(addr);
		const dev = this.deviceAt(phys);
		if (dev) {
			const v = dev.read(phys - dev.base) & 255;
			this.mmioReads += 1;
			this.log("R", addr, v, dev.id);
			return v;
		}
		if (phys >= this.ram.length) return 0;
		return this.ram[phys];
	}
	write8(addr, value) {
		const phys = virtToPhys(addr);
		const v = value & 255;
		const dev = this.deviceAt(phys);
		if (dev) {
			dev.write(phys - dev.base, v);
			this.mmioWrites += 1;
			this.log("W", addr, v, dev.id);
			if (dev.id === "uart" && phys - dev.base === 0) this.onUart?.(v);
			return;
		}
		if (phys >= this.ram.length) return;
		this.ram[phys] = v;
	}
	read16(addr) {
		if (this.littleEndian) return this.read8(addr) | this.read8(addr + 1) << 8;
		return this.read8(addr) << 8 | this.read8(addr + 1);
	}
	write16(addr, value) {
		if (this.littleEndian) {
			this.write8(addr, value);
			this.write8(addr + 1, value >> 8);
		} else {
			this.write8(addr, value >> 8);
			this.write8(addr + 1, value);
		}
	}
	read32(addr) {
		const phys = virtToPhys(addr);
		const dev = this.deviceAt(phys);
		if (dev) {
			const v = dev.read(phys - dev.base) >>> 0;
			this.mmioReads += 1;
			this.log("R", addr, v, dev.id);
			return v;
		}
		if (phys + 3 >= this.ram.length) return 0;
		if (this.littleEndian) return (this.ram[phys] | this.ram[phys + 1] << 8 | this.ram[phys + 2] << 16 | this.ram[phys + 3] << 24) >>> 0;
		return (this.ram[phys] << 24 | this.ram[phys + 1] << 16 | this.ram[phys + 2] << 8 | this.ram[phys + 3]) >>> 0;
	}
	write32(addr, value) {
		const phys = virtToPhys(addr);
		const v = value >>> 0;
		const dev = this.deviceAt(phys);
		if (dev) {
			dev.write(phys - dev.base, v);
			this.mmioWrites += 1;
			this.log("W", addr, v, dev.id);
			if (dev.id === "uart" && phys - dev.base === 0) this.onUart?.(v & 255);
			return;
		}
		if (phys + 3 >= this.ram.length) return;
		if (this.littleEndian) {
			this.ram[phys] = v & 255;
			this.ram[phys + 1] = v >>> 8 & 255;
			this.ram[phys + 2] = v >>> 16 & 255;
			this.ram[phys + 3] = v >>> 24 & 255;
		} else {
			this.ram[phys] = v >>> 24 & 255;
			this.ram[phys + 1] = v >>> 16 & 255;
			this.ram[phys + 2] = v >>> 8 & 255;
			this.ram[phys + 3] = v & 255;
		}
	}
	loadBinary(bytes, virtAddr) {
		const phys = virtToPhys(virtAddr);
		this.ram.set(bytes.subarray(0, Math.max(0, this.ram.length - phys)), phys);
	}
	readBytes(virtAddr, len) {
		const out = new Uint8Array(len);
		for (let i = 0; i < len; i++) out[i] = this.read8(virtAddr + i);
		return out;
	}
	ascii(virtAddr, len) {
		const bytes = this.readBytes(virtAddr, len);
		let s = "";
		for (const b of bytes) if (b === 0) s += " ";
		else if (b >= 32 && b < 127) s += String.fromCharCode(b);
		else s += "·";
		return s;
	}
};
var Hypervisor = class {
	cpu = new Cpu();
	mem = new Memory();
	dbt = new DbtCache();
	devices = createDevices();
	uart = "";
	programId = "ce";
	assembled = null;
	role = "master";
	loaded = false;
	selfTest = {
		ok: false,
		detail: "not run"
	};
	constructor() {
		for (const d of this.devices.all) this.mem.registerDevice(d);
		this.mem.onUart = (ch) => {
			if (ch === 10) this.uart += "\n";
			else if (ch >= 32 && ch < 127) this.uart += String.fromCharCode(ch);
		};
		this.selfTest = runSelfTest();
		this.load("ce");
	}
	setRole(role) {
		this.role = role;
		this.devices.role.setRole(role);
	}
	load(id) {
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
	runBatch(n) {
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
			frames: this.mem.read32(MAILBOX + 8) >>> 0
		};
	}
	criteria() {
		const mb = this.mailbox();
		const panicked = this.cpu.panicked;
		const pcInUiLoop = mb.stage === 8 && !panicked;
		const technicallyBoots = mb.stage === 8 && mb.frames >= 3 && this.devices.timer.watchdogFed && !panicked && this.cpu.insnCount > 40 && this.mem.mmioReads > 4;
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
			technicallyBoots
		};
	}
	framebuffer() {
		const raw = this.mem.ascii(FRAMEBUFFER, 640);
		const lines = [];
		for (let r = 0; r < 16; r++) lines.push(raw.slice(r * 40, (r + 1) * 40));
		return lines;
	}
	pressPanel(bits) {
		this.devices.panel.buttons = bits >>> 0;
	}
	snapshot() {
		const mb = this.mailbox();
		const last = this.dbt.last;
		const cur = this.cpu.last ?? decode(this.mem.read32(this.cpu.pc), this.cpu.pc);
		return {
			pc: this.cpu.pc >>> 0,
			sp: this.cpu.regs[29] >>> 0,
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
			lastBlock: last ? {
				start: last.startPc,
				hits: last.hits,
				guest: last.guest.map((d) => formatInsn(d)),
				host: last.host.map((h) => h.x64)
			} : null,
			hot: this.dbt.hottest(5).map((b) => ({
				start: b.startPc,
				hits: b.hits,
				words: b.words
			})),
			mmio: this.mem.mmioLog.slice(-24),
			devices: this.devices.all.map((d) => ({
				id: d.id,
				name: d.name,
				base: d.base,
				lastRead: d.lastRead ?? 0,
				lastWrite: d.lastWrite ?? 0
			})),
			listing: this.assembled?.listing ?? [],
			programId: this.programId,
			programTitle: programById(this.programId).title,
			role: this.role,
			selfTest: this.selfTest,
			loaded: this.loaded,
			assembleErrors: this.assembled?.errors ?? []
		};
	}
};
function runSelfTest() {
	const mem = new Memory();
	const cpu = new Cpu();
	const assembled = assemble(programById("smoke").source, ENTRY_PC);
	if (assembled.errors.length) return {
		ok: false,
		detail: assembled.errors[0]
	};
	mem.loadBinary(assembled.bytes, ENTRY_PC);
	cpu.reset(ENTRY_PC, STACK_TOP);
	for (let i = 0; i < 200 && !cpu.halted && !cpu.panicked; i++) stepOne(cpu, mem);
	const got = mem.read32(2147491840) >>> 0;
	if (got !== 42) return {
		ok: false,
		detail: `smoke expected 42, got ${got}`
	};
	const fib = assemble(programById("fib").source, ENTRY_PC);
	const mem2 = new Memory();
	const cpu2 = new Cpu();
	mem2.loadBinary(fib.bytes, ENTRY_PC);
	cpu2.reset(ENTRY_PC, STACK_TOP);
	for (let i = 0; i < 4e3 && !cpu2.halted && !cpu2.panicked; i++) stepOne(cpu2, mem2);
	const f = mem2.read32(2147491840) >>> 0;
	if (f !== 144) return {
		ok: false,
		detail: `fib(12) expected 144, got ${f}`
	};
	return {
		ok: true,
		detail: "smoke=42  fib(12)=144"
	};
}
var CHANNELS = [
	{
		number: 2,
		name: "Lab Feed",
		line: "Test pattern · the tuner is locked",
		src: "/tv/ch-lab.jpg",
		kind: "picture"
	},
	{
		number: 3,
		name: "Hearth",
		line: "Fireplace · no rights, just a picture",
		src: "/tv/ch-hearth.jpg",
		kind: "picture"
	},
	{
		number: 4,
		name: "Tank",
		line: "Aquarium · the calm channel",
		src: "/tv/ch-tank.jpg",
		kind: "picture"
	},
	{
		number: 5,
		name: "Sky",
		line: "Weather plate · Midwestern afternoon",
		src: "/tv/ch-weather.jpg",
		kind: "picture"
	},
	{
		number: 7,
		name: "Rain",
		line: "City window · overnight",
		src: "/tv/ch-city.jpg",
		kind: "picture"
	},
	{
		number: 11,
		name: "Snow",
		line: "No signal · what a dead tuner looks like",
		src: null,
		kind: "snow"
	}
];
function wrapIndex(i) {
	const n = CHANNELS.length;
	return (i % n + n) % n;
}
var hv = null;
function getHv() {
	if (!hv) hv = new Hypervisor();
	if (typeof window !== "undefined") window.__hv = getHv;
	return hv;
}
var PANEL_BITS = {
	"ch+": 1,
	"ch-": 2,
	guide: 4,
	menu: 8,
	ok: 16,
	exit: 32,
	info: 64
};
function readIntro() {
	if (typeof window === "undefined") return true;
	try {
		return window.localStorage.getItem("uverse-lab-intro") !== "1";
	} catch {
		return true;
	}
}
var useLab = create((set, get) => ({
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
		set({
			running: false,
			snap: getHv().snapshot()
		});
	},
	reset: () => {
		getHv().reset();
		set({
			running: get().powered,
			tvMode: "live",
			snap: getHv().snapshot()
		});
	},
	step: () => {
		getHv().step();
		set({ snap: getHv().snapshot() });
	},
	toggle: () => {
		const next = !get().running;
		set({
			running: next,
			powered: next ? true : get().powered
		});
	},
	setSpeed: (speed) => set({ speed }),
	setTab: (tab) => set({ tab }),
	setRole: (r) => {
		getHv().setRole(r);
		getHv().reset();
		set({
			running: false,
			powered: false,
			tvMode: "live",
			snap: getHv().snapshot()
		});
	},
	pump: (n) => {
		getHv().runBatch(n);
		const snap = getHv().snapshot();
		set({
			snap,
			running: snap.halted || !!snap.panicked ? false : get().running
		});
	},
	power: () => {
		const { powered, snap } = get();
		if (powered) {
			set({
				powered: false,
				running: false,
				tvMode: "live",
				showInfo: false
			});
			return;
		}
		if (!snap || snap.stage === 0 || snap.programId !== "ce" || snap && snap.stage < 8) {
			getHv().load("ce");
			getHv().reset();
		}
		set({
			powered: true,
			running: true,
			tvMode: "live",
			lastRemote: "power",
			introOpen: false,
			snap: getHv().snapshot()
		});
		try {
			window.localStorage.setItem("uverse-lab-intro", "1");
		} catch {}
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
				snap: getHv().snapshot()
			});
			return;
		}
		if (key === "menu") {
			set({
				tvMode: tvMode === "menu" ? "live" : "menu",
				lastRemote: key,
				showInfo: false,
				snap: getHv().snapshot()
			});
			return;
		}
		if (key === "exit") {
			set({
				tvMode: "live",
				lastRemote: key,
				showInfo: false,
				snap: getHv().snapshot()
			});
			return;
		}
		if (key === "info") {
			set({
				showInfo: !get().showInfo,
				lastRemote: key,
				snap: getHv().snapshot()
			});
			return;
		}
		if (key === "ch+" || key === "ch-") {
			const dir = key === "ch+" ? 1 : -1;
			if (tvMode === "guide") set({
				guideIndex: wrapIndex(guideIndex + dir),
				lastRemote: key,
				snap: getHv().snapshot()
			});
			else {
				set({
					channelIndex: wrapIndex(channelIndex + dir),
					lastRemote: key,
					tvMode: "live",
					showInfo: true,
					snap: getHv().snapshot()
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
					snap: getHv().snapshot()
				});
				window.setTimeout(() => set({ showInfo: false }), 3200);
			} else set({
				lastRemote: key,
				snap: getHv().snapshot()
			});
		}
	},
	dismissIntro: () => {
		set({ introOpen: false });
		try {
			window.localStorage.setItem("uverse-lab-intro", "1");
		} catch {}
	},
	proveChip: () => {
		set({
			proving: true,
			proof: null
		});
		set({
			proving: false,
			proof: runSelfTest()
		});
	},
	backToBox: () => {
		getHv().load("ce");
		getHv().reset();
		set({
			snap: getHv().snapshot(),
			powered: false,
			running: false,
			tvMode: "live",
			tab: "room"
		});
	}
}));
function HowItWorks() {
	const proof = useLab((s) => s.proof);
	const proving = useLab((s) => s.proving);
	const proveChip = useLab((s) => s.proveChip);
	const setTab = useLab((s) => s.setTab);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "mx-auto flex max-w-2xl flex-col gap-8 px-1 py-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs uppercase tracking-[0.22em] text-subtle",
				children: "Plain English"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-2 text-3xl font-semibold tracking-tight",
				children: "Copilot described a real idea. This is that idea, in a box you can watch."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-lg font-medium",
						children: "What you were looking at before"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-base leading-relaxed text-muted",
						children: "That wall of green numbers was not a movie. A tiny computer inside this page was running. It only speaks MIPS — the language old U-verse boxes used. Your laptop does not speak MIPS, so every instruction gets translated as it happens. That is the “runtime translation” Copilot was talking about."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-base leading-relaxed text-muted",
						children: "The problem: if you do not read assembly, a working chip looks exactly like a screensaver. Numbers go up. Nothing on the screen means anything. It feels fake."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-lg font-medium",
					children: "What this is now"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-base leading-relaxed text-muted",
					children: "Same chip. Same translation. Now it has a TV. Press Power and you can watch the box boot, lock a fake tuner, and sit in a live loop. Change the channel and the picture changes. That is cause and effect."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
				className: "grid gap-4 md:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs uppercase tracking-[0.18em] text-subtle",
							children: "1 · Chip"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm leading-relaxed text-muted",
							children: "A real MIPS program is executing in this page. It is not a video of a CPU. It is a CPU."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs uppercase tracking-[0.18em] text-subtle",
							children: "2 · Fake parts"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm leading-relaxed text-muted",
							children: "A real box panics if the tuner or flash chip is missing. We do not have those, so when the program asks “are you there?” we say yes."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs uppercase tracking-[0.18em] text-subtle",
							children: "3 · Picture"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm leading-relaxed text-muted",
							children: "Nobody has AT&T’s firmware. The TV picture is a model we put on top so you can see the box live, instead of reading hex."
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-lg bg-surface p-5 shadow-[var(--shadow-border)]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-lg font-medium",
						children: "Prove the chip is not a movie"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm leading-relaxed text-muted",
						children: "This runs two tiny programs that have only one correct answer: 40+2 must be 42, and the 12th Fibonacci number must be 144. If the chip were fake, we could print any number. The test fails if the math is wrong."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-wrap items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: proveChip,
							disabled: proving,
							children: proving ? "Running…" : "Run the proof"
						}), proof && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: proof.ok ? "text-sm text-ok" : "text-sm text-bad",
							children: [
								proof.ok ? "Both answers came back right." : "The chip failed.",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-xs text-muted",
									children: proof.detail
								})
							]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-lg font-medium",
					children: "What this is not"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-base leading-relaxed text-muted",
					children: "Not stolen AT&T software. Not a real tuner. Not PlayReady movie keys. Pace, Motorola, Cisco, Ericsson — they do not have the schematics anymore. So this can never be a perfect clone. It can be honest: a model box whose CPU is real, whose parts are stubbed, and whose TV you can actually watch."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => setTab("room"),
					children: "Back to the TV"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					onClick: () => setTab("inside"),
					children: "Peek at the chip"
				})]
			})
		]
	});
}
var STAGE_STEPS = [
	{
		stage: 1,
		label: "Starting the box",
		detail: "The first tiny program wakes up."
	},
	{
		stage: 2,
		label: "Checking the board",
		detail: "It asks what kind of box it is sitting in."
	},
	{
		stage: 3,
		label: "Starting the system",
		detail: "A clock starts so it knows time is passing."
	},
	{
		stage: 4,
		label: "Finding the parts",
		detail: "Flash chip, tuner, front panel — we say they are here."
	},
	{
		stage: 5,
		label: "Who am I?",
		detail: "Living-room box, bedroom box, or slave."
	},
	{
		stage: 6,
		label: "Copy protection",
		detail: "It looks for a movie-license chip. We stub it."
	},
	{
		stage: 7,
		label: "TV software",
		detail: "The guide and live picture stack come up."
	},
	{
		stage: 8,
		label: "Live",
		detail: "The box is painting frames so it will not fall asleep."
	}
];
var DEVICE_PLAIN = {
	tuner: "the tuner — the part that finds a channel",
	panel: "the front-panel buttons",
	timer: "the box clock / watchdog",
	nand: "the flash chip, where software would live",
	drm: "the copy-protection chip",
	role: "the identity switch (living room vs bedroom)",
	irq: "the interrupt controller",
	uart: "a serial port used for debug text"
};
function lastChipAsk(snap) {
	const e = snap.mmio[snap.mmio.length - 1];
	if (!e) return null;
	const who = DEVICE_PLAIN[e.device] ?? e.device;
	if (e.rw === "R") return `The chip just asked ${who}: are you there? We said yes.`;
	if (e.device === "timer") return "The chip just fed the watchdog so the box will not reboot itself.";
	return `The chip just wrote to ${who}.`;
}
function englishInsn(line) {
	const s = line.trim().toLowerCase();
	if (!s || s === "nop") return "A pause. The chip waits one beat.";
	if (s.startsWith("lw") || s.startsWith("lbu") || s.startsWith("lh")) return "It is reading a number out of memory.";
	if (s.startsWith("sw") || s.startsWith("sb") || s.startsWith("sh")) return "It is writing a number into memory.";
	if (s.startsWith("addiu") || s.startsWith("addi") || s.startsWith("addu") || s.startsWith("add ")) return "It is adding two numbers.";
	if (s.startsWith("sub")) return "It is subtracting.";
	if (s.startsWith("j ") || s.startsWith("jr") || s.startsWith("jal")) return "It is jumping to another part of the program.";
	if (s.startsWith("beq") || s.startsWith("bne") || s.startsWith("bgtz") || s.startsWith("blez")) return "It is deciding which way to go next.";
	if (s.startsWith("lui") || s.startsWith("ori") || s.startsWith("andi")) return "It is building a number in a register.";
	if (s.startsWith("syscall")) return "It is asking the host for a favor (print, exit).";
	if (s.startsWith("mult")) return "It is multiplying.";
	return "The chip is doing one small step.";
}
function narrate(snap, extras) {
	const ch = CHANNELS[extras.channelIndex] ?? CHANNELS[0];
	const ask = lastChipAsk(snap);
	if (!extras.powered) return {
		headline: "The box is off.",
		body: "Press Power. A tiny program will start — the first thing a set-top runs when you wake it. You do not need to read any of the numbers.",
		whisper: "Standby. Red light on the front panel."
	};
	if (snap.panicked) return {
		headline: "The box panicked.",
		body: "It asked for a part we did not fake well enough, and it froze. That is exactly what a real U-verse box does when the hardware looks wrong.",
		whisper: snap.panicked
	};
	if (snap.programId !== "ce") return {
		headline: "A proof program is running.",
		body: "This is not the TV. This is a tiny test so you can see the chip actually compute something, then we put the box back.",
		whisper: snap.uart.trim() || englishInsn(snap.current)
	};
	if (snap.stage > 0 && snap.stage < 8) {
		const step = STAGE_STEPS.find((s) => s.stage === snap.stage) ?? STAGE_STEPS[0];
		return {
			headline: step.label,
			body: step.detail,
			whisper: ask ?? englishInsn(snap.current)
		};
	}
	if (snap.stage >= 8) return {
		headline: "The TV is on.",
		body: (extras.lastRemote === "ch+" ? `You pressed Channel Up. Now showing ${ch.number} ${ch.name}.` : extras.lastRemote === "ch-" ? `You pressed Channel Down. Now showing ${ch.number} ${ch.name}.` : extras.lastRemote === "guide" ? "Guide is open. The chip is still looping in the background." : extras.lastRemote === "menu" ? "Box menu. Role and honesty live here." : null) ?? `Channel ${ch.number} · ${ch.name}. The climbing frame count is the box painting the next picture so it will not fall asleep. The picture is ours. The heartbeat is the chip.`,
		whisper: ask ?? `Frame ${snap.frames.toLocaleString()} · still looping.`
	};
	return {
		headline: "Waking up…",
		body: "The chip has the program. It has not taken its first step yet.",
		whisper: "Waiting on Power."
	};
}
function Inside({ snap }) {
	const ask = lastChipAsk(snap);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-lg font-medium",
							children: "What the chip is doing, in English"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-base text-fg",
							children: englishInsn(snap.current)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted",
							children: ask ?? "No device traffic in the last moment."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-3 font-mono text-xs text-subtle",
							children: [
								hex(snap.pc),
								" · ",
								snap.current
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-sm font-medium",
						children: "Boot checklist"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
						className: "mt-3 flex flex-col gap-2",
						children: STAGE_STEPS.map((s) => {
							const done = snap.stage > s.stage || snap.stage === 8 && s.stage === 8;
							const here = snap.stage === s.stage;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-start gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("mt-1.5 size-1.5 shrink-0 rounded-full", here ? "bg-crt" : done ? "bg-ok" : "bg-subtle") }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: cn("text-sm", done || here ? "text-fg" : "text-subtle"),
									children: s.label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted",
									children: s.detail
								})] })]
							}, s.stage);
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-sm font-medium",
							children: "How translation works"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm leading-relaxed text-muted",
							children: "The first time the chip hits a stretch of code, we decode it and remember the translation. The next million times through that loop, we reuse the memory. That is why “hits” climb and “misses” stay small. We never convert the whole program up front."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
							className: "mt-4 grid grid-cols-3 gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "Hits",
									value: snap.dbtHits
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "First times",
									value: snap.dbtMisses
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "Remembered",
									value: snap.dbtBlocks
								})
							]
						})
					]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "flex flex-col gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-sm font-medium",
						children: "Alive?"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "mt-3 flex flex-col gap-2 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								ok: snap.criteria.loaded,
								label: "Program loaded"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								ok: snap.insnCount > 0,
								label: "Chip has taken a step"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								ok: snap.criteria.tunerLocked,
								label: "Tuner says locked"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								ok: snap.criteria.watchdogFed,
								label: "Watchdog fed"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								ok: snap.stage >= 8,
								label: "Sitting in the live loop"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								ok: !snap.panicked,
								label: "Has not panicked"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 font-mono text-xs text-subtle",
						children: [
							snap.insnCount.toLocaleString(),
							" steps · ",
							snap.frames.toLocaleString(),
							" frames"
						]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TransportMini, {})]
		})]
	});
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-sm bg-inset px-3 py-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "text-[0.65rem] uppercase tracking-wider text-subtle",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: "mt-1 font-mono text-lg tabular text-fg",
			children: value.toLocaleString()
		})]
	});
}
function Row({ ok, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: "flex items-center justify-between gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: ok ? "text-fg" : "text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: ok ? "text-ok" : "text-subtle",
			children: ok ? "yes" : "no"
		})]
	});
}
function TransportMini() {
	const running = useLab((s) => s.running);
	const toggle = useLab((s) => s.toggle);
	const step = useLab((s) => s.step);
	const reset = useLab((s) => s.reset);
	const powered = useLab((s) => s.powered);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-sm font-medium",
				children: "Slow it down"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-muted",
				children: "Pause and step if you want to watch one instruction at a time."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						onClick: toggle,
						disabled: !powered,
						children: running ? "Pause" : "Run"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						onClick: step,
						disabled: !powered,
						children: "One step"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						onClick: reset,
						children: "Reset"
					})
				]
			})
		]
	});
}
var KEYS = [
	{
		id: "power",
		label: "Power",
		tone: "power"
	},
	{
		id: "ch+",
		label: "CH +"
	},
	{
		id: "ch-",
		label: "CH −"
	},
	{
		id: "guide",
		label: "Guide"
	},
	{
		id: "menu",
		label: "Menu"
	},
	{
		id: "ok",
		label: "OK",
		tone: "ok"
	},
	{
		id: "info",
		label: "Info"
	},
	{
		id: "exit",
		label: "Exit"
	}
];
function Remote() {
	const remote = useLab((s) => s.remote);
	const last = useLab((s) => s.lastRemote);
	const powered = useLab((s) => s.powered);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "remote",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-3 text-center text-[0.65rem] uppercase tracking-[0.22em] text-subtle",
				children: "Remote"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 gap-2",
				children: KEYS.map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => remote(k.id),
					className: cn("remote-key", k.tone === "power" && "remote-key-power col-span-2", k.tone === "ok" && "remote-key-ok col-span-2", last === k.id && "remote-key-lit", !powered && k.id !== "power" && "opacity-50"),
					children: k.label
				}, k.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-center text-xs text-subtle",
				children: "Keyboard: space, ↑ ↓, G, M, I, Esc"
			})
		]
	});
}
function Television({ snap }) {
	const powered = useLab((s) => s.powered);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "tv-bezel",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "tv-glass",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TvRaster, { snap }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "tv-scan",
					"aria-hidden": true
				}),
				!powered && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "tv-glint",
					"aria-hidden": true
				})
			]
		})
	});
}
function TvRaster({ snap }) {
	const powered = useLab((s) => s.powered);
	const tvMode = useLab((s) => s.tvMode);
	const channelIndex = useLab((s) => s.channelIndex);
	const showInfo = useLab((s) => s.showInfo);
	const ch = CHANNELS[channelIndex] ?? CHANNELS[0];
	const booting = powered && snap.programId === "ce" && snap.stage < 8 && !snap.panicked;
	const live = powered && snap.stage >= 8 && !snap.panicked;
	if (!powered) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StandbyClock, {});
	if (snap.panicked) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanicScreen, { reason: snap.panicked });
	if (booting) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BootScreen, { snap });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative h-full min-h-0 overflow-hidden bg-standby",
		children: [
			live && ch.kind === "picture" && ch.src && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: ch.src,
				alt: "",
				className: "absolute inset-0 size-full object-cover"
			}, ch.number),
			live && ch.kind === "snow" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Snow, {}),
			!live && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-standby" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3 md:p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "rounded-sm bg-standby/70 px-2 py-1 font-mono text-xs tracking-wide text-fg",
					children: snap.role === "slave" ? "Bedroom" : snap.role === "wireless-master" ? "Wireless" : "Living room"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "rounded-sm bg-standby/70 px-2 py-1 text-right",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block font-mono text-sm font-medium tabular text-fg",
						children: ch.number
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block text-[0.65rem] uppercase tracking-wider text-muted",
						children: ch.name
					})]
				})]
			}),
			showInfo && live && tvMode === "live" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute inset-x-3 bottom-3 rounded-md bg-standby/80 px-3 py-2 md:inset-x-4 md:bottom-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "font-mono text-sm text-fg",
					children: [
						"CH ",
						ch.number,
						" ",
						ch.name
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted",
					children: ch.line
				})]
			}),
			tvMode === "guide" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GuideOverlay, {}),
			tvMode === "menu" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MenuOverlay, { snap })
		]
	});
}
function StandbyClock() {
	const now = useClock();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full min-h-56 flex-col items-center justify-center bg-standby text-center md:min-h-72",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-mono text-4xl font-medium tabular tracking-tight text-fg/90 md:text-5xl",
			children: now
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-xs uppercase tracking-[0.22em] text-subtle",
			children: "Standby"
		})]
	});
}
function useClock() {
	const [t, setT] = (0, import_react.useState)(() => (/* @__PURE__ */ new Date()).toLocaleTimeString([], {
		hour: "numeric",
		minute: "2-digit"
	}));
	(0, import_react.useEffect)(() => {
		const tick = () => setT((/* @__PURE__ */ new Date()).toLocaleTimeString([], {
			hour: "numeric",
			minute: "2-digit"
		}));
		const id = window.setInterval(tick, 1e4);
		return () => window.clearInterval(id);
	}, []);
	return t;
}
function BootScreen({ snap }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full min-h-56 flex-col bg-standby px-5 py-5 md:min-h-72 md:px-8 md:py-7",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs uppercase tracking-[0.28em] text-subtle",
				children: "Uverse Lab"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-2 text-2xl font-semibold tracking-tight text-fg md:text-3xl",
				children: "Model set-top"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 max-w-sm text-sm text-muted",
				children: "Not AT&T firmware. A tiny program walking the same steps."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "mt-6 flex flex-1 flex-col justify-center gap-2",
				children: STAGE_STEPS.map((s) => {
					const done = snap.stage > s.stage || snap.stage === 8;
					const here = snap.stage === s.stage;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: cn("flex items-center gap-3 text-sm transition-opacity duration-200", here ? "text-fg" : done ? "text-muted" : "text-subtle/60"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("size-1.5 rounded-full", here ? "bg-crt" : done ? "bg-ok" : "bg-subtle/50") }), s.label]
					}, s.stage);
				})
			})
		]
	});
}
function PanicScreen({ reason }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full min-h-56 flex-col items-center justify-center bg-standby px-6 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs uppercase tracking-[0.22em] text-bad",
				children: "Panic"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 max-w-sm text-sm text-muted",
				children: "The program asked for a part that was not ready, and it froze. That is what a real box does."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 font-mono text-xs text-subtle",
				children: reason
			})
		]
	});
}
function Snow() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "tv-snow absolute inset-0",
		"aria-hidden": true
	});
}
function GuideOverlay() {
	const channelIndex = useLab((s) => s.channelIndex);
	const guideIndex = useLab((s) => s.guideIndex);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "absolute inset-0 flex flex-col bg-standby/88",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "border-b border-line px-4 py-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs uppercase tracking-[0.2em] text-subtle",
				children: "Guide"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Channel Up / Down, then OK"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "flex-1 overflow-auto px-2 py-2",
			children: CHANNELS.map((ch, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: cn("flex items-center justify-between rounded-sm px-3 py-2.5", i === guideIndex && "bg-elevated"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "w-6 font-mono text-sm tabular text-fg",
						children: ch.number
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm text-fg",
						children: ch.name
					})]
				}), i === channelIndex && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[0.65rem] uppercase tracking-wider text-crt",
					children: "Now"
				})]
			}, ch.number))
		})]
	});
}
function MenuOverlay({ snap }) {
	const setRole = useLab((s) => s.setRole);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "absolute inset-0 flex flex-col bg-standby/90 px-4 py-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs uppercase tracking-[0.2em] text-subtle",
				children: "Box menu"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mt-1 text-lg font-medium",
				children: "What kind of box is this?"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 max-w-sm text-sm text-muted",
				children: "A real U-verse house had a living-room box and optional bedroom boxes. The chip asks. We answer."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 flex flex-col gap-2",
				children: [
					[
						"master",
						"Living room",
						"The main box."
					],
					[
						"wireless-master",
						"Wireless main",
						"Same job, different radio."
					],
					[
						"slave",
						"Bedroom",
						"A thin box that follows the main one."
					]
				].map(([id, title, blurb]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setRole(id),
					className: cn("rounded-md px-3 py-2.5 text-left transition-colors duration-150", snap.role === id ? "bg-elevated text-fg" : "text-muted hover:text-fg"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block text-sm font-medium",
						children: title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block text-xs text-subtle",
						children: blurb
					})]
				}, id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-auto pt-4 text-xs text-subtle",
				children: "Changing role cold-boots the box. Press Power again."
			})
		]
	});
}
function SetTop({ on }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "stb",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between px-3 py-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("stb-led", on ? "stb-led-on" : "stb-led-off"),
					"aria-hidden": true
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[0.65rem] uppercase tracking-[0.18em] text-subtle",
					children: on ? "On" : "Standby"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-[0.65rem] uppercase tracking-[0.16em] text-subtle",
				children: "Model box"
			})]
		})
	});
}
var SPEEDS = [
	{
		id: "watch",
		label: "Watch",
		n: 80
	},
	{
		id: "run",
		label: "Run",
		n: 2e3
	},
	{
		id: "turbo",
		label: "Turbo",
		n: 8e3
	}
];
function LabApp() {
	const snap = useLab((s) => s.snap);
	const running = useLab((s) => s.running);
	const speed = useLab((s) => s.speed);
	const powered = useLab((s) => s.powered);
	const sync = useLab((s) => s.sync);
	const pump = useLab((s) => s.pump);
	const remote = useLab((s) => s.remote);
	const tab = useLab((s) => s.tab);
	(0, import_react.useEffect)(() => {
		sync();
	}, [sync]);
	(0, import_react.useEffect)(() => {
		for (const ch of CHANNELS) {
			if (!ch.src) continue;
			const img = new Image();
			img.src = ch.src;
		}
	}, []);
	(0, import_react.useEffect)(() => {
		if (!running || !powered) return;
		let raf = 0;
		let lastHold = 0;
		const n = SPEEDS.find((s) => s.id === speed)?.n ?? 2e3;
		const tick = (t) => {
			const s = useLab.getState().snap;
			if (s && s.programId === "ce" && s.stage > 0 && s.stage < 8) {
				if (t - lastHold > 520) {
					pump(90);
					lastHold = t;
				}
			} else pump(n);
			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	}, [
		running,
		speed,
		powered,
		pump
	]);
	(0, import_react.useEffect)(() => {
		const onKey = (e) => {
			const tag = e.target?.tagName;
			if (tag === "INPUT" || tag === "TEXTAREA") return;
			const key = {
				" ": "power",
				arrowup: "ch+",
				arrowdown: "ch-",
				g: "guide",
				m: "menu",
				i: "info",
				escape: "exit",
				enter: "ok"
			}[e.key.toLowerCase()];
			if (!key) return;
			e.preventDefault();
			remote(key);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [remote]);
	if (!snap) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-dvh items-center justify-center text-muted",
		children: "Warming the living room…"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "room-root min-h-dvh",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "room-photo",
				"aria-hidden": true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "room-veil",
				"aria-hidden": true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative mx-auto max-w-6xl px-3 pb-10 pt-4 md:px-6",
				children: [
					tab === "room" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Room, { snap }),
					tab === "how" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HowItWorks, {}),
					tab === "inside" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Inside, { snap })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Intro, {})
		]
	});
}
function Header() {
	const tab = useLab((s) => s.tab);
	const setTab = useLab((s) => s.setTab);
	const powered = useLab((s) => s.powered);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
		className: "relative border-b border-line/80",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-3 py-3 md:px-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-sm font-semibold tracking-tight",
					children: "Uverse Lab"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted",
					children: "A model set-top you can actually watch"
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "ml-auto flex gap-1 rounded-md bg-surface/80 p-1 shadow-[var(--shadow-border)]",
					children: [
						{
							id: "room",
							label: "The box"
						},
						{
							id: "how",
							label: "What is this"
						},
						{
							id: "inside",
							label: "Inside"
						}
					].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setTab(t.id),
						className: cn("h-9 rounded-sm px-3 text-sm font-medium transition-colors duration-150", tab === t.id ? "bg-elevated text-fg" : "text-muted hover:text-fg"),
						children: t.label
					}, t.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("hidden rounded-sm px-2 py-1 text-[0.65rem] uppercase tracking-wider sm:inline", powered ? "bg-ok/15 text-ok" : "bg-elevated text-subtle"),
					children: powered ? "Box on" : "Standby"
				})
			]
		})
	});
}
function Room({ snap }) {
	const powered = useLab((s) => s.powered);
	const channelIndex = useLab((s) => s.channelIndex);
	const lastRemote = useLab((s) => s.lastRemote);
	const speed = useLab((s) => s.speed);
	const setSpeed = useLab((s) => s.setSpeed);
	const copy = narrate(snap, {
		powered,
		channelIndex,
		lastRemote
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-5 lg:grid-cols-[minmax(0,1fr)_240px] lg:items-start",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Television, { snap }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mx-auto mt-2 max-w-3xl",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SetTop, { on: powered })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mx-auto mt-5 max-w-3xl rounded-lg bg-surface/90 p-4 shadow-[var(--shadow-border)] md:p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-xl font-semibold tracking-tight",
						children: copy.headline
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-base leading-relaxed text-muted",
						children: copy.body
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-subtle",
						children: copy.whisper
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 flex flex-wrap gap-2",
						children: SPEEDS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setSpeed(s.id),
							className: cn("h-9 rounded-sm px-3 text-sm", speed === s.id ? "bg-elevated text-fg" : "text-muted hover:text-fg"),
							children: s.label
						}, s.id))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mx-auto mt-4 max-w-3xl text-xs text-subtle",
				children: "Model box · the chip is real · the picture is ours · not AT&T firmware"
			})
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Remote, {})]
	});
}
function Intro() {
	const open = useLab((s) => s.introOpen);
	const power = useLab((s) => s.power);
	const dismissIntro = useLab((s) => s.dismissIntro);
	if (!open) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-40 flex items-end justify-center bg-standby/70 p-4 md:items-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-lg rounded-xl bg-surface p-6 shadow-[var(--shadow-border)] md:p-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-[0.22em] text-subtle",
					children: "You do not need to code"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-2 text-2xl font-semibold tracking-tight md:text-3xl",
					children: "This is a fake U-verse box in a dark room."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-base leading-relaxed text-muted",
					children: "Inside it, a real tiny computer is running. The hex dump from before was that computer with no TV attached — which is why it felt fake."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-base leading-relaxed text-muted",
					children: "Press Power. Watch the TV come on. Change the channel. That is the whole point."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: power,
						children: "Press Power"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						onClick: dismissIntro,
						children: "I will look around first"
					})]
				})
			]
		})
	});
}
function Home() {
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setReady(true), []);
	if (!ready) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-dvh items-center justify-center bg-bg text-sm text-muted",
		children: "Mounting the living room…"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LabApp, {});
}
//#endregion
export { Home as component };
