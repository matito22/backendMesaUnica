import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppConfigService } from "./app.config.service";

//Módulo de configuración de la aplicación

@Module({
     imports : [ConfigModule.forRoot({ isGlobal: true })],//Solo hace global a config module
     //  appconfigservice para ser usado en otros modulos debe importar appconfigmodule
    providers : [AppConfigService],
    exports : [AppConfigService],//exporta el servicio para que pueda ser usado en otros módulos
})
export class AppConfigModule{}
