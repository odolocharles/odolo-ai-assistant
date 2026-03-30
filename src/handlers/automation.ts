import { IncomingMessage } from "../brain";

// Maps parsed commands to skill functions
export async function runAutomation(command: string, msg: IncomingMessage): Promise<string> {
  const lower = command.toLowerCase();

  try {
    if (lower.includes("email") || lower.includes("send")) {
      const { sendEmail } = await import("../skills/email");
      return sendEmail(command);
    }
    if (lower.includes("weather")) {
      const { getWeather } = await import("../skills/weather");
      return getWeather(command);
    }
    if (lower.includes("remind") || lower.includes("calendar")) {
      const { createReminder } = await import("../skills/calendar");
      return createReminder(command);
    }
    if (lower.includes("news")) {
      const { readNews } = await import("../skills/news");
      return readNews(command);
    }
    if (lower.includes("play") || lower.includes("music") || lower.includes("skip") || lower.includes("pause")) {
      const { controlMusic } = await import("../skills/music");
      return controlMusic(command);
    }
    if (lower.includes("scan") || lower.includes("port")) {
      const { scanNetwork } = await import("../skills/security");
      return scanNetwork(command);
    }
    if (lower.includes("ssl") || lower.includes("certificate")) {
      const { checkSSL } = await import("../skills/security");
      return checkSSL(command);
    }
    if (lower.includes("light") || lower.includes("turn on") || lower.includes("turn off")) {
      const { controlDevice } = await import("../skills/smarthome");
      return controlDevice(command);
    }

    return `I understood you want to automate something but I could not match a skill. Try being more specific.`;
  } catch (err: any) {
    return `Automation failed: ${err.message}`;
  }
}
