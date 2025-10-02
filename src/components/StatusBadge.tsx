interface Props {
  status: 'completed' | 'missed' | 'cancelled' | 'pending' | string;
}
export default function StatusBadge({ status }: Props) {
  const color = {
    completed: 'bg-success text-white',
    missed: 'bg-warning text-black',
    cancelled: 'bg-danger text-white',
    pending: 'bg-primary text-white'
  }[status] ?? 'bg-muted text-white';
  return <span className={`${color} px-2 py-1 rounded-full text-xs`}>{status}</span>;
}
