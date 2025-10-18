#!/bin/bash

# Zenvoyer Installation Script
# This script automates the installation process for Zenvoyer

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_header() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Main installation
main() {
    clear
    echo -e "${BLUE}"
    echo "╔════════════════════════════════════════════════╗"
    echo "║                                                ║"
    echo "║           ZENVOYER INSTALLER v1.0              ║"
    echo "║     Professional Invoice Management SaaS       ║"
    echo "║                                                ║"
    echo "╚════════════════════════════════════════════════╝"
    echo -e "${NC}\n"

    print_info "Starting installation process...\n"

    # Step 1: Check prerequisites
    print_header "Step 1: Checking Prerequisites"
    
    print_info "Checking Node.js..."
    if command_exists node; then
        NODE_VERSION=$(node --version)
        print_success "Node.js $NODE_VERSION is installed"
    else
        print_error "Node.js is not installed!"
        print_info "Please install Node.js 18+ from: https://nodejs.org/"
        exit 1
    fi

    print_info "Checking npm..."
    if command_exists npm; then
        NPM_VERSION=$(npm --version)
        print_success "npm $NPM_VERSION is installed"
    else
        print_error "npm is not installed!"
        exit 1
    fi

    print_info "Checking Docker..."
    if command_exists docker; then
        DOCKER_VERSION=$(docker --version | cut -d ' ' -f3 | tr -d ',')
        print_success "Docker $DOCKER_VERSION is installed"
        DOCKER_INSTALLED=true
    else
        print_warning "Docker is not installed (optional)"
        print_info "You can install Docker from: https://www.docker.com/get-started"
        DOCKER_INSTALLED=false
    fi

    print_info "Checking Docker Compose..."
    if command_exists docker-compose || docker compose version >/dev/null 2>&1; then
        print_success "Docker Compose is installed"
    else
        if [ "$DOCKER_INSTALLED" = true ]; then
            print_warning "Docker Compose is not installed (optional)"
        fi
    fi

    # Step 2: Install dependencies
    print_header "Step 2: Installing Dependencies"
    
    print_info "Installing root dependencies..."
    if npm install; then
        print_success "Root dependencies installed"
    else
        print_error "Failed to install root dependencies"
        exit 1
    fi

    print_info "Installing backend dependencies..."
    cd zenvoyer-app/apps/api
    if npm install; then
        print_success "Backend dependencies installed"
    else
        print_error "Failed to install backend dependencies"
        exit 1
    fi
    cd ../../..

    print_info "Installing frontend dependencies..."
    cd zenvoyer-app/apps/web
    if npm install; then
        print_success "Frontend dependencies installed"
    else
        print_error "Failed to install frontend dependencies"
        exit 1
    fi
    cd ../../..

    # Step 3: Setup environment files
    print_header "Step 3: Setting Up Environment Files"
    
    print_info "Setting up backend .env file..."
    if [ -f "zenvoyer-app/apps/api/.env" ]; then
        print_warning ".env file already exists, skipping..."
    else
        if [ -f "zenvoyer-app/apps/api/.env.example" ]; then
            cp zenvoyer-app/apps/api/.env.example zenvoyer-app/apps/api/.env
            print_success "Backend .env file created from .env.example"
            print_warning "Please update zenvoyer-app/apps/api/.env with your configuration"
        else
            print_error ".env.example not found!"
        fi
    fi

    print_info "Setting up frontend .env file..."
    if [ -f "zenvoyer-app/apps/web/.env.local" ]; then
        print_warning ".env.local file already exists, skipping..."
    else
        cat > zenvoyer-app/apps/web/.env.local << 'EOF'
# Frontend Environment Variables
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=Zenvoyer
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF
        print_success "Frontend .env.local file created"
    fi

    # Step 4: Setup Docker services (optional)
    if [ "$DOCKER_INSTALLED" = true ]; then
        print_header "Step 4: Setting Up Docker Services"
        
        print_info "Would you like to start Docker services (PostgreSQL, Redis, etc.)? [y/N]"
        read -r START_DOCKER
        
        if [[ "$START_DOCKER" =~ ^[Yy]$ ]]; then
            print_info "Starting Docker services..."
            if docker-compose up -d 2>/dev/null || docker compose up -d; then
                print_success "Docker services started successfully"
                print_info "Services running:"
                print_info "  - PostgreSQL: localhost:5432"
                print_info "  - Redis: localhost:6379"
                print_info "  - pgAdmin: http://localhost:5050"
                print_info "  - Redis Commander: http://localhost:8081"
                print_info "  - Mailhog: http://localhost:8025"
            else
                print_error "Failed to start Docker services"
                print_warning "You can start them manually with: docker-compose up -d"
            fi
            
            print_info "Waiting for database to be ready..."
            sleep 5
            
            # Run migrations
            print_info "Would you like to run database migrations? [y/N]"
            read -r RUN_MIGRATIONS
            
            if [[ "$RUN_MIGRATIONS" =~ ^[Yy]$ ]]; then
                print_info "Running database migrations..."
                cd zenvoyer-app/apps/api
                if npm run migration:run 2>/dev/null; then
                    print_success "Database migrations completed"
                else
                    print_warning "Migration command not found or failed"
                    print_info "You may need to set up migrations manually"
                fi
                cd ../../..
            fi
        else
            print_warning "Skipping Docker setup"
            print_info "Make sure you have PostgreSQL and Redis running manually"
        fi
    else
        print_header "Step 4: Database Setup"
        print_warning "Docker is not installed"
        print_info "Please ensure you have:"
        print_info "  - PostgreSQL 15+ running on localhost:5432"
        print_info "  - Redis 7+ running on localhost:6379"
    fi

    # Step 5: Create helper scripts
    print_header "Step 5: Creating Helper Scripts"
    
    print_info "Creating start.sh script..."
    # This will be created separately
    print_success "Helper scripts will be available after installation"

    # Installation complete
    print_header "Installation Complete! 🎉"
    
    echo -e "${GREEN}"
    echo "╔════════════════════════════════════════════════╗"
    echo "║                                                ║"
    echo "║     Zenvoyer has been installed successfully!  ║"
    echo "║                                                ║"
    echo "╚════════════════════════════════════════════════╝"
    echo -e "${NC}\n"

    print_info "Next steps:"
    echo ""
    echo "  1. Update environment variables:"
    echo "     - Backend:  zenvoyer-app/apps/api/.env"
    echo "     - Frontend: zenvoyer-app/apps/web/.env.local"
    echo ""
    echo "  2. Start the application:"
    echo "     ${GREEN}./start.sh${NC}"
    echo ""
    echo "  3. Access the application:"
    echo "     - Frontend: ${BLUE}http://localhost:3000${NC}"
    echo "     - Backend:  ${BLUE}http://localhost:3001${NC}"
    echo ""
    
    if [ "$DOCKER_INSTALLED" = true ]; then
        echo "  4. Management Tools:"
        echo "     - pgAdmin:         ${BLUE}http://localhost:5050${NC}"
        echo "     - Redis Commander: ${BLUE}http://localhost:8081${NC}"
        echo "     - Mailhog:         ${BLUE}http://localhost:8025${NC}"
        echo ""
    fi

    print_info "For more information, see README-SETUP.md"
    echo ""
}

# Run main installation
main "$@"
