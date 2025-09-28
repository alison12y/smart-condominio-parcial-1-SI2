import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Users from "../pages/Users";
import RolesYPermisos from "../pages/RolesYPermisos";
import BitacoraPractica from "../pages/bitacora";
import RecordatoriosDePago from "../pages/RecordatoriosDePago";


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

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
