// kiosk-autolocation.ts
'use server';

/**
 * @fileOverview Provides a Genkit flow for automatically suggesting the closest kiosk
 * based on the user's GPS location during check-in.
 *
 * - kioskAutolocation - A function that suggests the closest kiosk based on GPS location.
 * - KioskAutolocationInput - The input type for the kioskAutolocation function.
 * - KioskAutolocationOutput - The return type for the kioskAutolocation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const KioskSchema = z.object({
      id: z.string(),
      name: z.string(),
      latitude: z.number(),
      longitude: z.number(),
    });

const KioskAutolocationInputSchema = z.object({
  latitude: z
    .number()
    .describe('The latitude of the user.'),
  longitude: z
    .number()
    .describe('The longitude of the user.'),
  kioskList: z.array(KioskSchema).describe('A list of available kiosks with their locations.'),
});
export type KioskAutolocationInput = z.infer<typeof KioskAutolocationInputSchema>;

const KioskAutolocationOutputSchema = z.object({
  closestKioskId: z.string().describe('The ID of the closest kiosk to the user.'),
  distance: z.number().describe('Distance in meters to the closest kiosk.'),
});
export type KioskAutolocationOutput = z.infer<typeof KioskAutolocationOutputSchema>;

export async function kioskAutolocation(input: KioskAutolocationInput): Promise<KioskAutolocationOutput> {
  return kioskAutolocationFlow(input);
}

const kioskAutolocationFlow = ai.defineFlow(
  {
    name: 'kioskAutolocationFlow',
    inputSchema: KioskAutolocationInputSchema,
    outputSchema: KioskAutolocationOutputSchema,
  },
  async ({ latitude, longitude, kioskList }) => {
    // Haversine formula to calculate distance between two GPS coordinates
    function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
      const R = 6371e3; // Earth radius in meters
      const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
      const φ2 = lat2 * Math.PI / 180;
      const Δφ = (lat2 - lat1) * Math.PI / 180;
      const Δλ = (lon2 - lon1) * Math.PI / 180;

      const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      const distance = R * c;
      return distance;
    }

    let closestKioskId = '';
    let minDistance = Infinity;
    
    // Use a Map to automatically handle duplicates by kiosk ID.
    // If the input list has multiple kiosks with the same ID, only the last one will be kept.
    const uniqueKiosks = new Map(kioskList.map(k => [k.id, k]));

    for (const kiosk of uniqueKiosks.values()) {
      const distance = haversine(latitude, longitude, kiosk.latitude, kiosk.longitude);
      if (distance < minDistance) {
        minDistance = distance;
        closestKioskId = kiosk.id;
      }
    }

    if (closestKioskId === '') {
        throw new Error("No kiosks provided or list was empty after deduplication.");
    }

    return {
      closestKioskId: closestKioskId,
      distance: minDistance,
    };
  }
);
