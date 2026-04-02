FROM python:3.12-slim

WORKDIR /app

# Security: non-root user
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*
RUN groupadd -r mluser && useradd -r -g mluser -d /app mluser

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY --chown=mluser:mluser app ./app

# Generate gRPC code from proto files
RUN python -m grpc_tools.protoc \
    -I app/proto \
    --python_out=app/proto \
    --grpc_python_out=app/proto \
    app/proto/ml_service.proto

USER mluser
EXPOSE 8000 50051

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
