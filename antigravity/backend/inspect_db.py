import sqlite3
conn = sqlite3.connect('test.db')
cur = conn.cursor()
cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cur.fetchall()
print('Tables in test.db:', [t[0] for t in tables])
for t in tables:
    cur.execute(f"SELECT COUNT(*) FROM [{t[0]}]")
    count = cur.fetchone()[0]
    print(f"  {t[0]}: {count} rows")
conn.close()
