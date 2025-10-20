#!/bin/bash

# Zenvoyer Start Script
# This script starts all Zenvoyer services

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

# Main function
main() {
    clear
    echo -e "${BLUE}"
    echo "╔════════════════════════════════════════════════╗"
    echo "║                                                ║"
    echo "║           ZENVOYER STARTUP MANAGER             ║"
    echo "║                                                ║"
    echo "╚════════════════════════════════════════════════╝"
    echo -e "${NC}\n"

    # Detect project structure
    if [ -d "zenvoyer-app/apps/api" ]; then
        API_DIR="zenvoyer-app/apps/api"
        WEB_DIR="zenvoyer-app/apps/web"
        MONOREPO_ROOT="zenvoyer-app"
    elif [ -d "apps/api" ]; then
        API_DIR="apps/api"
        WEB_DIR="apps/web"
        MONOREPO_ROOT="."
    else
        print_error "Cannot find application directories!"
        print_info "Are you in the correct directory?"
        exit 1
    fi

    # Check if installation was done
    if [ ! -d "$MONOREPO_ROOT/node_modules" ] && [ ! -d "$API_DIR/node_modules" ]; then
        print_error "Dependencies not installed!"
        print_info "Please run ./install.sh first"
        exit 1
    fi

    # Start Docker services if available
    if command_exists docker; then
        print_info "Checking Docker services..."
        
        if docker ps | grep -q zenvoyer-postgres; then
            print_success "Docker services are already running"
        else
            print_info "Starting Docker services..."
            if docker-compose up -d 2>/dev/null || docker compose up -d 2>/dev/null; then
                print_success "Docker services started"
                sleep 3
            else
                print_warning "Could not start Docker services"
                print_info "Make sure PostgreSQL and Redis are running"
            fi
        fi
    fi

    # Check environment files
    print_info "Checking environment files..."
    
    if [ ! -f "$API_DIR/.env" ]; then
        print_error "Backend .env file not found!"
        print_info "Please run ./install.sh first or copy .env.example to .env"
        exit 1
    fi
    print_success "Backend .env found"

    if [ ! -f "$WEB_DIR/.env.local" ]; then
        print_warning "Frontend .env.local not found, creating default..."
        cat > "$WEB_DIR/.env.local" << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=Zenvoyer
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF
        print_success "Frontend .env.local created"
    fi

    # Ask user what to start
    echo ""
    print_info "What would you like to start?"
    echo ""
    echo "  1) Full Stack (Backend + Frontend)"
    echo "  2) Backend Only"
    echo "  3) Frontend Only"
    echo "  4) Development Mode (with hot reload)"
    echo "  5) Exit"
    echo ""
    read -p "Enter your choice [1-5]: " choice

    case $choice in
        1)
            start_full_stack
            ;;
        2)
            start_backend
            ;;
        3)
            start_frontend
            ;;
        4)
            start_dev_mode
            ;;
        5)
            print_info "Exiting..."
            exit 0
            ;;
        *)
            print_error "Invalid choice!"
            exit 1
            ;;
    esac
}

start_full_stack() {
    print_info "Starting Full Stack..."
    echo ""
    
    # Determine return path
    if [ "$MONOREPO_ROOT" = "." ]; then
        RETURN_PATH="../.."
        LOG_PATH="../../logs"
        PID_PATH="../.."
    else
        RETURN_PATH="../../.."
        LOG_PATH="../../../logs"
        PID_PATH="../../.."
    fi
    
    # Start backend in background
    print_info "Starting Backend..."
    cd "$API_DIR"
    npm run start:dev > "$LOG_PATH/backend.log" 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > "$PID_PATH/.backend.pid"
    cd "$RETURN_PATH"
    
    sleep 3
    print_success "Backend started (PID: $BACKEND_PID)"
    
    # Start frontend in background
    print_info "Starting Frontend..."
    cd "$WEB_DIR"
    npm run dev > "$LOG_PATH/frontend.log" 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > "$PID_PATH/.frontend.pid"
    cd "$RETURN_PATH"
    
    sleep 3
    print_success "Frontend started (PID: $FRONTEND_PID)"
    
    show_running_services
}

