import sqlite3
import os

db_path = r'd:\e-commerce\Duplicate\ShopSphere\db.sqlite3'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("Orders count:")
cursor.execute("SELECT COUNT(*) FROM user_order")
print(cursor.fetchone()[0])

print("\nPayments count:")
cursor.execute("SELECT COUNT(*) FROM user_payment")
print(cursor.fetchone()[0])

print("\nOrders without payments:")
cursor.execute("""
    SELECT o.id, o.order_number, o.total_amount, o.user_id, o.payment_method, o.transaction_id
    FROM user_order o
    LEFT JOIN user_payment p ON o.id = p.order_id
    WHERE p.id IS NULL
""")
rows = cursor.fetchall()
for row in rows:
    print(row)

conn.close()
