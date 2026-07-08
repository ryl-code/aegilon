# Use official Python 3.13 slim image
FROM python:3.13-slim

# Copy uv binary from its official image for lightning-fast dependency management
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Set working directory
WORKDIR /app

# Copy dependency configuration files
COPY pyproject.toml uv.lock ./

# Install project dependencies using uv (without installing the project itself)
RUN uv sync --frozen --no-cache

# Copy the rest of the application code
COPY . .

# Expose FastAPI default port
EXPOSE 8000

# Add virtual environment binaries to PATH
ENV PATH="/app/.venv/bin:$PATH"

# Run Uvicorn pointing to the main app instance
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
