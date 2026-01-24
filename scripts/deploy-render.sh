#!/bin/bash

# Render Deployment Script for V-Link System
# This script helps deploy both frontend and worker services

set -e

echo "🚀 Starting V-Link Render Deployment..."

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

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."

    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi

    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi

    print_success "Dependencies check passed"
}

# Build the application
build_app() {
    print_status "Building Next.js application..."

    # Clean previous builds
    rm -rf .next out

    # Install dependencies
    npm ci --production=false

    # Build the application
    npm run build

    if [ $? -eq 0 ]; then
        print_success "Application built successfully"
    else
        print_error "Build failed"
        exit 1
    fi
}

# Run database migrations
setup_database() {
    print_status "Setting up database..."

    # Generate Prisma client
    npx prisma generate

    # Run migrations (if DATABASE_URL is set)
    if [ -n "$DATABASE_URL" ]; then
        print_status "Running database migrations..."
        npx prisma migrate deploy
    else
        print_warning "DATABASE_URL not set. Skipping database migrations."
        print_warning "Make sure to set DATABASE_URL in Render dashboard."
    fi
}

# Health check function
health_check() {
    print_status "Performing health checks..."

    # Check if Next.js build exists
    if [ ! -d ".next" ]; then
        print_error "Next.js build not found"
        exit 1
    fi

    # Check if worker file exists
    if [ ! -f "src/workers/ledgerWorker.js" ]; then
        print_error "Worker file not found"
        exit 1
    fi

    print_success "Health checks passed"
}

# Display deployment instructions
show_instructions() {
    echo ""
    echo "=================================================="
    echo "🎯 RENDER DEPLOYMENT INSTRUCTIONS"
    echo "=================================================="
    echo ""
    echo "1. Connect your GitHub repository to Render:"
    echo "   - Go to https://render.com"
    echo "   - Click 'New' → 'Blueprint'"
    echo "   - Connect your GitHub repo"
    echo ""
    echo "2. Environment Variables (set in Render dashboard):"
    echo ""
    echo "   For vlink-frontend service:"
    echo "   • DATABASE_URL=postgresql://..."
    echo "   • NEXTAUTH_SECRET=your-secret-key"
    echo "   • NEXTAUTH_URL=https://your-app-name.onrender.com"
    echo ""
    echo "   For vlink-worker service:"
    echo "   • DATABASE_URL=postgresql://... (same as frontend)"
    echo "   • RABBITMQ_URL=amqp://..."
    echo ""
    echo "3. Database Setup:"
    echo "   • Create a PostgreSQL database on Render"
    echo "   • Run: npx prisma migrate deploy"
    echo "   • Run: npx prisma db seed (if needed)"
    echo ""
    echo "4. RabbitMQ Setup:"
    echo "   • Use CloudAMQP or similar service"
    echo "   • Get the AMQP URL for RABBITMQ_URL"
    echo ""
    echo "5. Deploy both services from Render dashboard"
    echo ""
    echo "=================================================="
}

# Main deployment process
main() {
    echo "=================================================="
    echo "🚀 V-Link Render Deployment Script"
    echo "=================================================="
    echo ""

    check_dependencies
    build_app
    setup_database
    health_check

    print_success "Pre-deployment checks completed!"
    show_instructions
}

# Run main function
main "$@"
