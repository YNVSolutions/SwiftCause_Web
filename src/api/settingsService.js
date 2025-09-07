import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { app } from "../lib/firebase";

const db = getFirestore(app);


export async function getPaymentConfig() {
  const docRef = doc(db, "settings", "paymentConfig");
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data();
  }
  return { defaultCurrency: "usd" };
}


export async function updatePaymentConfig(configData) {
  const docRef = doc(db, "settings", "paymentConfig");
  await setDoc(docRef, configData, { merge: true });
}