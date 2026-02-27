/**
 * MATIEO Node API — ML Service Client
 * Proxies requests to the Python FastAPI ML service.
 * Always includes timeout + graceful fallback so ML failures
 * never break core memorial functionality.
 */

import axios, { AxiosInstance } from 'axios';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
const ML_SERVICE_SECRET = process.env.ML_SERVICE_SECRET || '';
const ML_TIMEOUT_MS = 10_000; // 10 seconds — fail fast

const mlClient: AxiosInstance = axios.create({
  baseURL: ML_SERVICE_URL,
  timeout: ML_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
    'X-ML-Secret': ML_SERVICE_SECRET,
  },
});

// ── Types ────────────────────────────────────────────────────────────────────

export interface TrendPredictionRequest {
  country: string;
  cause_of_death?: string;
  age_group?: string;
  years_ahead?: number;
}

export interface TrendPredictionResponse {
  country: string;
  cause_of_death?: string;
  predictions: Array<{ year: number; predicted_deaths: number; confidence: number }>;
  model_version: string;
}

export interface BiographyNLPRequest {
  biography: string;
  tribute_message?: string;
}

export interface BiographyNLPResponse {
  themes: string[];
  sentiment: string;
  sentiment_score: number;
  key_phrases: string[];
  suggested_tags: string[];
}

// ── Fallback responses ────────────────────────────────────────────────────────

const FALLBACK_NLP: BiographyNLPResponse = {
  themes: [],
  sentiment: 'unknown',
  sentiment_score: 0,
  key_phrases: [],
  suggested_tags: [],
};

// ── Methods ───────────────────────────────────────────────────────────────────

export async function getMortalityPrediction(
  payload: TrendPredictionRequest
): Promise<TrendPredictionResponse | null> {
  try {
    const { data } = await mlClient.post<TrendPredictionResponse>(
      '/predictions/trend',
      payload
    );
    return data;
  } catch (err) {
    console.warn('[mlClient] Prediction service unavailable — returning null', err);
    return null; // Caller handles null gracefully
  }
}

export async function analyzeMemorialBiography(
  payload: BiographyNLPRequest
): Promise<BiographyNLPResponse> {
  try {
    const { data } = await mlClient.post<BiographyNLPResponse>(
      '/nlp/analyze',
      payload
    );
    return data;
  } catch (err) {
    console.warn('[mlClient] NLP service unavailable — returning fallback', err);
    return FALLBACK_NLP;
  }
}

export async function isMLServiceHealthy(): Promise<boolean> {
  try {
    await mlClient.get('/health', { timeout: 3000 });
    return true;
  } catch {
    return false;
  }
}
