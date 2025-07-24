"use client"

import React from "react"
import { AuthGuard } from "@/components/auth-guard"
import { AdminShell } from "@/components/admin-shell"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard adminOnly>
      <AdminShell>{children}</AdminShell>
    </AuthGuard>
  )
}
