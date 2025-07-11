import { useEffect, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { FileText, ClipboardCheck, Package, LogOut } from "lucide-react"
import { useUser } from "../context/UserContext"
import Tab from "../components/Tab"
import { fetchMinutas, fetchInspecciones, fetchMaterial } from "../api/api"
import "../styles/home.css"

const Home = () => {
  const user = useUser();
  const navigate = useNavigate();
  const [minutasCount, setMinutasCount] = useState(0);
  const [inspeccionesCount, setInspeccionesCount] = useState(0);
  const [materialCount, setMaterialCount] = useState(0);
  const [showLogoutBubble, setShowLogoutBubble] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const [minutasResponse, inspeccionesResponse, materialResponse] = await Promise.all([
        fetchMinutas(token),
        fetchInspecciones(token),
        fetchMaterial(token),
      ]);

      setMinutasCount(minutasResponse.length);
      setInspeccionesCount(inspeccionesResponse.length);
      setMaterialCount(materialResponse.length);
    } catch (error) {
      console.error("Error al obtener los datos:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="dashboard">
      <div className="logout-container">
        <br />
        <button
          className="logout-button"
          onClick={() => setShowLogoutBubble(!showLogoutBubble)}
          aria-label="Menu de cierre de sesión"
        >
          <LogOut className="h-5 w-5" />
        </button>

        {showLogoutBubble && (
          <div className="logout-bubble" role="menu">
            <button className="logout-bubble-button" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </div>
        )}

      </div>

      <div className="container">
        <header className="header">
          <h1 className="title">
            Bienvenido al Panel, <span className="title-name">{user?.user?.nombre}</span>
          </h1>
        </header>

        <div className="cards-grid">
          <button className="card blue" onClick={() => handleNavigation("/Minutas")}>
            <div className="card-content">
              <div className="icon-wrapper blue">
                <FileText className="icon" />
              </div>
              <div className="card-info">
                <h2 className="card-title">Minutas de Reunión</h2>
                <div className="stats">
                  <span className="stats-number">
                    {loading ? <span className="loading-dots">...</span> : minutasCount}
                  </span>
                  <span className="stats-label">total</span>
                </div>
              </div>
            </div>
          </button>

          <button className="card green" onClick={() => handleNavigation("/Inspeccion")}>
            <div className="card-content">
              <div className="icon-wrapper green">
                <ClipboardCheck className="icon" />
              </div>
              <div className="card-info">
                <h2 className="card-title">Reportes de Inspección</h2>
                <div className="stats">
                  <span className="stats-number">
                    {loading ? <span className="loading-dots">...</span> : inspeccionesCount}
                  </span>
                  <span className="stats-label">total</span>
                </div>
              </div>
            </div>
          </button>

          <button className="card purple" onClick={() => handleNavigation("/Material")}>
            <div className="card-content">
              <div className="icon-wrapper purple">
                <Package className="icon" />
              </div>
              <div className="card-info">
                <h2 className="card-title">Reportes de Material</h2>
                <div className="stats">
                  <span className="stats-number">
                    {loading ? <span className="loading-dots">...</span> : materialCount}
                  </span>
                  <span className="stats-label">total</span>
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>
      <Tab />
    </div>
  )
}

export default Home;

