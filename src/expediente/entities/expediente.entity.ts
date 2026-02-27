import { Contribuyente } from "src/contribuyente/entities/contribuyente.entity";
import { Documento } from "src/documento/entities/documento.entity";
import { EstadoExpediente } from "src/enum/estado-expediente";
import { TipoExpediente } from "src/tipo-expediente/entities/tipo-expediente.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('expediente')
export class Expediente {

    @PrimaryGeneratedColumn({ name: 'id_expediente', type: 'int' })
    idExpediente: number;

    @Column({ name: 'numero_gde', type: 'varchar', length: 50, unique: true })
    numeroGde: string;

    @Column({ name: 'datos_formulario', type: 'json', nullable: true })
    datosFormulario: Record<string, any> | null;

    
    @Column({ name: 'estado', type: 'enum', enum: EstadoExpediente, default: EstadoExpediente.INICIADO })
    estado: EstadoExpediente;

    @Column({ name: 'fecha_creacion', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    fechaCreacion: Date;

    @Column({ name: 'fecha_finalizacion', type: 'datetime', nullable: true })
    fechaFinalizacion: Date | null;



    @ManyToOne(() => Contribuyente, { nullable: false })
    @JoinColumn({ name: 'id_contribuyente' })
    contribuyente: Contribuyente;


    @ManyToOne(() => TipoExpediente, { nullable: false })
    @JoinColumn({ name: 'id_tipo_expediente' })
    tipoExpediente: TipoExpediente;

 

    @ManyToOne(() => Expediente, { nullable: true })
    @JoinColumn({ name: 'id_expediente_padre' })
    expedientePadre: Expediente | null;

    @OneToMany(() => Documento, (documento) => documento.expediente)
    documentos: Documento[];
}