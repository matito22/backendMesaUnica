import { Expediente } from 'src/expediente/entities/expediente.entity';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('datos_catastrales')
export class DatosCatastrales {

  @PrimaryGeneratedColumn({ name: 'id_datos_catastrales', type: 'int' })
  idDatosCatastrales: number;

  @Column({ name: 'circunscripcion', type: 'varchar', length: 100, nullable: true })
  circunscripcion: string | null;

  @Column({ name: 'seccion', type: 'varchar', length: 100, nullable: true })
  seccion: string | null;

  @Column({ name: 'fraccion', type: 'varchar', length: 100, nullable: true })
  fraccion: string | null;

  @Column({ name: 'chacra', type: 'varchar', length: 100, nullable: true })
  chacra: string | null;

  @Column({ name: 'quinta', type: 'varchar', length: 100, nullable: true })
  quinta: string | null;

  @Column({ name: 'manzana', type: 'varchar', length: 100, nullable: true })
  manzana: string | null;

  @Column({ name: 'parcela', type: 'varchar', length: 100, nullable: true })
  parcela: string | null;

  @Column({ name: 'uh_uf', type: 'varchar', length: 100, nullable: true })
  uhUf: string | null; // UH/UF

  @Column({ name: 'partida', type: 'varchar', length: 100, nullable: true })
  partida: string | null;

  @Column({ name: 'sup_terreno', type: 'decimal', precision: 12, scale: 2, nullable: true })
  supTerreno: number | null;

  @Column({ name: 'sup_local', type: 'decimal', precision: 12, scale: 2, nullable: true })
  supLocal: number | null; // superficie del local a habilitar / categorizar / anexar / modificar

  @OneToOne(()=>Expediente ,(expediente) => expediente.datosCatastrales)
  expediente: Expediente;

}
