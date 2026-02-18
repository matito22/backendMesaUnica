import { Documento } from "../../documento/entities/documento.entity";
import { Expediente } from "../../expediente/entities/expediente.entity";
import { UsuarioMunicipal } from "src/usuario-municipal/entities/usuario-municipal.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('mensaje')
export class Mensaje {

    @PrimaryGeneratedColumn({name: 'id_mensaje', type: 'int'})
    idMensaje: number;

    @Column({name: 'contenido', type: 'text'})
    contenido: string;

    @Column({name: 'fecha_envio', type: 'datetime', default: () => 'CURRENT_TIMESTAMP'})
    fechaEnvio: Date;

    @Column({name: 'leido', type: 'tinyint', width: 1, default: false})
    leido: boolean;

    @ManyToOne(() => Expediente)
    @Column({name: 'id_expediente', type: 'int'})
    idExpediente: number;

    @ManyToOne(() => UsuarioMunicipal, {nullable: true})
    @Column({name: 'id_usuario_municipal', type: 'int', nullable: true})
    idUsuarioMunicipal: number;

    @ManyToOne(() => Documento, {nullable: true})
    @Column({name: 'id_documento', type: 'int'})
    idDocumento:Documento

}