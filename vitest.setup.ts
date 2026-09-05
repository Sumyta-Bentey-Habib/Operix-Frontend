import "@testing-library/jest-dom/vitest";

process.env.NEXT_PUBLIC_API_BASE_URL ??= "http://localhost:5000/api/v1";

if (typeof window !== "undefined") {
  const store = new Map<string, string>();
  const localStorageMock: Storage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, String(value));
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
    get length() {
      return store.size;
    },
    key: (index: number) => Array.from(store.keys())[index] ?? null,
  };

  Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
    writable: true,
  });
}
