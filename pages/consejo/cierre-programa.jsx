import { useState, useEffect } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import supabase from "../../utils/supabaseClient";

export default function CierreDePrograma() {
  const [programas, setProgramas] = useState([]);
  const [direcciones, setDirecciones] = useState([]);
  const [coordinaciones, setCoordinaciones] = useState([]);
  const [folios, setFolios] = useState([]);

  const [form, setForm] = useState({
    direccion_responsable: "",
    coordinacion_responsable: "",
    folio_programa: "",
    nombre_programa: "",
    beneficiarios_alcanzados: "",
    resultados_obtenidos: "",
    cumplimiento_metas: "",
    recomendaciones: "",
    fecha_cierre: "",
    cerrado_por: "",
    folio_acta_referencia: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchProgramas() {
      const { data, error } = await supabase
        .from("programas")
        .select("id, folio_programa, nombre, direccion, coordinacion");

      if (!error && data) {
        setProgramas(data);
        setDirecciones([...new Set(data.map((p) => p.direccion))]);
      }
    }
    fetchProgramas();
  }, []);

  function handleChange(field) {
    return (e) => {
      const value = e.target.value;

      setForm((prev) => ({ ...prev, [field]: value }));

      if (field === "direccion_responsable") {
        const coords = programas
          .filter((p) => p.direccion === value)
          .map((p) => p.coordinacion);

        setCoordinaciones([...new Set(coords)]);
        setFolios([]);

        setForm((prev) => ({
          ...prev,
          coordinacion_responsable: "",
          folio_programa: "",
          nombre_programa: "",
        }));
      }

      if (field === "coordinacion_responsable") {
        const fols = programas
          .filter(
            (p) =>
              p.direccion === form.direccion_responsable &&
              p.coordinacion === value
          )
          .map((p) => p.folio_programa);

        setFolios(fols);

        setForm((prev) => ({
          ...prev,
          folio_programa: "",
          nombre_programa: "",
        }));
      }

      if (field === "folio_programa") {
        const programa = programas.find(
          (p) => p.folio_programa === value
        );
        if (programa) {
          setForm((prev) => ({
            ...prev,
            nombre_programa: programa.nombre,
          }));
        }
      }
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const requiredFields = [
      "direccion_responsable",
      "coordinacion_responsable",
      "folio_programa",
      "beneficiarios_alcanzados",
      "resultados_obtenidos",
      "cumplimiento_metas",
      "fecha_cierre",
      "cerrado_por",
      "folio_acta_referencia",
    ];

    for (const field of requiredFields) {
      if (!form[field]) {
        setError(`Por favor completa el campo "${field}" antes de continuar.`);
        return;
      }
    }

    // Buscar programa_id para el folio seleccionado
    const programa = programas.find((p) => p.folio_programa === form.folio_programa);

    if (!programa) {
      setError("El folio del programa no está registrado en la base de datos.");
      return;
    }

    const programaId = programa.id;

    setSubmitting(true);

    try {
      // Inserción en programa_resultados
      const { error: resultadosError } = await supabase.from("programa_resultados").insert({
        programa_id: programaId, // Usamos id en lugar de folio
        beneficiarios_alcanzados: parseInt(form.beneficiarios_alcanzados, 10),
        resultados: form.resultados_obtenidos,
        cumplimiento: form.cumplimiento_metas,
        recomendaciones: form.recomendaciones,
      });

      if (resultadosError) {
        console.error("Error en programa_resultados:", resultadosError);
        throw new Error("Hubo un error al guardar los resultados del programa.");
      }

      // Inserción en programa_cierre
      const { error: cierreError } = await supabase.from("programa_cierre").insert({
        programa_id: programaId, // Usamos id en lugar de folio
        fecha_cierre: form.fecha_cierre,
        acta_referencia: form.folio_acta_referencia,
        cerrado_por: form.cerrado_por,
      });

      if (cierreError) {
        console.error("Error en programa_cierre:", cierreError);
        throw new Error("Hubo un error al registrar el cierre del programa.");
      }

      // Si todo salió bien
      setSuccess(true);
      setForm({
        direccion_responsable: "",
        coordinacion_responsable: "",
        folio_programa: "",
        nombre_programa: "",
        beneficiarios_alcanzados: "",
        resultados_obtenidos: "",
        cumplimiento_metas: "",
        recomendaciones: "",
        fecha_cierre: "",
        cerrado_por: "",
        folio_acta_referencia: "",
      });
    } catch (err) {
      console.error(err);
      setError("Ocurrió un error al intentar guardar el cierre del programa.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
          <h1 className="text-2xl font-semibold mb-4">Cierre de Programa</h1>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Dirección */}
            <select
              value={form.direccion_responsable}
              onChange={handleChange("direccion_responsable")}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Dirección responsable *</option>
              {direcciones.map((d) => (
                <option key={d}>{d}</option>
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
              {coordinaciones.map((c) => (
                <option key={c}>{c}</option>
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
              {folios.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>

            {/* Nombre */}
            <input
              value={form.nombre_programa}
              disabled
              className="w-full border rounded px-3 py-2"
              placeholder="Nombre del programa"
            />

            {/* Beneficiarios */}
            <input
              value={form.beneficiarios_alcanzados}
              onChange={handleChange("beneficiarios_alcanzados")}
              className="w-full border rounded px-3 py-2"
              placeholder="Beneficiarios alcanzados *"
            />

            {/* Resultados */}
            <textarea
              value={form.resultados_obtenidos}
              onChange={handleChange("resultados_obtenidos")}
              className="w-full border rounded px-3 py-2"
              rows={4}
              placeholder="Resultados obtenidos *"
            />

            {/* Cumplimiento */}
            <select
              value={form.cumplimiento_metas}
              onChange={handleChange("cumplimiento_metas")}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Cumplimiento de metas *</option>
              <option value="Si">Sí</option>
              <option value="No">No</option>
              <option value="Parcial">Parcial</option>
            </select>

            {/* Recomendaciones */}
            <textarea
              value={form.recomendaciones}
              onChange={handleChange("recomendaciones")}
              className="w-full border rounded px-3 py-2"
              rows={4}
              placeholder="Recomendaciones *"
            />

            {/* Fecha */}
            <input
              type="date"
              value={form.fecha_cierre}
              onChange={handleChange("fecha_cierre")}
              className="w-full border rounded px-3 py-2"
            />

            {/* Cerrado por */}
            <input
              value={form.cerrado_por}
              onChange={handleChange("cerrado_por")}
              className="w-full border rounded px-3 py-2"
              placeholder="Cerrado por *"
            />

            {/* Folio acta */}
            <input
              value={form.folio_acta_referencia}
              onChange={handleChange("folio_acta_referencia")}
              className="w-full border rounded px-3 py-2"
              placeholder="Folio del acta de referencia *"
            />

            {error && <p className="text-red-600">{error}</p>}
            {success && <p className="text-green-600">Programa cerrado con éxito.</p>}

            <button
              type="submit"
              disabled={submitting}
              className="bg-[#1E4C45] text-white px-4 py-2 rounded"
            >
              {submitting ? "Guardando..." : "Cerrar programa"}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}