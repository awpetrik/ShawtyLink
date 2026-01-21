FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Create the database file and set permissions
RUN touch sql_app.db && chmod 666 sql_app.db

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
