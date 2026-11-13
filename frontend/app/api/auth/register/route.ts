import { NextRequest, NextResponse } from 'next/server'

const KEYCLOAK_URL =
  process.env.KEYCLOAK_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_KEYCLOAK_URL ||
  'http://localhost:8080'

const KEYCLOAK_ADMIN_USER = process.env.KEYCLOAK_ADMIN_USER || 'admin'
const KEYCLOAK_ADMIN_PASSWORD = process.env.KEYCLOAK_ADMIN_PASSWORD || 'admin'
const REALM = 'mini-commerce'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { username, password, email, firstName, lastName, fullName } = body

    if (!username || typeof username !== 'string' || !username.trim()) {
      return NextResponse.json(
        { error: 'Username is required.' },
        { status: 400 }
      )
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters.' },
        { status: 400 }
      )
    }

    const cleanUsername = username.trim().toLowerCase()

    // Parse names
    let fName = firstName?.trim()
    let lName = lastName?.trim()

    if (!fName && fullName) {
      const parts = fullName.trim().split(/\s+/)
      fName = parts[0] || cleanUsername
      lName = parts.slice(1).join(' ') || 'Customer'
    }

    if (!fName) fName = cleanUsername
    if (!lName) lName = 'Customer'

    const cleanEmail =
      email && typeof email === 'string' && email.includes('@')
        ? email.trim()
        : `${cleanUsername}@aurorahardware.local`

    // 1. Authenticate with Keycloak admin-cli to obtain master admin token
    const tokenParams = new URLSearchParams()
    tokenParams.append('client_id', 'admin-cli')
    tokenParams.append('grant_type', 'password')
    tokenParams.append('username', KEYCLOAK_ADMIN_USER)
    tokenParams.append('password', KEYCLOAK_ADMIN_PASSWORD)

    let tokenRes: Response
    try {
      tokenRes = await fetch(`${KEYCLOAK_URL}/realms/master/protocol/openid-connect/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: tokenParams.toString(),
      })
    } catch (err: any) {
      return NextResponse.json(
        { error: `Unable to connect to Keycloak at ${KEYCLOAK_URL}: ${err.message}` },
        { status: 502 }
      )
    }

    if (!tokenRes.ok) {
      const errText = await tokenRes.text()
      return NextResponse.json(
        { error: `Keycloak admin authentication failed: ${errText}` },
        { status: 500 }
      )
    }

    const tokenData = await tokenRes.json()
    const adminToken = tokenData.access_token

    // 2. Create the user in the mini-commerce realm
    const createUserPayload = {
      username: cleanUsername,
      enabled: true,
      email: cleanEmail,
      emailVerified: true,
      firstName: fName,
      lastName: lName,
      credentials: [
        {
          type: 'password',
          value: password,
          temporary: false,
        },
      ],
    }

    const createRes = await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(createUserPayload),
    })

    if (createRes.status === 409) {
      return NextResponse.json(
        { error: 'An account with this username or email already exists. Please sign in.' },
        { status: 409 }
      )
    }

    if (!createRes.ok) {
      const errData = await createRes.json().catch(() => ({}))
      const errorMsg =
        errData.errorMessage ||
        errData.error ||
        `Keycloak returned status ${createRes.status}`
      return NextResponse.json(
        { error: `Failed to create user: ${errorMsg}` },
        { status: createRes.status }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully in Keycloak.',
        username: cleanUsername,
      },
      { status: 201 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error while registering account.' },
      { status: 500 }
    )
  }
}
