import { Injectable } from '@nestjs/common';
import { S3 } from '@aws-sdk/client-s3';
import { v4 as uuid } from 'uuid';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { ErrorUtil } from './error.utils';
import { Readable } from 'stream';
import { extractPublicId } from 'cloudinary-build-url';

@Injectable()
export class FileUtil {
  private readonly s3Client: S3;
  private readonly bucketName: string;
  private readonly cdnEndpoint: string;

  constructor(
    private configService: ConfigService,
    private errorUtil: ErrorUtil,
  ) {
    this.s3Client = new S3({
      endpoint: this.configService.get<string>('DO_SPACES_ENDPOINT'),
      region: this.configService.get<string>('DO_SPACES_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('SPACES_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>(
          'SPACES_SECRET_ACCESS_KEY',
        ),
      },
    });

    this.bucketName = this.configService.get<string>('DO_SPACES_BUCKET_NAME');
    this.cdnEndpoint = this.configService.get<string>('DO_SPACES_CDN_ENDPOINT');

    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  /**
   * Upload file to DigitalOcean Spaces (S3-compatible)
   */
  async uploadToSpaces(
    file: Express.Multer.File,
    folder: string,
    url?: string,
  ): Promise<string> {
    try {
      if (!file) throw new Error('File is required for upload.');

      // Generate unique filename
      const uniqueFileName = uuid();
      const fileExtension = file.originalname.split('.').pop();
      const key = `${folder}/${uniqueFileName}.${fileExtension}`;

      if (url) {
        await this.deleteFromSpaces(url);
      }

      await this.s3Client.putObject({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ACL: 'public-read',
        ContentType: file.mimetype,
      });

      return `${this.cdnEndpoint}/${key}`;
    } catch (error) {
      this.errorUtil.handleError(error);
      throw new Error(`Failed to upload file to Spaces: ${error.message}`);
    }
  }

  /**
   * Delete file from DigitalOcean Spaces
   */
  async deleteFromSpaces(url: string): Promise<void> {
    try {
      const key = this.extractKey(url);

      await this.s3Client.deleteObject({
        Bucket: this.bucketName,
        Key: key,
      });
    } catch {
      return;
    }
  }

  /**
   * Extracts object key from a Spaces URL
   */
  private extractKey(url: string): string {
    return url.replace(`${this.cdnEndpoint}/`, '');
  }

  /**
   * Upload file to Cloudinary
   */
  async uploadToCloudinary(
    file: Express.Multer.File,
    folder: string,
    url?: string,
  ): Promise<string> {
    try {
      if (!file) throw new Error('File is required for upload.');

      const uniqueFileName = uuid();

      if (url) {
        await this.deleteFromCloudinary(url);
      }

      return new Promise<string>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder,
            public_id: uniqueFileName,
            resource_type: 'image',
          },
          (error, result: UploadApiResponse) => {
            if (error) {
              reject(error);
            } else if (result) {
              resolve(result.secure_url);
            } else {
              reject(new Error('Cloudinary upload failed with no result.'));
            }
          },
        );

        const readableStream = new Readable();
        readableStream.push(file.buffer);
        readableStream.push(null);
        readableStream.pipe(stream);
      });
    } catch (error) {
      this.errorUtil.handleError(error);
      throw new Error(`Failed to upload file to Cloudinary: ${error.message}`);
    }
  }

  /**
   * Delete file from Cloudinary
   */
  async deleteFromCloudinary(url: string): Promise<void> {
    try {
      const publicId = extractPublicId(url);

      await cloudinary.uploader.destroy(publicId, {
        resource_type: 'image',
      });
    } catch {
      return;
    }
  }
}
