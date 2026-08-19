import { ConfigurationService } from '@/module/configuration/configuration.service';
import { S3Service } from '@/s3/s3.service';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';

jest.mock('@aws-sdk/s3-request-presigner');
jest.mock('crypto', () => ({
  randomUUID: jest.fn(),
}));

const mockedRandomUUID = randomUUID as jest.Mock;

describe('S3Service', () => {
  let service: S3Service;

  const mockS3Client = {
    send: jest.fn(),
  };

  const mockConfigService = {
    s3Bucket: 'test-bucket',
    s3Endpoint: 'https://s3.test-storage.ru',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        S3Service,
        {
          provide: S3Client,
          useValue: mockS3Client,
        },
        {
          provide: ConfigurationService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<S3Service>(S3Service);

    jest.clearAllMocks();
    jest.spyOn(Date, 'now').mockReturnValue(1739000000000);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadFile', () => {
    const mockFile = {
      buffer: Buffer.from('test-image-content'),
      mimetype: 'image/jpeg',
      originalname: 'test image.jpg',
      size: 1024,
    } as Express.Multer.File;

    beforeEach(() => {
      mockedRandomUUID.mockReturnValue('123e4567-e89b-12d3-a456-426614174000');
      mockS3Client.send.mockResolvedValue({
        ETag: '"test-etag"',
      });
    });

    it('should successfully upload file and return result', async () => {
      const result = await service.uploadFile(mockFile, {
        folder: 'images',
      });

      expect(result).toEqual({
        url: 'https://s3.test-storage.ru/test-bucket/images/1739000000000-123e4567-test_image.jpg',
        key: 'images/1739000000000-123e4567-test_image.jpg',
        filename: '1739000000000-123e4567-test_image.jpg',
        size: 1024,
        etag: '"test-etag"',
      });

      expect(mockS3Client.send).toHaveBeenCalledWith(
        expect.any(PutObjectCommand),
      );
    });

    it('should sanitize filename correctly', async () => {
      const fileWithSpecialChars = {
        ...mockFile,
        originalname: 'file with @#$%^&.png',
      } as Express.Multer.File;

      await service.uploadFile(fileWithSpecialChars, {
        folder: 'images',
      });

      const putCommand = mockS3Client.send.mock.calls[0][0] as PutObjectCommand;
      expect(putCommand.input.Key).toMatch(/file_with_+\.png$/);
    });

    it('should throw error if S3 upload fails', async () => {
      mockS3Client.send.mockRejectedValue(new Error('S3 upload error'));

      await expect(
        service.uploadFile(mockFile, { folder: 'images' }),
      ).rejects.toThrow('S3 upload error');
    });
  });

  describe('deleteFile', () => {
    it('should successfully delete file', async () => {
      mockS3Client.send.mockResolvedValue({});

      await service.deleteFile('images/test-file.jpg');

      expect(mockS3Client.send).toHaveBeenCalledWith(
        expect.any(DeleteObjectCommand),
      );
    });

    it('should throw error if S3 delete fails', async () => {
      mockS3Client.send.mockRejectedValue(new Error('S3 delete error'));

      await expect(service.deleteFile('images/test-file.jpg')).rejects.toThrow(
        'S3 delete error',
      );
    });
  });

  describe('getPresignedUrl', () => {
    it('should return presigned URL with default expiration', async () => {
      (getSignedUrl as jest.Mock).mockResolvedValue(
        'https://signed-url.example.com',
      );

      const result = await service.getPresignedUrl('images/test-file.jpg');

      expect(result).toBe('https://signed-url.example.com');
      expect(getSignedUrl).toHaveBeenCalledWith(
        mockS3Client,
        expect.any(GetObjectCommand),
        { expiresIn: 3600 },
      );
    });

    it('should return presigned URL with custom expiration', async () => {
      (getSignedUrl as jest.Mock).mockResolvedValue(
        'https://signed-url.example.com',
      );

      const result = await service.getPresignedUrl(
        'images/test-file.jpg',
        7200,
      );

      expect(result).toBe('https://signed-url.example.com');
      expect(getSignedUrl).toHaveBeenCalledWith(
        mockS3Client,
        expect.any(GetObjectCommand),
        { expiresIn: 7200 },
      );
    });

    it('should throw error if presigned URL generation fails', async () => {
      (getSignedUrl as jest.Mock).mockRejectedValue(
        new Error('Presigned URL error'),
      );

      await expect(
        service.getPresignedUrl('images/test-file.jpg'),
      ).rejects.toThrow('Presigned URL error');
    });
  });
});
