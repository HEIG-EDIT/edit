import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

@Injectable()
export class S3Service {
  private s3: S3Client;
  private bucket = process.env.AWS_S3_BUCKET!;

  constructor() {
    this.s3 = new S3Client({
      region: process.env.AWS_REGION!,
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

  async getJson(projectId: number): Promise<string> {
    const key = `${projectId}/project.json`;
    const obj = await this.s3.send(new GetObjectCommand({ Bucket: this.bucket, Key: key }));

    const stream = obj.Body as Readable;
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks).toString('utf-8');
  }

  async getThumbnail(projectId: number): Promise<string> {
    const key = `${projectId}/thumbnail.png`;
    const obj = await this.s3.send(new GetObjectCommand({ Bucket: this.bucket, Key: key }));

    const stream = obj.Body as Readable;
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
    }

    const buffer = Buffer.concat(chunks);
    const base64 = buffer.toString('base64');
    return base64;
  }


  async deleteProjectFiles(projectId: number) {
    const jsonKey = `${projectId}/project.json`;
    const thumbKey = `${projectId}/thumbnail.png`;

    await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: jsonKey }));
    await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: thumbKey }));
  }
}
