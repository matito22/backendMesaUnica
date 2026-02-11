import { EstadoDocumento } from "src/enum/estado-documento";
import { Expediente } from "src/expediente/entities/expediente.entity";
import { TipoDocumento } from "src/tipo-documento/entities/tipo-documento.entity";
import { UsuarioMunicipal } from "src/usuario-municipal/entities/usuario-municipal.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('documento')
export class Documento {

    @PrimaryGeneratedColumn({name: 'id_documento', type: 'int'})
    idDocumento: number;

    @Column({name: 'nombre_archivo_original', type: 'varchar', length: 255, nullable: true})
    nombreArchivoOriginal: string;

    @Column({name: 'ruta_almacenamiento', type: 'varchar', length: 500, nullable: true})
    rutaAlmacenamiento: string;

    @Column({name: 'tipo_mime', type: 'varchar', length: 50, nullable: true})
    tipoMime: string;

    @Column({name: 'peso_kb', type: 'int', nullable: true})
    pesoKb: number;

    @Column({name: 'estado', type: 'enum', enum: EstadoDocumento, default: EstadoDocumento.PENDIENTE_CARGA})
    estado: EstadoDocumento;

    @Column({name: 'fecha_ultima_carga', type: 'datetime', nullable: true})
    fechaUltimaCarga: Date;


    @Column({name: 'fecha_revision', type: 'datetime', nullable: true})
    fechaRevision: Date;

    @Column({name: 'observacion_actual', type: 'text', nullable: true})
    observacionActual: string;

    @ManyToOne(() => Expediente)
    @Column({name: 'id_expediente', type: 'int'})
    idExpediente: number;

    @ManyToOne(() => TipoDocumento)
    @Column({name: 'id_tipo_documento', type: 'int'})
    idTipoDocumento: number;

    @ManyToOne(() => UsuarioMunicipal, {nullable: true})
    @Column({name: 'id_usuario_revisor', type: 'int', nullable: true})
    idUsuarioRevisor: number;
}