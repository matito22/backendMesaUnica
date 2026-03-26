import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Expediente } from 'src/expediente/entities/expediente.entity';
import { Documento } from 'src/documento/entities/documento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Expediente,Documento])],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
