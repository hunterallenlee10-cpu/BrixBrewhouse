"use client";

import { useEffect, useState } from "react";
import { HOURS, formatTime, zonedNow } from "@/lib/hours";

const ORDER = [1, 2, 3, 4, 5, 6, 0]; // Monday first, the way people read a week

/** Weekly hours from /data/hours.json with today's row lit (America/New_York). */
export function HoursTable() {
  const [today, setToday] = useState(-1);
  useEffect(() => {
    const tick = () => setToday(zonedNow(new Date()).day);
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <table className="w-full border-collapse text-left">
      <caption className="sr-only">Opening hours, Eastern Time</caption>
      <tbody>
        {ORDER.map((d) => {
          const h = HOURS.days.find((x) => x.day === d)!;
          const on = d === today;
          return (
            <tr key={d} aria-current={on ? "date" : undefined} className={`border-b border-line last:border-b-0 ${on ? "bg-gold/[0.12]" : ""}`}>
              <th scope="row" className={`py-3 pl-3 pr-4 font-normal ${on ? "text-gold-hi" : "text-text-2"}`}>
                <span className="font-display text-[1.25rem] font-bold uppercase tracking-[0.02em]">{h.label}</span>
                {on ? <span className="t-mono ml-3 align-[0.2em] text-[0.6875rem] text-gold-hi">Today</span> : null}
              </th>
              <td className={`tabular py-3 pr-3 text-right font-mono text-[0.95rem] ${on ? "text-foam" : "text-text-2"}`}>
                {formatTime(h.open)} - {formatTime(h.close)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
