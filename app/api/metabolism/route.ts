import { NextRequest, NextResponse } from 'next/server';
import { gemini } from '@/lib/gemini';
import { Type } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    const { action, data } = await req.json();

    if (action === 'analyze_interaction') {
      const { substances, userProfile } = data;
      const response = await gemini.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze potential interactions between these substances: ${substances.join(', ')}. 
        User Profile: Age ${userProfile.age}, Weight ${userProfile.weight}kg, Health Conditions: ${userProfile.healthConditions.join(', ')}.
        Consider drug-drug and food-drug interactions.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              interactions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    severity: { type: Type.STRING, description: "Low, Moderate, High" },
                    description: { type: Type.STRING },
                    recommendation: { type: Type.STRING }
                  },
                  required: ["severity", "description", "recommendation"]
                }
              }
            },
            required: ["interactions"]
          }
        }
      });
      return NextResponse.json(JSON.parse(response.text));
    }

    if (action === 'calculate_breakdown') {
      const { substance, userProfile } = data;
      const response = await gemini.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Estimate the pharmacokinetic breakdown of ${substance.name} (${substance.dosage}) for a user:
        Age ${userProfile.age}, Weight ${userProfile.weight}kg, Gender ${userProfile.gender}.
        Provide data points for a timeline of concentration in blood over 24 hours.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              timeline: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    hour: { type: Type.NUMBER },
                    concentration: { type: Type.NUMBER, description: "Estimated percentage of peak" }
                  },
                  required: ["hour", "concentration"]
                }
              },
              halfLife: { type: Type.STRING },
              metabolicFactors: { type: Type.STRING }
            },
            required: ["timeline", "halfLife"]
          }
        }
      });
      return NextResponse.json(JSON.parse(response.text));
    }

    if (action === 'personalized_plans') {
        const { userProfile, rmr } = data;
        const response = await gemini.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Generate personalized diet and exercise recommendations based on:
            RMR: ${rmr} kcal
            Profile: Age ${userProfile.age}, Weight ${userProfile.weight}kg, Activity Level: ${userProfile.activityLevel}.
            Health Conditions: ${userProfile.healthConditions.join(', ')}.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        dietRecommendations: { type: Type.STRING },
                        exercisePlan: { type: Type.STRING },
                        caloriesGoal: { type: Type.NUMBER }
                    },
                    required: ["dietRecommendations", "exercisePlan", "caloriesGoal"]
                }
            }
        });
        return NextResponse.json(JSON.parse(response.text));
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
