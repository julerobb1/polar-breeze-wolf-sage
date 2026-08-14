import {
  type IDeviceEmulator,
  type MmioEvent,
  PHYS_RAM_SIZE,
  virtToPhys,
} from "./types";

export class Memory {
  readonly ram: Uint8Array;
  readonly devices: IDeviceEmulator[] = [];
  littleEndian = true;
  mmioLog: MmioEvent[] = [];
  mmioReads = 0;
  mmioWrites = 0;
  lastPc = 0;
  private seq = 0;
  onUart?: (ch: number) => void;

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

  registerDevice(device: IDeviceEmulator) {
    this.devices.push(device);
  }

  deviceAt(phys: number): IDeviceEmulator | undefined {
    return this.devices.find(
      (d) => phys >= d.base && phys < d.base + d.size,
    );
  }

  private log(rw: "R" | "W", addr: number, value: number, device: string) {
    this.seq += 1;
    if (this.mmioLog.length > 400) this.mmioLog.splice(0, 80);
    this.mmioLog.push({
      n: this.seq,
      pc: this.lastPc,
      rw,
      addr: addr >>> 0,
      value: value >>> 0,
      device,
    });
  }

  read8(addr: number): number {
    const phys = virtToPhys(addr);
    const dev = this.deviceAt(phys);
    if (dev) {
      const v = dev.read(phys - dev.base) & 0xff;
      this.mmioReads += 1;
      this.log("R", addr, v, dev.id);
      return v;
    }
    if (phys >= this.ram.length) return 0;
    return this.ram[phys]!;
  }

  write8(addr: number, value: number) {
    const phys = virtToPhys(addr);
    const v = value & 0xff;
    const dev = this.deviceAt(phys);
    if (dev) {
      dev.write(phys - dev.base, v);
      this.mmioWrites += 1;
      this.log("W", addr, v, dev.id);
      if (dev.id === "uart" && (phys - dev.base) === 0) this.onUart?.(v);
      return;
    }
    if (phys >= this.ram.length) return;
    this.ram[phys] = v;
  }

  read16(addr: number): number {
    if (this.littleEndian) {
      return this.read8(addr) | (this.read8(addr + 1) << 8);
    }
    return (this.read8(addr) << 8) | this.read8(addr + 1);
  }

  write16(addr: number, value: number) {
    if (this.littleEndian) {
      this.write8(addr, value);
      this.write8(addr + 1, value >> 8);
    } else {
      this.write8(addr, value >> 8);
      this.write8(addr + 1, value);
    }
  }

  read32(addr: number): number {
    const phys = virtToPhys(addr);
    const dev = this.deviceAt(phys);
    if (dev) {
      const v = dev.read(phys - dev.base) >>> 0;
      this.mmioReads += 1;
      this.log("R", addr, v, dev.id);
      return v;
    }
    if (phys + 3 >= this.ram.length) return 0;
    if (this.littleEndian) {
      return (
        this.ram[phys]! |
        (this.ram[phys + 1]! << 8) |
        (this.ram[phys + 2]! << 16) |
        (this.ram[phys + 3]! << 24)
      ) >>> 0;
    }
    return (
      (this.ram[phys]! << 24) |
      (this.ram[phys + 1]! << 16) |
      (this.ram[phys + 2]! << 8) |
      this.ram[phys + 3]!
    ) >>> 0;
  }

  write32(addr: number, value: number) {
    const phys = virtToPhys(addr);
    const v = value >>> 0;
    const dev = this.deviceAt(phys);
    if (dev) {
      dev.write(phys - dev.base, v);
      this.mmioWrites += 1;
      this.log("W", addr, v, dev.id);
      if (dev.id === "uart" && (phys - dev.base) === 0) {
        this.onUart?.(v & 0xff);
      }
      return;
    }
    if (phys + 3 >= this.ram.length) return;
    if (this.littleEndian) {
      this.ram[phys] = v & 0xff;
      this.ram[phys + 1] = (v >>> 8) & 0xff;
      this.ram[phys + 2] = (v >>> 16) & 0xff;
      this.ram[phys + 3] = (v >>> 24) & 0xff;
    } else {
      this.ram[phys] = (v >>> 24) & 0xff;
      this.ram[phys + 1] = (v >>> 16) & 0xff;
      this.ram[phys + 2] = (v >>> 8) & 0xff;
      this.ram[phys + 3] = v & 0xff;
    }
  }

  loadBinary(bytes: Uint8Array, virtAddr: number) {
    const phys = virtToPhys(virtAddr);
    this.ram.set(bytes.subarray(0, Math.max(0, this.ram.length - phys)), phys);
  }

  readBytes(virtAddr: number, len: number): Uint8Array {
    const out = new Uint8Array(len);
    for (let i = 0; i < len; i++) out[i] = this.read8(virtAddr + i);
    return out;
  }

  ascii(virtAddr: number, len: number): string {
    const bytes = this.readBytes(virtAddr, len);
    let s = "";
    for (const b of bytes) {
      if (b === 0) s += " ";
      else if (b >= 32 && b < 127) s += String.fromCharCode(b);
      else s += "·";
    }
    return s;
  }
}
