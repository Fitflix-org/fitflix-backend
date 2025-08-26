# FitFlix Backend - Production Deployment Guide

This guide covers deploying the FitFlix backend to production environments including Render, Railway, and Docker.

## 🚀 Quick Start

### 1. Environment Setup

Copy the production environment template:
```bash
cp env.production .env
```

Fill in your production values in the `.env` file.

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run build
```

### 4. Start Production Server
```bash
npm start
```

## 🐳 Docker Deployment

### Build and Run with Docker Compose
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

### Manual Docker Build
```bash
# Build image
docker build -t fitflix-backend .

# Run container
docker run -p 3000:3000 --env-file .env fitflix-backend
```

## ☁️ Cloud Deployment

### Render.com

1. **Connect Repository**
   - Connect your GitHub repository to Render
   - Select the `fitflix-backend` directory

2. **Environment Configuration**
   ```
   Build Command: npm run build:render
   Start Command: npm start
   ```

3. **Environment Variables**
   - `NODE_ENV`: production
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `JWT_SECRET`: Your secure JWT secret
   - `ADMIN_DASHBOARD_URL`: Your admin dashboard URL
   - `WEBSITE_URL`: Your website URL

### Railway.app

1. **Deploy from GitHub**
   - Connect your repository
   - Railway will auto-detect Node.js

2. **Environment Variables**
   - Set the same variables as Render
   - Railway provides PostgreSQL add-on

### Heroku

1. **Create App**
   ```bash
   heroku create your-app-name
   ```

2. **Add PostgreSQL**
   ```bash
   heroku addons:create heroku-postgresql:mini
   ```

3. **Deploy**
   ```bash
   git push heroku main
   ```

## 🔒 Security Checklist

- [ ] Strong JWT secret (32+ characters)
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Security headers (Helmet)
- [ ] Input validation
- [ ] SQL injection protection (Prisma)
- [ ] Environment variables secured

## 📊 Performance Features

### Production Optimizations
- **Clustering**: Multi-core CPU utilization
- **Compression**: Gzip compression for responses
- **Rate Limiting**: API abuse protection
- **Caching**: Response caching (can be added)
- **Load Balancing**: Ready for load balancers

### Monitoring
- Health check endpoint: `/health`
- Structured logging
- Error tracking
- Performance metrics

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection**
   ```bash
   # Test database connection
   npm run db:generate
   ```

2. **Port Conflicts**
   ```bash
   # Check if port is in use
   lsof -i :3000
   ```

3. **Environment Variables**
   ```bash
   # Verify environment
   node -e "console.log(process.env.NODE_ENV)"
   ```

### Logs
```bash
# View application logs
npm start 2>&1 | tee app.log

# Docker logs
docker-compose logs -f app
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm start
```

## 📈 Scaling

### Horizontal Scaling
- Use load balancer (nginx, HAProxy)
- Multiple instances behind load balancer
- Session management (Redis recommended)

### Vertical Scaling
- Increase CPU/memory allocation
- Optimize database queries
- Add caching layer

## 🆘 Support

For deployment issues:
1. Check logs: `npm start` or `docker-compose logs`
2. Verify environment variables
3. Test database connectivity
4. Check CORS configuration
5. Verify port availability

## 📚 Additional Resources

- [Node.js Production Best Practices](https://expressjs.com/en/advanced/best-practices-production.html)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
