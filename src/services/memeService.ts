import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  increment,
} from 'firebase/firestore';
import { db, ensureAnonymousAuth, getCurrentUserUid, handleFirestoreError, OperationType } from '../lib/firebase';
import { CommunityMeme } from '../types/meme';
import { checkContentModeration } from '../lib/moderation';

export const STARTER_COMMUNITY_MEMES: CommunityMeme[] = [
  {
    id: 'starter-meme-1',
    authorUid: 'author-golaghat-1',
    nickname: 'Babu_Golaghatia',
    setup: 'Dost: Eibar Babu Asoni pale ki koribi bhai?',
    punchline: 'Babu: 1st din chicken party, 2nd din petrol, 3rd din punor "Bhai 50 taka asene?" 😂',
    category: 'babu',
    status: 'published',
    sharesCount: 14,
    laughCount: 42,
    createdAt: Date.now() - 3600000 * 3,
  },
  {
    id: 'starter-meme-2',
    authorUid: 'author-golaghat-2',
    nickname: 'Moina_Queen',
    setup: 'Maa: Moina asoni pale ki koribi?',
    punchline: 'Moina: Eku nohoi maa, 1000 taka-r earring kinim, baki 500 taka-r golaghat market-ot momo kham! 🛍️🥟',
    category: 'moina',
    status: 'published',
    sharesCount: 28,
    laughCount: 56,
    createdAt: Date.now() - 3600000 * 7,
  },
  {
    id: 'starter-meme-3',
    authorUid: 'author-golaghat-3',
    nickname: 'Dergaon_Rider',
    setup: 'Golaghat College Gate-ot Senior:',
    punchline: 'Junior, class ketiyaba koribi ne direct Babu asoni form fill-up koribi? 🍗',
    category: 'golaghat',
    status: 'published',
    sharesCount: 9,
    laughCount: 31,
    createdAt: Date.now() - 3600000 * 12,
  },
];

const LOCAL_STORAGE_MEME_LAUGHS = 'asoni_palu_ne_meme_laughs';
const LOCAL_STORAGE_CUSTOM_MEMES = 'asoni_palu_ne_custom_memes';

export function getLocalMemeLaughs(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_MEME_LAUGHS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveLocalMemeLaugh(memeId: string): void {
  try {
    const map = getLocalMemeLaughs();
    map[memeId] = true;
    localStorage.setItem(LOCAL_STORAGE_MEME_LAUGHS, JSON.stringify(map));
  } catch {
    // Ignore storage issues
  }
}

/**
 * Real-time subscription to community-submitted memes
 */
export function subscribeToCommunityMemes(
  onData: (memes: CommunityMeme[]) => void,
  limitCount: number = 20
): () => void {
  const colRef = collection(db, 'communityMemes');
  const q = query(colRef, orderBy('createdAt', 'desc'), limit(limitCount));

  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        // Fallback to starter memes merged with any locally created custom memes
        let custom: CommunityMeme[] = [];
        try {
          const raw = localStorage.getItem(LOCAL_STORAGE_CUSTOM_MEMES);
          if (raw) custom = JSON.parse(raw);
        } catch {}
        onData([...custom, ...STARTER_COMMUNITY_MEMES]);
        return;
      }

      const list: CommunityMeme[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          authorUid: data.authorUid || '',
          nickname: data.nickname || 'Golaghatia',
          setup: data.setup || '',
          punchline: data.punchline || '',
          category: data.category || 'babu',
          status: data.status || 'published',
          sharesCount: data.sharesCount || 0,
          laughCount: data.laughCount || 0,
          createdAt: typeof data.createdAt === 'string' ? new Date(data.createdAt).getTime() : (data.createdAt || Date.now()),
        };
      });

      // Filter visible
      onData(list.filter((m) => m.status === 'published'));
    },
    (err) => {
      console.warn('Community memes subscription notice:', err.message);
      let custom: CommunityMeme[] = [];
      try {
        const raw = localStorage.getItem(LOCAL_STORAGE_CUSTOM_MEMES);
        if (raw) custom = JSON.parse(raw);
      } catch {}
      onData([...custom, ...STARTER_COMMUNITY_MEMES]);
    }
  );
}

