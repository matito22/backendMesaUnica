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
            host: this.configService.get<string>('DB_HOST', 'localhost'),
            port: this.configService.get<number>('DB_PORT', 3306),
            username: this.configService.get<string>('DB_USERNAME', 'root'),
            password: this.configService.get<string>('DB_PASSWORD', '1234'),
            database: this.configService.get<string>('DB_NAME', 'gestion_expedientes_muni'), 
            autoLoadEntities: true,
            synchronize: false,
    
        };
    }

   

    
}
