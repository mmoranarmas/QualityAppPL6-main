import React, { useState, useMemo, useEffect } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import { fetchMaterial, fetchGraficaData, fetchGraficaStatus, saveGraficaStatus } from "../../api/api";
import "../../styles/graficas.css";

const GraficaProyecto = ({ proyectos }) => {
  // Estados
  const [materialData, setMaterialData] = useState([]);
  const [graficaData, setGraficaData] = useState([]);
  const [dataStatus, setDataStatus] = useState(0); // 0: original, 1: editados
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [expectedProduction, setExpectedProduction] = useState(200000);
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState("usuario");
  const currentYear = new Date().getFullYear();

  // Obtener datos
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      
      // Obtener datos
      const materialResult = await fetchMaterial(token);
      const graficaResult = await fetchGraficaData(token);
      
      // Obtener status guardado
      if (selectedProject) {
        const statusResult = await fetchGraficaStatus(token);
        const projectStatus = statusResult.find(
          s => s.projectName === selectedProject && 
          s.month === new Date().getMonth() + 1
        );
        if (projectStatus) {
          setDataStatus(projectStatus.status);
        }
      }
      
      setMaterialData(materialResult);
      setGraficaData(graficaResult);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Error al cargar los datos. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedProject]);

  // Obtener el rol del usuario
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.rol) {
      setUserRole(user.rol);
    }
  }, []);

  // Generar meses del año
  const generateAllMonths = (year) => {
    return Array.from({ length: 12 }, (_, i) => 
      `${year}-${String(i + 1).padStart(2, "0")}`
    );
  };

  // Filtrar datos por proyecto y status
  const filteredDataByProject = useMemo(() => {
    if (!selectedProject) return [];
    
    let dataSource = [];
    if (dataStatus === 0) {
      dataSource = materialData;
    } else if (dataStatus === 1) {
      // Procesar los datos editados
      dataSource = graficaData.map(item => ({
        ...item,
        // Calcular total_final como la suma de total_passed y total_mal
        total_final: (item.total_passed || 0) + (item.total_mal || 0),
        // Mantener total_mal como está
        total_mal: item.total_mal || 0
      }));
    } else {
      dataSource = [...materialData, ...graficaData];
    }
    
    return dataSource.filter((item) => {
      const proyecto = proyectos.find((p) => {
        if (dataStatus === 0) {
          return p.no_parte === item.no_parte;
        } else if (dataStatus === 1) {
          return p.no_parte === item.partNumber;
        } else {
          return p.no_parte === (item.no_parte || item.partNumber);
        }
      });
      return proyecto && proyecto.nombre_proyecto === selectedProject;
    });
  }, [materialData, graficaData, selectedProject, proyectos, dataStatus]);

  // Procesar datos mensuales
  const monthlyDataForProject = useMemo(() => {
    const grouped = {};
    const allMonths = generateAllMonths(currentYear);

    // Inicializar meses
    allMonths.forEach(month => {
      grouped[month] = { total_final: 0, total_mal: 0 };
    });

    // Agrupar datos
    filteredDataByProject.forEach((item) => {
      let date;
      if (dataStatus === 0 || item.fecha) {
        date = new Date(item.fecha);
      } else {
        date = new Date(currentYear, item.month - 1, item.day);
      }
      
      const month = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
      
      if (grouped[month]) {
        if (dataStatus === 0 || item.total_final !== undefined) {
          grouped[month].total_final += item.total_final || 0;
          grouped[month].total_mal += item.total_mal || 0;
        } else {
          // Para datos editados, calcular total_final como total_passed + total_mal
          const totalProduced = (item.total_passed || 0) + (item.total_mal || 0);
          grouped[month].total_final += totalProduced;
          grouped[month].total_mal += item.total_mal || 0;
        }
      }
    });

    // Formatear datos para el gráfico
    const monthNames = ["ene", "feb", "mar", "abr", "may", "jun", 
                       "jul", "ago", "sep", "oct", "nov", "dic"];

    const data = Object.entries(grouped).map(([month, values]) => {
      const monthNum = parseInt(month.split("-")[1], 10) - 1;
      const rejectionPercentage = values.total_final > 0 
        ? (values.total_mal / values.total_final) * 100 
        : 0;

      return {
        month: monthNames[monthNum],
        total_final: values.total_final,
        total_mal: values.total_mal,
        rejectionPercentage,
        exceedsLimit: rejectionPercentage > 2.2,
      };
    });

    // Ordenar por mes
    const monthOrder = ["ene", "feb", "mar", "abr", "may", "jun", 
                       "jul", "ago", "sep", "oct", "nov", "dic"];
    data.sort((a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month));

    return data;
  }, [filteredDataByProject, currentYear, dataStatus]);

  // Nombres de proyectos únicos
  const projectNames = useMemo(() => 
    [...new Set(proyectos.map(p => p.nombre_proyecto))], 
    [proyectos]
  );

  // Componente de leyenda personalizado
  const renderCustomLegend = (props) => {
    const { payload } = props;
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
        padding: "15px 0",
        alignItems: "center",
        gap: "15px",
        borderRadius: "8px",
        margin: "10px 0"
      }}>
        <div className="production-input" style={{
          display: "flex",
          alignItems: "center",
          background: "white",
          color: "#333",
          padding: "6px 12px",
          borderRadius: "6px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
        }}>
          <span style={{ marginRight: "8px" }}>Prod. Esperada:</span>
          <input
            type="number"
            value={expectedProduction}
            onChange={(e) => setExpectedProduction(Number(e.target.value))}
            min="1"
            style={{
              width: "100px",
              padding: "4px",
              borderRadius: "4px",
              border: "1px solid #ccc"
            }}
          />
        </div>
  
        {payload.map((entry, index) => (
          <div key={`legend-${index}`} style={{
            display: "flex",
            alignItems: "center",
            padding: "6px 12px",
            borderRadius: "6px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
          }}>
            <div style={{
              width: "14px",
              height: "14px",
              backgroundColor: entry.color,
              marginRight: "8px",
              borderRadius: "3px"
            }} />
            <span style={{ fontSize: "13px", fontWeight: "500" }}>{entry.value}</span>
          </div>
        ))}
  
        <div style={{
          display: "flex",
          alignItems: "center",
          padding: "6px 12px",
          borderRadius: "6px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
        }}>
          <div style={{
            width: "14px",
            height: "2px",
            backgroundColor: "red",
            marginRight: "8px"
          }} />
          <span style={{ fontSize: "13px", fontWeight: "500" }}>Límite 2.2%</span>
        </div>
      </div>
    );
  };

  // Tooltip personalizado
  const renderCustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    
    const data = payload[0].payload;
    return (
      <div
        className="custom-tooltip"
        style={{
          background: "white",
          color: "#333",
          padding: "12px",
          border: "1px solid #e1e4e8",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          fontSize: "13px",
          lineHeight: "1.5",
          minWidth: "180px"
        }}
      >
        <p style={{
          margin: "0 0 8px 0",
          fontWeight: "bold",
          paddingBottom: "6px",
          borderBottom: "1px solid #e1e4e8",
          color: "#2c3e50"
        }}>
          Mes: {label}
        </p>
        <p style={{ margin: "4px 0", display: "flex", justifyContent: "space-between" }}>
          <span>Total Producido:</span>
          <span style={{ fontWeight: "500" }}>{data.total_final?.toLocaleString() || "N/A"}</span>
        </p>
        <p style={{ margin: "4px 0", display: "flex", justifyContent: "space-between" }}>
          <span>Total Rechazado:</span>
          <span style={{ fontWeight: "500" }}>{data.total_mal?.toLocaleString() || "0"}</span>
        </p>
        <p style={{ margin: "4px 0", display: "flex", justifyContent: "space-between" }}>
          <span>% Rechazo:</span>
          <span style={{ fontWeight: "500" }}>{data.rejectionPercentage?.toFixed(2) || "0"}%</span>
        </p>
        {data.exceedsLimit && (
          <p style={{
            margin: "8px 0 0 0",
            color: "#e74c3c",
            fontWeight: "500",
            textAlign: "center"
          }}>
            ⚠️ ¡Supera el límite del 2.2%!
          </p>
        )}
      </div>
    );
  };

  // Renderizado condicional de celdas de porcentaje
  const renderPercentageCell = (value, isTotal = false) => {
    const cellClass = [
      "percentage-cell",
      isTotal ? "acumulado-cell" : "",
      value > 2.2 ? "danger" : value > 1.5 ? "warning" : "success"
    ].join(" ");

    return (
      <td className={cellClass}>
        {value.toFixed(2)}%
        {value > 2.2 && <span className="warning-indicator">⚠️</span>}
      </td>
    );
  };

  // Modificar el selector de status
  const handleStatusChange = async (newStatus) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      
      // Guardar el nuevo status
      await saveGraficaStatus([{
        projectName: selectedProject,
        month: new Date().getMonth() + 1,
        status: Number(newStatus)
      }], token);
      
      setDataStatus(Number(newStatus));
      await fetchData();
    } catch (error) {
      console.error("Error al cambiar el status:", error);
      setError("Error al cambiar la vista. Inténtalo de nuevo más tarde.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grafica-container">
      <p className="description">Gráficas por proyecto.</p>
      <div className="selectors-container">
        <select
          value={selectedProject || ""}
          onChange={(e) => setSelectedProject(e.target.value)}
          disabled={isLoading}
          style={{
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            minWidth: "200px"
          }}
        >
          <option value="">Selecciona un proyecto</option>
          {projectNames.map((project) => (
            <option key={project} value={project}>
              {project}
            </option>
          ))}
        </select>

        {userRole === "admin" && (
          <select
            value={dataStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            style={{
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              cursor: "pointer",
              opacity: isLoading ? 0.5 : 1,
              minWidth: "200px"
            }}
            disabled={isLoading || !selectedProject}
          >
            <option value={0}>Ver Datos Originales</option>
            <option value={1}>Ver Datos Editados</option>
          </select>
        )}
      </div>

      {error && (
        <div className="error-message" style={{
          color: "#dc3545",
          backgroundColor: "#f8d7da",
          padding: "10px",
          borderRadius: "4px",
          marginBottom: "15px"
        }}>
          {error}
        </div>
      )}

      {isLoading ? (
        <div style={{ textAlign: "center", padding: "20px" }}>
          Cargando datos...
        </div>
      ) : selectedProject ? (
        <>
          <div className="data-table-container" style={{
            marginTop: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            backgroundColor: "var(--card)",
            overflow: "auto"
          }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th className="header-cell">Datos</th>
                  {monthlyDataForProject.map((data) => (
                    <th key={data.month} className="header-cell month-cell">
                      {data.month}
                    </th>
                  ))}
                  <th className="header-cell acumulado-cell">Acumulado</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="label-cell">Total Producido</td>
                  {monthlyDataForProject.map((data) => (
                    <td key={`produced-${data.month}`} className="data-cell">
                      {data.total_final.toLocaleString()}
                    </td>
                  ))}
                  <td className="data-cell acumulado-cell">
                    {monthlyDataForProject
                      .reduce((sum, data) => sum + data.total_final, 0)
                      .toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="label-cell">Total Rechazado</td>
                  {monthlyDataForProject.map((data) => (
                    <td key={`rejected-${data.month}`} className="data-cell">
                      {data.total_mal.toLocaleString()}
                    </td>
                  ))}
                  <td className="data-cell acumulado-cell">
                    {monthlyDataForProject
                      .reduce((sum, data) => sum + data.total_mal, 0)
                      .toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="label-cell">% de Rechazo</td>
                  {monthlyDataForProject.map((data) => (
                    <React.Fragment key={`rejection-${data.month}`}>
                      {renderPercentageCell(data.rejectionPercentage)}
                    </React.Fragment>
                  ))}
                  {renderPercentageCell(
                    (monthlyDataForProject.reduce(
                      (sum, data) => sum + data.total_mal,
                      0
                    ) /
                      (monthlyDataForProject.reduce(
                        (sum, data) => sum + data.total_final,
                        0
                      ) || 1)) *
                      100,
                    true
                  )}
                </tr>
              </tbody>
            </table>
          </div>

          <div className="chart-container" style={{
            marginTop: "20px",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}>
            {monthlyDataForProject.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={monthlyDataForProject}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis
                    yAxisId="left"
                    label={{ angle: -90, position: "insideLeft" }}
                    domain={[0, expectedProduction * 1.2]}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    label={{ value: "% Rechazo", angle: 90, position: "insideRight" }}
                    domain={[0, 4]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip content={renderCustomTooltip} />
                  <Legend content={renderCustomLegend} />
                  <Bar yAxisId="left" dataKey="total_mal" name="Total Rechazado" fill="#82ca9d">
                    {monthlyDataForProject.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.exceedsLimit ? "#ff6b6b" : "#82ca9d"} 
                      />
                    ))}
                  </Bar>
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="rejectionPercentage"
                    name="% Rechazo"
                    stroke="#8884d8"
                    dot={{ r: 4 }}
                  />
                  <ReferenceLine
                    yAxisId="right"
                    y={2.2}
                    stroke="red"
                    strokeDasharray="5 5"
                    label={{ value: "2.2%", position: "top", fill: "red", fontSize: 12 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div style={{
                textAlign: "center",
                padding: "40px",
                color: "#666",
                fontSize: "18px"
              }}>
                📊 No hay datos disponibles para este proyecto con el filtro actual
              </div>
            )}
          </div>
        </>
      ) : (
        <div style={{
          textAlign: "center",
          padding: "40px",
          color: "#666",
          fontSize: "18px"
        }}>
          Selecciona un proyecto para visualizar los datos
        </div>
      )}
    </div>
  );
};

export default GraficaProyecto;