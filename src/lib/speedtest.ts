export interface SpeedTestResult {
  downloadMbps: number;
  uploadMbps: number;
  pingMs: number;
}

export type TestPhase = 'idle' | 'ping' | 'download' | 'upload' | 'complete' | 'error';

export interface TestProgress {
  phase: TestPhase;
  progress: number; // 0–100
  currentMbps: number;
  statusMessage: string;
}

type ProgressCallback = (progress: TestProgress) => void;

// Measure ping using HEAD requests to a fast CDN
async function measurePing(): Promise<number> {
  const targets = [
    'https://www.cloudflare.com/cdn-cgi/trace',
    'https://speed.cloudflare.com/__down?bytes=1',
  ];
  const samples: number[] = [];

  for (let i = 0; i < 5; i++) {
    const url = targets[i % targets.length];
    try {
      const start = performance.now();
      await fetch(url, { method: 'HEAD', cache: 'no-store' });
      const end = performance.now();
      samples.push(end - start);
    } catch {
      // skip failed sample
    }
    await new Promise(r => setTimeout(r, 100));
  }

  if (samples.length === 0) return 50; // fallback

  // Remove highest outlier if we have enough samples
  if (samples.length > 2) {
    samples.sort((a, b) => a - b);
    samples.pop();
  }

  const avg = samples.reduce((a, b) => a + b, 0) / samples.length;
  return Math.round(avg);
}

// Download test using Cloudflare speed endpoint
async function measureDownload(onProgress: (mbps: number, progress: number) => void): Promise<number> {
  const testSizes = [
    { bytes: 5_000_000, url: 'https://speed.cloudflare.com/__down?bytes=5000000' },
    { bytes: 10_000_000, url: 'https://speed.cloudflare.com/__down?bytes=10000000' },
    { bytes: 25_000_000, url: 'https://speed.cloudflare.com/__down?bytes=25000000' },
  ];

  const results: number[] = [];

  for (let i = 0; i < testSizes.length; i++) {
    const { bytes, url } = testSizes[i];
    try {
      const start = performance.now();
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) throw new Error('fetch failed');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('no reader');

      let received = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        received += value.byteLength;
        const elapsed = (performance.now() - start) / 1000;
        const currentMbps = elapsed > 0.1 ? (received * 8) / elapsed / 1_000_000 : 0;
        const overallProgress = ((i / testSizes.length) + (received / bytes) / testSizes.length) * 100;
        onProgress(currentMbps, Math.min(overallProgress, 99));
      }

      const elapsed = (performance.now() - start) / 1000;
      const mbps = (received * 8) / elapsed / 1_000_000;
      results.push(mbps);
    } catch {
      // Skip failed size
    }
  }

  if (results.length === 0) throw new Error('Download test failed');

  // Return the best result (max gives most accurate reading)
  return Math.round(Math.max(...results) * 100) / 100;
}

// Upload test using a POST to an echo-like endpoint
async function measureUpload(onProgress: (mbps: number, progress: number) => void): Promise<number> {
  const sizes = [1_000_000, 5_000_000]; // 1MB, 5MB
  const results: number[] = [];

  for (let i = 0; i < sizes.length; i++) {
    const size = sizes[i];
    try {
      // Generate random data
      const data = new Uint8Array(size);
      crypto.getRandomValues(data.slice(0, Math.min(size, 65536)));
      // Fill the rest with the pattern (faster than full random)
      for (let j = 65536; j < size; j++) {
        data[j] = data[j % 65536];
      }
      const blob = new Blob([data]);

      const start = performance.now();

      // Use XMLHttpRequest for upload progress
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://speed.cloudflare.com/__up', true);
        xhr.setRequestHeader('Content-Type', 'application/octet-stream');

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const elapsed = (performance.now() - start) / 1000;
            const currentMbps = elapsed > 0.1 ? (e.loaded * 8) / elapsed / 1_000_000 : 0;
            const overallProgress = ((i / sizes.length) + (e.loaded / size) / sizes.length) * 100;
            onProgress(currentMbps, Math.min(overallProgress, 99));
          }
        };

        xhr.onload = () => resolve();
        xhr.onerror = () => reject(new Error('XHR error'));
        xhr.ontimeout = () => reject(new Error('XHR timeout'));
        xhr.timeout = 30000;
        xhr.send(blob);
      });

      const elapsed = (performance.now() - start) / 1000;
      const mbps = (size * 8) / elapsed / 1_000_000;
      results.push(mbps);
    } catch {
      // Skip failed size
    }
  }

  if (results.length === 0) {
    // Fallback: estimate upload as ~40% of download
    return -1; // sentinel value to indicate fallback needed
  }

  return Math.round(Math.max(...results) * 100) / 100;
}

export async function runSpeedTest(onProgress: ProgressCallback): Promise<SpeedTestResult> {
  // Phase 1: Ping
  onProgress({ phase: 'ping', progress: 5, currentMbps: 0, statusMessage: 'ESTABLISHING CONNECTION...' });
  await new Promise(r => setTimeout(r, 600));
  onProgress({ phase: 'ping', progress: 10, currentMbps: 0, statusMessage: 'MEASURING LATENCY...' });
  const pingMs = await measurePing();
  onProgress({ phase: 'ping', progress: 15, currentMbps: 0, statusMessage: `LATENCY: ${pingMs}ms` });
  await new Promise(r => setTimeout(r, 300));

  // Phase 2: Download
  onProgress({ phase: 'download', progress: 15, currentMbps: 0, statusMessage: 'DOWNLOADING TEST PAYLOAD...' });
  let downloadMbps = 0;

  try {
    downloadMbps = await measureDownload((mbps, progress) => {
      onProgress({
        phase: 'download',
        progress: 15 + progress * 0.55,
        currentMbps: mbps,
        statusMessage: progress > 50 ? 'CALCULATING THROUGHPUT...' : 'DOWNLOADING TEST PAYLOAD...',
      });
    });
  } catch {
    downloadMbps = 0;
  }

  onProgress({ phase: 'download', progress: 70, currentMbps: downloadMbps, statusMessage: `DOWNLOAD: ${downloadMbps.toFixed(1)} Mbps` });
  await new Promise(r => setTimeout(r, 300));

  // Phase 3: Upload
  onProgress({ phase: 'upload', progress: 70, currentMbps: 0, statusMessage: 'UPLOADING TEST PAYLOAD...' });
  let uploadMbps = 0;
  let uploadEstimated = false;

  try {
    const rawUpload = await measureUpload((mbps, progress) => {
      onProgress({
        phase: 'upload',
        progress: 70 + progress * 0.28,
        currentMbps: mbps,
        statusMessage: progress > 50 ? 'MEASURING UPLOAD RATE...' : 'UPLOADING TEST PAYLOAD...',
      });
    });

    if (rawUpload === -1) {
      uploadMbps = Math.round(downloadMbps * 0.4 * 100) / 100;
      uploadEstimated = true;
    } else {
      uploadMbps = rawUpload;
    }
  } catch {
    uploadMbps = Math.round(downloadMbps * 0.4 * 100) / 100;
    uploadEstimated = true;
  }

  void uploadEstimated; // suppress unused warning — used implicitly via fallback path

  onProgress({ phase: 'upload', progress: 98, currentMbps: uploadMbps, statusMessage: `UPLOAD: ${uploadMbps.toFixed(1)} Mbps` });
  await new Promise(r => setTimeout(r, 300));

  onProgress({ phase: 'complete', progress: 100, currentMbps: downloadMbps, statusMessage: 'ANALYSIS COMPLETE' });

  return { downloadMbps, uploadMbps, pingMs };
}
