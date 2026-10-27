// @ts-check
import { useContext, useEffect, useRef, useState } from "react";

import { AuthContext } from "./AuthContext";
import Routes, { ROLE_ROUTES } from "../../navigation/routes";
import { navigationRef } from "../../navigation/navigationRef";

// Replays the login-time role dispatch for restored sessions: a staff user
// relaunching the app lands on their staff navigator instead of the default
// shopper tabs. Only fires while the stack is still at the cold start
// BottomNavigation landing, so it cannot override a live navigation.
// Also resets to the shopper landing when a session ends deep inside a
// role-guarded stack, instead of leaving a NoAccess screen behind.
const SessionRoleRedirect = () => {
  const { userData, getRole } = useContext(AuthContext);
  const redirectedRef = useRef(false);
  const hadSessionRef = useRef(false);
  const [retryTick, setRetryTick] = useState(0);

  useEffect(() => {
    if (!userData) {
      if (hadSessionRef.current && navigationRef.isReady()) {
        const rootState = navigationRef.getRootState();
        const topRoute = rootState?.routes?.[rootState.index ?? 0]?.name;
        if (topRoute && topRoute !== Routes.BottomNavigation) {
          navigationRef.reset({
            index: 0,
            routes: [{ name: Routes.BottomNavigation, params: { screen: Routes.Home } }],
          });
        }
      }
      return;
    }

    hadSessionRef.current = true;

    if (redirectedRef.current) {
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
