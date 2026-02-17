import { google } from "googleapis";

function getCalendarClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });

  return google.calendar({ version: "v3", auth });
}

const calendarId = () => process.env.GOOGLE_CALENDAR_ID || "primary";

export async function getFreeBusy(
  timeMin: Date,
  timeMax: Date
): Promise<{ start: string; end: string }[]> {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
    return [];
  }

  const calendar = getCalendarClient();

  const res = await calendar.freebusy.query({
    requestBody: {
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      items: [{ id: calendarId() }],
    },
  });

  const busy = res.data.calendars?.[calendarId()]?.busy || [];
  return busy.map((b) => ({
    start: b.start || "",
    end: b.end || "",
  }));
}

export async function createEvent(params: {
  summary: string;
  description?: string;
  startTime: Date;
  endTime: Date;
}): Promise<string | null> {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
    return null;
  }

  const calendar = getCalendarClient();

  const res = await calendar.events.insert({
    calendarId: calendarId(),
    requestBody: {
      summary: params.summary,
      description: params.description,
      start: {
        dateTime: params.startTime.toISOString(),
        timeZone: "America/Argentina/Buenos_Aires",
      },
      end: {
        dateTime: params.endTime.toISOString(),
        timeZone: "America/Argentina/Buenos_Aires",
      },
    },
  });

  return res.data.id || null;
}

export async function deleteEvent(eventId: string): Promise<void> {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
    return;
  }

  const calendar = getCalendarClient();

  await calendar.events.delete({
    calendarId: calendarId(),
    eventId,
  });
}
