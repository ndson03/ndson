"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Clock3, Pencil, Waves } from "lucide-react";
import dayjs from "dayjs";

type Priority = "normal" | "optional" | "important";
type TravelSchedule = { id: string; departureDate: string; departureTime: string; endTime: string | null; priority: Priority; travelInfo: string };
const priorityStyles: Record<Priority, string> = { normal: "border-[#0D7377]/20 bg-white text-[#0D7377]", optional: "border-amber-300 bg-amber-50 text-amber-700", important: "border-red-300 bg-red-50 text-red-700" };

function groupByDate(schedules: TravelSchedule[]) { return schedules.reduce<Record<string, TravelSchedule[]>>((groups, schedule) => { const date = schedule.departureDate.slice(0, 10); (groups[date] ??= []).push(schedule); return groups; }, {}); }
function labelDate(date: string) { const value = dayjs(date); return value.isValid() ? new Intl.DateTimeFormat("vi-VN", { weekday: "long", day: "2-digit", month: "long", year: "numeric", timeZone: "Asia/Ho_Chi_Minh" }).format(value.toDate()) : date; }
function shortDate(date: string) { const value = dayjs(date); return value.isValid() ? { day: value.format("DD"), month: value.format("MM") } : { day: "--", month: "--" }; }

export default function LySonPage() {
  const [schedules, setSchedules] = useState<TravelSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collapsedDates, setCollapsedDates] = useState<Set<string>>(new Set());
  const groups = useMemo(() => groupByDate(schedules), [schedules]);
  const dates = useMemo(() => Object.keys(groups).sort(), [groups]);
  const toggleDate = (date: string) => setCollapsedDates((current) => { const next = new Set(current); next.has(date) ? next.delete(date) : next.add(date); return next; });

  useEffect(() => { const load = async () => { try { const response = await fetch("/api/travel-schedules", { cache: "no-store" }); const data = await response.json(); if (!response.ok) throw new Error(data.error); setSchedules(data); } catch (error) { setError(error instanceof Error ? error.message : "Không thể tải lịch trình."); } finally { setLoading(false); } }; void load(); }, []);

  return <main className="font-body relative min-h-screen overflow-x-hidden bg-[#F6FAF9] text-[#16302B]"><style jsx global>{`@import url("https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap");.font-display,.font-body{font-family:"Be Vietnam Pro",sans-serif}`}</style><div className="pointer-events-none absolute inset-0 overflow-hidden"><div className="absolute -right-24 -top-32 h-96 w-96 rounded-full bg-[#F4A340]/15 blur-3xl" /><div className="absolute -left-32 top-1/3 h-96 w-96 rounded-full bg-[#0D7377]/10 blur-3xl" /></div><div className="relative mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
    <header className="mb-10 flex items-center justify-between">
      <div>
        <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-[#0D7377]">
          <Waves className="h-3.5 w-3.5" />Hành trình Lý Sơn
        </p>
        <h1 className="mt-2 text-2xl font-bold">Lịch trình chuyến đi</h1>
      </div>
      <Link
        href="/lyson/edit"
        className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#0D7377]/20 bg-white px-2.5 py-2.5 text-sm font-semibold text-[#0D7377] shadow-sm hover:bg-[#0D7377]/5"
      >
        <Pencil className="h-4 w-4" />
      </Link>
    </header>
    {loading ? <div className="space-y-3">{[0, 1, 2].map((item) => <div key={item} className="h-20 animate-pulse rounded-2xl bg-white/70" />)}</div> : error ? <div className="rounded-2xl border border-red-100 bg-white p-6 text-center text-red-700">{error}</div> : dates.length === 0 ? <div className="rounded-[28px] border border-dashed border-[#0D7377]/25 bg-white/60 px-6 py-14 text-center"><Waves className="mx-auto mb-3 h-8 w-8 text-[#0D7377]/40" /><p className="font-semibold">Chưa có lịch trình nào</p></div> : <div className="relative"><div className="absolute bottom-3 left-[27px] top-3 hidden w-px bg-gradient-to-b from-[#0D7377]/30 via-[#0D7377]/15 to-transparent sm:block" /><div className="space-y-6">{dates.map((date) => { const { day, month } = shortDate(date); const isCollapsed = collapsedDates.has(date); return <article key={date} className="relative sm:pl-20"><div className="absolute left-0 top-0 hidden h-14 w-14 flex-col items-center justify-center rounded-2xl border border-[#0D7377]/15 bg-white text-[#0D7377] shadow-sm sm:flex"><span className="text-base font-extrabold leading-none">{day}</span><span className="mt-1 text-[10px] font-bold uppercase leading-none text-[#5B7570]">T{month}</span></div><div className="rounded-[24px] border border-[#E4EFEC] bg-white p-4 shadow-[0_4px_20px_-10px_rgba(13,115,119,0.12)] sm:p-5"><button type="button" onClick={() => toggleDate(date)} aria-expanded={!isCollapsed} className="flex w-full cursor-pointer items-center justify-between text-left"><h2 className="font-display text-base font-bold capitalize">{labelDate(date)}</h2><span className="grid h-8 w-8 place-items-center rounded-lg bg-[#F6FAF9] text-[#0D7377]">{isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}</span></button>{!isCollapsed && <div className="relative mt-4 pl-1 sm:pl-2"><div className="absolute bottom-6 left-[21px] top-6 w-[2px] bg-gradient-to-b from-[#0D7377]/20 via-[#0D7377]/10 to-transparent sm:left-[25px]" /><ul className="space-y-3">{groups[date].map((schedule) => <li key={schedule.id} className="relative flex items-start gap-3 rounded-2xl bg-[#F6FAF9] p-3 sm:gap-4 sm:p-3.5"><div className={`relative z-10 inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-xl border px-3 text-[12px] font-bold shadow-sm ${priorityStyles[schedule.priority ?? "normal"]}`}><Clock3 className="h-3.5 w-3.5 shrink-0" /><span className="tabular-nums leading-none">{schedule.departureTime}{schedule.endTime ? ` – ${schedule.endTime}` : ""}</span></div><p className="min-w-0 flex-1 pt-[3px] text-[14px] font-medium leading-relaxed text-[#3A4E49]">{schedule.travelInfo}</p></li>)}</ul></div>}</div></article>; })}</div></div>}
  </div></main>;
}