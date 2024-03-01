const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const cors = require("cors");
const mysql = require("mysql");
const multer = require("multer");
const crypto = require("crypto");
require("dotenv").config();

const AWS = require("aws-sdk");
const host = process.env.DB_HOST;
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const database = process.env.DB_DATABASE;
const app = express();
let imagen_front = "";
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const connection = mysql.createConnection({
  host: host,
  user: user,
  password: password,
  database: database,
});

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  //verificar si existe usuario y luego comparar contraseñas
  connection.query(
    "SELECT * FROM Usuario WHERE usuario = ?",
    [username],
    (error, results, fields) => {
      if (error) {
        console.error("Error al ejecutar la consulta:", error);
        res.status(500).send("Error al ejecutar la consulta");
        return;
      }
      if (results.length === 0) {
        res.status(404).send("Usuario no encontrado");
        return;
      }
      const user = results[0];

      const hashedPass = crypto
        .createHash("md5")
        .update(password)
        .digest("hex");
      if (user.contrasena === hashedPass) {
        connection.query(
          "SELECT foto FROM FotoPerfil WHERE usuario_id = ? ORDER BY id DESC LIMIT 1",
          [user.id],
          (error, results, fields) => {
            if (error) {
              console.error("Error al obtener la foto de perfil:", error);
              res.status(500).send("Error al obtener la foto de perfil");
              return;
            }
            // Verifica si hay resultados antes de acceder al primer elemento
            if (results.length > 0) {
              console.log("Foto de perfil encontrada:", results[0].foto);
              imagen_front = results[0].foto;
            } else {
              // Manejar el caso en que no se encuentre ninguna foto de perfil
              console.error(
                "No se encontró ninguna foto de perfil para el usuario"
              );
              imagen_front = null; // o algún valor predeterminado
            }
            // Continúa con la lógica después de obtener la foto de perfil
            // Por ejemplo, enviar la respuesta al cliente

            console.log(imagen_front);
            res.status(200).json({
              message: "Usuario autenticado",
              user: {
                username: user.usuario,
                name: user.nombre,
                image: imagen_front,
              },
            });
          }
        );
      } else {
        res.status(401).send("Contraseña incorrecta");
      }
    }
  );
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "Fotos_Perfil/");
  },
  filename: async function (req, file, cb) {
    let { username, useroriginal } = req.body;
    console.log(req.body);
    if (useroriginal === undefined) {
      //no hace nada
    } else {
      username = useroriginal;
    }
    try {
      ///buscar el id del usuario
      connection.query(
        "SELECT id FROM Usuario WHERE usuario = ?",
        [username],
        async (error, results, fields) => {
          if (error) {
            console.error("Error al buscar el ID del usuario:", error);
            cb(error);
            return;
          }
          let count = 0;
          if (results.length > 0) {
            const userId = results[0].id;
            // Obtener el conteo de fotos de perfil del usuario
            count = await getCountOfProfilePhotos(userId);
          }
          const filename = `${username}${count}.${file.originalname
            .split(".")
            .pop()}`;
          cb(null, filename);
        }
      );
    } catch (error) {
      console.error(
        "Error al obtener el número de fotos de perfil del usuario:",
        error
      );
      cb(error);
    }
  },
});

//creacion de imagen en carpeta Fotos_Publicadas


const upload = multer({ storage: storage });


app.post("/CreateUser", upload.single("image"), (req, res) => {
  const { username, password, name } = req.body;
  connection.query(
    "SELECT * FROM Usuario WHERE usuario = ?",
    [username],
    (error, results, fields) => {
      if (error) {
        console.error("Error al ejecutar la consulta:", error);
        res.status(500).send("Error al ejecutar la consulta");
        return;
      }
      if (results.length > 0) {
        res.status(400).send("El usuario ya existe");
        return;
      }

      const hashedPass = crypto
        .createHash("md5")
        .update(password)
        .digest("hex");

      connection.query(
        "INSERT INTO Usuario (usuario, nombre, contrasena) VALUES (?, ?, ?)",
        [username, name, hashedPass],
        (error, results, fields) => {
          if (error) {
            console.error("Error al crear el usuario:", error);
            res.status(500).send("Error al crear el usuario");
            return;
          }

          const usuarioId = results.insertId;
          const fotoFilename = req.file.filename;

          const uploadParams = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: `Fotos_Perfil/${fotoFilename}`,
            Body: fs.createReadStream(`Fotos_Perfil/${fotoFilename}`),
            ContentType: "image/jpeg",
          };

          s3.upload(uploadParams, (error, data) => {
            if (error) {
              console.error("Error al subir la foto al S3:", error);
              res.status(500).send("Error al subir la foto al S3");
              return;
            }
            console.log("Foto subida al S3:", data.Location);
          });

          connection.query(
            "INSERT INTO FotoPerfil (usuario_id, foto) VALUES (?, ?)",
            [usuarioId, fotoFilename],
            (error, results, fields) => {
              if (error) {
                console.error("Error al asociar la foto al usuario:", error);
                res.status(500).send("Error al asociar la foto al usuario");
                return;
              }
              fs.unlinkSync(`Fotos_Perfil/${fotoFilename}`);
              res.status(200).json({ message: "Usuario creado exitosamente" });
            }
          );
        }
      );
    }
  );
});

