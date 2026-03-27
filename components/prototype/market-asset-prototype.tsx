import Link from "next/link";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { formatUtcToKst } from "@/lib/format/date-time";
import {
  formatConfidence,
  formatDisplayText,
  formatDomain,
  formatDomainStatus,
  formatExternalDirection,
  formatExternalSeverity,
  formatFearGreedClassification,
  formatInteractionType,
  formatOutlook,
  formatReportType,
  formatScenarioType,
  formatSourceType,
  formatTrendLabel,
  formatVolatilityLabel,
  formatZoneType,
} from "@/lib/format/report-labels";
import type {
  DomainCardView,
  MarketStructureBox,
  PriceLevelView,
  PriceZoneView,
  ReferenceNewsItem,
  ReportDetailResponse,
  ReportSnapshot,
  ScenarioView,
  ZoneInteractionView,
} from "@/lib/report-types";
import styles from "./market-asset-prototype.module.css";

function code(symbol: string) {
  return symbol.replace("USDT", "");
}

function formatDateTime(value: string | null | undefined) {
  return formatUtcToKst(value);
}

function money(value?: number | string | null) {
  if (value == null) return "-";

  const parsed = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(parsed)) return String(value);

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(truncateNumber(parsed, 2));
}

function num(value?: number | null, digits = 2) {
  if (value == null) return "-";

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  }).format(truncateNumber(value, digits));
}

function pct(value?: number | null, digits = 2) {
  if (value == null) return "-";

  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  }).format(truncateNumber(value, digits));

  return `${value > 0 ? "+" : ""}${formatted}%`;
}

function ratioPct(value?: number | null, digits = 2) {
  if (value == null) return "-";

  const ratio = value <= 1 && value >= -1 ? value * 100 : value;
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  }).format(truncateNumber(ratio, digits));

  return `${ratio > 0 ? "+" : ""}${formatted}%`;
}

function truncateNumber(value: number, digits = 2) {
  const factor = 10 ** Math.max(0, digits);
  return Math.trunc(value * factor) / factor;
}

function hasStructure(box: MarketStructureBox | null | undefined) {
  return Boolean(
    box &&
    (
      box.rangeLow ||
      box.currentPrice ||
      box.rangeHigh ||
      box.rangePosition?.value ||
      box.interpretation
    ),
  );
}

function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <article className={styles.metricCard}>
      <div className={styles.metricLabel}>{label}</div>
      <div className={styles.metricValue}>{value}</div>
      <div className={styles.metricDetail}>{detail}</div>
    </article>
  );
}

