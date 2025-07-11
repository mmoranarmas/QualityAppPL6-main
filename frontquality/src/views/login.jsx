import { useState } from "react";
import { Eye, EyeOff, LogIn, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom"; // Para redireccionar
import { login } from "../api/api";
import { useUser } from "../context/UserContext"; // Usar el contexto de usuario
import "../styles/loginForm.css";

const LoginForm = () => {
  const [num_empleado, setNumEmpleado] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate(); 
  const { login: loginUser } = useUser(); // Función de login del contexto

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
  
    // Validación básica del formulario
    if (!num_empleado || !password) {
      setError("Por favor, completa todos los campos.");
      return;
    }
  
    setIsLoading(true);
  
    try {
      const response = await login(num_empleado, password);
      
      // Guardar el usuario en el contexto
      loginUser(response.usuario);
  
      // Redirigir al usuario según su rol
      const redirectPath = response.usuario.rol === "admin" ? "/admin/dashboard" : "/Home";
      navigate(redirectPath);
  
    } catch (err) {
      console.error("Error en el login:", err);
      
      // Manejo específico de errores según el código de estado
      if (err.response) {
        switch (err.response.status) {
          case 400:
            setError("Credenciales incorrectas. Por favor, verifica tu número de empleado y contraseña.");
            break;
          case 500:
            setError("Error del servidor. Por favor, intenta nuevamente más tarde.");
            break;
          default:
            setError(`Error inesperado (${err.response.status}): ${err.message || "Por favor, intenta nuevamente"}`);
        }
      } else if (err.request) {
        // La solicitud fue hecha pero no hubo respuesta
        setError("No se recibió respuesta del servidor. Verifica tu conexión a internet.");
      } else {
        // Error al configurar la solicitud
        setError("Error al configurar la solicitud: " + err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <div className="login-header">
          <h1>Bienvenido</h1>
          <p>Ingresa tus credenciales para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="num_empleado">Número de empleado</label>
            <input
              id="num_empleado"
              type="text"
              value={num_empleado}
              onChange={(e) => setNumEmpleado(e.target.value)}
              required
              placeholder="Ingresa tu número de empleado"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <div className="password-input">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Ingresa tu contraseña"
                disabled={isLoading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="alert error">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="submit-button"
            disabled={isLoading || !num_empleado || !password}
          >
            {isLoading ? (
              <div className="spinner"></div>
            ) : (
              <>
                <LogIn size={20} />
                <span>Iniciar sesión</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;