import { RolUser } from "../../enum/rol-user";
import { SectorMunicipal } from "../../sector-municipal/entities/sector-municipal.entity";
import { Column, Entity, Generated, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('usuario_municipal')
export class UsuarioMunicipal {

    @PrimaryGeneratedColumn({name:'id_usuario',type:'int'})
    idUsuario: number;

     @Column({ name: 'slug', type: 'varchar', length: 36, unique: true })
    @Generated('uuid')
    slug: string;
    

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


    @Column({ name: 'id_sector', type: 'int' })
    idSector: number; //FK plana, esto es lo que va al JWT

    @ManyToOne(() => SectorMunicipal)
    @JoinColumn({ name: 'id_sector' })
    sector: SectorMunicipal;


    @Column({ name:"current_hashed_refresh_token",type: 'varchar', length: 500, nullable: true })
    currentHashedRefreshToken: string | null;

    @Column({ name: 'activation_token', type: 'varchar', length: 255, nullable: true })
    activationToken: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true, default: null })
    reset_password_token: string | null;

    @Column({ type: 'datetime', nullable: true, default: null })
    reset_password_expires: Date | null;
}
