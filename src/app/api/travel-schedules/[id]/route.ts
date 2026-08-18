import { prisma } from "@/src/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type ScheduleInput = { departureDate?: unknown; departureTime?: unknown; endTime?: unknown; priority?: unknown; travelInfo?: unknown };
type RouteContext = { params: Promise<{ id: string }> };
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

function validateScheduleInput(input: ScheduleInput) {
  const { departureDate, departureTime, endTime, priority, travelInfo } = input;
  if (typeof departureDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(departureDate)) return { error: "Ngày đi không hợp lệ." };
  if (typeof departureTime !== "string" || !timePattern.test(departureTime)) return { error: "Giờ bắt đầu không hợp lệ." };
  if (endTime !== undefined && endTime !== null && (typeof endTime !== "string" || !timePattern.test(endTime))) return { error: "Giờ kết thúc không hợp lệ." };
  if (typeof endTime === "string" && endTime <= departureTime) return { error: "Giờ kết thúc phải sau giờ bắt đầu." };
  if (priority !== undefined && priority !== "normal" && priority !== "optional" && priority !== "important") return { error: "Mức độ lịch trình không hợp lệ." };
  if (typeof travelInfo !== "string" || !travelInfo.trim()) return { error: "Thông tin chuyến đi là bắt buộc." };
  return { data: { departureDate: new Date(`${departureDate}T00:00:00.000Z`), departureTime, endTime: typeof endTime === "string" ? endTime : null, priority: typeof priority === "string" ? priority : "normal", travelInfo: travelInfo.trim() } };
}

export async function GET(_: Request, { params }: RouteContext) {
  const { id } = await params;
  const schedule = await prisma.travelSchedule.findUnique({ where: { id } });
  return schedule ? NextResponse.json(schedule) : NextResponse.json({ error: "Không tìm thấy lịch trình." }, { status: 404 });
}

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const result = validateScheduleInput((await request.json()) as ScheduleInput);
    if ("error" in result) return NextResponse.json(result, { status: 400 });
    return NextResponse.json(await prisma.travelSchedule.update({ where: { id }, data: result.data }));
  } catch (error) { return NextResponse.json({ error: (error as { code?: string }).code === "P2025" ? "Không tìm thấy lịch trình." : "Không thể cập nhật lịch trình." }, { status: (error as { code?: string }).code === "P2025" ? 404 : 500 }); }
}

export async function DELETE(_: Request, { params }: RouteContext) {
  try { const { id } = await params; await prisma.travelSchedule.delete({ where: { id } }); return new NextResponse(null, { status: 204 }); }
  catch (error) { return NextResponse.json({ error: (error as { code?: string }).code === "P2025" ? "Không tìm thấy lịch trình." : "Không thể xoá lịch trình." }, { status: (error as { code?: string }).code === "P2025" ? 404 : 500 }); }
}
