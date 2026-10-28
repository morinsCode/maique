# Built from the repo root, because backend and frontend both import ../shared.

# Stage 1: build the frontend into static files.
FROM node:22-alpine AS frontend
WORKDIR /app
COPY shared ./shared
COPY frontend/package.json frontend/package-lock.json ./frontend/
RUN cd frontend && npm ci
COPY frontend ./frontend
RUN cd frontend && npm run build

# Stage 2: the backend, which also serves the built frontend.
FROM node:22-alpine
WORKDIR /app
COPY shared ./shared
COPY backend/package.json backend/package-lock.json ./backend/
# Includes devDependencies: tsx runs the TypeScript directly (no compile step).
RUN cd backend && npm ci
COPY backend ./backend
COPY --from=frontend /app/frontend/dist ./frontend/dist

ENV STATIC_DIR=/app/frontend/dist
WORKDIR /app/backend
EXPOSE 3000
CMD ["npm", "start"]
