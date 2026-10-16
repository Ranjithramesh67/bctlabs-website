import { Card, Container, EmptyState } from "@/components/ui";
import { formatDate, truncate } from "@/lib/format";
import { getContactMessageCount, getContactMessages } from "@/lib/messages";

export const dynamic = "force-dynamic";

export const metadata = { title: "Messages" };

/** Native, JS-free disclosure for the full message body. */
function MessageBody({ message, className }: { message: string; className?: string }) {
  const preview = truncate(message, 160) || "-";
  return (
    <details className={className}>
      <summary className="cursor-pointer text-sm font-medium text-slate-700 hover:text-brand-700">
        {preview}
      </summary>
      <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{message || "-"}</p>
    </details>
  );
}

export default async function AdminMessagesPage() {
  const [messages, total] = await Promise.all([getContactMessages(200), getContactMessageCount()]);

  return (
    <Container className="py-10">
      <header className="max-w-2xl">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Messages</h1>
        <p className="mt-1 text-sm text-slate-500">
          {total > 0
            ? `${total} contact ${total === 1 ? "message" : "messages"} received from the storefront.`
            : "Contact form submissions from the storefront will appear here."}
        </p>
      </header>

      <section className="mt-8">
        {messages.length === 0 ? (
          <EmptyState
            title="No messages yet"
            description="When a customer submits the contact form, their message will show up here."
          />
        ) : (
          <>
            {/* Desktop: table */}
            <Card className="hidden overflow-hidden md:block">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th scope="col" className="px-5 py-3 font-semibold">
                        From
                      </th>
                      <th scope="col" className="px-5 py-3 font-semibold">
                        Subject
                      </th>
                      <th scope="col" className="px-5 py-3 font-semibold">
                        Message
                      </th>
                      <th scope="col" className="whitespace-nowrap px-5 py-3 font-semibold">
                        Received
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {messages.map((message) => (
                      <tr key={message.id} className="align-top transition-colors hover:bg-slate-50/70">
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-900">{message.name || "-"}</p>
                          {message.email ? (
                            <a
                              href={`mailto:${message.email}`}
                              className="mt-0.5 block text-brand-700 hover:text-brand-800"
                            >
                              {message.email}
                            </a>
                          ) : null}
                          {message.phone ? (
                            <a
                              href={`tel:${message.phone}`}
                              className="mt-0.5 block text-slate-500 hover:text-slate-700"
                            >
                              {message.phone}
                            </a>
                          ) : null}
                        </td>
                        <td className="px-5 py-4 text-slate-700">{message.subject || "-"}</td>
                        <td className="max-w-md px-5 py-4">
                          <MessageBody message={message.message} />
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                          {formatDate(message.createdAt) || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Mobile: cards */}
            <ul className="space-y-4 md:hidden">
              {messages.map((message) => (
                <li key={message.id}>
                  <Card className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900">{message.name || "-"}</p>
                        {message.email ? (
                          <a
                            href={`mailto:${message.email}`}
                            className="mt-0.5 block break-all text-sm text-brand-700 hover:text-brand-800"
                          >
                            {message.email}
                          </a>
                        ) : null}
                        {message.phone ? (
                          <a
                            href={`tel:${message.phone}`}
                            className="mt-0.5 block text-sm text-slate-500 hover:text-slate-700"
                          >
                            {message.phone}
                          </a>
                        ) : null}
                      </div>
                      <span className="shrink-0 text-xs text-slate-500">
                        {formatDate(message.createdAt) || "-"}
                      </span>
                    </div>

                    <p className="mt-3 text-sm">
                      <span className="font-medium text-slate-500">Subject: </span>
                      <span className="text-slate-800">{message.subject || "-"}</span>
                    </p>

                    <MessageBody message={message.message} className="mt-3" />
                  </Card>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </Container>
  );
}
