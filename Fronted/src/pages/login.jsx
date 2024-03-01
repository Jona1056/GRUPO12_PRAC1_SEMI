import { useState } from "react";
import { Form, Button, Container } from "react-bootstrap";
import "./loginForm.css";
import Swal from "sweetalert2";
import { useNavigate } from 'react-router-dom';


export const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigateTo = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8081/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      if (response.status === 200) {
        const responseData = await response.json();
        Swal.fire("Usuario autenticado", "Bienvenido a FaunaDex", "success");
        const { message, user } = responseData;
        console.log(message); // Mensaje del servidor
        console.log(user)

        navigateTo("/Home", { state: { user: user } });
        //borrar valores en los campos
        setUsername("");
        setPassword("");
      }else if(response.status === 401){
        Swal.fire("Error","Contraseña incorrecta","error"); 
      }else if
      (response.status === 404 || response.status === 500){
        Swal.fire("Error","Usuario no encontrado","error");
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
    }
  };

  return (
    <div className="login-container">
      {" "}
      {/* Contenedor principal con estilos CSS */}
      <Container>
        <div className="login-box">
          {" "}
          {/* Contenedor del formulario */}
          <h2>Iniciar Sesión</h2>
          <Form onSubmit={handleLogin}>
            <Form.Group controlId="formUsername">
              <Form.Label>Usuario</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingresa tu usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="formPassword">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                type="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>

            <Button variant="success" type="submit" className="login-button">
              Ingresar
            </Button>

            <Form.Text className="text-muted">
              ¿No tienes una cuenta? <a href="/create_user">Crea una aquí</a>.
            </Form.Text>
          </Form>
        </div>
      </Container>
    </div>
  );
};
