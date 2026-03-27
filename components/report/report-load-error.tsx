import { getApiBaseUrlCandidates } from "@/lib/report-api";

export function ReportLoadError({
  title,
  error,
}: {
  title: string;
  error: unknown;
}) {
  const message = error instanceof Error ? error.message : "unknown error";
  const candidates = getApiBaseUrlCandidates();

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "32px 20px",
        background: "var(--page-background)",
        color: "var(--text-primary)",
      }}
    >
      <section
        style={{
          width: "min(720px, 100%)",
          border: "1px solid var(--border-soft)",
          borderRadius: "24px",
          padding: "24px",
          background: "var(--surface-primary)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <div style={{ fontSize: "0.9rem", color: "var(--text-tertiary)", marginBottom: 12 }}>
          AI Coin Assist
        </div>
        <h1 style={{ margin: "0 0 12px", fontSize: "1.6rem" }}>{title}</h1>
        <p style={{ margin: "0 0 16px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
          통합 Spring 서버 응답을 불러오지 못해 리포트 화면을 조립하지 못했습니다. 프론트는 정상 실행 중이고,
          현재 데이터 소스 연결만 실패한 상태입니다.
        </p>
        <div style={{ marginBottom: 16, fontFamily: "var(--font-jetbrains)", fontSize: "0.9rem", whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
          {message}
        </div>
        <div style={{ marginBottom: 8, color: "var(--text-secondary)" }}>현재 조회 순서</div>
        <ul style={{ margin: 0, paddingLeft: 20, color: "var(--text-secondary)" }}>
          {candidates.map((candidate) => (
            <li key={candidate}>{candidate}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
