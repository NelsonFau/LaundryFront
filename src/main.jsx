import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";
import Home from "./pages/Home";
import Clientes from "./pages/Clientes";
import Articulos from "./pages/Articulos";

import Remitos from "./pages/Remitos"; // (viejo: crear + listado)
import RemitosListado from "./pages/RemitosListado"; // (nuevo: listado)
import RemitoDetalle from "./pages/RemitoDetalle";   // (nuevo: detalle)

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/articulos" element={<Articulos />} />

          {/* ✅ NUEVO: /remitos muestra el listado */}
          <Route path="/remitos" element={<RemitosListado />} />
          <Route path="/remitos/:id" element={<RemitoDetalle />} />

          {/* ✅ OPCIONAL: dejá el viejo en otra ruta */}
          <Route path="/remitos/crear" element={<Remitos />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
