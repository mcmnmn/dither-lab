/** Check if a file is an accepted image type */
export function isAcceptedMedia(file: File): boolean {
  return file.type.startsWith('image/');
}

/** Accept string for file inputs */
export const MEDIA_ACCEPT = 'image/*';
