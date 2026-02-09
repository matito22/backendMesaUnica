import { RolUser } from "../../enum/rol-user";
import { SectorMunicipal } from "../../sector-municipal/entities/sector-municipal.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('usuario_municipal')
export class UsuarioMunicipal {

    @PrimaryGeneratedColumn({name:'id_usuario',type:'int'})
    idUsuario: number;


    @Column({name:'nombre',type:'varchar'})
    nombre: string;

    @Column({name:'email',type:'varchar',length:150,unique:true})
    email: string;

    @Column({name:'password',type:'varchar',length:255})
    password: string;

    @Column({name:'rol',type:'enum',enum:RolUser})
    rol: RolUser;

    @Column({name:'activo',type:'tinyint',width:1,default:true})
    activo:boolean;


    @ManyToOne(() => SectorMunicipal)
    @JoinColumn({ name: 'id_sector' })
    idSector: SectorMunicipal;


    @Column({ type: 'varchar', length: 500, nullable: true })
    currentHashedRefreshToken: string | null;

}
