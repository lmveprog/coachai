"""
SQL Runner — exécute le SQL de l'utilisateur dans un contexte SQLite.
Le contexte (schéma + données) est injecté via /code/context.json si présent.

Format context.json:
{
  "setup_sql": "CREATE TABLE ...; INSERT INTO ...;",
}
"""
import sys
import sqlite3
import json
import os

sql_file = sys.argv[1] if len(sys.argv) > 1 else "/code/solution.sql"

try:
    with open(sql_file) as f:
        user_sql = f.read().strip()
except FileNotFoundError:
    print("ERROR: solution.sql not found", file=sys.stderr)
    sys.exit(1)

conn = sqlite3.connect(":memory:")
conn.row_factory = sqlite3.Row

# Load context (schema + data) if provided
context_path = "/code/context.json"
if os.path.exists(context_path):
    with open(context_path) as f:
        ctx = json.load(f)
    setup_sql = ctx.get("setup_sql", "")
    if setup_sql:
        try:
            conn.executescript(setup_sql)
        except sqlite3.Error as e:
            print(f"ERROR setting up schema: {e}", file=sys.stderr)
            sys.exit(1)

# Execute user SQL
try:
    cursor = conn.execute(user_sql)
    rows = cursor.fetchall()
    if rows:
        # Print header
        cols = [d[0] for d in cursor.description]
        print(",".join(cols))
        for row in rows:
            print(",".join(str(v) if v is not None else "NULL" for v in row))
    conn.commit()
except sqlite3.Error as e:
    print(f"SQL Error: {e}", file=sys.stderr)
    sys.exit(1)
finally:
    conn.close()
