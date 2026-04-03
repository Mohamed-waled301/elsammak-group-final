import axios from 'axios';
import { getApiBaseUrl } from '../config/api';

const baseURL = getApiBaseUrl();

export const api = axios.create({
  baseURL: baseURL || undefined,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
});
