import type { ReactNode } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { InfoPopover } from "@/components/ui/info-popover";
import { formatUtcRangeToKst, formatUtcToKst } from "@/lib/format/date-time";
import {
  formatConfidence,
  formatDisplayText,
  formatDomain,
  formatDomainStatus,
  formatFearGreedClassification,
  formatInteractionType,
  formatOutlook,
  formatRangePositionLabel,
  formatReportType,
  formatScenarioType,
  formatSignalCategory,
  formatSourceType,
  formatTrendLabel,
  formatWindowType,
  formatVolatilityLabel,
  formatZoneType,
} from "@/lib/format/report-labels";
import {
  getConfidenceHelp,
  getMetricHelp,
  getDomainHelp,
  getFearGreedHelp,
  getOutlookHelp,
  getReportScheduleHelp,
  getSectionHelp,
  getSignalCategoryHelp,
  getStructureHelp,
} from "@/lib/format/report-help";
import type {
  DomainCardView,
  LevelSummaryView,
  MarketParticipationSummary,
  MarketStructureBox,
  PriceZoneView,
  ReferenceNewsItem,
  ReportDetailResponse,
  ReportSnapshot,
  ReportType,
  ScenarioView,
  ValueLabelBasis,
} from "@/lib/report-types";
import styles from "./report-detail-page.module.css";

const toneClass: Record<string, string> = {
  BULLISH: styles.badgeBullish,
  CONSTRUCTIVE: styles.badgeBullish,
  BEARISH: styles.badgeBearish,
  DEFENSIVE: styles.badgeBearish,
  NEUTRAL: styles.badgeNeutral,
  MIXED: styles.badgeMixed,
  BASE: styles.badgeNeutral,
  UNKNOWN: styles.badgeOutline,
};

const domainMeta: Record<string, { label: string; icon: string; tagline: string }> = {
  MARKET: { label: "시장 구조", icon: "M", tagline: "추세 · 레인지 · 모멘텀" },
  DERIVATIVE: { label: "파생 흐름", icon: "D", tagline: "OI · 펀딩 · 베이시스" },
  MACRO: { label: "매크로", icon: "M", tagline: "달러 · 금리 · 환율" },
  SENTIMENT: { label: "심리", icon: "S", tagline: "공포 · 위험 선호" },
  ONCHAIN: { label: "온체인", icon: "O", tagline: "참여 · 흐름 · 활동" },
  LEVEL: { label: "가격 레벨", icon: "L", tagline: "지지 · 저항 · 구조 기준" },
};

const reportTypeOptions: ReportType[] = ["SHORT_TERM", "MID_TERM", "LONG_TERM"];

function code(symbol: string) {
  return symbol.replace("USDT", "");
}

function badge(value?: string | null) {
  return toneClass[value ?? "UNKNOWN"] ?? styles.badgeOutline;
}

function kst(value?: string | null) {
  return formatUtcToKst(value);
}

function kstWithSuffix(value?: string | null) {
  const formatted = kst(value);
  return formatted === "-" ? "-" : `${formatted} KST`;
}

function money(value?: number | string | null) {
  if (value == null) return "-";
  const parsed = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(parsed)) return String(value);

  const truncated = truncateNumber(parsed, 2);

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(truncated);
}

function num(value?: number | null, digits = 2) {
  if (value == null) return "-";
  const safeDigits = Math.max(0, Math.min(digits, 2));
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: safeDigits,
  }).format(truncateNumber(value, safeDigits));
}

function pct(value?: number | null, digits = 2) {
  if (value == null) return "-";
  const safeDigits = Math.max(0, Math.min(digits, 2));
  const truncated = truncateNumber(value, safeDigits);
  return `${truncated > 0 ? "+" : ""}${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: safeDigits,
  }).format(truncated)}%`;
}

function ratioPct(value?: number | null, digits = 2) {
  if (value == null) return "-";
  const ratio = value <= 1 && value >= -1 ? value * 100 : value;
  const safeDigits = Math.max(0, Math.min(digits, 2));
  return `${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: safeDigits,
  }).format(truncateNumber(ratio, safeDigits))}%`;
}

function truncateNumber(value: number, digits = 2) {
  const factor = 10 ** Math.max(0, digits);
  return Math.trunc(value * factor) / factor;
}

function deltaTone(value?: number | null) {
  if (value == null) return styles.deltaNeutral;
  if (value > 0) return styles.deltaPositive;
  if (value < 0) return styles.deltaNegative;
  return styles.deltaNeutral;
}

function parsePercentLabel(value?: string | null) {
  if (!value) return null;
  const parsed = Number.parseFloat(value.replace("%", ""));
  return Number.isFinite(parsed) ? Math.max(0, Math.min(parsed, 100)) : null;
}

function TextWithInfo({
  text,
  description,
}: {
  text: string;
  description?: string | null;
}) {
  return (
    <span className={styles.inlineWithInfo}>
      <span>{text}</span>
      {description ? <InfoPopover description={description} /> : null}
    </span>
  );
}

function HighlightedText({ text }: { text: string }) {
  return <>{formatDisplayText(text)}</>;
}

function SectionHeader({ title, hint, description }: { title: string; hint?: string; description?: string | null }) {
  return (
    <div className={styles.sectionHeader}>
      <div className={styles.sectionTitle}>
        <TextWithInfo text={title} description={description} />
      </div>
      <div className={styles.sectionRule} />
      {hint ? <div className={styles.sectionHint}>{hint}</div> : null}
    </div>
  );
}

function MetricCard({
  label,
  value,
  accent,
  meta,
  description,
}: {
  label: string;
  value: string;
  accent: string;
  meta: ReactNode;
  description?: string | null;
}) {
  return (
    <article className={styles.kpiCard}>
      <div className={styles.kpiAccent} style={{ background: accent }} />
      <div className={styles.kpiLabel}>
        <TextWithInfo text={label} description={description} />
      </div>
      <div className={styles.kpiValue}>{value}</div>
      <div className={styles.kpiMeta}>{meta}</div>
    </article>
  );
}

