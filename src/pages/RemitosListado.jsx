import { useEffect, useMemo, useState } from "react";
import { http } from "../api/http";
import { Link } from "react-router-dom";
import "../style/remitos.css";

const ESTADOS = [
  { id: 1, label: "Pendiente" },
  { id: 2, label: "En proceso" },
  { id: 3, label: "Listo" },
  { id: 4, label: "Entregado" },
  { id: 5, label: "Cancelado" },
];

function estadoLabel(estadoNum) {
  return ESTADOS.find((e) => e.id === estadoNum)?.label ?? `Estado ${estadoNum}`;
}

export default function RemitosListado() {
  const [clientes, setClientes] = useState([]);
  const [remitos, setRemitos] = useState([]);

  const [fClienteId, setFClienteId] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  // paginado simple
  const pageSize = 8;
  const [page, setPage] = useState(1);

  async function cargarClientes() {
    try {
      const { data } = await http.get("/api/Cliente");
      setClientes(Array.isArray(data) ? data : []);
    } catch {
      setClientes([]);
    }
  }

  async function cargarRemitos(clienteFiltro = fClienteId) {
    setError("");
    setMsg("");
    setCargando(true);
    try {
      const query = clienteFiltro ? `?clienteId=${clienteFiltro}` : "";
      const { data } = await http.get(`/api/Remito${query}`);
      setRemitos(Array.isArray(data) ? data : []);
      setPage(1);
    } catch {
      setError("No se pudieron cargar remitos.");
      setRemitos([]);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    (async () => {
      await cargarClientes();
      await cargarRemitos("");
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function cambiarEstado(remitoId, nuevoEstado) {
    setError("");
    setMsg("");
    setGuardando(true);
    try {
      await http.put(`/api/Remito/${remitoId}/estado`, { estado: nuevoEstado });
      setMsg("Estado actualizado ✅");
      await cargarRemitos(fClienteId);
    } catch (e) {
      const serverMsg = e?.response?.data;
      setError(typeof serverMsg === "string" ? serverMsg : "No se pudo cambiar el estado.");
    } finally {
      setGuardando(false);
    }
  }

  async function cancelarRemito(remitoId) {
    setError("");
    setMsg("");

    const ok = window.confirm("¿Seguro que querés cancelar este remito?");
    if (!ok) return;

    setGuardando(true);
    try {
      await http.delete(`/api/Remito/${remitoId}`); // backend lo marca Cancelado
      setMsg("Remito cancelado ✅");
      await cargarRemitos(fClienteId);
    } catch (e) {
      const serverMsg = e?.response?.data;
      setError(typeof serverMsg === "string" ? serverMsg : "No se pudo cancelar el remito.");
    } finally {
      setGuardando(false);
    }
  }

  function imprimirRemito(remitoId) {
    // Opción rápida: abrir el detalle en otra pestaña para imprimir desde ahí
    window.open(`/remitos/${remitoId}?print=1`, "_blank", "noopener,noreferrer");
  }

  const totalPages = useMemo(() => Math.max(1, Math.ceil(remitos.length / pageSize)), [remitos.length]);
  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return remitos.slice(start, start + pageSize);
  }, [remitos, page]);

  return (
    <div className="page">
      <div className="pageHeader">
        <div>
          <h1 className="h1">Remitos</h1>
          <p className="muted">Listado con cambio de estado, cancelación, detalle e impresión.</p>
        </div>

        <div className="actions">
          <Link className="btn btnPrimary" to="/remitos/crear">
            Crear remito
          </Link>
          <button className="btn" onClick={() => cargarRemitos(fClienteId)} disabled={guardando}>
            {cargando ? "Actualizando..." : "Actualizar listado"}
          </button>
        </div>
      </div>

      {error && <div className="alert alertError">{error}</div>}
      {msg && <div className="alert alertOk">{msg}</div>}

      <div className="panel">
        <div className="panelRow">
          <div className="field" style={{ flex: 1 }}>
            <label className="label">Filtrar por cliente</label>
            <select
              className="input"
              value={fClienteId}
              onChange={async (e) => {
                const v = e.target.value;
                setFClienteId(v);
                await cargarRemitos(v);
              }}
            >
              <option value="">Todos los clientes</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="pill">
            {remitos.length} remitos · pág {page}/{totalPages}
          </div>
        </div>
      </div>

      <div className="list">
        {cargando ? (
          <div className="panel">
            <p className="muted">Cargando...</p>
          </div>
        ) : remitos.length === 0 ? (
          <div className="panel">
            <p className="muted">No hay remitos.</p>
          </div>
        ) : (
          pageItems.map((r) => (
            <div key={r.id} className="cardRow">
              <div className="cardRow__main">
                <div className="cardRow__title">
                  Remito <span className="chip">#{r.id}</span>
                </div>
                <div className="cardRow__sub">
                  Cliente: {r.clienteNombre} · Total: ${r.total} · {estadoLabel(r.estado)}
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                {/* ESTADO (como antes) */}
                <select
                  className="input"
                  style={{ width: 180 }}
                  value={r.estado}
                  onChange={(e) => cambiarEstado(r.id, Number(e.target.value))}
                  disabled={guardando || r.estado === 5}
                >
                  {ESTADOS.map((es) => (
                    <option key={es.id} value={es.id}>
                      {es.label}
                    </option>
                  ))}
                </select>

                {/* CANCELAR (como antes) */}
                <button
                  className="btn btnDanger"
                  onClick={() => cancelarRemito(r.id)}
                  disabled={guardando || r.estado === 4 || r.estado === 5}
                >
                  Cancelar
                </button>

                {/* DETALLE + IMPRIMIR */}
                <Link className="btn btnPrimary" to={`/remitos/${r.id}`}>
                  Ver detalle
                </Link>

                <button className="btn" onClick={() => imprimirRemito(r.id)}>
                  Imprimir
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {remitos.length > 0 && (
        <div className="panel" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button className="btn" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
            ← Anterior
          </button>

          <div className="pill">
            Página {page} de {totalPages}
          </div>

          <button className="btn" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
}
