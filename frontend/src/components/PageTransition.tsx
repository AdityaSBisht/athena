import type { PropsWithChildren } from "react";

export const PageTransition = ({ children }: PropsWithChildren) => {
  return <div className="animate-slideup">{children}</div>;
};
