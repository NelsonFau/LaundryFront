import { useEffect, useMemo, useState } from "react";
import { http } from "../api/http";
import "../style/app.css";

export default function Articulos() {
  const [articulos, setArticulos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // UI
  const [mostrarForm, setMostrarForm] = useState(false);
  const [q, setQ] = useState("");

  // modo edición
  const [editId, setEditId] = useState(null);

  // form
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState(""); // string para input
  const [guardando, setGuardando] = useState(false);
  const [msg, setMsg] = useState("");

  async function cargar() {
    setCargando(true);
    setError("");
    setMsg("");
    try {
      const { data } = await http.get("/api/Articulo");
      setArticulos(Array.isArray(data) ? data : []);
    } catch (e) {
      setError("No se pudo cargar artículos. ¿Está la API corriendo?");
    } finally {
      setCargando(false);
    }
  }

  function abrirCrear() {
    setEditId(null);
    setNombre("");
    setPrecio("");
    setMsg("");
    setError("");
    setMostrarForm(true);
  }

  function abrirEditar(a) {
    setEditId(a.id);
    setNombre(a.nombre ?? "");
    setPrecio(a.precio != null ? String(a.precio) : "");
    setMsg("");
    setError("");
    setMostrarForm(true);
  }

  function cancelarForm() {
    setEditId(null);
    setNombre("");
    setPrecio("");
    setMsg("");
    setError("");
    setMostrarForm(false);
  }

  function parsePrecioDecimal(str) {
    // acepta "150", "150.5" o "150,5"
    const normalized = (str ?? "").trim().replace(",", ".");
    const n = Number(normalized);
    return Number.isFinite(n) ? n : NaN;
  }

  async function guardar(e) {
    e.preventDefault();
    setMsg("");
    setError("");

    if (!nombre.trim()) {
      setMsg("El nombre es obligatorio.");
      return;
    }

    const precioNum = parsePrecioDecimal(precio);
    if (!Number.isFinite(precioNum) || precioNum < 0) {
      setMsg("El precio debe ser un número válido (ej: 150 o 150,50).");
      return;
    }

    setGuardando(true);
    try {
      const payload = {
        nombre: nombre.trim(),
        precio: precioNum, // decimal requerido
      };

      if (editId == null) {
        await http.post("/api/Articulo", payload);
        setMsg("Artículo creado");
      } else {
        await http.put(`/api/Articulo/${editId}`, payload);
        setMsg("Artículo actualizado");
      }

      setMostrarForm(false);
      setEditId(null);
      setNombre("");
      setPrecio("");

      await cargar();
    } catch (e) {
      setError("No se pudo guardar. Revisá la API/BD y probá de nuevo.");
    } finally {
      setGuardando(false);
    }
  }

  async function eliminarArticulo(id) {
    setMsg("");
    setError("");

    const ok = window.confirm("¿Seguro que querés eliminar este artículo?");
    if (!ok) return;

    try {
      await http.delete(`/api/Articulo/${id}`);
      setMsg("Artículo eliminado ✅");
      await cargar();
    } catch (e) {
      const status = e?.response?.status;

      if (status === 409) {
        const serverMsg = e?.response?.data?.message;
        setMsg(serverMsg || "Este artículo ya se usó en remitos. Se desactivó ✅");
        await cargar();
        return;
      }

      setError("No se pudo eliminar. Probá de nuevo o revisá la API.");
    }
  }


  useEffect(() => {
    cargar();
  }, []);

  const filtrados = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return articulos;

    return articulos.filter((a) => {
      const nombreOk = (a.nombre ?? "").toLowerCase().includes(term);
      const idOk = String(a.id ?? "").includes(term);
      const precioOk = String(a.precio ?? "").includes(term);
      const activoOk =
        term === "activo" ? a.activo === true :
        term === "inactivo" ? a.activo === false :
        false;

      return nombreOk || idOk || precioOk || activoOk;
    });
  }, [articulos, q]);

  return (
    <div className="page">
      <div className="pageHeader">
        <div>
          <h1 className="h1">Artículos</h1>
          <p className="muted">Alta, edición y listado de artículos.</p>
        </div>

        <div className="actions">
          <button className="btn" onClick={cargar} disabled={cargando || guardando}>
            {cargando ? "Actualizando..." : "Actualizar"}
          </button>

          <button className="btn btnPrimary" onClick={abrirCrear} disabled={guardando}>
            Agregar artículo
          </button>
        </div>
      </div>

      {error && <div className="alert alertError">{error}</div>}
      {msg && <div className="alert alertOk">{msg}</div>}

      <div className="panel">
        <div className="panelRow">
          <input
            className="input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder='Buscar por nombre, ID, precio (o escribir "activo"/"inactivo")...'
          />
          <div className="pill">{filtrados.length} resultados</div>
        </div>
      </div>

      {mostrarForm && (
        <div className="panel">
          <h3 className="h3">{editId == null ? "Nuevo artículo" : `Editar artículo #${editId}`}</h3>

          <form onSubmit={guardar} className="formGrid">
            <div className="field">
              <label className="label">Nombre *</label>
              <input
                className="input"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Lavado / Planchado / Camisa..."
              />
            </div>

            <div className="field">
              <label className="label">Precio *</label>
              <input
                className="input"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                placeholder="Ej: 150 o 150,50"
                inputMode="decimal"
              />
            </div>

            <div className="formActions">
              <button className="btn btnPrimary" type="submit" disabled={guardando}>
                {guardando ? "Guardando..." : (editId == null ? "Guardar" : "Actualizar")}
              </button>
              <button className="btn" type="button" onClick={cancelarForm} disabled={guardando}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="list">
        {cargando ? (
          <div className="panel">
            <p className="muted">Cargando...</p>
          </div>
        ) : filtrados.length === 0 ? (
          <div className="panel">
            <p className="muted">No hay artículos para mostrar.</p>
          </div>
        ) : (
          filtrados.map((a) => (
            <div key={a.id} className="cardRow">
              <div className="cardRow__main">
                <div className="cardRow__title">
                  {a.nombre} 
                </div>
                <div className="cardRow__sub">
                  Precio: {a.precio} · Estado: {a.activo ? "Activo" : "Inactivo"}
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <button className="btn" onClick={() => abrirEditar(a)} disabled={guardando}>
                  Editar
                </button>
                <button className="btn" onClick={() => eliminarArticulo(a.id)} disabled={guardando}>
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
