import { spawn } from 'child_process';
import path from 'path';
import { promises as fs } from 'fs';

// Python API configuration
const BRIDGE_SCRIPT_PATH = path.join(process.cwd(), 'python-bridge-script.py');

interface PythonScriptOptions {
  script: string;
  args?: string[];
  cwd?: string;
  timeout?: number;
}

interface MarketingToolParams {
  content_type: string;
  prompt: string;
  media_files?: string[];
  settings?: Record<string, any>;
}

export class PythonBridge {
  private static instance: PythonBridge;

  public static getInstance(): PythonBridge {
    if (!PythonBridge.instance) {
      PythonBridge.instance = new PythonBridge();
    }
    return PythonBridge.instance;
  }

  /**
   * Execute a Python script and return the result
   */
  private async executePythonScript(options: PythonScriptOptions): Promise<any> {
    return new Promise((resolve, reject) => {
      const { script, args = [], cwd = process.cwd(), timeout = 30000 } = options;

      const pythonProcess = spawn('python', [script, ...args], {
        cwd,
        stdio: 'pipe',
        shell: true
      });

      let stdout = '';
      let stderr = '';

      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code === 0) {
          try {
            // Try to parse JSON output
            const result = JSON.parse(stdout);
            resolve(result);
          } catch (error) {
            // If not JSON, return raw output
            resolve({ output: stdout, raw: true });
          }
        } else {
          reject(new Error(`Python script failed with code ${code}: ${stderr}`));
        }
      });

      pythonProcess.on('error', (error) => {
        reject(error);
      });

      // Set timeout
      setTimeout(() => {
        pythonProcess.kill();
        reject(new Error('Python script execution timeout'));
      }, timeout);
    });
  }

  /**
   * Generate marketing content using your Python tool
   */
  async generateMarketingContent(params: MarketingToolParams): Promise<any> {
    const tempInputFile = path.join(process.cwd(), `temp_input_${Date.now()}.json`);
    
    // Write input parameters to temporary file
    await fs.writeFile(tempInputFile, JSON.stringify(params));

    try {
      const result = await this.executePythonScript({
        script: BRIDGE_SCRIPT_PATH,
        args: ['generate_content', tempInputFile],
        timeout: 60000 // 1 minute timeout for content generation
      });

      // Clean up temp file
      await fs.unlink(tempInputFile).catch(() => {}); // Ignore errors

      return result;
    } catch (error) {
      // Clean up temp file even on error
      await fs.unlink(tempInputFile).catch(() => {});
      throw error;
    }
  }

  /**
   * Get user analytics from your Python tool
   */
  async getAnalytics(userId: string, dateRange?: { start: string; end: string }): Promise<any> {
    return this.executePythonScript({
      script: BRIDGE_SCRIPT_PATH,
      args: ['get_analytics', userId, JSON.stringify(dateRange || {})]
    });
  }

  /**
   * Process media files using your Python tool
   */
  async processMedia(mediaPath: string, processingType: string): Promise<any> {
    return this.executePythonScript({
      script: BRIDGE_SCRIPT_PATH,
      args: ['process_media', mediaPath, processingType],
      timeout: 120000 // 2 minutes for media processing
    });
  }

  /**
   * Get available features for a user tier
   */
  async getTierFeatures(tier: string): Promise<any> {
    return this.executePythonScript({
      script: BRIDGE_SCRIPT_PATH,
      args: ['get_tier_features', tier]
    });
  }
} 