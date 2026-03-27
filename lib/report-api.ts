import type { ReportDetailResponse, ReportSummaryResponse, ReportType } from "@/lib/report-types";

const apiBaseUrlCandidates = Array.from(
  new Set(
    [
      process.env.AICA_SERVER_BASE_URL,
      process.env.NEXT_PUBLIC_SERVER_BASE_URL,
      process.env.AICA_API_BASE_URL,
      process.env.NEXT_PUBLIC_API_BASE_URL,
      "http://localhost:8082",
    ].filter((value): value is string => Boolean(value)),
  ),
);

export function getApiBaseUrlCandidates() {
  return [...apiBaseUrlCandidates];
}

async function requestJson<T>(path: string): Promise<T> {
  const errors: string[] = [];

  for (const baseUrl of apiBaseUrlCandidates) {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        headers: {
          Accept: "application/json",
        },
        next: {
          revalidate: 60,
        },
      });

      if (!response.ok) {
        errors.push(`${baseUrl}${path} -> ${response.status}`);
        continue;
      }

      return (await response.json()) as T;
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown error";
      errors.push(`${baseUrl}${path} -> ${message}`);
    }
  }

  throw new Error(`Failed to fetch ${path}. ${errors.join(" | ")}`);
}

export async function getLatestReportDetail(
  symbol: string,
  reportType: ReportType,
): Promise<ReportDetailResponse> {
  const params = new URLSearchParams({
    symbol,
    reportType,
  });

  return requestJson<ReportDetailResponse>(`/api/reports/latest/detail?${params.toString()}`);
}

export async function getLatestReportSummary(
  symbol: string,
  reportType: ReportType,
): Promise<ReportSummaryResponse> {
  const params = new URLSearchParams({
    symbol,
    reportType,
  });

  return requestJson<ReportSummaryResponse>(`/api/reports/latest/summary?${params.toString()}`);
}

export async function getReportDetail(reportId: string): Promise<ReportDetailResponse> {
  return requestJson<ReportDetailResponse>(`/api/reports/${encodeURIComponent(reportId)}`);
}
