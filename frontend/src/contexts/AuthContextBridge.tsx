import React from "react";
import { AuthProvider } from "./AuthContext";

export default function AuthContextBridge({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProvider>{children}</AuthProvider>;
}

