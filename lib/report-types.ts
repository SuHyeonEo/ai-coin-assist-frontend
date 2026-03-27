export type ReportType = "SHORT_TERM" | "MID_TERM" | "LONG_TERM";

export interface ReportMeta {
  reportId: number;
  narrativeId: number | null;
  symbol: string;
  reportType: ReportType;
  analysisBasisTime: string | null;
  rawReferenceTime: string | null;
  priceSourceEventTime: string | null;
  reportStoredTime: string | null;
  narrativeAvailable: boolean;
}

export interface ReportSignalHeadline {
  category: string | null;
  title: string | null;
  detail: string | null;
  importance: string | null;
}

export interface ReportHeader {
  headline: string | null;
  outlook: string | null;
  confidence: string | null;
  primaryMessage: string | null;
  continuityMessage: string | null;
  overallTone: string | null;
  narrativeSummary: string | null;
  signalHeadlines: ReportSignalHeadline[];
}

export interface HeroSummary {
  marketRegime: string | null;
  oneLineTake: string | null;
  primaryDriver: string | null;
  riskDriver: string | null;
}

export interface RangeSnapshot {
  windowType: string | null;
  windowStartTime: string | null;
  windowEndTime: string | null;
  openTime: string | null;
  closeTime: string | null;
  high: number | null;
  low: number | null;
  range: number | null;
  currentPositionInRange: number | null;
  distanceFromWindowHigh: number | null;
  reboundFromWindowLow: number | null;
}

export interface IndicatorSnapshot {
  value: number | null;
  delta: number | null;
  signalSummary: string | null;
}

export interface SentimentSnapshot {
  indexValue: number | null;
  classification: string | null;
  valueChange: number | null;
  valueChangeRate: number | null;
}

export interface MacroSnapshot {
  dxyProxyValue: number | null;
  dxyChangeRate: number | null;
  us10yYieldValue: number | null;
  us10yYieldChangeRate: number | null;
  usdKrwValue: number | null;
  usdKrwChangeRate: number | null;
}

export interface ReportSnapshot {
  currentPrice: number | null;
  dailyPriceChangeRate: number | null;
  priceSourceEventTime: string | null;
  participationWindowLabel: string | null;
  quoteVolumeChangeRate: number | null;
  tradeCountChangeRate: number | null;
  takerBuyQuoteRatio: number | null;
  takerBuyQuoteRatioDelta: number | null;
  range7d: RangeSnapshot;
  rsi14: IndicatorSnapshot;
  macdHistogram: IndicatorSnapshot;
  fearGreed: SentimentSnapshot;
  macro: MacroSnapshot;
  trendLabel: string | null;
  volatilityLabel: string | null;
  rangePositionLabel: string | null;
}

export interface ParticipationWindowMetric {
  windowLabel: string | null;
  currentWindowStartTime: string | null;
  currentWindowEndTime: string | null;
  previousWindowStartTime: string | null;
  previousWindowEndTime: string | null;
  sampleCount: number | null;
  priceChangeRate: number | null;
  quoteVolumeChangeRate: number | null;
  tradeCountChangeRate: number | null;
  takerBuyQuoteRatio: number | null;
  takerBuyQuoteRatioDelta: number | null;
}

export interface MarketParticipationSummary {
  title: string | null;
  summary: string | null;
  representativeWindowLabel: string | null;
  currentWindowStartTime: string | null;
  currentWindowEndTime: string | null;
  previousWindowStartTime: string | null;
  previousWindowEndTime: string | null;
  sampleCount: number | null;
  priceChangeRate: number | null;
  quoteVolumeChangeRate: number | null;
  tradeCountChangeRate: number | null;
  takerBuyQuoteRatio: number | null;
  takerBuyQuoteRatioDelta: number | null;
  analysisBasisTime: string | null;
  priceSourceEventTime: string | null;
  openTime: string | null;
  closeTime: string | null;
  highlights: string[];
  facts: string[];
  summaries: ParticipationWindowMetric[];
}

export interface ValueLabelBasis {
  value: string | null;
  label: string | null;
  basis: string | null;
  windowType?: string | null;
}

export interface MarketStructureBox {
  rangeLow: string | null;
  currentPrice: string | null;
  rangeHigh: string | null;
  rangePosition: ValueLabelBasis | null;
  upsideReference: ValueLabelBasis | null;
  downsideReference: ValueLabelBasis | null;
  supportBreakRisk: ValueLabelBasis | null;
  resistanceBreakRisk: ValueLabelBasis | null;
  interpretation: string | null;
}

export interface ExecutiveConclusion {
  summary: string | null;
  bullishFactors: string[];
  bearishFactors: string[];
  tacticalView: string | null;
}

export interface DomainCardView {
  domain: string | null;
  status: string | null;
  interpretation: string | null;
  watchPoint: string | null;
}

export interface CrossSignalView {
  alignmentSummary: string | null;
  dominantDrivers: string[];
  conflictSummary: string | null;
  positioningTake: string | null;
}

export interface PriceLevelView {
  label: string | null;
  sourceType: string | null;
  price: number | null;
  distanceFromCurrent: number | null;
  strengthScore: number | null;
  referenceTime: string | null;
  reactionCount: number | null;
  clusterSize: number | null;
  rationale: string | null;
  triggerFacts: string[];
}

