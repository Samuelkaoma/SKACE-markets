import { NextResponse } from "next/server"

import { DemoLoginSchema } from "@/lib/contracts/api"
import { attachSessionCookie, createSessionForDemoUser } from "@/lib/server/auth"
import { parseBody, withErrorBoundary } from "@/lib/server/api"

export async function POST(request: Request) {
  return withErrorBoundary(async () => {
    const { userId, demoCode } = await parseBody(request, DemoLoginSchema)
    const session = createSessionForDemoUser(userId, demoCode)
    const response = NextResponse.json({
      success: true,
      data: {
        user: session.user,
      },
    })

    return attachSessionCookie(response, session.sessionId, session.expiresAt)
  })
}
