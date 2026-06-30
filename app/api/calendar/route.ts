import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const timeMin = new Date().toISOString();
    const timeMax = new Date();
    timeMax.setDate(timeMax.getDate() + 7);

    const url = new URL("https://www.googleapis.com/calendar/v3/calendars/primary/events");
    url.searchParams.append("timeMin", timeMin);
    url.searchParams.append("timeMax", timeMax.toISOString());
    url.searchParams.append("singleEvents", "true");
    url.searchParams.append("orderBy", "startTime");

    const res = await fetch(url.toString(), {
      headers: { Authorization: token },
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Google Calendar API Error:", errorData);
      return NextResponse.json({ error: "Failed to fetch calendar events" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({ events: data.items });
  } catch (error) {
    console.error("Calendar API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
