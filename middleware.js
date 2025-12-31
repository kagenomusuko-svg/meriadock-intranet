import { NextResponse } from "next/server";

// Middleware handler
export async function middleware(req) {
  // Obtener el token de autenticación desde las cookies
  const token = req.cookies.get("access_token");

  // Si el token no existe, redirigir al login
  if (!token) {
    const loginUrl = new URL("/login", req.url); // Redirige a login
    return NextResponse.redirect(loginUrl);
  }

  // Si el token existe, el usuario puede continuar a la página solicitada
  return NextResponse.next();
}

// Configurar en qué rutas proteger con el middleware
export const config = {
  matcher: [
    // Todas las rutas excepto login y APIs públicas
    "/((?!login|api/public).*)",
  ],
};
