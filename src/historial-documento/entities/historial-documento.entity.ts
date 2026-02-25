
import { Documento } from '../../documento/entities/documento.entity';
import { UsuarioMunicipal } from '../../usuario-municipal/entities/usuario-municipal.entity';   
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('historial_documento')
export class HistorialDocumento {

    @PrimaryGeneratedColumn({ name: 'id_historial', type: 'int' })
    idHistorial: number;

    @Column({ name: 'estado_anterior', type: 'varchar', length: 50, nullable: true })
    estadoAnterior: string;

    @Column({ name: 'estado_nuevo', type: 'varchar', length: 50, nullable: true })
    estadoNuevo: string;

    @Column({ name: 'observacion', type: 'text', nullable: true })
    observacion: string;

    @Column({ name: 'fecha_cambio', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    fechaCambio: Date;

    // ✅ FK como @Column separado + relación @ManyToOne con su propio nombre y @JoinColumn
    @Column({ name: 'id_documento', type: 'int' })
    idDocumento: number;

    @ManyToOne(() => Documento, { onDelete: 'CASCADE', nullable: false })
    @JoinColumn({ name: 'id_documento' })
    documento: Documento;

    @Column({ name: 'id_usuario_actor', type: 'int', nullable: true })
    idUsuarioActor: number | null;

    @ManyToOne(() => UsuarioMunicipal, { nullable: true })
    @JoinColumn({ name: 'id_usuario_actor' })
    usuarioActor: UsuarioMunicipal | null;
}