"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarPlus,
  ChevronDown,
  ChevronUp,
  Clock3,
  Pencil,
  Plus,
  Save,
  Trash2,
  Waves,
  X,
} from "lucide-react";
import { ConfigProvider, DatePicker, TimePicker } from "antd";
import viVN from "antd/locale/vi_VN";
import dayjs from "dayjs";
import toast from "react-hot-toast";

type Priority = "normal" | "optional" | "important";
type Schedule = {
  id: string;
  departureDate: string;
  departureTime: string;
  endTime: string | null;
  priority: Priority;
  travelInfo: string;
};
type Draft = {
  departureDate: string;
  departureTime: string;
  endTime: string;
  priority: Priority;
  travelInfo: string;
};

const empty: Draft = {
  departureDate: "",
  departureTime: "",
  endTime: "",
  priority: "normal",
  travelInfo: "",
};

const priorityStyles: Record<Priority, string> = {
  normal: "border-[#0D7377]/20 bg-white text-[#0D7377]",
  optional: "border-amber-300 bg-amber-50 text-amber-700",
  important: "border-red-300 bg-red-50 text-red-700",
};

// Gom nhóm dữ liệu theo ngày và tự động sắp xếp theo giờ bắt đầu
const group = (items: Schedule[]) =>
  items.reduce<Record<string, Schedule[]>>((all, item) => {
    const date = item.departureDate.slice(0, 10);
    (all[date] ??= []).push(item);
    all[date].sort((a, b) => a.departureTime.localeCompare(b.departureTime));
    return all;
  }, {});

const dateLabel = (date: string) => {
  const value = dayjs(date);
  return value.isValid()
    ? new Intl.DateTimeFormat("vi-VN", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Ho_Chi_Minh",
      }).format(value.toDate())
    : date;
};

const shortDate = (date: string) => {
  const value = dayjs(date);
  return value.isValid()
    ? { day: value.format("DD"), month: value.format("MM") }
    : { day: "--", month: "--" };
};

function Fields({
  value,
  setValue,
}: {
  value: Draft;
  setValue: (value: Draft) => void;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <label className="grid gap-1 text-xs font-bold text-[#5B7570]">
        Ngày
        <DatePicker
          value={value.departureDate ? dayjs(value.departureDate) : null}
          onChange={(date) =>
            setValue({
              ...value,
              departureDate: date?.format("YYYY-MM-DD") ?? "",
            })
          }
          format="DD/MM/YYYY"
          className="h-10 w-full cursor-pointer"
        />
      </label>
      <div className="grid grid-cols-2 gap-2">
        <label className="grid gap-1 text-xs font-bold text-[#5B7570]">
          Bắt đầu
          <TimePicker
            value={
              value.departureTime
                ? dayjs(`2000-01-01 ${value.departureTime}`)
                : null
            }
            onChange={(time) =>
              setValue({
                ...value,
                departureTime: time?.format("HH:mm") ?? "",
              })
            }
            format="HH:mm"
            minuteStep={5}
            className="h-10 w-full cursor-pointer"
          />
        </label>
        <label className="grid gap-1 text-xs font-bold text-[#5B7570]">
          Kết thúc
          <TimePicker
            value={value.endTime ? dayjs(`2000-01-01 ${value.endTime}`) : null}
            onChange={(time) =>
              setValue({ ...value, endTime: time?.format("HH:mm") ?? "" })
            }
            format="HH:mm"
            minuteStep={5}
            className="h-10 w-full cursor-pointer"
          />
        </label>
      </div>
      <label className="grid gap-1 text-xs font-bold text-[#5B7570]">
        Mức độ
        <select
          value={value.priority}
          onChange={(event) =>
            setValue({ ...value, priority: event.target.value as Priority })
          }
          className="h-10 cursor-pointer rounded-lg border border-[#E4EFEC] bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D7377]/20"
        >
          <option value="normal">Bình thường</option>
          <option value="optional">Tùy chọn</option>
          <option value="important">Quan trọng</option>
        </select>
      </label>
      <label className="grid gap-1 text-xs font-bold text-[#5B7570] md:col-span-2">
        Thông tin
        <textarea
          required
          rows={3}
          value={value.travelInfo}
          onChange={(event) =>
            setValue({ ...value, travelInfo: event.target.value })
          }
          className="resize-y rounded-lg border border-[#E4EFEC] bg-white px-3 py-2 text-sm text-[#3A4E49] focus:outline-none focus:ring-2 focus:ring-[#0D7377]/20"
        />
      </label>
    </div>
  );
}

