import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { logger, requestLogger } from "./logger";
import express from "express";
import compression from "compression";
import helmet from "helmet";
import cors from "cors";
import { setupSwagger } from "./swagger";
import { notFound, errorHandler } from "./middlewares/errorHandler.middleware";
import apiRoutes from "./routes/index";

export async function registerRoutes(app: Express): Promise<Server> {
  // Apply global middlewares
  app.use(cors());
  app.use(helmet());
  app.use(compression());
  app.use(requestLogger);

  // Setup Swagger documentation
  setupSwagger(app);

  // API routes
  app.use('/api/v1', apiRoutes);

  // Error handling middlewares
  app.use(notFound);
  app.use(errorHandler);

  logger.info('All routes registered successfully');

  const httpServer = createServer(app);

  return httpServer;
}
