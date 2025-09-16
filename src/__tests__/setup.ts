import '@testing-library/jest-dom';

// Mock CSS custom properties for tests
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: (prop: string) => {
      // Mock CSS custom property values
      const mockValues: Record<string, string> = {
        '--background': '0 0% 100%',
        '--foreground': '222.2 84% 4.9%',
        '--border': '214.3 31.8% 91.4%',
        '--primary': '221.2 83.2% 53.3%',
        '--muted-foreground': '215.4 16.3% 46.9%',
      };
      return mockValues[prop] || '';
    },
  }),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};