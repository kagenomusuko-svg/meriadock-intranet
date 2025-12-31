import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import supabase from "../utils/supabaseClient";

export default function Login() {
  const router = useRouter();
  const [nisuv, setNisuv] = useState(""); // NISUV que se transforma en email
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const pwdRef = useRef(null);

  useEffect(() => {
    setTimeout(() => pwdRef?.current?.focus(), 100);
  }, []);

  // ===============================
  // LOGIN
  // ===============================
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!nisuv || !password) {
      setError("Por favor, completa ambos campos.");
      setLoading(false);
      return;
    }

    try {
      // Construimos el email completo desde NISUV
      const email = `${nisuv}@meriadock.org.mx`;

      // Intentamos login con Supabase
      const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) throw authError;

      // Revisamos flag must_change_password en intranet_users
      const { data: intranetData, error: intranetError } = await supabase
        .from("intranet_users")
        .select("must_change_password")
        .eq("uuid", user.id)
        .single();
      if (intranetError) throw intranetError;

      if (intranetData.must_change_password) {
        setUser(user);
        setMustChangePassword(true); // Mostramos formulario para cambiar contraseña
      } else {
        router.replace("/home");
      }
    } catch (err) {
      console.error(err);
      setError("Credenciales incorrectas.");
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // CAMBIO DE CONTRASEÑA
  // ===============================
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");
    if (!newPassword) {
      setError("Ingresa una nueva contraseña.");
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ Actualizar contraseña en Supabase
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (updateError) throw updateError;

      // 2️⃣ Actualizar flag en intranet_users
      const { error: flagError } = await supabase
        .from("intranet_users")
        .update({ must_change_password: false })
        .eq("uuid", user.id);
      if (flagError) throw flagError;

      // 3️⃣ Redirigir al dashboard
      router.replace("/home");
    } catch (err) {
      console.error(err);
      setError("No se pudo cambiar la contraseña. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // RENDER
  // ===============================
  if (mustChangePassword) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="rounded shadow p-6 max-w-md w-full" style={{ backgroundColor: "#1E4C45", color: "#D9D9D9" }}>
          <h1 className="text-2xl font-semibold mb-4 text-center">Cambia tu contraseña</h1>
          {error && <div className="mb-4 text-sm">{error}</div>}
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm">Nueva contraseña</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border px-3 py-2 rounded text-black"
                ref={pwdRef}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded py-2"
              style={{ backgroundColor: "#D9D9D9", color: "#1E4C45" }}
            >
              {loading ? "Cargando..." : "Guardar contraseña"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="rounded shadow p-6 max-w-md w-full" style={{ backgroundColor: "#1E4C45", color: "#D9D9D9" }}>
        <div className="text-center mb-6">
          <img
            src="/logo.svg"
            alt="Logo AC"
            className="h-24 mx-auto mb-3"
            style={{ filter: "grayscale(1) brightness(0.95) invert(0.95) saturate(0%)" }}
          />
          <h1 className="text-2xl font-semibold">Intranet Meriadock</h1>
        </div>

        {error && <div className="mb-4 text-sm">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm">NISUV</label>
            <input
              type="text"
              value={nisuv}
              onChange={(e) => setNisuv(e.target.value)}
              className="w-full border rounded px-3 py-2 text-black"
              placeholder="nisuv"
            />
          </div>

          <div>
            <label className="block text-sm">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded px-3 py-2 text-black"
              ref={pwdRef}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded py-2"
            style={{ backgroundColor: "#D9D9D9", color: "#1E4C45" }}
          >
            {loading ? "Cargando..." : "Iniciar sesión"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm">
          ¿Olvidaste tu contraseña? <br />
          Contacta a <span className="underline">admin@meriadock.org.mx</span>
        </div>
      </div>
    </main>
  );
}
