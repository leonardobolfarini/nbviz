import React from "react";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
  <div
    className="grid min-h-dvh grid-cols-1 bg-cover bg-center bg-no-repeat p-4 sm:p-6 md:grid-cols-2 md:p-8"
    style={{ backgroundImage: "url('/login_background.png')" }}
  >{children}</div>
  )
}
