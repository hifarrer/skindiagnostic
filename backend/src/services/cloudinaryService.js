import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export class CloudinaryService {
  static async uploadImage(fileBuffer, folder = 'aimakeup') {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          faces: true, // return detected face coordinates ([x,y,w,h]) on the result
          transformation: [
            { quality: 'auto' },
            { fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      uploadStream.end(fileBuffer);
    });
  }

  static async uploadFromUrl(url, folder = 'aimakeup') {
    try {
      const result = await cloudinary.uploader.upload(url, {
        folder,
        resource_type: 'image',
        faces: true, // return detected face coordinates ([x,y,w,h]) on the result
        transformation: [
          { quality: 'auto' },
          { fetch_format: 'auto' },
        ],
      });
      return result;
    } catch (error) {
      throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
  }

  /**
   * Build a face-centered, tightly-zoomed crop URL for an already-uploaded asset.
   * Perfect Corp skin analysis rejects photos where the face fills too little of the
   * frame (error_src_face_too_small). `c_thumb,g_face` detects the face and crops to
   * it; zoom 1.2 makes the face fill ~85% of the frame while keeping forehead/chin/
   * cheeks visible. Output is forced to JPEG to keep the upload small.
   */
  static buildFaceCropUrl(publicId, { size = 1600, zoom = '1.2' } = {}) {
    return cloudinary.url(publicId, {
      secure: true,
      resource_type: 'image',
      transformation: [
        { width: size, height: size, crop: 'thumb', gravity: 'face', zoom },
        { quality: 'auto' },
        { fetch_format: 'jpg' },
      ],
    });
  }

  /**
   * Crop to an exact native-resolution pixel box. Unlike buildFaceCropUrl (which forces a
   * fixed 1600x1600 and may upscale a small face), this delivers the box at its true pixel
   * size, so the box's w/h is exactly the delivered resolution — the value we threshold
   * against the 1200x1200 minimum before deciding whether to upscale.
   */
  static buildNativeFaceCropUrl(publicId, { x, y, w, h }) {
    return cloudinary.url(publicId, {
      secure: true,
      resource_type: 'image',
      transformation: [
        { width: w, height: h, x, y, crop: 'crop' },
        { quality: 'auto' },
        { fetch_format: 'jpg' },
      ],
    });
  }

  static async deleteImage(publicId) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result;
    } catch (error) {
      throw new Error(`Cloudinary delete failed: ${error.message}`);
    }
  }
}

