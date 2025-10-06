"use client";

import { useEffect, useState } from "react";
import { Clock, LogIn, LogOut } from "lucide-react";

export default function WorkTimePage() {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("workStartTime");
    if (saved) {
      setStartTime(saved);
      const end = calculateEndTime(saved);
      setEndTime(end);
    }
  }, []);

  const handleChange = (value: string) => {
    setStartTime(value);
    localStorage.setItem("workStartTime", value);
    const end = calculateEndTime(value);
    setEndTime(end);
  };

  const calculateEndTime = (time: string) => {
    const [hour, minute] = time.split(":").map(Number);
    const start = new Date();
    start.setHours(hour, minute, 0, 0);
    start.setMinutes(start.getMinutes() + 9 * 60 + 48);
    return start.toTimeString().slice(0, 5);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100 text-slate-800">
      <div
        className="
          bg-white/95 
          backdrop-blur-sm 
          shadow-[0_8px_24px_rgba(0,0,0,0.08)] 
          rounded-3xl 
          p-10 
          w-full 
          max-w-sm 
          border 
          border-slate-200 
          hover:shadow-[0_10px_28px_rgba(0,0,0,0.1)]
          transition-all 
          duration-300
        "
      >
        {/* Header */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="p-3 bg-gradient-to-br from-sky-100 to-sky-200 rounded-2xl shadow-inner">
            <Clock className="w-7 h-7 text-sky-700" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
            Giờ Làm Việc
          </h1>
        </div>

        {/* Giờ vào */}
        <div className="text-center mb-8">
          <label className="block text-lg font-medium mb-3 text-slate-500 flex items-center justify-center gap-2">
            <LogIn className="w-5 h-5 text-sky-600" />
            <span>Giờ vào</span>
          </label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => handleChange(e.target.value)}
            className="
              w-48 
              text-center 
              text-2xl 
              font-semibold 
              text-sky-700 
              border 
              border-slate-300 
              rounded-xl 
              px-3 py-2 
              bg-gradient-to-br from-white to-slate-50
              shadow-inner
              focus:outline-none 
              focus:ring-2 
              focus:ring-sky-400 
              transition
            "
          />
        </div>

        {/* Giờ ra dự kiến */}
        {endTime && (
          <div className="text-center mt-10">
            <div className="flex items-center justify-center gap-2 mb-2 text-slate-500">
              <LogOut className="w-5 h-5 text-indigo-600" />
              <p className="text-lg font-medium">Giờ ra</p>
            </div>
            <p className="text-6xl font-bold text-indigo-800 tracking-tight drop-shadow-sm">
              {endTime}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
