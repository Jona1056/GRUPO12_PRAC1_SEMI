import { useLocation } from "react-router-dom";
import "./Home.css"; // Importa tu archivo CSS
import { useNavigate } from 'react-router-dom';

export const Home = () => {
//   const location = useLocation();
//   const { user } = location.state;
//   const bucket_url = 'https://practica1b-g12-imagenes.s3.amazonaws.com/Fotos_Perfil/';
//   //yrl de la imagen
//   const url = `${bucket_url}${user.image}`;
//   console.log(url);
//   const navigateTo = useNavigate();
    
//   const edit_profile = () => {
//     navigateTo("/EditProfile", { state: { user: user,image:url } });
//   }

//   const upload_photo = () => {
//     navigateTo("/UploadPhoto", { state: { user: user,image:url } });
//   }
//   const images = () => {
//     navigateTo("/Images", { state: { user: user,image:url } });
//   }

//   const edit_album = () => {
//     navigateTo("/EditAlbum", { state: { user: user,image:url } });
//   }
  
  return (
    <div className="home-container">
      <div className="user-info">
        <img src='https://cdn.vox-cdn.com/thumbor/Dtl0EGQ3bYjAVBNuqxp2ZvAXVng=/0x0:1920x1200/920x613/filters:focal(810x375:1116x681):format(webp)/cdn.vox-cdn.com/uploads/chorus_image/image/72524797/pikachu_artwork.0.jpg' alt="Imagen de perfil" className="user-image" />
        <div>
          <p>Usuario: Kemel12</p>
          <p>Nombre: Ruano Jeronimo</p>
        </div>
      </div>
      <div className="Botones-css">
      <button  className="batman">
        <span>VER FOTOS</span>
      </button >
      <button className="batman">
        <span >SUBIR FOTO</span>
      </button>
      <button className="batman">
        <span>EDITAR PERFIL</span>
      </button>
      <button className="batman">
        <span>EDITAR ALBUMES</span>
      </button>
    
      </div>
    </div>
  );
};