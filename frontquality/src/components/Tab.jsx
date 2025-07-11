import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // Importar useLocation
import { Home, BarChart, Settings } from "lucide-react";
import "./Tab.css";

const Tab = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Obtener la ubicación actual

  // Estado para la pestaña activa
  const [activeTab, setActiveTab] = useState("home");

  // Estado para el rol del usuario
  const [userRole, setUserRole] = useState("usuario"); // Valor por defecto: "usuario"

  // Obtener el rol del usuario al cargar el componente
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user")); // Obtener los datos del usuario
    if (user && user.rol) {
      setUserRole(user.rol); // Actualizar el estado con el rol del usuario
    }
  }, []);

  // Definir las pestañas con sus rutas y iconos
  const tabs = [
    {
      id: "graficas",
      label: "Gráficas",
      icon: BarChart,
      path: "/Graficas",
    },
    {
      id: "home",
      label: "Home",
      icon: Home,
      path: "/Home",
    },
    {
      id: "ajustes",
      label: "Usuarios",
      icon: Settings,
      path: "/Usuarios",
      adminOnly: true, // Esta pestaña solo es visible para administradores
    },
  ];

  // Filtrar las pestañas según el rol del usuario
  const filteredTabs = tabs.filter((tab) => {
    if (tab.adminOnly) {
      return userRole === "admin"; // Mostrar solo si el usuario es admin
    }
    return true; // Mostrar siempre las pestañas que no son adminOnly
  });

  // Sincronizar el estado activeTab con la ruta actual
  useEffect(() => {
    const currentTab = filteredTabs.find((tab) => tab.path === location.pathname);
    if (currentTab) {
      setActiveTab(currentTab.id); // Actualizar el estado activeTab
    }
  }, [location.pathname, filteredTabs]);

  // Manejar el clic en una pestaña
  const handleTabClick = (tab) => {
    setActiveTab(tab.id); // Actualizar la pestaña activa
    navigate(tab.path); // Navegar a la ruta correspondiente
  };

  return (
    <>
      {/* Espaciador para evitar que el contenido quede detrás del menú */}
      <div className="bottom-menu-spacer"></div>

      {/* Menú inferior */}
      <nav className="bottom-menu">
        {filteredTabs.map((tab) => {
          const Icon = tab.icon; // Icono de la pestaña
          return (
            <button
              key={tab.id}
              className={`bottom-menu-item ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => handleTabClick(tab)}
            >
              <Icon className="bottom-menu-icon" /> {/* Icono */}
              <span className="bottom-menu-label">{tab.label}</span> {/* Etiqueta */}
            </button>
          );
        })}
      </nav>
    </>
  );
};

export default Tab;