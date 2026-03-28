import { Navigate } from "react-router-dom";
import { useDemoScenario } from "../hooks/useDemoScenario";
import type { PropsWithChildren } from "react";

export const GuardedRoute = ({ children }: PropsWithChildren) => {
  const { selectedUser } = useDemoScenario();

  if (!selectedUser) {
    return <Navigate to="/" replace />;
  }

  return children;
};
