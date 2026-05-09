import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  url: string;
  publicId: string;
  format: string;
  size: number;
  width?: number;
  height?: number;
}

export async function uploadFile(
  file: Buffer | string,
  options: {
    folder?: string;
    resourceType?: "image" | "video" | "raw" | "auto";
    maxSizeMB?: number;
  } = {}
): Promise<UploadResult> {
  const { folder = "campus-echo", resourceType = "auto", maxSizeMB = 10 } = options;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        allowed_formats: ["jpg", "jpeg", "png", "gif", "webp", "pdf", "doc", "docx"],
        max_bytes: maxSizeMB * 1024 * 1024,
        transformation: resourceType === "image" ? [{ quality: "auto", fetch_format: "auto" }] : undefined,
      },
      (error, result) => {
        if (error) reject(error);
        else if (result) {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            size: result.bytes,
            width: result.width,
            height: result.height,
          });
        }
      }
    );

    if (typeof file === "string") {
      // base64 string
      cloudinary.uploader
        .upload(file, { folder, resource_type: resourceType })
        .then((result) =>
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            size: result.bytes,
          })
        )
        .catch(reject);
    } else {
      uploadStream.end(file);
    }
  });
}

export async function deleteFile(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

export function getOptimizedUrl(
  publicId: string,
  options: { width?: number; height?: number; crop?: string } = {}
): string {
  return cloudinary.url(publicId, {
    ...options,
    quality: "auto",
    fetch_format: "auto",
  });
}
