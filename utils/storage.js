import { MMKV } from "react-native-mmkv";

export const storage = new MMKV();

export const setItem = (key, value) => {
  storage.set(key, JSON.stringify(value));
};

export const getItem = (key) => {
  const value = storage.getString(key);
  return value ? JSON.parse(value) : null;
};

export const removeItem = (key) => {
  storage.delete(key);
};
