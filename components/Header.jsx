import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import supabase from "../utils/supabaseClient";

/*
  Updated Header:
  - Dropdown menus for roles: Consejo, Supervisor, Operador
  - Logout button
  - Dynamic height calculation for --header-offset
*/
export default function Header() {
  const router = useRouter();

  const [openConsejo, setOpenConsejo] = useState(false);
  const [openSupervisor, setOpenSupervisor] = useState(false);
  const [openOperador, setOpenOperador] = useState(false);
  const closeTimerConsejo = useRef(null);
  const closeTimerSupervisor = useRef(null);
  const closeTimerOperador = useRef(null);
  const headerRef = useRef(null);

  useEffect(() => () => {
    clearTimeout(closeTimerConsejo.current);
    clearTimeout(closeTimerSupervisor.current);
    clearTimeout(closeTimerOperador.current);
  }, []);

  function openWithCancel(ref) {
    clearTimeout(ref.current);
  }
  function closeWithDelay(ref, setter) {
    clearTimeout(ref.current);
    ref.current = setTimeout(() => setter(false), 150);
  }

  // 🔐 CERRAR SESIÓN
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  useEffect(() => {
    const headerEl = headerRef.current || document.querySelector(".site-header");
    if (!headerEl) return;

    function setOffset() {
      const h = headerEl.offsetHeight || 0;
      document.documentElement.style.setProperty("--header-offset", `${h}px`);
    }

    setOffset();
    window.addEventListener("resize", setOffset);

    let ro;
    if (window.ResizeObserver) {
      ro = new ResizeObserver(setOffset);
      ro.observe(headerEl);
    }

    return () => {
      window.removeEventListener("resize", setOffset);
      if (ro) ro.disconnect();
    };
  }, []);

  const dropdownStyle = {
    backgroundColor: "#1E4C45",
    color: "#ffffff",
  };

  return (
    <>
      <header ref={headerRef} className="site-header fixed top-0 left-0 right-0 z-40 bg-white">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo.svg"
              alt="Logo AC"
              className="h-12 w-auto object-contain"
              style={{
                filter: "grayscale(1) brightness(0.95) invert(0.95) saturate(0%)",
              }}
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

          {/* Desktop nav */}
          <nav className="hidden md:block">
            <ul className="flex gap-6 text-sm items-center" style={{ color: "var(--meriadock-silver)" }}>
              <li><Link href="/home">Inicio</Link></li>

              {/* CONSEJO */}
              <li
                className="relative"
                onMouseEnter={() => (openWithCancel(closeTimerConsejo), setOpenConsejo(true))}
                onMouseLeave={() => closeWithDelay(closeTimerConsejo, setOpenConsejo)}
              >
                <button className="focus:outline-none">
                  Consejo ▾
                </button>

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
                onMouseEnter={() => (openWithCancel(closeTimerSupervisor), setOpenSupervisor(true))}
                onMouseLeave={() => closeWithDelay(closeTimerSupervisor, setOpenSupervisor)}
              >
                <button className="focus:outline-none">
                  Supervisor ▾
                </button>

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

              {/* 🔴 LOGOUT */}
              <li>
                <button
                  onClick={handleLogout}
                  className="hover:underline focus:outline-none"
                >
                  Cerrar sesión
                </button>
              </li>
            </ul>
          </nav>
        </div>

        <div className="border-t" style={{ borderColor: "rgba(217,217,217,0.08)" }} />
      </header>

      <div aria-hidden="true" style={{ height: "var(--header-offset)" }} />
    </>
  );
}
