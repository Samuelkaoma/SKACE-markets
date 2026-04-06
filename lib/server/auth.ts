import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { NextResponse } from "next/server"

import type { SessionUser, UserRole } from "@/lib/types"
import { createId, getDatabase, nowIso } from "@/lib/server/database"

const SESSION_COOKIE = "skace_session"
const SESSION_DURATION_DAYS = 7

interface SessionRow {
  id: string
  role: UserRole
  name: string
  email: string
  company: string | null
  headline: string | null
}

function getDashboardPath(role: UserRole) {
  if (role === "employer") {
    return "/dashboard/employer"
  }

  if (role === "admin") {
    return "/dashboard/admin"
  }

  return "/dashboard/freelancer"
}

function toSessionUser(row: SessionRow): SessionUser {
  return {
    id: row.id,
    role: row.role,
    name: row.name,
    email: row.email,
    dashboardPath: getDashboardPath(row.role),
    summary:
      row.role === "employer"
        ? `${row.company ?? "Employer"} hiring workspace`
        : row.headline ?? "Marketplace workspace",
  }
}

function getSessionRow(sessionId: string): SessionRow | null {
  const database = getDatabase()
  const row = database
    .prepare(
      `
        SELECT users.id, users.role, users.name, users.email, users.company, users.headline
        FROM sessions
        INNER JOIN users ON users.id = sessions.user_id
        WHERE sessions.id = ? AND sessions.expires_at > ?
      `,
    )
    .get(sessionId, nowIso()) as SessionRow | undefined

  return row ?? null
}

export async function getCurrentSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value

  if (!sessionId) {
    return null
  }

  const session = getSessionRow(sessionId)

  if (!session) {
    return null
  }

  return toSessionUser(session)
}

export async function requireSessionUser(): Promise<SessionUser> {
  const session = await getCurrentSessionUser()

  if (!session) {
    redirect("/auth")
  }

  return session
}

export async function requireRole(role: UserRole): Promise<SessionUser> {
  const session = await requireSessionUser()

  if (session.role !== role) {
    redirect(session.dashboardPath)
  }

  return session
}

export function createSessionForDemoUser(userId: string, demoCode: string) {
  const database = getDatabase()
  const row = database
    .prepare(
      `
        SELECT id, role, name, email, company, headline
        FROM users
        WHERE id = ? AND demo_code = ?
      `,
    )
    .get(userId, demoCode) as SessionRow | undefined

  if (!row) {
    throw new Error("Demo account or access code was not recognised.")
  }

  const sessionId = createId("session")
  const createdAt = nowIso()
  const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000).toISOString()

  database
    .prepare(
      `
        INSERT INTO sessions (id, user_id, role, created_at, expires_at)
        VALUES (?, ?, ?, ?, ?)
      `,
    )
    .run(sessionId, row.id, row.role, createdAt, expiresAt)

  return {
    sessionId,
    expiresAt,
    user: toSessionUser(row),
  }
}

export async function destroyCurrentSession() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value

  if (!sessionId) {
    return
  }

  getDatabase().prepare("DELETE FROM sessions WHERE id = ?").run(sessionId)
}

export function attachSessionCookie(response: NextResponse, sessionId: string, expiresAt: string) {
  response.cookies.set({
    name: SESSION_COOKIE,
    value: sessionId,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
  })

  return response
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  })

  return response
}
