import { randomUUID } from "node:crypto";

import type { FastifyBaseLogger } from "fastify";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

import { env } from "../config/env";

interface SessionRecord {
  uid: string;
  email?: string;
  mode: "guest" | "auth";
  createdAt: string;
}

interface AuditRecord {
  id: string;
  event: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface SessionStore {
  saveSession(record: SessionRecord): Promise<void>;
  addAuditLog(event: string, payload: Record<string, unknown>): Promise<void>;
}

export function createSessionStore(logger: FastifyBaseLogger): SessionStore {
  if (
    env.firestoreEnabled &&
    env.firebaseProjectId &&
    env.firebaseClientEmail &&
    env.firebasePrivateKey
  ) {
    return createFirestoreStore(logger);
  }

  logger.info("Firestore not enabled or missing credentials. Using in-memory session store.");
  return createInMemoryStore();
}

function createFirestoreStore(logger: FastifyBaseLogger): SessionStore {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: env.firebaseProjectId,
        clientEmail: env.firebaseClientEmail,
        privateKey: env.firebasePrivateKey
      })
    });
  }

  const db = getFirestore();

  return {
    async saveSession(record) {
      await db.collection("sessions").doc(record.uid).set(record, { merge: true });
    },
    async addAuditLog(event, payload) {
      const entry: AuditRecord = {
        id: randomUUID(),
        event,
        payload,
        createdAt: new Date().toISOString()
      };

      await db.collection("aiops_logs").doc(entry.id).set(entry);
    }
  };
}

function createInMemoryStore(): SessionStore {
  const sessions = new Map<string, SessionRecord>();
  const logs: AuditRecord[] = [];

  return {
    async saveSession(record) {
      sessions.set(record.uid, record);
    },
    async addAuditLog(event, payload) {
      logs.push({
        id: randomUUID(),
        event,
        payload,
        createdAt: new Date().toISOString()
      });

      if (logs.length > 200) {
        logs.shift();
      }
    }
  };
}
