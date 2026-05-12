import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type GenerateLyricsInput = {
  name?: string | null;
  story?: string | null;
  occasion?: string | null;
  style?: string | null;
  language?: string | null;
  mood?: string | null;
  tempo?: string | null;
};

function mapStyle(style?: string | null) {
  switch (style) {
    case "Pop":
      return "modern pop song with a catchy chorus and clean production";
    case "Ballad":
      return "emotional ballad with deep feelings and slow build-up";
    case "Rap":
      return "rhythmic rap with flow and spoken style lyrics";
    case "Akoestisch":
      return "acoustic song with guitar and intimate feeling";
    default:
      return "modern pop song";
  }
}

function mapMood(mood?: string | null) {
  switch (mood) {
    case "Emotioneel":
      return "very emotional and heartfelt";
    case "Vrolijk":
      return "happy, uplifting and energetic";
    case "Grappig":
      return "funny, playful and lighthearted";
    case "Romantisch":
      return "romantic and loving";
    default:
      return "emotional";
  }
}

function mapTempo(tempo?: string | null) {
  switch (tempo) {
    case "Slow":
      return "slow tempo";
    case "Medium":
      return "medium tempo";
    case "Fast":
      return "fast tempo";
    default:
      return "medium tempo";
  }
}

function mapOccasion(occasion?: string | null) {
  switch (occasion) {
    case "Verjaardag":
      return "birthday celebration";
    case "Liefde":
      return "love and relationship";
    case "Jubileum":
      return "anniversary and shared memories";
    case "Bedankje":
      return "gratitude and appreciation";
    case "Vriendschap":
      return "friendship and connection";
    default:
      return "a special moment";
  }
}

export async function generateLyrics(input: GenerateLyricsInput) {
  const language = input.language || "Dutch";

  const styleDesc = mapStyle(input.style);
  const moodDesc = mapMood(input.mood);
  const tempoDesc = mapTempo(input.tempo);
  const occasionDesc = mapOccasion(input.occasion);

  const prompt = `
Write a HIGH QUALITY, PERSONALIZED SONG.

LANGUAGE:
- The song MUST be written in: ${language}
- Do NOT switch language

SONG STYLE:
- ${styleDesc}
- ${moodDesc}
- ${tempoDesc}

THEME:
- ${occasionDesc}

DETAILS:
Name: ${input.name || "Someone"}

STORY:
${input.story || "A meaningful emotional story"}

STRUCTURE:
[Verse 1]
[Chorus]
[Verse 2]
[Chorus]
[Bridge]
[Final Chorus]

RULES:
- Make it VERY personal
- Use details from the story
- Avoid generic lyrics
- Make the chorus catchy and memorable
- Feel like a real song, not AI

OUTPUT:
Only return the lyrics.
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return response.choices[0]?.message?.content || "";
}
