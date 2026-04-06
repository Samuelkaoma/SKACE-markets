import { NextResponse } from "next/server"
import { ZodError, type ZodTypeAny } from "zod"

import { getCurrentSessionUser } from "@/lib/server/auth"
import type { UserRole } from "@/lib/types"

export class RouteError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public fieldErrors?: Record<string, string[]>,
  ) {
    super(message)
  }
}

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

export async function withErrorBoundary(
  handler: () => Promise<NextResponse> | NextResponse,
) {
  try {
    return await handler()
  } catch (error) {
    return toErrorResponse(error)
  }
}

export async function parseBody<TSchema extends ZodTypeAny>(
  request: Request,
  schema: TSchema,
) {
  const body = await request.json()
  return schema.parse(body)
}

export function parseQuery<TSchema extends ZodTypeAny>(
  request: Request,
  schema: TSchema,
) {
  const searchParams = new URL(request.url).searchParams
  return schema.parse(Object.fromEntries(searchParams.entries()))
}

export function invariant(
  condition: unknown,
  status: number,
  code: string,
  message: string,
): asserts condition {
  if (!condition) {
    throw new RouteError(status, code, message)
  }
}

export async function requireApiSession(role?: UserRole) {
  const session = await getCurrentSessionUser()

  if (!session) {
    throw new RouteError(401, "UNAUTHORIZED", "You need to sign in to continue.")
  }

  if (role && session.role !== role) {
    throw new RouteError(403, "FORBIDDEN", "You do not have access to this action.")
  }

  return session
}

function toErrorResponse(error: unknown) {
  if (error instanceof RouteError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          fieldErrors: error.fieldErrors,
        },
      },
      { status: error.status },
    )
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "The request payload is invalid.",
          fieldErrors: error.flatten().fieldErrors,
        },
      },
      { status: 400 },
    )
  }

  console.error(error)

  return NextResponse.json(
    {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong while processing the request.",
      },
    },
    { status: 500 },
  )
}
