function mapValue(value: string | null | undefined, labels: Record<string, string>) {
  if (!value) return "-";
  return labels[value] ?? value;
}

function truncateNumber(value: number, digits = 2) {
  const factor = 10 ** Math.max(0, digits);
  return Math.trunc(value * factor) / factor;
}

function formatTruncatedNumberToken(token: string) {
  const hasPercent = token.endsWith("%");
  const numericPart = hasPercent ? token.slice(0, -1) : token;
  const normalized = numericPart.replace(/,/g, "");
  const parsed = Number(normalized);

  if (!Number.isFinite(parsed)) {
    return token;
  }

  const truncated = truncateNumber(parsed, 2);
  const formatted = `${truncated}`.replace(/(\.\d*?[1-9])0+$/u, "$1").replace(/\.0+$/u, "");

  return `${formatted}${hasPercent ? "%" : ""}`;
}

function truncateDecimalText(value: string) {
  return value.replace(
    /(?<![\d.])-?(?:\d{1,3}(?:,\d{3})+|\d+)\.\d{3,}%?(?![\d.])/gu,
    (token) => formatTruncatedNumberToken(token),
  );
}

const freeTextReplacements: Array<[RegExp, string]> = [
  [/\bPREV_BATCH\b/g, "이전 배치"],
  [/\bLAST_1D\b/g, "최근 1일"],
  [/\bLAST_3D\b/g, "최근 3일"],
  [/\bLAST_7D\b/g, "최근 7일"],
  [/\bLAST_14D\b/g, "최근 14일"],
  [/\bLAST_30D\b/g, "최근 30일"],
  [/\bLAST_90D\b/g, "최근 90일"],
  [/\bLAST_180D\b/g, "최근 180일"],
  [/\bLAST_52W\b/g, "최근 52주"],
  [/\bD1\b/g, "전일"],
  [/\bcomparison\b/gi, "비교"],
  [/\bposition\b/gi, "위치"],
  [/\bderivative shift\b/gi, "파생 변화"],
  [/\bmacro shift\b/gi, "거시 변화"],
  [/\bactivity expansion\b/gi, "활동 확대"],
  [/\bNegative basis pressure\b/g, "베이시스 하방 압력"],
  [/\bPositive basis support\b/g, "베이시스 상방 지지"],
  [/\bNeutral basis structure\b/g, "베이시스 중립 구조"],
];

export function formatDisplayText(value?: string | null) {
  if (!value) return "-";

  const localized = freeTextReplacements.reduce((current, [pattern, replacement]) => {
    return current.replace(pattern, replacement);
  }, value);

  return truncateDecimalText(localized).replace(/\s+/g, " ").trim();
}

export function formatOutlook(value?: string | null) {
  return mapValue(value, {
    NEUTRAL: "중립",
    CONSTRUCTIVE: "긍정",
    DEFENSIVE: "방어적",
  });
}

export function formatConfidence(value?: string | null) {
  return mapValue(value, {
    LOW: "낮음",
    MEDIUM: "보통",
    HIGH: "높음",
  });
}

export function formatSignalCategory(value?: string | null) {
  return mapValue(value, {
    MARKET: "시장",
    COMPARISON: "비교",
    WINDOW: "구간",
    PARTICIPATION: "참여도",
    DERIVATIVE: "파생",
    MACRO: "거시",
    SENTIMENT: "심리",
    ONCHAIN: "온체인",
    EXTERNAL: "외부",
  });
}

export function formatDomain(value?: string | null) {
  return mapValue(value, {
    MARKET: "시장 구조",
    DERIVATIVE: "파생",
    MACRO: "거시",
    SENTIMENT: "심리",
    ONCHAIN: "온체인",
    LEVEL: "레벨",
  });
}

export function formatDomainStatus(value?: string | null) {
  return mapValue(value, {
    BULLISH: "상승 우위",
    BEARISH: "하락 우위",
    NEUTRAL: "중립",
    MIXED: "혼조",
  });
}

export function formatScenarioType(value?: string | null) {
  return mapValue(value, {
    BULLISH: "상승 시나리오",
    BASE: "기본 시나리오",
    BEARISH: "하락 시나리오",
  });
}

export function formatTrendLabel(value?: string | null) {
  return mapValue(value, {
    BULLISH: "상승",
    UPTREND: "상승",
    BEARISH: "하락",
    DOWNTREND: "하락",
    NEUTRAL: "중립",
  });
}

export function formatVolatilityLabel(value?: string | null) {
  return mapValue(value, {
    CONTAINED: "안정",
    MODERATE: "보통",
    ELEVATED: "확대",
  });
}

export function formatRangePositionLabel(value?: string | null) {
  return mapValue(value, {
    LOWER: "하단",
    MID: "중단",
    UPPER: "상단",
    LOWER_RANGE: "하단",
    MID_RANGE: "중단",
    UPPER_RANGE: "상단",
  });
}

export function formatFearGreedClassification(value?: string | null) {
  return mapValue(value, {
    EXTREME_FEAR: "극단적 공포",
    FEAR: "공포",
    NEUTRAL: "중립",
    GREED: "탐욕",
    EXTREME_GREED: "극단적 탐욕",
    "Extreme Fear": "극단적 공포",
    Fear: "공포",
    Neutral: "중립",
    Greed: "탐욕",
    "Extreme Greed": "극단적 탐욕",
  });
}

export function formatReportType(value?: string | null) {
  return mapValue(value, {
    SHORT_TERM: "단기",
    MID_TERM: "중기",
    LONG_TERM: "장기",
  });
}

export function formatWindowType(value?: string | null) {
  return mapValue(value, {
    LAST_1D: "최근 1일",
    LAST_3D: "최근 3일",
    LAST_7D: "최근 7일",
    LAST_14D: "최근 14일",
    LAST_30D: "최근 30일",
    LAST_90D: "최근 90일",
    LAST_180D: "최근 180일",
    LAST_52W: "최근 52주",
  });
}

export function formatZoneType(value?: string | null) {
  return mapValue(value, {
    SUPPORT: "지지",
    RESISTANCE: "저항",
  });
}

export function formatSourceType(value?: string | null) {
  return mapValue(value, {
    MOVING_AVERAGE: "이동평균",
    RANGE_HIGH: "레인지 상단",
    RANGE_LOW: "레인지 하단",
    PREVIOUS_HIGH: "이전 고점",
    PREVIOUS_LOW: "이전 저점",
  });
}

export function formatInteractionType(value?: string | null) {
  return mapValue(value, {
    HOLDING: "지지 유지",
    TESTING: "재시험",
    BREAKING: "이탈",
    BREAKOUT: "돌파",
    REJECTING: "거부",
  });
}

export function formatExternalDirection(value?: string | null) {
  return mapValue(value, {
    SUPPORTIVE: "우호",
    CAUTIONARY: "주의",
    HEADWIND: "역풍",
  });
}

export function formatExternalSeverity(value?: string | null) {
  return mapValue(value, {
    LOW: "낮음",
    MEDIUM: "보통",
    MODERATE: "보통",
    CAUTION: "주의",
    HIGH: "높음",
  });
}
