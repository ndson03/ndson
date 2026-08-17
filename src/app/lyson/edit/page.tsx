"use client";

import Link from "next/link";
import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarPlus,
  Clock3,
  Compass,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  Waves,
} from "lucide-react";
import { ConfigProvider, DatePicker, TimePicker } from "antd";
import viVN from "antd/locale/vi_VN";
import dayjs from "dayjs";

type TravelSchedule = {
  id: string;
  departureDate: string;
  departureTime: string;
  travelInfo: string;
};

const emptyForm = { departureDate: "", departureTime: "", travelInfo: "" };

function groupByDate(schedules: TravelSchedule[]) {
  return schedules.reduce<Record<string, TravelSchedule[]>>(
    (groups, schedule) => {
      const date = schedule.departureDate.slice(0, 10);
      (groups[date] ??= []).push(schedule);
      return groups;
    },
    {},
  );
}

function labelDate(date: string) {
  const parsedDate = dayjs(date, "YYYY-MM-DD", true);
  if (!parsedDate.isValid()) return date;
  return new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
    hourCycle: "h23",
  }).format(parsedDate.toDate());
}

function shortDate(date: string) {
  const parsedDate = dayjs(date, "YYYY-MM-DD", true);
  if (!parsedDate.isValid()) return { day: "--", month: "--" };
  return {
    day: parsedDate.format("DD"),
    month: parsedDate.format("'MM"),
  };
}

const antdTheme = {
  token: {
    colorPrimary: "#0D7377",
    borderRadius: 10,
    fontFamily: "'Be Vietnam Pro', sans-serif",
  },
};

// Component con lắng nghe searchParams
function SearchParamsHandler({
  setForm,
}: {
  setForm: React.Dispatch<React.SetStateAction<typeof emptyForm>>;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const date = searchParams.get("date");
    if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setForm((current) => ({ ...current, departureDate: date }));
    }
  }, [searchParams, setForm]);

  return null;
}

