import { ReportDetailPage } from "@/components/report/report-detail-page";
import { ReportLoadError } from "@/components/report/report-load-error";
import { getLatestReportPageData, normalizeReportType } from "@/lib/report-page-data";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ symbol?: string; reportType?: string }>;
}) {
  const resolved = await searchParams;
  const symbol = resolved.symbol?.toUpperCase() ?? "BTCUSDT";
  const reportType = normalizeReportType(resolved.reportType);
  let report;

  try {
    report = await getLatestReportPageData(symbol, reportType);
  } catch (error) {
    return <ReportLoadError title="리포트를 불러올 수 없습니다" error={error} />;
  }

  return <ReportDetailPage report={report} reportId={String(report.meta.reportId)} />;
}
