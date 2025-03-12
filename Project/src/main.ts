import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import admin from "firebase-admin";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const swaggerConfig = new DocumentBuilder()
        .setTitle("Plant API")
        .setDescription("for plant")
        .setVersion("1.0")
        .addSecurity("access-token", {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT"
        })
        .addSecurity("refresh-token", {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT"
        })
        .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);

    SwaggerModule.setup("private/api-docs", app, document);
    admin.initializeApp({
        credential: admin.credential.cert(__dirname + "/../../firebase.config.json"),
    });
    await app.listen(8080, "127.0.0.1");

    console.log("Application is running on: http://localhost:8080");
}
bootstrap();
