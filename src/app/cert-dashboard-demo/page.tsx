import styles from "./cert-dashboard-demo.module.css";

const certifications = [
  { name: "GitHub Foundations", score: 82, status: "합격권", tone: "good", questions: 320, practice: 92, weak: 2 },
  { name: "GitHub Actions", score: 65, status: "보완 필요", tone: "warn", questions: 412, practice: 118, weak: 4 },
  { name: "GitHub Administration", score: 58, status: "보완 필요", tone: "warn", questions: 298, practice: 76, weak: 5 },
  { name: "GitHub Advanced Security", score: 71, status: "합격권", tone: "good", questions: 276, practice: 104, weak: 3 },
  { name: "GitHub Copilot", score: 48, status: "집중 학습", tone: "focus", questions: 336, practice: 69, weak: 6 },
  { name: "GitHub Agentic AI Developer", score: 52, status: "집중 학습", tone: "focus", questions: 200, practice: 54, weak: 6 },
] as const;

const rows = [
  ["Foundations", "Git basics", 89, 5, "브랜치 생성·merge 실습"],
  ["Foundations", "Repositories", 75, 8, "Repository 관리 실습"],
  ["Foundations", "Collaboration", 62, 12, "PR Review 실습"],
  ["Actions", "Workflow syntax", 54, 18, "기본 workflow 작성"],
  ["Actions", "Secrets & variables", 48, 22, "Secrets 관리 실습"],
  ["Actions", "Reusable workflows", 45, 19, "재사용 workflow 작성"],
  ["Administration", "Permissions", 51, 16, "권한 관리 시나리오"],
  ["Administration", "Organization settings", 47, 14, "조직 설정 구성 실습"],
  ["Advanced Security", "Secret scanning", 67, 10, "Secret scanning 점검"],
  ["Copilot", "Prompt engineering", 46, 20, "프롬프트 개선 연습"],
  ["Agentic AI", "Evaluation & guardrails", 43, 24, "평가·guardrail 실습"],
] as const;

function toneClass(tone: string) {
  if (tone === "good") return styles.good;
  if (tone === "warn") return styles.warn;
  return styles.focus;
}

