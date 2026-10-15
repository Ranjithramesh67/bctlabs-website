"use client";

import { useEffect, useRef, useState } from "react";

type ChatUser = {
  id: number;
  firstName: string;
  phone: string;
  roleNames: string;
};

type ChatItem = {
  user_id: number;
  user_role: string;
  name: string;
  phone: string | null;
  profile_image_url: string;
  unread_count: number;
  last_message_time: string | null;
};

type MessageItem = {
  side: string;
  message: string | null;
  type: string | null;
  file_url: string | null;
  created_at: string;
  sender_image_url: string;
  user_image: string;
};

/** PHP `ucwords()`. */
function ucwords(value: string): string {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}

export function ChatClient({ user }: { user: ChatUser | null }) {
  const activeUserId = user?.id ?? null;

  const [chatList, setChatList] = useState<ChatItem[]>([]);
  const [search, setSearch] = useState("");
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [modalImage, setModalImage] = useState<string | null>(null);

  const initialLoad = useRef(true);
  const chatMessagesRef = useRef<HTMLDivElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const response = await fetch("/admin/get-chat-list", {
          cache: "no-store",
        });
        if (!response.ok) {
          return;
        }
        const data = (await response.json()) as {
          status?: boolean;
          chat_list?: ChatItem[];
        };
        if (active && data.status) {
          setChatList(data.chat_list ?? []);
        }
      } catch {
        // Keep the last known list on transient errors.
      }
    };

    void load();
    const timer = setInterval(() => void load(), 5000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (activeUserId === null) {
      return;
    }
    let active = true;

    const load = async () => {
      try {
        const response = await fetch(
          `/admin/get-message?user_id=${activeUserId}`,
          { cache: "no-store" },
        );
        if (!response.ok) {
          return;
        }
        const data = (await response.json()) as {
          status?: boolean;
          messages?: MessageItem[];
        };
        if (active && data.status) {
          setMessages(data.messages ?? []);
        }
      } catch {
        // Keep the last known messages on transient errors.
      }
    };

    void load();
    const timer = setInterval(() => void load(), 1000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [activeUserId]);

  useEffect(() => {
    const container = chatMessagesRef.current;
    if (initialLoad.current && container) {
      container.scrollTop = container.scrollHeight;
      initialLoad.current = false;
    }
  }, [messages]);

  const query = search.trim().toLowerCase();
  const visibleChatList = query
    ? chatList.filter((item) => item.name.toLowerCase().includes(query))
    : chatList;

  const selectChat = (id: number) => {
    const url = new URL(window.location.href);
    url.searchParams.set("user_id", String(id));
    window.location.assign(url.toString());
  };

  const handleImageChange = (file: File | null) => {
    setImageFile(file);
    if (!file) {
      setImagePreview(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(
        typeof event.target?.result === "string" ? event.target.result : null,
      );
    };
    reader.readAsDataURL(file);
  };

  const sendMessage = async () => {
    const message = messageInput.trim();
    if (!message && !imageFile) {
      return;
    }

    const formData = new FormData();
    formData.append("type", imageFile ? "image" : "text");
    formData.append("message", message);
    formData.append("user_id", String(activeUserId ?? ""));
    if (imageFile) {
      formData.append("file", imageFile);
    }

    await fetch("/admin/send-admin-message", {
      method: "POST",
      body: formData,
    });

    setMessageInput("");
    setImageFile(null);
    setImagePreview(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  return (
    <>
      <style>{`
        .content-body { min-height: auto !important; }
        .chatbox1 .img_cont_msg {
          width: 1.875rem;
          height: 1.875rem;
          display: block;
          max-width: 1.875rem;
          min-width: 1.875rem;
        }
        .chatbox1 .img_cont_msg img { width: 100%; height: 100%; }
        .chatbox1 .img_cont_msg img,
        .chatbox1 .img_cont .user_img { object-fit: cover; }
        .chatbox1 .msg_cotainer .msg_time {
          display: block;
          font-size: 0.6875rem;
          color: #fff;
          margin-top: 0.3125rem;
          opacity: 0.5;
        }
        .chatbox1 .msg_cotainer {
          background: var(--primary);
          margin-left: 0.625rem;
          border-top-right-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
          border-bottom-left-radius: 0.5rem;
          padding: 0.625rem 0.9375rem;
          color: #fff;
          position: relative;
        }
        .chatbox1 .img_cont {
          width: 2.5rem;
          border-radius: 2.5rem;
          margin-right: 0.625rem;
          position: relative;
          height: 2.5rem;
          background: #eee;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.875rem;
          min-width: 2.5rem;
          min-height: 2.5rem;
        }
        .chatbox1 .msg_cotainer_send {
          background: #f5f5f5;
          padding: 0.625rem 0.9375rem;
          border-radius: 0.375rem 0rem 0.375rem 0.375rem;
          margin-right: 0.625rem;
          color: #222;
          position: relative;
          text-align: right;
        }
        .chatbox1 .img_cont .user_img { width: 35px; height: 35px; }
        .chatbox1 .contacts li > div { display: flex; align-items: center; }
        .chatbox1 .contacts li {
          padding: 0.4375rem 1rem;
          border-bottom: 0.0625rem solid #eee;
          cursor: pointer;
        }
        .chatbox1 .contacts .name-first-letter {
          background: #f5f5f5;
          padding: 0.25rem 1rem;
          font-weight: 700;
          color: #000;
          position: sticky;
          top: 0;
          z-index: 1;
        }
        .chatbox1 .img_cont .online_icon {
          background: #2adb7b;
          position: absolute;
          width: 0.75rem;
          height: 0.75rem;
          border-radius: 0.9375rem;
          right: -0.0625rem;
          bottom: 0rem;
          border: 0.125rem solid #fff;
        }
        .chatbox1 .img_cont .online_icon.offline { background: #f72b50; }
        .chatbox1 .contacts_body { height: calc(80vh - 50px); }
        .chatbox1 .chat-list-header { justify-content: center; background: #fff; }
        .chatbox1 .card { box-shadow: none; }
        .chatbox1 .msg_cotainer_send .msg_time_send {
          display: block;
          font-size: 0.6875rem;
          color: #111111;
          margin-top: 0.3125rem;
          opacity: 0.5;
        }
        .card-footer.type_msg .input-group { display: flex; align-items: center; }
        .form-control.is-invalid { border-color: #f72b50 !important; border-right: 1px !important; }
        .card-footer.type_msg button { margin-right: 5px; }
        .card-footer.type_msg #messageInput {
          height: 40px !important;
          border-radius: 5px;
          margin-right: 10px;
          resize: none;
        }
        #pickImageBtn i, #sendMessageBtn i { font-size: 16px; }
        .empty-chat-section {
          height: 80vh;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
        }
        .empty-chat-section p { width: 80%; font-size: 14px; text-align: center; }
        .empty-chat-section .img-container-logo {
          width: 250px;
          height: 250px;
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 5%;
        }
        .img-container-logo img {
          width: 100%;
          max-width: 100%;
          height: auto;
        }
        .chatbox1 .msg_cotainer .msg_image,
        .chatbox1 .msg_cotainer_send .msg_image {
          max-width: 100%;
          height: auto;
        }
        #imageModal #modalImage {
          max-width: 100%;
          max-height: 60vh;
          object-fit: contain;
        }
        .copyright { margin-top: 0px; }
        .chatbox1 .active-chat {
          background-color: #f0f0f0;
          border-left: 4px solid #007bff;
        }
        .chatbox1 .dlab-chat-user {
          cursor: pointer;
          padding: 10px;
          transition: background-color 0.3s ease;
        }
        .chatbox1 .dlab-chat-user:hover { background-color: #eaeaea; }
      `}</style>

      <div className="row p-3 chatbox1">
        <div className="col-md-8">
          <div className="card chat dlab-chat-history-box">
            {user ? (
              <>
                <div className="card-header chat-list-header text-center mb-0">
                  <div>
                    <h6 className="mb-1" id="chatUserName">
                      {ucwords(user.firstName)}/{user.phone} ( {user.roleNames} )
                    </h6>
                  </div>
                </div>
                <div
                  className="card-body msg_card_body dlab-scroll"
                  id="chatMessages"
                  ref={chatMessagesRef}
                  style={{ height: 58 }}
                >
                  {messages.map((message, index) => {
                    const body =
                      message.type === "image" && message.file_url ? (
                        <a
                          href="#"
                          className="imagePreview"
                          onClick={(event) => {
                            event.preventDefault();
                            setModalImage(message.file_url);
                          }}
                        >
                          <img
                            style={{ width: 100, maxWidth: "100%", height: "auto" }}
                            src={message.file_url}
                            className="msg_image"
                            alt="Image"
                          />
                        </a>
                      ) : (
                        message.message
                      );

                    if (message.side === "right") {
                      return (
                        <div
                          className="d-flex justify-content-end mb-4"
                          key={index}
                        >
                          <div className="msg_cotainer_send">
                            {body}
                            <span className="msg_time_send">
                              {message.created_at}
                            </span>
                          </div>
                          <div className="img_cont_msg">
                            <img
                              src={message.sender_image_url}
                              className="rounded-circle user_img_msg"
                              alt=""
                            />
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        className="d-flex justify-content-start mb-4"
                        key={index}
                      >
                        <div className="img_cont_msg">
                          <img
                            src={message.sender_image_url}
                            className="rounded-circle user_img_msg"
                            alt=""
                          />
                        </div>
                        <div className="msg_cotainer">
                          {body}
                          <span className="msg_time">{message.created_at}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="card-footer type_msg">
                  <div className="input-group">
                    <input
                      type="file"
                      id="imageInput"
                      ref={imageInputRef}
                      className="form-control"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(event) =>
                        handleImageChange(event.target.files?.[0] ?? null)
                      }
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      id="pickImageBtn"
                      onClick={() => imageInputRef.current?.click()}
                    >
                      <i className="fa fa-paperclip"></i>
                    </button>

                    <textarea
                      className="form-control"
                      id="messageInput"
                      placeholder="Type your message..."
                      value={messageInput}
                      onChange={(event) => setMessageInput(event.target.value)}
                    ></textarea>
                    <input
                      type="hidden"
                      id="userId"
                      value={String(user.id)}
                      readOnly
                    />
                    <div className="input-group-append">
                      <button
                        type="button"
                        className="btn btn-primary"
                        id="sendMessageBtn"
                        onClick={() => void sendMessage()}
                      >
                        <i className="fa fa-location-arrow"></i> Send
                      </button>
                    </div>
                  </div>

                  {imagePreview ? (
                    <div className="image-preview-container mt-2">
                      <img
                        id="imagePreview"
                        src={imagePreview}
                        alt="Image Preview"
                        className="img-thumbnail"
                        style={{ maxWidth: 150, maxHeight: 150 }}
                      />
                    </div>
                  ) : null}
                </div>
              </>
            ) : (
              <div className="empty-chat-section">
                <div className="img-container-logo">
                  <img
                    src="data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22250%22%20height%3D%22250%22%20viewBox%3D%220%200%20250%20250%22%3E%3Ccircle%20cx%3D%22125%22%20cy%3D%22125%22%20r%3D%22118%22%20fill%3D%22%23eef1fe%22%2F%3E%3Crect%20x%3D%2252%22%20y%3D%2282%22%20width%3D%22146%22%20height%3D%2292%22%20rx%3D%2218%22%20fill%3D%22%236777ef%22%2F%3E%3Cpath%20d%3D%22M86%20174l-4%2026%2030-26z%22%20fill%3D%22%236777ef%22%2F%3E%3Ccircle%20cx%3D%2298%22%20cy%3D%22128%22%20r%3D%229%22%20fill%3D%22%23fff%22%2F%3E%3Ccircle%20cx%3D%22125%22%20cy%3D%22128%22%20r%3D%229%22%20fill%3D%22%23fff%22%2F%3E%3Ccircle%20cx%3D%22152%22%20cy%3D%22128%22%20r%3D%229%22%20fill%3D%22%23fff%22%2F%3E%3C%2Fsvg%3E"
                    alt="Chat"
                    width={250}
                    height={250}
                  />
                </div>
                <h4>Support Chat</h4>
                <p>
                  Send and Receive messages from <br />
                  your Drivers and Customers
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="col-md-4">
          <div className="card mb-sm-3 mb-md-0 contacts_card dlab-chat-user-box">
            <div className="card-header chat-list-header text-center mb-0">
              <input
                type="text"
                id="chatSearch"
                className="form-control"
                placeholder="Search users..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <div
              className="card-body contacts_body p-0 dlab-scroll"
              id="DLAB_W_Contacts_Body"
            >
              <ul id="chatList" className="chat-list contacts">
                {visibleChatList.map((item) => {
                  const isActive =
                    activeUserId !== null &&
                    String(activeUserId) === String(item.user_id)
                      ? "active-chat"
                      : "";
                  return (
                    <li
                      className={`dlab-chat-user ${isActive}`}
                      data-user-id={item.user_id}
                      key={item.user_id}
                      onClick={() => selectChat(item.user_id)}
                    >
                      <div className="d-flex bd-highlight">
                        <div className="img_cont">
                          <img
                            src={item.profile_image_url}
                            className="rounded-circle user_img"
                            alt=""
                          />
                        </div>
                        <div className="user_info">
                          <span>
                            {item.name} / {item.phone}
                          </span>{" "}
                          ({item.user_role}){" "}
                          {item.unread_count > 0 ? (
                            <span className="badge badge-danger">
                              {item.unread_count}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`modal fade${modalImage ? " show d-block" : ""}`}
        id="imageModal"
        tabIndex={-1}
        role="dialog"
        style={modalImage ? { background: "rgba(0,0,0,0.5)" } : undefined}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="imageModalLabel">
                Image Preview
              </h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={() => setModalImage(null)}
              ></button>
            </div>
            <div className="modal-body" style={{ height: 400, overflowY: "auto" }}>
              {modalImage ? (
                <img
                  src={modalImage}
                  id="modalImage"
                  alt="Image Preview"
                  className="img-fluid"
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
