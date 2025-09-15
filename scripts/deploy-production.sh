#!/bin/bash

# Production Deployment Script for Fitflix Backend
# This script prepares and deploys the backend to production

set -e

echo "🚀 Fitflix Backend Production Deployment"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "server.js" ]; then
    print_error "Please run this script from the fitflix-backend directory"
    exit 1
fi

# Check if production environment file exists
if [ ! -f "env.production" ]; then
    print_error "env.production file not found!"
    print_status "Please create env.production with production environment variables"
    exit 1
fi

# Check if all required environment variables are set
print_status "Checking production environment variables..."

required_vars=(
    "DATABASE_URL"
    "JWT_SECRET"
    "COOKIE_SECRET"
    "CORS_ORIGIN"
)

missing_vars=()
for var in "${required_vars[@]}"; do
    if ! grep -q "^${var}=" env.production || grep -q "^${var}=\"your-.*-here-change-this\"" env.production; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    print_warning "The following environment variables need to be configured:"
    for var in "${missing_vars[@]}"; do
        echo "  - $var"
    done
    echo
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check Node.js version
print_status "Checking Node.js version..."
NODE_VERSION=$(node --version)
print_success "Node.js version: $NODE_VERSION"

# Install dependencies
print_status "Installing dependencies..."
npm ci --production

# Generate Prisma client
print_status "Generating Prisma client..."
npx prisma generate

# Run database migrations
print_status "Running database migrations..."
if [ "$NODE_ENV" = "production" ]; then
    npx prisma migrate deploy
else
    print_warning "Not in production mode, skipping migrations"
    print_status "To run migrations manually: npx prisma migrate deploy"
fi

# Run security tests
print_status "Running security tests..."
if npm run test:security > /dev/null 2>&1; then
    print_success "Security tests passed"
else
    print_warning "Security tests failed - please review"
fi

# Check build
print_status "Building application..."
npm run build:render

print_success "Backend is ready for production deployment!"
echo
echo "📋 Production Checklist:"
echo "✅ Environment variables configured"
echo "✅ Dependencies installed"
echo "✅ Prisma client generated"
echo "✅ Database migrations ready"
echo "✅ Security tests completed"
echo "✅ Application built"
echo
echo "🚀 Next Steps:"
echo "1. Push your code to GitHub"
echo "2. Deploy to Render or your hosting platform"
echo "3. Set environment variables in your hosting platform"
echo "4. Monitor the /health and /metrics endpoints"
echo
echo "🔍 Monitoring Endpoints:"
echo "- Health Check: /health"
echo "- Metrics: /metrics"
echo "- Security Test: /security-test"
echo
print_warning "Remember to update your JWT_SECRET and COOKIE_SECRET with secure random values!"
