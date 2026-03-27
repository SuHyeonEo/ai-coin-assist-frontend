import { MarketAssetPrototypePage } from "@/components/prototype/market-asset-prototype";
import { getLatestReportPageData, normalizeReportType } from "@/lib/report-page-data";

export default async function MarketAssetPrototypeRoute({
  searchParams,
}: {
  searchParams: Promise<{ symbol?: string; reportType?: string }>;
}) {
  const resolved = await searchParams;
  const symbol = resolved.symbol?.toUpperCase() ?? "BTCUSDT";
  const reportType = normalizeReportType(resolved.reportType);
  const report = await getLatestReportPageData(symbol, reportType);

  return <MarketAssetPrototypePage report={report} />;
}
