#!/bin/bash

# Zenvoyer Stop Script
# This script stops all Zenvoyer services

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

command_exists() {
    command -v "$1" >/dev/null 2>&1
}

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════╗"
echo "║                                                ║"
echo "║           ZENVOYER STOP MANAGER                ║"
echo "║                                                ║"
echo "╚════════════════════════════════════════════════╝"
echo -e "${NC}\n"

STOPPED_COUNT=0

# Stop backend
if [ -f ".backend.pid" ]; then
    BACKEND_PID=$(cat .backend.pid)
    print_info "Stopping Backend (PID: $BACKEND_PID)..."
    
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        kill $BACKEND_PID 2>/dev/null || kill -9 $BACKEND_PID 2>/dev/null
        print_success "Backend stopped"
        STOPPED_COUNT=$((STOPPED_COUNT + 1))
    else
        print_warning "Backend process not found"
    fi
    
    rm .backend.pid
else
    print_info "Backend is not running"
fi

# Stop frontend
if [ -f ".frontend.pid" ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    print_info "Stopping Frontend (PID: $FRONTEND_PID)..."
    
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        kill $FRONTEND_PID 2>/dev/null || kill -9 $FRONTEND_PID 2>/dev/null
        print_success "Frontend stopped"
        STOPPED_COUNT=$((STOPPED_COUNT + 1))
    else
        print_warning "Frontend process not found"
    fi
    
    rm .frontend.pid
else
    print_info "Frontend is not running"
fi

# Kill any remaining node processes for Zenvoyer
print_info "Checking for remaining processes..."
pkill -f "zenvoyer-app" 2>/dev/null && print_success "Cleaned up remaining processes" || print_info "No remaining processes found"

# Ask about Docker services
if command_exists docker && docker ps | grep -q zenvoyer; then
    echo ""
    print_warning "Docker services are still running"
    read -p "Do you want to stop Docker services too? [y/N]: " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Stopping Docker services..."
        if docker-compose down 2>/dev/null || docker compose down 2>/dev/null; then
            print_success "Docker services stopped"
            STOPPED_COUNT=$((STOPPED_COUNT + 1))
        else
            print_error "Failed to stop Docker services"
        fi
    else
        print_info "Docker services will continue running"
    fi
fi

echo ""
if [ $STOPPED_COUNT -gt 0 ]; then
    print_success "Successfully stopped $STOPPED_COUNT service(s)"
else
    print_info "No services were running"
fi

echo ""
print_info "To start services again: ${GREEN}./start.sh${NC}"
echo ""
