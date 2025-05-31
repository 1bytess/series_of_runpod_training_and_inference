# Running Your Fine-tuned Model App with Docker

In this guide, we'll learn how to containerize and deploy your fine-tuned model application using Docker. This approach ensures consistent deployment across different environments and makes it easy to scale your application.

## 📋 Prerequisites

Before starting this tutorial, make sure you have:

- ✅ Completed previous tutorials (1-3)
- ✅ A working Next.js application with your fine-tuned model
- ✅ Docker installed on your system
- ✅ Docker Compose installed
- ✅ Basic understanding of containerization concepts

## 🔧 Installation Requirements

### Install Docker

**For Windows/Mac:**
1. Download Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop)
2. Follow the installation wizard
3. Start Docker Desktop

**For Linux (Ubuntu/Debian):**
```bash
# Update package index
sudo apt update

# Install Docker
sudo apt install docker.io docker-compose

# Add your user to docker group
sudo usermod -aG docker $USER

# Restart your session or run:
newgrp docker
```

### Verify Installation
```bash
docker --version
docker-compose --version
```

## 📁 Project Structure

Your project should have this structure:
```
your-app/
├── src/
│   ├── api/
│   ├── page.tsx
│   ├── layout.tsx
├── package.json
├── package-lock.json
├── next.config.js
├── Dockerfile          # ← We'll create this
├── docker-compose.yml  # ← We'll create this
└── .dockerignore       # ← We'll create this
```

## 🐳 Step 1: Create Dockerfile

Create a `Dockerfile` in your project root:

```dockerfile
# Stage 1: Install dependencies and build
FROM node:20-alpine AS builder
WORKDIR /app

# Ensure all deps are copied (including lock file)
COPY package*.json ./

# Clean install for consistency
RUN npm install

# Copy the rest of the code
COPY . .

# Build the Next.js app
RUN npm run build

# Stage 2: Production image
FROM node:20-alpine
WORKDIR /app

COPY --from=builder /app ./

# Install only production dependencies
RUN npm ci --omit=dev

EXPOSE 3000
CMD ["npm", "start"]
```

### 🔍 Dockerfile Explanation

**Multi-stage Build:**
- **Stage 1 (builder)**: Installs all dependencies and builds the application
- **Stage 2 (production)**: Creates a lean production image with only necessary files

**Key Benefits:**
- **Smaller image size**: Production image doesn't include dev dependencies
- **Better security**: Fewer packages mean fewer potential vulnerabilities  
- **Faster deployments**: Smaller images transfer faster

## 📝 Step 2: Create .dockerignore

Create a `.dockerignore` file to exclude unnecessary files:

```dockerignore
node_modules
npm-debug.log
.next
.git
.gitignore
README.md
Dockerfile
docker-compose.yml
.env.local
.env.development.local
.env.test.local
.env.production.local
```

## 🔧 Step 3: Create Docker Compose Configuration

Create a `docker-compose.yml` file:

```yaml
version: '3.8'

services:
  webai:
    container_name: webai-nextjs
    build: .
    ports:
      - "3000:3000"  # Host:Container port mapping
    environment:
      - NODE_ENV=production
    networks:
      - webai-network
    restart: unless-stopped

networks:
  webai-network:
    external: true
```

### 🔍 Docker Compose Explanation

- **container_name**: Custom name for your container
- **build**: Builds image from current directory's Dockerfile
- **ports**: Maps host port 3000
- **environment**: Sets production environment variables
- **networks**: Uses external network for service communication
- **restart**: Automatically restarts container if it stops

## 🚀 Step 4: Build and Run

### Create External Network
```bash
docker network create webai-network
```

### Build and Start Services
```bash
# Build and start in detached mode
docker-compose up -d --build

# View logs
docker-compose logs -f webai

# Check running containers
docker ps
```

### Alternative Docker Commands
```bash
# Build image manually
docker build -t private-webai-nextjs .

# Run container manually
docker run -d \
  --name private-webai-nextjs \
  -p 4000:3000 \
  -e NODE_ENV=production \
  --network webai-network \
  --restart unless-stopped \
  private-webai-nextjs
```

## 🌐 Step 5: Access Your Application

Once the container is running, access your application at:
- **Local URL**: http://localhost:3000
- **Network URL**: http://your-server-ip:3000

## 🛠️ Management Commands 

### View Container Status
```bash
# List running containers
docker ps

# View all containers (including stopped)
docker ps -a

# Check container logs
docker logs private-webai-nextjs

# Follow logs in real-time
docker logs -f private-webai-nextjs
```

### Container Operations
```bash
# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Restart services
docker-compose restart

# Rebuild and restart
docker-compose up -d --build
```

### Accessing Container Shell
```bash
# Execute commands in running container
docker exec -it private-webai-nextjs sh

# Or using docker-compose
docker-compose exec webai sh
```

## 🔧 Environment Configuration

### Environment Variables

Create a `.env` file for environment-specific configurations:

```env
# .env
NODE_ENV=production
API_BASE_URL=http://localhost:3000
MODEL_ENDPOINT=your-model-endpoint
API_KEY=your-api-key
```

Update your `docker-compose.yml`:
```yaml
services:
  webai:
    # ... other configurations
    env_file:
      - .env
    environment:
      - NODE_ENV=production
```

### Production Considerations

For production deployment, consider:

```yaml
services:
  webai:
    # ... existing config
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
        reservations:
          memory: 512M
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

## 🐛 Troubleshooting

### Common Issues

**Port Already in Use:**
```bash
# Check what's using port 4000
lsof -i :4000

# Use different port in docker-compose.yml
ports:
  - "4001:3000"
```

**Build Fails:**
```bash
# Clear Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

**Container Exits Immediately:**
```bash
# Check container logs
docker logs private-webai-nextjs

# Run container interactively for debugging
docker run -it --rm private-webai-nextjs sh
```

**Network Issues:**
```bash
# Recreate network
docker network rm webai-network
docker network create webai-network
```

### Performance Optimization

**Multi-stage Build Optimization:**
```dockerfile
# Add this to your Dockerfile for better caching
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
```

## 📊 Monitoring

### Health Checks

Add a health check endpoint to your Next.js app:

```javascript
// pages/api/health.js
export default function handler(req, res) {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
}
```

### Container Monitoring
```bash
# Monitor resource usage
docker stats private-webai-nextjs

# View detailed container info
docker inspect private-webai-nextjs
```


## 📚 Additional Resources

- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Next.js Docker Documentation](https://nextjs.org/docs/deployment#docker-image)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)

## 🤝 Contributing

Found an issue or want to improve this tutorial? Please open an issue or submit a pull request on our [GitHub repository](https://github.com/1bytess/series_of_runpod_training_and_inference).

---

**Congratulations!** 🎉 You've successfully containerized your fine-tuned model application. Your app is now portable, scalable, and ready for production deployment!