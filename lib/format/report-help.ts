function mapValue(value: string | null | undefined, descriptions: Record<string, string>) {
  if (!value) return null;
  return descriptions[value] ?? null;
}

export function getOutlookHelp(value?: string | null) {
  return mapValue(value, {
    NEUTRAL: "상승과 하락 어느 한쪽으로 강하게 기울지 않은 상태입니다.",
    CONSTRUCTIVE: "상승 쪽 가능성을 상대적으로 더 높게 보는 상태입니다.",
    DEFENSIVE: "리스크 관리가 더 중요한 방어적 구간으로 보는 상태입니다.",
  });
}

export function getConfidenceHelp(value?: string | null) {
  return mapValue(value, {
    LOW: "신호가 약하거나 서로 엇갈려 해석 확신이 낮은 상태입니다.",
    MEDIUM: "일부 신호는 맞지만 아직 단정하기는 이른 상태입니다.",
    HIGH: "여러 신호가 비교적 같은 방향을 가리키는 상태입니다.",
  });
}

export function getReportScheduleHelp(value?: string | null) {
  return mapValue(value, {
    SHORT_TERM: "운영 서버 기준 KST 00:00을 시작점으로 매 6시간마다 리포트가 생성됩니다. 실제 화면 반영까지는 배치 실행과 저장에 약 5분 정도 걸릴 수 있습니다.",
    MID_TERM: "운영 서버 기준 중기 리포트는 매일 KST 00:00에 하루 1회 생성됩니다. 실제 화면 반영까지는 배치 실행과 저장에 약 5분 정도 걸릴 수 있습니다.",
    LONG_TERM: "운영 서버 기준 장기 리포트는 매주 월요일 KST 00:00에 주 1회 생성됩니다. 실제 화면 반영까지는 배치 실행과 저장에 약 5분 정도 걸릴 수 있습니다.",
  });
}

export function getSignalCategoryHelp(value?: string | null) {
  return mapValue(value, {
    COMPARISON: "직전 기준과 비교해 무엇이 달라졌는지 보여줍니다.",
    WINDOW: "최근 구간 안에서 가격 위치와 흐름을 설명합니다.",
    DERIVATIVE: "선물, 미결제약정, 펀딩비 같은 포지션 지표를 봅니다.",
    MACRO: "달러, 금리, 환율 같은 거시 환경을 봅니다.",
    SENTIMENT: "시장 심리와 위험 선호 변화를 설명합니다.",
    ONCHAIN: "체인 위 활동과 자금 흐름 변화를 봅니다.",
    EXTERNAL: "외부 뉴스나 체제 변화 같은 바깥 요인을 봅니다.",
  });
}

export function getDomainHelp(value?: string | null) {
  return mapValue(value, {
    MARKET: "가격 흐름과 현재 구조를 가장 직접적으로 읽는 영역입니다.",
    DERIVATIVE: "레버리지와 포지셔닝 흐름을 보는 영역입니다.",
    MACRO: "거시 환경이 자산에 주는 압력을 보는 영역입니다.",
    SENTIMENT: "투자 심리와 위험 회피 강도를 보는 영역입니다.",
    ONCHAIN: "온체인 활동과 흐름 변화를 보는 영역입니다.",
    LEVEL: "지지와 저항 같은 구조 기준점을 보는 영역입니다.",
  });
}

export function getFearGreedHelp(value?: string | null) {
  return mapValue(value, {
    "Extreme Fear": "시장 심리가 매우 위축된 상태를 뜻합니다.",
    Fear: "시장 참여자들이 조심스럽게 움직이는 상태입니다.",
    Neutral: "심리가 한쪽으로 크게 치우치지 않은 상태입니다.",
    Greed: "위험 선호가 높아진 상태입니다.",
    "Extreme Greed": "과열 우려가 생길 수 있을 만큼 낙관이 강한 상태입니다.",
    "극단적 공포": "시장 심리가 매우 위축된 상태를 뜻합니다.",
    공포: "시장 참여자들이 조심스럽게 움직이는 상태입니다.",
    중립: "심리가 한쪽으로 크게 치우치지 않은 상태입니다.",
    탐욕: "위험 선호가 높아진 상태입니다.",
    "극단적 탐욕": "과열 우려가 생길 수 있을 만큼 낙관이 강한 상태입니다.",
  });
}

export function getSectionHelp(value?: string | null) {
  return mapValue(value, {
    SNAPSHOT: "현재 리포트 시점의 핵심 지표를 빠르게 스캔하는 구간입니다. 결론을 읽기 전에 시장 온도와 위치를 짧게 확인할 때 봅니다.",
    MARKET_PARTICIPATION: "최근 대표 참여 구간을 직전 동일 구간과 비교해 가격 변화, 거래대금 변화, 체결 수 변화, 매수 주도 강도를 읽는 구간입니다.",
    EXECUTIVE_CONCLUSION: "이 리포트의 최종 해석을 먼저 읽는 구간입니다. 상승 요인과 하락 요인을 함께 보면서 전체 톤을 파악합니다.",
    DOMAIN_ANALYSIS: "시장, 파생, 거시, 심리, 온체인, 레벨 등 각 영역이 이 자산에 어떤 영향을 주는지 나눠서 읽는 구간입니다.",
    MARKET_STRUCTURE: "현재 가격이 어느 범위에 있고, 상하단 기준과 지지·저항이 어디에 형성되어 있는지 보는 구간입니다.",
    CROSS_SIGNAL: "여러 도메인 신호가 같은 방향으로 모이는지, 서로 충돌하는지 한 번에 정리한 구간입니다.",
    SCENARIO_MAP: "어떤 조건에서 어느 시나리오가 열리는지, 트리거와 확인 신호, 무효화 조건을 함께 보는 구간입니다.",
    REFERENCE_NEWS: "분석에 참고된 뉴스 맥락입니다. 직접적인 매매 신호라기보다 해석의 배경을 보완하는 자료입니다.",
    SOURCE_METADATA: "이 리포트가 어떤 데이터 스냅샷과 어떤 생성 엔진을 바탕으로 만들어졌는지 보여주는 정보입니다.",
  });
}

