import { hex } from "@/lib/utils";
import type { HvSnapshot } from "@/lib/emu/hypervisor";
import { ROLE_LABEL } from "@/lib/emu/types";

export function CrtDisplay({ snap }: { snap: HvSnapshot }) {
  const booted = snap.criteria.technicallyBoots;
  const live = snap.stage >= 2;
  const lines = snap.fb;
  const painted = lines.some((l) => l.trim().length > 0);

  return (
    <div className="rounded-xl bg-elevated p-2 shadow-[var(--shadow-border)]">
      <div className="relative overflow-hidden rounded-lg crt-screen min-h-56 md:min-h-72">
        <div className="relative z-10 flex h-full min-h-56 md:min-h-72 flex-col p-4 md:p-5">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.18em] text-crt-dim">
            <span>Composite · 480i</span>
            <span className="flex items-center gap-2">
              <span
                className={`size-1.5 rounded-full ${live ? "bg-crt" : "bg-subtle"}`}
              />
              {booted ? "UI LOOP" : live ? snap.stageName : "STANDBY"}
            </span>
          </div>

          {!painted && (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-crt-dim">
                No raster
              </p>
              <p className="mt-2 max-w-xs text-sm text-crt/70">
                Firmware has not written the text framebuffer yet. Run the CE
                image.
              </p>
            </div>
          )}

          {painted && (
            <pre className="mt-4 flex-1 overflow-hidden font-mono text-[12px] leading-5 text-crt [text-shadow:0_0_10px_rgba(183,255,203,0.35)] md:text-[13px] md:leading-6">
              {lines.map((line, i) => (
                <div key={i} className="whitespace-pre">
                  {line || " "}
                </div>
              ))}
            </pre>
          )}

          <div className="mt-auto flex items-end justify-between pt-3 font-mono text-[10px] text-crt-dim">
            <span>
              {ROLE_LABEL[snap.role]} · FR {String(snap.frames).padStart(6, "0")}
            </span>
            <span>PC {hex(snap.pc)}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-led shadow-[0_0_8px_rgba(212,84,74,0.7)]" />
          <span className="text-[11px] uppercase tracking-wider text-muted">
            Front panel
          </span>
        </div>
        <span className="font-mono text-[10px] text-subtle">
          behavioral host · not AT&T firmware
        </span>
      </div>
    </div>
  );
}
