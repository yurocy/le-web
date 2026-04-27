.PHONY: build run test docker clean migrate

# Go parameters
BINARY_NAME=le-server
GO=go
DOCKER_IMAGE=le-go

# Build the binary
build:
	CGO_ENABLED=0 $(GO) build -o bin/$(BINARY_NAME) ./cmd/server

# Run the application
run: build
	./bin/$(BINARY_NAME) -config configs/config.yaml

# Run in development mode (with hot reload if air is installed)
dev:
	air -c .air.toml || $(GO) run ./cmd/server -config configs/config.yaml

# Run tests
test:
	$(GO) test -v ./... -cover

# Docker build
docker:
	docker build -t $(DOCKER_IMAGE):latest .
	docker build -t $(DOCKER_IMAGE):$(shell git rev-parse --short HEAD 2>/dev/null || echo dev) .

# Docker compose up
docker-up:
	docker-compose up -d

# Docker compose down
docker-down:
	docker-compose down

# Clean build files
clean:
	rm -rf bin/
	rm -f $(BINARY_NAME)

# Database migration (auto migrate using GORM)
migrate:
	$(GO) run ./cmd/server -config configs/config.yaml -migrate

# Generate swagger docs (if swag is installed)
swagger:
	swag init -g cmd/server/main.go -o docs

# Code formatting
fmt:
	$(GO) fmt ./...

# Lint
lint:
	golangci-lint run ./...

# Build all dependencies
deps:
	$(GO) mod tidy
	$(GO) mod download
