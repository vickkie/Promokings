import { useEffect, useContext } from "react";
import axios from "axios";
import { signInWithCustomToken } from "firebase/auth";
import { BACKEND_PORT } from "@env";
import { AuthContext } from "./AuthContext";
import { auth } from "./firebase";

// Signs the client into Firebase with a custom token minted by the backend so
// RTDB writes satisfy the auth.uid-scoped security rules (BE B3-7). Without
// this every client-side message write is PERMISSION_DENIED.
export default function FirebaseSessionSync() {
  const { userData } = useContext(AuthContext);

  useEffect(() => {
    if (!userData?._id) {
      if (auth.currentUser) {
        auth.signOut().catch(() => {});
      }
      return;
    }

    let cancelled = false;
    axios
      .post(`${BACKEND_PORT}/api/auth/firebase-token`)
      .then((res) => {
        if (!cancelled && res.data?.firebaseToken) {
          return signInWithCustomToken(auth, res.data.firebaseToken);
        }
      })
      .catch((err) => {
        console.error("Firebase session sign-in failed:", err?.message || err);
      });

    return () => {
      cancelled = true;
    };
  }, [userData?._id]);

  return null;
}
