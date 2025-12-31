import { useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import supabase from "../../utils/supabaseClient";

export default function RegistrarPrograma() {
  const [form, setForm] = useState({
    direccion: "",
    coordinacion: "",
    nombrePrograma: "",
    estado: "Activo",
    tipoConstancia: "",
    folio: "",
    responsable: "",
    observaciones: "",
    beneficiariosPrevistos: "",
    fechaInicio: "",
    fechaTermino: "",
    objetivo: "",
    actividades: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function update(field) {
    return (e) =>
      setForm((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const requiredFields = [
      "direccion",
      "coordinacion",
      "nombrePrograma",
      "estado",
      "tipoConstancia",
      "folio",
      "responsable",
      "fechaInicio",
      "objetivo",
      "actividades",
    ];

    for (const field of requiredFields) {
      if (!form[field]) {
        setError(`Por favor completa el campo ${field}.`);
        return;
      }
    }

    setSubmitting(true);

    try {
      /**
       * 🔐 Inserciones independientes para programas y programa_planeacion
       */
      // Primera inserción: Guardar en programas
      const { data: programa, error: programaError } = await supabase
        .from("programas")
        .insert({
          nombre: form.nombrePrograma,
          direccion: form.direccion,
          coordinacion: form.coordinacion,
          estado: form.estado,
          tipo_constancia: form.tipoConstancia,
          folio_programa: form.folio,
          responsable: form.responsable,
          observaciones: form.observaciones,
        })
        .select()
        .single(); // Retornamos el programa insertado (incluido su `id` generado)

      if (programaError) throw programaError;

      // Segunda inserción: Guardar en programa_planeacion
      const { error: planeacionError } = await supabase
        .from("programa_planeacion")
        .insert({
          programa_id: programa.id, // Usamos id del programa recién creado
          fecha_inicio: form.fechaInicio,
          fecha_fin: form.fechaTermino || null,
          objetivo: form.objetivo,
          actividades: form.actividades,
          beneficiarios_previstos: form.beneficiariosPrevistos,
        });

      if (planeacionError) throw planeacionError;

      // Todo bien: éxito
      setSuccess(true);
      setForm({
        direccion: "",
        coordinacion: "",
        nombrePrograma: "",
        estado: "Activo",
        tipoConstancia: "",
        folio: "",
        responsable: "",
        observaciones: "",
        beneficiariosPrevistos: "",
        fechaInicio: "",
        fechaTermino: "",
        objetivo: "",
        actividades: "",
      });
    } catch (err) {
      console.error("Error al registrar programa:", err);
      setError("Error al registrar el programa. Intenta nuevamente.");
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
            Registrar Programa
          </h1>

          {error && (
            <div className="text-red-600 mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 p-4 rounded mb-4">
              Programa registrado exitosamente
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Dirección responsable *
              </label>
              <input
                type="text"
                value={form.direccion}
                onChange={update("direccion")}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Coordinación responsable *
              </label>
              <input
                type="text"
                value={form.coordinacion}
                onChange={update("coordinacion")}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Nombre del programa *
              </label>
              <input
                type="text"
                value={form.nombrePrograma}
                onChange={update("nombrePrograma")}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Estado *
              </label>
              <select
                value={form.estado}
                onChange={update("estado")}
                className="w-full border rounded px-3 py-2"
              >
                <option value="Activo">Activo</option>
                <option value="Suspendido">Suspendido</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Tipo de constancia *
              </label>
              <select
                value={form.tipoConstancia}
                onChange={update("tipoConstancia")}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Selecciona</option>
                <option value="CF">CF</option>
                <option value="CC">CC</option>
                <option value="CA">CA</option>
                <option value="CP">CP</option>
                <option value="CFP">CFP</option>
                <option value="CM">CM</option>
                <option value="CE">CE</option>
                <option value="CO">CO</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Folio del programa *
              </label>
              <input
                type="text"
                value={form.folio}
                onChange={update("folio")}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Responsable del programa *
              </label>
              <input
                type="text"
                value={form.responsable}
                onChange={update("responsable")}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Observaciones
              </label>
              <input
                type="text"
                value={form.observaciones}
                onChange={update("observaciones")}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Beneficiarios previstos
              </label>
              <textarea
                value={form.beneficiariosPrevistos}
                onChange={update("beneficiariosPrevistos")}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Fecha de inicio *
              </label>
              <input
                type="date"
                value={form.fechaInicio}
                onChange={update("fechaInicio")}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Fecha de término
              </label>
              <input
                type="date"
                value={form.fechaTermino}
                onChange={update("fechaTermino")}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Objetivo *
              </label>
              <textarea
                value={form.objetivo}
                onChange={update("objetivo")}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Actividades a realizar *
              </label>
              <textarea
                value={form.actividades}
                onChange={update("actividades")}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="bg-[#1E4C45] text-white px-4 py-2 rounded disabled:opacity-60"
            >
              {submitting ? "Registrando..." : "Registrar Programa"}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </>
  );
}