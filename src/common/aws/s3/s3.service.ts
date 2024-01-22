import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
@Injectable()
export class S3Service {
  s3Client: S3Client;
  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'ap-northeast-2',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }

  async getPresignedUrl({ bucket, key }: { bucket: string; key: string }) {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const url = await getSignedUrl(this.s3Client, command, {
      expiresIn: 60 * 5,
    });
    return url;
  }

  async getPresignedURLs({
    bucket,
    fileNames,
    path,
  }: {
    bucket: string;
    fileNames: string[];
    path: string;
  }) {
    const urls = await Promise.all(
      fileNames.map(async (fileName) => {
        const key = `${path}/${fileName}`;
        const url = await this.getPresignedUrl({ bucket, key });
        return url;
      }),
    );
    return urls;
  }

  async upload({
    bucket,
    key,
    file,
  }: {
    bucket: string;
    key: string;
    file: Buffer;
  }) {
    const params = {
      Bucket: bucket,
      Key: key,
    };
    const uploadResult = await this.s3Client.send(
      new PutObjectCommand({
        ...params,
        Body: file,
      }),
    );
    return uploadResult;
  }
}
