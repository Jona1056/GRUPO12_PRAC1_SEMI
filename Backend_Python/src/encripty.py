import hashlib

def hash_password(password):

    hash_md5 = hashlib.md5(password.encode())
    return hash_md5.hexdigest()