/**
 * Submits a new community meme
 */
export async function submitCommunityMeme(
  setup: string,
  punchline: string,
  category: 'moina' | 'babu' | 'golaghat',
  nickname: string
): Promise<string> {
  const cleanSetup = setup.trim();
  const cleanPunchline = punchline.trim();
  const cleanNickname = nickname.trim();

  if (cleanSetup.length < 3 || cleanSetup.length > 300) {
    throw new Error('Setup text must be between 3 and 300 characters.');
  }

  if (cleanPunchline.length < 2 || cleanPunchline.length > 300) {
    throw new Error('Punchline must be between 2 and 300 characters.');
  }

  // Content moderation check
  const modSetup = checkContentModeration(cleanSetup);
  if (!modSetup.isAllowed) {
    throw new Error(modSetup.reason || 'Meme contains disallowed content.');
  }

  const modPunch = checkContentModeration(cleanPunchline);
  if (!modPunch.isAllowed) {
    throw new Error(modPunch.reason || 'Punchline contains disallowed content.');
  }

  const user = await ensureAnonymousAuth();
  const memeId = 'meme_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const docRef = doc(db, 'communityMemes', memeId);

  const newMeme: CommunityMeme = {
    id: memeId,
    authorUid: user.uid,
    nickname: cleanNickname,
    setup: cleanSetup,
    punchline: cleanPunchline,
    category,
    status: 'published',
    sharesCount: 0,
    laughCount: 1,
    createdAt: Date.now(),
  };

  try {
    await setDoc(docRef, {
      ...newMeme,
      createdAt: new Date().toISOString(),
    });
    return memeId;
  } catch (error) {
    // If Firestore write fails, backup to local custom memes so the user still sees their meme
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_CUSTOM_MEMES);
      const list: CommunityMeme[] = raw ? JSON.parse(raw) : [];
      list.unshift(newMeme);
      localStorage.setItem(LOCAL_STORAGE_CUSTOM_MEMES, JSON.stringify(list));
      return memeId;
    } catch {}
    handleFirestoreError(error, OperationType.CREATE, `communityMemes/${memeId}`);
  }
}

/**
 * Increments share count for a meme and tracks it
 */
export async function incrementMemeShare(memeId: string): Promise<void> {
  if (memeId.startsWith('starter-')) {
    return;
  }

  try {
    const docRef = doc(db, 'communityMemes', memeId);
    await updateDoc(docRef, {
      sharesCount: increment(1),
    });
  } catch (err) {
    console.warn('Share count increment notice:', err);
  }
}

/**
 * Increments laugh count for a meme
 */
export async function incrementMemeLaugh(memeId: string): Promise<void> {
  saveLocalMemeLaugh(memeId);

  if (memeId.startsWith('starter-')) {
    return;
  }

  try {
    const docRef = doc(db, 'communityMemes', memeId);
    await updateDoc(docRef, {
      laughCount: increment(1),
    });
  } catch (err) {
    console.warn('Laugh count increment notice:', err);
  }
}

/**
 * Deletes a community meme
 */
export async function deleteCommunityMeme(memeId: string): Promise<void> {
  if (memeId.startsWith('starter-')) {
    return;
  }

  try {
    const docRef = doc(db, 'communityMemes', memeId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `communityMemes/${memeId}`);
  }
}

/**
 * Formats a community meme for WhatsApp / Facebook / Clipboard sharing
 */
export function formatMemeForSharing(meme: CommunityMeme, appUrl: string = window.location.origin): string {
  const categoryLabel = meme.category === 'moina' ? '🌸 Moina Asoni Meme' : meme.category === 'babu' ? '🍗 Babu Asoni Meme' : '📍 Golaghat Meme';
  return `😂 ${categoryLabel} by @${meme.nickname}\n\n"${meme.setup}"\n👉 "${meme.punchline}"\n\nLaugh & share more Golaghat comedy:\n${appUrl}`;
}
