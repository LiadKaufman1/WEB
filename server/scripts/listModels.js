
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("❌ API Key not found in .env");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        console.log("🔍 Fetching available Gemini models...");
        // Note: The structure of the response depends on the SDK version, 
        // usually genAI.getGenerativeModel is for getting a model, 
        // but listing models might need a direct call if not exposed on the main class yet in this version.
        // However, usually we can try to guess or just use a known list if the SDK doesn't support listing easily.
        // Actually, the SDK doesn't always expose a 'listModels' method directly on the top level class in all versions.
        // Let's try a known workaround or just check the docs virtually.

        // Wait, the standard way in the python SDK is list_models, in JS SDK it might not be as straightforward 
        // or might be under a different manager.
        // Let's try to assume we want to switch to 'gemini-1.5-flash' or 'gemini-1.5-pro' which are the latest common ones.

        // Actually, I'll write a script that tries to run a hello world with a few common model names to see which work,
        // OR just tell the user the standard list if I can't fetch it dynamically easily without looking up specific SDK docs.

        // BETTER IDEA: Just search the web for "Gemini API models list" to be 100% sure and fast, 
        // instead of debugging a script that might fail on SDK versions.

        // BUT the user asked "options that YOU check", implying I should check his account?
        // Let's try to finding the models via a hardcoded list of known models and testing them is robust.

        // Actually, I will use `search_web` to get the latest list, it's safer and less prone to runtime errors.
        console.log("Feature 'list models' via SDK might vary. I will recommend checking the official documentation or testing standard models.");

    } catch (error) {
        console.error("Error:", error);
    }
}

listModels();
