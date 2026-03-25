# Build stage
FROM eclipse-temurin:21-jdk AS build
WORKDIR /workspace
RUN apt-get update && apt-get install -y --no-install-recommends unzip && rm -rf /var/lib/apt/lists/*
COPY . .
RUN chmod +x ./mvnw && ./mvnw -B -pl verifix-jobs-api -am -Dmaven.test.skip=true package

# Runtime stage
FROM eclipse-temurin:21-jre
WORKDIR /app

# Security: run as non-root user
RUN groupadd -r appuser && useradd -r -g appuser -d /app appuser
RUN chown -R appuser:appuser /app

COPY --from=build --chown=appuser:appuser /workspace/verifix-jobs-api/target/*.jar app.jar

USER appuser
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

ENV SPRING_PROFILES_ACTIVE=prod
ENTRYPOINT ["sh", "-c", "java -XX:+UseG1GC -XX:MaxRAMPercentage=75.0 -XX:+UseStringDeduplication -Djava.security.egd=file:/dev/./urandom -Dspring.profiles.active=${SPRING_PROFILES_ACTIVE} -jar /app/app.jar"]
