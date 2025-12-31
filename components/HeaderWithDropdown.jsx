import Link from "next/link";
import { useState, useRef, useEffect } from "react";

export default function HeaderWithDropdown() {
  const [menuMobile, setMenuMobile] = useState(false);
  const [openConsejo, setOpenConsejo] = useState(false);
  const [openSupervisor, setOpenSupervisor] = useState(false);
  const closeTimer = useRef(null);

  function openWithCancel(ref) {
    clearTimeout(ref.current);
  }

  function closeWithDelay(ref, setter) {
    clearTimeout(ref.current);
    ref.current = setTimeout(() => setter(false), 150);
  }

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const dropdownStyle = { backgroundColor: "#1E4C45", color: "#ffffff" };

  return (
    <header className="site-header fixed top-0 left-0 right-0 z-40 bg-white">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* LOGO */}
        <div className="flex items-center gap-3">
          <img
            src="/logo.svg"
            alt="Logo AC"
            className="h-12 w-auto object-contain"
            style={{ filter: "grayscale(1) brightness(0.95) invert(0.95) saturate(0%)" }}
          />
          <div>
            <div className="text-sm font-semibold" style={{ color: "var(--meriadock-silver)" }}>
              Centro Multidisciplinario Meriadock
            </div>
            <div className="text-xs" style={{ color: "var(--meriadock-silver)" }}>
              Formación y Asesoría A.C.
            </div>
          </div>
        </div>

        {/* DESKTOP MENUS */}
        <nav className="hidden md:block">
          <ul className="flex gap-6 text-sm items-center" style={{ color: "var(--meriadock-silver)" }}>
            <li><Link href="/">Inicio</Link></li>

            {/* CONSEJO */}
            <li
              className="relative"
              onMouseEnter={() => {
                openWithCancel(closeTimer);
                setOpenConsejo(true);
              }}
              onMouseLeave={() => closeWithDelay(closeTimer, setOpenConsejo)}
            >
              <button className="focus:outline-none">Consejo ▼</button>
              {openConsejo && (
                <ul
                  className="absolute top-full left-0 mt-2 border shadow-sm p-2 rounded z-50 min-w-[220px]"
                  style={{ ...dropdownStyle, borderColor: "#174036" }}
                >
                  <li><Link href="/consejo/registrar-programa">Registrar programa</Link></li>
                  <li><Link href="/consejo/modificar-programa">Modificar programa</Link></li>
                  <li><Link href="/consejo/cierre-programa">Cierre de programa</Link></li>
                </ul>
              )}
            </li>

            {/* SUPERVISOR */}
            <li
              className="relative"
              onMouseEnter={() => {
                openWithCancel(closeTimer);
                setOpenSupervisor(true);
              }}
              onMouseLeave={() => closeWithDelay(closeTimer, setOpenSupervisor)}
            >
              <button className="focus:outline-none">Supervisor ▼</button>
              {openSupervisor && (
                <ul
                  className="absolute top-full left-0 mt-2 border shadow-sm p-2 rounded z-50 min-w-[220px]"
                  style={{ ...dropdownStyle, borderColor: "#174036" }}
                >
                  <li><Link href="/supervisor/registrar-beneficiarios">Registrar beneficiarios</Link></li>
                  <li><Link href="/supervisor/beneficiarios-atendidos">Beneficiarios atendidos</Link></li>
                </ul>
              )}
            </li>

            {/* OPERADOR */}
            <li><Link href="/operador/registrar-interaccion">Registrar interacción</Link></li>

            {/* LOGOUT */}
            <li>
              <button className="hover:underline focus:outline-none">Cerrar sesión</button>
            </li>
          </ul>
        </nav>

        {/* MOBILE MENUS */}
        <nav className="md:hidden">
          <button
            onClick={() => setMenuMobile(!menuMobile)}
            className="text-sm focus:outline-none"
          >
            {menuMobile ? "Cerrar ▲" : "Menú ▼"}
          </button>

          {menuMobile && (
            <div className="bg-white border-t shadow-sm p-4">
              <ul className="space-y-2">
                <li><Link href="/">Inicio</Link></li>

                {/* CONSEJO MOBILE */}
                <li>
                  <details>
                    <summary className="cursor-pointer">Consejo</summary>
                    <ul className="pt-2 pl-4 space-y-1">
                      <li><Link href="/consejo/registrar-programa">Registrar programa</Link></li>
                      <li><Link href="/consejo/modificar-programa">Modificar programa</Link></li>
                      <li><Link href="/consejo/cierre-programa">Cierre de programa</Link></li>
                    </ul>
                  </details>
                </li>

                {/* SUPERVISOR MOBILE */}
                <li>
                  <details>
                    <summary className="cursor-pointer">Supervisor</summary>
                    <ul className="pt-2 pl-4 space-y-1">
                      <li><Link href="/supervisor/registrar-beneficiarios">Registrar beneficiarios</Link></li>
                      <li><Link href="/supervisor/beneficiarios-atendidos">Beneficiarios atendidos</Link></li>
                    </ul>
                  </details>
                </li>

                {/* OPERADOR MOBILE */}
                <li><Link href="/operador/registrar-interaccion">Registrar interacción</Link></li>

                {/* LOGOUT */}
                <li>
                  <button className="hover:underline focus:outline-none">Cerrar sesión</button>
                </li>
              </ul>
            </div>
          )}
        </nav>
      </div>

      <div style={{ borderColor: "rgba(217,217,217,0.08)" }} className="border-t"></div>
    </header>
  );
}
