import { type NextFunction, type Request, type Response } from 'express';
import multer from 'multer';
import path from 'path';
import sharp from 'sharp';

import {
  AVATARS_DIR,
  UPLOADS_DIR,
  ensureAvatarsDirExists,
  ensureUploadsDirExists,
  generateUniqueFilename,
} from '../utils';
import { createApiError } from '../utils/errors';

// File size limits
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Allowed MIME types
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Image processing config
const MAX_WIDTH = 1080;
const MAX_HEIGHT = 1080;
const JPEG_QUALITY = 85;

// Multer storage: keep file in memory for processing
const storage = multer.memoryStorage();

// Multer file filter
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback,
) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    callback(null, true);
  } else {
    const error = new Error(
      `Only ${ALLOWED_MIME_TYPES.join(', ')} files are allowed`,
    );
    callback(error);
  }
};

// Multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

/**
 * Middleware to process uploaded image with Sharp
 * Resizes, converts to JPEG, and saves to uploads directory
 */
const processImage = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  if (!req.file) {
    return next(
      createApiError(400, 'VALIDATION_ERROR', 'Image file is required'),
    );
  }

  try {
    // Ensure uploads directory exists
    await ensureUploadsDirExists();

    // Generate unique filename
    const filename = generateUniqueFilename(req.file.originalname, 'jpg');
    const filepath = path.join(UPLOADS_DIR, filename);

    // Process image with Sharp
    await sharp(req.file.buffer)
      .resize(MAX_WIDTH, MAX_HEIGHT, {
        fit: 'inside', // Maintain aspect ratio
        withoutEnlargement: true, // Don't upscale small images
      })
      .jpeg({ quality: JPEG_QUALITY })
      .toFile(filepath);

    // Add URL path (not filesystem path) for database storage
    req.file.path = `/uploads/posts/${filename}`;
    req.file.filename = filename;

    next();
  } catch (error) {
    next(
      createApiError(
        500,
        'IMAGE_PROCESSING_ERROR',
        'Failed to process image',
        error instanceof Error ? { message: error.message } : undefined,
      ),
    );
  }
};

/**
 * Middleware chain: multer upload + sharp processing
 * Usage: uploadSingle('image') in routes
 */
export const uploadSingle = (fieldName: string) => [
  upload.single(fieldName),
  processImage,
];

// ============================================================================
// Avatar Upload
// ============================================================================

const AVATAR_SIZE = 320; // Square avatar

/**
 * Middleware to process avatar with Sharp
 * Crops to square and resizes to 320x320
 */
const processAvatar = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  if (!req.file) {
    return next(
      createApiError(400, 'VALIDATION_ERROR', 'Image file is required'),
    );
  }

  try {
    // Ensure avatars directory exists
    await ensureAvatarsDirExists();

    // Generate unique filename
    const filename = generateUniqueFilename(req.file.originalname, 'jpg');
    const filepath = path.join(AVATARS_DIR, filename);

    // Process avatar with Sharp - crop to square and resize
    await sharp(req.file.buffer)
      .resize(AVATAR_SIZE, AVATAR_SIZE, {
        fit: 'cover', // Crop to fill square
        position: 'center',
      })
      .jpeg({ quality: JPEG_QUALITY })
      .toFile(filepath);

    // Add URL path (not filesystem path) for database storage
    req.file.path = `/uploads/avatars/${filename}`;
    req.file.filename = filename;

    next();
  } catch (error) {
    next(
      createApiError(
        500,
        'IMAGE_PROCESSING_ERROR',
        'Failed to process avatar',
        error instanceof Error ? { message: error.message } : undefined,
      ),
    );
  }
};

/**
 * Middleware chain for avatar upload
 * Usage: uploadAvatar('avatar') in routes
 */
export const uploadAvatar = (fieldName: string) => [
  upload.single(fieldName),
  processAvatar,
];
