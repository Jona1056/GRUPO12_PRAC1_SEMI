import mysql.connector
import os
from dotenv import load_dotenv

db = {
    'host': os.environ.get('DB_HOST'),
    'user': os.environ.get('DB_USER'),
    'password': os.environ.get('DB_PASSWORD'),
    'database': os.environ.get('DB_DATABASE')
}


def query(query , parms):
    connection = None
    cursor = None
    try:
        load_dotenv()
        connection = mysql.connector.connect(**db)
        cursor = connection.cursor()
        cursor.execute(query,parms)
        results = cursor.fetchall()
        idz = cursor.lastrowid
        connection.commit()
        return results , idz
    except mysql.connector.Error as e:
        return None
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()
