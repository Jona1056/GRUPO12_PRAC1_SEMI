from flask import Flask, request, jsonify
from flask_cors import CORS
from db import query
from encripty import hash_password
from s3 import SubirS3
import os

app = Flask(__name__)
CORS(app)

@app.route('/')
def index():
    return "Ok" , 200



# ---------------------------------------- USER ----------------------------------------

@app.route('/CreateUser', methods=['POST'])
def api_create_user():
    user = request.form['username']
    password = request.form['password']
    name = request.form['name']
    images = request.files['image']

    newFilename = NewPhotoName(user)
    
    results,_ = query("SELECT * FROM Usuario WHERE usuario = %s", (user,))

    if len(results) > 0:
        return jsonify({'mensaje':"El usuario ya existe"}), 400
    
    password = hash_password(password)
    results,  usuario_id = query("INSERT INTO Usuario (usuario , nombre , contrasena) VALUES (%s, %s, %s)", (user, name,password,))


    TipeFormat = images.filename.split(".")[-1]
    images.filename = newFilename + "." + TipeFormat
    fotoperfil = "Fotos_Perfil/"+images.filename

    SubirS3(fotoperfil, images)

    query("INSERT INTO FotoPerfil (usuario_id, foto) VALUES (%s, %s)", (usuario_id,images.filename))

    
    return jsonify({'mensaje':"usuario creado"}), 200


@app.route('/login', methods=['POST'])
def api_login():
    user = request.json.get('username')
    password = request.json.get('password')


    results,_ = query("SELECT * FROM Usuario WHERE usuario = %s", (user,))

    if len(results) == 0:
        return jsonify({'mensaje':"El Usuario No Existe"}), 404
    
    password = hash_password(password)

    if password != results[0][3]:
        return jsonify({'mensaje':"Contraseña incorrecta"}), 401
    
    datos_personales = results[0]

    results,_ = query("SELECT foto FROM FotoPerfil WHERE usuario_id = %s ORDER BY id DESC LIMIT 1", (datos_personales[0],))

    
    print(datos_personales)
    return jsonify({
            "mensaje":"Usuario logueado",
            "user":{
                "username":datos_personales[1],
                "name":datos_personales[2],
                "image":results[0][0]
            }}), 200

@app.route('/EditUser', methods=['POST'])
def api_edit_user():
    global Newimages , boolImage
    boolImage = False
    Newuser = request.form['username']
    Newpassword = request.form['password']
    Newname = request.form['name']
    user = request.form['useroriginal']
    images = request.form['imageoriginal']

    results,_ = query("SELECT * FROM Usuario WHERE usuario = %s", (user,))
    if len(results) == 0:
        return jsonify({'mensaje':"El Usuario No Existe"}), 404
    
    password = hash_password(Newpassword)

    if results[0][3] != password:
        return jsonify({'mensaje':"Contraseña incorrecta"}), 401
    
    if 'image' not in request.files or request.files['image'] is None:
        print("No se ha enviado ningún archivo de imagen.")
    else:
        Newimages = request.files['image']

        TipeFormat = Newimages.filename.split(".")[-1]

        Newimages.filename = NewPhotoName(user) + "." + TipeFormat

        fotoperfil = "Fotos_Perfil/"+Newimages.filename
        SubirS3(fotoperfil, Newimages)
        query("INSERT INTO FotoPerfil (usuario_id, foto) VALUES (%s, %s)", (results[0][0],Newimages.filename))
        boolImage = True

    resultUpdate , _ = query("UPDATE Usuario SET usuario = %s, nombre = %s WHERE usuario = %s", (Newuser, Newname, user))

    if boolImage:
        return jsonify({
            "mensaje":"Usuario Editado",
            "user":{
                "username":Newuser,
                "name":Newname,
                "image":Newimages.filename
            }}), 200
    else:
        return jsonify({
            "mensaje":"Usuario Editado",
            "user":{
                "username":Newuser,
                "name":Newname,
                "image":images
            }}), 200



# ---------------------------------------- ALBUM ----------------------------------------

