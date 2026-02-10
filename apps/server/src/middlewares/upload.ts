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
    callback(
      createApiError(
        400,
        'VALIDATION_ERROR',
        `Only ${ALLOWED_MIME_TYPES.join(', ')} files are allowed`,
      ) as unknown as Error,
    );
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
 * Generic image processing middleware factory.
 * Resizes with Sharp, converts to JPEG, saves to the given directory.
 */
const createImageProcessor = (config: {
  ensureDir: () => Promise<void>;
  outputDir: string;
  urlPrefix: string;
  resize: sharp.ResizeOptions;
}) => {
  return async (
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
      await config.ensureDir();

      const filename = generateUniqueFilename(req.file.originalname, 'jpg');
      const filepath = path.join(config.outputDir, filename);

      await sharp(req.file.buffer)
        .resize(config.resize)
        .jpeg({ quality: JPEG_QUALITY })
        .toFile(filepath);

      req.file.path = `${config.urlPrefix}/${filename}`;
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
};

/**
 * Image processing middleware that skips when no file is present.
 */
const createOptionalImageProcessor = (config: {
  ensureDir: () => Promise<void>;
  outputDir: string;
  urlPrefix: string;
  resize: sharp.ResizeOptions;
}) => {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> => {
    if (!req.file) {
      return next();
    }

    try {
      await config.ensureDir();

      const filename = generateUniqueFilename(req.file.originalname, 'jpg');
      const filepath = path.join(config.outputDir, filename);

      await sharp(req.file.buffer)
        .resize(config.resize)
        .jpeg({ quality: JPEG_QUALITY })
        .toFile(filepath);

      req.file.path = `${config.urlPrefix}/${filename}`;
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
};

const postImageConfig = {
  ensureDir: ensureUploadsDirExists,
  outputDir: UPLOADS_DIR,
  urlPrefix: '/uploads/posts',
  resize: {
    width: 1080,
    height: 1080,
    fit: 'inside' as const,
    withoutEnlargement: true,
  },
};

/**
 * Middleware chain: multer upload + sharp processing for posts (image required)
 */
export const uploadSingle = (fieldName: string) => [
  upload.single(fieldName),
  createImageProcessor(postImageConfig),
];

/**
 * Middleware chain: multer upload + sharp processing for posts (image optional)
 */
export const uploadSingleOptional = (fieldName: string) => [
  upload.single(fieldName),
  createOptionalImageProcessor(postImageConfig),
];

/**
 * Middleware chain for avatar upload
 */
export const uploadAvatar = (fieldName: string) => [
  upload.single(fieldName),
  createImageProcessor({
    ensureDir: ensureAvatarsDirExists,
    outputDir: AVATARS_DIR,
    urlPrefix: '/uploads/avatars',
    resize: { width: 320, height: 320, fit: 'cover', position: 'center' },
  }),
];
