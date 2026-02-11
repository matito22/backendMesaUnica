import { SectorMunicipal } from "src/sector-municipal/entities/sector-municipal.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('tipo_documento')
export class TipoDocumento {

    @PrimaryGeneratedColumn({name:'id_tipo_documento',type:'int'})
    idTipoDocumento: number;

    @Column({name:'nombre',type:'varchar',length:100})
    nombre: string;

    @Column({name:'descripcion',type:'varchar',length:255})
    descripcion: string;

    @Column({name:'es_obligatorio',type:'tinyint',width:1,default:false})
    esObligatorio:boolean;

    @Column({name:'activo',type:'tinyint',width:1,default:true})
    activo:boolean;

    @ManyToOne(() => SectorMunicipal)
    @JoinColumn({ name: 'id_sector_responsable'})
    idSectorResponsable: SectorMunicipal;

}
