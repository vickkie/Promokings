import { ref, set } from "firebase/database";
import { db } from "./firebase";

const updateFirebaseUserOneSignalId = (userId, playerId) => {
  set(ref(db, `users/${userId}/onesignalId`), playerId)
    .then(() => console.log("Firebase updated with OneSignal ID"))
    .catch((error) => console.error("Error updating Firebase with OneSignal ID:", error));
};

export default updateFirebaseUserOneSignalId;
