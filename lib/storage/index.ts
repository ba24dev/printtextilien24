export interface StorageAdapter {
  uploadFile(bucket: string, path: string, file: File | Blob): Promise<string>;
  getFileUrl(bucket: string, path: string): Promise<string>;
}

let adapter: StorageAdapter | null = null;

export const setStorageAdapter = (storageAdapter: StorageAdapter) => {
  adapter = storageAdapter;
};

export const getStorageAdapter = (): StorageAdapter => {
  if (!adapter) {
    throw new Error("Storage adapter not set");
  }
  return adapter;
};
