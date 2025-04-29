import React, { createContext, useState, useEffect, useContext } from "react";
import { useRoute, useNavigation } from "@react-navigation/native";

// import { AuthContext } from "./AuthContext";

const RouteContext = createContext();

const RouteProvider = ({ children }) => {
  //   const { userData, hasRole } = useContext(AuthContext);
  const navigation = useNavigation();

  //   const route = useRoute();
  console.log(navigation.getState()?.key, "h");

  const navigateWhere = () => {};

  const routeContextValue = { navigateWhere };
  return <RouteContext.Provider value={routeContextValue}>{children}</RouteContext.Provider>;
};

export { RouteContext, RouteProvider };
