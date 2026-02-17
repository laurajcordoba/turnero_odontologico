import twilio from "twilio";

function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    return null;
  }

  return twilio(accountSid, authToken);
}

export async function sendWhatsAppMessage(
  to: string,
  message: string
): Promise<boolean> {
  const client = getTwilioClient();
  if (!client) {
    console.log("[Twilio] Not configured, skipping WhatsApp message");
    return false;
  }

  const from = process.env.TWILIO_WHATSAPP_NUMBER;
  if (!from) return false;

  // Ensure phone number has whatsapp: prefix
  const toNumber = to.startsWith("whatsapp:") ? to : `whatsapp:+549${to.replace(/\D/g, "")}`;
  const fromNumber = from.startsWith("whatsapp:") ? from : `whatsapp:${from}`;

  try {
    await client.messages.create({
      body: message,
      from: fromNumber,
      to: toNumber,
    });
    return true;
  } catch (error) {
    console.error("[Twilio] Error sending WhatsApp message:", error);
    return false;
  }
}
