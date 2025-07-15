import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import { Express } from 'express';

cloudinary.config({
  cloud_name: 'bada',
  api_key: '593648335712979',
  api_secret: 'Ilo6RYkxvGRix0UvCSGlxQwG8W0',
});



@Injectable()
export class CloudinaryService {
  uploadImage(file: Express.Multer.File): Promise<any> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream({ resource_type: 'image' }, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
      Readable.from(file.buffer).pipe(upload);
    });
  }
}