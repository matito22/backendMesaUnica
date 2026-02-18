import { TipoDocumento } from '../../tipo-documento/entities/tipo-documento.entity';
import { TipoExpediente } from '../../tipo-expediente/entities/tipo-expediente.entity';
import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';


@Entity('requisito_tipo_expediente')
export class RequisitoTipoExpediente {

  @PrimaryColumn({ name: 'id_tipo_expediente' })
  idTipoExpediente: number;

  @PrimaryColumn({ name: 'id_tipo_documento' })
  idTipoDocumento: number;


  @Column({ name: 'es_obligatorio', type: 'tinyint', default: 1 })
  esObligatorio: boolean;


  @ManyToOne(() => TipoExpediente, (tipo) => tipo.requisitos, { eager: false })
  @JoinColumn({ name: 'id_tipo_expediente' })
  tipoExpediente: TipoExpediente;


  @ManyToOne(() => TipoDocumento, (doc) => doc.requisitos, { eager: false })
  @JoinColumn({ name: 'id_tipo_documento' })
  tipoDocumento: TipoDocumento;
}