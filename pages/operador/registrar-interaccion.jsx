import { useState, useEffect } from "react";
import supabase from "../../utils/supabaseClient";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function RegistrarInteraccion() {
  const [programas, setProgramas] = useState([]);
  const [form, setForm] = useState({
    direccion_responsable: "",
    coordinacion_responsable: "",
    nombre_programa: "",
    tipo_interaccion: "",
    nombre_beneficiario: "",
    numero_sesion: "",
    observaciones: "",
  });
  const [userUuid, setUserUuid] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // ===============================
  // CARGA INICIAL
  // ===============================
  useEffect(() => {
    async function fetchProgramas() {
      try {
        const { data: programasData, error } = await supabase
          .from("programas")
          .select("id, nombre, direccion, coordinacion");

        if (error) throw error;
        setProgramas(programasData || []);
      } catch (err) {
        console.error("Error fetching programas: ", err.message);
      }
    }

    async function fetchUserUuid() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        setUserUuid(user?.id || null);
      } catch (err) {
        console.error("Error fetching user UUID: ", err.message);
      }
    }

    fetchProgramas();
    fetchUserUuid();
  }, []);

  // ===============================
  // HANDLE CHANGE
  // ===============================
  function handleSelectChange(field) {
    return (event) => {
      const value = event.target.value;
      setForm((prevForm) => {
        const updatedForm = { ...prevForm, [field]: value };
        if (field === "direccion_responsable") {
          updatedForm.coordinacion_responsable = "";
          updatedForm.nombre_programa = "";
        }
        if (field === "coordinacion_responsable") {
          updatedForm.nombre_programa = "";
        }
        return updatedForm;
      });
    };
  }

  function handleInputChange(field) {
    return (event) => {
      const value = event.target.value;
      setForm((prevForm) => ({ ...prevForm, [field]: value }));
    };
  }

  // ===============================
  // SUBMIT
  // ===============================
  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess(false);

    // Validaciones
    if (
      !userUuid ||
      !form.nombre_programa ||
      !form.tipo_interaccion ||
      !form.nombre_beneficiario ||
      !form.numero_sesion
    ) {
      setError("Por favor completa todos los campos obligatorios.");
      return;
    }

    // Obtener el programa_id según la selección
    const selectedPrograma = programas.find(
      (p) =>
        p.nombre === form.nombre_programa &&
        p.coordinacion === form.coordinacion_responsable &&
        p.direccion === form.direccion_responsable
    );

    if (!selectedPrograma) {
      setError("No se pudo determinar el programa seleccionado.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        user_uuid: userUuid,
        programa_id: selectedPrograma.id,
        tipo_interaccion: form.tipo_interaccion,
        nombre_beneficiario: form.nombre_beneficiario,
        numero_sesion: form.numero_sesion,
        observaciones: form.observaciones || null,
      };

      const { error: insertError } = await supabase
        .from("interacciones")
        .insert(payload);

      if (insertError) throw insertError;

      setSuccess(true);
      // Limpiar campos operativos, pero mantener los filtros de selección
      setForm((prevForm) => ({
        ...prevForm,
        tipo_interaccion: "",
        nombre_beneficiario: "",
        numero_sesion: "",
        observaciones: "",
      }));
    } catch (err) {
      setError("Error al registrar la interacción. Inténtalo de nuevo.");
      console.error("Error submitting form: ", err.message);
    } finally {
      setSubmitting(false);
    }
  }

  // ===============================
  // FILTROS
  // ===============================
  const direcciones = [...new Set(programas.map((p) => p.direccion))];
  const coordinaciones = programas
    .filter((p) => p.direccion === form.direccion_responsable)
    .map((p) => p.coordinacion);
  const programasFiltrados = programas
    .filter(
      (p) =>
        p.direccion === form.direccion_responsable &&
        p.coordinacion === form.coordinacion_responsable
    )
    .map((p) => p.nombre);

  // ===============================
  // RENDER
  // ===============================
  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
          <h1 className="text-2xl font-semibold mb-4">Registrar Interacción</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Dirección responsable *
              </label>
              <select
                value={form.direccion_responsable}
                onChange={handleSelectChange("direccion_responsable")}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Selecciona una dirección</option>
                {direcciones.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Coordinación responsable *
              </label>
              <select
                value={form.coordinacion_responsable}
                onChange={handleSelectChange("coordinacion_responsable")}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Selecciona una coordinación</option>
                {coordinaciones.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Nombre del programa *
              </label>
              <select
                value={form.nombre_programa}
                onChange={handleSelectChange("nombre_programa")}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Selecciona un programa</option>
                {programasFiltrados.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Tipo de interacción *
              </label>
              <select
                value={form.tipo_interaccion}
                onChange={handleSelectChange("tipo_interaccion")}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Selecciona un tipo</option>
                <option value="Orientación">Orientación</option>
                <option value="Sesión formativa">Sesión formativa</option>
                <option value="Entrega de apoyo">Entrega de apoyo</option>
                <option value="Taller">Taller</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Nombre del beneficiario *
              </label>
              <input
                value={form.nombre_beneficiario}
                onChange={handleInputChange("nombre_beneficiario")}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Número de sesión *
              </label>
              <input
                value={form.numero_sesion}
                onChange={handleInputChange("numero_sesion")}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Observaciones
              </label>
              <textarea
                value={form.observaciones}
                onChange={handleInputChange("observaciones")}
                className="w-full border rounded px-3 py-2"
                rows={4}
              />
            </div>

            {error && <div className="text-red-600">{error}</div>}
            {success && (
              <div className="text-green-600">
                Interacción registrada con éxito.
              </div>
            )}

            <button
              type="submit"
              className="bg-[#1E4C45] text-white px-4 py-2 rounded"
              disabled={submitting}
            >
              {submitting ? "Guardando..." : "Registrar interacción"}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
