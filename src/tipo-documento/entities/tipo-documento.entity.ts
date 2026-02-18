import { RequisitoTipoExpediente } from "../../requisito-tipo-expediente/entities/requisito-tipo-expediente.entity";
import { SectorMunicipal } from "../../sector-municipal/entities/sector-municipal.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('tipo_documento')
export class TipoDocumento {

    @PrimaryGeneratedColumn({name:'id_tipo_documento',type:'int'})
    idTipoDocumento: number;

    @Column({name:'nombre',type:'varchar',length:100})
    nombre: string;

    @Column({name:'descripcion',type:'text'})
    descripcion: string;

    @Column({name:'activo',type:'tinyint',width:1,default:true})
    activo:boolean;

    @ManyToOne(() => SectorMunicipal)
    @JoinColumn({ name: 'id_sector_responsable'})
    idSectorResponsable: SectorMunicipal;

    @OneToMany(() => RequisitoTipoExpediente, (requisito) => requisito.tipoDocumento, { eager: false })
    requisitos: RequisitoTipoExpediente[];

}
