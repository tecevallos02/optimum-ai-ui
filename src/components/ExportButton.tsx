interface ExportButtonProps {
  onExport: () => void;
  disabled?: boolean;
}
export default function ExportButton({ onExport, disabled }: ExportButtonProps) {
  return (
    <button
      onClick={onExport}
      disabled={disabled}
      className="bg-accent text-white px-4 py-2 rounded-full shadow hover:shadow-lg disabled:opacity-50"
    >
      Export CSV
    </button>
  );
}
