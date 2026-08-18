import { prisma } from "@/src/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type ScheduleInput = { departureDate?: unknown; departureTime?: unknown; endTime?: unknown; priority?: unknown; travelInfo?: unknown };
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

function validateScheduleInput(input: ScheduleInput) {
  const { departureDate, departureTime, endTime, priority, travelInfo } = input;
  if (typeof departureDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(departureDate) || Number.isNaN(new Date(`${departureDate}T00:00:00.000Z`).getTime())) return { error: "Ngày đi không hợp lệ." };
  if (typeof departureTime !== "string" || !timePattern.test(departureTime)) return { error: "Giờ bắt đầu không hợp lệ." };
  if (endTime !== undefined && endTime !== null && (typeof endTime !== "string" || !timePattern.test(endTime))) return { error: "Giờ kết thúc không hợp lệ." };
  if (typeof endTime === "string" && endTime <= departureTime) return { error: "Giờ kết thúc phải sau giờ bắt đầu." };
  if (priority !== undefined && priority !== "normal" && priority !== "optional" && priority !== "important") return { error: "Mức độ lịch trình không hợp lệ." };
  if (typeof travelInfo !== "string" || !travelInfo.trim()) return { error: "Thông tin chuyến đi là bắt buộc." };
  return { data: { departureDate: new Date(`${departureDate}T00:00:00.000Z`), departureTime, endTime: typeof endTime === "string" ? endTime : null, priority: typeof priority === "string" ? priority : "normal", travelInfo: travelInfo.trim() } };
}

export async function GET() {
  try { return NextResponse.json(await prisma.travelSchedule.findMany({ orderBy: [{ departureDate: "asc" }, { departureTime: "asc" }] })); }
  catch { return NextResponse.json({ error: "Không thể tải lịch trình." }, { status: 500 }); }
}

export async function POST(request: Request) {
  try {
    const result = validateScheduleInput((await request.json()) as ScheduleInput);
    if ("error" in result) return NextResponse.json(result, { status: 400 });
    return NextResponse.json(await prisma.travelSchedule.create({ data: result.data }), { status: 201 });
  } catch { return NextResponse.json({ error: "Không thể tạo lịch trình." }, { status: 500 }); }
}
