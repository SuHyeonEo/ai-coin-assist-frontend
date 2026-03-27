const kstFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Asia/Seoul",
});

export function formatUtcToKst(value?: string | null) {
  if (!value) return "-";

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  const parts = Object.fromEntries(
    kstFormatter
      .formatToParts(parsed)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  return `${parts.year}.${parts.month}.${parts.day}. ${parts.hour}:${parts.minute}`;
}

export function formatUtcRangeToKst(start?: string | null, end?: string | null) {
  if (!start && !end) return "-";
  if (start && end) return `${formatUtcToKst(start)} ~ ${formatUtcToKst(end)}`;

  return formatUtcToKst(start ?? end);
}
