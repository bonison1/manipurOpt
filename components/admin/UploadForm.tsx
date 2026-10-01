// Path: components/admin/UploadForm.tsx
'use client';

import { useState, type ChangeEvent, type ReactNode } from 'react';

const MAX = 1024 * 1024;

export default function UploadForm({
  action,
  children,
  multiple = false,
  submitLabel = 'Upload',
}: {
  action: (formData: FormData) => void | Promise<void>;
  children?: ReactNode;
  multiple?: boolean;
  submitLabel?: string;
}) {
  const [err, setErr] = useState<string | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const bad = files.find((f) => f.size >= MAX);
    if (bad) {
      setErr(`${bad.name} is ${(bad.size / 1024 / 1024).toFixed(2)} MB — must be under 1 MB.`);
      e.target.value = '';
      setPreviews([]);
      return;
    }
    if (files.length > 5) {
      setErr('Select up to 5 photos at a time.');
      e.target.value = '';
      setPreviews([]);
      return;
    }
    setErr(null);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  }

  return (
    <form action={action} className="grid gap-4">
      {children}
      <div>
        <label className="mb-1 block text-sm font-semibold text-slate-700">
          Photo{multiple ? 's (up to 5)' : ''} — JPG, PNG or WebP, under 1 MB each
        </label>
        <input
          type="file"
          name="photo"
          accept="image/jpeg,image/png,image/webp"
          multiple={multiple}
          required
          onChange={onChange}
          className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[#073b66] file:px-4 file:py-2 file:font-semibold file:text-white"
        />
        {err && <p className="mt-2 text-sm font-medium text-red-600">{err}</p>}
      </div>
      {previews.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {previews.map((p) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={p} src={p} alt="Preview" className="h-20 w-20 rounded-lg border object-cover" />
          ))}
        </div>
      )}
      <button
        type="submit"
        disabled={!!err}
        className="w-fit rounded-lg bg-[#0d9488] px-5 py-2 text-sm font-bold text-white disabled:opacity-50"
      >
        {submitLabel}
      </button>
    </form>
  );
}