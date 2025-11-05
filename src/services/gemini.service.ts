import { Injectable } from '@angular/core';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import { DogFriendlyData, GroundingChunk } from '../models/dog-friendly-data.model';

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private readonly genAI: GoogleGenAI;

  constructor() {
    // IMPORTANT: The API key is injected via environment variables.
    // Do not hardcode the API key in the code.
    this.genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async findDogFriendlySpots(
    location: string
  ): Promise<{ data: DogFriendlyData; sources: GroundingChunk[] }> {
    const model = this.genAI.models;
    const prompt = `Analiziraj lokaciju: "${location}". Djeluj kao hiperlokalni ekspert i vodič za vlasnike pasa. Tvoj cilj je otkriti sigurne, dozvoljene i skrivene lokacije (lokalne tajne) koje turisti ne poznaju, već samo lokalni stanovnici. Koristi podatke s lokalnih blogova, foruma (npr. Reddit), planinarskih grupa i recenzija (Google Maps reviews) kako bi sintetizirao jedinstvene preporuke. Generiraj isključivo JSON objekt. Za svaku lokaciju (park, pet shop, veterinar) obavezno uključi i 'latitude' i 'longitude' koordinate. Unutar niza 'veterinari', za podatak o hitnoj službi koristi ključ 'hitna_sluzba' (boolean).`;

    try {
      const response: GenerateContentResponse = await model.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      // The API might wrap the JSON in markdown backticks.
      // We need to extract the raw JSON string before parsing.
      const rawText = response.text.trim();
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        console.error("No valid JSON object found in API response. Raw text:", rawText);
        throw new Error("Odgovor API-ja ne sadrži ispravan JSON objekt.");
      }

      const jsonText = jsonMatch[0];
      const data = JSON.parse(jsonText) as DogFriendlyData;
      const sources = (response.candidates?.[0]?.groundingMetadata
        ?.groundingChunks ?? []) as GroundingChunk[];

      return { data, sources };
    } catch (error) {
      console.error('Error calling or processing Gemini API response:', error);
      const errorMessage = error instanceof Error ? error.message : 'Nepoznata pogreška.';
      throw new Error(
        `Došlo je do pogreške pri dohvaćanju podataka. ${errorMessage}`
      );
    }
  }
}