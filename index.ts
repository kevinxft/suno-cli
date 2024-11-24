#!/usr/bin/env node

import fs from "fs";
import path from "path";
import axios, { AxiosResponse } from "axios";
import * as cheerio from "cheerio";
import type { CheerioAPI } from "cheerio";

interface DownloadResult {
  success: boolean;
  path?: string;
  error?: string;
}

interface ScrapeResult {
  coverPath?: string;
  audioPath?: string;
  error?: string;
}

// Function to sanitize filename
const sanitizeFilename = (name: string): string => {
  return name
    .replace(/[<>:"/\\|?*]/g, '') // Remove invalid characters
    .replace(/\s+/g, '_')         // Replace spaces with underscores
    .toLowerCase();
};

// Function to get file extension from URL
const getExtension = (url: string): string => {
  const ext = path.extname(new URL(url).pathname);
  return ext || '.unknown';
};

// Function to download a file
const downloadFile = async (url: string, outputPath: string): Promise<DownloadResult> => {
  try {
    console.log(`Starting download from: ${url}`);
    console.log(`Saving to: ${outputPath}`);
    
    const response: AxiosResponse = await axios.get(url, { 
      responseType: "stream",
      timeout: 30000, // 30 seconds timeout
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const writer = fs.createWriteStream(outputPath);

    return new Promise((resolve) => {
      response.data.pipe(writer);
      
      writer.on("finish", () => {
        console.log(`Successfully downloaded to: ${outputPath}`);
        resolve({ success: true, path: outputPath });
      });
      
      writer.on("error", (error: Error) => {
        console.error(`Write stream error: ${error.message}`);
        fs.unlink(outputPath, () => {
          console.log(`Cleaned up failed file: ${outputPath}`);
        });
        resolve({ 
          success: false, 
          error: `Failed to write file: ${error.message}`
        });
      });

      response.data.on("error", (error: Error) => {
        console.error(`Download stream error: ${error.message}`);
        fs.unlink(outputPath, () => {
          console.log(`Cleaned up failed file: ${outputPath}`);
        });
        resolve({ 
          success: false, 
          error: `Failed to download: ${error.message}`
        });
      });
    });
  } catch (error) {
    console.error(`Axios error: ${error instanceof Error ? error.message : String(error)}`);
    return { 
      success: false, 
      error: `Error downloading ${url}: ${error instanceof Error ? error.message : String(error)}`
    };
  }
};

// Function to scrape Suno webpage
const scrapeSuno = async (sunoUrl: string): Promise<ScrapeResult> => {
  try {
    console.log(`Fetching page: ${sunoUrl}`);
    const { data: html } = await axios.get(sunoUrl, { timeout: 30000 });
    const $: CheerioAPI = cheerio.load(html);

    // Extract song title from og:title meta tag
    const title = $("meta[property='og:title']").attr("content") || "unknown";
    const songName = title.split('|')[0].trim().replace(" by @", "_by_");
    const sanitizedName = sanitizeFilename(songName);
    
    console.log(`Song name: ${songName}`);

    // Extract cover image URL from og:image meta tag
    const coverUrl = $("meta[property='og:image']").attr("content");
    if (!coverUrl) throw new Error("Cover image URL not found.");
    const coverExt = getExtension(coverUrl);
    const coverPath = path.join(process.cwd(), `${sanitizedName}_cover${coverExt}`);

    console.log(`Downloading cover image: ${coverUrl}`);
    const coverResult = await downloadFile(coverUrl, coverPath);
    if (!coverResult.success) {
      throw new Error(coverResult.error);
    }

    // Extract audio URL from og:audio meta tag
    const audioUrl = $("meta[property='og:audio']").attr("content");
    if (!audioUrl) throw new Error("Audio file URL not found.");
    const audioExt = getExtension(audioUrl);
    const audioPath = path.join(process.cwd(), `${sanitizedName}${audioExt}`);

    console.log(`Downloading audio file: ${audioUrl}`);
    const audioResult = await downloadFile(audioUrl, audioPath);
    if (!audioResult.success) {
      throw new Error(audioResult.error);
    }

    console.log("Download complete!");
    console.log(`Files saved as:\n- ${path.basename(coverPath)}\n- ${path.basename(audioPath)}`);
    
    return {
      coverPath: coverPath,
      audioPath: audioPath
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error scraping Suno: ${errorMessage}`);
    return { error: errorMessage };
  }
};

// Validate URL format
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// CLI entry point
const main = async (): Promise<void> => {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error("Usage: suno <suno_url>");
    process.exit(1);
  }

  const sunoUrl = args[0];
  if (!isValidUrl(sunoUrl)) {
    console.error("Error: Please provide a valid URL");
    process.exit(1);
  }

  const result = await scrapeSuno(sunoUrl);
  if (result.error) {
    process.exit(1);
  }
};

// Handle unhandled rejections
process.on("unhandledRejection", (error: Error) => {
  console.error("Unhandled rejection:", error);
  process.exit(1);
});

main().catch((error: Error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
