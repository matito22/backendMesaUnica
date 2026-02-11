import { TipoDocumento } from "src/tipo-documento/entities/tipo-documento.entity";
import { UsuarioMunicipal } from "src/usuario-municipal/entities/usuario-municipal.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('sector_municipal')
export class SectorMunicipal {

    @PrimaryGeneratedColumn({name:'id_sector',type:'int'})
    idSector: number;

    @Column({name:'nombre',type:'varchar',length:100})
    nombre: string;

    @Column({name:'activo',type:'tinyint',width:1,default:true})
    activo:boolean;

    @OneToMany(() => UsuarioMunicipal, (usuarioMunicipal) => usuarioMunicipal.idSector,{eager:false})
    usuarios: UsuarioMunicipal[];

    @OneToMany(() => TipoDocumento, (tipoDocumento) => tipoDocumento.idSectorResponsable,{eager:false})
    tiposDocumento: TipoDocumento[];
}
