import { type IDeviceEmulator, type RoleId, MMIO, ROLE_VALUE } from "./types";

class BaseDevice implements IDeviceEmulator {
  lastRead = 0;
  lastWrite = 0;
  constructor(
    readonly id: string,
    readonly name: string,
    readonly base: number,
    readonly size: number,
  ) {}
  read(_offset: number): number {
    return 0;
  }
  write(_offset: number, _value: number) {}
  reset() {
    this.lastRead = 0;
    this.lastWrite = 0;
  }
}

export class IrqController extends BaseDevice {
  status = 0;
  mask = 0xffffffff;
  constructor() {
    super("irq", "Interrupt controller", MMIO.IRQ, 0x1000);
  }
  override read(offset: number) {
    this.lastRead = offset;
    if (offset === 0) return this.status >>> 0;
    if (offset === 4) return this.mask >>> 0;
    return 0;
  }
  override write(offset: number, value: number) {
    this.lastWrite = offset;
    if (offset === 4) this.mask = value >>> 0;
    if (offset === 8) this.status &= ~(value >>> 0);
  }
  raise(bit: number) {
    this.status |= 1 << bit;
  }
  override reset() {
    super.reset();
    this.status = 0;
    this.mask = 0xffffffff;
  }
}

export class TimerDevice extends BaseDevice {
  count = 0;
  compare = 1000;
  control = 1;
  status = 1;
  watchdog = 0;
  watchdogFed = false;
  fired = false;
  constructor() {
    super("timer", "Timer / watchdog", MMIO.TIMER, 0x1000);
  }
  override read(offset: number) {
    this.lastRead = offset;
    if (offset === 0) return this.status;
    if (offset === 4) return this.count >>> 0;
    if (offset === 8) return this.compare >>> 0;
    if (offset === 0xc) return this.control;
    if (offset === 0x100) return 0;
    if (offset === 0x104) return this.fired ? 1 : 0;
    return 0;
  }
  override write(offset: number, value: number) {
    this.lastWrite = offset;
    if (offset === 8) this.compare = value >>> 0;
    if (offset === 0xc) this.control = value & 1;
    if (offset === 0x100) {
      this.watchdog = 0;
      this.watchdogFed = true;
      this.fired = false;
    }
  }
  tick(n = 1) {
    if (!this.control) return;
    this.count = (this.count + n) >>> 0;
    this.watchdog += n;
    if (this.count >= this.compare) {
      this.status |= 2;
      this.count = 0;
    }
    if (this.watchdog > 200_000) this.fired = true;
  }
  override reset() {
    super.reset();
    this.count = 0;
    this.compare = 1000;
    this.control = 1;
    this.status = 1;
    this.watchdog = 0;
    this.watchdogFed = false;
    this.fired = false;
  }
}

export class UartDevice extends BaseDevice {
  tx: number[] = [];
  constructor() {
    super("uart", "UART console", MMIO.UART, 0x1000);
  }
  override read(offset: number) {
    this.lastRead = offset;
    if (offset === 0) return 0;
    if (offset === 4) return 1;
    return 0;
  }
  override write(offset: number, value: number) {
    this.lastWrite = offset;
    if (offset === 0) this.tx.push(value & 0xff);
  }
  override reset() {
    super.reset();
    this.tx = [];
  }
}

export class NandDevice extends BaseDevice {
  constructor() {
    super("nand", "NAND flash", MMIO.NAND, 0x1000);
  }
  override read(offset: number) {
    this.lastRead = offset;
    if (offset === 0) return 0x01;
    if (offset === 4) return 0x0000ec01;
    return 0;
  }
}

export class TunerDevice extends BaseDevice {
  locked = true;
  constructor() {
    super("tuner", "Tuner / demod", MMIO.TUNER, 0x1000);
  }
  override read(offset: number) {
    this.lastRead = offset;
    if (offset === 0) return this.locked ? 0x03 : 0x02;
    if (offset === 4) return 0x28;
    if (offset === 8) return 0x0001a5e0;
    return 0;
  }
}

export class FrontPanelDevice extends BaseDevice {
  leds = 0;
  buttons = 0;
  constructor() {
    super("panel", "Front-panel MCU", MMIO.PANEL, 0x1000);
  }
  override read(offset: number) {
    this.lastRead = offset;
    if (offset === 0) return 0x01;
    if (offset === 4) return this.buttons;
    if (offset === 8) return this.leds;
    return 0;
  }
  override write(offset: number, value: number) {
    this.lastWrite = offset;
    if (offset === 4) this.buttons = value >>> 0;
    if (offset === 8) this.leds = value >>> 0;
  }
  override reset() {
    super.reset();
    this.leds = 0;
    this.buttons = 0;
  }
}

export class PlayReadyDevice extends BaseDevice {
  inited = 0;
  constructor() {
    super("drm", "PlayReady stub", MMIO.DRM, 0x1000);
  }
  override read(offset: number) {
    this.lastRead = offset;
    if (offset === 0) return 0x01;
    if (offset === 4) return 0x00000002;
    if (offset === 8) return this.inited;
    return 0;
  }
  override write(offset: number, value: number) {
    this.lastWrite = offset;
    if (offset === 8 && (value & 1)) this.inited = 1;
  }
  override reset() {
    super.reset();
    this.inited = 0;
  }
}

export class RoleDevice extends BaseDevice {
  role: RoleId = "master";
  constructor() {
    super("role", "MASTER / identity", MMIO.ROLE, 0x1000);
  }
  override read(offset: number) {
    this.lastRead = offset;
    if (offset === 0) return ROLE_VALUE[this.role];
    if (offset === 4) return 0x00112233;
    if (offset === 8) return 0x44556677;
    return 0;
  }
  setRole(role: RoleId) {
    this.role = role;
  }
  override reset() {
    super.reset();
  }
}

export function createDevices() {
  const irq = new IrqController();
  const timer = new TimerDevice();
  const uart = new UartDevice();
  const nand = new NandDevice();
  const tuner = new TunerDevice();
  const panel = new FrontPanelDevice();
  const drm = new PlayReadyDevice();
  const role = new RoleDevice();
  return { irq, timer, uart, nand, tuner, panel, drm, role, all: [irq, timer, uart, nand, tuner, panel, drm, role] };
}