export function getMetricHelp(value?: string | null) {
  return mapValue(value, {
    CURRENT_PRICE: "리포트 기준 시점의 현재 가격입니다. 현재가 기준 시각과 함께 보면 어느 시점 가격을 보고 있는지 더 정확히 읽을 수 있습니다.",
    RSI_14: "최근 14개 구간 기준 상대강도지수입니다. 과열이나 과매도보다 현재 모멘텀 강도를 보는 용도로 읽는 것이 좋습니다.",
    MACD_HISTOGRAM: "MACD 히스토그램 값입니다. 방향 전환 자체보다 모멘텀의 확장과 둔화를 보는 데 유용합니다.",
    FEAR_GREED: "시장 심리가 공포 쪽인지 탐욕 쪽인지 보여주는 지표입니다. 가격 자체보다 위험 선호의 온도를 읽는 용도입니다.",
    RANGE_WINDOW: "현재 스냅샷에 연결된 가격 범위의 저점과 고점입니다. 현재 가격이 해당 범위 어디쯤에 있는지 함께 해석할 수 있습니다.",
    VOLUME_CHANGE: "최근 대표 구간의 거래대금이 직전 동일 구간 대비 얼마나 늘었거나 줄었는지 보여줍니다. base volume이 아니라 quote volume 기준입니다.",
    TRADE_COUNT_CHANGE: "최근 대표 구간의 체결 수가 직전 동일 구간 대비 얼마나 변했는지 보여줍니다.",
    PARTICIPATION_WINDOW: "대표 참여 구간과 직전 동일 구간의 시간 범위를 함께 보여줍니다.",
    TAKER_BUY_RATIO: "체결된 거래대금 중 테이커 매수 비중입니다. 값이 높을수록 공격적 매수 참여가 상대적으로 강합니다.",
    DXY_PROXY: "달러 강도 프록시입니다. 일반적으로 달러 강세는 위험자산에 부담으로 작용할 수 있습니다.",
    TREND: "현재 추세, 변동성, 범위 내 위치를 함께 압축해서 보여주는 상태 요약입니다.",
    USD_KRW: "원달러 환율 흐름입니다. 국내 투자자 관점의 환율 부담과 위험 회피 압력을 가늠할 때 참고합니다.",
  });
}

export function getStructureHelp(value?: string | null) {
  return mapValue(value, {
    RANGE_POSITION: "현재 가격이 활성 레인지 안에서 어느 위치에 있는지 보여줍니다. 하단에 가까우면 방어 구간, 상단에 가까우면 돌파 부담 구간으로 읽습니다.",
    DOWNSIDE_REFERENCE: "현재 구조에서 가장 먼저 확인해야 할 하단 기준점입니다. 지지가 유지되는지 판단할 때 봅니다.",
    UPSIDE_REFERENCE: "현재 구조에서 가장 먼저 확인해야 할 상단 기준점입니다. 돌파 시도와 저항 부담을 읽을 때 봅니다.",
    SUPPORT_BREAK_RISK: "하단 기준점이 깨질 가능성을 압축한 값입니다. 값이 높을수록 하방 이탈 위험을 더 조심해서 봅니다.",
    RESISTANCE_BREAK_RISK: "상단 기준점이 돌파될 가능성을 압축한 값입니다. 값이 높을수록 상방 돌파 시도 여지가 커집니다.",
    CURRENT_PRICE: "현재 가격이 구조 구간의 어느 위치에 있는지 보여주는 중심값입니다.",
    SUPPORT_RESISTANCE: "현재 구조에서 가장 가까운 지지 구간과 저항 구간만 추려 보여줍니다.",
    NEAREST_SUPPORT_ZONE: "현재 가격과 가장 가까운 지지 구간입니다. 눌림이나 방어가 확인될 가능성이 높은 지점을 뜻합니다.",
    NEAREST_RESISTANCE_ZONE: "현재 가격과 가장 가까운 저항 구간입니다. 반등이 막히거나 돌파를 시험할 수 있는 지점을 뜻합니다.",
    ALIGNMENT: "여러 도메인 신호가 같은 방향으로 얼마나 정렬돼 있는지 요약합니다.",
    CONFLICT: "신호끼리 서로 엇갈리는 지점을 요약합니다. 확신을 낮추는 요소로 읽으면 됩니다.",
    DOMINANT_DRIVERS: "현재 결론에 가장 크게 기여하는 핵심 동인만 추려 놓은 목록입니다.",
    POSITIONING_TAKE: "앞선 정렬·충돌 신호를 종합했을 때 현재 포지셔닝을 어떻게 읽을지 정리한 문장입니다.",
    DATA_AND_ENGINE: "리포트 생성에 사용된 데이터 스냅샷 버전과 조립 엔진 정보입니다.",
    NARRATIVE_GENERATION: "서술형 해석을 생성한 모델과 제공자를 뜻합니다.",
  });
}
