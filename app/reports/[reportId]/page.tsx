import { ReportDetailPage } from "@/components/report/report-detail-page";
import { ReportLoadError } from "@/components/report/report-load-error";
import { getReportDetail } from "@/lib/report-api";
import { localizeReportStrings } from "@/lib/report-localization";

export default async function ReportDetailRoute({
  params,
}: {
  params: Promise<{ reportId: string }>;
}) {
  const { reportId } = await params;
  let report;

  try {
    report = localizeReportStrings(await getReportDetail(reportId));
  } catch (error) {
    return <ReportLoadError title={`리포트 #${reportId}를 불러올 수 없습니다`} error={error} />;
  }

  return <ReportDetailPage report={report} reportId={reportId} />;
}