function FactList({ title, items, tone }: { title: string; items: string[]; tone: "bull" | "bear" }) {
  if (items.length === 0) return null;
  const visibleItems = items.slice(0, 6);
  const hiddenItems = items.slice(6);
  const hiddenCount = Math.max(0, items.length - visibleItems.length);

  return (
    <div className={styles.factorCard}>
      <div className={`${styles.factorTitle} ${tone === "bull" ? styles.factorBull : styles.factorBear}`}>{title}</div>
      <div className={styles.factorList}>
        {visibleItems.map((item) => (
          <div key={item} className={styles.factorItem}>
            <span className={tone === "bull" ? styles.dotBull : styles.dotBear} />
            <span><HighlightedText text={item} /></span>
          </div>
        ))}
        {hiddenCount > 0 ? (
          <details className={styles.expandableBlock}>
            <summary className={styles.expandableSummary}>+ {hiddenCount}개 항목 더 보기</summary>
            <div className={styles.expandableContent}>
              {hiddenItems.map((item) => (
                <div key={`${title}-hidden-${item}`} className={styles.factorItem}>
                  <span className={tone === "bull" ? styles.dotBull : styles.dotBear} />
                  <span><HighlightedText text={item} /></span>
                </div>
              ))}
            </div>
          </details>
        ) : null}
      </div>
    </div>
  );
}

function ReadableFactList({
  title,
  items,
  limit = 3,
}: {
  title: string;
  items: string[];
  limit?: number;
}) {
  if (items.length === 0) return null;

  const visibleItems = items.slice(0, limit);
  const hiddenItems = items.slice(limit);
  const hiddenCount = Math.max(0, items.length - visibleItems.length);

  return (
    <div className={styles.detailFactBlock}>
      <div className={styles.detailFactTitle}>{title}</div>
      <div className={styles.detailFactList}>
        {visibleItems.map((item, index) => (
          <div key={`${title}-${index}-${item}`} className={styles.detailFactItem}>
            {normalizeFactText(item)}
          </div>
        ))}
        {hiddenCount > 0 ? (
          <details className={styles.expandableBlock}>
            <summary className={styles.expandableSummary}>+ {hiddenCount}개 항목 더 보기</summary>
            <div className={styles.expandableContent}>
              {hiddenItems.map((item, index) => (
                <div key={`${title}-hidden-${index}-${item}`} className={styles.detailFactItem}>
                  {normalizeFactText(item)}
                </div>
              ))}
            </div>
          </details>
        ) : null}
      </div>
    </div>
  );
}

function DomainCard({ item }: { item: DomainCardView }) {
  const meta = domainMeta[item.domain ?? ""] ?? { label: formatDomain(item.domain), icon: "•", tagline: "Structured reading" };
  const domainLabel = formatDomain(item.domain);
  const domainHelp = getDomainHelp(item.domain);
  const statusLabel = formatDomainStatus(item.status);

  return (
    <article className={styles.domainCard}>
      <div className={styles.domainHeader}>
        <div className={styles.domainIdentity}>
          <div className={styles.domainIcon}>{meta.icon}</div>
          <div>
            <div className={styles.domainName}><TextWithInfo text={domainLabel ?? meta.label} description={domainHelp} /></div>
            <div className={styles.domainTagline}>{meta.tagline}</div>
          </div>
        </div>
        <span className={`${styles.badge} ${badge(item.status)}`}>{statusLabel}</span>
      </div>
      <div className={styles.domainBody}>
        {item.interpretation ? <div className={styles.domainSummary}><HighlightedText text={item.interpretation} /></div> : null}
        {item.watchPoint ? (
          <>
            <div className={styles.domainBlockTitle}>Watch Point</div>
            <div className={styles.domainText}><HighlightedText text={item.watchPoint} /></div>
          </>
        ) : null}
      </div>
    </article>
  );
}

function ZoneItem({ item, title, titleDescription }: { item: PriceZoneView; title: string; titleDescription?: string | null }) {
  return (
    <article className={styles.zoneItem}>
      <div className={styles.zoneTop}>
        <div>
          <div className={styles.zoneLabel}>
            <TextWithInfo text={title} description={titleDescription} />
          </div>
          <div className={styles.zoneMeta}>
            {item.zoneType ? <span>{formatZoneType(item.zoneType)}</span> : null}
            {item.zoneRank != null ? <span>Rank {item.zoneRank}</span> : null}
            {item.interactionType ? <span>{formatInteractionType(item.interactionType)}</span> : null}
          </div>
        </div>
        <div className={styles.monoValue}>{money(item.representativePrice)}</div>
      </div>
      <div className={styles.zoneMeta}>
        <span>{money(item.zoneLow)} - {money(item.zoneHigh)}</span>
        {item.distanceToZone != null ? <span>진입 거리 {ratioPct(item.distanceToZone)}</span> : null}
        {item.strengthScore != null ? <span>강도 {ratioPct(item.strengthScore)}</span> : null}
      </div>
      <div className={styles.zoneSummary}>
        {item.strongestLevelLabel || item.strongestSourceType ? (
          <>
            <strong>핵심 기준:</strong> {formatDisplayText(item.strongestLevelLabel) ?? "-"} / {formatSourceType(item.strongestSourceType)}
            <br />
          </>
        ) : null}
        {item.levelCount != null ? <>레벨 수 {item.levelCount}</> : null}
        {item.recentTestCount != null ? <> · 테스트 {item.recentTestCount}회</> : null}
        {item.recentRejectionCount != null ? <> · 거부 {item.recentRejectionCount}회</> : null}
        {item.recentBreakCount != null ? <> · 이탈 {item.recentBreakCount}회</> : null}
      </div>
      <ReadableFactList title="관찰 포인트" items={item.triggerFacts} limit={2} />
    </article>
  );
}

function StructureZoneCard({
  tone,
  title,
  reference,
  riskTitle,
  risk,
  titleDescription,
  riskDescription,
}: {
  tone: "warm" | "cool";
  title: string;
  reference: ValueLabelBasis | null | undefined;
  riskTitle: string;
  risk: ValueLabelBasis | null | undefined;
  titleDescription?: string | null;
  riskDescription?: string | null;
}) {
  const toneClass = tone === "warm" ? styles.structureWarm : styles.structureCool;
  const riskPercent = parsePercentLabel(risk?.value);

  return (
    <article className={`${styles.structureZoneCard} ${toneClass}`}>
      <div className={styles.structureZoneEyebrow}>
        <TextWithInfo text={title} description={titleDescription} />
      </div>
      <div className={styles.structureZonePrice}>{reference?.value ?? "-"}</div>
      {reference?.label ? <div className={styles.structureZoneCaption}>{reference.label}</div> : null}
      {reference?.basis ? <div className={styles.structureZoneBasis}>{formatDisplayText(reference.basis)}</div> : null}

      <div className={styles.structureZoneDivider} />

      <div className={styles.structureRiskLabel}>
        <TextWithInfo text={riskTitle} description={riskDescription} />
      </div>
      <div className={styles.structureRiskValue}>{risk?.value ?? "-"}</div>
      <div className={styles.structureRiskTrack}>
        {riskPercent != null ? (
          <div className={styles.structureRiskFill} style={{ width: `${riskPercent}%` }} />
        ) : null}
      </div>
      {risk?.basis ? <div className={styles.structureZoneBasis}>{formatDisplayText(risk.basis)}</div> : null}
    </article>
  );
}