function EditTravelSchedulesContent() {
  const [schedules, setSchedules] = useState<TravelSchedule[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const groupedSchedules = useMemo(() => groupByDate(schedules), [schedules]);
  const sortedDates = useMemo(
    () => Object.keys(groupedSchedules).sort(),
    [groupedSchedules],
  );

  const loadSchedules = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/travel-schedules", {
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setSchedules(data);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Không thể tải lịch trình.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSchedules();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);
    const isEditing = Boolean(editingId);
    try {
      const response = await fetch(
        isEditing
          ? `/api/travel-schedules/${editingId}`
          : "/api/travel-schedules",
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      await loadSchedules();
      resetForm();
      setMessage(
        isEditing ? "Đã cập nhật lịch trình." : "Đã thêm lịch trình mới.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Không thể lưu lịch trình.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const selectSchedule = (schedule: TravelSchedule) => {
    setEditingId(schedule.id);
    setForm({
      departureDate: schedule.departureDate.slice(0, 10),
      departureTime: schedule.departureTime,
      travelInfo: schedule.travelInfo,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const addForDate = (date: string) => {
    setEditingId(null);
    setForm({ ...emptyForm, departureDate: date });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteSchedule = async (id: string) => {
    if (!window.confirm("Bạn có chắc muốn xoá lịch trình này?")) return;
    try {
      const response = await fetch(`/api/travel-schedules/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error((await response.json()).error);
      if (editingId === id) resetForm();
      await loadSchedules();
      setMessage("Đã xoá lịch trình.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Không thể xoá lịch trình.",
      );
    }
  };

  return (
    <ConfigProvider locale={viVN} theme={antdTheme}>
      <Suspense fallback={null}>
        <SearchParamsHandler setForm={setForm} />
      </Suspense>

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap");
        .font-display {
          font-family: "Be Vietnam Pro", sans-serif;
        }
        .font-body {
          font-family: "Be Vietnam Pro", sans-serif;
        }
      `}</style>

      <main className="font-body relative min-h-screen overflow-x-hidden bg-[#F6FAF9] text-[#16302B]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-24 h-96 w-96 rounded-full bg-[#F4A340]/15 blur-3xl" />
          <div className="absolute top-1/3 -left-32 h-96 w-96 rounded-full bg-[#0D7377]/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#0D7377]">
                <Waves className="h-3.5 w-3.5" />
                Hành trình Lý Sơn
              </p>
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#16302B] sm:text-4xl">
                Quản lý hành trình
              </h1>
              <p className="mt-2 max-w-md text-[15px] text-[#5B7570]">
                Sắp xếp hoạt động theo ngày, theo giờ Việt Nam (24h).
              </p>
            </div>
            <Link
              href="/lyson"
              className="inline-flex items-center gap-2 self-start rounded-full border border-[#0D7377]/20 bg-white px-4 py-2.5 text-sm font-semibold text-[#0D7377] shadow-sm transition hover:border-[#0D7377]/40 hover:bg-[#0D7377]/5 sm:self-auto"
            >
              <ArrowLeft className="h-4 w-4" />
              Xem lịch trình
            </Link>
          </header>

          <section className="mb-10 rounded-[28px] border border-[#E4EFEC] bg-white p-5 shadow-[0_8px_30px_-12px_rgba(13,115,119,0.15)] sm:p-7">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display flex items-center gap-2.5 text-lg font-bold text-[#16302B]">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0D7377]/10 text-[#0D7377]">
                  {editingId ? (
                    <Pencil className="h-4.5 w-4.5" />
                  ) : (
                    <Sparkles className="h-4.5 w-4.5" />
                  )}
                </span>
                {editingId ? "Cập nhật hoạt động" : "Thêm hoạt động mới"}
              </h2>
              {form.departureDate && !editingId && (
                <span className="rounded-full bg-[#F4A340]/15 px-3.5 py-1.5 text-sm font-semibold text-[#B4680E]">
                  {labelDate(form.departureDate)}
                </span>
              )}
            </div>

            <form onSubmit={submitForm} className="grid gap-5 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-[#16302B]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#5B7570]">
                  Ngày đi
                </span>
                <DatePicker
                  required
                  allowClear={false}
                  value={form.departureDate ? dayjs(form.departureDate) : null}
                  onChange={(date) =>
                    setForm({
                      ...form,
                      departureDate: date ? date.format("YYYY-MM-DD") : "",
                    })
                  }
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày đi"
                  className="h-11 w-full rounded-xl"
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-[#16302B]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#5B7570]">
                  Giờ đi
                </span>
                <TimePicker
                  required
                  allowClear={false}
                  value={
                    form.departureTime
                      ? dayjs(`2000-01-01 ${form.departureTime}`)
                      : null
                  }
                  onChange={(time) =>
                    setForm({
                      ...form,
                      departureTime: time ? time.format("HH:mm") : "",
                    })
                  }
                  format="HH:mm"
                  minuteStep={5}
                  placeholder="Chọn giờ đi"
                  className="h-11 w-full rounded-xl"
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-[#16302B] md:col-span-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#5B7570]">
                  Thông tin đi
                </span>
                <textarea
                  required
                  rows={4}
                  value={form.travelInfo}
                  onChange={(e) =>
                    setForm({ ...form, travelInfo: e.target.value })
                  }
                  placeholder="Ví dụ: Bay đến Đà Nẵng, nhận phòng khách sạn..."
                  className="resize-y rounded-xl border border-[#E4EFEC] bg-[#FAFDFC] px-3.5 py-3 text-sm font-normal text-[#16302B] outline-none transition focus:border-[#0D7377] focus:ring-4 focus:ring-[#0D7377]/10"
                />
              </label>
              <div className="flex flex-wrap items-center gap-3 md:col-span-2">
                <button
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-full bg-[#0D7377] px-5 py-2.5 text-sm font-bold text-white shadow-sm shadow-[#0D7377]/25 transition hover:bg-[#0B5F62] disabled:cursor-not-allowed disabled:opacity-60"
                  type="submit"
                >
                  <Plus className="h-4 w-4" />
                  {submitting
                    ? "Đang lưu..."
                    : editingId
                      ? "Lưu thay đổi"
                      : "Thêm vào lịch"}
                </button>
                {editingId && (
                  <button
                    onClick={resetForm}
                    className="rounded-full px-5 py-2.5 text-sm font-semibold text-[#5B7570] transition hover:bg-[#F6FAF9]"
                    type="button"
                  >
                    Huỷ
                  </button>
                )}
                {message && (
                  <span
                    className="text-sm font-medium text-[#0D7377]"
                    role="status"
                  >
                    {message}
                  </span>
                )}
              </div>
            </form>
          </section>

          <section>
            <div className="mb-5 flex items-center gap-2.5">
              <Compass className="h-5 w-5 text-[#0D7377]" />
              <h2 className="font-display text-xl font-bold text-[#16302B]">
                Hành trình theo ngày
              </h2>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-20 animate-pulse rounded-2xl bg-white/70"
                  />
                ))}
              </div>
            ) : sortedDates.length === 0 ? (
              <div className="rounded-[28px] border border-dashed border-[#0D7377]/25 bg-white/60 px-6 py-14 text-center">
                <Waves className="mx-auto mb-3 h-8 w-8 text-[#0D7377]/40" />
                <p className="font-semibold text-[#16302B]">
                  Chưa có lịch trình nào
                </p>
                <p className="mt-1 text-sm text-[#5B7570]">
                  Thêm hoạt động đầu tiên ở biểu mẫu phía trên.
                </p>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-[27px] top-3 bottom-3 hidden w-px bg-gradient-to-b from-[#0D7377]/30 via-[#0D7377]/15 to-transparent sm:block" />
                <div className="space-y-8">
                  {sortedDates.map((date) => {
                    const items = groupedSchedules[date];
                    const { day, month } = shortDate(date);
                    return (
                      <div key={date} className="relative sm:pl-[68px]">
                        <div className="absolute left-0 top-0 hidden h-14 w-14 flex-col items-center justify-center rounded-2xl border border-[#0D7377]/15 bg-white text-[#0D7377] shadow-sm sm:flex">
                          <span className="text-base font-extrabold leading-none">
                            {day}
                          </span>
                          <span className="text-[10px] font-bold uppercase leading-none text-[#5B7570]">
                            {month}
                          </span>
                        </div>

                        <div className="rounded-[24px] border border-[#E4EFEC] bg-white p-4 shadow-[0_4px_20px_-10px_rgba(13,115,119,0.12)] sm:p-5">
                          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                            <h3 className="font-display text-[15px] font-bold capitalize text-[#16302B]">
                              {labelDate(date)}
                            </h3>
                            <button
                              onClick={() => addForDate(date)}
                              className="inline-flex items-center gap-1.5 rounded-full bg-[#F4A340]/15 px-3 py-1.5 text-xs font-bold text-[#B4680E] transition hover:bg-[#F4A340]/25"
                              type="button"
                            >
                              <CalendarPlus className="h-3.5 w-3.5" />
                              Thêm lịch trong ngày
                            </button>
                          </div>
                          <ul className="space-y-2">
                            {items.map((schedule) => (
                              <li
                                key={schedule.id}
                                className="group flex flex-col gap-3 rounded-2xl bg-[#F6FAF9] p-3.5 transition hover:bg-[#EFF6F4] sm:flex-row sm:items-center sm:justify-between"
                              >
                                <div className="min-w-0">
                                  <p className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-[#0D7377] shadow-sm">
                                    <Clock3 className="h-3.5 w-3.5" />
                                    {schedule.departureTime}
                                  </p>
                                  <p className="mt-2 whitespace-pre-wrap text-[14px] leading-relaxed text-[#3A4E49]">
                                    {schedule.travelInfo}
                                  </p>
                                </div>
                                <div className="flex shrink-0 gap-1 opacity-90 sm:opacity-0 sm:transition sm:group-hover:opacity-100">
                                  <button
                                    onClick={() => selectSchedule(schedule)}
                                    className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-[#0D7377] hover:bg-white"
                                    type="button"
                                  >
                                    <Pencil className="h-4 w-4" />
                                    Sửa
                                  </button>
                                  <button
                                    onClick={() =>
                                      void deleteSchedule(schedule.id)
                                    }
                                    className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-[#C4472A] hover:bg-white"
                                    type="button"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Xoá
                                  </button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </ConfigProvider>
  );
}

export default function EditTravelSchedulesPage() {
  return (
    <Suspense fallback={null}>
      <EditTravelSchedulesContent />
    </Suspense>
  );
}