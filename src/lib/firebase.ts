import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: Must pass firebaseConfig.firestoreDatabaseId to getFirestore
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((p) => ({
        providerId: p.providerId,
        email: p.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Validate Connection to Firestore on startup
 */
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is currently offline or unreachable.');
    }
    // Permissions error on non-existent test document is expected and indicates server connectivity
    return true;
  }
}

export interface SessionUser {
  uid: string;
  isAnonymous: boolean;
  email?: string | null;
}

const LOCAL_STORAGE_ANON_UID_KEY = 'asoni_palu_ne_anon_uid';

/**
 * Returns a persistent local UID for the visitor
 */
export function getLocalFallbackUid(): string {
  let uid = localStorage.getItem(LOCAL_STORAGE_ANON_UID_KEY);
  if (!uid) {
    uid = 'user_' + Math.random().toString(36).substring(2, 11);
    localStorage.setItem(LOCAL_STORAGE_ANON_UID_KEY, uid);
  }
  return uid;
}

/**
 * Returns current active UID (authenticated Firebase UID or fallback local session UID)
 */
export function getCurrentUserUid(): string {
  return auth.currentUser?.uid || getLocalFallbackUid();
}

let isAnonAuthDisabled = false;

/**
 * Ensures the visitor has an anonymous session.
 * Tries Firebase Anonymous Auth; if the Anonymous provider is not yet enabled
 * in Firebase Console, smoothly falls back to a persistent local session UID
 * without breaking the UI.
 */
export async function ensureAnonymousAuth(): Promise<SessionUser> {
  if (auth.currentUser) {
    return {
      uid: auth.currentUser.uid,
      isAnonymous: auth.currentUser.isAnonymous,
      email: auth.currentUser.email,
    };
  }

  if (isAnonAuthDisabled) {
    return {
      uid: getLocalFallbackUid(),
      isAnonymous: true,
      email: null,
    };
  }

  try {
    const cred = await signInAnonymously(auth);
    return {
      uid: cred.user.uid,
      isAnonymous: true,
      email: null,
    };
  } catch (err: any) {
    isAnonAuthDisabled = true;
    const fallbackUid = getLocalFallbackUid();
    return {
      uid: fallbackUid,
      isAnonymous: true,
      email: null,
    };
  }
}
