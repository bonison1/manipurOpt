export const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

export const formatDate = (iso: string | null | undefined) =>
  iso
    ? new Date(iso).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Asia/Kolkata',
      })
    : '—';