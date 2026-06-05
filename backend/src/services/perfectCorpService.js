import axios from 'axios';

const BASE_URL = process.env.PERFECT_CORP_BASE_URL || 'https://yce-api-01.makeupar.com/s2s/v2.0';
// Skin analysis uses v2.1 (File API flow). Kept separate so makeup/look VTO stay on v2.0.
const SKIN_BASE_URL = process.env.PERFECT_CORP_SKIN_BASE_URL || 'https://yce-api-01.makeupar.com/s2s/v2.1';
const API_KEY = process.env.PERFECT_CORP_API_KEY;

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

const pollTask = async (baseUrl, taskId, { intervalMs = 2000, maxAttempts = 300 } = {}) => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const pollUrl = `${baseUrl}/${encodeURIComponent(taskId)}`;
    const { status, ok, data } = await httpRequest('GET', pollUrl);

    if (!ok) {
      throw new Error(`Polling failed: ${status}`);
    }

    const taskStatus = data?.data?.task_status;

    if (taskStatus === 'success') {
      return data;
    }

    if (taskStatus === 'error') {
      throw new Error(`Task failed: ${JSON.stringify(data)}`);
    }

    await sleep(intervalMs);
  }

  throw new Error('Max attempts exceeded while polling');
};

export class PerfectCorpService {
  /**
   * v2.1 File API: register the file, then PUT the raw bytes to the returned
   * presigned URL. Returns the file_id used to start the skin-analysis task.
   */
  static async uploadSkinAnalysisFile(buffer, { contentType, fileName, fileSize }) {
    const registerUrl = `${SKIN_BASE_URL}/file/skin-analysis`;
    const registerBody = {
      files: [
        {
          content_type: contentType,
          file_name: fileName,
          file_size: fileSize,
        },
      ],
    };

    const { status, ok, data } = await httpRequest('POST', registerUrl, { body: registerBody });
    if (!ok) {
      throw new Error(`File register failed: ${status} - ${JSON.stringify(data)}`);
    }

    const file = data?.files?.[0];
    const fileId = file?.file_id;
    const uploadReq = file?.requests?.[0];
    if (!fileId || !uploadReq?.url) {
      throw new Error(`Upload URL/file_id not found in response: ${JSON.stringify(data)}`);
    }

    // Raw upload to the presigned URL. Use the exact headers returned (Content-Type,
    // Content-Length) and NO Bearer/JSON header — this is not a Perfect Corp API call.
    try {
      await axios({
        method: uploadReq.method || 'PUT',
        url: uploadReq.url,
        headers: uploadReq.headers || { 'Content-Type': contentType },
        data: buffer,
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      });
    } catch (error) {
      const detail = error.response?.status
        ? `${error.response.status} - ${JSON.stringify(error.response.data)}`
        : error.message;
      throw new Error(`File upload (PUT) failed: ${detail}`);
    }

    return fileId;
  }

  static async startSkinAnalysis(imageBuffer, fileMeta, dstActions = null) {
    const fileId = await this.uploadSkinAnalysisFile(imageBuffer, fileMeta);

    const url = `${SKIN_BASE_URL}/task/skin-analysis`;
    const body = {
      dst_actions: dstActions || [
        'hd_wrinkle',
        'hd_pore',
        'hd_texture',
        'hd_acne',
        'hd_oiliness',
        'hd_radiance',
        'hd_moisture',
        'hd_firmness',
        'hd_skin_type',
        'hd_dark_circle',
        'hd_eye_bag',
        'hd_age_spot',
        'hd_redness',
      ],
      src_file_id: fileId,
      format: 'json', // Request JSON format to get mask_urls directly instead of ZIP
    };

    const { status, ok, data } = await httpRequest('POST', url, { body });

    if (!ok) {
      throw new Error(`Start request failed: ${status} - ${JSON.stringify(data)}`);
    }

    const taskId = data?.data?.task_id;
    if (!taskId) {
      throw new Error(`task_id not found in response: ${JSON.stringify(data)}`);
    }

    return { taskId, initialResponse: data };
  }

  static async pollSkinAnalysis(taskId) {
    return pollTask(`${SKIN_BASE_URL}/task/skin-analysis`, taskId);
  }

  static async startMakeupVTO(imageUrl, effects) {
    const url = `${BASE_URL}/task/makeup-vto`;
    
    // Effects should already be properly formatted from the frontend
    // Expected format: [{ category: "blush", pattern: { name: "1color1" }, palettes: [...] }]
    const body = {
      src_file_url: imageUrl,
      effects: effects || [],
      version: '1.0',
    };

    console.log('[PerfectCorp] Starting makeup-vto with body:', JSON.stringify(body, null, 2));

    const { status, ok, data } = await httpRequest('POST', url, { body });

    if (!ok) {
      console.error('[PerfectCorp] Start request failed:', status, JSON.stringify(data));
      throw new Error(`Start request failed: ${status} - ${JSON.stringify(data)}`);
    }

    const taskId = data?.data?.task_id;
    if (!taskId) {
      throw new Error(`task_id not found in response: ${JSON.stringify(data)}`);
    }

    console.log('[PerfectCorp] Task started, id =', taskId);
    return { taskId, initialResponse: data };
  }

  static async pollMakeupVTO(taskId) {
    return pollTask(`${BASE_URL}/task/makeup-vto`, taskId);
  }

  static async startLookVTO(imageUrl, templateId) {
    const url = `${BASE_URL}/task/look-vto`;
    const body = {
      src_file_url: imageUrl,  // API uses src_file_url, not image_url
      template_id: templateId || '',
    };

    console.log('[PerfectCorp] Starting look-vto with body:', JSON.stringify(body, null, 2));

    const { status, ok, data } = await httpRequest('POST', url, { body });

    if (!ok) {
      console.error('[PerfectCorp] Start request failed:', status, JSON.stringify(data));
      throw new Error(`Start request failed: ${status} - ${JSON.stringify(data)}`);
    }

    const taskId = data?.data?.task_id;
    if (!taskId) {
      throw new Error(`task_id not found in response: ${JSON.stringify(data)}`);
    }

    console.log('[PerfectCorp] Task started, id =', taskId);
    return { taskId, initialResponse: data };
  }

  static async pollLookVTO(taskId) {
    return pollTask(`${BASE_URL}/task/look-vto`, taskId);
  }

  static async getLookTemplates(pageSize = 20, startingToken = null) {
    // API limit is 20, so ensure we don't exceed it
    const actualPageSize = Math.min(pageSize, 20);
    
    let url = `${BASE_URL}/task/template/look-vto?page_size=${actualPageSize}`;
    if (startingToken) {
      url += `&starting_token=${startingToken}`;
    }

    console.log('[PerfectCorp] Fetching look templates from:', url);

    const { status, ok, data } = await httpRequest('GET', url);

    if (!ok) {
      console.error('[PerfectCorp] Get templates failed:', status, JSON.stringify(data));
      throw new Error(`Get templates failed: ${status} - ${JSON.stringify(data)}`);
    }

    console.log('[PerfectCorp] Templates fetched successfully');
    return data;
  }
}

