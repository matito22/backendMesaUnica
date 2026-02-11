import { Contribuyente } from "src/contribuyente/entities/contribuyente.entity";
import { EstadoExpediente } from "src/enum/estado-expediente";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";


@Entity('expediente')
export class Expediente {

    @PrimaryGeneratedColumn({name: 'id_expediente', type: 'int'})
    idExpediente: number;

    @Column({name: 'numero_gde', type: 'varchar', length: 50, unique: true})
    numeroGde: string;

    @Column({name: 'estado', type: 'enum', enum: EstadoExpediente, default: EstadoExpediente.EN_REVISION})
    estado: EstadoExpediente;

    @Column({name: 'fecha_creacion', type: 'datetime', default: () => 'CURRENT_TIMESTAMP'})
    fechaCreacion: Date;

    @Column({name: 'fecha_finalizacion', type: 'datetime', nullable: true})
    fechaFinalizacion: Date;

    @ManyToOne(() => Contribuyente)
    @Column({name: 'id_contribuyente', type: 'int'})
    idContribuyente: number;
}