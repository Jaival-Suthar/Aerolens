import type { SendWhatsAppMessagePayload, SendWhatsAppMessageResult } from "../types/resumeTypes";

const GRAPH_BASE_URL = "https://graph.facebook.com";
const GRAPH_VERSION = (import.meta.env.VITE_WHATSAPP_GRAPH_VERSION || "v22.0").trim();
const PHONE_NUMBER_ID = (import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID || "").trim();
function normalizeAccessToken(raw: string): string {
  return raw.replace(/^\uFEFF/, "").trim().replace(/^["']|["']$/g, "");
}

const ACCESS_TOKEN = normalizeAccessToken(import.meta.env.VITE_WHATSAPP_ACCESS_TOKEN || "");

function parseErrorMessage(raw: unknown): string {
  if (raw && typeof raw === "object") {
    const maybe = raw as {
      error?: { message?: string };
      message?: string;
    };
    return maybe.error?.message || maybe.message || "Failed to send WhatsApp message.";
  }
  return "Failed to send WhatsApp message.";
}

function normalizePhoneForWhatsApp(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

export async function sendWhatsAppMessage(
  payload: SendWhatsAppMessagePayload
): Promise<SendWhatsAppMessageResult> {
  if (!PHONE_NUMBER_ID) {
    throw new Error("Missing VITE_WHATSAPP_PHONE_NUMBER_ID in .env");
  }
  if (!ACCESS_TOKEN) {
    throw new Error("Missing VITE_WHATSAPP_ACCESS_TOKEN in .env");
  }

  const to = normalizePhoneForWhatsApp(payload.to);
  if (!to || to.length < 10) {
    throw new Error("Enter a valid phone number.");
  }

  const text = (payload.message || "").trim();
  if (!text) {
    throw new Error("Message cannot be empty.");
  }

  const endpoint = `${GRAPH_BASE_URL}/${GRAPH_VERSION}/${PHONE_NUMBER_ID}/messages`;
  const body = {
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: {
      body: text,
      preview_url: false,
    },
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  let json: unknown = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }

  if (!res.ok) {
    throw new Error(parseErrorMessage(json));
  }

  const data = json as {
    messages?: { id: string }[];
    messaging_product?: string;
  };
  return {
    success: true,
    messageId: data.messages?.[0]?.id,
    messagingProduct: data.messaging_product,
  };
}