function ScenarioCard({ item }: { item: ScenarioView }) {
  const scenarioTypeLabel = formatScenarioType(item.scenarioType);

  return (
    <article className={styles.scenarioCard}>
      <div className={styles.scenarioTop}>
        <div>
          <div className={styles.scenarioPrefix}>{scenarioTypeLabel}</div>
          <div className={styles.scenarioName}>{item.title ? <HighlightedText text={item.title} /> : "Untitled scenario"}</div>
        </div>
        <span className={`${styles.badge} ${badge(item.scenarioType)}`}>{scenarioTypeLabel}</span>
      </div>
      <div className={styles.scenarioRows}>
        {[
          ["Condition", item.condition ?? "-"],
          ["Trigger", item.trigger ?? "-"],
          ["Confirmation", item.confirmation ?? "-"],
          ["Invalidation", item.invalidation ?? "-"],
          ["Interpretation", item.interpretation ?? "-"],
        ].map(([key, value]) => (
          <div key={key} className={styles.scenarioRow}>
            <div className={styles.scenarioKey}>{key}</div>
            <div className={styles.scenarioValue}>{value === "-" ? value : <HighlightedText text={value} />}</div>
          </div>
        ))}
      </div>
    </article>
  );
}

function NewsCard({ item, index }: { item: ReferenceNewsItem; index: number }) {
  return (
    <article className={styles.newsItem}>
      <div className={styles.newsNumber}>{String(index + 1).padStart(2, "0")}</div>
      <div className={styles.levelItem}>
        <div className={styles.newsTop}>
          <div>
            <div className={styles.newsTitle}>{item.url ? <a href={item.url} target="_blank" rel="noreferrer">{formatDisplayText(item.title)}</a> : formatDisplayText(item.title)}</div>
            <div className={styles.newsMeta}>
              <span>{formatDisplayText(item.source ?? "Unknown source")}</span>
              <span>{kstWithSuffix(item.publishedAt)}</span>
              <span>{formatDisplayText(item.relatedDomain ?? "GENERAL")}</span>
            </div>
          </div>
          <span className={`${styles.badge} ${styles.badgeOutline}`}>Reference</span>
        </div>
        {item.whyItMatters ? <div className={styles.newsReason}><strong>Why it matters:</strong> {item.whyItMatters}</div> : null}
      </div>
    </article>
  );
}

function heroTitle(report: ReportDetailResponse) {
  const hero = report.page?.hero ?? (report as ReportDetailResponse & { hero?: ReportDetailResponse["page"]["hero"] }).hero;
  const candidate = hero?.marketRegime ?? report.header.overallTone ?? report.header.headline;

  if (candidate && /^[A-Z_]+$/.test(candidate)) {
    return formatOutlook(candidate);
  }

  return candidate ?? "Latest reading";
}

function heroSummary(report: ReportDetailResponse) {
  const hero = report.page?.hero ?? (report as ReportDetailResponse & { hero?: ReportDetailResponse["page"]["hero"] }).hero;
  return hero?.oneLineTake ?? report.header.narrativeSummary ?? report.header.primaryMessage ?? "-";
}

function heroPriceSummary(symbol: string, snapshot: ReportSnapshot) {
  if (snapshot.currentPrice == null) {
    return <>현재 <span className={styles.leadSymbol}>{symbol}</span>의 가격 정보가 아직 반영되지 않았습니다.</>;
  }

  if (snapshot.dailyPriceChangeRate == null) {
    return <>현재 <span className={styles.leadSymbol}>{symbol}</span>의 가격은 {money(snapshot.currentPrice)}입니다.</>;
  }

  if (snapshot.dailyPriceChangeRate > 0) {
    return (
      <>
        현재 <span className={styles.leadSymbol}>{symbol}</span>의 가격은 전일 대비{" "}
        <span className={styles.keywordBull}>{pct(snapshot.dailyPriceChangeRate)}</span> 상승한{" "}
        <span className={styles.keywordBull}>{money(snapshot.currentPrice)}</span>입니다.
      </>
    );
  }

  if (snapshot.dailyPriceChangeRate < 0) {
    return (
      <>
        현재 <span className={styles.leadSymbol}>{symbol}</span>의 가격은 전일 대비{" "}
        <span className={styles.keywordBear}>{pct(snapshot.dailyPriceChangeRate)}</span> 하락한{" "}
        <span className={styles.keywordBear}>{money(snapshot.currentPrice)}</span>입니다.
      </>
    );
  }

  return <>현재 <span className={styles.leadSymbol}>{symbol}</span>의 가격은 전일과 같은 {money(snapshot.currentPrice)}입니다.</>;
}

function normalizeText(value?: string | null) {
  return value?.replace(/\s+/g, " ").trim() ?? "";
}

function normalizeFactText(value?: string | null) {
  return formatDisplayText(value)?.replace(/\s+/g, " ").replace(/\s*,\s*/g, ", ").trim() ?? "-";
}

function hasSnapshotData(snapshot: ReportSnapshot) {
  return Boolean(
    snapshot.currentPrice != null ||
    snapshot.rsi14.value != null ||
    snapshot.macdHistogram.value != null ||
    snapshot.fearGreed.indexValue != null ||
    snapshot.range7d.high != null ||
    snapshot.macro.dxyProxyValue != null ||
    snapshot.macro.usdKrwValue != null,
  );
}

function hasMarketParticipationData(participation: MarketParticipationSummary | null | undefined) {
  return Boolean(
    participation &&
    (
      participation.summary ||
      participation.representativeWindowLabel ||
      participation.quoteVolumeChangeRate != null ||
      participation.tradeCountChangeRate != null ||
      participation.takerBuyQuoteRatio != null ||
      participation.highlights.length > 0 ||
      participation.facts.length > 0 ||
      participation.summaries.length > 0
    ),
  );
}

function hasMarketStructure(box: MarketStructureBox | null | undefined) {
  return Boolean(
    box &&
    (
      box.rangeLow ||
      box.currentPrice ||
      box.rangeHigh ||
      box.rangePosition?.value ||
      box.upsideReference?.value ||
      box.downsideReference?.value ||
      box.supportBreakRisk?.value ||
      box.resistanceBreakRisk?.value ||
      box.interpretation
    ),
  );
}

