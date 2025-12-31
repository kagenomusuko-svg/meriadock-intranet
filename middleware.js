import { NextResponse } from "next/server";

// Middleware handler
export async function middleware(req) {
  // Obtener el token de autenticación desde las cookies
  const token = req.cookies.get("access_token");

  // Si no hay token, redirigir al login
  if (!token) {
    const url = req.nextUrl.clone(); // Clonar la URL original

    // Permitir el acceso a '/login' y a recursos estáticos bajo '/_next' y '/public'
    if (
      url.pathname.startsWith("/login") ||
      url.pathname.startsWith("/_next") || // Recursos de Next.js como CSS/JS
      url.pathname.startsWith("/logo.svg") // Acceso al recurso específico
    ) {
      return NextResponse.next();
    }

    // De lo contrario, redirigir al login
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Si el token existe, permitir continuar
  return NextResponse.next();
}

// Configuración para el middleware
export const config = {
  matcher: [
    "/((?!login|api/public).*)" // Asegúrate de proteger todo excepto login y APIs públicas
  ],
};
