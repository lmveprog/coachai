FROM python:3.12-slim

# SQLite is built into Python — no extra deps needed
# pandas for result formatting
RUN pip install --no-cache-dir pandas==2.2.1

# The SQL runner script wraps user SQL and runs it against SQLite
COPY sql_runner.py /usr/local/bin/sql_runner.py

RUN useradd -m -u 1000 sandbox
USER sandbox

WORKDIR /code

# The judge mounts the user's .sql file at /code/solution.sql
# We run it through the runner which sets up the DB from schema + data
CMD ["python", "/usr/local/bin/sql_runner.py", "/code/solution.sql"]
