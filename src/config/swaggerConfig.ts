import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

// Swagger definition
const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Oderly Backend",
    version: "1.0.0",
    description: "Oderly API documentation",
  },
  servers: [
    {
      url: "http://localhost:3000", 
      description: "Local server",
    },
  ],
};

const options: swaggerJSDoc.Options = {
  definition: swaggerDefinition,
  apis: ["src/controllers/*.ts"], 
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app: Express) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log("Swagger docs available at: http://localhost:3000/api-docs");
};
