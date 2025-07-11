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
} from "recharts";
import { fetchMaterial, saveBulkGraficaData, fetchGraficaData } from "../../api/api";
import "../../styles/graficas.css";

const GraficaParte = ({ proyectos }) => {
  const [selectedDay, setSelectedDay] = useState(null);
  const [materialData, setMaterialData] = useState([]);
  const [userRole, setUserRole] = useState("usuario");
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedPart, setSelectedPart] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editableData, setEditableData] = useState([]);
  const [viewMode, setViewMode] = useState('original'); // 'original', 'edited', 'api'
  const [isLoading, setIsLoading] = useState(false);
  const currentYear = new Date().getFullYear();
  const [graficaData, setGraficaData] = useState([]);
  const [showDefectTable, setShowDefectTable] = useState(true);
  const [showChart, setShowChart] = useState(true);

  // Función para obtener datos frescos desde la API
  const fetchFreshData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const materiales = await fetchMaterial(token);
      setMaterialData(materiales);
      return materiales;
    } catch (error) {
      console.error("Error al obtener los materiales:", error);
      setError("Error al cargar los datos. Inténtalo de nuevo más tarde.");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFreshData();
  }, []);

  // Obtener el rol del usuario al cargar el componente
  useEffect(() => {
      const user = JSON.parse(localStorage.getItem("user"));
        if (user && user.rol) {
          setUserRole(user.rol);
        }
  }, []);

  const projectNames = useMemo(
    () => [...new Set(proyectos.map((p) => p.nombre_proyecto))],
    [proyectos]
  );

  const partNumbersForProject = useMemo(
    () =>
      selectedProject
        ? [
            ...new Set(
              proyectos
                .filter((p) => p.nombre_proyecto === selectedProject)
                .map((p) => p.no_parte)
            ),
          ]
        : [],
    [proyectos, selectedProject]
  );

  const processDailyData = (data) => {
    if (!selectedPart || !selectedMonth) return [];

    const grouped = {};

    data.forEach((item) => {
      const date = new Date(item.fecha);
      if (
        item.no_parte !== selectedPart ||
        date.getUTCMonth() + 1 !== selectedMonth
      )
        return;
      const day = date.getUTCDate();
      grouped[day] = {
        total_final: (grouped[day]?.total_final || 0) + (item.total_final || 0),
        total_mal: (grouped[day]?.total_mal || 0) + (item.total_mal || 0),
      };
    });

    return Object.keys(grouped).map((day) => {
      const totalPassed = grouped[day].total_final - grouped[day].total_mal;
      const ftq =
        grouped[day].total_final > 0
          ? (totalPassed / grouped[day].total_final) * 100
          : 0;

      return {
        day: Number(day),
        total_passed: totalPassed,
        total_mal: grouped[day].total_mal,
        ftq,
      };
    });
  };

  const processDefectData = (data) => {
    if (!selectedPart || !selectedMonth) return { defectsByDay: {}, defectTypes: [] };

    const defectsByDay = {};
    const defectTypes = new Set();

    data.forEach((item) => {
      const date = new Date(item.fecha);
      if (
        item.no_parte !== selectedPart ||
        date.getUTCMonth() + 1 !== selectedMonth
      )
        return;

      const day = date.getUTCDate();

      if (!defectsByDay[day]) {
        defectsByDay[day] = {};
      }

      if (item.defectos && Array.isArray(item.defectos)) {
        item.defectos.forEach((defect) => {
          if (defect.tipo) {
            defectTypes.add(defect.tipo);
            if (!defectsByDay[day][defect.tipo]) {
              defectsByDay[day][defect.tipo] = 0;
            }
            defectsByDay[day][defect.tipo] += defect.cantidad_mal || 0;
          }
        });
      }
    });

    return {
      defectsByDay,
      defectTypes: Array.from(defectTypes)
    };
  };

  // Datos originales siempre calculados desde materialData
  const originalData = useMemo(
    () => processDailyData(materialData),
    [materialData, selectedPart, selectedMonth]
  );

  const handleOpenModal = async () => {
    try {
      // Procesar los datos de materialData
      const currentData = materialData.filter(item => {
        const date = new Date(item.fecha);
        return item.no_parte === selectedPart && 
               date.getMonth() + 1 === selectedMonth;
      });
  
      // Agrupar los defectos por día
      const defectsByDay = {};
      currentData.forEach(item => {
        const date = new Date(item.fecha);
        const day = date.getUTCDate();
        
        if (!defectsByDay[day]) {
          defectsByDay[day] = [];
        }
  
        if (item.defectos && Array.isArray(item.defectos)) {
          item.defectos.forEach(defecto => {
            if (defecto.tipo && defecto.cantidad_mal) {
              defectsByDay[day].push({
                tipo: defecto.tipo,
                cantidad_mal: defecto.cantidad_mal
              });
            }
          });
        }
      });
  
      // Crear array con todos los días del mes incluyendo defectos existentes
      const dataToEdit = Array.from({ length: 31 }, (_, i) => {
        const day = i + 1;
        return {
          day: day,
          defectos: defectsByDay[day] || [],
          status: 1
        };
      });
  
      console.log('Datos cargados:', dataToEdit); // Para debugging
      setEditableData(dataToEdit);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error al cargar los datos:", error);
      setError("Error al cargar los datos para edición");
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditableData([]); // Limpiar los datos editables al cerrar el modal
  };

  const handleSaveChanges = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      
      // Calcular el total de defectos y obtener total_passed por día
      const totalDefectosPorDia = editableData.map(data => {
        const totalMal = data.defectos.reduce((sum, defecto) => 
          sum + (defecto.cantidad_mal || 0), 0);
        
        // Obtener total_passed del día correspondiente en los datos originales
        const dayOriginalData = originalData.find(od => od.day === data.day) || {};
        const total_passed = dayOriginalData.total_passed || 0;
        
        return {
          projectName: selectedProject,
          partNumber: selectedPart,
          day: data.day,
          month: selectedMonth,
          defectos: data.defectos,
          status: 0, // Siempre guardar como editado
          total_mal: totalMal,
          total_passed: total_passed // Agregar total_passed
        };
      });
  
      // Guardar los datos actualizados
      await saveBulkGraficaData(totalDefectosPorDia, token);
      
      // Recargar datos
      const response = await fetchGraficaData();
      const newData = response.filter(item => 
        item.projectName === selectedProject &&
        item.partNumber === selectedPart &&
        item.month === selectedMonth
      ).map(item => ({
        ...item,
        total_mal: item.defectos.reduce((sum, defecto) => 
          sum + (defecto.cantidad_mal || 0), 0),
        total_passed: item.total_passed // Asegurarse de mantener total_passed
      }));
  
      // Actualizar los datos en el estado
      setGraficaData(newData);
      setViewMode('edited');
      setIsModalOpen(false);
  
      // Actualizar la tabla de defectos
      const freshMaterialData = await fetchMaterial(token);
      setMaterialData(freshMaterialData);
  
    } catch (error) {
      console.error("Error al guardar los datos:", error);
      setError("Error al guardar los cambios. Inténtalo de nuevo más tarde.");
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar datos de la gráfica al inicio y cuando cambie la selección
  useEffect(() => {
    const loadGraficaData = async () => {
      if (selectedProject && selectedPart && selectedMonth) {
        try {
          setIsLoading(true);
          const response = await fetchGraficaData();
          const filteredData = response.filter(item => 
            item.projectName === selectedProject &&
            item.partNumber === selectedPart &&
            item.month === selectedMonth
          );
          
          setGraficaData(filteredData);
          
          // Actualizar el viewMode basado en si existen datos editados
          const hasEditedData = filteredData.some(item => item.status === 0);
          setViewMode(hasEditedData ? 'edited' : 'original');
          
          // También recargar datos originales
          const token = localStorage.getItem("token");
          const freshMaterialData = await fetchMaterial(token);
          setMaterialData(freshMaterialData);

        } catch (error) {
          console.error('Error al cargar datos:', error);
          setError('Error al cargar los datos de la gráfica');
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadGraficaData();
  }, [selectedProject, selectedPart, selectedMonth]);

  // Guardar datos editados cuando cambian
  useEffect(() => {
    if (editableData.length > 0 && selectedPart && selectedMonth) {
      localStorage.setItem(
        `grafica-edits-${selectedPart}-${selectedMonth}`,
        JSON.stringify(editableData)
      );
    }
  }, [editableData, selectedPart, selectedMonth]);

  const handleDefectChange = (day, defectIndex, field, value) => {
    setEditableData(prevData => 
      prevData.map(item => {
        if (item.day === day) {
          const updatedDefectos = [...(item.defectos || [])];
          if (defectIndex >= updatedDefectos.length) {
            updatedDefectos.push({ tipo: '', cantidad_mal: 0 });
          }
          updatedDefectos[defectIndex] = {
            ...updatedDefectos[defectIndex],
            [field]: field === 'cantidad_mal' ? Number(value) : value
          };
          return {
            ...item,
            defectos: updatedDefectos
          };
        }
        return item;
      })
    );
  };

  const calculateFTQ = (totalPassed, totalRejected) => {
    const total = totalPassed + totalRejected;
    if (total === 0) return 0;
    return (totalPassed / total) * 100;
  };

  const getCurrentData = () => {
    const hasEditedData = graficaData.some(item => 
      item.partNumber === selectedPart && 
      item.month === selectedMonth && 
      item.status === 0
    );
  
    if (viewMode === 'edited' && hasEditedData) {
      return graficaData
        .filter(item => 
          item.partNumber === selectedPart && 
          item.month === selectedMonth && 
          item.status === 0
        )
        .map(item => {
          const dayOriginalData = originalData.find(od => od.day === item.day) || {};
          const total_mal = item.defectos.reduce((sum, defecto) => 
            sum + (defecto.cantidad_mal || 0), 0);

          return {
            ...dayOriginalData,
            day: item.day,
            total_mal: total_mal,
            total_passed: dayOriginalData.total_passed || 0,
            ftq: calculateFTQ(dayOriginalData.total_passed || 0, total_mal)
          };
        });
    }
    return originalData;
  };

  const renderCustomLegendForPart = (props) => {
    const { payload } = props;
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          padding: "15px 0",
          alignItems: "center",
          gap: "15px",
          borderRadius: "8px",
          margin: "10px 0",
        }}
      >
        {payload.map((entry, index) => (
          <div
            key={`legend-${index}`}
            style={{
              display: "flex",
              alignItems: "center",
              background: "white",
              padding: "6px 12px",
              borderRadius: "6px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                width: "14px",
                height: "14px",
                backgroundColor: entry.color,
                marginRight: "8px",
                borderRadius: "3px",
              }}
            />
            <span style={{ fontSize: "13px", fontWeight: "500" }}>
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const renderCustomTooltipForPart = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div
          className="custom-tooltip"
          style={{
            background: "white",
            padding: "12px",
            border: "1px solid #e1e4e8",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            fontSize: "13px",
            lineHeight: "1.5",
            minWidth: "180px",
          }}
        >
          <p
            style={{
              margin: "0 0 8px 0",
              fontWeight: "bold",
              paddingBottom: "6px",
              color: "#2c3e50",
            }}
          >
            Día: {label}
          </p>
          <p
            style={{
              margin: "4px 0",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>Total Producido:</span>
            <span style={{ fontWeight: "500" }}>
              {data.total_passed + data.total_mal || "N/A"}
            </span>
          </p>
          <p
            style={{
              margin: "4px 0",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>Total Passed:</span>
            <span style={{ fontWeight: "500" }}>{data.total_passed || "0"}</span>
          </p>
          <p
            style={{
              margin: "4px 0",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>Total Rechazado:</span>
            <span style={{ fontWeight: "500" }}>{data.total_mal || "0"}</span>
          </p>
          <p
            style={{
              margin: "4px 0",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>% FTQ:</span>
            <span style={{ fontWeight: "500" }}>
              {data.ftq?.toFixed(2) || "0"}%
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const currentData = getCurrentData();
    const chartData = Array.from({ length: 31 }, (_, i) => {
      const day = i + 1;
      const dayData = currentData.find((d) => d.day === day) || {
        total_passed: 0,
        total_mal: 0,
        ftq: 0,
      };
      return {
        day,
        total_passed: dayData.total_passed,
        total_mal: dayData.total_mal,
        ftq: dayData.ftq,
      };
    });

    return (
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis
            yAxisId="left"
            label={{
              angle: -90,
              position: "insideLeft",
            }}
            domain={[0, "dataMax"]}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            label={{
              value: "% FTQ",
              angle: 90,
              position: "insideRight",
            }}
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip content={renderCustomTooltipForPart} />
          <Legend content={renderCustomLegendForPart} />
          <Bar
            yAxisId="left"
            dataKey="total_passed"
            name="Total Passed"
            fill="#3498db"
          />
          <Bar
            yAxisId="left"
            dataKey="total_mal"
            name="Total Rechazado"
            fill="#e74c3c"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="ftq"
            name="% FTQ"
            stroke="#82ca9d"
            dot={{ r: 4 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    );
  };

  const renderChartSection = () => (
    <div style={{ marginTop: '20px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '10px' 
      }}>
        <h3 style={{ margin: 0 }}>Gráfica de Datos</h3>
        <button
          onClick={() => setShowChart(!showChart)}
          style={{
            padding: '6px 12px',
            backgroundColor: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          {showChart ? (
            <>
              <span>Ocultar gráfica</span>
              <span style={{ fontSize: '18px' }}>▼</span>
            </>
          ) : (
            <>
              <span>Mostrar gráfica</span>
              <span style={{ fontSize: '18px' }}>▶</span>
            </>
          )}
        </button>
      </div>

      {showChart && (
        <div className="chart-placeholder">
          {isLoading ? (
            <div style={{ textAlign: "center", padding: "20px" }}>
              Cargando datos...
            </div>
          ) : (
            renderChart()
          )}
        </div>
      )}
    </div>
  );

  const renderTable = () => {
    const currentData = getCurrentData() || [];
    let acumuladoProducido = 0;
    let acumuladoPassed = 0;
    let acumuladoRechazado = 0;
    let acumuladoFTQ = 0;
    let totalDaysWithData = 0;
  
    return (
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th className="header-cell">Día</th>
              {Array.from({ length: 31 }, (_, i) => {
                const day = i + 1;
                const date = new Date(currentYear, selectedMonth - 1, day);
                const dayName = date
                  .toLocaleDateString("es-ES", { weekday: "short" })
                  .charAt(0)
                  .toUpperCase();
                return (
                  <th key={day} className="header-cell">
                    {day}
                    <br />
                    {dayName}
                  </th>
                );
              })}
              <th className="header-cell acumulado-cell">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="label-cell">Total Producido</td>
              {Array.from({ length: 31 }, (_, i) => {
                const day = i + 1;
                const data = currentData.find((d) => d.day === day) || {
                  total_passed: 0,
                  total_mal: 0,
                };
                const totalProduced = (data.total_passed || 0) + (data.total_mal || 0);
                acumuladoProducido += totalProduced;
                return (
                  <td key={`produced-${day}`} className="data-cell">
                    {totalProduced ? totalProduced.toLocaleString() : '0'}
                  </td>
                );
              })}
              <td key="acumulado-producido" className="data-cell acumulado-cell">
                {acumuladoProducido.toLocaleString()}
              </td>
            </tr>
            <tr>
              <td className="label-cell">Total Passed</td>
              {Array.from({ length: 31 }, (_, i) => {
                const day = i + 1;
                const data = currentData.find((d) => d.day === day) || { total_passed: 0 };
                const totalPassed = data.total_passed || 0;
                acumuladoPassed += totalPassed;
                return (
                  <td key={`passed-${day}`} className="data-cell">
                    {totalPassed ? totalPassed.toLocaleString() : '0'}
                  </td>
                );
              })}
              <td key="acumulado-passed" className="data-cell acumulado-cell">
                {acumuladoPassed.toLocaleString()}
              </td>
            </tr>
            <tr>
              <td className="label-cell">Total Rechazado</td>
              {Array.from({ length: 31 }, (_, i) => {
                const day = i + 1;
                const data = currentData.find((d) => d.day === day) || { total_mal: 0 };
                const totalMal = data.total_mal || 0;
                acumuladoRechazado += totalMal;
                return (
                  <td key={`rejected-${day}`} className="data-cell">
                    {totalMal ? totalMal.toLocaleString() : '0'}
                  </td>
                );
              })}
              <td key="acumulado-rechazado" className="data-cell acumulado-cell">
                {acumuladoRechazado.toLocaleString()}
              </td>
            </tr>
            <tr>
              <td className="label-cell">% FTQ</td>
              {Array.from({ length: 31 }, (_, i) => {
                const day = i + 1;
                const data = currentData.find((d) => d.day === day) || {
                  total_passed: 0,
                  total_mal: 0,
                };
                const ftq = data.ftq || 0;
                if (ftq > 0) {
                  acumuladoFTQ += ftq;
                  totalDaysWithData++;
                }
                return (
                  <td key={`ftq-${day}`} className="data-cell">
                    {ftq > 0 ? `${ftq.toFixed(2)}%` : "N/A"}
                  </td>
                );
              })}
              <td key="acumulado-ftq" className="data-cell acumulado-cell">
                {totalDaysWithData > 0
                  ? `${(acumuladoFTQ / totalDaysWithData).toFixed(2)}%`
                  : "N/A"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const renderDefectTable = () => {
    // Determine which data to use based on viewMode
    let defectData = {};
    if (viewMode === 'edited') {
      // Use data from graficaData for edited view
      defectData = graficaData.reduce((acc, item) => {
        if (item.defectos) {
          acc.defectsByDay = acc.defectsByDay || {};
          acc.defectTypes = acc.defectTypes || new Set();
          
          acc.defectsByDay[item.day] = {};
          item.defectos.forEach(defect => {
            if (defect.tipo) {
              acc.defectTypes.add(defect.tipo);
              acc.defectsByDay[item.day][defect.tipo] = defect.cantidad_mal;
            }
          });
        }
        return acc;
      }, { defectsByDay: {}, defectTypes: new Set() });
      
      defectData.defectTypes = Array.from(defectData.defectTypes);
    } else {
      // Use original data for original view
      defectData = processDefectData(materialData);
    }
    
    const { defectsByDay, defectTypes } = defectData;
    
    if (!defectTypes.length) {
      return <div style={{ marginTop: '20px' }}>No hay datos de defectos para este número de parte y mes.</div>;
    }
  
    return (
      <div className="table-container" style={{ marginTop: '20px', overflowX: 'auto' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '10px' 
        }}>
          <h3 style={{ margin: 0 }}>
            Registro de Defectos por Día {userRole === "admin" && (viewMode === 'edited' ? '(Editados)' : '(Original)')}
          </h3>
          <button
            onClick={() => setShowDefectTable(!showDefectTable)}
            style={{
              padding: '6px 12px',
              backgroundColor: '#f8f9fa',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            {showDefectTable ? (
              <>
                <span>Ocultar tabla</span>
                <span style={{ fontSize: '18px' }}>▼</span>
              </>
            ) : (
              <>
                <span>Mostrar tabla</span>
                <span style={{ fontSize: '18px' }}>▶</span>
              </>
            )}
          </button>
        </div>
  
        {showDefectTable && (
          <table className="data-table" style={{ minWidth: '100%' }}>
            <thead>
              <tr>
                <th className="header-cell">Tipo de Defecto</th>
                {Array.from({ length: 31 }, (_, i) => {
                  const day = i + 1;
                  const date = new Date(currentYear, selectedMonth - 1, day);
                  const dayName = date.toLocaleDateString("es-ES", { weekday: 'short' }).charAt(0).toUpperCase();
                  return (
                    <th key={day} className="header-cell">
                      {day}<br/>{dayName}
                    </th>
                  );
                })}
                <th className="header-cell acumulado-cell">Total</th>
              </tr>
            </thead>
            <tbody>
              {defectTypes.map((type) => {
                const total = Array.from({ length: 31 }, (_, i) => i + 1)
                  .reduce((sum, day) => sum + (defectsByDay[day]?.[type] || 0), 0);
                
                return (
                  <tr key={type}>
                    <td className="label-cell">{type}</td>
                    {Array.from({ length: 31 }, (_, i) => {
                      const day = i + 1;
                      const value = defectsByDay[day]?.[type] || '';
                      return (
                        <td key={`${type}-${day}`} className="data-cell">
                          {value}
                        </td>
                      );
                    })}
                    <td className="data-cell acumulado-cell">
                      {total}
                    </td>
                  </tr>
                );
              })}
              <tr className="total-row">
                <td className="label-cell">Total por día</td>
                {Array.from({ length: 31 }, (_, i) => {
                  const day = i + 1;
                  const dayTotal = defectTypes.reduce((sum, type) => {
                    return sum + (defectsByDay[day]?.[type] || 0);
                  }, 0);
                  return (
                    <td key={`total-${day}`} className="data-cell">
                      {dayTotal || ''}
                    </td>
                  );
                })}
                <td className="data-cell acumulado-cell">
                  {defectTypes.reduce((sum, type) => 
                    sum + Array.from({ length: 31 }, (_, i) => i + 1)
                      .reduce((daySum, day) => daySum + (defectsByDay[day]?.[type] || 0), 0)
                  , 0)}
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    );
  };

  return (
    <>
      <p className="description">Gráficas por número de parte.</p>
      <div className="selectors-container">
        <select
          value={selectedProject || ""}
          onChange={(e) => {
            setSelectedProject(e.target.value);
            setSelectedPart(null);
          }}
          disabled={isLoading}
        >
          <option value="">Selecciona un proyecto</option>
          {projectNames.map((project) => (
            <option key={project} value={project}>
              {project}
            </option>
          ))}
        </select>
        {selectedProject && (
          <select
            value={selectedPart || ""}
            onChange={(e) => setSelectedPart(e.target.value)}
            disabled={isLoading}
          >
            <option value="">Selecciona un número de parte</option>
            {partNumbersForProject.map((part) => (
              <option key={part} value={part}>
                {part}
              </option>
            ))}
          </select>
        )}
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
          disabled={isLoading}
        >
          <option value="">Selecciona un mes</option>
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(0, i).toLocaleString("es-ES", { month: "long" })}
            </option>
          ))}
        </select>
      </div>
      <br />
      {error && <div className="error-message">{error}</div>}
      {selectedPart && (
        <>
          {renderTable()}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "20px",
            }}
          >
            {userRole === "admin" && (
            <select
              value={graficaData.some(item => 
                item.partNumber === selectedPart && 
                item.month === selectedMonth
              ) ? (viewMode === 'original' ? '1' : '0') : '1'}
              onChange={async (e) => {
                try {
                  setIsLoading(true);
                  const token = localStorage.getItem("token");
                  const newStatus = Number(e.target.value);
                  
                  // Primero actualizar el viewMode
                  setViewMode(newStatus === 1 ? 'original' : 'edited');
                  
                  // Recargar datos frescos desde la API
                  const response = await fetchGraficaData();
                  const freshData = response.filter(item => 
                    item.projectName === selectedProject &&
                    item.partNumber === selectedPart &&
                    item.month === selectedMonth
                  );
                  
                  // Actualizar los datos de la gráfica
                  setGraficaData(freshData);

                  // También recargar datos originales
                  const freshMaterialData = await fetchMaterial(token);
                  setMaterialData(freshMaterialData);
                  
                } catch (error) {
                  console.error("Error al cambiar el estado de visualización:", error);
                  setError("Error al cambiar la vista. Inténtalo de nuevo más tarde.");
                } finally {
                  setIsLoading(false);
                }
              }}
              style={{
                padding: "8px 16px",
                backgroundColor: "white",
                border: "1px solid #ccc",
                borderRadius: "4px",
                cursor: "pointer",
                opacity: isLoading ? 0.5 : 1,
                minWidth: "200px"
              }}
              disabled={isLoading}
            >
              <option value="0">Ver Datos Editados</option>
              <option value="1">Ver Datos Originales</option>
            </select>
            )}
            {userRole === "admin" && (
            <button
              onClick={handleOpenModal}
              disabled={isLoading}
              style={{
                padding: "8px 16px",
                backgroundColor: "#2ecc71",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                opacity: isLoading ? 0.5 : 1,
              }}
            >
              Editar Datos
            </button>
            )}
          </div>

          {renderChartSection()}

          {renderDefectTable()}

          {/* Modal de Edición */}
          {isModalOpen && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0,0,0,0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1000,
                color: '#333',
              }}
            >
              <div
                style={{
                  backgroundColor: "white",
                  padding: "20px",
                  borderRadius: "8px",
                  width: "90%",
                  maxWidth: "1200px",
                  height: "80vh", 
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  overflowY: "auto", 
                }}
              >
                <h2 style={{ marginTop: 0 }}>
                  Editar Defectos - {selectedProject} - {selectedPart}
                </h2>
                <div style={{ marginBottom: "20px" }}>
                  <select
                    value={selectedDay || ""}
                    onChange={(e) => setSelectedDay(Number(e.target.value))}
                    style={{
                      padding: "8px",
                      marginRight: "10px",
                      borderRadius: "4px",
                      border: "1px solid #ddd"
                    }}
                  >
                    <option value="">Seleccionar día</option>
                    {Array.from({ length: 31 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>Día {i + 1}</option>
                    ))}
                  </select>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }} className="modal-table">
                  <thead>
                    <tr>
                      <th style={{ padding: "8px", border: "1px solid #ddd", backgroundColor: "#f2f2f2" }}>
                        Día
                      </th>
                      <th style={{ padding: "8px", border: "1px solid #ddd", backgroundColor: "#f2f2f2" }}>
                        Tipo de Defecto
                      </th>
                      <th style={{ padding: "8px", border: "1px solid #ddd", backgroundColor: "#f2f2f2" }}>
                        Cantidad
                      </th>
                      <th style={{ padding: "8px", border: "1px solid #ddd", backgroundColor: "#f2f2f2" }}>
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {editableData
                      .filter(dayData => dayData.defectos.length > 0)
                      .map((dayData) => (
                        <React.Fragment key={`day-${dayData.day}`}>
                          {dayData.defectos.map((defecto, index) => (
                            <tr key={`defect-${dayData.day}-${index}`}>
                              {index === 0 && (
                                <td
                                  style={{ padding: "8px", border: "1px solid #ddd" }}
                                  rowSpan={dayData.defectos.length}
                                >
                                  {dayData.day}
                                </td>
                              )}
                              <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                                <input
                                  type="text"
                                  value={defecto.tipo || ''}
                                  onChange={(e) => handleDefectChange(dayData.day, index, 'tipo', e.target.value)}
                                  style={{ width: "100%" }}
                                />
                              </td>
                              <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                                <input
                                  type="number"
                                  value={defecto.cantidad_mal || 0}
                                  onChange={(e) => handleDefectChange(dayData.day, index, 'cantidad_mal', e.target.value)}
                                  style={{ width: "80px" }}
                                  min="0"
                                />
                              </td>
                              <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                                <button
                                  onClick={() => {
                                    setEditableData(prevData =>
                                      prevData.map(item =>
                                        item.day === dayData.day
                                          ? {
                                              ...item,
                                              defectos: item.defectos.filter((_, i) => i !== index)
                                            }
                                          : item
                                      )
                                    );
                                  }}
                                  style={{
                                    padding: "4px 8px",
                                    backgroundColor: "#e74c3c",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer"
                                  }}
                                >
                                  Eliminar
                                </button>
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      ))}
                  </tbody>
                </table>
                
                {/* Sección para agregar nuevo defecto */}
                <div style={{ 
                  marginTop: "20px", 
                  padding: "15px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "8px"
                }}>
                  <h3 style={{ marginTop: 0 }}>Agregar Nuevo Defecto</h3>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <select
                      value={selectedDay || ""}
                      onChange={(e) => setSelectedDay(Number(e.target.value))}
                      style={{
                        padding: "8px",
                        borderRadius: "4px",
                        border: "1px solid #ddd"
                      }}
                    >
                      <option value="">Seleccionar día</option>
                      {Array.from({ length: 31 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>Día {i + 1}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => {
                        if (selectedDay) {
                          setEditableData(prevData =>
                            prevData.map(item =>
                              item.day === selectedDay
                                ? {
                                    ...item,
                                    defectos: [...(item.defectos || []), { tipo: '', cantidad_mal: 0 }]
                                  }
                                : item
                            )
                          );
                        }
                      }}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#3498db",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer"
                      }}
                    >
                      Agregar Defecto
                    </button>
                  </div>
                </div>
      
                <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                  <button
                    onClick={handleCloseModal}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#e74c3c",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    disabled={isLoading}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#2ecc71",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      opacity: isLoading ? 0.5 : 1,
                    }}
                  >
                    {isLoading ? "Guardando..." : "Guardar Cambios"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default GraficaParte;