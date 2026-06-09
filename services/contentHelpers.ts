import {
    deleteDoc,
    doc,
    getDoc,
    increment,
    setDoc,
    updateDoc,
} from "firebase/firestore";
import { auth, db } from "./firebaseConfig";

export const getWikipediaUrl = (name: string) => {
  const title = encodeURIComponent(name.replace(/\s+/g, "_"));
  return `https://en.wikipedia.org/wiki/${title}`;
};

export const getYouTubeSearchUrl = (name: string) => {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(name + " documentary")}`;
};

export const getWikipediaSummary = async (name: string) => {
  try {
    const title = name.replace(/\s+/g, "_");
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
      title,
    )}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      title: data.title,
      description: data.description,
      extract: data.extract,
      thumbnail: data.thumbnail?.source || null,
      pageUrl:
        data.content_urls?.desktop?.page ||
        `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
    };
  } catch (e) {
    return null;
  }
};

export const likeKey = (type: string, id: string) => `${type}_${id}`;

export const isLiked = async (type: string, id: string) => {
  const user = auth.currentUser;
  if (!user) return false;
  const docRef = doc(db, "likes", `${user.uid}_${likeKey(type, id)}`);
  const snap = await getDoc(docRef);
  return snap.exists();
};

export const toggleLike = async (type: string, id: string, meta: any = {}) => {
  const user = auth.currentUser;
  if (!user) throw new Error("Usuário não autenticado");
  const docId = `${user.uid}_${likeKey(type, id)}`;
  const docRef = doc(db, "likes", docId);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    await deleteDoc(docRef);
    return false;
  } else {
    await setDoc(docRef, {
      userId: user.uid,
      type,
      itemId: id,
      meta,
      createdAt: new Date().toISOString(),
    });
    return true;
  }
};

export const publishQuizScore = async (points: number) => {
  const user = auth.currentUser;
  if (!user) return null;
  const userRef = doc(db, "usuarios", user.uid);
  try {
    // increment xp and recompute level
    await updateDoc(userRef, { xp: increment(points) });
    const snap = await getDoc(userRef);
    const xp = snap.exists() ? snap.data().xp || 0 : 0;
    const nivel = Math.max(1, Math.floor(xp / 100) + 1);
    await updateDoc(userRef, { nivel });
    return { xp, nivel };
  } catch (e) {
    // if user doc doesn't exist, create it
    await setDoc(
      userRef,
      { xp: points, nivel: Math.max(1, Math.floor(points / 100) + 1) },
      { merge: true },
    );
    return { xp: points, nivel: Math.max(1, Math.floor(points / 100) + 1) };
  }
};