export default function CertificationDashboardDemoPage() {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <aside className={styles.sidebar}>
          <div className={styles.brand}><span>⌘</span>AI Git Coach</div>
          <div className={styles.workspace}>awesome-learning<br />Personal Workspace</div>
          <nav className={styles.nav}>
            <div className={`${styles.navItem} ${styles.navActive}`}>▣ 대시보드</div>
            <div className={styles.navItem}>◈ 학습하기</div>
            <div className={styles.navItem}>⌁ 실습 환경</div>
            <div className={styles.navItem}>◌ 문제 & 질문</div>
            <div className={styles.navItem}>◇ 자격증 가이드</div>
            <div className={styles.navItem}>▥ 분석 리포트</div>
          </nav>
          <div className={styles.miniGraph}>
            <h3>Git 학습 브랜치</h3>
            <div className={styles.branch}>main</div>
            <div className={styles.branch}>feature/cert-prep</div>
            <div className={styles.branch}>feature/actions</div>
            <div className={styles.branch}>feature/copilot</div>
            <div className={styles.branch}>release/v1.0</div>
          </div>
        </aside>

        <section className={styles.main}>
          <div className={styles.titleRow}>
            <div>
              <h1>GitHub Certification Readiness Dashboard</h1>
              <p>사용자 질문·실습·오답 패턴을 분석해 자격증별 내부 학습 준비도와 부족한 영역을 보여줍니다.</p>
            </div>
            <span className={styles.internalBadge}>내부 준비도 지표 · 공식 합격 확률 아님</span>
          </div>

          <div className={styles.kpis}>
            <article className={styles.kpi}><span className={styles.kpiUp}>↑ 12%</span><div className={styles.kpiLabel}>수집된 질문</div><div className={styles.kpiValue}>1,842</div></article>
            <article className={styles.kpi}><span className={styles.kpiUp}>↑ 28%</span><div className={styles.kpiLabel}>실습 세션</div><div className={styles.kpiValue}>526</div></article>
            <article className={styles.kpi}><span className={styles.kpiUp}>↑ 8%</span><div className={styles.kpiLabel}>평균 준비도</div><div className={styles.kpiValue}>68%</div></article>
            <article className={styles.kpi}><span className={styles.kpiUp}>+2</span><div className={styles.kpiLabel}>합격권 후보</div><div className={styles.kpiValue}>4</div></article>
          </div>

          <div className={styles.sectionTitle}><h2>GitHub 자격증별 준비도</h2><span>최근 30일 학습 데이터 →</span></div>
          <div className={styles.certGrid}>
            {certifications.map((cert) => (
              <article className={styles.certCard} key={cert.name}>
                <div className={styles.certHead}>
                  <div>
                    <div className={styles.certTitle}>{cert.name}</div>
                    <div className={styles.certSub}>GitHub Certification · 학습 준비도</div>
                    <span className={`${styles.status} ${toneClass(cert.tone)}`}>{cert.status}</span>
                  </div>
                  <div className={styles.ring} style={{ "--p": cert.score } as React.CSSProperties}><strong>{cert.score}%</strong></div>
                </div>
                <div className={styles.certStats}>
                  <div className={styles.stat}><span>질문</span><strong>{cert.questions}</strong></div>
                  <div className={styles.stat}><span>실습</span><strong>{cert.practice}</strong></div>
                  <div className={styles.stat}><span>취약 항목</span><strong>{cert.weak}</strong></div>
                </div>
              </article>
            ))}
          </div>

          <div className={styles.charts}>
            <article className={styles.chartCard}>
              <h3>자격증별 취득 준비도</h3>
              <div className={styles.bars}>
                {certifications.map((cert) => (
                  <div className={styles.barWrap} key={cert.name}>
                    <div className={styles.bar} style={{ height: `${cert.score}%` }}><span>{cert.score}%</span></div>
                    {cert.name.replace("GitHub ", "").split(" ")[0]}
                  </div>
                ))}
              </div>
            </article>

            <article className={styles.chartCard}>
              <h3>질문·실습 추이</h3>
              <svg className={styles.lineSvg} viewBox="0 0 340 125" role="img" aria-label="questions and practices trend">
                <path d="M8 106 L55 99 L102 91 L149 82 L196 88 L243 61 L290 44 L330 27" fill="none" stroke="#3d8dff" strokeWidth="3" />
                <path d="M8 114 L55 111 L102 104 L149 96 L196 99 L243 86 L290 73 L330 60" fill="none" stroke="#9c6cff" strokeWidth="3" />
                {[8,55,102,149,196,243,290,330].map((x, index) => <circle key={x} cx={x} cy={[106,99,91,82,88,61,44,27][index]} r="3" fill="#57a4ff" />)}
                <line x1="8" x2="330" y1="116" y2="116" stroke="#27435e" />
              </svg>
            </article>

            <article className={styles.chartCard}>
              <h3>학습 항목 충족도</h3>
              <div className={styles.donutWrap}>
                <div className={styles.donut} />
                <div className={styles.legend}>
                  <div>● 완료 <b>62%</b></div>
                  <div>● 진행 중 <b>28%</b></div>
                  <div>● 미시작 <b>10%</b></div>
                </div>
              </div>
            </article>
          </div>

          <article className={styles.tableCard}>
            <div className={styles.tableHead}><h3>⚠ 부족한 학습 항목</h3><span>대분류 → 하위 카테고리 → 추천 실습</span></div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead><tr><th>대분류</th><th>하위 카테고리</th><th>이해도</th><th>부족 질문 수</th><th>추천 실습</th></tr></thead>
                <tbody>
                  {rows.map(([category, sub, score, missed, practice]) => (
                    <tr key={`${category}-${sub}`}>
                      <td className={styles.category}>{category}</td>
                      <td>{sub}</td>
                      <td><div className={`${styles.scoreBar} ${score < 55 ? styles.low : ""}`}><div className={styles.scoreTrack}><div className={styles.scoreFill} style={{ width: `${score}%` }} /></div>{score}%</div></td>
                      <td>{missed}</td>
                      <td>{practice} →</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </section>

        <aside className={styles.rightbar}>
          <article className={styles.sideCard}>
            <h3>✦ AI 추천</h3>
            <p>질문·실습·오답 패턴 기반 Next Best Action</p>
            {[
              ["GitHub Actions의 secrets와 reusable workflows를 보완하세요.", "관련 취약 질문이 가장 많습니다."],
              ["Copilot Chat 실습 3회를 추가하세요.", "준비도 개선 가능성이 높은 다음 행동입니다."],
              ["Foundations는 모의고사 단계로 이동하세요.", "현재 내부 준비도 82%입니다."],
              ["Administration 권한 관리 개념을 복습하세요.", "Permissions 항목 이해도가 낮습니다."],
              ["Agentic AI의 evaluation·guardrails를 학습하세요.", "새로운 출제 영역 대응이 필요합니다."],
            ].map(([title, detail], index) => (
              <div className={styles.recommendation} key={title}><span className={styles.num}>{index + 1}</span><div><strong>{title}</strong><span>{detail}</span></div></div>
            ))}
          </article>

          <article className={styles.sideCard}>
            <h3>최근 활동</h3>
            <p>질문과 실습 데이터가 준비도 계산에 반영됩니다.</p>
            <div className={styles.activity}>Actions reusable workflow 질문 <span>질문</span></div>
            <div className={styles.activity}>CI secrets 사용법 질문 <span>질문</span></div>
            <div className={styles.activity}>Workflow 배포 실습 완료 <span>실습</span></div>
            <div className={styles.activity}>Copilot prompt 실습 완료 <span>실습</span></div>
            <div className={styles.note}>준비도는 공식 시험 합격을 보장하지 않습니다. 질문·실습·모의고사·오답 데이터를 합산한 서비스 내부 지표입니다.</div>
          </article>
        </aside>
      </div>
    </main>
  );
}
