import { client } from "@app/config/redis";

type dataOptions = {
  prefix: string;
  key: string;
  value: object;
  ttl: number;
};

export const dataSave = async (data: dataOptions) => {
  const { prefix, key, value, ttl } = data;
  await client.set(`${prefix}:${key}`, JSON.stringify(value));
  await client.expire(`${prefix}:${key}`, ttl);
  return true;
};

export const getData = async (prefix: string, key: string) => {
  const data = await client.get(`${prefix}:${key}`);
  return data ? JSON.parse(data) : null;
};

export const delData = async (prefix: string, key: string) => {
  await client.del(`${prefix}:${key}`);
};

export const getKeysByPrefix = async (prefix: string) => {
  const keys = await client.keys(`${prefix}:*`);
  return keys.map((key) => key.replace(`${prefix}:`, ""));
};
