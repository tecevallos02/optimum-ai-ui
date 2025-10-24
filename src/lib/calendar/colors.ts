// Calendar color system for status and source coding
export const STATUS_COLORS = {
  scheduled: {
    bg: "bg-blue-100",
    text: "text-blue-800",
    border: "border-blue-200",
    dot: "bg-blue-500",
    hover: "hover:bg-blue-200",
  },
  confirmed: {
    bg: "bg-green-100",
    text: "text-green-800",
    border: "border-green-200",
    dot: "bg-green-500",
    hover: "hover:bg-green-200",
  },
  completed: {
    bg: "bg-gray-100",
    text: "text-gray-800",
    border: "border-gray-200",
    dot: "bg-gray-500",
    hover: "hover:bg-gray-200",
  },
  canceled: {
    bg: "bg-red-100",
    text: "text-red-800",
    border: "border-red-200",
    dot: "bg-red-500",
    hover: "hover:bg-red-200",
  },
  no_show: {
    bg: "bg-orange-100",
    text: "text-orange-800",
    border: "border-orange-200",
    dot: "bg-orange-500",
    hover: "hover:bg-orange-200",
  },
} as const;

export const SOURCE_COLORS = {
  web: {
    bg: "bg-purple-100",
    text: "text-purple-800",
    icon: "🌐",
  },
  phone: {
    bg: "bg-indigo-100",
    text: "text-indigo-800",
    icon: "📞",
  },
  agent: {
    bg: "bg-cyan-100",
    text: "text-cyan-800",
    icon: "👤",
  },
  imported: {
    bg: "bg-slate-100",
    text: "text-slate-800",
    icon: "📥",
  },
  AI_RECEPTIONIST: {
    bg: "bg-emerald-100",
    text: "text-emerald-800",
    icon: "🤖",
  },
} as const;

export const getStatusColor = (status: keyof typeof STATUS_COLORS) => {
  return STATUS_COLORS[status] || STATUS_COLORS.scheduled;
};

export const getSourceColor = (source: keyof typeof SOURCE_COLORS) => {
  return SOURCE_COLORS[source] || SOURCE_COLORS.agent;
};

export const LEGEND_ITEMS = [
  {
    type: "status",
    key: "scheduled",
    label: "Scheduled",
    color: STATUS_COLORS.scheduled,
  },
  {
    type: "status",
    key: "confirmed",
    label: "Confirmed",
    color: STATUS_COLORS.confirmed,
  },
  {
    type: "status",
    key: "completed",
    label: "Completed",
    color: STATUS_COLORS.completed,
  },
  {
    type: "status",
    key: "canceled",
    label: "Canceled",
    color: STATUS_COLORS.canceled,
  },
  {
    type: "status",
    key: "no_show",
    label: "No Show",
    color: STATUS_COLORS.no_show,
  },
  { type: "source", key: "web", label: "Web", color: SOURCE_COLORS.web },
  { type: "source", key: "phone", label: "Phone", color: SOURCE_COLORS.phone },
  { type: "source", key: "agent", label: "Agent", color: SOURCE_COLORS.agent },
  {
    type: "source",
    key: "imported",
    label: "Imported",
    color: SOURCE_COLORS.imported,
  },
  {
    type: "source",
    key: "AI_RECEPTIONIST",
    label: "AI Receptionist",
    color: SOURCE_COLORS.AI_RECEPTIONIST,
  },
] as const;