function hasCrossSignalData(signal: NonNullable<ReportDetailResponse["page"]["crossSignal"]>) {
  return Boolean(
    signal.alignmentSummary ||
    signal.conflictSummary ||
    signal.positioningTake ||
    signal.dominantDrivers.length > 0,
  );
}

function hasLevelsData(levels: LevelSummaryView | null | undefined) {
  return Boolean(
    levels &&
    (
      levels.nearestSupportZone ||
      levels.nearestResistanceZone
    ),
  );
}

function extractWindowLabel(windowType?: string | null, basis?: string | null) {
  if (windowType) {
    return formatWindowType(windowType).replace(/^최근\s*/, "");
  }

  if (!basis) return null;

  const rawMatch = basis.match(/\bLAST_(?:1|3|7|14|30|90|180)D\b|\bLAST_52W\b/);
  if (rawMatch) {
    return formatWindowType(rawMatch[0]);
  }

  const localizedMatch = basis.match(/최근\s*(?:1|3|7|14|30|90|180)일|최근\s*52주/);
  return localizedMatch ? localizedMatch[0].replace(/\s+/g, " ").replace(/^최근\s*/, "") : null;
}

function structureRange(box: MarketStructureBox, snapshot: ReportSnapshot) {
  const structureWindowLabel = extractWindowLabel(box.rangePosition?.windowType, box.rangePosition?.basis);

  if (structureWindowLabel && (box.rangeLow || box.rangeHigh)) {
    return [
      {
        key: `structure-${structureWindowLabel}-low`,
        label: `${structureWindowLabel} 최저가`,
        value: money(box.rangeLow),
      },
      {
        key: `structure-${structureWindowLabel}-high`,
        label: `${structureWindowLabel} 최고가`,
        value: money(box.rangeHigh),
      },
    ];
  }

  if (snapshot.range7d.low != null || snapshot.range7d.high != null) {
    const snapshotWindowLabel = (snapshot.range7d.windowType ? formatWindowType(snapshot.range7d.windowType) : "최근 7일")
      .replace(/^최근\s*/, "");

    return [
      {
        key: `snapshot-${snapshot.range7d.windowType ?? "range"}-low`,
        label: `${snapshotWindowLabel} 최저가`,
        value: money(snapshot.range7d.low),
      },
      {
        key: `snapshot-${snapshot.range7d.windowType ?? "range"}-high`,
        label: `${snapshotWindowLabel} 최고가`,
        value: money(snapshot.range7d.high),
      },
    ];
  }

  return [
    { key: "structure-low", label: "구조 범위 최저가", value: money(box.rangeLow) },
    { key: "structure-high", label: "구조 범위 최고가", value: money(box.rangeHigh) },
  ];
}

function latestReportHref(symbol: string, reportType: ReportType) {
  const params = new URLSearchParams({
    symbol,
    reportType,
  });

  return `/?${params.toString()}`;
}

