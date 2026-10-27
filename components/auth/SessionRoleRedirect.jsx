// @ts-check
import { useContext, useEffect, useRef, useState } from "react";

import { AuthContext } from "./AuthContext";
import Routes, { ROLE_ROUTES } from "../../navigation/routes";
import { navigationRef } from "../../navigation/navigationRef";

// Replays the login-time role dispatch for restored sessions: a staff user
// relaunching the app lands on their staff navigator instead of the default
// shopper tabs. Only fires while the stack is still at the cold start
// BottomNavigation landing, so it cannot override a live navigation.
const SessionRoleRedirect = () => {
  const { userData, getRole } = useContext(AuthContext);
  const redirectedRef = useRef(false);
  const [retryTick, setRetryTick] = useState(0);

  useEffect(() => {
    if (redirectedRef.current || !userData) {
      return;
    }

    const destination = ROLE_ROUTES[getRole(userData)];
    if (!destination) {
      redirectedRef.current = true;
      return;
    }

    if (!navigationRef.isReady()) {
      const timer = setTimeout(() => setRetryTick((v) => v + 1), 250);
      return () => clearTimeout(timer);
    }

    const rootState = navigationRef.getRootState();
    const topRoute = rootState?.routes?.[rootState.index ?? 0]?.name;
    if (topRoute === Routes.BottomNavigation) {
      navigationRef.reset({ index: 0, routes: [{ name: destination }] });
    }
    redirectedRef.current = true;
  }, [userData, getRole, retryTick]);

  return null;
};

export default SessionRoleRedirect;