function NarrativeList({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "bull" | "bear";
}) {
  if (items.length === 0) return null;

  return (
    <article className={styles.listCard}>
      <div className={styles.listTitle}>{title}</div>
      <div className={styles.listItems}>
        {items.map((item) => (
          <div key={item} className={styles.listItem}>
            <span className={tone === "bull" ? styles.listDotBull : styles.listDotBear} />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

function DomainCard({ item }: { item: DomainCardView }) {
  return (
    <article className={styles.domainCard}>
      <div className={styles.domainTop}>
        <div>
          <div className={styles.domainLabel}>{formatDomain(item.domain)}</div>
          <div className={styles.domainStatus}>{formatDomainStatus(item.status)}</div>
        </div>
        <span className={styles.domainBadge}>{formatDomain(item.domain)}</span>
      </div>
      {item.interpretation ? <p className={styles.domainText}>{formatDisplayText(item.interpretation)}</p> : null}
      {item.watchPoint ? <div className={styles.domainWatch}>Watch point: {formatDisplayText(item.watchPoint)}</div> : null}
    </article>
  );
}

function NewsCard({ item }: { item: ReferenceNewsItem }) {
  return (
    <article className={styles.newsCard}>
      <div className={styles.newsMeta}>
        <span>{formatDisplayText(item.source ?? "Unknown source")}</span>
        <span>{formatDateTime(item.publishedAt)} KST</span>
      </div>
      <div className={styles.newsTitle}>
        {item.url ? (
          <a href={item.url} target="_blank" rel="noreferrer">
            {formatDisplayText(item.title ?? "Untitled news")}
          </a>
        ) : (
          formatDisplayText(item.title ?? "Untitled news")
        )}
      </div>
      {item.whyItMatters ? <div className={styles.newsReason}>{formatDisplayText(item.whyItMatters)}</div> : null}
    </article>
  );
}

function ScenarioCard({ item }: { item: ScenarioView }) {
  const rows = [
    ["조건", item.condition],
    ["트리거", item.trigger],
    ["확인 신호", item.confirmation],
    ["무효화", item.invalidation],
    ["해석", item.interpretation],
  ].filter(([, value]) => Boolean(value));

  return (
    <article className={styles.scenarioCard}>
      <div className={styles.scenarioHeader}>
        <div>
          <div className={styles.scenarioType}>{formatScenarioType(item.scenarioType)}</div>
          <div className={styles.scenarioTitle}>{formatDisplayText(item.title ?? "Untitled scenario")}</div>
        </div>
      </div>
      <div className={styles.scenarioRows}>
        {rows.map(([label, value]) => (
          <div key={label} className={styles.scenarioRow}>
            <div className={styles.scenarioKey}>{label}</div>
            <div className={styles.scenarioValue}>{formatDisplayText(value)}</div>
          </div>
        ))}
      </div>
    </article>
  );
}

function SharedBackdropCard({ title, item }: { title: string; item: DomainCardView }) {
  return (
    <article className={styles.backdropCard}>
      <div className={styles.backdropTop}>
        <div>
          <div className={styles.domainLabel}>{title}</div>
          <div className={styles.domainStatus}>{formatDomainStatus(item.status)}</div>
        </div>
        <span className={styles.domainBadge}>{formatDomain(item.domain)}</span>
      </div>
      {item.interpretation ? <p className={styles.domainText}>{formatDisplayText(item.interpretation)}</p> : null}
      {item.watchPoint ? <div className={styles.domainWatch}>Watch point: {formatDisplayText(item.watchPoint)}</div> : null}
    </article>
  );
}

function RegimeSignalCard({
  title,
  detail,
  direction,
  severity,
  basisLabel,
}: {
  title: string;
  detail: string | null;
  direction: string | null;
  severity: string | null;
  basisLabel: string | null;
}) {
  return (
    <article className={styles.signalMiniCard}>
      <div className={styles.signalMiniTitle}>{title}</div>
      <div className={styles.signalMiniMeta}>
        <span>{formatExternalDirection(direction)}</span>
        <span>{formatExternalSeverity(severity)}</span>
        <span>{basisLabel ?? "-"}</span>
      </div>
      {detail ? <div className={styles.signalMiniText}>{formatDisplayText(detail)}</div> : null}
    </article>
  );
}

function LevelCard({ item, tone }: { item: PriceLevelView; tone: "support" | "resistance" }) {
  return (
    <article className={styles.levelCard}>
      <div className={styles.levelTop}>
        <div>
          <div className={styles.levelLabel}>{item.label ?? (tone === "support" ? "Support" : "Resistance")}</div>
          <div className={styles.levelMeta}>
            <span>{formatSourceType(item.sourceType)}</span>
            {item.referenceTime ? <span>{formatDateTime(item.referenceTime)} KST</span> : null}
          </div>
        </div>
        <div className={styles.levelPrice}>{money(item.price)}</div>
      </div>
      <div className={styles.levelMeta}>
        {item.distanceFromCurrent != null ? <span>현재가 대비 {ratioPct(item.distanceFromCurrent)}</span> : null}
        {item.strengthScore != null ? <span>강도 {ratioPct(item.strengthScore)}</span> : null}
      </div>
      {item.rationale ? <div className={styles.levelBody}>{formatDisplayText(item.rationale)}</div> : null}
    </article>
  );
}

function ZoneCard({ title, item }: { title: string; item: PriceZoneView }) {
  return (
    <article className={styles.levelCard}>
      <div className={styles.levelTop}>
        <div>
          <div className={styles.levelLabel}>{title}</div>
          <div className={styles.levelMeta}>
            <span>{formatInteractionType(item.interactionType)}</span>
            {item.zoneRank != null ? <span>Rank {item.zoneRank}</span> : null}
          </div>
        </div>
        <div className={styles.levelPrice}>{money(item.representativePrice)}</div>
      </div>
      <div className={styles.levelMeta}>
        <span>{money(item.zoneLow)} - {money(item.zoneHigh)}</span>
        {item.distanceToZone != null ? <span>진입 거리 {ratioPct(item.distanceToZone)}</span> : null}
      </div>
      <div className={styles.levelBody}>
        핵심 기준 {formatDisplayText(item.strongestLevelLabel) ?? "-"} / {formatSourceType(item.strongestSourceType)}
      </div>
    </article>
  );
}

function InteractionCard({ item }: { item: ZoneInteractionView }) {
  return (
    <article className={styles.levelCard}>
      <div className={styles.levelTop}>
        <div className={styles.levelLabel}>{formatZoneType(item.zoneType)} 인터랙션</div>
        <div className={styles.levelMeta}>
          {item.zoneRank != null ? <span>Rank {item.zoneRank}</span> : null}
          {item.interactionType ? <span>{formatInteractionType(item.interactionType)}</span> : null}
        </div>
      </div>
      {item.summary ? <div className={styles.levelBody}>{formatDisplayText(item.summary)}</div> : null}
    </article>
  );
}

export function MarketAssetPrototypePage({ report }: { report: ReportDetailResponse }) {
  const symbol = code(report.meta.symbol);
  const hero = report.page.hero ?? {
    marketRegime: null,
    oneLineTake: null,
    primaryDriver: null,
    riskDriver: null,
  };
  const snapshot: ReportSnapshot = report.page.snapshot ?? {
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
  const executiveConclusion = report.page.executiveConclusion ?? {
    summary: null,
    bullishFactors: [],
    bearishFactors: [],
    tacticalView: null,
  };
  const structureBox = report.page.marketStructureBox;
  const crossSignal = report.page.crossSignal ?? {
    alignmentSummary: null,
    dominantDrivers: [],
    conflictSummary: null,
    positioningTake: null,
  };
  const sharedContext = report.page.sharedContext;
  const externalContext = report.page.externalContext;
  const levels = report.page.levels;
  const sharedDomainCards = [sharedContext?.macro, sharedContext?.sentiment].filter((item): item is DomainCardView => Boolean(item));
  const assetDomainCards = report.page.domainCards;

  return (
    <div className={styles.shell}>
      <div className={styles.backdrop} />
      <header className={styles.header}>
        <div>
          <div className={styles.brand}>AI Coin Assist</div>
          <div className={styles.brandSub}>Market brief / asset brief split prototype</div>
        </div>
        <div className={styles.headerActions}>
          <Link href={`/?symbol=${encodeURIComponent(report.meta.symbol)}&reportType=${report.meta.reportType}`} className={styles.linkButton}>
            현재 상세 화면
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <div className={styles.kicker}>Prototype route</div>
            <h1 className={styles.title}>공통 시장 해석과 코인별 해석을 한 페이지 안에서 분리한 레이아웃</h1>
            <p className={styles.summary}>
              현재 API DTO를 그대로 재배치한 프로토타입입니다. 최종 구조는 전용 market DTO가 생기면 그 DTO를 기준으로 교체하는 전제를 둡니다.
            </p>
          </div>
          <div className={styles.heroAside}>
            <div className={styles.asideLabel}>Reading order</div>
            <div className={styles.asideStep}>01. Market Brief</div>
            <div className={styles.asideStep}>02. Asset Brief</div>
            <div className={styles.asideMeta}>
              {symbol} · {formatReportType(report.meta.reportType)} · {formatDateTime(report.meta.analysisBasisTime)} KST
            </div>
          </div>
        </section>

        <section className={styles.notice}>
          <strong>Prototype note</strong>
          <span>이제는 `sharedContext`와 `externalContext`를 직접 사용해서 공통 시장 해석을 분리합니다.</span>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <div className={styles.sectionKicker}>Shared context</div>
              <h2 className={styles.sectionTitle}>Market Brief</h2>
            </div>
            <p className={styles.sectionText}>
              여러 코인에 공통으로 적용되는 시장 톤, 주요 드라이버, 매크로와 심리 맥락을 먼저 읽는 영역입니다.
            </p>
          </div>

          <div className={styles.marketLeadGrid}>
            <article className={styles.leadCard}>
              <div className={styles.leadLabel}>Market regime</div>
              <div className={styles.leadValue}>{hero.marketRegime ?? formatOutlook(report.header.outlook)}</div>
              <p className={styles.leadText}>{sharedContext?.sharedSummary ?? hero.oneLineTake ?? report.header.narrativeSummary ?? "-"}</p>
            </article>
            <article className={styles.leadCardAlt}>
              <div className={styles.driverBlock}>
                <div className={styles.driverLabel}>External regime</div>
                <div className={styles.driverText}>
                  {externalContext?.primarySignalTitle ?? hero.primaryDriver ?? report.header.primaryMessage ?? "-"}
                </div>
              </div>
              <div className={styles.driverBlock}>
                <div className={styles.driverLabel}>Shared watch</div>
                <div className={styles.driverText}>
                  {sharedContext?.macro?.watchPoint ?? sharedContext?.sentiment?.watchPoint ?? hero.riskDriver ?? report.header.continuityMessage ?? "-"}
                </div>
              </div>
            </article>
          </div>

          <div className={styles.metricGrid}>
            <MetricCard
              label="Composite Risk"
              value={ratioPct(externalContext?.compositeRiskScore)}
              detail={`${formatExternalDirection(externalContext?.dominantDirection)} · ${formatExternalSeverity(externalContext?.highestSeverity)}`}
            />
            <MetricCard
              label="Fear & Greed"
              value={num(snapshot.fearGreed.indexValue, 0)}
              detail={`${formatFearGreedClassification(snapshot.fearGreed.classification)} · ${pct(snapshot.fearGreed.valueChangeRate)}`}
            />
            <MetricCard
              label="DXY Proxy"
              value={num(snapshot.macro.dxyProxyValue, 3)}
              detail={`일간 변화 ${pct(snapshot.macro.dxyChangeRate)}`}
            />
            <MetricCard
              label="Headwind Signals"
              value={num(externalContext?.headwindSignalCount, 0)}
              detail={`Supportive ${num(externalContext?.supportiveSignalCount, 0)} · Cautionary ${num(externalContext?.cautionarySignalCount, 0)}`}
            />
          </div>

          {sharedDomainCards.length > 0 ? (
            <div className={styles.cardGrid}>
              {sharedDomainCards.map((item) => (
                <SharedBackdropCard
                  key={`${item.domain}-${item.status}`}
                  title={item.domain === "MACRO" ? "Macro Backdrop" : item.domain === "SENTIMENT" ? "Sentiment Backdrop" : formatDomain(item.domain)}
                  item={item}
                />
              ))}
            </div>
          ) : null}

          {externalContext?.regimeSignals.length ? (
            <div className={styles.signalMiniGrid}>
              {externalContext.regimeSignals.map((item, index) => (
                <RegimeSignalCard
                  key={`${item.category}-${item.title}-${index}`}
                  title={item.title ?? item.category ?? "Signal"}
                  detail={item.detail}
                  direction={item.direction}
                  severity={item.severity}
                  basisLabel={item.basisLabel}
                />
              ))}
            </div>
          ) : null}

          <div className={styles.crossGrid}>
            <article className={styles.crossCard}>
              <div className={styles.crossLabel}>Alignment</div>
              <div className={styles.crossValue}>{crossSignal.alignmentSummary ?? "-"}</div>
            </article>
            <article className={styles.crossCard}>
              <div className={styles.crossLabel}>Conflict</div>
              <div className={styles.crossValue}>{crossSignal.conflictSummary ?? "-"}</div>
            </article>
            <article className={styles.crossCardWide}>
              <div className={styles.crossLabel}>Positioning take</div>
              <div className={styles.crossValue}>{crossSignal.positioningTake ?? "-"}</div>
              {crossSignal.dominantDrivers.length > 0 ? (
                <div className={styles.tagRow}>
                  {crossSignal.dominantDrivers.map((item) => (
                    <span key={item} className={styles.tag}>{item}</span>
                  ))}
                </div>
              ) : null}
            </article>
          </div>

          {report.page.referenceNews.length > 0 ? (
            <div className={styles.newsGrid}>
              {report.page.referenceNews.slice(0, 4).map((item, index) => (
                <NewsCard key={`${item.title}-${index}`} item={item} />
              ))}
            </div>
          ) : null}
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <div className={styles.sectionKicker}>Per asset</div>
              <h2 className={styles.sectionTitle}>Asset Brief</h2>
            </div>
            <p className={styles.sectionText}>
              시장 맥락을 읽은 뒤, 해당 코인에만 해당하는 가격 해석, 결론, 레벨, 시나리오를 내려 읽는 영역입니다.
            </p>
          </div>

          <div className={styles.assetHero}>
            <div>
              <div className={styles.assetEyebrow}>{report.header.headline ?? "Asset reading"}</div>
              <div className={styles.assetTitle}>{symbol}</div>
              <p className={styles.assetText}>{executiveConclusion.summary ?? hero.oneLineTake ?? "-"}</p>
            </div>
            <div className={styles.assetMeta}>
              <div className={styles.metaPill}>{formatReportType(report.meta.reportType)}</div>
              <div className={styles.metaPill}>{formatOutlook(report.header.outlook)}</div>
              <div className={styles.metaPill}>신뢰도 {formatConfidence(report.header.confidence)}</div>
            </div>
          </div>

          <div className={styles.metricGrid}>
            <MetricCard
              label="Current Price"
              value={money(snapshot.currentPrice)}
              detail={`일간 변화 ${pct(snapshot.dailyPriceChangeRate)}`}
            />
            <MetricCard
              label="Trend"
              value={formatTrendLabel(snapshot.trendLabel)}
              detail={`${formatVolatilityLabel(snapshot.volatilityLabel)} · ${snapshot.rangePositionLabel ?? "-"}`}
            />
            <MetricCard
              label="RSI 14"
              value={num(snapshot.rsi14.value, 2)}
              detail={snapshot.rsi14.signalSummary ?? "-"}
            />
            <MetricCard
              label="MACD Histogram"
              value={num(snapshot.macdHistogram.value, 2)}
              detail={snapshot.macdHistogram.signalSummary ?? "-"}
            />
            <MetricCard
              label="7D Range Low"
              value={money(snapshot.range7d.low)}
              detail={`상단 ${money(snapshot.range7d.high)}`}
            />
            <MetricCard
              label="Range Position"
              value={ratioPct(snapshot.range7d.currentPositionInRange)}
              detail={`저점 반등 ${ratioPct(snapshot.range7d.reboundFromWindowLow)}`}
            />
          </div>

          <div className={styles.conclusionGrid}>
            <article className={styles.conclusionCard}>
              <div className={styles.cardKicker}>Executive conclusion</div>
              <div className={styles.conclusionText}>{executiveConclusion.summary ?? "-"}</div>
              <div className={styles.listGrid}>
                <NarrativeList title="Bullish factors" items={executiveConclusion.bullishFactors} tone="bull" />
                <NarrativeList title="Bearish factors" items={executiveConclusion.bearishFactors} tone="bear" />
              </div>
            </article>

            <article className={styles.readingCard}>
              <div className={styles.cardKicker}>Reading notes</div>
              <div className={styles.noteRow}>
                <span>Overall tone</span>
                <strong>{report.header.overallTone ?? "-"}</strong>
              </div>
              <div className={styles.noteRow}>
                <span>Tactical view</span>
                <strong>{executiveConclusion.tacticalView ?? "-"}</strong>
              </div>
              <div className={styles.noteRow}>
                <span>Analysis basis</span>
                <strong>{formatDateTime(report.meta.analysisBasisTime)} KST</strong>
              </div>
              <div className={styles.noteRow}>
                <span>Stored at</span>
                <strong>{formatDateTime(report.meta.reportStoredTime)} KST</strong>
              </div>
            </article>
          </div>

          {assetDomainCards.length > 0 ? (
            <div className={styles.cardGrid}>
              {assetDomainCards.map((item) => (
                <DomainCard key={`${item.domain}-${item.status}`} item={item} />
              ))}
            </div>
          ) : null}

          {levels ? (
            <div className={styles.levelSection}>
              <div className={styles.levelSectionHeader}>
                <div className={styles.cardKicker}>Asset levels</div>
                <div className={styles.levelSectionMeta}>
                  <span>{levels.supportLevels.length} supports</span>
                  <span>{levels.resistanceLevels.length} resistances</span>
                </div>
              </div>
              <div className={styles.levelGrid}>
                {levels.nearestSupportZone ? <ZoneCard title="Nearest Support Zone" item={levels.nearestSupportZone} /> : null}
                {levels.nearestResistanceZone ? <ZoneCard title="Nearest Resistance Zone" item={levels.nearestResistanceZone} /> : null}
                {levels.supportLevels.slice(0, 2).map((item) => (
                  <LevelCard key={`support-${item.label}-${item.price}`} item={item} tone="support" />
                ))}
                {levels.resistanceLevels.slice(0, 2).map((item) => (
                  <LevelCard key={`resistance-${item.label}-${item.price}`} item={item} tone="resistance" />
                ))}
              </div>
              {levels.zoneInteractionFacts.length > 0 ? (
                <div className={styles.interactionGrid}>
                  {levels.zoneInteractionFacts.map((item, index) => (
                    <InteractionCard key={`${item.zoneType}-${item.zoneRank}-${index}`} item={item} />
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          {hasStructure(structureBox) ? (
            <article className={styles.structureCard}>
              <div className={styles.cardKicker}>Asset structure</div>
              <div className={styles.structureValues}>
                <div>
                  <span>Range low</span>
                  <strong>{money(structureBox?.rangeLow)}</strong>
                </div>
                <div>
                  <span>Current</span>
                  <strong>{money(snapshot.currentPrice ?? structureBox?.currentPrice)}</strong>
                </div>
                <div>
                  <span>Range high</span>
                  <strong>{money(structureBox?.rangeHigh)}</strong>
                </div>
              </div>
              <div className={styles.structureMeta}>
                <span>{structureBox?.rangePosition?.label ?? "Range position"}</span>
                <strong>{structureBox?.rangePosition?.value ?? "-"}</strong>
              </div>
              {structureBox?.interpretation ? <p className={styles.structureText}>{structureBox.interpretation}</p> : null}
            </article>
          ) : null}

          {report.page.scenarios.length > 0 ? (
            <div className={styles.scenarioGrid}>
              {report.page.scenarios.map((item) => (
                <ScenarioCard key={`${item.scenarioType}-${item.title}`} item={item} />
              ))}
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}
