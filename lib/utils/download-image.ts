import { writeFile } from 'fs/promises';
import { join } from 'path';

/**
 * Download an image from a URL and save it locally
 * @param imageUrl - The URL of the image to download
 * @param filename - The filename to save (without extension)
 * @param directory - Directory relative to public/ (default: 'images/talks')
 * @returns The local path (relative to public/) or null if failed
 */
export async function downloadImage(
  imageUrl: string,
  filename: string,
  directory: string = 'images/talks'
): Promise<string | null> {
  try {
    // Fetch the image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.error(`Failed to fetch image: ${response.statusText}`);
      return null;
    }

    // Get the content type to determine file extension
    const contentType = response.headers.get('content-type');
    let extension = 'jpg'; // default
    if (contentType?.includes('png')) extension = 'png';
    else if (contentType?.includes('webp')) extension = 'webp';
    else if (contentType?.includes('gif')) extension = 'gif';

    // Convert response to buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Construct file path
    const publicDir = join(process.cwd(), 'public');
    const targetDir = join(publicDir, directory);
    const fullFilename = `${filename}.${extension}`;
    const filePath = join(targetDir, fullFilename);

    // Save the file
    await writeFile(filePath, buffer);

    // Return the public URL path
    const publicPath = `/${directory}/${fullFilename}`;
    console.log(`✅ Downloaded: ${publicPath}`);
    return publicPath;
  } catch (error) {
    console.error(`Failed to download image from ${imageUrl}:`, error);
    return null;
  }
}

/**
 * Download a talk thumbnail and return the local path
 * @param talkId - The ID of the talk
 * @param imageUrl - The URL of the thumbnail
 * @returns The local path or null if failed
 */
export async function downloadTalkThumbnail(
  talkId: string,
  imageUrl: string
): Promise<string | null> {
  return downloadImage(imageUrl, talkId, 'images/talks');
}
