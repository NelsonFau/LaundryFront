import { NavLink, Outlet } from "react-router-dom";
import "../style/app.css";

export default function Layout() {
  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar__inner">
          <div className="brand">
            <div className="brand__logo">🧺</div>
            <div className="brand__text">
              <div className="brand__name">Lavandería</div>
              <div className="brand__sub">Panel</div>
            </div>
          </div>

          <nav className="nav">
            <NavLink to="/" end className={({ isActive }) => "nav__link" + (isActive ? " is-active" : "")}>
              Home
            </NavLink>
            <NavLink to="/clientes" className={({ isActive }) => "nav__link" + (isActive ? " is-active" : "")}>
              Clientes
            </NavLink>
            <NavLink to="/articulos" className={({ isActive }) => "nav__link" + (isActive ? " is-active" : "")}>
              Artículos
            </NavLink>
            <NavLink to="/remitos" className={({ isActive }) => "nav__link" + (isActive ? " is-active" : "")}>
              Remitos
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="content">
        <div className="container">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
