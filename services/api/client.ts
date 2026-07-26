import { api } from "./axios";

export const get = async (url: string) => {
  const { data } = await api.get(url);
  return data;
};

export const post = async (
  url: string,
  body: unknown
) => {
  const { data } = await api.post(url, body);
  return data;
};