import { notFound } from "next/navigation";
import { connection } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const instant = false;

/** Laravel `UserController::support_chat`. */
export default async function SupportChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Session/DB-backed page: render at request time (Cache Components).
  await connection();
  await getCurrentUser();

  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    notFound();
  }

  // `SupportTicketConv::find($id)`.
  const supportTicket = await prisma.support_ticket_convs.findUnique({
    where: { id: BigInt(numericId) },
  });
  if (!supportTicket) {
    notFound();
  }

  // `SupportTicketConv::where('support_ticket_id', $support_ticket->id)->first()`.
  const message = await prisma.support_ticket_convs.findFirst({
    where: { support_ticket_id: supportTicket.id },
  });

  let customerFirstName: string | null = null;
  if (message?.support_ticket_id !== null && message?.support_ticket_id !== undefined) {
    const ticket = await prisma.support_tickets.findUnique({
      where: { id: message.support_ticket_id },
    });
    if (ticket?.customer_id !== null && ticket?.customer_id !== undefined) {
      const customer = await prisma.users.findUnique({
        where: { id: Number(ticket.customer_id) },
      });
      customerFirstName = customer?.first_name ?? null;
    }
  }

  return (
    <>
      <style>{`
        .msg_cotainer, .msg_cotainer_send {
          background: #f1f0f0;
          border-radius: 10px;
          padding: 10px;
          max-width: 70%;
        }
        .msg_cotainer_send {
          background: #007bff;
          color: white;
        }
        .msg_time, .msg_time_send {
          font-size: 0.8rem;
          display: block;
          margin-top: 5px;
          text-align: right;
        }
        .user_img_msg {
          width: 40px;
          height: 40px;
          object-fit: cover;
        }
        #chatBox { overflow-wrap: anywhere; }
        #imageModal #modalImage {
          max-width: 100%;
          max-height: 80vh;
          object-fit: contain;
        }
        .support-chat-input { flex-wrap: nowrap; }
        .support-chat-input textarea { min-width: 0; }
        @media (max-width: 575.98px) {
          #chatBox { height: 60vh !important; }
        }
      `}</style>
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <div className="card">
              {message ? (
                <div className="card-header">
                  Support Chat&nbsp;&nbsp; <strong>{customerFirstName}</strong>
                </div>
              ) : null}

              <div
                className="card-body"
                id="chatBox"
                style={{ height: 400, overflowY: "auto" }}
              >
                {/* Messages will be loaded here */}
              </div>

              <div className="card-footer">
                <form id="chatForm" encType="multipart/form-data">
                  <input type="hidden" name="user_id" id="chatUserId" />
                  <input
                    type="hidden"
                    name="type"
                    id="msgType"
                    defaultValue="text"
                  />
                  <div className="input-group support-chat-input">
                    <label
                      className="input-group-text bg-white border-end-0"
                      htmlFor="chatFile"
                      style={{ cursor: "pointer" }}
                    >
                      <i className="fas fa-plus"></i>
                    </label>
                    <input
                      type="file"
                      id="chatFile"
                      name="file"
                      style={{ display: "none" }}
                    />
                    <textarea
                      name="message"
                      className="form-control border-start-0"
                      id="chatMessage"
                      rows={1}
                      placeholder="Type a message..."
                      style={{ resize: "none" }}
                    ></textarea>
                    <button className="btn btn-primary" type="submit">
                      Send
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="modal fade" id="imageModal" tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered">
          <img id="modalImage" className="img-fluid rounded shadow" alt="" />
        </div>
      </div>
    </>
  );
}
