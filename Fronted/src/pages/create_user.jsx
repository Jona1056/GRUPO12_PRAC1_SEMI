import { useState, useEffect } from "react";
import { Form, Button, Container } from "react-bootstrap";
import "./loginForm.css";
import axios from "axios";
import Swal from "sweetalert2";
export const Login_create = () => {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [image, setImage] = useState(null);

  useEffect(() => {
    setPasswordMatch(password === password2);
  }, [password, password2]);

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username || !name || !password || !password2 || !image) {
      alert("Por favor complete todos los campos.");
      return;
    }

    if (!passwordMatch) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    const formData = new FormData();
    formData.append('username', username);
    formData.append('name', name);
    formData.append('password', password);
    formData.append('image', image);
    
    try {
      const response = await axios.post('http://localhost:8081/CreateUser', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    
      if (response.status === 200) {
        Swal.fire("Usuario creado exitosamente", "Bienvenido a FaunaDex", "success");
        //borrar valores en los campos
        setUsername("");
        setName("");
        setPassword("");
        setPassword2("");
        setImage(null);
        
        // Guardar la imagen en una carpeta de tu PC
      }
    } catch (error) {
      error.response.status === 400 && Swal.fire("Error","El usuario ya existe","error");
      error.response.status === 500 && Swal.fire("Error al ejecutar la consulta");
   
    }
  };

  return (
    <div className="login-container">
      <Container>
        <div className="login-box2">
          <h2>Crea tu Usuario</h2>
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

            <Form.Group controlId="formName">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingresa tu Nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
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

            <Form.Group controlId="formPassword2">
              <Form.Label>Repetir Contraseña</Form.Label>
              <Form.Control
                type="password"
                placeholder="Repite tu contraseña"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                isInvalid={!passwordMatch}
              />
              {!passwordMatch && (
                <Form.Control.Feedback type="invalid">
                  Las contraseñas no coinciden.
                </Form.Control.Feedback>
              )}
            </Form.Group>

            <Form.Group controlId="formImage">
              <Form.Label>Imagen de Perfil</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
            </Form.Group>

            {image && (
              <img
                src={URL.createObjectURL(image)}
              alt="Imagen seleccionada"
              style={{ maxWidth: "100%", width: "200px", height: "200px" }}
              />
            )}
       


            <Button variant="success" type="submit" className="login-button">
              Crear
            </Button>
          </Form>
        </div>
      </Container>
    </div>
  );
};
