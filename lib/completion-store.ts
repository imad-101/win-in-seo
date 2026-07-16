"use client";

import { useSyncExternalStore } from "react";

const storageKey = "winin-completed-opportunities";
const changeEvent = "winin-completion-change";
type CompletionOverrides = Record<string, boolean>;

function subscribe(callback: () => void) {
  window.addEventListener(changeEvent, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(changeEvent, callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot() {
  return localStorage.getItem(storageKey) ?? "{}";
}

function getServerSnapshot() {
  return "{}";
}

function parseOverrides(value: string): CompletionOverrides {
  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed)) return Object.fromEntries(parsed.filter((id): id is string => typeof id === "string").map((id) => [id, true]));
    if (parsed && typeof parsed === "object") return parsed as CompletionOverrides;
  } catch {
    // Ignore corrupt local state and start with no overrides.
  }
  return {};
}

export function useCompletionOverrides() {
  return parseOverrides(useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot));
}

export function setOpportunityCompletion(id: string, completed: boolean) {
  const overrides = parseOverrides(getSnapshot());
  overrides[id] = completed;
  localStorage.setItem(storageKey, JSON.stringify(overrides));
  window.dispatchEvent(new Event(changeEvent));

  void fetch(`/api/opportunities/${encodeURIComponent(id)}/complete`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed }),
  });
}
