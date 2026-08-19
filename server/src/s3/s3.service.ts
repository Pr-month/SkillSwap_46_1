import { ConfigurationService } from '@/module/configuration/configuration.service';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

export interface S3UploadResult {
  url: string;
  key: string;
  filename: string;
  size: number;
  etag?: string;
}

@Injectable()
export class S3Service {
  private readonly bucket: string;
  private readonly endpoint: string;

  constructor(
    private configurationService: ConfigurationService,
    private s3Client: S3Client,
  ) {
    this.bucket = this.configurationService.s3Bucket;
    this.endpoint = this.configurationService.s3Endpoint;
  }

  async uploadFile(
    file: Express.Multer.File,
    options: { folder: string },
  ): Promise<S3UploadResult> {
    const key = this.generateKey(file.originalname, options.folder);

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
    });

    const result = await this.s3Client.send(command);

    return {
      url: this.getPublicUrl(key),
      key,
      filename: key.split('/').pop()!,
      size: file.size,
      etag: result.ETag,
    };
  }

  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.s3Client.send(command);
  }

  async getPresignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn });
  }

  private generateKey(originalName: string, folder: string): string {
    const sanitized = originalName.replace(/[^a-zA-Z0-9.]/g, '_');
    const uuid = randomUUID().slice(0, 8);
    const timestamp = Date.now();

    return `${folder}/${timestamp}-${uuid}-${sanitized}`;
  }

  private getPublicUrl(key: string): string {
    return `${this.endpoint}/${this.bucket}/${key}`;
  }
}