// Función para obtener el número de fotos de perfil para un usuario
const getCountOfProfilePhotos = (username) => {
  return new Promise((resolve, reject) => {
    connection.query(
      "SELECT COUNT(*) AS count FROM FotoPerfil WHERE usuario_id = ?",
      [username],
      (error, results, fields) => {
        if (error) {
          reject(error);
          return;
        }
        const count = results[0].count;
        resolve(count);
      }
    );
  });
};

//verificar si viene imagen
app.post("/EditUser", upload.single("image"), (req, res) => {
  const { username, password, name, useroriginal, image, imageoriginal } =
    req.body;
  connection.query(
    "SELECT * FROM Usuario WHERE usuario = ?",
    [useroriginal],
    (error, results, fields) => {
      if (error) {
        console.error("Error al ejecutar la consulta:", error);
        res.status(500).send("Error al ejecutar la consulta");
        return;
      }
      if (results.length === 0) {
        res.status(404).send("Usuario no encontrado");
        return;
      }
      const user = results[0];
      const hashedPass = crypto
        .createHash("md5")
        .update(password)
        .digest("hex");
      if (user.contrasena !== hashedPass) {
        res.status(401).send("Contraseña incorrecta");
        return;
      }
      //si viene imagen
      let fotoFilename;
      if (image === undefined) {
        fotoFilename = req.file.filename;

        const uploadParams = {
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: `Fotos_Perfil/${fotoFilename}`,
          Body: fs.createReadStream(`Fotos_Perfil/${fotoFilename}`),
          ContentType: "image/jpeg",
        };

        s3.upload(uploadParams, (error, data) => {
          if (error) {
            console.error("Error al subir la foto al S3:", error);
            res.status(500).send("Error al subir la foto al S3");
            return;
          }
          newImage = data.Location;
          console.log("Foto subida al S3:", data.Location);
        });
        connection.query(
          "INSERT INTO FotoPerfil (usuario_id, foto) VALUES (?, ?)",
          [user.id, fotoFilename],
          (error, results, fields) => {
            if (error) {
              console.error("Error al asociar la foto al usuario:", error);
              res.status(500).send("Error al asociar la foto al usuario");
              return;
            }
            fs.unlinkSync(`Fotos_Perfil/${fotoFilename}`);
          }
        );
      }

      connection.query(
        "UPDATE Usuario SET nombre = ?, usuario = ? WHERE usuario = ?",
        [name, username, useroriginal],
        (error, results, fields) => {
          if (error) {
            console.error("Error al actualizar el nombre del usuario:", error);
            res.status(500).send("Error al actualizar el nombre del usuario");
            return;
          }
          const updatedImage =
            image == undefined ? fotoFilename : imageoriginal;
          console.log(updatedImage);
          res.status(200).json({
            message: "Usuario editado exitosamente",
            user: {
              username: username,
              name: name,
              image: updatedImage,
            },
          });
        }
      );
    }
  );
});

app.post("/GetAlbumns", (req, res) => {
  //obtener id de usuario por usuario
  const { username } = req.body;

  connection.query(
    "SELECT id FROM Usuario WHERE usuario = ?",
    [username],
    (error, results, fields) => {
      if (error) {
        console.error("Error al obtener el ID del usuario:", error);
        res.status(500).send("Error al obtener el ID del usuario");
        return;
      }
      if (results.length === 0) {
        res.status(405).send("Usuario no encontrado");
        return;
      }
      const userId = results[0].id;
      connection.query(
        "SELECT * FROM Album WHERE usuario_id = ?",
        [userId],
        (error, results, fields) => {
          if (error) {
            console.error("Error al obtener los albumes:", error);
            res.status(500).send("Error al obtener los albumes");
            return;
          }
          const albumns = results.map((album) => {
            return {
              id: album.id,
              name: album.nombre,
            };
          });
          res.status(200).json(albumns);
        }
      );
    }
  );
});

