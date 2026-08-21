import type { SupabaseClient } from "@supabase/supabase-js";

import { GitHubRestClient } from "./github-client";
import { decryptGitHubToken, encryptGitHubToken } from "./token-crypto";
import type { GitHubConnectionStatus } from "./types";

interface ConnectionRow {
  github_login: string;
  connection_kind: "fine_grained_pat" | "github_app_user";
  token_ciphertext: string;
  token_iv: string;
  token_tag: string;
  token_fingerprint: string;
  connected_at: string;
  last_verified_at: string;
}

export class GitHubConnectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GitHubConnectionError";
  }
}

export async function connectGitHub(admin: SupabaseClient, userId: string, token: string): Promise<GitHubConnectionStatus> {
  const normalized = token.trim();
  if (normalized.length < 20) throw new GitHubConnectionError("GitHub token is too short");

  let githubUser: { login: string; html_url: string };
  try {
    githubUser = await new GitHubRestClient(normalized).getUser();
  } catch (error) {
    throw new GitHubConnectionError(error instanceof Error ? `GitHub token verification failed: ${error.message}` : "GitHub token verification failed");
  }

  const encrypted = encryptGitHubToken(normalized);
  const now = new Date().toISOString();
  const { error } = await admin.from("github_connections").upsert({
    user_id: userId,
    github_login: githubUser.login,
    connection_kind: "fine_grained_pat",
    token_ciphertext: encrypted.ciphertext,
    token_iv: encrypted.iv,
    token_tag: encrypted.tag,
    token_fingerprint: encrypted.fingerprint,
    updated_at: now,
    last_verified_at: now,
  }, { onConflict: "user_id" });
  if (error) throw error;

  return getGitHubConnectionStatus(admin, userId);
}

export async function getGitHubConnectionStatus(admin: SupabaseClient, userId: string): Promise<GitHubConnectionStatus> {
  const { data, error } = await admin
    .from("github_connections")
    .select("github_login,connection_kind,token_fingerprint,connected_at,last_verified_at")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return { connected: false };
  return {
    connected: true,
    githubLogin: data.github_login,
    connectionKind: data.connection_kind,
    tokenFingerprint: data.token_fingerprint,
    connectedAt: data.connected_at,
    lastVerifiedAt: data.last_verified_at,
  };
}

export async function disconnectGitHub(admin: SupabaseClient, userId: string): Promise<void> {
  const { error } = await admin.from("github_connections").delete().eq("user_id", userId);
  if (error) throw error;
}

export async function getGitHubClientForUser(admin: SupabaseClient, userId: string): Promise<GitHubRestClient> {
  const { data, error } = await admin
    .from("github_connections")
    .select("github_login,connection_kind,token_ciphertext,token_iv,token_tag,token_fingerprint,connected_at,last_verified_at")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new GitHubConnectionError("GitHub account is not connected");
  const row = data as ConnectionRow;
  return new GitHubRestClient(decryptGitHubToken({ ciphertext: row.token_ciphertext, iv: row.token_iv, tag: row.token_tag }));
}
