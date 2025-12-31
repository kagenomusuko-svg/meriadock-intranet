import { useState, useEffect } from "react";
import supabase from "../../utils/supabaseClient";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const ModificarProgramaForm = () => {
  const [form, setForm] = useState({
    direccion_responsable: "",
    coordinacion_responsable: "",
    folio_programa: "",
    nombre_programa: "",
    estado: "",
    responsable_programa: "",
    observaciones: "",
  });

  const [direcciones, setDirecciones] = useState([]);
  const [coordinaciones, setCoordinaciones] = useState([]);
  const [folios, setFolios] = useState([]);
  const [programas, setProgramas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    // Precargar datos de la tabla "programas"
    const fetchProgramas = async () => {
      const { data, error } = await supabase
        .from("programas")
        .select("id, folio_programa, nombre, direccion, coordinacion, estado, responsable, observaciones");

      if (!error && data) {
        setProgramas(data);

        // Popular direcciones únicas
        const direccionesUnicas = [...new Set(data.map((programa) => programa.direccion))];
        setDirecciones(direccionesUnicas);
      }
    };

    fetchProgramas();
  }, []);

  const handleChange = (field) => (e) => {
    const value = e.target.value;

    setForm((prev) => ({ ...prev, [field]: value }));

    // Filtrar coordinaciones basadas en dirección
    if (field === "direccion_responsable") {
      const coordinacionesFiltradas = [...new Set(
        programas
          .filter((programa) => programa.direccion === value)
          .map((programa) => programa.coordinacion)
      )];

      setCoordinaciones(coordinacionesFiltradas);
      setFolios([]);

      setForm((prev) => ({
        ...prev,
        coordinacion_responsable: "",
        folio_programa: "",
        nombre_programa: "",
        estado: "",
        responsable_programa: "",
        observaciones: "",
      }));
    }

    // Filtrar folios basados en dirección y coordinación
    if (field === "coordinacion_responsable") {
      const foliosFiltrados = programas
        .filter(
          (programa) =>
            programa.direccion === form.direccion_responsable &&
            programa.coordinacion === value
        )
        .map((programa) => programa.folio_programa);

      setFolios(foliosFiltrados);

      setForm((prev) => ({
        ...prev,
        folio_programa: "",
        nombre_programa: "",
        estado: "",
        responsable_programa: "",
        observaciones: "",
      }));
    }

    // Cargar datos del programa seleccionado
    if (field === "folio_programa") {
      const programa = programas.find((programa) => programa.folio_programa === value);
      if (programa) {
        setForm((prev) => ({
          ...prev,
          nombre_programa: programa.nombre,
          estado: programa.estado || "",
          responsable_programa: programa.responsable || "",
          observaciones: programa.observaciones || "",
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const { error: updateError } = await supabase
        .from("programas")
        .update({
          direccion: form.direccion_responsable,
          coordinacion: form.coordinacion_responsable,
          estado: form.estado,
          responsable: form.responsable_programa,
          observaciones: form.observaciones,
        })
        .eq("folio_programa", form.folio_programa);

      if (updateError) {
        setError(updateError.message || "Error al modificar el programa.");
      } else {
        setSuccess("El programa fue modificado exitosamente.");
        setForm({
          direccion_responsable: "",
          coordinacion_responsable: "",
          folio_programa: "",
          nombre_programa: "",
          estado: "",
          responsable_programa: "",
          observaciones: "",
        });
      }
    } catch (err) {
      console.error("Submit Error:", err.message);
      setError("Error de red. Por favor intente de nuevo más tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
          <h1 className="text-2xl font-semibold mb-4">Modificar Programa</h1>
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Dirección */}
            <div>
              <label className="block text-sm">Dirección responsable</label>
              <select
                value={form.direccion_responsable}
                onChange={handleChange("direccion_responsable")}
                className="w-full border px-3 py-2"
              >
                <option value="">-- Seleccione --</option>
                {direcciones.map((direccion) => (
                  <option key={direccion} value={direccion}>
                    {direccion}
                  </option>
                ))}
              </select>
            </div>

            {/* Coordinación */}
            <div>
              <label className="block text-sm">Coordinación responsable</label>
              <select
                value={form.coordinacion_responsable}
                onChange={handleChange("coordinacion_responsable")}
                className="w-full border px-3 py-2"
                disabled={!coordinaciones.length}
              >
                <option value="">-- Seleccione --</option>
                {coordinaciones.map((coordinacion) => (
                  <option key={coordinacion} value={coordinacion}>
                    {coordinacion}
                  </option>
                ))}
              </select>
            </div>

            {/* Folio */}
            <div>
              <label className="block text-sm">Folio del programa</label>
              <select
                value={form.folio_programa}
                onChange={handleChange("folio_programa")}
                className="w-full border px-3 py-2"
                disabled={!folios.length}
              >
                <option value="">-- Seleccione --</option>
                {folios.map((folio) => (
                  <option key={folio} value={folio}>
                    {folio}
                  </option>
                ))}
              </select>
            </div>

            {/* Nombre */}
            <div>
              <label className="block text-sm">Nombre del programa</label>
              <input
                type="text"
                value={form.nombre_programa}
                className="w-full border px-3 py-2"
                readOnly
              />
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm">Estado</label>
              <select
                value={form.estado}
                onChange={handleChange("estado")}
                className="w-full border px-3 py-2"
              >
                <option value="">-- Seleccione --</option>
                <option value="Activo">Activo</option>
                <option value="Suspendido">Suspendido</option>
              </select>
            </div>

            {/* Responsable */}
            <div>
              <label className="block text-sm">Responsable del programa</label>
              <input
                type="text"
                value={form.responsable_programa}
                onChange={handleChange("responsable_programa")}
                className="w-full border px-3 py-2"
              />
            </div>

            {/* Observaciones */}
            <div>
              <label className="block text-sm">Observaciones</label>
              <textarea
                value={form.observaciones}
                onChange={handleChange("observaciones")}
                className="w-full border px-3 py-2"
                rows={3}
              />
            </div>

            {/* Estado de Error/Éxito */}
            {error && <div className="text-red-600">{error}</div>}
            {success && <div className="text-green-600">{success}</div>}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="bg-[#1E4C45] text-white px-4 py-2 rounded"
              >
                {loading ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ModificarProgramaForm;