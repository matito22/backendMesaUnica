import { Expediente } from '../../expediente/entities/expediente.entity';
import { SectorMunicipal } from '../../sector-municipal/entities/sector-municipal.entity';
import {Entity, PrimaryGeneratedColumn,Column,ManyToOne,OneToMany,JoinColumn,} from 'typeorm';
import { RequisitoTipoExpediente } from '../../requisito-tipo-expediente/entities/requisito-tipo-expediente.entity';


@Entity('tipo_expediente')
export class TipoExpediente {
  @PrimaryGeneratedColumn({ name: 'id_tipo_expediente' })
  idTipoExpediente: number;

  // FK al sector que es responsable de revisar este tipo de trámite
  @Column({ name: 'id_sector_responsable' })
  idSectorResponsable: number;

  @ManyToOne(() => SectorMunicipal, { eager: false })
  @JoinColumn({ name: 'id_sector_responsable' })
  sectorResponsable: SectorMunicipal;

  @Column({ name: 'nombre', length: 100 })
  nombre: string;

  @Column({ name: 'descripcion', type: 'text', nullable: true })
  descripcion: string | null;

  // Definición dinámica del formulario que el ciudadano completa al iniciar el trámite
  @Column({ name: 'schema_formulario', type: 'json', nullable: true })
  schemaFormulario: Record<string, any> | null;

  @Column({ name: 'activo', type: 'tinyint', default: 1 })
  activo: boolean;

  // Relaciones inversas (útiles para joins, no se cargan por defecto)
  @OneToMany(() => RequisitoTipoExpediente,(requisito) => requisito.tipoExpediente)
  requisitos: RequisitoTipoExpediente[];

  @OneToMany(() => Expediente, (expediente) => expediente.idTipoExpediente)
  expedientes: Expediente[];
}