start_backend() {
    print_info "Starting Backend..."
    
    # Check if backend is already running
    if [ -f ".backend.pid" ]; then
        OLD_PID=$(cat .backend.pid)
        if ps -p $OLD_PID > /dev/null 2>&1; then
            print_warning "Backend is already running (PID: $OLD_PID)"
            print_info "Stop it first with: ./stop.sh"
            exit 1
        fi
    fi
    
    cd "$API_DIR"
    npm run start:dev > ../../logs/backend.log 2>&1 &
    BACKEND_PID=$!
    
    # Return to project root and save PID
    if [ "$MONOREPO_ROOT" = "." ]; then
        cd ../..
    else
        cd ../../..
    fi
    echo $BACKEND_PID > .backend.pid
    
    sleep 3
    print_success "Backend started (PID: $BACKEND_PID)"
    print_info "Backend is running on: ${BLUE}http://localhost:3001${NC}"
    print_info "Logs: tail -f logs/backend.log"
}

start_frontend() {
    print_info "Starting Frontend..."
    
    # Check if frontend is already running
    if [ -f ".frontend.pid" ]; then
        OLD_PID=$(cat .frontend.pid)
        if ps -p $OLD_PID > /dev/null 2>&1; then
            print_warning "Frontend is already running (PID: $OLD_PID)"
            print_info "Stop it first with: ./stop.sh"
            exit 1
        fi
    fi
    
    cd "$WEB_DIR"
    npm run dev > ../../logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    
    # Return to project root and save PID
    if [ "$MONOREPO_ROOT" = "." ]; then
        cd ../..
    else
        cd ../../..
    fi
    echo $FRONTEND_PID > .frontend.pid
    
    sleep 3
    print_success "Frontend started (PID: $FRONTEND_PID)"
    print_info "Frontend is running on: ${BLUE}http://localhost:3000${NC}"
    print_info "Logs: tail -f logs/frontend.log"
}

start_dev_mode() {
    print_info "Starting Development Mode..."
    print_warning "This will run services in foreground with hot reload"
    echo ""
    
    # Check if tmux is available
    if command_exists tmux; then
        print_info "Using tmux for split terminals..."
        
        # Create tmux session
        tmux new-session -d -s zenvoyer
        
        # Split window
        tmux split-window -h
        
        # Run backend in first pane
        tmux select-pane -t 0
        tmux send-keys "cd $API_DIR && npm run start:dev" C-m
        
        # Run frontend in second pane
        tmux select-pane -t 1
        tmux send-keys "cd $WEB_DIR && npm run dev" C-m
        
        # Attach to session
        print_success "Starting tmux session..."
        print_info "Press Ctrl+B then D to detach"
        print_info "Reattach with: tmux attach -t zenvoyer"
        sleep 2
        tmux attach -t zenvoyer
        
    else
        print_warning "tmux not found, starting in separate terminals..."
        
        # Start backend
        if command_exists gnome-terminal; then
            gnome-terminal -- bash -c "cd $API_DIR && npm run start:dev; exec bash"
            gnome-terminal -- bash -c "cd $WEB_DIR && npm run dev; exec bash"
        elif command_exists xterm; then
            xterm -e "cd $API_DIR && npm run start:dev" &
            xterm -e "cd $WEB_DIR && npm run dev" &
        else
            print_error "No suitable terminal emulator found"
            print_info "Please run manually:"
            echo "  Terminal 1: cd $API_DIR && npm run start:dev"
            echo "  Terminal 2: cd $WEB_DIR && npm run dev"
        fi
    fi
}

show_running_services() {
    echo ""
    echo -e "${GREEN}"
    echo "╔════════════════════════════════════════════════╗"
    echo "║                                                ║"
    echo "║         Zenvoyer is now running! 🚀            ║"
    echo "║                                                ║"
    echo "╚════════════════════════════════════════════════╝"
    echo -e "${NC}\n"
    
    print_info "Services:"
    echo ""
    echo "  ${GREEN}Frontend:${NC}  ${BLUE}http://localhost:3000${NC}"
    echo "  ${GREEN}Backend:${NC}   ${BLUE}http://localhost:3001${NC}"
    echo ""
    
    if command_exists docker && docker ps | grep -q zenvoyer; then
        print_info "Management Tools:"
        echo ""
        echo "  ${GREEN}pgAdmin:${NC}         ${BLUE}http://localhost:5050${NC}"
        echo "  ${GREEN}Redis Commander:${NC} ${BLUE}http://localhost:8081${NC}"
        echo "  ${GREEN}Mailhog:${NC}         ${BLUE}http://localhost:8025${NC}"
        echo ""
    fi
    
    print_info "Logs:"
    echo ""
    echo "  Backend:  ${YELLOW}tail -f logs/backend.log${NC}"
    echo "  Frontend: ${YELLOW}tail -f logs/frontend.log${NC}"
    echo ""
    
    print_info "To stop services: ${YELLOW}./stop.sh${NC}"
    echo ""
}

# Create logs directory if it doesn't exist
mkdir -p logs

# Run main
main "$@"
