# ==============================================================================
# Stage 1: Build all packages
# ==============================================================================
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files for dependency installation
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/backend/package.json packages/backend/
COPY packages/frontend/package.json packages/frontend/

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY tsconfig.base.json ./
COPY packages/shared/ packages/shared/
COPY packages/backend/ packages/backend/
COPY packages/frontend/ packages/frontend/

# Build shared types first, then backend and frontend
RUN npm run build --workspace=packages/shared && \
    npm run build --workspace=packages/backend && \
    VITE_API_URL= npm run build --workspace=packages/frontend

# ==============================================================================
# Stage 2: Backend runtime
# ==============================================================================
FROM node:18-alpine AS backend

RUN apk add --no-cache ffmpeg

WORKDIR /app

# Copy all workspace package.json files (npm requires all workspaces present)
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/backend/package.json packages/backend/
COPY packages/frontend/package.json packages/frontend/

# Install production dependencies only
RUN npm ci --omit=dev

# Copy built output from build stage
COPY --from=build /app/packages/shared/dist packages/shared/dist
COPY --from=build /app/packages/backend/dist packages/backend/dist

EXPOSE 3000

# Ensure media directories exist on startup, then run the server
CMD ["sh", "-c", "mkdir -p /media/data/uploads /media/data/frames /media/data/bird-images /media/watch-folder /media/logs && node packages/backend/dist/index.js"]

# ==============================================================================
# Stage 3: Frontend (nginx)
# ==============================================================================
FROM nginx:alpine AS frontend

# Copy built frontend assets
COPY --from=build /app/packages/frontend/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
