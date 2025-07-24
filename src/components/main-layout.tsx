"use client"

import React, { useEffect, useRef } from "react"
import { useAuth } from "@/context/auth-context"

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { interfaceSettings } = useAuth()
  const prevTheme = useRef<string | undefined>()

  useEffect(() => {
    const root = document.documentElement

    // Quita la clase de tema anterior, si existe
    if (prevTheme.current) {
      root.classList.remove(prevTheme.current)
    }

    // Aplica la clase de tema actual
    if (interfaceSettings?.theme) {
      root.classList.add(interfaceSettings.theme)
      prevTheme.current = interfaceSettings.theme
    } else {
      prevTheme.current = undefined
    }
  }, [interfaceSettings?.theme])

  return <div className="h-full">{children}</div>
}
