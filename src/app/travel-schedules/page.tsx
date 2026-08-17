"use client";

import { FormEvent, useEffect, useState } from "react";
import { CalendarDays, Clock3, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";

type TravelSchedule = {
  id: string;
  departureDate: string;
  departureTime: string;
  travelInfo: string;
};

const emptyForm = { departureDate: "", departureTime: "", travelInfo: "" };

function getDateValue(value: string) {
  return value.slice(0, 10);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${getDateValue(value)}T00:00:00.000Z`));
}

export default function TravelSchedulesPage() {
  const [schedules, setSchedules] = useState<TravelSchedule[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadSchedules = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/travel-schedules", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setSchedules(data);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không thể tải lịch trình.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadSchedules(); }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      const response = await fetch(editingId ? `/api/travel-schedules/${editingId}` : "/api/travel-schedules", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      await loadSchedules();
      resetForm();
      setMessage(editingId ? "Đã cập nhật lịch trình." : "Đã thêm lịch trình mới.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không thể lưu lịch trình.");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (schedule: TravelSchedule) => {
    setEditingId(schedule.id);
    setForm({ departureDate: getDateValue(schedule.departureDate), departureTime: schedule.departureTime, travelInfo: schedule.travelInfo });
    setMessage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteSchedule = async (id: string) => {
    if (!window.confirm("Bạn có chắc muốn xoá lịch trình này?")) return;
    setMessage(null);
    try {
      const response = await fetch(`/api/travel-schedules/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }
      if (editingId === id) resetForm();
      await loadSchedules();
      setMessage("Đã xoá lịch trình.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không thể xoá lịch trình.");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-sky-600">Kế hoạch cá nhân</p>
            <h1 className="text-3xl font-bold tracking-tight">Lịch trình du lịch</h1>
            <p className="mt-1 text-slate-600">Theo dõi và quản lý các chuyến đi sắp tới của bạn.</p>
          </div>
          <button onClick={() => void loadSchedules()} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-100" type="button">
            <RefreshCw className="h-4 w-4" /> Làm mới
          </button>
        </header>

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-5 text-xl font-semibold">{editingId ? "Chỉnh sửa lịch trình" : "Thêm lịch trình mới"}</h2>
          <form onSubmit={submitForm} className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium">Ngày đi
              <input required type="date" value={form.departureDate} onChange={(e) => setForm({ ...form, departureDate: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" />
            </label>
            <label className="grid gap-2 text-sm font-medium">Giờ đi
              <input required type="time" value={form.departureTime} onChange={(e) => setForm({ ...form, departureTime: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" />
            </label>
            <label className="grid gap-2 text-sm font-medium md:col-span-2">Thông tin đi
              <textarea required rows={4} value={form.travelInfo} onChange={(e) => setForm({ ...form, travelInfo: e.target.value })} placeholder="Ví dụ: Bay đến Đà Nẵng, gặp đoàn tại sân bay..." className="resize-y rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" />
            </label>
            <div className="flex flex-wrap items-center gap-3 md:col-span-2">
              <button disabled={submitting} className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 font-medium text-white hover:bg-sky-700 disabled:opacity-60" type="submit"><Plus className="h-4 w-4" />{submitting ? "Đang lưu..." : editingId ? "Lưu thay đổi" : "Thêm lịch trình"}</button>
              {editingId && <button onClick={resetForm} className="rounded-lg px-4 py-2 font-medium text-slate-700 hover:bg-slate-100" type="button">Huỷ</button>}
              {message && <span className="text-sm text-slate-600" role="status">{message}</span>}
            </div>
          </form>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4 sm:px-6"><h2 className="text-xl font-semibold">Danh sách lịch trình</h2></div>
          {loading ? <p className="p-6 text-slate-600">Đang tải lịch trình...</p> : schedules.length === 0 ? <p className="p-6 text-slate-600">Chưa có lịch trình nào. Hãy thêm chuyến đi đầu tiên.</p> :
            <ul className="divide-y divide-slate-200">
              {schedules.map((schedule) => <li key={schedule.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-medium text-sky-700"><span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" />{formatDate(schedule.departureDate)}</span><span className="inline-flex items-center gap-1.5"><Clock3 className="h-4 w-4" />{schedule.departureTime}</span></div>
                  <p className="mt-2 whitespace-pre-wrap text-slate-700">{schedule.travelInfo}</p>
                </div>
                <div className="flex shrink-0 gap-2"><button onClick={() => startEdit(schedule)} className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-sky-700 hover:bg-sky-50" type="button"><Pencil className="h-4 w-4" />Sửa</button><button onClick={() => void deleteSchedule(schedule.id)} className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50" type="button"><Trash2 className="h-4 w-4" />Xoá</button></div>
              </li>)}
            </ul>}
        </section>
      </div>
    </main>
  );
}
