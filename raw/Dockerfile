FROM denoland/deno:2.3.3

WORKDIR /app

# Copy source files
COPY . .

# Cache dependencies
RUN deno cache --lock=deno.lock main.ts

# Expose port (adjust if needed)
EXPOSE 8000

CMD ["run", "--allow-net", "--allow-read", "--allow-write", "main.ts"]
