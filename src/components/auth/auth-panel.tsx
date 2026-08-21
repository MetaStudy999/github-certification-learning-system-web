"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export function AuthPanel() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    if (!supabase) return;
    void supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, [supabase]);

  if (!supabase) {
    return (
      <section className="panel">
        <h2>Supabase 연결 필요</h2>
        <p>`NEXT_PUBLIC_SUPABASE_URL`과 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`를 `.env.local`에 설정하세요.</p>
      </section>
    );
  }

  if (user) {
    return (
      <section className="panel authPanel">
        <p className="eyebrow">Signed in</p>
        <h2>{user.email}</h2>
        <div className="links">
          <Link href="/progress">학습 진행률 열기</Link>
          <button className="buttonSecondary" type="button" onClick={async () => { await supabase.auth.signOut(); setMessage("로그아웃했습니다."); router.refresh(); }}>로그아웃</button>
        </div>
        {message ? <p className="statusMessage">{message}</p> : null}
      </section>
    );
  }

  async function signIn() {
    setBusy(true);
    setMessage("");
    const { error } = await supabase!.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return setMessage(error.message);
    setMessage("로그인했습니다.");
    router.push("/progress");
  }

  async function signUp() {
    setBusy(true);
    setMessage("");
    const { error } = await supabase!.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName || email.split("@")[0] || "Learner" } },
    });
    setBusy(false);
    if (error) return setMessage(error.message);
    setMessage("계정을 만들었습니다. 로컬 환경에서는 바로 로그인 상태가 됩니다.");
    router.push("/progress");
  }

  return (
    <section className="panel authPanel">
      <p className="eyebrow">Supabase Auth</p>
      <h2>학습자 로그인</h2>
      <div className="authForm">
        <label>표시 이름<input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Learner" /></label>
        <label>이메일<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" /></label>
        <label>비밀번호<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" minLength={6} /></label>
      </div>
      <div className="buttonRow">
        <button type="button" disabled={busy || !email || password.length < 6} onClick={signIn}>로그인</button>
        <button className="buttonSecondary" type="button" disabled={busy || !email || password.length < 6} onClick={signUp}>계정 만들기</button>
      </div>
      {message ? <p className="statusMessage">{message}</p> : null}
    </section>
  );
}
