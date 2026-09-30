// Path: components/ContactForm.tsx
'use client';

import { useState } from 'react';

const WHATSAPP_NUMBER = '918259872236'; // country code + number, no + or spaces
const topics = ['Membership', 'CME & events', 'Projects', 'Something else'];

const field =
  'w-full rounded-xl border border-line bg-white px-4 py-3 text-base outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20';

export function ContactForm() {
  const [error, setError] = useState('');

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get('name') || '').trim();
    const topic = String(data.get('topic') || '');
    const message = String(data.get('message') || '').trim();

    if (!name || !message) {
      setError('Please add your name and a message.');
      return;
    }
    setError('');

    const text = `Hello MOA,\n\n${message}\n\nTopic: ${topic}\nName: ${name}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-semibold">
          Your name
        </label>
        <input id="name" name="name" type="text" autoComplete="name" className={field} />
      </div>

      <div>
        <label htmlFor="topic" className="mb-1.5 block text-sm font-semibold">
          What is this about?
        </label>
        <select id="topic" name="topic" className={field} defaultValue={topics[0]}>
          {topics.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-semibold">
          Message
        </label>
        <textarea id="message" name="message" rows={5} className={field} />
      </div>

      {error && (
        <p role="alert" className="text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
      >
        Send on WhatsApp
      </button>
      <p className="text-sm text-muted">Opens WhatsApp with your message ready to send.</p>
    </form>
  );
}

export default ContactForm;