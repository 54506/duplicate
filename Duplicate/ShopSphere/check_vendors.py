import sqlite3
import os

db_path = r'd:\e-commerce\Duplicate\ShopSphere\db.sqlite3'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("Vendor Profiles:")
cursor.execute("SELECT id, shop_name, user_id, approval_status FROM vendor_vendorprofile")
rows = cursor.fetchall()
for row in rows:
    print(row)

conn.close()
