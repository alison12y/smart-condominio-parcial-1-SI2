import React, { useState } from "react";
import * as XLSX from "xlsx";
import "../styles/ReportesFinancieros.css"; // <-- IMPORTA TU CSS

const ReportesFinancieros = () => {
  const [selectedReport, setSelectedReport] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportGenerated, setReportGenerated] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Datos simulados
  const mockData = {
    ingresos: [
      { concepto: "Cuotas de mantenimiento", monto: 1250.5, fecha: "2024-01-15" },
      { concepto: "Multas", monto: 85.75, fecha: "2024-01-20" },
      { concepto: "Servicios adicionales", monto: 320.0, fecha: "2024-01-25" },
    ],
    gastos: [
      { concepto: "Mantenimiento de áreas comunes", monto: 485.25, fecha: "2024-01-10" },
      { concepto: "Servicios públicos", monto: 650.8, fecha: "2024-01-15" },
      { concepto: "Seguridad", monto: 920.0, fecha: "2024-01-20" },
    ],
    deudas: [
      { propietario: "Juan Pérez", apartamento: "101", monto: 125.5, concepto: "Cuota mantenimiento", fechaVencimiento: "2024-01-31" },
      { propietario: "María García", apartamento: "205", monto: 85.75, concepto: "Multa ruido", fechaVencimiento: "2024-02-15" },
      { propietario: "Carlos López", apartamento: "308", monto: 251.0, concepto: "Cuotas atrasadas", fechaVencimiento: "2024-01-20" },
    ],
  };

  const handleGenerateReport = () => {
    setError("");
    if (!selectedReport) return setError("Debe seleccionar un criterio para generar el reporte");
    if (!startDate || !endDate) return setError("Debe seleccionar un criterio para generar el reporte");

    setLoading(true);
    setTimeout(() => {
      const data = mockData[selectedReport];
      if (!data || data.length === 0) {
        setError("No se encontraron registros para los criterios seleccionados");
        setReportGenerated(false);
        setReportData(null);
      } else {
        setReportData(data);
        setReportGenerated(true);
      }
      setLoading(false);
    }, 1500);
  };

  const generatePDF = () => {
    const reportTitle =
      selectedReport === "ingresos" ? "Reporte de Ingresos" : selectedReport === "gastos" ? "Reporte de Gastos" : "Reporte de Deudas";

    let content = `${reportTitle.toUpperCase()}\n`;
    content += `Sistema de Gestión de Condominio\n`;
    content += `${"=".repeat(50)}\n\n`;
    content += `INFORMACIÓN DEL REPORTE:\n`;
    content += `Período: ${new Date(startDate).toLocaleDateString("es-VE")} - ${new Date(endDate).toLocaleDateString("es-VE")}\n`;
    content += `Fecha de generación: ${new Date().toLocaleDateString("es-VE")} ${new Date().toLocaleTimeString("es-VE")}\n`;
    content += `Total de registros: ${reportData.length}\n\n`;
    content += `DETALLE:\n`;
    content += `${"-".repeat(50)}\n`;

    if (selectedReport === "deudas") {
      content += `${"Propietario".padEnd(20)} ${"Apt".padEnd(8)} ${"Concepto".padEnd(20)} ${"Monto".padStart(12)} ${"Vencimiento".padEnd(12)}\n`;
      content += `${"-".repeat(80)}\n`;
      reportData.forEach((item) => {
        content += `${item.propietario.padEnd(20)} ${item.apartamento.padEnd(8)} ${item.concepto.padEnd(20)} ${formatCurrency(item.monto).padStart(12)} ${new Date(item.fechaVencimiento).toLocaleDateString("es-VE").padEnd(12)}\n`;
      });
    } else {
      content += `${"Concepto".padEnd(35)} ${"Monto".padStart(15)} ${"Fecha".padEnd(12)}\n`;
      content += `${"-".repeat(65)}\n`;
      reportData.forEach((item) => {
        content += `${item.concepto.padEnd(35)} ${formatCurrency(item.monto).padStart(15)} ${new Date(item.fecha).toLocaleDateString("es-VE").padEnd(12)}\n`;
      });
    }

    content += `\n${"-".repeat(50)}\n`;
    content += `TOTAL: ${formatCurrency(calculateTotal())}\n`;
    content += `${"-".repeat(50)}\n`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${reportTitle.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    alert("📄 Archivo de reporte descargado como .txt\n\nPuede convertir este archivo a PDF usando herramientas como:\n• Microsoft Word\n• Google Docs\n• Convertidores online");
  };

  const generateExcel = () => {
    const reportTitle =
      selectedReport === "ingresos" ? "Reporte de Ingresos" : selectedReport === "gastos" ? "Reporte de Gastos" : "Reporte de Deudas";

    const excelData = [];
    if (selectedReport === "deudas") {
      excelData.push(["Propietario", "Apartamento", "Concepto", "Monto (Bs)", "Fecha Vencimiento"]);
      reportData.forEach((item) => {
        excelData.push([item.propietario, item.apartamento, item.concepto, item.monto, new Date(item.fechaVencimiento).toLocaleDateString("es-VE")]);
      });
    } else {
      excelData.push(["Concepto", "Monto (Bs)", "Fecha"]);
      reportData.forEach((item) => {
        excelData.push([item.concepto, item.monto, new Date(item.fecha).toLocaleDateString("es-VE")]);
      });
    }
    excelData.push([]);
    excelData.push(["TOTAL:", "", calculateTotal()]);

    const ws = XLSX.utils.aoa_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    ws["!cols"] = selectedReport === "deudas"
      ? [{ wch: 25 }, { wch: 15 }, { wch: 30 }, { wch: 15 }, { wch: 18 }]
      : [{ wch: 35 }, { wch: 15 }, { wch: 15 }];

    XLSX.utils.book_append_sheet(wb, ws, reportTitle.substring(0, 30));
    const fileName = `${reportTitle.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const handleExport = (format) => {
    if (!reportData || reportData.length === 0) return setError("No hay datos para exportar");
    if (format === "pdf") generatePDF();
    else if (format === "excel") generateExcel();
  };

  const calculateTotal = () => (reportData ? reportData.reduce((sum, item) => sum + item.monto, 0) : 0);

  const formatCurrency = (amount) =>
    `Bs ${amount.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="rf-container">
      <div className="rf-header">
        <div className="rf-breadcrumb">
        </div>
        <h1 className="rf-title">Reportes Financieros</h1>
      </div>

      <div className="rf-content">
        <div className="rf-card">
          <h2 className="rf-section-title">Configuración del Reporte</h2>

          <div className="rf-form-group">
            <label className="rf-label">Tipo de Reporte *</label>
            <select className="rf-select" value={selectedReport} onChange={(e) => setSelectedReport(e.target.value)}>
              <option value="">Seleccione un tipo de reporte</option>
              <option value="ingresos">Reporte de Ingresos</option>
              <option value="gastos">Reporte de Gastos</option>
              <option value="deudas">Reporte de Deudas</option>
            </select>
          </div>

          <div className="rf-date-range">
            <div className="rf-form-group">
              <label className="rf-label">Fecha de Inicio *</label>
              <input type="date" className="rf-input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="rf-form-group">
              <label className="rf-label">Fecha de Fin *</label>
              <input type="date" className="rf-input" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          <div className="rf-actions">
            <button className={`rf-btn rf-btn--primary ${loading ? "rf-btn--disabled" : ""}`} onClick={handleGenerateReport} disabled={loading}>
              {loading ? "Generando..." : "Generar Reporte"}
            </button>
          </div>

          {error && (
            <div className="rf-alert rf-alert--error">
              <span className="rf-alert__icon">⚠️</span>
              {error}
            </div>
          )}
        </div>

        {reportGenerated && reportData && (
          <div className="rf-report">
            <div className="rf-report__header">
              <h2 className="rf-section-title">
                {selectedReport === "ingresos" && "Reporte de Ingresos"}
                {selectedReport === "gastos" && "Reporte de Gastos"}
                {selectedReport === "deudas" && "Reporte de Deudas"}
              </h2>
              <div className="rf-export">
                <button className="rf-btn rf-btn--secondary" onClick={() => handleExport("pdf")}>📄 Exportar TXT</button>
                <button className="rf-btn rf-btn--secondary" onClick={() => handleExport("excel")}>📊 Exportar Excel</button>
              </div>
            </div>

            <div className="rf-report__info">
              <span className="rf-report__period">
                Período: {new Date(startDate).toLocaleDateString("es-VE")} - {new Date(endDate).toLocaleDateString("es-VE")}
              </span>
              <span className="rf-report__total">Total: {formatCurrency(calculateTotal())}</span>
            </div>

            <div className="rf-table-wrap">
              <table className="rf-table">
                <thead>
                  <tr>
                    {selectedReport === "deudas" ? (
                      <>
                        <th>Propietario</th>
                        <th>Apartamento</th>
                        <th>Concepto</th>
                        <th>Monto</th>
                        <th>Fecha Vencimiento</th>
                      </>
                    ) : (
                      <>
                        <th>Concepto</th>
                        <th>Monto</th>
                        <th>Fecha</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((item, i) => (
                    <tr key={i}>
                      {selectedReport === "deudas" ? (
                        <>
                          <td>{item.propietario}</td>
                          <td>{item.apartamento}</td>
                          <td>{item.concepto}</td>
                          <td className="rf-amount">{formatCurrency(item.monto)}</td>
                          <td>{new Date(item.fechaVencimiento).toLocaleDateString("es-VE")}</td>
                        </>
                      ) : (
                        <>
                          <td>{item.concepto}</td>
                          <td className="rf-amount">{formatCurrency(item.monto)}</td>
                          <td>{new Date(item.fecha).toLocaleDateString("es-VE")}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rf-summary">
              <div className="rf-summary__card">
                <h3 className="rf-summary__title">Resumen</h3>
                <div className="rf-summary__content">
                  <div className="rf-summary__item">
                    <span>Total de registros:</span>
                    <strong>{reportData.length}</strong>
                  </div>
                  <div className="rf-summary__item">
                    <span>Monto total:</span>
                    <strong className="rf-total">{formatCurrency(calculateTotal())}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportesFinancieros;