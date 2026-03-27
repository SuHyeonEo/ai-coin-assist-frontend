# AI Coin Assist Frontend

AI Coin Assist의 프론트엔드 저장소입니다. 이 프로젝트는 거래 화면이 아니라, API가 제공하는 분석 DTO를 차분하고 읽기 좋은 리포트 경험으로 렌더링하는 데 집중합니다.

## Overview

- 목적: 시장 해석 리포트를 요약에서 상세로 자연스럽게 읽게 하는 읽기 중심 UI
- 역할: API 응답을 신뢰 가능한 화면 DTO로 소비하고, 표시와 포맷팅에만 책임을 둠
- 금지: 프론트엔드에서 RSI, MACD, 시나리오, 추세 판단 같은 분석 로직 재계산

서비스 구성은 아래와 같습니다.

- `batch`: 분석 팩트, 리포트 payload, narrative 생성
- `api`: batch 결과를 프론트엔드용 DTO로 조합
- `ai-coin-assist-frontend`: DTO를 읽기 좋은 화면으로 렌더링

## Product Direction

이 UI는 "트레이딩 터미널"이 아니라 "리서치 브리프"에 가깝게 동작해야 합니다.

- 리포트 읽기 UX 우선
- summary-to-detail 정보 흐름
- 모바일/데스크톱 모두에서 안정적인 가독성
- 다크/라이트 모드 모두 의도적으로 지원
- API DTO를 truth source로 사용

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- ESLint

## Current Routes

- `/`
  최신 리포트 상세를 기본 랜딩으로 렌더링합니다.
  쿼리 파라미터 `symbol`, `reportType`를 지원합니다.
- `/reports/[reportId]`
  개별 리포트 상세 페이지입니다.
- `/prototype/market-asset`
  자산 카드/리포트 UX 실험용 프로토타입 페이지입니다.

## API Integration

프론트엔드는 API 서버의 DTO를 그대로 소비합니다.

현재 사용 중인 주요 엔드포인트:

- `GET /api/reports/latest/summary?symbol=BTCUSDT&reportType=SHORT_TERM`
- `GET /api/reports/latest/detail?symbol=BTCUSDT&reportType=SHORT_TERM`
- `GET /api/reports/{reportId}`

API Base URL은 아래 순서대로 탐색합니다.

1. `AICA_SERVER_BASE_URL`
2. `NEXT_PUBLIC_SERVER_BASE_URL`
3. `AICA_API_BASE_URL`
4. `NEXT_PUBLIC_API_BASE_URL`
5. 기본값 `http://localhost:8082`

예시:

```bash
set AICA_SERVER_BASE_URL=http://localhost:8082
npm run dev
```

PowerShell 예시:

```powershell
$env:AICA_SERVER_BASE_URL = "http://localhost:8082"
npm run dev
```

## Getting Started

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 열면 됩니다.

## Scripts

- `npm run dev`: 개발 서버 실행
- `npm run build`: 프로덕션 빌드
- `npm run start`: 빌드 결과 실행
- `npm run lint`: ESLint 실행

## Verification

의미 있는 작업을 마치기 전 기본 검증 기준:

```bash
npm run lint
npm run build
```

시각 변경이 크다면 아래도 함께 확인합니다.

- desktop light mode
- desktop dark mode
- mobile light mode
- mobile dark mode

## Docker

간단한 컨테이너 실행도 가능합니다.

```bash
docker build -t ai-coin-assist-frontend .
docker run --rm -p 3000:3000 -e AICA_SERVER_BASE_URL=http://host.docker.internal:8082 ai-coin-assist-frontend
```

## Directory Direction

- `app/`: App Router 페이지와 레이아웃
- `components/report/`: 리포트 전용 섹션 컴포넌트
- `components/ui/`: 재사용 UI 프리미티브
- `lib/`: API fetcher, DTO 타입, 포맷팅 유틸리티

## Working Rules

- 서버가 준 의미를 클라이언트에서 다시 해석하지 않습니다.
- 비어 있는 섹션은 자연스럽게 생략하되, 임의의 분석 문장을 생성하지 않습니다.
- 데이터 shaping이 필요하면 프론트엔드 우회 로직보다 API DTO 확장을 우선 검토합니다.
- 가능한 한 Server Component를 기본으로 사용하고, Client Component는 실제 상호작용이 필요한 경우에만 사용합니다.

## Related Repositories

- Batch: `C:\Users\tngus\batch`
- API: `C:\Users\tngus\api`

