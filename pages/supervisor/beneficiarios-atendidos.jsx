import { useState, useEffect } from "react";
import supabase from "../../utils/supabaseClient";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function BeneficiariosAtendidos() {
  // Estados principales
  const [programas, setProgramas] = useState([]);
  const [beneficiarios, setBeneficiarios] = useState([]);

  const [form, setForm] = useState({
    direccion: "",
    coordinacion: "",
    folio_programa: "",
    programa_id: null,
    nombre_programa: "",
    tipo_constancia: "",
    nombre_beneficiario: "",
    concluyo: "",
    folio_constancia: "",
    fecha_constancia: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // ===============================
  // CARGA INICIAL
  // ===============================
  useEffect(() => {
    async function fetchData() {
      try {
        const { data: programasData, error: programasError } = await supabase
          .from("programas")
          .select(
            "id, folio_programa, nombre, direccion, coordinacion, tipo_constancia"
          );

        if (programasError) throw programasError;

        const { data: beneficiariosData, error: beneficiariosError } =
          await supabase
            .from("beneficiarios")
            .select("programa_id, nombre_beneficiario");

        if (beneficiariosError) throw beneficiariosError;

        setProgramas(programasData || []);
        setBeneficiarios(beneficiariosData || []);
        setError("");
      } catch (err) {
        console.error(err);
        setError(err.message || "Error al cargar datos");
      }
    }

    fetchData();
  }, []);

  // ===============================
  // HANDLE CHANGE
  // ===============================
  function handleChange(field) {
    return (e) => {
      const value = e.target.value;

      setForm((prev) => {
        let updated = { ...prev, [field]: value };

        if (field === "direccion") {
          updated = {
            ...updated,
            coordinacion: "",
            folio_programa: "",
            programa_id: null,
            nombre_programa: "",
            tipo_constancia: "",
            nombre_beneficiario: "",
          };
        }

        if (field === "coordinacion") {
          updated = {
            ...updated,
            folio_programa: "",
            programa_id: null,
            nombre_programa: "",
            tipo_constancia: "",
            nombre_beneficiario: "",
          };
        }

        if (field === "folio_programa") {
          const programa = programas.find(
            (p) => p.folio_programa === value
          );
          if (programa) {
            updated.programa_id = programa.id;
            updated.nombre_programa = programa.nombre;
            updated.tipo_constancia = programa.tipo_constancia;
            updated.nombre_beneficiario = "";
          }
        }

        return updated;
      });
    };
  }

  // ===============================
  // FILTRO BENEFICIARIOS
  // ===============================
  const beneficiariosFiltrados = beneficiarios.filter(
    (b) => String(b.programa_id) === String(form.programa_id)
  );

  // ===============================
  // OPCIONES
  // ===============================
  const direcciones = [...new Set(programas.map((p) => p.direccion))];

  const coordinaciones = programas
    .filter((p) => p.direccion === form.direccion)
    .map((p) => p.coordinacion);

  const folios = programas
    .filter(
      (p) =>
        p.direccion === form.direccion &&
        p.coordinacion === form.coordinacion
    )
    .map((p) => p.folio_programa);

  // ===============================
  // SUBMIT REAL (NO OPTIMISTA)
  // ===============================
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (
      !form.programa_id ||
      !form.nombre_beneficiario ||
      !form.fecha_constancia ||
      !form.concluyo
    ) {
      setError("Por favor completa todos los campos obligatorios.");
      return;
    }

    setLoading(true);

    const payload = {
      programa_id: form.programa_id,
      nombre_beneficiario: form.nombre_beneficiario,
      concluyo: form.concluyo,
      folio_constancia: form.folio_constancia || null,
      fecha_constancia: form.fecha_constancia,
    };

    try {
      const { error: insertError } = await supabase
        .from("beneficiarios")
        .insert(payload);

      if (insertError) {
        console.error(insertError);
        throw insertError;
      }

      setSuccess(true);

      // Limpieza de formulario (controlada)
      setForm((prev) => ({
        ...prev,
        nombre_beneficiario: "",
        concluyo: "",
        folio_constancia: "",
        fecha_constancia: "",
      }));
    } catch (err) {
      console.error(err);
      setError(err.message || "No se pudo guardar en la base de datos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
          <h1 className="text-2xl font-semibold mb-4">
            Beneficiarios Atendidos
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Select
              label="Dirección *"
              value={form.direccion}
              onChange={handleChange("direccion")}
              options={direcciones}
            />

            <Select
              label="Coordinación *"
              value={form.coordinacion}
              onChange={handleChange("coordinacion")}
              options={coordinaciones}
              disabled={!form.direccion}
            />

            <Select
              label="Folio del programa *"
              value={form.folio_programa}
              onChange={handleChange("folio_programa")}
              options={folios}
              disabled={!form.coordinacion}
            />

            <ReadOnly label="Nombre del programa" value={form.nombre_programa} />
            <ReadOnly label="Tipo de constancia" value={form.tipo_constancia} />

            <Select
              label="Beneficiario *"
              value={form.nombre_beneficiario}
              onChange={handleChange("nombre_beneficiario")}
              options={beneficiariosFiltrados.map((b) => ({
                label: b.nombre_beneficiario,
                value: b.nombre_beneficiario,
              }))}
              disabled={!form.programa_id}
            />

            <Select
              label="Concluyó *"
              value={form.concluyo}
              onChange={handleChange("concluyo")}
              options={[
                { label: "Sí", value: "Si" },
                { label: "No", value: "No" },
              ]}
            />

            <Input
              label="Folio de constancia"
              value={form.folio_constancia}
              onChange={handleChange("folio_constancia")}
            />

            <Input
              label="Fecha de constancia"
              type="date"
              value={form.fecha_constancia}
              onChange={handleChange("fecha_constancia")}
            />

            {error && <p className="text-red-600">{error}</p>}
            {success && (
              <p className="text-green-600">
                Registro guardado correctamente.
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="bg-[#1E4C45] text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}

/* ===============================
   COMPONENTES
================================ */

function Select({ label, value, onChange, options, disabled }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full border rounded px-3 py-2"
      >
        <option value="">Selecciona</option>
        {options.map((o) => (
          <option key={o.value ?? o} value={o.value ?? o}>
            {o.label ?? o}
          </option>
        ))}
      </select>
    </div>
  );
}

function Input({ label, type = "text", value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="w-full border rounded px-3 py-2"
      />
    </div>
  );
}

function ReadOnly({ label, value }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        value={value}
        readOnly
        className="w-full border rounded px-3 py-2 bg-gray-100"
      />
    </div>
  );
}
