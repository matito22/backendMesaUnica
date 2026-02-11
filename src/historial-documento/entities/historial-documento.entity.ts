import { Documento } from "src/documento/entities/documento.entity";
import { UsuarioMunicipal } from "src/usuario-municipal/entities/usuario-municipal.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('historial_documento')
export class HistorialDocumento {

    @PrimaryGeneratedColumn({name: 'id_historial', type: 'int'})
    idHistorial: number;

    @Column({name: 'estado_anterior', type: 'varchar', length: 50, nullable: true})
    estadoAnterior: string;

    @Column({name: 'estado_nuevo', type: 'varchar', length: 50, nullable: true})
    estadoNuevo: string;

    @Column({name: 'observacion', type: 'text', nullable: true})
    observacion: string;

    @Column({name: 'fecha_cambio', type: 'datetime', default: () => 'CURRENT_TIMESTAMP'})
    fechaCambio: Date;

    @ManyToOne(() => Documento, {onDelete: 'CASCADE'})
    @Column({name: 'id_documento', type: 'int'})
    idDocumento: number;

    @ManyToOne(() => UsuarioMunicipal, {nullable: true})
    @Column({name: 'id_usuario_actor', type: 'int', nullable: true})
    idUsuarioActor: number;
}