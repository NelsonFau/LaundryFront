import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { http } from "../api/http";
import "../style/remitoDetalle.css";

export default function RemitoDetalle() {
  const { id } = useParams();
  const location = useLocation();

  const [remito, setRemito] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const wantsAutoPrint = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    return sp.get("print") === "1";
  }, [location.search]);

  async function cargar() {
    setError("");
    setCargando(true);
    try {
      const { data } = await http.get(`/api/Remito/${id}`);
      setRemito(data ?? null);
    } catch {
      setError("No se pudo cargar el detalle del remito.");
      setRemito(null);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!cargando && remito && wantsAutoPrint) {
      setTimeout(() => window.print(), 150);
    }
  }, [cargando, remito, wantsAutoPrint]);

  const items = Array.isArray(remito?.items) ? remito.items : [];

  const totalUI = useMemo(() => {
    if (remito?.total != null) return Number(remito.total);
    return items.reduce((acc, it) => acc + Number(it.subtotal ?? 0), 0);
  }, [remito, items]);

  return (
    <div className="page">
      <div className="pageHeader noPrint">
        <div>
          <h1 className="h1">Detalle de remito</h1>
          <p className="muted">Remito #{id}</p>
        </div>

        <div className="actions">
          <Link className="btn" to="/remitos">
            Volver al listado
          </Link>
          <button
            className="btn btnPrimary"
            onClick={() => window.print()}
            disabled={cargando || !remito}
          >
            Imprimir
          </button>
        </div>
      </div>

      {error && <div className="alert alertError noPrint">{error}</div>}

      {cargando ? (
        <div className="panel">
          <p className="muted">Cargando...</p>
        </div>
      ) : !remito ? (
        <div className="panel">
          <p className="muted">No hay datos para mostrar.</p>
        </div>
      ) : (
        <div className="panel printArea" id="printArea">
          <div className="remitoHeader">
            <div className="remitoTitle">
              <div className="h3" style={{ margin: 0 }}>
                Remito <span className="chip">#{remito.id ?? id}</span>
              </div>

              <div className="muted" style={{ marginTop: 6 }}>
                Cliente: <b>{remito.clienteNombre ?? "-"}</b> · Estado:{" "}
                <b>{remito.estado ?? "-"}</b>
              </div>
            </div>

            <div className="remitoTotals">
              <div className="pill">
                Total: <b>${totalUI}</b>
              </div>

              {remito.fecha && (
                <div className="muted" style={{ marginTop: 6 }}>
                  Fecha: {String(remito.fecha)}
                </div>
              )}
            </div>
          </div>

          <div className="remitoItems">
            <div className="h3">Ítems</div>

            {items.length === 0 ? (
              <p className="muted">No vinieron ítems en la respuesta.</p>
            ) : (
              <div className="tableWrap">
                <table className="remitoTable">
                  <thead>
                    <tr>
                      <th>Artículo</th>
                      <th style={{ width: 110 }}>Cant.</th>
                      <th style={{ width: 140 }}>Precio</th>
                      <th style={{ width: 160 }}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it, idx) => (
                      <tr key={idx}>
                        <td>{it.articuloNombre ?? "-"}</td>
                        <td>{Number(it.cantidad ?? 0)}</td>
                        <td>${Number(it.precioUnitario ?? 0)}</td>
                        <td>${Number(it.subtotal ?? 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div className="printFooter">
  <div className="total">
    Total: ${totalUI}
  </div>

  <div className="firma">
    Firma y aclaración
  </div>
</div>


          <details className="noPrint" style={{ marginTop: 14 }}>
            <summary className="muted">Ver JSON (debug)</summary>
            <pre className="jsonBox">{JSON.stringify(remito, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  );
}
