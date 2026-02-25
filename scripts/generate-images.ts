import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import { fileURLToPath } from 'url';
import { HfInference } from "@huggingface/inference";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get free token from https://huggingface.co/settings/tokens
const HF_ACCESS_TOKEN = process.env.HF_ACCESS_TOKEN;
const CSV_PATH = path.resolve(__dirname, '../packages/game-logic/src/games/the-line/data/events.csv');
const OUTPUT_DIR = path.resolve(__dirname, '../apps/web/public/games/the-line/cards');

async function generateImage(title: string, id: string, hf: HfInference) {
    const prompt = `Minimalistic hand-drawn line art of a ${title}, single continuous black line feeling. The background behind the line art features a few loose, abstract pastel color blob shadings (soft pink, light blue, mint green) that do not strictly stay within the lines, similar to a watercolor or digital brush wash behind the drawing. Clean white background overall. Monoline vector style icon.`;

    try {
        const blob = await hf.textToImage({
            model: "stabilityai/stable-diffusion-xl-base-1.0",
            inputs: prompt,
            parameters: {
                guidance_scale: 7.5,
            }
        });

        const buffer = Buffer.from(await blob.arrayBuffer());
        const filepath = path.join(OUTPUT_DIR, `${id}.png`);
        fs.writeFileSync(filepath, buffer);
        console.log(`✅ Generated and saved: ${id}.png (${title})`);
    } catch (error) {
        throw new Error(`HF API Error: ${error}`);
    }
}

async function main() {
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    if (!HF_ACCESS_TOKEN) {
        console.error("❌ Please set your HF_ACCESS_TOKEN environment variable. You can get one for free at Hugging Face.");
        return;
    }

    const hf = new HfInference(HF_ACCESS_TOKEN);
    const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
    const records = parse(csvContent, { columns: true, skip_empty_lines: true });

    console.log(`Loaded ${records.length} cards from CSV. Starting generation with Stable Diffusion XL...`);

    for (const record of records) {
        const { id, title } = record as { id: string, title: string };
        const filepath = path.join(OUTPUT_DIR, `${id}.png`);

        if (fs.existsSync(filepath)) {
            console.log(`⏭️ Skipping ${id}.png (already exists)`);
            continue;
        }

        console.log(`Generating image for: ${title} (${id})...`);
        try {
            await generateImage(title, id, hf);
        } catch (error) {
            console.error(`❌ Failed to generate for ${id} (${title}):`, error);
        }

        // Delay to respect API rate limits
        await new Promise(resolve => setTimeout(resolve, 8000));
    }

    console.log("Image generation complete!");
}

main().catch(console.error);
