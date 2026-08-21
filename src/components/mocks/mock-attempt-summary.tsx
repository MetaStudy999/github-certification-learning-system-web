"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

interface AttemptRow { mock_slug: string; score_percent: number; judgment: string; submitted_at: string; }

export function MockAttemptSummary({ courseSlug }: { courseSlug: string }) {
  const supabase = getSupabaseBrowserClient();
  const [rows, setRows] = useState<AttemptRow[]>([]);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    void (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return;
      setSignedIn(true);
      const { data } = await supabase.from("mock_exam_attempts").select("mock_slug,score_percent,judgment,submitted_at").eq("course_slug", courseSlug).eq("status", "SUBMITTED").order("submitted_at", { ascending: false }).limit(5);
      setRows((data ?? []) as AttemptRow[]);
    })();
  }, [courseSlug, supabase]);

  if (!supabase) return null;
  if (!signedIn) return <section className="progressPanel"><p><Link href="/login">로그인</Link>하면 Mock 점수와 Readiness 기록이 저장됩니다.</p></section>;
  if (!rows.length) return <section className="progressPanel"><p>아직 제출한 Mock이 없습니다.</p></section>;
  return <section className="progressPanel"><div className="progressHeader"><strong>최근 Mock 결과</strong><Link href={`/readiness/${courseSlug}`}>Exam Readiness</Link></div><div className="activityList">{rows.map((row, index) => <div key={`${row.submitted_at}-${index}`}><strong>{row.mock_slug}</strong><span>{row.score_percent}% · {row.judgment}</span></div>)}</div></section>;
}
