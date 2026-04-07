"use client";

import {
  isSignInWithEmailLink,
  onAuthStateChanged,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signOut
} from "firebase/auth";
import { useCallback, useEffect, useState } from "react";

import { isLocalDemoMode } from "../lib/app-mode";
import { auth, isFirebaseConfigured } from "../lib/firebase";
import { AUTH_EMAIL_KEY, getOrCreateGuestId } from "../lib/session";
import type { SessionState } from "../store/use-aiops-store";

type AuthState = "local-demo" | "firebase-enabled" | "firebase-missing";

export function useAuthSession(setSession: (session: SessionState) => Promise<void>) {
  const [emailInput, setEmailInput] = useState("");
  const [authNote, setAuthNote] = useState("Guest demo mode available");
  const authState: AuthState = resolveAuthState();

  const switchToGuestMode = useCallback(
    async (note: string) => {
      const guestId = getOrCreateGuestId();
      await setSession({ uid: guestId, mode: "guest" });
      setAuthNote(note);
    },
    [setSession]
  );

  useEffect(() => {
    if (isLocalDemoMode) {
      void switchToGuestMode(
        "Local demo mode active. Authentication and Firebase quota usage are disabled."
      );
      return;
    }

    const authClient = auth;

    if (!isFirebaseConfigured || !authClient) {
      void switchToGuestMode("Firebase not configured. Running in guest demo mode.");
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

      await switchToGuestMode("Using guest session");
    });

    return () => unsubscribe();
  }, [switchToGuestMode]);

  const onGuestMode = async () => {
    await switchToGuestMode("Guest mode enabled");
  };

  const onSendMagicLink = async () => {
    if (authState === "local-demo") {
      setAuthNote("Magic link is disabled in local demo mode.");
      return;
    }

    if (authState !== "firebase-enabled" || !auth) {
      setAuthNote("Firebase auth is not configured.");
      return;
    }

    const email = emailInput.trim();
    if (!email) {
      setAuthNote("Enter an email to receive the magic link.");
      return;
    }

    try {
      await sendSignInLinkToEmail(auth, email, {
        url: window.location.origin,
        handleCodeInApp: true
      });

      window.localStorage.setItem(AUTH_EMAIL_KEY, email);
      setAuthNote(`Magic link sent to ${email}`);
    } catch {
      setAuthNote("Unable to send magic link right now. Please retry.");
    }
  };

  const onSignOut = async () => {
    if (authState === "local-demo") {
      await switchToGuestMode("Local demo mode keeps guest session active.");
      return;
    }

    try {
      if (auth) {
        await signOut(auth);
      }
    } catch {
      setAuthNote("Sign out failed. Falling back to guest mode.");
    }

    await switchToGuestMode("Signed out, guest mode resumed");
  };

  return {
    authEnabled: authState === "firebase-enabled",
    authState,
    emailInput,
    setEmailInput,
    authNote,
    onGuestMode,
    onSendMagicLink,
    onSignOut
  };
}

function resolveAuthState(): AuthState {
  if (isLocalDemoMode) {
    return "local-demo";
  }

  return isFirebaseConfigured ? "firebase-enabled" : "firebase-missing";
}
