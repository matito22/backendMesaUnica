import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('contribuyente')
export class Contribuyente {

    @PrimaryGeneratedColumn({name:'id_contribuyente',type:'int'})
    idContribuyente: number;


    @Column({name:'nombre',type:'varchar',length:100})
    nombre: string;

    @Column({name:'dni',type:'varchar',length:20})
    dni: string;

    @Column({name:'apellido',type:'varchar',length:100})
    apellido: string;

    @Column({name:'email',type:'varchar',length:150})
    email: string;

    @Column({name:'password',type:'varchar',length:255})
    password: string;

    @Column({name:'activo',type:'tinyint',width:1,default:true})
    activo:boolean;

    @Column({name:'fecha_registro',type:'datetime',default:'CURRENT_TIMESTAMP'})
    fechaRegistro: Date;

    //FALTA RELAICON ONE TO MANY CON TIPO DE EXPEDIENTE

}
