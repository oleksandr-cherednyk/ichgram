import fs from 'fs/promises';
import path from 'path';

// Upload directories
export const UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'posts');
export const AVATARS_DIR = path.join(process.cwd(), 'uploads', 'avatars');

/**
 * Ensures the uploads directory exists
 */
export const ensureUploadsDirExists = async (): Promise<void> => {
  try {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create uploads directory:', error);
    throw error;
  }
};

/**
 * Ensures the avatars directory exists
 */
export const ensureAvatarsDirExists = async (): Promise<void> => {
  try {
    await fs.mkdir(AVATARS_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create avatars directory:', error);
    throw error;
  }
};

/**
 * Converts URL path to filesystem path
 * e.g., /uploads/posts/file.jpg -> /cwd/uploads/posts/file.jpg
 */
const urlToFilePath = (urlPath: string): string => {
  // Remove leading /uploads/ and join with cwd
  const relativePath = urlPath.replace(/^\/uploads\//, '');
  return path.join(process.cwd(), 'uploads', relativePath);
};

/**
 * Deletes a file from the filesystem
 * Accepts URL path (e.g., /uploads/posts/file.jpg)
 * Logs error but doesn't throw (file might already be deleted)
 */
export const deleteFile = async (urlPath: string): Promise<void> => {
  try {
    const filePath = urlToFilePath(urlPath);
    await fs.unlink(filePath);
  } catch (error) {
    // File might not exist, log but don't throw
    console.error('Failed to delete file:', urlPath, error);
  }
};

/**
 * Generates a unique filename with timestamp and random suffix
 */
export const generateUniqueFilename = (
  originalName: string,
  extension: string = 'jpg',
): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const sanitized = originalName
    .replace(/[^a-z0-9]/gi, '_')
    .toLowerCase()
    .substring(0, 20);

  return `${timestamp}-${random}-${sanitized}.${extension}`;
};
