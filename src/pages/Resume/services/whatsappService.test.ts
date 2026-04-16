import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getWhatsAppGroups,
  getWhatsAppShareLog,
  queueWhatsAppSendResume,
} from "./whatsappService";

const API = "https://api.test";

describe("whatsappService", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_BASE_URL", API);
    vi.stubEnv("VITE_WHATSAPP_API_BASE_URL", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("getWhatsAppGroups parses data.groups", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          message: "ok",
          data: {
            groups: [
              { groupId: 1, groupName: "A" },
              { group_id: 2, group_name: "B" },
            ],
          },
        }),
        { status: 200 }
      )
    );

    const { groups } = await getWhatsAppGroups("token");
    expect(fetchMock).toHaveBeenCalledWith(
      `${API}/whatsapp/groups`,
      expect.objectContaining({ method: "GET" })
    );
    expect(groups).toHaveLength(2);
    expect(groups[0]).toEqual({ groupId: 1, groupName: "A" });
    expect(groups[1]).toEqual({ groupId: 2, groupName: "B" });
  });

  it("queueWhatsAppSendResume returns queueId and queued", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          message: "queued",
          data: { queued: true, queueId: 42 },
        }),
        { status: 200 }
      )
    );

    const res = await queueWhatsAppSendResume("t", {
      candidateId: 5,
      groupId: 2,
      customMessage: "hi",
    });

    expect(res.queued).toBe(true);
    expect(res.queueId).toBe(42);
    expect(res.message).toBe("queued");

    const call = vi.mocked(fetch).mock.calls[0];
    expect(call[0]).toBe(`${API}/whatsapp/send-resume`);
    const body = JSON.parse((call[1] as RequestInit).body as string);
    expect(body).toEqual({ candidateId: 5, groupId: 2, customMessage: "hi" });
  });

  it("getWhatsAppShareLog normalizes queue and messages", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            queue: {
              id: 1,
              candidate_id: 5,
              group_id: 2,
              status: "DONE",
              retry_count: 0,
              created_at: "2026-01-01T00:00:00.000Z",
              processed_at: "2026-01-01T00:01:00.000Z",
            },
            messages: [
              {
                message_log_id: 9,
                candidate_id: 5,
                group_id: 2,
                member_id: 1,
                phone_number: "91x",
                message_status: "SENT",
                meta_message_id: "wamid.1",
                error_message: null,
                sent_at: "2026-01-01T00:00:30.000Z",
                delivered_at: null,
              },
            ],
          },
        }),
        { status: 200 }
      )
    );

    const out = await getWhatsAppShareLog("t", 1);
    expect(out.queue.id).toBe(1);
    expect(out.queue.candidateId).toBe(5);
    expect(out.queue.groupId).toBe(2);
    expect(out.queue.status).toBe("DONE");
    expect(out.messages).toHaveLength(1);
    expect(out.messages[0].messageLogId).toBe(9);
    expect(out.messages[0].messageStatus).toBe("SENT");
  });
});
