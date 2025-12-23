import { useEffect, useMemo, useState } from "react";
import { http } from "../api/http";
import { Link } from "react-router-dom";
import "../style/remitos.css";

export default function Remitos() {
  // data
  const [clientes, setClientes] = useState([]);
  const [articulos, setArticulos] = useState([]);

  // crear remito
  const [clienteId, setClienteId] = useState("");
  const [items, setItems] = useState([{ articuloId: "", cantidad: 1 }]);

  // ui
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  async function cargarDatos() {
    setCargando(true);
    setError("");
    setMsg("");
    try {
      const [cRes, aRes] = await Promise.all([
        http.get("/api/Cliente"),
        http.get("/api/Articulo"),
      ]);

      const c = Array.isArray(cRes.data) ? cRes.data : [];
      const a = Array.isArray(aRes.data) ? aRes.data : [];

      setClientes(c);
      setArticulos(a.filter((x) => x.activo));
    } catch {
      setError("No se pudieron cargar clientes/artículos. ¿Está la API corriendo?");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setItem(idx, patch) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }

  function agregarItem() {
    setItems((prev) => [{ articuloId: "", cantidad: 1 }, ...prev]);
  }

  function quitarItem(idx) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  const totalEstimado = useMemo(() => {
    // Solo estimación para UI. El total real lo calcula el backend.
    return items.reduce((acc, it) => {
      const art = articulos.find((a) => String(a.id) === String(it.articuloId));
      const precio = art ? Number(art.precio) : 0;
      return acc + Number(it.cantidad || 0) * precio;
    }, 0);
  }, [items, articulos]);

  async function guardarRemito() {
    setError("");
    setMsg("");

    if (!clienteId) {
      setError("Seleccioná un cliente.");
      return;
    }

    const itemsValidos = items
      .filter((it) => it.articuloId && Number(it.cantidad) > 0)
      .map((it) => ({
        articuloId: Number(it.articuloId),
        cantidad: Number(it.cantidad),
      }));

    if (itemsValidos.length === 0) {
      setError("Agregá al menos un artículo con cantidad.");
      return;
    }

    const payload = {
      clienteId: Number(clienteId),
      items: itemsValidos,
    };

    setGuardando(true);
    try {
      await http.post("/api/Remito", payload);
      setMsg("Remito creado ✅");

      setClienteId("");
      setItems([{ articuloId: "", cantidad: 1 }]);
    } catch (e) {
      const serverMsg = e?.response?.data;
      setError(typeof serverMsg === "string" ? serverMsg : "No se pudo guardar el remito.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="page">
      <div className="pageHeader">
        <div>
          <h1 className="h1">Crear remito</h1>
          <p className="muted">Seleccioná cliente, agregá items y guardá.</p>
        </div>

        <div className="actions">
          <Link className="btn" to="/remitos">
            Volver al listado
          </Link>

          <button className="btn btnPrimary" onClick={guardarRemito} disabled={cargando || guardando}>
            {guardando ? "Guardando..." : "Guardar remito"}
          </button>
        </div>
      </div>

      {error && <div className="alert alertError">{error}</div>}
      {msg && <div className="alert alertOk">{msg}</div>}

      {cargando ? (
        <div className="panel">
          <p className="muted">Cargando...</p>
        </div>
      ) : (
        <div className="panel">
          <h3 className="h3">Nuevo remito</h3>

          <div className="field">
            <label className="label">Cliente</label>
            <select className="input" value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
              <option value="">Seleccionar Cliente</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          <div
            style={{
              marginTop: 12,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <div className="muted">Items</div>
            <button className="btn" onClick={agregarItem} disabled={guardando}>
              + Agregar item
            </button>
          </div>

          <div className="list" style={{ marginTop: 10 }}>
            {items.map((it, idx) => {
              const art = articulos.find((a) => String(a.id) === String(it.articuloId));
              const precio = art ? Number(art.precio) : 0;
              const subtotal = Number(it.cantidad || 0) * precio;

              return (
                <div key={idx} className="cardRow" style={{ alignItems: "flex-start" }}>
                  <div style={{ flex: 1, display: "grid", gap: 10 }}>
                    <div className="field">
                      <label className="label">Artículo *</label>
                      <select
                        className="input"
                        value={it.articuloId}
                        onChange={(e) => setItem(idx, { articuloId: e.target.value })}
                      >
                        <option value="">Seleccionar Articulo</option>
                        {articulos.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr" }}>
                      <div className="field">
                        <label className="label">Cantidad</label>
                        <input
                          className="input"
                          type="number"
                          min="1"
                          value={it.cantidad}
                          onChange={(e) => setItem(idx, { cantidad: Number(e.target.value) })}
                        />
                      </div>

                      <div className="field">
                        <label className="label">Subtotal</label>
                        <input className="input" value={`$${subtotal}`} readOnly />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn" onClick={() => quitarItem(idx)} disabled={guardando || items.length === 1}>
                      Quitar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
            <div className="pill">
              Total estimado: <b>${totalEstimado}</b>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
