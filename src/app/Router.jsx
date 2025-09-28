import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Users from "../pages/Users";
import RolesYPermisos from "../pages/RolesYPermisos";
import BitacoraPractica from "../pages/bitacora";
import RecordatoriosDePago from "../pages/RecordatoriosDePago";
import AvisosyComunicados from "../pages/AvisosyComunicados"
import CuotasGastosInterface from "../pages/CuotasyGastosComunes";
import MaintenanceManagement from "../pages/Mantenimiento";
import PrediccionMorosidad from "../pages/Predicion-Morosidad";
import ReportesFinancieros from "../pages/ReportesFinancieros";
import ReportesAreasComunes from "../pages/Uso-de-areas";


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
      <Route path="/avisos" element={<PrivateRoute><AvisosyComunicados/></PrivateRoute>} />
      <Route path="/cuotas" element={<PrivateRoute><CuotasGastosInterface/></PrivateRoute>} />
      <Route path="/mantenimiento" element={<PrivateRoute><MaintenanceManagement/></PrivateRoute>} />
      <Route path="/prediccion" element={<PrivateRoute><PrediccionMorosidad/></PrivateRoute>} />
      <Route path="/reportes" element={<PrivateRoute><ReportesFinancieros/></PrivateRoute>} />
      <Route path="/usoAreas" element={<PrivateRoute><ReportesAreasComunes/></PrivateRoute>} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
