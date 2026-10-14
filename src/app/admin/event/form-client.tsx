"use client";

import { useEffect, useRef, useState } from "react";

import { deleteEventImage } from "@/app/admin/event/actions";

type SwalInstance = {
  fire: (options: Record<string, unknown>) => Promise<{ isConfirmed: boolean }>;
};

type CKEditorInstance = { destroy: () => Promise<void> | void };
type CKEditorGlobal = {
  create: (
    element: HTMLElement,
    config: Record<string, unknown>,
  ) => Promise<CKEditorInstance>;
};

declare global {
  interface Window {
    Swal?: SwalInstance;
    ClassicEditor?: CKEditorGlobal;
  }
}

/** Inject a CDN script once and resolve when it loads (or fails). */
function loadScript(src: string, dataAttr: string): Promise<void> {
  return new Promise((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[${dataAttr}]`,
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => resolve());
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.setAttribute(dataAttr, "true");
    script.addEventListener("load", () => resolve());
    script.addEventListener("error", () => resolve());
    document.body.appendChild(script);
  });
}

async function loadSwal(): Promise<SwalInstance | null> {
  if (!window.Swal) {
    await loadScript(
      "https://cdn.jsdelivr.net/npm/sweetalert2@11",
      "data-sweetalert2",
    );
  }
  return window.Swal ?? null;
}

async function loadClassicEditor(): Promise<CKEditorGlobal | null> {
  if (!window.ClassicEditor) {
    await loadScript(
      "https://cdn.ckeditor.com/ckeditor5/40.1.0/classic/ckeditor.js",
      "data-ckeditor5",
    );
  }
  return window.ClassicEditor ?? null;
}

/**
 * Image preview with the original "delete image" button. Calls the
 * `deleteEventImage` action after an (optional) SweetAlert confirmation.
 */
export function ImagePreviewDelete({
  id,
  field,
  src,
}: {
  id: string;
  field: string;
  src: string;
}) {
  const [deleted, setDeleted] = useState(false);
  const [busy, setBusy] = useState(false);

  if (deleted) {
    return null;
  }

  const onClick = async () => {
    const swal = await loadSwal();
    let confirmed: boolean;
    if (swal) {
      const result = await swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      });
      confirmed = result.isConfirmed;
    } else {
      confirmed = window.confirm("Are you sure?");
    }
    if (!confirmed) {
      return;
    }

    setBusy(true);
    const formData = new FormData();
    formData.set("id", id);
    formData.set("field", field);
    const result = await deleteEventImage(formData);
    setBusy(false);
    if (result.success) {
      setDeleted(true);
    } else {
      window.alert(result.message);
    }
  };

  return (
    <div className="mt-2 image-preview-container">
      <img src={src} className="img-thumbnail" width={100} alt="" />
      <button
        type="button"
        className="btn btn-danger btn-sm delete-image"
        data-id={id}
        data-field={field}
        onClick={onClick}
        disabled={busy}
      >
        <i className="fas fa-trash"></i>
      </button>
    </div>
  );
}

/** Original `onclick="window.history.back();"` secondary button. */
export function BackButton({ label = "Back" }: { label?: string }) {
  return (
    <button
      type="button"
      className="btn btn-secondary mt-3"
      onClick={() => window.history.back()}
    >
      {label}
    </button>
  );
}

/** CKEditor 5 classic wrapper around the original `#editor` textarea. */
export function ContentEditor({
  name,
  id,
  className,
  defaultValue,
}: {
  name: string;
  id: string;
  className?: string;
  defaultValue?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let editor: CKEditorInstance | null = null;
    let cancelled = false;

    void (async () => {
      const ClassicEditor = await loadClassicEditor();
      if (!ClassicEditor || cancelled || !ref.current) {
        return;
      }
      try {
        editor = await ClassicEditor.create(ref.current, {
          toolbar: {
            items: [
              "heading",
              "|",
              "bold",
              "italic",
              "underline",
              "|",
              "bulletedList",
              "numberedList",
              "|",
              "link",
              "|",
              "undo",
              "redo",
            ],
          },
          removePlugins: [
            "CKFinder",
            "CKFinderUploadAdapter",
            "Image",
            "ImageToolbar",
            "ImageUpload",
            "ImageCaption",
            "ImageStyle",
            "ImageResize",
            "MediaEmbed",
            "EasyImage",
          ],
        });
      } catch {
        // Editor is an enhancement; the plain textarea still submits.
      }
    })();

    return () => {
      cancelled = true;
      void editor?.destroy();
    };
  }, []);

  return (
    <textarea
      ref={ref}
      name={name}
      id={id}
      className={className}
      defaultValue={defaultValue}
    />
  );
}
