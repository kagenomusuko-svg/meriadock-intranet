import { NextResponse } from "next/server";

// Middleware handler
export async function middleware(req) {
  // Obtener el token de autenticación y la cookie temporal
  const token = req.cookies.get("access_token");
  const authenticated = req.cookies.get("authenticated");

  // Revisar si no hay autenticación (ni token ni cookie "authenticated")
  if (!token && !authenticated) {
    const url = req.nextUrl.clone(); // Clonar la URL original

    // Permitir el acceso al login y a recursos públicos/estáticos
    if (
      url.pathname.startsWith("/login") ||
      url.pathname.startsWith("/_next") || // Recursos de Next.js como CSS/JS
      url.pathname.startsWith("/logo.svg") // Imagen del logo
    ) {
      return NextResponse.next();
    }

    // De lo contrario, redirigir al login
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Si el token o cookie "authenticated" existe, permitir continuar
  return NextResponse.next();
}

// Configuración para el middleware
export const config = {
  matcher: [
    "/((?!login|api/public).*)", // Proteger todas las rutas excepto login y APIs públicas
  ],
};
