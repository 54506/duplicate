import sqlite3
import os

db_path = r'd:\e-commerce\Duplicate\ShopSphere\db.sqlite3'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("Existing Users:")
cursor.execute("SELECT id, username, email, role, is_superuser FROM user_authuser")
rows = cursor.fetchall()
for row in rows:
    print(row)

conn.close()
