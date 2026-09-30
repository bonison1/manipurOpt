const styles: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-800',
  paid: 'bg-emerald-100 text-emerald-800',
  unpaid: 'bg-slate-100 text-slate-700',
};

const defaultLabels: Record<string, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  paid: 'Paid',
  unpaid: 'Unpaid',
};

export default function StatusBadge({ value, label }: { value: string; label?: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        styles[value] ?? 'bg-slate-100 text-slate-700'
      }`}
    >
      {label ?? defaultLabels[value] ?? value}
    </span>
  );
}