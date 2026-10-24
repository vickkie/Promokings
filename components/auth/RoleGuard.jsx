import React, { useContext } from "react";

import { AuthContext } from "./AuthContext";
import NoAccessScreen from "./NoAccessScreen";

// Renders children only when the decoded-token `role` claim matches one of
// the required roles. Anything else (wrong role, no session) gets the
// NoAccess fallback instead of mounting staff UI (MB-UI-003).
const RoleGuard = ({ roles, children }) => {
  const { hasRole } = useContext(AuthContext);
  const required = Array.isArray(roles) ? roles : [roles];
  return required.some((role) => hasRole(role)) ? children : <NoAccessScreen />;
};

// Wraps a Stack.Screen component so registration order stays unchanged and
// the guard remounts with the screen. Wrapped once at module scope in App.js
// so the component identity is stable.
export const requireRole = (roles, Component) => {
  const GuardedComponent = (props) => (
    <RoleGuard roles={roles}>
      <Component {...props} />
    </RoleGuard>
  );
  return GuardedComponent;
};

export default RoleGuard;
