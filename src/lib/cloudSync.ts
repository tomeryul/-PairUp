import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  useAppStore,
  getCloudState,
  type CloudState,
} from '@/store/useAppStore';

/**
 * Keeps the local Zustand store and the user's Firestore document in sync.
 *
 * - On start: pull the remote doc (or seed it from local state on first login).
 * - Remote → local: an onSnapshot listener applies server changes.
 * - Local → remote: store changes are debounced and pushed up.
 *
 * An `applyingRemote` guard prevents the snapshot→store→push echo loop.
 */
let unsubStore: (() => void) | null = null;
let unsubSnapshot: (() => void) | null = null;
let pushTimer: ReturnType<typeof setTimeout> | null = null;
let applyingRemote = false;
let currentUid: string | null = null;

const userDoc = (uid: string) => doc(db!, 'users', uid);

const pushNow = async (uid: string) => {
  if (!db) return;
  try {
    await setDoc(userDoc(uid), { ...getCloudState(), updatedAt: Date.now() }, {
      merge: true,
    });
  } catch (err) {
    console.error('[cloudSync] push failed', err);
  }
};

const schedulePush = (uid: string) => {
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => void pushNow(uid), 700);
};

export async function startCloudSync(uid: string): Promise<void> {
  if (!db) return;
  if (currentUid === uid) return;
  stopCloudSync();
  currentUid = uid;

  // 1. Initial load (or seed).
  try {
    const snap = await getDoc(userDoc(uid));
    if (snap.exists()) {
      applyRemote(snap.data() as Partial<CloudState>);
    } else {
      // First login on this account — seed it with whatever we have locally.
      await pushNow(uid);
    }
  } catch (err) {
    console.error('[cloudSync] initial load failed', err);
  }

  // 2. Remote → local (skip our own pending local writes to avoid loops).
  unsubSnapshot = onSnapshot(userDoc(uid), (snap) => {
    if (snap.metadata.hasPendingWrites) return;
    if (!snap.exists()) return;
    applyRemote(snap.data() as Partial<CloudState>);
  });

  // 3. Local → remote (debounced), ignoring changes we applied from remote.
  unsubStore = useAppStore.subscribe(() => {
    if (applyingRemote) return;
    if (!currentUid) return;
    schedulePush(currentUid);
  });
}

function applyRemote(data: Partial<CloudState>) {
  applyingRemote = true;
  try {
    useAppStore.getState().applyCloudState(data);
  } finally {
    // Store subscribers fire synchronously during the set above, so the
    // guard is safely released only after they have all run.
    applyingRemote = false;
  }
}

export function stopCloudSync(): void {
  if (pushTimer) {
    clearTimeout(pushTimer);
    pushTimer = null;
  }
  if (unsubStore) {
    unsubStore();
    unsubStore = null;
  }
  if (unsubSnapshot) {
    unsubSnapshot();
    unsubSnapshot = null;
  }
  currentUid = null;
}
