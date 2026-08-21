import Link from "next/link";
import { EvidenceDashboard } from "@/components/evidence/evidence-dashboard";
export default function EvidencePage(){return <main className="shell"><section className="hero"><p className="eyebrow">P10 · Evidence / Portfolio</p><h1>GH-900 Evidence Package</h1><p className="lead">What · Why · Verify · Result와 시스템 검증 데이터를 하나의 재생성 가능한 Evidence Snapshot으로 묶습니다.</p><div className="links"><Link href="/labs/001-foundations">GitHub Labs</Link><Link href="/readiness/001-foundations">Exam Readiness</Link></div></section><EvidenceDashboard/></main>;}
