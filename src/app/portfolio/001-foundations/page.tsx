import Link from "next/link";
import { EvidenceDashboard } from "@/components/evidence/evidence-dashboard";
export default function PortfolioPage(){return <main className="shell"><section className="hero"><p className="eyebrow">P10 · Portfolio Projection</p><h1>GitHub Foundations Portfolio</h1><p className="lead">학습량이 아니라 검증 가능한 수행 결과와 부족한 Evidence를 함께 보여 주는 개인 Portfolio입니다.</p><div className="links"><Link href="/evidence/001-foundations">Evidence Package</Link><Link href="/courses/001-foundations">GH-900 학습</Link></div></section><EvidenceDashboard/></main>;}
