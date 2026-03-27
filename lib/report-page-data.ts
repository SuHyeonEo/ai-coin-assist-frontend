import { getLatestReportDetail, getLatestReportSummary } from "@/lib/report-api";
import { localizeReportStrings } from "@/lib/report-localization";
import type { ReportDetailResponse, ReportType } from "@/lib/report-types";

export function normalizeReportType(value?: string): ReportType {
  if (value === "MID_TERM" || value === "LONG_TERM") {
    return value;
  }

  return "SHORT_TERM";
}

export async function getLatestReportPageData(
  symbol: string,
  reportType: ReportType,
): Promise<ReportDetailResponse> {
  const [detail, summary] = await Promise.all([
    getLatestReportDetail(symbol, reportType),
    getLatestReportSummary(symbol, reportType),
  ]);

  return localizeReportStrings({
    ...detail,
    page: {
      ...detail.page,
      hero: detail.page?.hero ?? summary.hero ?? {
        marketRegime: null,
        oneLineTake: null,
        primaryDriver: null,
        riskDriver: null,
      },
      marketParticipation: detail.page?.marketParticipation ?? summary.marketParticipation ?? null,
      snapshot: detail.page?.snapshot ?? summary.snapshot,
      marketStructureBox: detail.page?.marketStructureBox ?? summary.marketStructureBox ?? null,
      sourceMeta: detail.page?.sourceMeta ?? summary.sourceMeta,
    },
  });
}
