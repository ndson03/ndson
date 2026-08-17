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

  if (
    typeof departureDate !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(departureDate) ||
    Number.isNaN(new Date(`${departureDate}T00:00:00.000Z`).getTime())
  ) {
    return { error: "Ngày đi không hợp lệ." };
  }

  if (typeof departureTime !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(departureTime)) {
    return { error: "Giờ đi không hợp lệ." };
  }

  if (typeof travelInfo !== "string" || !travelInfo.trim()) {
    return { error: "Thông tin chuyến đi là bắt buộc." };
  }

  return {
    data: {
      departureDate: new Date(`${departureDate}T00:00:00.000Z`),
      departureTime,
      travelInfo: travelInfo.trim(),
    },
  };
}

export async function GET() {
  try {
    const schedules = await prisma.travelSchedule.findMany({
      orderBy: [{ departureDate: "asc" }, { departureTime: "asc" }],
    });
    return NextResponse.json(schedules);
  } catch {
    return NextResponse.json({ error: "Không thể tải lịch trình." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const input = (await request.json()) as ScheduleInput;
    const result = validateScheduleInput(input);
    if ("error" in result) return NextResponse.json(result, { status: 400 });

    const schedule = await prisma.travelSchedule.create({ data: result.data });
    return NextResponse.json(schedule, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Không thể tạo lịch trình." }, { status: 500 });
  }
}
