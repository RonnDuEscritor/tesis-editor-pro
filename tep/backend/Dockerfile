FROM alpine:3.19

# Install dependencies
RUN apk add --no-cache ca-certificates wget unzip

# PocketBase version
ARG PB_VERSION=0.22.14

# Download PocketBase binary
RUN wget -q "https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip" \
    -O /tmp/pb.zip && \
    unzip /tmp/pb.zip -d /pb/ && \
    rm /tmp/pb.zip && \
    chmod +x /pb/pocketbase

# Copy hooks and migrations
COPY pb_hooks/    /pb/pb_hooks/
COPY pb_migrations/ /pb/pb_migrations/

# Expose port
EXPOSE 8090

# Data volume (persists SQLite DB + uploads)
VOLUME /pb/pb_data

# Health check
HEALTHCHECK --interval=30s --timeout=5s \
  CMD wget -q --spider http://localhost:8090/api/health || exit 1

# Start PocketBase
# Railway sets PORT env var — PocketBase uses --http flag
CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8090", "--dir=/pb/pb_data"]
