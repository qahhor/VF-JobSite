#!/bin/bash
# Generate Python gRPC code from proto files
python -m grpc_tools.protoc \
    -I app/proto \
    --python_out=app/proto \
    --grpc_python_out=app/proto \
    app/proto/ml_service.proto

echo "Proto files generated successfully."
