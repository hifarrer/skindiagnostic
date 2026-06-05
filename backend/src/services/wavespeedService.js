import axios from 'axios';

const BASE_URL = process.env.WAVESPEED_BASE_URL || 'https://api.wavespeed.ai/api/v3';
const API_KEY = process.env.WAVESPEED_API_KEY;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const httpRequest = async (method, url, { headers = {}, body } = {}) => {
  const config = {
    method,
    url,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
      ...headers,
    },
  };

  if (body !== undefined) {
    config.data = typeof body === 'string' ? JSON.parse(body) : body;
  }

  try {
    const response = await axios(config);
    return {
      status: response.status,
      ok: response.status >= 200 && response.status < 300,
      data: response.data,
    };
  } catch (error) {
    return {
      status: error.response?.status || 500,
      ok: false,
      data: error.response?.data || { error: error.message },
    };
  }
};

export class WavespeedService {
  /**
   * Submit an image to the Wavespeed "ultimate-image-upscaler". Async by design
   * (enable_sync_mode:false), so the POST returns a pending request id that must be
   * polled. The input must be a publicly reachable URL (a Cloudinary transformation
   * URL works). Returns the request id.
   */
  static async upscaleImage(imageUrl, { outputFormat = 'jpeg', targetResolution = '2k' } = {}) {
    const url = `${BASE_URL}/wavespeed-ai/ultimate-image-upscaler`;
    const body = {
      enable_base64_output: false,
      enable_sync_mode: false,
      image: imageUrl,
      output_format: outputFormat,
      target_resolution: targetResolution,
    };

    console.log('[Wavespeed] Submitting upscale for:', imageUrl);

    const { status, ok, data } = await httpRequest('POST', url, { body });
    if (!ok) {
      throw new Error(`Upscale submit failed: ${status} - ${JSON.stringify(data)}`);
    }

    const requestId = data?.data?.id ?? data?.id;
    if (!requestId) {
      throw new Error(`Upscale request id not found in response: ${JSON.stringify(data)}`);
    }

    console.log('[Wavespeed] Upscale submitted, id =', requestId);
    return requestId;
  }

  /**
   * Poll a prediction until it completes, then fetch the result and return the output
   * image URL. Status flow: pending -> processing -> completed | failed.
   */
  static async pollUpscale(requestId, { intervalMs = 1500, maxAttempts = 60 } = {}) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const pollUrl = `${BASE_URL}/predictions/${encodeURIComponent(requestId)}`;
      const { status, ok, data } = await httpRequest('GET', pollUrl);

      if (!ok) {
        throw new Error(`Polling failed: ${status} - ${JSON.stringify(data)}`);
      }

      const taskStatus = data?.data?.status ?? data?.status;

      if (taskStatus === 'completed') {
        const resultUrl = `${BASE_URL}/predictions/${encodeURIComponent(requestId)}/result`;
        const { ok: rOk, data: rData } = await httpRequest('GET', resultUrl);
        if (!rOk) {
          throw new Error(`Result fetch failed: ${JSON.stringify(rData)}`);
        }
        const outputUrl =
          rData?.data?.outputs?.[0] ??
          rData?.data?.output ??
          rData?.outputs?.[0] ??
          rData?.output;
        if (!outputUrl) {
          throw new Error(`Output URL not found in result: ${JSON.stringify(rData)}`);
        }
        console.log('[Wavespeed] Upscale completed, output =', outputUrl);
        return outputUrl;
      }

      if (taskStatus === 'failed') {
        throw new Error(`Upscale failed: ${JSON.stringify(data)}`);
      }

      await sleep(intervalMs);
    }

    throw new Error('Max attempts exceeded while polling upscale');
  }

  /** Submit + poll + return the output image URL. */
  static async upscaleAndWait(imageUrl, opts = {}) {
    const requestId = await this.upscaleImage(imageUrl, opts);
    const outputUrl = await this.pollUpscale(requestId, opts);
    return { requestId, outputUrl };
  }
}
