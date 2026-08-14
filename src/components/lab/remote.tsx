import { useLab, type RemoteKey } from "@/lib/emu/store";
import { cn } from "@/lib/utils";

const KEYS: { id: RemoteKey; label: string; tone?: "power" | "ok" }[] = [
  { id: "power", label: "Power", tone: "power" },
  { id: "ch+", label: "CH +" },
  { id: "ch-", label: "CH −" },
  { id: "guide", label: "Guide" },
  { id: "menu", label: "Menu" },
  { id: "ok", label: "OK", tone: "ok" },
  { id: "info", label: "Info" },
  { id: "exit", label: "Exit" },
];

export function Remote() {
  const remote = useLab((s) => s.remote);
  const last = useLab((s) => s.lastRemote);
  const powered = useLab((s) => s.powered);

  return (
    <div className="remote">
      <p className="mb-3 text-center text-[0.65rem] uppercase tracking-[0.22em] text-subtle">
        Remote
      </p>
      <div className="grid grid-cols-2 gap-2">
        {KEYS.map((k) => (
          <button
            key={k.id}
            type="button"
            onClick={() => remote(k.id)}
            className={cn(
              "remote-key",
              k.tone === "power" && "remote-key-power col-span-2",
              k.tone === "ok" && "remote-key-ok col-span-2",
              last === k.id && "remote-key-lit",
              !powered && k.id !== "power" && "opacity-50",
            )}
          >
            {k.label}
          </button>
        ))}
      </div>
      <p className="mt-3 text-center text-xs text-subtle">
        Keyboard: space, ↑ ↓, G, M, I, Esc
      </p>
    </div>
  );
}
