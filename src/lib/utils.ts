import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function hex(n: number, width = 8): string {
  return (n >>> 0).toString(16).toUpperCase().padStart(width, "0");
}

export function hex32(n: number): string {
  return "0x" + hex(n, 8);
}

export function signed16(n: number): number {
  const v = n & 0xffff;
  return v & 0x8000 ? v - 0x10000 : v;
}

export function signed32(n: number): number {
  return n | 0;
}

export function u32(n: number): number {
  return n >>> 0;
}
