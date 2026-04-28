SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ###############################################################
-- BASE DE DATOS: GESTION DE EXPEDIENTES MUNICIPALES (MESA UNICA)
-- ###############################################################
CREATE DATABASE IF NOT EXISTS `gestion_expedientes_muni` 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `gestion_expedientes_muni`;

-- 1. Tabla: SectorMunicipal
CREATE TABLE `sector_municipal` (
  `id_sector` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `activo` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id_sector`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabla: UsuarioMunicipal
CREATE TABLE `usuario_municipal` (
  `id_usuario` int(11) NOT NULL AUTO_INCREMENT,
  `id_sector` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rol` ENUM('ADMIN', 'MESA_ENTRADA', 'REVISOR') NOT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `current_hashed_refresh_token` varchar(500) DEFAULT NULL,
  `reset_password_token` varchar(255) DEFAULT NULL,
  `reset_password_expires` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `uk_usuario_email` (`email`),
  CONSTRAINT `fk_usuario_sector` FOREIGN KEY (`id_sector`) REFERENCES `sector_municipal` (`id_sector`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabla: Contribuyente
CREATE TABLE `contribuyente` (
  `id_contribuyente` int(11) NOT NULL AUTO_INCREMENT,
  `dni` varchar(20) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `fecha_registro` datetime DEFAULT CURRENT_TIMESTAMP,
  `activation_token` varchar(255) DEFAULT NULL UNIQUE,//Token de activación
  `current_hashed_refresh_token` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id_contribuyente`),
  UNIQUE KEY `uk_contribuyente_dni` (`dni`),
  UNIQUE KEY `uk_contribuyente_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Tabla: TipoExpediente
CREATE TABLE `tipo_expediente` (
  `id_tipo_expediente` int(11) NOT NULL AUTO_INCREMENT,
  `id_sector_responsable` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text,
  `schema_formulario` JSON,
  `activo` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id_tipo_expediente`),
  CONSTRAINT `fk_tipoexp_sector` FOREIGN KEY (`id_sector_responsable`) REFERENCES `sector_municipal` (`id_sector`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Tabla: TipoDocumento
CREATE TABLE `tipo_documento` (
  `id_tipo_documento` int(11) NOT NULL AUTO_INCREMENT,
  `id_sector_responsable` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text,
  `activo` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id_tipo_documento`),
  CONSTRAINT `fk_tipodoc_sector` FOREIGN KEY (`id_sector_responsable`) REFERENCES `sector_municipal` (`id_sector`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Tabla: RequisitoTipoExpediente
CREATE TABLE `requisito_tipo_expediente` (
  `id_tipo_expediente` int(11) NOT NULL,
  `id_tipo_documento` int(11) NOT NULL,
  `es_obligatorio` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id_tipo_expediente`, `id_tipo_documento`),
  CONSTRAINT `fk_req_tipoexp` FOREIGN KEY (`id_tipo_expediente`) REFERENCES `tipo_expediente` (`id_tipo_expediente`),
  CONSTRAINT `fk_req_tipodoc` FOREIGN KEY (`id_tipo_documento`) REFERENCES `tipo_documento` (`id_tipo_documento`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Tabla: Expediente
CREATE TABLE `expediente` (
  `id_expediente` int(11) NOT NULL AUTO_INCREMENT,
  `id_contribuyente` int(11) NOT NULL,
  `id_tipo_expediente` int(11) NOT NULL,
  `id_expediente_padre` int(11) DEFAULT NULL,
  `numero_gde` varchar(50) NOT NULL,
  `datos_formulario` JSON,
  `estado` ENUM('INICIADO', 'EN_REVISION', 'PENDIENTE_RESUBIDA', 'APROBADO', 'FINALIZADO', 'RECHAZADO') DEFAULT 'INICIADO',
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `fecha_finalizacion` datetime DEFAULT NULL,
  PRIMARY KEY (`id_expediente`),
  UNIQUE KEY `uk_expediente_gde` (`numero_gde`),
  CONSTRAINT `fk_expediente_contribuyente` FOREIGN KEY (`id_contribuyente`) REFERENCES `contribuyente` (`id_contribuyente`),
  CONSTRAINT `fk_expediente_tipo` FOREIGN KEY (`id_tipo_expediente`) REFERENCES `tipo_expediente` (`id_tipo_expediente`),
  CONSTRAINT `fk_expediente_padre` FOREIGN KEY (`id_expediente_padre`) REFERENCES `expediente` (`id_expediente`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Tabla: Documento
CREATE TABLE `documento` (
  `id_documento` int(11) NOT NULL AUTO_INCREMENT,
  `id_expediente` int(11) NOT NULL,
  `id_tipo_documento` int(11) NOT NULL,
  `nombre_archivo` varchar(255) NOT NULL,
  `ruta_almacenamiento` varchar(500) NOT NULL,
  `tipo_mime` varchar(50),
  `peso_kb` int(11),
  `estado` ENUM('PENDIENTE_CARGA', 'CARGADO', 'EN_REVISION', 'APROBADO', 'PENDIENTE_RESUBIDA') DEFAULT 'PENDIENTE_CARGA',
  `id_usuario_revisor` int(11) DEFAULT NULL,
  `fecha_ultima_carga` datetime DEFAULT NULL,
  `fecha_revision` datetime DEFAULT NULL,
  `observacion_actual` text,
  `slug` varchar(36) NOT NULL UNIQUE,
  `es_version_vigente` tinyint(1) DEFAULT 0,
  `numero_version` int(11) DEFAULT 0,
  `nombre_archivo_correccion` varchar(255) DEFAULT NULL,
  `ruta_correccion` varchar(500) DEFAULT NULL,
  `tipo_mime_correccion` varchar(50) DEFAULT NULL,
  `peso_kb_correccion` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_documento`),
  CONSTRAINT `fk_documento_expediente` FOREIGN KEY (`id_expediente`) REFERENCES `expediente` (`id_expediente`),
  CONSTRAINT `fk_documento_tipodoc` FOREIGN KEY (`id_tipo_documento`) REFERENCES `tipo_documento` (`id_tipo_documento`),
  CONSTRAINT `fk_documento_revisor` FOREIGN KEY (`id_usuario_revisor`) REFERENCES `usuario_municipal` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Tabla: HistorialDocumento
CREATE TABLE `historial_documento` (
  `id_historial` int(11) NOT NULL AUTO_INCREMENT,
  `id_documento` int(11) NOT NULL,
  `id_usuario_actor` int(11) DEFAULT NULL,
  `estado_anterior` varchar(50),
  `estado_nuevo` varchar(50),
  `observacion` text,
  `fecha_cambio` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_historial`),
  CONSTRAINT `fk_historial_doc` FOREIGN KEY (`id_documento`) REFERENCES `documento` (`id_documento`) ON DELETE CASCADE,
  CONSTRAINT `fk_historial_actor` FOREIGN KEY (`id_usuario_actor`) REFERENCES `usuario_municipal` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Tabla: Mensaje
CREATE TABLE `mensaje` (
  `id_mensaje` int(11) NOT NULL AUTO_INCREMENT,
  `id_expediente` int(11) NOT NULL,
  `id_documento` int(11) DEFAULT NULL,
  `id_usuario_municipal` int(11) DEFAULT NULL,
  `contenido` text NOT NULL,
  `fecha_envio` datetime DEFAULT CURRENT_TIMESTAMP,
  `leido` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id_mensaje`),
  CONSTRAINT `fk_mensaje_expediente` FOREIGN KEY (`id_expediente`) REFERENCES `expediente` (`id_expediente`),
  CONSTRAINT `fk_mensaje_documento` FOREIGN KEY (`id_documento`) REFERENCES `documento` (`id_documento`),
  CONSTRAINT `fk_mensaje_usuario` FOREIGN KEY (`id_usuario_municipal`) REFERENCES `usuario_municipal` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



CREATE TABLE `datos_catastrales` (
  `id_datos_catastrales` INT NOT NULL AUTO_INCREMENT,
  `circunscripcion`      VARCHAR(100) NULL,
  `seccion`              VARCHAR(100) NULL,
  `fraccion`             VARCHAR(100) NULL,
  `chacra`               VARCHAR(100) NULL,
  `quinta`               VARCHAR(100) NULL,
  `manzana`              VARCHAR(100) NULL,
  `parcela`              VARCHAR(100) NULL,
  `uh_uf`                VARCHAR(100) NULL,
  `partida`              VARCHAR(100) NULL,
  `sup_terreno`          DECIMAL(12, 2) NULL,
  `sup_local`            DECIMAL(12, 2) NULL,
  PRIMARY KEY (`id_datos_catastrales`)
);ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- SE AGREGO ESTA ALTERACION A LA TABLA EXPEDIENTE
ALTER TABLE `expediente`
  ADD COLUMN `id_datos_catastrales` INT NULL UNIQUE,
  ADD CONSTRAINT `FK_expediente_datos_catastrales`
    FOREIGN KEY (`id_datos_catastrales`)
    REFERENCES `datos_catastrales` (`id_datos_catastrales`)
    ON DELETE SET NULL;

-- ###############################################################
-- DATOS SEMILLA (Basados en el documento de requerimientos)
-- ###############################################################

-- Sectores
INSERT INTO `sector_municipal` (`id_sector`, `nombre`) VALUES
(1, 'Mesa de Entrada'),
(2, 'Catastro'),
(3, 'Infraestructura'),
(4, 'Planeamiento'),
(5, 'Medio Ambiente'),
(6, 'Obras Hidricas'),
(7, 'Obras Particulares');

-- Tipos de Expediente
INSERT INTO `tipo_expediente` (`id_tipo_expediente`, `id_sector_responsable`, `nombre`, `descripcion`) VALUES
(1, 7, 'Carpeta de Obra', 'Expediente principal de obra. Revisado por Obras Particulares.'),
(2, 4, 'Certificado de Zonificacion', 'Revisado y aprobado por Planeamiento.'),
(3, 4, 'Prefactibilidad', 'Revisado por Planeamiento. Requiere Zonificacion aprobada.'),
(4, 5, 'No Impacto Ambiental', 'Revisado por Medio Ambiente.');

-- Tipos de Documento
INSERT INTO `tipo_documento` (`id_tipo_documento`, `id_sector_responsable`, `nombre`) VALUES
-- Documentos para Carpeta de Obra
(1, 2, 'Nota con requerimiento e identificacion Catastral'),
(2, 2, 'Croquis de la manzana'),
(3, 2, 'Acreditacion de titularidad de Dominio'),
(4, 7, 'Plano de obra (DWG/DXF/ZIP)'),
(5, 7, 'Plano de antecedentes'),
(6, 7, 'Plano de Anteproyecto'),
-- Documentos para Zonificacion
(7, 4, 'Plano antecedente aprobado / croquis y plancheta'),
(8, 4, 'Copia de Escritura / Contrato de Locacion'),
(9, 4, 'Nota de Autorizacion (gestor)'),
(10, 4, 'Copia D.N.I. titular'),
(11, 4, 'Memoria descriptiva de tareas'),
(12, 4, 'Inscripcion a ARBA'),
-- Documentos para Prefactibilidad
(13, 4, 'Certificado de Zonificacion (PDF Aprobado)'),
(14, 4, 'Nota de solicitud al Intendente'),
(15, 4, 'Plano de Perquisicion / Forestacion'),
(16, 4, 'Volumetria'),
-- Documentos para Medio Ambiente
(17, 5, 'Nota simple de solicitud de emision'),
(18, 5, 'Fotos del frente y arbolado'),
(19, 5, 'Croquis de arbolado existente'),
(20, 5, 'DDJJ Gestion de Residuos');
(22, 5, 'Escaneo D.N.I. titular')


--TODOS LOS DOCUMENTOS SE LES AGREGO CON ID 21 LA HOJA ESCANEADA DONDE SE DA DE ALTA EL EXPEDIENTE 


-- Requisitos por Tipo de Expediente
INSERT INTO `requisito_tipo_expediente` (`id_tipo_expediente`, `id_tipo_documento`, `es_obligatorio`) VALUES
-- Requisitos Carpeta de Obra
(1, 1, 1), (1, 2, 1), (1, 3, 1), (1, 4, 1), (1, 5, 0), (1, 6, 1),
-- Requisitos Zonificacion
(2, 7, 1), (2, 8, 1), (2, 9, 1), (2, 10, 1), (2, 11, 1), (2, 12, 0),
-- Requisitos Prefactibilidad
(3, 13, 1), (3, 14, 1), (3, 15, 1),(3, 16, 1),
-- Requisitos Medio Ambiente
(4, 17, 1), (4, 18, 1), (4, 19, 1), (4, 20, 1),(4, 22, 1);

SET FOREIGN_KEY_CHECKS = 1;
