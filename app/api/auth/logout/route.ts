import { NextResponse } from "next/server"

import { clearSessionCookie, destroyCurrentSession } from "@/lib/server/auth"
import { withErrorBoundary } from "@/lib/server/api"

export async function POST() {
  return withErrorBoundary(async () => {
    await destroyCurrentSession()
    const response = NextResponse.json({
      success: true,
      data: { signedOut: true },
    })

    return clearSessionCookie(response)
  })
}
