import { Exclude } from "class-transformer";
import { Column, Entity, Generated, PrimaryGeneratedColumn } from "typeorm";

@Entity('contribuyente')
export class Contribuyente {

    @PrimaryGeneratedColumn({name:'id_contribuyente',type:'int'})
    idContribuyente: number;


    @Column({name:'nombre',type:'varchar',length:100})
    nombre: string;

    @Column({name:'slug',type:'varchar',length:36,unique:true})
    @Generated('uuid')
    slug: string;

    @Column({name:'dni',type:'varchar',length:20})
    dni: string;

    @Column({name:'apellido',type:'varchar',length:100})
    apellido: string;

    @Column({name:'email',type:'varchar',length:150})
    email: string;

    // @Exclude() hace que class-transformer no incluya este campo en la respuesta JSON
    // Para que funcione, el main.ts necesita: app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))
    @Exclude()
    @Column({name:'password',type:'varchar',length:255})
    password: string;

    @Column({name:'activo',type:'tinyint',width:1,default:true})
    activo:boolean;

    @Column({name:'fecha_registro',type:'datetime',default:'CURRENT_TIMESTAMP'})
    fechaRegistro: Date;

    @Column({ name: 'activation_token', type: 'varchar', length: 255, nullable: true })
    activationToken: string | null;

    @Column({ name:"current_hashed_refresh_token",type: 'varchar', length: 500, nullable: true })
    currentHashedRefreshToken: string | null;


    @Column({ type: 'varchar', length: 255, nullable: true, default: null })
    reset_password_token: string | null;

    @Column({ type: 'datetime', nullable: true, default: null })
    reset_password_expires: Date | null;

}
