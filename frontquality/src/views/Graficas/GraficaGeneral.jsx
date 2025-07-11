import { useEffect, useState, useMemo } from "react"
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
} from "recharts"
import { fetchMaterial } from "../../api/api"
import "../../styles/graficas.css"

const GraficaGeneral = () => {
  const [materialData, setMaterialData] = useState([])
  const [error, setError] = useState(null)
  const [expectedProduction, setExpectedProduction] = useState(200000)
  const currentYear = new Date().getFullYear()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token")
        const materiales = await fetchMaterial(token)
        setMaterialData(materiales)
      } catch (error) {
        console.error("Error al obtener los materiales:", error)
        setError("Error al cargar los datos. Inténtalo de nuevo más tarde.")
      }
    }
    fetchData()
  }, [])

  const generateAllMonths = (year) => {
    const months = []
    for (let month = 1; month <= 12; month++) {
      months.push(`${year}-${String(month).padStart(2, "0")}`)
    }
    return months
  }

  const monthlyDataGeneral = useMemo(() => {
    const grouped = {}
    const allMonths = generateAllMonths(currentYear)

    allMonths.forEach((month) => {
      grouped[month] = { total_final: 0, total_mal: 0 }
    })

    materialData.forEach((item) => {
      const date = new Date(item.fecha)
      const year = date.getUTCFullYear() 
      const month = `${year}-${String(date.getUTCMonth() + 1).padStart(2, "0")}` 
    
      console.log(`Fecha original: ${item.fecha} → Agrupado en: ${month}`)
    
      if (year === currentYear) {
        grouped[month].total_final += item.total_final || 0
        grouped[month].total_mal += item.total_mal || 0
      }
    })

    const data = Object.keys(grouped).map((month) => {
      const [year, monthNumber] = month.split("-");
      const date = new Date(`${year}-${monthNumber}-01T00:00:00.000Z`); 
      const shortMonthName = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"][date.getUTCMonth()];
    
      const rejectionPercentage =
        grouped[month].total_final > 0
          ? (grouped[month].total_mal / grouped[month].total_final) * 100
          : 0;
    
      return {
        month: shortMonthName,
        total_final: grouped[month].total_final,
        total_mal: grouped[month].total_mal,
        rejectionPercentage,
        exceedsLimit: rejectionPercentage > 2.2,
      };
    });
    
    // Ordena los datos correctamente
    data.sort((a, b) => {
      const monthOrder = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
      return monthOrder.indexOf(a.month.toLowerCase()) - monthOrder.indexOf(b.month.toLowerCase());
    });

    console.log("Agrupamiento final:", grouped)
    console.log("Orden de los meses:", data.map((item) => item.month))
    return data
  }, [materialData, currentYear])

  const renderCustomLegend = (props) => {
    const { payload } = props
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "white",
            padding: "3.36px 12px",
            borderRadius: "6px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          }}
        >
          <span style={{ marginRight: "8px", fontSize: "13px", fontWeight: "500" }}>Prod. Esperada:</span>
          <input
            type="number"
            value={expectedProduction}
            onChange={(e) => setExpectedProduction(Number(e.target.value))}
            min="1"
            style={{
              width: "80px",
              padding: "4px 8px",
              borderRadius: "4px",
              border: "1px solid #ced4da",
              fontSize: "13px",
            }}
          />
        </div>

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
            <span style={{ fontSize: "13px", fontWeight: "500" }}>{entry.value}</span>
          </div>
        ))}

        <div
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
              height: "2px",
              borderTop: "2px dashed red",
              marginRight: "8px",
            }}
          />
          <span style={{ fontSize: "13px", fontWeight: "500" }}>Límite 2.2%</span>
        </div>
      </div>
    )
  }

  const renderCustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
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
            Mes: {label}
          </p>
          <p style={{ margin: "4px 0", display: "flex", justifyContent: "space-between" }}>
            <span>Total Producido:</span>
            <span style={{ fontWeight: "500" }}>{data.total_final || "N/A"}</span>
          </p>
          <p style={{ margin: "4px 0", display: "flex", justifyContent: "space-between" }}>
            <span>Total Rechazado:</span>
            <span style={{ fontWeight: "500" }}>{data.total_mal}</span>
          </p>
          <p style={{ margin: "4px 0", display: "flex", justifyContent: "space-between" }}>
            <span>% Rechazo:</span>
            <span style={{ fontWeight: "500" }}>{data.rejectionPercentage?.toFixed(2) || "0"}%</span>
          </p>
          {data.exceedsLimit && (
            <p
              style={{
                color: "#dc3545",
                margin: "8px 0 0 0",
                padding: "6px",
                background: "#fff3f5",
                borderRadius: "4px",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ⚠️ ¡Supera el límite del 2.2%!
            </p>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <>
      <p className="description">Concentrado del mes (general).</p>
      <div className="table-container">
      {console.log("Datos de la tabla:")}
      {console.log(
        monthlyDataGeneral.map((data) => ({
          mes: data.month,
          totalProducido: data.total_final,
          totalRechazado: data.total_mal,
          porcentajeRechazo: data.rejectionPercentage.toFixed(2),
        }))
      )}
        <table className="data-table">
          <thead>
            <tr>
              <th className="header-cell">Datos</th>
              {monthlyDataGeneral.map((data) => (
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
              {(() => {
                let acumuladoProducido = 0
                return monthlyDataGeneral
                  .map((data) => {
                    acumuladoProducido += data.total_final
                    return (
                      <td key={`produced-${data.month}`} className="data-cell">
                        {data.total_final.toLocaleString()}
                      </td>
                    )
                  })
                  .concat(
                    <td key="acumulado-producido" className="data-cell acumulado-cell">
                      {acumuladoProducido.toLocaleString()}
                    </td>,
                  )
              })()}
            </tr>
            <tr>
              <td className="label-cell">Total Rechazado</td>
              {(() => {
                let acumuladoRechazado = 0
                return monthlyDataGeneral
                  .map((data) => {
                    acumuladoRechazado += data.total_mal
                    return (
                      <td key={`rejected-${data.month}`} className="data-cell">
                        {data.total_mal.toLocaleString()}
                      </td>
                    )
                  })
                  .concat(
                    <td key="acumulado-rechazado" className="data-cell acumulado-cell">
                      {acumuladoRechazado.toLocaleString()}
                    </td>,
                  )
              })()}
            </tr>
            <tr>
              <td className="label-cell">% de Rechazo</td>
              {(() => {
                let acumuladoRechazo = 0
                let totalProducido = 0

                const cells = monthlyDataGeneral.map((data) => {
                  acumuladoRechazo += data.total_mal
                  totalProducido += data.total_final

                  const cellClass = data.exceedsLimit
                    ? "data-cell percentage-cell danger"
                    : data.rejectionPercentage > 1.5
                      ? "data-cell percentage-cell warning"
                      : "data-cell percentage-cell success"

                  return (
                    <td key={`rejection-${data.month}`} className={cellClass}>
                      {data.rejectionPercentage.toFixed(2)}%
                    </td>
                  )
                })

                const acumuladoPercentage = totalProducido > 0 ? (acumuladoRechazo / totalProducido) * 100 : 0

                const acumuladoExceedsLimit = acumuladoPercentage > 2.2
                const acumuladoCellClass = acumuladoExceedsLimit
                  ? "data-cell percentage-cell acumulado-cell danger"
                  : acumuladoPercentage > 1.5
                    ? "data-cell percentage-cell acumulado-cell warning"
                    : "data-cell percentage-cell acumulado-cell success"

                cells.push(
                  <td key="acumulado-rechazo" className={acumuladoCellClass}>
                    {acumuladoPercentage.toFixed(2)}%
                    {acumuladoExceedsLimit && <span className="warning-indicator">⚠️</span>}
                  </td>,
                )

                return cells
              })()}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="chart-placeholder">
        {monthlyDataGeneral.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={monthlyDataGeneral}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />

              <YAxis
                yAxisId="left"
                label={{
                  angle: -90,
                  position: "insideLeft",
                }}
                domain={[0, expectedProduction * 1.2]}
              />

              <YAxis
                yAxisId="right"
                orientation="right"
                label={{
                  value: "% Rechazo",
                  angle: 90,
                  position: "insideRight",
                }}
                domain={[0, 3]}
                tickFormatter={(value) => `${value}%`}
              />

              <Tooltip content={renderCustomTooltip} />

              <Legend content={renderCustomLegend} />

              <Bar yAxisId="left" dataKey="total_mal" name="Total Rechazado" fill="#82ca9d">
                {monthlyDataGeneral.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.exceedsLimit ? "#ff0000" : "#82ca9d"} />
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
                label={{
                  value: "2.2%",
                  position: "top",
                  fill: "red",
                  fontSize: 12,
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="chart-icon">📊 No hay datos disponibles</div>
        )}
      </div>
    </>
  )
}

export default GraficaGeneral