app.post("/AddAlbums", (req, res) => {
  const { username, name, album } = req.body;
  //buscar el id del usuario
  connection.query(
    "SELECT id FROM Usuario WHERE usuario = ?",
    [username],
    (error, results, fields) => {
      if (error) {
        console.error("Error al obtener el ID del usuario:", error);
        res.status(500).send("Error al obtener el ID del usuario");
        return;
      }
      if (results.length === 0) {
        res.status(405).send("Usuario no encontrado");
        return;
      }
      const userId = results[0].id;
      connection.query(
        "INSERT INTO Album (usuario_id, nombre) VALUES (?, ?)",
        [userId, album],
        (error, results, fields) => {
          if (error) {
            console.error("Error al crear el album:", error);
            res.status(500).send("Error al crear el album");
            return;
          }
          //enviar id y nombre del album
          res.status(200).json({ id: results.insertId, name: album });
        }
      );
    }
  );
});
const storage1 = multer.diskStorage({
 
  destination: function (req, file, cb) {
    cb(null, "Fotos_Publicadas/");
    console.log("vino aqui")
  },
  filename: function (req, file, cb) {
    let { photoName } = req.body;
    cb(null, `${photoName}.${file.originalname.split(".").pop()}` );
  },
  
});
const upload2 = multer({ storage: storage1 });
app.post("/UploadPhotoAlbum", upload2.single("image"), (req, res) => {
  console.log(req.file);
  const { photoName, album, username } = req.body;
  connection.query("INSERT INTO Foto (foto, album_id) VALUES (?, ?)", [req.file.filename, album], (error, results, fields) => {
    if (error) {
      console.error("Error al subir la foto:", error);
      res.status(500).send("Error al subir la foto");
      return;
    }
    //subir a s3 
    const fotoFilename = req.file.filename;
    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `Fotos_Publicadas/${fotoFilename}`,
      Body: fs.createReadStream(`Fotos_Publicadas/${fotoFilename}`),
      ContentType: "image/jpeg",
    };

    s3.upload(uploadParams, (error, data) => {
      if (error) {
        console.error("Error al subir la foto al S3:", error);
        res.status(500).send("Error al subir la foto al S3");
        return;
      }
      console.log("Foto subida al S3:", data.Location);
      //borrar foto temporal
      fs.unlinkSync(`Fotos_Publicadas/${fotoFilename}`);
    });
    res.status(200).json({ message: "Foto subida exitosamente" });
  });



});

app.post("/GetFotosPerfil", (req, res) => {
  const { username, name } = req.body;
  connection.query(
    "SELECT id FROM Usuario WHERE usuario = ?",
    [username],
    (error, results, fields) => {
      if (error) {
        console.error("Error al obtener el ID del usuario:", error);
        res.status(500).send("Error al obtener el ID del usuario");
        return;
      }
      if (results.length === 0) {
        res.status(405).send("Usuario no encontrado");
        return;
      }
      const userId = results[0].id;
      connection.query(
        "SELECT foto FROM FotoPerfil WHERE usuario_id = ?",
        [userId],
        (error, results, fields) => {
          if (error) {
            console.error("Error al obtener las fotos de perfil:", error);
            res.status(500).send("Error al obtener las fotos de perfil");
            return;
          }
          const fotos = results.map((foto) => {
            return {
              foto: foto.foto,
            };
          });
          res.status(200).json(fotos);
        }
      );
    }
  );
});

app.post("/GetFotosAlbum", (req, res) => {
  const { albums, names } = req.body;
  //  objeto para almacenar las fotos por álbum
  const fotosPorAlbum = {};

  // Recorrer cada álbum
  albums.forEach((album, index) => {
    connection.query(
      "SELECT foto FROM Foto WHERE album_id = ?",
      [album],
      (error, results, fields) => {
        if (error) {
          console.error("Error al obtener las fotos del álbum:", error);
          res.status(500).send("Error al obtener las fotos del álbum");
          return;
        }
        // Almacenar las fotos en el objeto fotosPorAlbum
        fotosPorAlbum[names[index]] = results.map((foto) => foto.foto);

        // Verificar si se han procesado todas las consultas
        if (Object.keys(fotosPorAlbum).length === albums.length) {
          // Enviar la respuesta con las fotos organizadas por álbum
          res.status(200).json(fotosPorAlbum);
        }
      }
    );
  });
});

app.post("/EditAlbums", (req, res) => {
  const {album,newName} = req.body;
  //album es el id
  //newName el nuevo nombre
  connection.query("UPDATE Album SET nombre = ? WHERE id = ?", [newName, album], (error, results, fields) => {
    if (error) {
      console.error("Error al actualizar el nombre del album:", error);
      res.status(500).send("Error al actualizar el nombre del album");
      return;
    }
   //retornar id y name del nuevo 
    res.status(200).json({ id: album, name: newName });
  });
});

  
  app.post("/DeleteAlbums", (req, res) => {
    const {album} = req.body;
    //eliinar fotos que estan asociadas al album
    connection.query("DELETE FROM Foto WHERE album_id = ?", [album], (error, results, fields) => {
      if (error) {
          console.error("Error al eliminar las fotos del álbum:", error);
          res.status(500).send("Error al eliminar las fotos del álbum");
          return;
      }

      // Ahora eliminar el álbum
      connection.query("DELETE FROM Album WHERE id = ?", [album], (error, results, fields) => {
          if (error) {
              console.error("Error al eliminar el álbum:", error);
              res.status(500).send("Error al eliminar el álbum");
              return;
          }
          //retorno el albun con el id ya que no dio error
          res.status(200).json({ id: album });
      });
  });
});



app.get("/", (req, res) => {
  res.status(200).send("OK");
});

app.listen(8081, '0.0.0.0', () => {
  console.log("Server is running on port 8081");
});