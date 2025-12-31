import Link from "next/link";
import { useAuth } from "../context/AuthContext";

export default function Footer() {
  const { user } = useAuth();

  // Manejar valores vacíos en caso de que no se pueda obtener el perfil
  const nombre = user?.profile?.nombre_completo || "Usuario no identificado";
  const nisuv = user?.profile?.nisuv || "NISUV no disponible";

  return (
    <footer className="site-footer mt-8">
      <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row justify-between items-start gap-6">
        
        {/* Columna izquierda: logo + nombre + frase */}
        <div className="flex items-start gap-4">
          <img
            src="/logo.svg"
            alt="Logo AC"
            style={{
              width: 96,
              height: 96,
              objectFit: "contain",
              filter: "grayscale(1) brightness(0.95) invert(0.95) saturate(0%)",
            }}
          />
          <div>
            <div
              className="font-semibold"
              style={{ color: "var(--meriadock-silver)" }}
            >
              Centro Multidisciplinario Meriadock
            </div>
            <div
              className="text-sm mb-2"
              style={{ color: "var(--meriadock-silver)" }}
            >
              Formación y Asesoría A.C.
            </div>
            <div
              className="text-sm italic"
              style={{ color: "var(--meriadock-silver)" }}
            >
              "La fuerza interior nos impulsa, un pequeño apoyo de los demás nos bendice"
            </div>
          </div>
        </div>

        {/* Columnas de menú */}
        <div className="flex gap-8 text-sm">
          <div>
            <h4
              className="font-semibold"
              style={{ color: "var(--meriadock-silver)" }}
            >
              Institucional
            </h4>
            <ul
              className="mt-2 space-y-1"
              style={{ color: "var(--meriadock-silver)" }}
            >
              <li><Link href="/normatividad">Normatividad</Link></li>
              <li><Link href="/formatos-institucionales">Formatos Institucionales</Link></li>
              <li><Link href="/avisos-internos">Avisos Internos</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Línea divisoria + nombre | nisuv */}
      <div
        className="border-t py-4 flex flex-col items-center"
        style={{ borderColor: "rgba(217,217,217,0.08)" }}
      >
        {user && (
          <div
            className="text-sm"
            style={{ color: "var(--meriadock-silver)" }}
          >
            {nombre} | {nisuv}
          </div>
        )}
        <div
          className="text-xs mt-1"
          style={{ color: "var(--meriadock-silver)" }}
        >
          © {new Date().getFullYear()} Centro Multidisciplinario Meriadock — Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}