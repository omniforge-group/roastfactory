import Replicate from "replicate";
import { put } from "@vercel/blob";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

type GenerateAudioInput = {
  prompt: string;
  lyrics: string;
};

type GenerateAudioResult = {
  success: boolean;
  audioUrl?: string;
  error?: string;
};

function trimLyrics(lyrics: string) {
  if (!lyrics) return "A simple emotional song about love and memories";

  if (lyrics.length < 20) {
    return "A heartfelt emotional song about love, memories and connection";
  }

  return lyrics;
}

export async function generateAudio({
  prompt,
  lyrics,
}: GenerateAudioInput): Promise<GenerateAudioResult> {
  try {
    const safePrompt = prompt?.trim()
      ? prompt.trim()
      : "A high quality emotional song with modern production, strong melody and clear vocals";

    const safeLyrics = trimLyrics(lyrics);

    const output = await replicate.run(
      "minimax/music-2.6",
      {
        input: {
          prompt: safePrompt,
          lyrics: safeLyrics,
          audio_format: "mp3",
          sample_rate: 44100,
          bitrate: 256000,
        },
      }
    );

    let audioUrl: string | undefined;

    if (Array.isArray(output)) {
      const first = output[0];

      if (typeof first === "string") {
        audioUrl = first;
      } else if (first && typeof first === "object") {
        const obj = first as Record<string, unknown>;

        if (typeof obj.audio === "string") {
          audioUrl = obj.audio;
        } else if (typeof obj.url === "string") {
          audioUrl = obj.url;
        }
      }
    } else if (typeof output === "string") {
      audioUrl = output;
    } else if (output && typeof output === "object") {
      const obj = output as Record<string, unknown>;

      if (typeof obj.audio === "string") {
        audioUrl = obj.audio;
      } else if (typeof obj.url === "string") {
        audioUrl = obj.url;
      }
    }

    if (!audioUrl) {
      return {
        success: false,
        error: "No audio URL returned",
      };
    }

    return {
      success: true,
      audioUrl,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unknown error during audio generation",
    };
  }
}

type DownloadAudioResult = {
  success: boolean;
  publicUrl?: string;
  error?: string;
};

export async function downloadAudioToServer(
  replicateUrl: string,
  orderId: string,
  version: 1 | 2
): Promise<DownloadAudioResult> {
  try {
    const response = await fetch(replicateUrl);
    if (!response.ok) {
      return { success: false, error: `Failed to fetch audio: ${response.status}` };
    }

    const filename = `songs/song-${orderId}-${version}-${Date.now()}.mp3`;
    const { url } = await put(filename, response.body!, {
      access: "public",
      contentType: "audio/mpeg",
    });

    return { success: true, publicUrl: url };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error during upload",
    };
  }
}
