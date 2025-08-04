import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Если пользователь авторизован, но пытается получить доступ к /login или /signup,
    // перенаправляем его на главную страницу.
    if (req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/signup") {
      return NextResponse.redirect(new URL("/", req.url))
    }
    // Все остальные авторизованные запросы разрешены
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Разрешаем доступ к /login и /signup без авторизации
        if (req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/signup") {
          return true
        }
        // Для всех остальных маршрутов требуется токен (авторизация)
        return !!token
      },
    },
    pages: {
      signIn: "/login", // Страница, на которую перенаправлять неавторизованных пользователей
    },
  },
)

export const config = {
  matcher: ["/", "/api/records/:path*", "/api/user-settings/:path*", "/login", "/signup"],
}
