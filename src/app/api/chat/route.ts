import { type CoreMessage, streamText, tool } from "ai";
import { mistral } from '@ai-sdk/mistral';
import { groq } from '@ai-sdk/groq';
import { z } from 'zod';

// Fonction utilitaire pour obtenir le code IATA d'une ville via Nominatim + base statique
async function getAirportCode(city: string): Promise<string | null> {
  const cityToIata: Record<string, string> = {
    casablanca: "CMN",
    paris: "CDG",
    london: "LHR",
    newyork: "JFK",
    new_york: "JFK",
    frankfurt: "FRA",
    marrakech: "RAK",
    tunis: "TUN",
    algiers: "ALG",
    dubai: "DXB",
    istanbul: "IST",
    // Ajoute d'autres villes si besoin
  };
  const key = city.toLowerCase().replace(/\s+/g, '');
  if (cityToIata[key]) return cityToIata[key];
  return null;
}

export async function POST(request: Request) {
  const { messages }: { messages: CoreMessage[] } = await request.json();
  const stream = await streamText({
    model: groq('qwen-qwq-32b'),
    system: "You are a helpful assistant that can provide information about flights and weather.",
    messages,
    tools: {
      weather: tool({
        description: "Get the current weather for a given location.",
        parameters: z.object({
          location: z.string().describe("The location to get the weather for."),
        }),
        execute: async ({ location }) => {
          const apiKey = process.env.OPENWEATHER_API_KEY;
          if (!apiKey) {
            return {
              location,
              error: "API key for weather service is missing.",
            };
          }
          const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&units=metric&appid=${apiKey}`;
          try {
            const response = await fetch(url);
            if (!response.ok) {
              return {
                location,
                error: "Unable to fetch weather data.",
              };
            }
            const data = await response.json();
            return {
              location,
              temperature: data.main?.temp,
              description: data.weather?.[0]?.description,
            };
          } catch (error) {
            return {
              location,
              error: "An error occurred while fetching weather data.",
            };
          }
        },
      }),
      flights: tool({
        description: "Display available flights for a specified origin and destination.Both origin and destination are required (city or airport).",
        parameters: z.object({
          origin: z.string().describe("The origin city or airport."),
          destination: z.string().describe("The destination city or airport."),
        }),
        execute: async ({ origin, destination }) => {
          const apiKey = process.env.AVIATIONSTACK_API_KEY;
          if (!apiKey) {
            return {
              origin,
              destination,
              error: "API key for Aviationstack is missing.",
            };
          }
          // Conversion ville -> code IATA
          const originIata = await getAirportCode(origin);
          const destIata = await getAirportCode(destination);
          if (!originIata || !destIata) {
            return {
              origin,
              destination,
              error: "Unable to find airport code for origin or destination.",
            };
          }
          const url = `http://api.aviationstack.com/v1/flights?access_key=${apiKey}&dep_iata=${originIata}&arr_iata=${destIata}`;
          try {
            const response = await fetch(url);
            if (!response.ok) {
              return {
                origin,
                destination,
                error: "Unable to fetch flight data.",
              };
            }
            const data = await response.json();
            if (!data.data || data.data.length === 0) {
              return {
                origin,
                destination,
                flights: [],
                message: "No flights found from ${origin} to ${destination}.",
              };
            }
            type FlightData = {
              flight?: { iata?: string };
              airline?: { name?: string };
              departure?: { airport?: string; scheduled?: string };
              arrival?: { airport?: string; scheduled?: string };
              flight_status?: string;
            };
            const flights = data.data.slice(0, 5).map((flight: FlightData) => ({
              flight_number: flight.flight?.iata,
              airline: flight.airline?.name,
              from: flight.departure?.airport,
              to: flight.arrival?.airport,
              departure_time: flight.departure?.scheduled,
              arrival_time: flight.arrival?.scheduled,
              status: flight.flight_status,
            }));
            return {
              origin,
              destination,
              flights,
            };
          } catch (error) {
            return {
              origin,
              destination,
              error: error instanceof Error ? error.message : "An error occurred while fetching flight data.",
            };
          }
        },
      }),
    },
    maxSteps: 5,
  });
  return stream.toDataStreamResponse();
}