export default function EditLySonPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [collapsedDates, setCollapsedDates] = useState<Set<string>>(new Set());

  const groups = useMemo(() => group(schedules), [schedules]);
  const dates = useMemo(() => Object.keys(groups).sort(), [groups]);

  const toggleDate = (date: string) =>
    setCollapsedDates((current) => {
      const next = new Set(current);
      next.has(date) ? next.delete(date) : next.add(date);
      return next;
    });

  const load = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/travel-schedules", {
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setSchedules(data);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể tải lịch trình.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const close = () => {
    setEditing(null);
    setCreating(null);
    setDraft(empty);
  };

  // Hàm kiểm tra trùng thời gian trong cùng một ngày
  const checkOverlap = (id?: string) => {
    if (!draft.departureDate || !draft.departureTime) return false;

    const startMinutes =
      parseInt(draft.departureTime.split(":")[0]) * 60 +
      parseInt(draft.departureTime.split(":")[1]);
    const endMinutes = draft.endTime
      ? parseInt(draft.endTime.split(":")[0]) * 60 +
        parseInt(draft.endTime.split(":")[1])
      : startMinutes + 30; // Mặc định thời lượng 30 phút nếu không điền giờ kết thúc

    if (draft.endTime && endMinutes <= startMinutes) {
      toast.error("Thời gian kết thúc phải lớn hơn thời gian bắt đầu.");
      return true;
    }

    const sameDayItems = schedules.filter(
      (item) => item.departureDate === draft.departureDate && item.id !== id,
    );

    for (const item of sameDayItems) {
      const existingStart =
        parseInt(item.departureTime.split(":")[0]) * 60 +
        parseInt(item.departureTime.split(":")[1]);
      const existingEnd = item.endTime
        ? parseInt(item.endTime.split(":")[0]) * 60 +
          parseInt(item.endTime.split(":")[1])
        : existingStart + 30;

      if (startMinutes < existingEnd && endMinutes > existingStart) {
        toast.error(
          `Khung giờ bị trùng với lịch: "${item.travelInfo}" (${item.departureTime})`,
        );
        return true;
      }
    }
    return false;
  };

  const submit = async (event: FormEvent<HTMLFormElement>, id?: string) => {
    event.preventDefault();

    if (!draft.departureDate || !draft.departureTime) {
      toast.error("Vui lòng chọn ngày và giờ bắt đầu.");
      return;
    }

    if (!draft.travelInfo.trim()) {
      toast.error("Vui lòng nhập nội dung hoạt động.");
      return;
    }

    if (checkOverlap(id)) return;

    setSaving(true);
    try {
      const payload = {
        ...draft,
        travelInfo: draft.travelInfo.trim(),
        endTime: draft.endTime || null,
      };

      const response = await fetch(
        id ? `/api/travel-schedules/${id}` : "/api/travel-schedules",
        {
          method: id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      if (id) {
        setSchedules((prev) =>
          prev.map((item) => (item.id === id ? { ...item, ...data } : item)),
        );
      } else {
        setSchedules((prev) => [...prev, data]);
      }

      close();
      toast.success(id ? "Đã cập nhật hoạt động." : "Đã thêm hoạt động.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể lưu hoạt động.",
      );
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("Bạn có chắc muốn xoá hoạt động này?")) return;
    setDeletingId(id);
    try {
      const response = await fetch(`/api/travel-schedules/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      setSchedules((prev) => prev.filter((item) => item.id !== id));
      toast.success("Đã xóa hoạt động.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể xóa hoạt động.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const edit = (item: Schedule) => {
    setCreating(null);
    setEditing(item.id);
    setDraft({
      departureDate: item.departureDate.slice(0, 10),
      departureTime: item.departureTime,
      endTime: item.endTime ?? "",
      priority: item.priority ?? "normal",
      travelInfo: item.travelInfo,
    });
  };

  const create = (date: string) => {
    setEditing(null);
    setCreating(date);
    setDraft({
      ...empty,
      departureDate: date === "new" ? dayjs().format("YYYY-MM-DD") : date,
    });
  };

  return (
    <ConfigProvider
      locale={viVN}
      theme={{
        token: {
          colorPrimary: "#0D7377",
          borderRadius: 10,
          fontFamily: "'Be Vietnam Pro', sans-serif",
        },
      }}
    >
      <main className="lyson-editor font-body relative min-h-screen overflow-x-hidden bg-[#F6FAF9] text-[#16302B]">
        <style jsx global>{`
          @import url("https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap");
          .font-body {
            font-family: "Be Vietnam Pro", sans-serif;
          }
          .lyson-editor button:not(:disabled),
          .lyson-editor a {
            transition:
              background-color 0.16s ease,
              filter 0.16s ease,
              border-color 0.16s ease;
          }
          .lyson-editor button:not(:disabled):hover,
          .lyson-editor a:hover {
            filter: brightness(0.96);
          }
          .lyson-editor button:disabled {
            cursor: not-allowed;
          }
        `}</style>

        {/* Ambient background glows */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-24 -top-32 h-96 w-96 rounded-full bg-[#F4A340]/15 blur-3xl" />
          <div className="absolute -left-32 top-1/3 h-96 w-96 rounded-full bg-[#0D7377]/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <header className="mb-10 flex items-center justify-between">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-[#0D7377]">
                <Waves className="h-3.5 w-3.5" />
                Hành trình Lý Sơn
              </p>
              <h1 className="mt-2 text-2xl font-bold">Quản lý lịch trình</h1>
            </div>
            <Link
              href="/lyson"
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#0D7377]/20 bg-white px-2.5 py-2.5 text-sm font-semibold text-[#0D7377] shadow-sm hover:bg-[#0D7377]/5"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </header>

          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="h-20 animate-pulse rounded-2xl bg-white/70"
                />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {dates.length === 0 ? (
                <div className="rounded-[28px] border border-dashed border-[#0D7377]/25 bg-white/60 px-6 py-14 text-center">
                  <Waves className="mx-auto mb-3 h-8 w-8 text-[#0D7377]/40" />
                  <p className="font-semibold">Chưa có lịch trình nào</p>
                </div>
              ) : (
                <div className="relative">
                  {/* Timeline vertical connector */}
                  <div className="absolute bottom-3 left-[27px] top-3 hidden w-px bg-gradient-to-b from-[#0D7377]/30 via-[#0D7377]/15 to-transparent sm:block" />

                  <div className="space-y-6">
                    {dates.map((date) => {
                      const { day, month } = shortDate(date);
                      const isCollapsed = collapsedDates.has(date);

                      return (
                        <article key={date} className="relative sm:pl-20">
                          {/* Date badge */}
                          <div className="absolute left-0 top-0 hidden h-14 w-14 flex-col items-center justify-center rounded-2xl border border-[#0D7377]/15 bg-white text-[#0D7377] shadow-sm sm:flex">
                            <span className="text-base font-extrabold leading-none">
                              {day}
                            </span>
                            <span className="mt-1 text-[10px] font-bold uppercase leading-none text-[#5B7570]">
                              T{month}
                            </span>
                          </div>

                          <div className="rounded-[24px] border border-[#E4EFEC] bg-white p-4 shadow-[0_4px_20px_-10px_rgba(13,115,119,0.12)] sm:p-5">
                            <div className="flex items-center justify-between gap-3">
                              <button
                                type="button"
                                onClick={() => toggleDate(date)}
                                aria-expanded={!isCollapsed}
                                className="flex flex-1 cursor-pointer items-center justify-between text-left"
                              >
                                <h2 className="text-base font-bold capitalize">
                                  {dateLabel(date)}
                                </h2>
                                <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#F6FAF9] text-[#0D7377]">
                                  {isCollapsed ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronUp className="h-4 w-4" />
                                  )}
                                </span>
                              </button>

                              <button
                                onClick={() => create(date)}
                                className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl bg-[#0D7377]/10 px-3 py-2 text-sm font-semibold text-[#0D7377] hover:bg-[#0D7377]/20"
                                type="button"
                              >
                                <CalendarPlus className="h-4 w-4" />
                                <span className="hidden sm:inline">
                                  Thêm lịch
                                </span>
                              </button>
                            </div>

                            {!isCollapsed && (
                              <div className="relative mt-4 pl-1 sm:pl-2">
                                <div className="pointer-events-none absolute bottom-6 left-[21px] top-6 z-0 w-[2px] bg-gradient-to-b from-[#0D7377]/20 via-[#0D7377]/10 to-transparent sm:left-[25px]" />

                                <ul className="relative z-10 space-y-3">
                                  {groups[date].map((item) =>
                                    editing === item.id ? (
                                      <li
                                        key={item.id}
                                        className="relative z-10"
                                      >
                                        <form
                                          onSubmit={(event) =>
                                            submit(event, item.id)
                                          }
                                          className="rounded-2xl border-2 border-[#0D7377]/25 bg-white p-4 shadow-sm"
                                        >
                                          <Fields
                                            value={draft}
                                            setValue={setDraft}
                                          />
                                          <div className="mt-3 flex gap-2">
                                            <button
                                              disabled={saving}
                                              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#0D7377] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#0B6164] disabled:cursor-not-allowed disabled:opacity-50"
                                              type="submit"
                                            >
                                              <Save className="h-4 w-4" />
                                              {saving ? "Đang lưu..." : "Lưu"}
                                            </button>
                                            <button
                                              onClick={close}
                                              type="button"
                                              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-[#5B7570] hover:bg-black/5"
                                            >
                                              <X className="h-4 w-4" />
                                              Huỷ
                                            </button>
                                          </div>
                                        </form>
                                      </li>
                                    ) : (
                                      <li
                                        key={item.id}
                                        className={`relative z-10 flex items-start justify-between gap-3 rounded-2xl bg-[#F6FAF9] p-3 transition-opacity sm:gap-4 sm:p-3.5 ${
                                          deletingId === item.id
                                            ? "opacity-40"
                                            : ""
                                        }`}
                                      >
                                        <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
                                          <div
                                            className={`relative z-10 inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-xl border px-3 text-[12px] font-bold shadow-sm ${
                                              priorityStyles[
                                                item.priority ?? "normal"
                                              ]
                                            }`}
                                          >
                                            <Clock3 className="h-3.5 w-3.5 shrink-0" />
                                            <span className="tabular-nums leading-none">
                                              {item.departureTime}
                                              {item.endTime
                                                ? ` – ${item.endTime}`
                                                : ""}
                                            </span>
                                          </div>
                                          <p className="min-w-0 flex-1 pt-[3px] text-[14px] font-medium leading-relaxed text-[#3A4E49]">
                                            {item.travelInfo}
                                          </p>
                                        </div>

                                        <div className="flex shrink-0 items-center">
                                          <button
                                            onClick={() => edit(item)}
                                            disabled={deletingId === item.id}
                                            className="cursor-pointer rounded-lg p-1.5 text-[#0D7377] hover:bg-[#0D7377]/10 disabled:opacity-50"
                                            type="button"
                                          >
                                            <Pencil className="h-4 w-4" />
                                          </button>
                                          <button
                                            onClick={() => void remove(item.id)}
                                            disabled={deletingId === item.id}
                                            className="cursor-pointer rounded-lg p-1.5 text-red-700 hover:bg-red-50 disabled:opacity-50"
                                            type="button"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </button>
                                        </div>
                                      </li>
                                    ),
                                  )}
                                </ul>

                                {creating === date && (
                                  <form
                                    onSubmit={(event) => submit(event)}
                                    className="relative z-10 mt-3 rounded-2xl border-2 border-dashed border-[#0D7377]/30 bg-white p-4"
                                  >
                                    <Fields value={draft} setValue={setDraft} />
                                    <div className="mt-3 flex gap-2">
                                      <button
                                        disabled={saving}
                                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#0D7377] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#0B6164] disabled:cursor-not-allowed disabled:opacity-50"
                                        type="submit"
                                      >
                                        <Plus className="h-4 w-4" />
                                        {saving ? "Đang thêm..." : "Thêm"}
                                      </button>
                                      <button
                                        onClick={close}
                                        type="button"
                                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-[#5B7570] hover:bg-black/5"
                                      >
                                        <X className="h-4 w-4" />
                                        Huỷ
                                      </button>
                                    </div>
                                  </form>
                                )}
                              </div>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  onClick={() => create("new")}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-[#0D7377]/40 bg-white px-4 py-3 text-sm font-bold text-[#0D7377] shadow-sm hover:border-[#0D7377] hover:bg-[#0D7377]/5"
                  type="button"
                >
                  <Plus className="h-4 w-4" />
                  Thêm lịch cho ngày mới
                </button>
              </div>

              {creating === "new" && (
                <form
                  onSubmit={(event) => submit(event)}
                  className="rounded-[24px] border-2 border-dashed border-[#0D7377]/30 bg-white p-5 shadow-sm"
                >
                  <Fields value={draft} setValue={setDraft} />
                  <div className="mt-3 flex gap-2">
                    <button
                      disabled={saving}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#0D7377] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#0B6164] disabled:cursor-not-allowed disabled:opacity-50"
                      type="submit"
                    >
                      <Plus className="h-4 w-4" />
                      {saving ? "Đang thêm..." : "Thêm hoạt động"}
                    </button>
                    <button
                      onClick={close}
                      type="button"
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-[#5B7570] hover:bg-black/5"
                    >
                      <X className="h-4 w-4" />
                      Huỷ
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </main>
    </ConfigProvider>
  );
}
