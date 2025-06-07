FROM python:3.11-slim

WORKDIR /app

# Copy requirements and install dependencies
COPY requirements_api.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the API file and simplified routers
COPY main_simple.py .
COPY simple_routers/ ./simple_routers/

# Expose port
EXPOSE 8080

# Set environment variable for port
ENV PORT=8080

# Run the API
CMD ["python", "main_simple.py"] 