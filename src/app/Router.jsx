import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Users from "../pages/Users";
import RolesYPermisos from "../pages/RolesYPermisos";
import BitacoraPractica from "../pages/bitacora";
import RecordatoriosDePago from "../pages/RecordatoriosDePago";
import CuotasGastosComunes from "@/../../src/pages/CuotasyGastosComunes";
import FinancialReportsInterface from "../pages/ReportesFinancieros";
import AvisosYComunicados from "../pages/AvisosyComunicados";
import Mantenimiento from "../pages/Mantenimiento";
import PrediccionMorosidad from "../pages/Predicion-Morosidad";


function PrivateRoute({ children }) {
  const hasToken = !!(localStorage.getItem("access") || sessionStorage.getItem("access"));
  return hasToken ? children : <Navigate to="/login" replace />;
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard/></PrivateRoute>} />
      <Route path="/users" element={<PrivateRoute><Users/></PrivateRoute>} />
      <Route path="/roles" element={<PrivateRoute><RolesYPermisos/></PrivateRoute>} />
      <Route path="/bitacora" element={<PrivateRoute><BitacoraPractica/></PrivateRoute>} />
      <Route path="/pagos" element={<PrivateRoute><RecordatoriosDePago/></PrivateRoute>} />
      <Route path="/cuotas" element={<PrivateRoute><CuotasGastosComunes/></PrivateRoute>} />
      <Route path="/reportes" element={<PrivateRoute><FinancialReportsInterface/></PrivateRoute>} />
      <Route path="/avisos" element={<PrivateRoute><AvisosYComunicados/></PrivateRoute>} />
      <Route path="/matenimiento" element={<PrivateRoute><Mantenimiento/></PrivateRoute>} />
      <Route path="/prediccion" element={<PrivateRoute><PrediccionMorosidad/></PrivateRoute>} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
