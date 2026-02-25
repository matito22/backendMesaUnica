import { Documento } from "../../documento/entities/documento.entity";
import { Expediente } from "../../expediente/entities/expediente.entity";
import { UsuarioMunicipal } from "src/usuario-municipal/entities/usuario-municipal.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

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
    @JoinColumn({ name: 'id_expediente' })
    idExpediente: number;

    @ManyToOne(() => UsuarioMunicipal, {nullable: true})
    @JoinColumn({ name: 'id_usuario_municipal' })
    idUsuarioMunicipal: number;

    @ManyToOne(() => Documento, {nullable: true})
    @JoinColumn({ name: 'id_documento' })
    idDocumento:Documento

}