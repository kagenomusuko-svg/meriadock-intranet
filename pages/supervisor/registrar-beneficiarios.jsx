import { useState, useEffect } from "react";
import supabase from "../../utils/supabaseClient";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function RegistrarBeneficiario() {
  const [programas, setProgramas] = useState([]);
  const [direcciones, setDirecciones] = useState([]);
  const [coordinaciones, setCoordinaciones] = useState([]);
  const [folios, setFolios] = useState([]);

  const [form, setForm] = useState({
    direccion_responsable: "",
    coordinacion_responsable: "",
    folio_programa: "",
    nombre_programa: "",
    nombre_beneficiario: "",
    tipo_apoyo: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  /* =========================
     Cargar programas
  ========================== */
  useEffect(() => {
    async function fetchProgramas() {
      const { data, error } = await supabase
        .from("programas")
        .select("id, folio_programa, nombre, direccion, coordinacion");

      if (!error && data) {
        setProgramas(data);
        setDirecciones([...new Set(data.map((p) => p.direccion))]); // Extraer direcciones únicas
      } else {
        console.error("Error al cargar programas:", error.message);
        setError("Hubo un error al cargar los programas.");
      }
    }
    fetchProgramas();
  }, []);

  /* =========================
     Manejo de cambios
  ========================== */
  function handleChange(field) {
    return (e) => {
      const value = e.target.value;

      setForm((prev) => ({ ...prev, [field]: value }));

      // Filtrar coordinaciones con base en la dirección
      if (field === "direccion_responsable") {
        const coords = programas
          .filter((p) => p.direccion === value)
          .map((p) => p.coordinacion);

        setCoordinaciones([...new Set(coords)]);
        setFolios([]);

        // Resetear campos dependientes
        setForm((prev) => ({
          ...prev,
          coordinacion_responsable: "",
          folio_programa: "",
          nombre_programa: "",
        }));
      }

      // Filtrar folios con base en la dirección y la coordinación
      if (field === "coordinacion_responsable") {
        const fols = programas
          .filter(
            (p) =>
              p.direccion === form.direccion_responsable &&
              p.coordinacion === value
          )
          .map((p) => p.folio_programa);

        setFolios(fols);

        // Resetear campos dependientes
        setForm((prev) => ({
          ...prev,
          folio_programa: "",
          nombre_programa: "",
        }));
      }

      // Obtener nombre del programa con base en el folio seleccionado
      if (field === "folio_programa") {
        const programa = programas.find((p) => p.folio_programa === value);
        if (programa) {
          setForm((prev) => ({
            ...prev,
            nombre_programa: programa.nombre,
          }));
        }
      }
    };
  }

  /* =========================
     Envío del formulario
  ========================== */
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validar que todos los campos requeridos estén completos
    const requiredFields = [
      "direccion_responsable",
      "coordinacion_responsable",
      "folio_programa",
      "nombre_beneficiario",
      "tipo_apoyo",
    ];

    for (const field of requiredFields) {
      if (!form[field]) {
        setError("Por favor completa todos los campos marcados con *.");
        return;
      }
    }

    setSubmitting(true);

    try {
      // Buscar el programa_id con base en el folio seleccionado
      const programa = programas.find((p) => p.folio_programa === form.folio_programa);

      if (!programa) {
        setError("El folio del programa no está registrado en la base de datos.");
        return;
      }

      const programaId = programa.id; // Obtenemos el programa_id correcto

      // Datos a insertar
      const payload = {
        programa_id: programaId,
        nombre_beneficiario: form.nombre_beneficiario.trim(),
        tipo_apoyo: form.tipo_apoyo.trim(),
      };

      const { error } = await supabase.from("beneficiarios").insert(payload);

      if (error) throw error;

      setSuccess(true); // Mostrar éxito si se registra correctamente
      setForm({
        direccion_responsable: "",
        coordinacion_responsable: "",
        folio_programa: "",
        nombre_programa: "",
        nombre_beneficiario: "",
        tipo_apoyo: "",
      });

      setCoordinaciones([]);
      setFolios([]);
    } catch (err) {
      console.error("Error al registrar beneficiario:", err.message);
      setError("Hubo un error al registrar el beneficiario.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
          <h1 className="text-2xl font-semibold mb-4">
            Registrar Beneficiario
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Dirección */}
            <select
              value={form.direccion_responsable}
              onChange={handleChange("direccion_responsable")}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Dirección responsable *</option>
              {direcciones.map((direccion) => (
                <option key={direccion} value={direccion}>
                  {direccion}
                </option>
              ))}
            </select>

            {/* Coordinación */}
            <select
              value={form.coordinacion_responsable}
              onChange={handleChange("coordinacion_responsable")}
              className="w-full border rounded px-3 py-2"
              disabled={!coordinaciones.length}
            >
              <option value="">Coordinación responsable *</option>
              {coordinaciones.map((coordinacion) => (
                <option key={coordinacion} value={coordinacion}>
                  {coordinacion}
                </option>
              ))}
            </select>

            {/* Folio */}
            <select
              value={form.folio_programa}
              onChange={handleChange("folio_programa")}
              className="w-full border rounded px-3 py-2"
              disabled={!folios.length}
            >
              <option value="">Folio del programa *</option>
              {folios.map((folio) => (
                <option key={folio} value={folio}>
                  {folio}
                </option>
              ))}
            </select>

            {/* Nombre del programa */}
            <input
              value={form.nombre_programa}
              disabled
              className="w-full border rounded px-3 py-2"
              placeholder="Nombre del programa"
            />

            {/* Nombre beneficiario */}
            <input
              value={form.nombre_beneficiario}
              onChange={handleChange("nombre_beneficiario")}
              className="w-full border rounded px-3 py-2"
              placeholder="Nombre del beneficiario *"
            />

            {/* Tipo de apoyo */}
            <select
              value={form.tipo_apoyo}
              onChange={handleChange("tipo_apoyo")}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Tipo de apoyo recibido *</option>
              <option value="Formativo">Formativo</option>
              <option value="Social">Social</option>
              <option value="Económico">Económico</option>
              <option value="En especie">En especie</option>
            </select>

            {error && <p className="text-red-600">{error}</p>}
            {success && (
              <p className="text-green-600">
                Beneficiario registrado con éxito.
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="bg-[#1E4C45] text-white px-4 py-2 rounded"
            >
              {submitting ? "Guardando..." : "Registrar beneficiario"}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}