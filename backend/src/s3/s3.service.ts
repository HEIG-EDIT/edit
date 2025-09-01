import { Injectable } from '@nestjs/common';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  NoSuchKey,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';

@Injectable()
export class S3Service {
  private s3: S3Client;
  private bucket = process.env.AWS_S3_BUCKET!;

  constructor() {
    this.s3 = new S3Client({
      region: process.env.AWS_REGION,
      endpoint: process.env.AWS_S3_ENDPOINT || undefined, // only set in local env
      forcePathStyle: !!process.env.AWS_S3_ENDPOINT, // only for Localstack
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }

  async uploadJson(projectId: number, json: string) {
    const key = `${projectId}/project.json`;
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: json,
        ContentType: 'application/json',
      }),
    );
    return key;
  }

  async uploadThumbnail(projectId: number, base64: string) {
    const buffer = Buffer.from(base64, 'base64');
    const key = `${projectId}/thumbnail.png`;
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: 'image/png',
      }),
    );
    return key;
  }

  // use https://docs.aws.amazon.com/AmazonS3/latest/API/s3_example_s3_GetObject_section.html
  async getJson(projectId: number): Promise<string | null> {
    const key = `${projectId}/project.json`;
    try {
      const obj = await this.s3.send(
        new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      );
      const stream = obj.Body as Readable;
      const chunks: Buffer[] = [];
      for await (const chunk of stream) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        chunks.push(Buffer.from(chunk));
      }
      return Buffer.concat(chunks).toString('utf-8');
    } catch (caught) {
      if (caught instanceof NoSuchKey) {
        return null;
      }

      throw caught;
    }
  }

  async getThumbnail(projectId: number): Promise<string> {
    const key = `${projectId}/thumbnail.png`;
    try {
      const obj = await this.s3.send(
        new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      );

      const stream = obj.Body as Readable;
      const chunks: Buffer[] = [];
      for await (const chunk of stream) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        chunks.push(Buffer.from(chunk));
      }

      const buffer = Buffer.concat(chunks);
      return buffer.toString('base64');
    } catch (caught) {
      if (caught instanceof NoSuchKey) {
        // TODO : afficher un placeholder a la place de ca
        return '';
      }

      throw caught;
    }
  }

  async deleteProjectFiles(projectId: number) {
    const jsonKey = `${projectId}/project.json`;
    const thumbKey = `${projectId}/thumbnail.png`;

    await this.s3.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: jsonKey }),
    );
    await this.s3.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: thumbKey }),
    );
  }
}
