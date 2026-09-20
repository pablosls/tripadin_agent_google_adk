FROM python:3.11-slim

WORKDIR /app

# Optimize Python execution in containers
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install curl for healthcheck
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY backend/requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY backend/ backend/
COPY frontend/ frontend/
COPY adk_agent/ adk_agent/

# Set working directory
WORKDIR /app

# Cloud Run passes PORT environment variable dynamically
ENV PORT=8080
EXPOSE 8080

# Run FastAPI app
CMD exec uvicorn backend.main:app --host 0.0.0.0 --port ${PORT}
