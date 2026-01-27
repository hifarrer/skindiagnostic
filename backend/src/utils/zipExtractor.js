import axios from 'axios';
import JSZip from 'jszip';

export async function extractZipFromUrl(zipUrl) {
  try {
    // Download ZIP file
    const response = await axios.get(zipUrl, {
      responseType: 'arraybuffer',
    });

    // Extract ZIP
    const zip = await JSZip.loadAsync(response.data);
    const files = {};
    
    // Extract all files
    for (const [filename, file] of Object.entries(zip.files)) {
      if (!file.dir) {
        files[filename] = await file.async('string');
      }
    }

    return files;
  } catch (error) {
    console.error('Error extracting ZIP:', error);
    throw new Error(`Failed to extract ZIP: ${error.message}`);
  }
}

