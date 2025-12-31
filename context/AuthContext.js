
import { createContext, useContext, useEffect, useState } from "react";
import supabase from "../utils/supabaseClient";

const AuthContext = createContext({
  user: null,
  loading: true,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (authUser) => {
    if (!authUser) {
      setUser(null);
      setLoading(false);
      return;
    }

    // Ajuste: cambiar "nombre" por "nombre_completo" en la tabla intranet_users
    const { data, error } = await supabase
      .from("intranet_users")
      .select("nombre_completo, nisuv") // Corregido: "nombre_completo"
      .eq("uuid", authUser.id)
      .single();

    if (error) {
      console.error("Perfil no encontrado:", error);
      setUser({ auth: authUser, profile: null });
    } else {
      setUser({ auth: authUser, profile: data });
    }

    setLoading(false);
  };

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      await loadProfile(data?.session?.user ?? null);
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoading(true);
      loadProfile(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);