export function ReportDetailPage({ report, reportId }: { report: ReportDetailResponse; reportId?: string }) {
  const symbol = code(report.meta.symbol);
  const topLevel = report as ReportDetailResponse & {
    hero?: ReportDetailResponse["page"]["hero"];
    snapshot?: ReportDetailResponse["page"]["snapshot"];
    marketParticipation?: ReportDetailResponse["page"]["marketParticipation"];
    marketStructureBox?: ReportDetailResponse["page"]["marketStructureBox"];
    sourceMeta?: ReportDetailResponse["page"]["sourceMeta"];
  };
  const hero = report.page?.hero ?? topLevel.hero ?? { marketRegime: null, oneLineTake: null, primaryDriver: null, riskDriver: null };
  const snapshot: ReportSnapshot = report.page?.snapshot ?? topLevel.snapshot ?? {
    currentPrice: null,
    dailyPriceChangeRate: null,
    priceSourceEventTime: null,
    participationWindowLabel: null,
    quoteVolumeChangeRate: null,
    tradeCountChangeRate: null,
    takerBuyQuoteRatio: null,
    takerBuyQuoteRatioDelta: null,
    range7d: {
      windowType: null,
      windowStartTime: null,
      windowEndTime: null,
      openTime: null,
      closeTime: null,
      high: null,
      low: null,
      range: null,
      currentPositionInRange: null,
      distanceFromWindowHigh: null,
      reboundFromWindowLow: null,
    },
    rsi14: { value: null, delta: null, signalSummary: null },
    macdHistogram: { value: null, delta: null, signalSummary: null },
    fearGreed: { indexValue: null, classification: null, valueChange: null, valueChangeRate: null },
    macro: { dxyProxyValue: null, dxyChangeRate: null, us10yYieldValue: null, us10yYieldChangeRate: null, usdKrwValue: null, usdKrwChangeRate: null },
    trendLabel: null,
    volatilityLabel: null,
    rangePositionLabel: null,
  };
  const marketParticipation = report.page?.marketParticipation ?? topLevel.marketParticipation ?? null;
  const executiveConclusion = report.page?.executiveConclusion ?? {
    summary: null,
    bullishFactors: [],
    bearishFactors: [],
    tacticalView: null,
  };
  const domainCards = report.page?.domainCards ?? [];
  const structureBox = report.page?.marketStructureBox ?? topLevel.marketStructureBox ?? {
    rangeLow: null,
    currentPrice: null,
    rangeHigh: null,
    rangePosition: null,
    upsideReference: null,
    downsideReference: null,
    supportBreakRisk: null,
    resistanceBreakRisk: null,
    interpretation: null,
  };
  const crossSignal = report.page?.crossSignal ?? {
    alignmentSummary: null,
    dominantDrivers: [],
    conflictSummary: null,
    positioningTake: null,
  };
  const levels = report.page?.levels ?? {
    supportLevels: [],
    resistanceLevels: [],
    supportZones: [],
    resistanceZones: [],
    nearestSupportZone: null,
    nearestResistanceZone: null,
    zoneInteractionFacts: [],
  };
  const externalContext = report.page?.externalContext ?? null;
  const sharedContext = report.page?.sharedContext ?? null;
  const scenarios = report.page?.scenarios ?? [];
  const referenceNews = report.page?.referenceNews ?? [];
  const sourceMeta = report.page?.sourceMeta ?? topLevel.sourceMeta ?? {
    sourceDataVersion: null,
    analysisEngineVersion: null,
    llmProvider: null,
    llmModel: null,
    generationStatus: null,
    fallbackUsed: false,
    promptTemplateVersion: null,
    inputSchemaVersion: null,
    outputSchemaVersion: null,
    sharedContextId: null,
    sharedContextVersion: null,
    sharedContextUsed: false,
  };
  const outlookLabel = formatOutlook(report.header.outlook);
  const outlookHelp = getOutlookHelp(report.header.outlook);
  const confidenceLabel = formatConfidence(report.header.confidence);
  const confidenceHelp = getConfidenceHelp(report.header.confidence);
  const reportScheduleHelp = getReportScheduleHelp(report.meta.reportType);
  const summaryText = heroSummary(report);
  const priceSummaryText = heroPriceSummary(report.meta.symbol, snapshot);
  const priceReferenceTime = report.meta.priceSourceEventTime ?? snapshot.priceSourceEventTime ?? marketParticipation?.priceSourceEventTime ?? null;
  const heroHighlights = [
    sharedContext?.sharedSummary && normalizeText(sharedContext.sharedSummary) !== normalizeText(summaryText)
      ? { label: "공통 배경", help: null, title: null, detail: sharedContext.sharedSummary }
      : null,
    hero.primaryDriver && normalizeText(hero.primaryDriver) !== normalizeText(summaryText)
      ? { label: "핵심 요인", help: null, title: null, detail: hero.primaryDriver }
      : null,
    hero.riskDriver
      ? { label: "리스크 요인", help: null, title: null, detail: hero.riskDriver }
      : null,
    externalContext?.primarySignalDetail
      ? { label: "외부 레짐", help: null, title: externalContext.primarySignalTitle, detail: externalContext.primarySignalDetail }
      : null,
    ...report.header.signalHeadlines.slice(0, 2).map((item) => ({
      label: formatSignalCategory(item.category),
      help: getSignalCategoryHelp(item.category),
      title: item.title,
      detail: item.detail,
    })),
  ].filter((item): item is NonNullable<typeof item> => Boolean(item)).filter((item) => Boolean(item.detail));
  const showSnapshot = hasSnapshotData(snapshot);
  const showMarketParticipation = hasMarketParticipationData(marketParticipation);
  const showLevels = hasLevelsData(levels);
  const showMarketStructure = hasMarketStructure(structureBox);
  const showStructureSection = showMarketStructure || showLevels;
  const showCrossSignal = hasCrossSignalData(crossSignal);

  return (
    <div className={styles.shell}>
      <header className={styles.navbar}>
        <div className={styles.navInner}>
          <div className={styles.brand}>
            <div className={styles.brandMark}>A</div>
            <div className={styles.brandText}>
              <div className={styles.brandTitle}>AI Coin Assist</div>
              <div className={styles.brandSub}>Report reading interface</div>
            </div>
          </div>
          <div className={styles.navRight}>
              <div className={styles.breadcrumb}>
              <span>Dashboard</span><span>/</span><span>{symbol}</span><span>/</span><span>{formatReportType(report.meta.reportType)}</span>{reportId ? <><span>/</span><span>#{reportId}</span></> : null}
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroTop}>
            <div className={styles.assetBlock}>
              <div className={styles.assetAvatar}>{symbol.slice(0, 3)}</div>
              <div>
                <div className={styles.assetName}>{symbol}</div>
                <div className={styles.assetSymbol}>{report.meta.symbol}</div>
              </div>
            </div>
            <div className={styles.metaStack}>
              <div className={styles.badgeRow}>
                <details className={styles.reportTypeSwitcher}>
                  <summary className={`${styles.badge} ${styles.badgeAccent} ${styles.reportTypeTrigger}`}>
                    <TextWithInfo text={formatReportType(report.meta.reportType)} description={reportScheduleHelp} />
                    <span className={styles.reportTypeChevron}>▾</span>
                  </summary>
                  <div className={styles.reportTypeMenu}>
                    {reportTypeOptions.map((option) => {
                      const active = option === report.meta.reportType;

                      return (
                        <Link
                          key={option}
                          href={latestReportHref(report.meta.symbol, option)}
                          className={`${styles.reportTypeOption} ${active ? styles.reportTypeOptionActive : ""}`}
                        >
                          <span>{formatReportType(option)}</span>
                          <span className={styles.reportTypeOptionMeta}>{active ? "현재" : "최신 리포트"}</span>
                        </Link>
                      );
                    })}
                  </div>
                </details>
                <span className={`${styles.badge} ${badge(report.header.outlook)}`}><TextWithInfo text={outlookLabel} description={outlookHelp} /></span>
                <span className={`${styles.badge} ${styles.badgeOutline}`}><TextWithInfo text={`신뢰도 ${confidenceLabel}`} description={confidenceHelp} /></span>
              </div>
              <div className={styles.timestamp}>
                <div className={styles.timestampItem}>
                  <span className={styles.timestampLabel}>분석 기준 시각</span>
                  <span className={styles.timestampValue}>
                    <span>{kstWithSuffix(report.meta.analysisBasisTime)}</span>
                  </span>
                </div>
                <div className={styles.timestampItem}>
                  <span className={styles.timestampLabel}>현재가 기준 시각</span>
                  <span className={styles.timestampValue}>
                    <span>{kstWithSuffix(priceReferenceTime)}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.divider} />
          <div className={styles.heroBottom}>
            <div className={styles.heroSummary}>
              <div className={styles.eyebrow}>{report.header.headline ?? "Latest reading"}</div>
              <h1 className={styles.headline}>{heroTitle(report)}</h1>
              <p className={styles.leadSummary}>{priceSummaryText}</p>
              {priceReferenceTime ? (
                <div className={styles.leadMeta}>현재가 반영 시각 {kstWithSuffix(priceReferenceTime)}</div>
              ) : null}
              <p className={styles.summary} title={summaryText}><HighlightedText text={summaryText} /></p>
              <div className={styles.signalList}>
                {heroHighlights.map((item) => (
                  <div key={`${item.label}-${item.title}-${item.detail}`} className={styles.signalCard}>
                    <div className={styles.signalCategory}>
                      <TextWithInfo text={item.label} description={item.help} />
                    </div>
                    {item.title ? <div className={styles.signalTitle}>{formatDisplayText(item.title)}</div> : null}
                    <div className={styles.signalDetail} title={item.detail ?? undefined}>{item.detail ? <HighlightedText text={item.detail} /> : "-"}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.ctaStack}>
              <div className={styles.buttonRow}>
                <Link href="/" className={styles.buttonSecondary}>최신 리포트</Link>
              </div>
            </div>
          </div>
        </section>

        {showSnapshot ? (
          <section className={styles.section}>
            <SectionHeader title="Snapshot" description={getSectionHelp("SNAPSHOT")} />
            <div className={styles.kpiGrid}>
              <MetricCard label="Current Price" description={getMetricHelp("CURRENT_PRICE")} value={money(snapshot.currentPrice)} accent="var(--accent)" meta={<><span className={deltaTone(snapshot.dailyPriceChangeRate)}>{pct(snapshot.dailyPriceChangeRate)}</span><span>전일 대비</span></>} />
              <MetricCard label="RSI 14" description={getMetricHelp("RSI_14")} value={num(snapshot.rsi14.value, 2)} accent="var(--signal-neutral)" meta={<><span className={deltaTone(snapshot.rsi14.delta)}>RSI 변화 {num(snapshot.rsi14.delta, 2)}</span></>} />
              <MetricCard label="MACD Histogram" description={getMetricHelp("MACD_HISTOGRAM")} value={num(snapshot.macdHistogram.value, 2)} accent="var(--signal-bull)" meta={<><span className={deltaTone(snapshot.macdHistogram.delta)}>히스토그램 변화 {num(snapshot.macdHistogram.delta, 2)}</span></>} />
              <MetricCard label="Fear & Greed" description={getMetricHelp("FEAR_GREED")} value={num(snapshot.fearGreed.indexValue, 0)} accent="var(--signal-mixed)" meta={<><span><TextWithInfo text={formatFearGreedClassification(snapshot.fearGreed.classification)} description={getFearGreedHelp(snapshot.fearGreed.classification)} /></span><span>{pct(snapshot.fearGreed.valueChangeRate)}</span></>} />
              <MetricCard label={`${(snapshot.range7d.windowType ? formatWindowType(snapshot.range7d.windowType) : "7일").replace(/^최근\s*/, "")} Range`} description={getMetricHelp("RANGE_WINDOW")} value={`${money(snapshot.range7d.low)} - ${money(snapshot.range7d.high)}`} accent="var(--signal-neutral)" meta={<><span>Position {ratioPct(snapshot.range7d.currentPositionInRange)}</span><span>Rebound {ratioPct(snapshot.range7d.reboundFromWindowLow)}</span></>} />
              <MetricCard label="거래대금 변화" description={getMetricHelp("VOLUME_CHANGE")} value={pct(snapshot.quoteVolumeChangeRate)} accent="var(--signal-neutral)" meta={<><span>{snapshot.participationWindowLabel ?? "-"}</span><span>체결 수 변화 {pct(snapshot.tradeCountChangeRate)}</span></>} />
              <MetricCard label="DXY Proxy" description={getMetricHelp("DXY_PROXY")} value={num(snapshot.macro.dxyProxyValue, 3)} accent="var(--signal-bear)" meta={<><span className={deltaTone(snapshot.macro.dxyChangeRate)}>{pct(snapshot.macro.dxyChangeRate)}</span><span>US10Y {num(snapshot.macro.us10yYieldValue, 2)}</span></>} />
              <MetricCard label="Trend" description={getMetricHelp("TREND")} value={formatTrendLabel(snapshot.trendLabel)} accent="var(--accent)" meta={<><span>{formatVolatilityLabel(snapshot.volatilityLabel)}</span><span>{formatRangePositionLabel(snapshot.rangePositionLabel)}</span></>} />
              <MetricCard label="USD/KRW" description={getMetricHelp("USD_KRW")} value={num(snapshot.macro.usdKrwValue, 2)} accent="var(--signal-mixed)" meta={<><span className={deltaTone(snapshot.macro.usdKrwChangeRate)}>{pct(snapshot.macro.usdKrwChangeRate)}</span><span>FX pressure</span></>} />
            </div>
          </section>
        ) : null}

        {showMarketParticipation ? (
          <section className={styles.section}>
            <SectionHeader
              title="Market Participation"
              hint="최근 대표 구간 vs 직전 동일 구간"
              description={getSectionHelp("MARKET_PARTICIPATION")}
            />
            <div className={styles.featureGrid}>
              <article className={styles.execCard}>
                <div className={styles.execHeader}>
                  <div className={styles.execIcon}>MP</div>
                  <div>
                    <div className={styles.execTitle}>{marketParticipation?.title ?? "시장 참여도"}</div>
                    <div className={styles.execSubtitle}>
                      {marketParticipation?.representativeWindowLabel
                        ? `${formatDisplayText(marketParticipation.representativeWindowLabel)} 기준 비교`
                        : "대표 참여 구간 기준 비교"}
                    </div>
                  </div>
                </div>
                <div className={styles.execBody}>
                  <div className={styles.quote}>
                    {marketParticipation?.summary ? <HighlightedText text={marketParticipation.summary} /> : "-"}
                  </div>
                  <div className={styles.sourceMetaGrid}>
                    <article className={styles.metaCard}>
                      <div className={styles.metaLabel}>
                        <TextWithInfo text="대표 비교 구간" description={getMetricHelp("PARTICIPATION_WINDOW")} />
                      </div>
                      <div className={styles.metaValue}>
                        {marketParticipation?.representativeWindowLabel
                          ? formatDisplayText(marketParticipation.representativeWindowLabel)
                          : snapshot.participationWindowLabel ?? "-"}
                        <br />
                        현재 구간 {formatUtcRangeToKst(marketParticipation?.currentWindowStartTime, marketParticipation?.currentWindowEndTime)}
                        <br />
                        직전 구간 {formatUtcRangeToKst(marketParticipation?.previousWindowStartTime, marketParticipation?.previousWindowEndTime)}
                        {marketParticipation?.sampleCount != null ? (
                          <>
                            <br />
                            샘플 수 {num(marketParticipation.sampleCount, 0)}
                          </>
                        ) : null}
                      </div>
                    </article>
                    <article className={styles.metaCard}>
                      <div className={styles.metaLabel}>
                        <TextWithInfo text="참여 변화" description={getMetricHelp("VOLUME_CHANGE")} />
                      </div>
                      <div className={styles.metaValue}>
                        가격 변화 {pct(marketParticipation?.priceChangeRate)}
                        <br />
                        거래대금 변화 {pct(marketParticipation?.quoteVolumeChangeRate)}
                        <br />
                        체결 수 변화 {pct(marketParticipation?.tradeCountChangeRate)}
                      </div>
                    </article>
                    <article className={styles.metaCard}>
                      <div className={styles.metaLabel}>
                        <TextWithInfo text="매수 주도 비중" description={getMetricHelp("TAKER_BUY_RATIO")} />
                      </div>
                      <div className={styles.metaValue}>
                        테이커 매수 비중 {ratioPct(marketParticipation?.takerBuyQuoteRatio)}
                        <br />
                        비중 변화 {ratioPct(marketParticipation?.takerBuyQuoteRatioDelta)}
                        <br />
                        대표 캔들 {formatUtcRangeToKst(marketParticipation?.openTime, marketParticipation?.closeTime)}
                      </div>
                    </article>
                  </div>
                  <ReadableFactList title="핵심 포인트" items={marketParticipation?.highlights ?? []} limit={3} />
                  <ReadableFactList title="세부 관찰" items={marketParticipation?.facts ?? []} limit={3} />
                </div>
              </article>
              <aside className={styles.sidebarCard}>
                <div className={styles.sidebarTitle}>참여도 기준 시각</div>
                <div className={styles.sidebarList}>
                  <div className={styles.sidebarRow}><div className={styles.sidebarRowKey}>분석 기준 시각</div><div className={styles.sidebarRowValue}>{kstWithSuffix(marketParticipation?.analysisBasisTime)}</div></div>
                  <div className={styles.sidebarRow}><div className={styles.sidebarRowKey}>현재가 기준 시각</div><div className={styles.sidebarRowValue}>{kstWithSuffix(marketParticipation?.priceSourceEventTime)}</div></div>
                  <div className={styles.sidebarRow}><div className={styles.sidebarRowKey}>대표 캔들 시작</div><div className={styles.sidebarRowValue}>{kstWithSuffix(marketParticipation?.openTime)}</div></div>
                  <div className={styles.sidebarRow}><div className={styles.sidebarRowKey}>대표 캔들 종료</div><div className={styles.sidebarRowValue}>{kstWithSuffix(marketParticipation?.closeTime)}</div></div>
                  <div className={styles.sidebarRow}><div className={styles.sidebarRowKey}>현재 비교 구간</div><div className={styles.sidebarRowValue}>{formatUtcRangeToKst(marketParticipation?.currentWindowStartTime, marketParticipation?.currentWindowEndTime)}</div></div>
                  <div className={styles.sidebarRow}><div className={styles.sidebarRowKey}>직전 비교 구간</div><div className={styles.sidebarRowValue}>{formatUtcRangeToKst(marketParticipation?.previousWindowStartTime, marketParticipation?.previousWindowEndTime)}</div></div>
                </div>
              </aside>
            </div>
          </section>
        ) : null}

        <section className={styles.section}>
          <SectionHeader title="Executive Conclusion" description={getSectionHelp("EXECUTIVE_CONCLUSION")} />
          <div className={styles.featureGrid}>
            <article className={styles.execCard}>
              <div className={styles.execHeader}>
                <div className={styles.execIcon}>AI</div>
                <div>
                  <div className={styles.execTitle}>최종 해석</div>
                  <div className={styles.execSubtitle}>요약과 관찰 포인트를 분리해 읽을 수 있도록 구성했습니다.</div>
                </div>
              </div>
              <div className={styles.execBody}>
                <div className={styles.quote}>{executiveConclusion.summary ? <HighlightedText text={executiveConclusion.summary} /> : "-"}</div>
                <div className={styles.factorGrid}>
                  <FactList title="Bullish Factors" items={executiveConclusion.bullishFactors} tone="bull" />
                  <FactList title="Bearish Factors" items={executiveConclusion.bearishFactors} tone="bear" />
                </div>
              </div>
            </article>
            <aside className={styles.sidebarCard}>
              <div className={styles.sidebarTitle}>Reading Notes</div>
              <div className={styles.sidebarList}>
                <div className={styles.sidebarRow}><div className={styles.sidebarRowKey}>Overall tone</div><div className={styles.sidebarRowValue}>{report.header.overallTone ? <HighlightedText text={report.header.overallTone} /> : "-"}</div></div>
                <div className={styles.sidebarRow}><div className={styles.sidebarRowKey}>이전 흐름 대비</div><div className={styles.sidebarRowValue}>{report.header.continuityMessage ? <HighlightedText text={report.header.continuityMessage} /> : "-"}</div></div>
                <div className={styles.sidebarRow}><div className={styles.sidebarRowKey}>공통 배경</div><div className={styles.sidebarRowValue}>{sharedContext?.sharedSummary ? <HighlightedText text={sharedContext.sharedSummary} /> : "-"}</div></div>
                <div className={styles.sidebarRow}><div className={styles.sidebarRowKey}>외부 레짐</div><div className={styles.sidebarRowValue}>{externalContext?.primarySignalDetail ? <HighlightedText text={externalContext.primarySignalDetail} /> : "-"}</div></div>
                <div className={styles.sidebarRow}><div className={styles.sidebarRowKey}>Tactical view</div><div className={styles.sidebarRowValue}>{executiveConclusion.tacticalView ? <HighlightedText text={executiveConclusion.tacticalView} /> : "-"}</div></div>
              </div>
            </aside>
          </div>
        </section>

        {domainCards.length > 0 ? (
          <section className={styles.section}>
            <SectionHeader title="Domain Analysis" hint="asset-specific consequence · status · watch point" description={getSectionHelp("DOMAIN_ANALYSIS")} />
            <div className={styles.domainGrid}>
              {domainCards.map((item) => <DomainCard key={`${item.domain}-${item.status}`} item={item} />)}
            </div>
          </section>
        ) : null}

        {showStructureSection ? (
          <section className={styles.section}>
            <SectionHeader title="Market Structure" hint="range · support · resistance" description={getSectionHelp("MARKET_STRUCTURE")} />
            <article className={styles.structurePanel}>
            {showMarketStructure ? (
              <>
              <div className={styles.priceTrackWrap}>
                <div className={styles.priceTrackLabel}>
                  {structureRange(structureBox, snapshot).map((item) => (
                    <span key={item.key}>
                      {item.label} {item.value}
                    </span>
                  ))}
                </div>
                <div className={styles.priceTrack}>
                  <div className={styles.priceTrackFill} style={{ width: `${parsePercentLabel(structureBox.rangePosition?.value) ?? 0}%` }} />
                  <div className={styles.priceTrackCurrent} style={{ left: `${parsePercentLabel(structureBox.rangePosition?.value) ?? 0}%` }} />
                </div>
              <div className={styles.priceTrackNote}>
                <TextWithInfo text={structureBox.rangePosition?.label ?? "레인지 내 포지션"} description={getStructureHelp("RANGE_POSITION")} />: {structureBox.rangePosition?.value ?? "-"}
                {structureBox.rangePosition?.basis ? ` · ${formatDisplayText(structureBox.rangePosition.basis)}` : ""}
              </div>
              </div>
              <div className={styles.structureTopRow}>
                <StructureZoneCard
                  tone="cool"
                  title="하단 기준"
                  titleDescription={getStructureHelp("DOWNSIDE_REFERENCE")}
                  reference={structureBox.downsideReference}
                  riskTitle="지지 이탈 리스크"
                  riskDescription={getStructureHelp("SUPPORT_BREAK_RISK")}
                  risk={structureBox.supportBreakRisk}
                />
                <div className={styles.structureCenterCard}>
                  <div className={styles.structureCenterLabel}>
                    <TextWithInfo text="현재 가격" description={getStructureHelp("CURRENT_PRICE")} />
                  </div>
                  <div className={styles.structureCenterValue}>{money(snapshot.currentPrice ?? structureBox.currentPrice)}</div>
                  <div className={styles.structureCenterSub}>
                    <span className={deltaTone(snapshot.dailyPriceChangeRate)}>{pct(snapshot.dailyPriceChangeRate)}</span>
                    <span>{structureBox.rangePosition?.value ?? "-"}</span>
                  </div>
                </div>
                <StructureZoneCard
                  tone="warm"
                  title="상단 기준"
                  titleDescription={getStructureHelp("UPSIDE_REFERENCE")}
                  reference={structureBox.upsideReference}
                  riskTitle="저항 돌파 리스크"
                  riskDescription={getStructureHelp("RESISTANCE_BREAK_RISK")}
                  risk={structureBox.resistanceBreakRisk}
                />
              </div>
              {structureBox.interpretation ? <div className={styles.note}><strong>시장 구조 해석:</strong> <HighlightedText text={structureBox.interpretation} /></div> : null}
              </>
            ) : null}

            {showLevels ? (
              <div className={styles.structureLevelsSection}>
                <div className={styles.structureLevelsHeader}>
                  <div className={styles.subTitle}>
                    <TextWithInfo text="Support / Resistance" description={getStructureHelp("SUPPORT_RESISTANCE")} />
                  </div>
                </div>

                {(levels.nearestSupportZone || levels.nearestResistanceZone) ? (
                  <div className={styles.levelsZoneGrid}>
                    {levels.nearestSupportZone ? <ZoneItem item={levels.nearestSupportZone} title="Nearest Support Zone" titleDescription={getStructureHelp("NEAREST_SUPPORT_ZONE")} /> : null}
                    {levels.nearestResistanceZone ? <ZoneItem item={levels.nearestResistanceZone} title="Nearest Resistance Zone" titleDescription={getStructureHelp("NEAREST_RESISTANCE_ZONE")} /> : null}
                  </div>
                ) : null}
              </div>
            ) : null}
            </article>
          </section>
        ) : null}

        {showCrossSignal ? (
          <section className={styles.section}>
            <SectionHeader title="Cross-Signal" description={getSectionHelp("CROSS_SIGNAL")} />
            <article className={styles.crossSignalCard}>
            <div className={styles.crossGrid}>
              <div className={styles.crossBox}>
                <div className={styles.alignmentLabel}><TextWithInfo text="Alignment" description={getStructureHelp("ALIGNMENT")} /></div>
                <div className={styles.verdictText}>{crossSignal.alignmentSummary ? <HighlightedText text={crossSignal.alignmentSummary} /> : "-"}</div>
              </div>
              <div className={styles.crossBox}>
                <div className={styles.alignmentLabel}><TextWithInfo text="Conflict" description={getStructureHelp("CONFLICT")} /></div>
                <div className={styles.verdictText}>{crossSignal.conflictSummary ? <HighlightedText text={crossSignal.conflictSummary} /> : "-"}</div>
              </div>
            </div>
            {crossSignal.dominantDrivers.length > 0 ? (
              <div className={styles.driverSection}>
                <div className={styles.driverTitle}><TextWithInfo text="Dominant Drivers" description={getStructureHelp("DOMINANT_DRIVERS")} /></div>
                <div className={styles.tagRow}>{crossSignal.dominantDrivers.map((item) => <span key={item} className={styles.tag}><HighlightedText text={item} /></span>)}</div>
              </div>
            ) : null}
            <div className={styles.integrationBox}>
              <div className={styles.integrationLabel}><TextWithInfo text="Positioning Take" description={getStructureHelp("POSITIONING_TAKE")} /></div>
              <div className={styles.integrationText}>{crossSignal.positioningTake ? <HighlightedText text={crossSignal.positioningTake} /> : "-"}</div>
            </div>
            </article>
          </section>
        ) : null}

        <section className={styles.section}>
          <SectionHeader title="Scenario Map" hint="condition · trigger · confirmation · invalidation" description={getSectionHelp("SCENARIO_MAP")} />
          <div className={styles.scenarioGrid}>{scenarios.map((item) => <ScenarioCard key={`${item.scenarioType}-${item.title}`} item={item} />)}</div>
        </section>

        {referenceNews.length > 0 ? (
          <section className={styles.section}>
            <SectionHeader title="Reference News" hint="분석 참고용" description={getSectionHelp("REFERENCE_NEWS")} />
            <div className={styles.newsList}>{referenceNews.map((item, index) => <NewsCard key={`${item.title}-${index}`} item={item} index={index} />)}</div>
          </section>
        ) : null}

        <section className={styles.section}>
          <SectionHeader title="Source Metadata" description={getSectionHelp("SOURCE_METADATA")} />
          <div className={styles.sourceMetaGrid}>
            <article className={styles.metaCard}><div className={styles.metaLabel}><TextWithInfo text="Data & engine" description={getStructureHelp("DATA_AND_ENGINE")} /></div><div className={styles.metaValue}>Source data {sourceMeta.sourceDataVersion}<br />Engine {sourceMeta.analysisEngineVersion}</div></article>
            <article className={styles.metaCard}><div className={styles.metaLabel}><TextWithInfo text="Narrative generation" description={getStructureHelp("NARRATIVE_GENERATION")} /></div><div className={styles.metaValue}>{sourceMeta.llmProvider} / {sourceMeta.llmModel}</div></article>
          </div>
        </section>

        <footer className={styles.footerCard}>
          <div className={styles.footerNote}>
            <strong>AI Coin Assist Report</strong> · {symbol} · {formatReportType(report.meta.reportType)}
            <br />
            분석 기준 시각 {kstWithSuffix(report.meta.analysisBasisTime)}
            <br />
            This page is a structured analysis reading surface. It is not investment advice, trading automation, or an execution signal.
          </div>
        </footer>
      </main>
    </div>
  );
}
