"use client";

import {
  isSignInWithEmailLink,
  onAuthStateChanged,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signOut
} from "firebase/auth";
import { useEffect, useState } from "react";

import { auth, isFirebaseConfigured } from "../lib/firebase";
import { AUTH_EMAIL_KEY, getOrCreateGuestId } from "../lib/session";
import type { SessionState } from "../store/use-aiops-store";

export function useAuthSession(setSession: (session: SessionState) => Promise<void>) {
  const [emailInput, setEmailInput] = useState("");
  const [authNote, setAuthNote] = useState("Guest demo mode available");

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
    try {
      if (auth) {
        await signOut(auth);
      }
    } catch {
      setAuthNote("Sign out failed. Falling back to guest mode.");
    }

    const guestId = getOrCreateGuestId();
    await setSession({ uid: guestId, mode: "guest" });
    setAuthNote("Signed out, guest mode resumed");
  };

  return {
    emailInput,
    setEmailInput,
    authNote,
    onGuestMode,
    onSendMagicLink,
    onSignOut
  };
}