export interface PriceZoneView {
  zoneType: string | null;
  zoneRank: number | null;
  representativePrice: number | null;
  zoneLow: number | null;
  zoneHigh: number | null;
  distanceFromCurrent: number | null;
  distanceToZone: number | null;
  strengthScore: number | null;
  interactionType: string | null;
  strongestLevelLabel: string | null;
  strongestSourceType: string | null;
  levelCount: number | null;
  recentTestCount: number | null;
  recentRejectionCount: number | null;
  recentBreakCount: number | null;
  triggerFacts: string[];
}

export interface ZoneInteractionView {
  zoneType: string | null;
  zoneRank: number | null;
  interactionType: string | null;
  summary: string | null;
  triggerFacts: string[];
}

export interface LevelSummaryView {
  supportLevels: PriceLevelView[];
  resistanceLevels: PriceLevelView[];
  supportZones: PriceZoneView[];
  resistanceZones: PriceZoneView[];
  nearestSupportZone: PriceZoneView | null;
  nearestResistanceZone: PriceZoneView | null;
  zoneInteractionFacts: ZoneInteractionView[];
}

export interface ExternalRegimeSignalView {
  category: string | null;
  title: string | null;
  detail: string | null;
  direction: string | null;
  severity: string | null;
  basisLabel: string | null;
}

export interface ExternalContextSummaryView {
  compositeRiskScore: number | null;
  dominantDirection: string | null;
  highestSeverity: string | null;
  supportiveSignalCount: number | null;
  cautionarySignalCount: number | null;
  headwindSignalCount: number | null;
  primarySignalCategory: string | null;
  primarySignalTitle: string | null;
  primarySignalDetail: string | null;
  regimeSignals: ExternalRegimeSignalView[];
}

export interface SharedContextSummaryView {
  contextVersion: string | null;
  sharedSummary: string | null;
  macro: DomainCardView | null;
  sentiment: DomainCardView | null;
}

export interface ScenarioView {
  scenarioType: string | null;
  title: string | null;
  condition: string | null;
  trigger: string | null;
  confirmation: string | null;
  invalidation: string | null;
  interpretation: string | null;
}

export interface ReferenceNewsItem {
  title: string | null;
  source: string | null;
  publishedAt: string | null;
  url: string | null;
  whyItMatters: string | null;
  relatedDomain: string | null;
}

export interface ReportSourceMeta {
  sourceDataVersion: string | null;
  analysisEngineVersion: string | null;
  llmProvider: string | null;
  llmModel: string | null;
  generationStatus: string | null;
  fallbackUsed: boolean;
  promptTemplateVersion: string | null;
  inputSchemaVersion: string | null;
  outputSchemaVersion: string | null;
  sharedContextId: number | null;
  sharedContextVersion: string | null;
  sharedContextUsed: boolean;
}

export interface ReportPage {
  hero: HeroSummary | null;
  executiveConclusion: ExecutiveConclusion | null;
  marketParticipation: MarketParticipationSummary | null;
  domainCards: DomainCardView[];
  marketStructureBox: MarketStructureBox | null;
  crossSignal: CrossSignalView | null;
  scenarios: ScenarioView[];
  levels: LevelSummaryView | null;
  externalContext: ExternalContextSummaryView | null;
  sharedContext: SharedContextSummaryView | null;
  referenceNews: ReferenceNewsItem[];
  sourceMeta: ReportSourceMeta | null;
  snapshot?: ReportSnapshot | null;
}

export interface ReportDetailResponse {
  meta: ReportMeta;
  header: ReportHeader;
  page: ReportPage;
}

export interface ReportSummaryResponse {
  meta: ReportMeta;
  header: ReportHeader;
  hero?: HeroSummary | null;
  snapshot: ReportSnapshot;
  marketParticipation?: MarketParticipationSummary | null;
  marketStructureBox?: MarketStructureBox | null;
  sourceMeta: ReportSourceMeta;
}

export interface AssetReportStatusResponse {
  reportType: ReportType;
  available: boolean;
  reportId: number | null;
  analysisBasisTime: string | null;
  reportStoredTime: string | null;
  headline: string | null;
  outlook: string | null;
  overallTone: string | null;
  narrativeAvailable: boolean;
}

export interface AssetSummaryCardResponse {
  symbol: string;
  assetCode: string | null;
  assetName: string | null;
  latestPrice: number | null;
  dailyPriceChangeRate: number | null;
  participationWindowLabel: string | null;
  quoteVolumeChangeRate: number | null;
  tradeCountChangeRate: number | null;
  takerBuyQuoteRatio: number | null;
  takerBuyQuoteRatioDelta: number | null;
  trendLabel: string | null;
  volatilityLabel: string | null;
  overallTone: string | null;
  outlook: string | null;
  headline: string | null;
  summaryReportType: ReportType | null;
  latestAnalysisBasisTime: string | null;
  priceSourceEventTime: string | null;
  latestReportStoredTime: string | null;
  marketParticipation: MarketParticipationSummary | null;
  reportStatuses: AssetReportStatusResponse[];
}
