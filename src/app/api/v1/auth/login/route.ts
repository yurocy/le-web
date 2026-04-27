import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    // TODO: Replace with real authentication logic (database lookup, password hashing, etc.)
    // For development: accept any non-empty username/password
    if (!username || !password) {
      return NextResponse.json(
        { message: '用户名和密码不能为空' },
        { status: 400 }
      )
    }

    // Mock user verification (in production, verify against database)
    if (password.length < 3) {
      return NextResponse.json(
        { message: '密码格式不正确' },
        { status: 401 }
      )
    }

    // Mock JWT token generation (in production, use proper JWT library)
    const mockToken = `mock_jwt_${Date.now()}_${Math.random().toString(36).substring(2)}`
    const mockRefreshToken = `mock_refresh_${Date.now()}_${Math.random().toString(36).substring(2)}`

    const user = {
      id: 'usr_001',
      username,
      name: username === 'admin' ? '管理员' : username,
      role: 'admin',
    }

    return NextResponse.json({
      token: mockToken,
      refreshToken: mockRefreshToken,
      user,
    })
  } catch {
    return NextResponse.json(
      { message: '服务器内部错误，请稍后重试' },
      { status: 500 }
    )
  }
}
