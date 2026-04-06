"use client";

import {
  isSignInWithEmailLink,
  onAuthStateChanged,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signOut
} from "firebase/auth";
import { useEffect, useMemo, useState } from "react";

import { CopilotPanel } from "../components/copilot-panel";
import { LogsPanel } from "../components/logs-panel";
import { MetricsPanel } from "../components/metrics-panel";
import { QuickAccess } from "../components/quick-access";
import { TimelinePanel } from "../components/timeline-panel";
import { TracePanel } from "../components/trace-panel";
import { auth, isFirebaseConfigured } from "../lib/firebase";
import { useAIOpsStore } from "../store/use-aiops-store";
import type { ScenarioId } from "../types/api";

const AUTH_EMAIL_KEY = "bitsio_magic_email";
const GUEST_UID_KEY = "bitsio_guest_uid";

export default function HomePage() {
  const {
    scenarios,
    activeScenarioId,
    runData,
    timelineVisible,
    timelineStreaming,
    chatMessages,
    chatBusy,
    statusText,
    session,
    loadScenarios,
    executeScenario,
    sendMessage,
    setSession
  } = useAIOpsStore();

  const [emailInput, setEmailInput] = useState("");
  const [authNote, setAuthNote] = useState("Guest demo mode available");

  const telemetry = runData?.scenario.telemetry ?? null;

  useEffect(() => {
    void loadScenarios();
  }, [loadScenarios]);

  useEffect(() => {
    if (!activeScenarioId && scenarios[0]?.id) {
      void executeScenario(scenarios[0].id);
    }
  }, [activeScenarioId, executeScenario, scenarios]);

  useEffect(() => {
    const authClient = auth;

    if (!isFirebaseConfigured || !authClient) {
      const guestId = getOrCreateGuestId();
      void setSession({ uid: guestId, mode: "guest" });
      setAuthNote("Firebase not configured. Running in guest demo mode.");
      return;
    }

    const completeEmailLinkSignIn = async () => {
      if (!isSignInWithEmailLink(authClient, window.location.href)) {
        return;
      }

      const storedEmail = window.localStorage.getItem(AUTH_EMAIL_KEY);
      if (!storedEmail) {
        setAuthNote("Magic link opened, but email was missing in local storage.");
        return;
      }

      try {
        await signInWithEmailLink(authClient, storedEmail, window.location.href);
        window.localStorage.removeItem(AUTH_EMAIL_KEY);
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch {
        setAuthNote("Magic link sign-in failed. Please request a new link.");
      }
    };

    void completeEmailLinkSignIn();

    const unsubscribe = onAuthStateChanged(authClient, async (user) => {
      if (user?.uid) {
        await setSession({
          uid: user.uid,
          email: user.email ?? undefined,
          mode: "auth"
        });
        setAuthNote(user.email ? `Signed in as ${user.email}` : "Signed in");
        return;
      }

      const guestId = getOrCreateGuestId();
      await setSession({ uid: guestId, mode: "guest" });
      setAuthNote("Using guest session");
    });

    return () => unsubscribe();
  }, [setSession]);

  const headerIdentity = useMemo(() => {
    if (session.mode === "auth") {
      return session.email ?? "Authenticated user";
    }

    if (session.mode === "guest") {
      return "Guest Demo";
    }

    return "No session";
  }, [session.email, session.mode]);

  const onScenarioSelect = async (id: ScenarioId) => {
    await executeScenario(id);
  };

  const onGuestMode = async () => {
    const guestId = getOrCreateGuestId();
    await setSession({ uid: guestId, mode: "guest" });
    setAuthNote("Guest mode enabled");
  };

  const onSendMagicLink = async () => {
    if (!auth || !isFirebaseConfigured) {
      setAuthNote("Firebase auth is not configured.");
      return;
    }

    const email = emailInput.trim();
    if (!email) {
      setAuthNote("Enter an email to receive the magic link.");
      return;
    }

    await sendSignInLinkToEmail(auth, email, {
      url: window.location.origin,
      handleCodeInApp: true
    });

    window.localStorage.setItem(AUTH_EMAIL_KEY, email);
    setAuthNote(`Magic link sent to ${email}`);
  };

  const onSignOut = async () => {
    if (auth) {
      await signOut(auth);
    }

    const guestId = getOrCreateGuestId();
    await setSession({ uid: guestId, mode: "guest" });
    setAuthNote("Signed out, guest mode resumed");
  };

  return (
    <main className="mx-auto min-h-screen max-w-[1500px] px-4 py-6 md:px-8">
      <header className="rounded-2xl border border-teal/20 bg-panel/80 px-5 py-4 shadow-glow backdrop-blur">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted">bitsIO Inc.</p>
            <h1 className="text-2xl font-semibold text-text">AIOps Decision Intelligence Platform</h1>
            <p className="mt-1 text-sm text-muted">{statusText}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg border border-panelSoft bg-bg/50 px-3 py-2 text-xs text-muted">
              {headerIdentity}
            </span>
            <input
              value={emailInput}
              onChange={(event) => setEmailInput(event.target.value)}
              type="email"
              placeholder="Email for magic link"
              className="w-52 rounded-lg border border-panelSoft bg-bg px-3 py-2 text-xs text-text outline-none focus:border-teal"
            />
            <button
              type="button"
              onClick={onSendMagicLink}
              className="rounded-lg border border-teal/60 bg-teal/15 px-3 py-2 text-xs font-semibold text-teal"
            >
              Magic Link
            </button>
            <button
              type="button"
              onClick={onGuestMode}
              className="rounded-lg border border-panelSoft bg-bg px-3 py-2 text-xs font-semibold text-text"
            >
              Guest Mode
            </button>
            <button
              type="button"
              onClick={onSignOut}
              className="rounded-lg border border-panelSoft bg-bg px-3 py-2 text-xs font-semibold text-muted"
            >
              Sign Out
            </button>
          </div>
        </div>
        <p className="mt-3 text-xs text-mint">{authNote}</p>
      </header>

      <div className="mt-5">
        <QuickAccess
          scenarios={scenarios}
          activeScenarioId={activeScenarioId}
          onSelect={(id) => void onScenarioSelect(id)}
        />
      </div>

      <section className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <MetricsPanel telemetry={telemetry} />
          <LogsPanel logs={telemetry?.logs ?? []} />
          <TracePanel traces={telemetry?.traces ?? []} />
        </div>

        <TimelinePanel
          steps={timelineVisible}
          streaming={timelineStreaming}
          provider={runData?.provider}
          policyVerdict={runData?.policyVerdict}
          reasoning={runData?.reasoning}
        />
      </section>

      <section className="mt-5">
        <CopilotPanel messages={chatMessages} busy={chatBusy} onSend={sendMessage} />
      </section>
    </main>
  );
}

function getOrCreateGuestId(): string {
  const existing = window.localStorage.getItem(GUEST_UID_KEY);
  if (existing) {
    return existing;
  }

  const created = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `guest-${Date.now()}`;

  window.localStorage.setItem(GUEST_UID_KEY, created);
  return created;
}
