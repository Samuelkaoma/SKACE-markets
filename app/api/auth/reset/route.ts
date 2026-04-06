import { NextResponse } from "next/server"

import { clearSessionCookie } from "@/lib/server/auth"
import { resetMarketplaceData } from "@/lib/server/marketplace-repository"
import { withErrorBoundary } from "@/lib/server/api"

export async function POST() {
  return withErrorBoundary(async () => {
    resetMarketplaceData()
    const response = NextResponse.json({
      success: true,
      data: { reset: true },
    })

    return clearSessionCookie(response)
  })
}
