import {  Routes, Route, } from "react-router-dom";
import { LoginForm } from './pages/login';
import { Login_create } from './pages/create_user';
import {Navbar} from './pages/navbar_login';
import {Home} from './pages/home';
import {Edit} from './pages/edit_profile';
import {UploadPhoto} from './pages/upload_photo';
import {Images} from './pages/images';
import {EditAlbum} from './pages/edit_album';
function App() {
  return (
    <>
    <Navbar />
    <Routes>
        <Route path="/" element={<LoginForm />} /> {/* Ruta para el inicio de sesión */}
        <Route path="/create_user"element={<Login_create />} /> {/* Ruta para crear usuario */}
        <Route path="/Home" element={<Home/>} /> {/* Ruta para el home */}
        <Route path="/EditProfile" element={<Edit/>} /> {/* Ruta para editar perfil */}
        <Route path="/UploadPhoto" element={<UploadPhoto/>} /> {/* Ruta para subir foto */}
        <Route path="/Images" element={<Images/>} /> {/* Ruta para ver fotos */}
        <Route path="/EditAlbum" element={<EditAlbum/>} /> {/* Ruta para editar album */}
    </Routes>
    </>
  );
}

export default App;