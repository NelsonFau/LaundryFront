import { Link } from "react-router-dom";
import "../style/app.css";

export default function Home() {
  return (
    <div className="page">
      <h1 className="h1">Bienvenido</h1>
      <p className="muted">
        Desde acá podés gestionar clientes, artículos y remitos. La idea es que funcione cómodo en compu y celular.
      </p>

      <div className="grid">
        <Link className="card" to="/clientes">
          <div className="card__title">Clientes</div>
          <div className="card__desc">Alta, listado y edición.</div>
        </Link>

        <Link className="card" to="/articulos">
          <div className="card__title">Artículos</div>
          <div className="card__desc">Catálogo de prendas/servicios.</div>
        </Link>

        <Link className="card" to="/remitos">
          <div className="card__title">Remitos</div>
          <div className="card__desc">Entradas, estados y entregas.</div>
        </Link>
      </div>
    </div>
  );
}
