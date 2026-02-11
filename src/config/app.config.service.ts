import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

//Servicio de configuración de la aplicación
@Injectable()
export class AppConfigService {
    constructor(private configService: ConfigService) {}

    getPort(): number {
        const port= this.configService.get<number>('PORT');
        if (!port) {
            throw new Error('PORT is not defined in environment variables');
        } 
        return port;
    }

    getDatabaseConfig() {
        return {
            type: 'mysql' as const,
            host: this.configService.get<string>('DB_HOST'),
            port: this.configService.get<number>('DB_PORT'),
            username: this.configService.get<string>('DB_USERNAME'),
            password: this.configService.get<string>('DB_PASSWORD'),
            database: this.configService.get<string>('DB_NAME'), 
            autoLoadEntities: true,
            synchronize: false,
    
        };
    }

   

    
}
