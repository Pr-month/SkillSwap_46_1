import { BusinessException } from '@/common/errors/business.exception';
import { exceptionCodes } from '@/common/errors/error-codes';
import {
  Controller,
  HttpStatus,
  Post,
  Logger,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import { S3Service } from './s3.service';


const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
const UPLOAD_FOLDER = 'images';
const UPLOAD_FIELD_NAME = 'image';

@Controller('upload')
export class S3Controller {
  private readonly logger = new Logger(S3Controller.name);

  constructor(private readonly s3Service: S3Service) {}

  @Post()
  @UseInterceptors(
    FileInterceptor(UPLOAD_FIELD_NAME, {
      storage: memoryStorage(),
      limits: {
        fileSize: MAX_IMAGE_SIZE,
      },
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    this.validateFile(file);

    try {
      const result = await this.s3Service.uploadFile(file, {
        folder: UPLOAD_FOLDER,
      });

      return {
        url: result.url,
        filename: result.filename,
        size: result.size,
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Unknown upload error';

      const stack =
        error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Ошибка при загрузке файла: ${message}`,
        stack,
      );

      throw new BusinessException(
        exceptionCodes.upload.uploadFailed,
        HttpStatus.INTERNAL_SERVER_ERROR,
        { error: message },
      );
    }
  }
    private validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BusinessException(
        exceptionCodes.upload.fileRequired,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype as (typeof ALLOWED_IMAGE_TYPES)[number])) {
      throw new BusinessException(
        exceptionCodes.upload.invalidImageType,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}