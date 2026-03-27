import { formatDisplayText } from "@/lib/format/report-labels";

export function localizeReportStrings<T>(value: T): T {
  if (value == null) {
    return value;
  }

  if (typeof value === "string") {
    if (/^https?:\/\//i.test(value)) {
      return value;
    }

    return formatDisplayText(value) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => localizeReportStrings(item)) as T;
  }

  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, nested]) => [key, localizeReportStrings(nested)]),
    ) as T;
  }

  return value;
}
