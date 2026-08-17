import { prisma } from "@/src/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type ScheduleInput = {
  departureDate?: unknown;
  departureTime?: unknown;
  travelInfo?: unknown;
};

function validateScheduleInput(input: ScheduleInput) {
  const { departureDate, departureTime, travelInfo } = input;
  if (typeof departureDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(departureDate)) return { error: "Ngày đi không hợp lệ." };
  if (typeof departureTime !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(departureTime)) return { error: "Giờ đi không hợp lệ." };
  if (typeof travelInfo !== "string" || !travelInfo.trim()) return { error: "Thông tin chuyến đi là bắt buộc." };
  return { data: { departureDate: new Date(`${departureDate}T00:00:00.000Z`), departureTime, travelInfo: travelInfo.trim() } };
}

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: RouteContext) {
  const { id } = await params;
  const schedule = await prisma.travelSchedule.findUnique({ where: { id } });
  return schedule
    ? NextResponse.json(schedule)
    : NextResponse.json({ error: "Không tìm thấy lịch trình." }, { status: 404 });
}

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const result = validateScheduleInput((await request.json()) as ScheduleInput);
    if ("error" in result) return NextResponse.json(result, { status: 400 });

    const schedule = await prisma.travelSchedule.update({ where: { id }, data: result.data });
    return NextResponse.json(schedule);
  } catch (error) {
    if ((error as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Không tìm thấy lịch trình." }, { status: 404 });
    }
    return NextResponse.json({ error: "Không thể cập nhật lịch trình." }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    await prisma.travelSchedule.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if ((error as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Không tìm thấy lịch trình." }, { status: 404 });
    }
    return NextResponse.json({ error: "Không thể xoá lịch trình." }, { status: 500 });
  }
}