@app.route('/GetAlbumns', methods=['POST'])
def api_get_albumns():
    user = request.json.get('username')
    results,_ = query("SELECT id FROM Usuario WHERE usuario = %s", (user,))
    if len(results) == 0:
        return jsonify({'mensaje':"Usuario no encontrado"}), 405
    
    UserId = results[0][0]
    results,_ = query("SELECT * FROM Album WHERE usuario_id = %s", (UserId,))
    

    albumns = [{'id': album[0], 'name': album[2]} for album in results]
    return jsonify(albumns), 200


@app.route('/AddAlbums', methods=['POST'])
def api_add_albums():
    user = request.json.get('username')
    album = request.json.get('album')

    results,_ = query("SELECT id FROM Usuario WHERE usuario = %s", (user,))
    if len(results) == 0:
        return jsonify({'mensaje':"Usuario no encontrado"}), 405
    
    UserId = results[0][0]
    _, id = query("INSERT INTO Album (usuario_id, nombre) VALUES (%s, %s)", (UserId, album,))
    
    return jsonify({"id":id , "name": album}), 200 


@app.route('/EditAlbums', methods=['POST'])
def api_edit_albums():
    album = request.json.get('album')
    newName = request.json.get('newName')

    _,_ = query("UPDATE Album SET nombre = %s WHERE id = %s", (newName,album,))

    return jsonify({"id":album , "name": newName}), 200


@app.route('/DeleteAlbums', methods=['POST'])
def api_delete_albums():
    album = request.json.get('album')

    _,_ = query("DELETE FROM Foto WHERE album_id =  %s", (album,))

    _,_ = query("DELETE FROM Album WHERE id = %s", (album,))

    return jsonify({"id":album}), 200


# ---------------------------------------- FOTO ----------------------------------------
@app.route('/GetFotosAlbum', methods=['POST'])
def api_get_fotos_album():
    albums = request.json.get('albums')
    names = request.json.get('names')
    
    listFotos = {}
    for index , id_album  in enumerate(albums):
        results,_ = query("SELECT foto FROM Foto WHERE album_id = %s", (id_album,))
        listFotos[names[index]] = [foto[0] for foto in results]

    return  jsonify(listFotos), 200

@app.route('/GetFotosPerfil', methods=['POST'])
def api_get_fotos_perfil():
    user = request.json.get('username')
    results,_ = query("SELECT id FROM Usuario WHERE usuario = %s", (user,))
    if len(results) == 0:
        return jsonify({'mensaje':"Usuario no encontrado"}), 405
    
    UserId = results[0][0]
    results,_ = query("SELECT foto FROM FotoPerfil WHERE usuario_id = %s", (UserId,))
    
    fotos = [{'foto': foto[0]} for foto in results]

    return jsonify(fotos), 200


@app.route('/UploadPhotoAlbum', methods=['POST'])
def api_upload_photo_album():
    album = request.form['album']
    photoName = request.form['photoName']
    image = request.files['image']

    TipeFormat = image.filename.split(".")[-1]
    NewName = f"{photoName}.{TipeFormat}"
    image.filename = NewName

    query("INSERT INTO Foto (foto , album_id) VALUES (%s, %s)", (image.filename , album))
    
    SubirS3(f"Fotos_Publicadas/{image.filename}", image)


    return jsonify({'message':"Foto subida exitosamente"}), 200







# ------------------------------- OTROS ----------------------------------------
def  NewPhotoName(user):
    CountFoto = 0
    serch_user , _  = query("SELECT id FROM Usuario WHERE usuario = %s", (user,))
    if len(serch_user) == 0:
        filename = f"{user}{CountFoto}"
        return filename
    else:
         results,_ = query("SELECT COUNT(*) FROM FotoPerfil WHERE usuario_id = %s", (serch_user[0][0],))
         CountFoto = results[0][0]
         newfile = f"{user}{CountFoto}"
         return newfile

if __name__ == '__main__':
    app.run( host= '0.0.0.0' , debug=True , port=8081)