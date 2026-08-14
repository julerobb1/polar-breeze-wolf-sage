import type { ProgramDef } from "./types";

const SMOKE = `
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
`;

const FIB = `
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
`;

const UART = `
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
`;

const CE = `
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
`;

export const PROGRAMS: ProgramDef[] = [
  {
    id: "ce",
    title: "CE 5.0 boot",
    blurb: "A made-up boot that walks the same steps a U-verse box would, then sits in a live loop.",
    kind: "ce",
    source: CE,
  },
  {
    id: "smoke",
    title: "CPU smoke",
    blurb: "Adds 40 + 2 and writes 42. If this fails, the chip is lying.",
    kind: "probe",
    source: SMOKE,
  },
  {
    id: "fib",
    title: "Fibonacci",
    blurb: "Counts the 12th Fibonacci number. The answer has to be 144.",
    kind: "demo",
    source: FIB,
  },
  {
    id: "uart",
    title: "UART hello",
    blurb: "Writes a hello message through a fake serial port.",
    kind: "demo",
    source: UART,
  },
];

export function programById(id: string): ProgramDef {
  return PROGRAMS.find((p) => p.id === id) ?? PROGRAMS[0]!;
}
