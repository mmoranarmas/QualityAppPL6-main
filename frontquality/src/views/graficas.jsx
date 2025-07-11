import { useState, useEffect } from "react"
import Tab from "../components/Tab"
import GraficaGeneral from "./Graficas/GraficaGeneral"
import GraficaProyecto from "./Graficas/GraficaProyecto"
import GraficaParte from "./Graficas/GraficaParte"
import "../styles/graficas.css"

const Graficas = () => {
  const [activeSection, setActiveSection] = useState("concentrado")
  const [proyectos, setProyectos] = useState([])
  const [error, setError] = useState(null)

  const proyectosFiles = [
    "920B-PROGRAM.json",
    "DJ-MCA.json",
    "MP-MCA.json",
    "SUBARU S-PROGRAM.json",
    "TOYOTA S-PROGRAM.json",
    "CD4.json",
    "3BH.json",
    "780B.json",
  ]

  useEffect(() => {
    const cargarProyectos = async () => {
      try {
        const proyectosPromises = proyectosFiles.map((file) =>
          import(`../assets/datos_json/${file}`).then((module) => module.default),
        )
        const proyectosData = await Promise.all(proyectosPromises)
        setProyectos(proyectosData.flat())
      } catch (error) {
        console.error("Error al cargar los proyectos:", error)
        setError("Error al cargar los datos de los proyectos.")
      }
    }
    cargarProyectos()
  }, [])

  return (
    <div className="graficas-container scrollable-content">
      <Tab />
      <div className="content-wrapper">
        <div className="graficas-container">
          <h1 className="title">Gráficas - {new Date().getFullYear()}</h1>
          {error && <div className="error-message">{error}</div>}
          <div className="section-buttons-gf">
            <button
              className={`button-gf ${activeSection === "concentrado" ? "active" : ""}`}
              onClick={() => setActiveSection("concentrado")}
            >
              Concentrado del Mes
            </button>
            <button
              className={`button-gf ${activeSection === "proyecto" ? "active" : ""}`}
              onClick={() => setActiveSection("proyecto")}
            >
              Por Proyecto
            </button>
            <button
              className={`button-gf ${activeSection === "parte" ? "active" : ""}`}
              onClick={() => setActiveSection("parte")}
            >
              Por Número de Parte
            </button>
          </div>

          <div className="card" style={{ position: 'relative' }}>
            {activeSection === "concentrado" && <GraficaGeneral />}
            {activeSection === "proyecto" && <GraficaProyecto proyectos={proyectos} />}
            {activeSection === "parte" && <GraficaParte proyectos={proyectos} />}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Graficas