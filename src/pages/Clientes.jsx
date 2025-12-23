import { useEffect, useMemo, useState } from "react";
import { http } from "../api/http";
import "../style/app.css"; 

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // UI
  const [mostrarForm, setMostrarForm] = useState(false);
  const [q, setQ] = useState("");

  // modo edición
  const [editId, setEditId] = useState(null);

  // form
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [msg, setMsg] = useState("");

  async function cargar() {
    setCargando(true);
    setError("");
    setMsg("");
    try {
      const { data } = await http.get("/api/Cliente");
      setClientes(Array.isArray(data) ? data : []);
    } catch (e) {
      setError("No se pudo cargar. ¿Está prendida la PC servidor y la API corriendo?");
    } finally {
      setCargando(false);
    }
  }

  function abrirCrear() {
    setEditId(null);
    setNombre("");
    setTelefono("");
    setDireccion("");
    setMsg("");
    setError("");
    setMostrarForm(true);
  }

  function abrirEditar(c) {
    setEditId(c.id);
    setNombre(c.nombre ?? "");
    setTelefono(c.telefono ?? "");
    setDireccion(c.direccion ?? "");
    setMsg("");
    setError("");
    setMostrarForm(true);
  }

  function cancelarForm() {
    setEditId(null);
    setNombre("");
    setTelefono("");
    setDireccion("");
    setMsg("");
    setError("");
    setMostrarForm(false);
  }

  async function guardar(e) {
    e.preventDefault();
    setMsg("");
    setError("");

    if (!nombre.trim()) {
      setMsg("El nombre es obligatorio.");
      return;
    }

    setGuardando(true);
    try {
      const payload = {
        nombre: nombre.trim(),
        telefono: telefono.trim() || null,
        direccion: direccion.trim() || null,
      };

      if (editId == null) {
        await http.post("/api/Cliente", payload);
        setMsg("Cliente creado ✅");
      } else {
        await http.put(`/api/Cliente/${editId}`, payload);
        setMsg("Cliente actualizado ✅");
      }

      setMostrarForm(false);
      setEditId(null);
      setNombre("");
      setTelefono("");
      setDireccion("");

      await cargar();
    } catch (e) {
      setError("No se pudo guardar. Revisá la API/BD y probá de nuevo.");
    } finally {
      setGuardando(false);
    }
  }

  async function eliminarCliente(id) {
    setMsg("");
    setError("");

    const ok = window.confirm("¿Seguro que querés eliminar este cliente?");
    if (!ok) return;

    try {
      await http.delete(`/api/Cliente/${id}`); // requiere DELETE en backend
      setMsg("Cliente eliminado ✅");
      await cargar();
    } catch (e) {
      setError("No se pudo eliminar. Verificá que exista el endpoint DELETE en la API.");
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  const filtrados = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return clientes;

    return clientes.filter((c) => {
      const nombreOk = (c.nombre ?? "").toLowerCase().includes(term);
      const telOk = (c.telefono ?? "").toLowerCase().includes(term);
      const dirOk = (c.direccion ?? "").toLowerCase().includes(term);
      const idOk = String(c.id ?? "").includes(term);
      return nombreOk || telOk || dirOk || idOk;
    });
  }, [clientes, q]);

  return (
    <div className="page">
      <div className="pageHeader">
        <div>
          <h1 className="h1">Clientes</h1>
          <p className="muted">Alta, edición y listado de clientes.</p>
        </div>

        <div className="actions">
          <button className="btn" onClick={cargar} disabled={cargando || guardando}>
            {cargando ? "Actualizando..." : "Actualizar"}
          </button>

          <button className="btn btnPrimary" onClick={abrirCrear} disabled={guardando}>
            Agregar cliente
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
            placeholder="Buscar por nombre, teléfono, dirección o ID..."
          />
          <div className="pill">{filtrados.length} resultados</div>
        </div>
      </div>

      {mostrarForm && (
        <div className="panel">
          <h3 className="h3">{editId == null ? "Nuevo cliente" : `Editar cliente #${editId}`}</h3>

          <form onSubmit={guardar} className="formGrid">
            <div className="field">
              <label className="label">Nombre *</label>
              <input
                className="input"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Juan Pérez"
              />
            </div>

            <div className="field">
              <label className="label">Teléfono</label>
              <input
                className="input"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="Ej: 099123456"
              />
            </div>

            <div className="field">
              <label className="label">Dirección</label>
              <input
                className="input"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="Ej: Av. ... 123"
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
            <p className="muted">No hay clientes para mostrar.</p>
          </div>
        ) : (
          filtrados.map((c) => (
            <div key={c.id} className="cardRow">
              <div className="cardRow__main">
                <div className="cardRow__title">
                  {c.nombre} 
                </div>
                <div className="cardRow__sub">
                  Tel: {c.telefono ?? "-"} · Dir: {c.direccion ?? "-"}
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <button className="btn" onClick={() => abrirEditar(c)} disabled={guardando}>
                  Editar
                </button>
                <button className="btn" onClick={() => eliminarCliente(c.id)} disabled={guardando}>
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
