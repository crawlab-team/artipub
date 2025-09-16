import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@/components/theme-provider';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import test from 'node:test';
import test from 'node:test';
import { describe } from 'node:test';
import test from 'node:test';
import test from 'node:test';
import { describe } from 'node:test';
import test from 'node:test';
import test from 'node:test';
import test from 'node:test';
import test from 'node:test';
import test from 'node:test';
import { describe } from 'node:test';

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: jest.fn(),
    themes: ['light', 'dark', 'system'],
  }),
}));

describe('Theme Switching Tests', () => {
  const TestComponent = () => (
    <ThemeProvider>
      <div className="bg-background text-foreground">
        <ThemeToggle />
        <Button variant="default">Test Button</Button>
        <Card>
          <CardHeader>
            <CardTitle>Test Card</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Test content</p>
          </CardContent>
        </Card>
      </div>
    </ThemeProvider>
  );

  test('renders theme toggle component', () => {
    render(<TestComponent />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('button component uses proper theme classes', () => {
    render(<TestComponent />);
    const button = screen.getByText('Test Button');
    expect(button).toHaveClass('bg-primary', 'text-primary-foreground');
  });

  test('card component uses proper theme classes', () => {
    render(<TestComponent />);
    const card = screen.getByText('Test Card').closest('div');
    expect(card?.parentElement).toHaveClass('bg-card', 'text-card-foreground', 'border-border');
  });

  test('muted text uses proper theme classes', () => {
    render(<TestComponent />);
    const mutedText = screen.getByText('Test content');
    expect(mutedText).toHaveClass('text-muted-foreground');
  });

  test('background and foreground classes are applied', () => {
    render(<TestComponent />);
    const container = screen.getByText('Test Button').closest('div');
    expect(container).toHaveClass('bg-background', 'text-foreground');
  });
});

describe('CSS Custom Properties Tests', () => {
  test('CSS custom properties are defined', () => {
    // Create a test element to check computed styles
    const testElement = document.createElement('div');
    testElement.className = 'bg-background text-foreground border-border';
    document.body.appendChild(testElement);

    const computedStyle = window.getComputedStyle(testElement);
    
    // Check that CSS custom properties are being used
    expect(computedStyle.getPropertyValue('--background')).toBeDefined();
    expect(computedStyle.getPropertyValue('--foreground')).toBeDefined();
    expect(computedStyle.getPropertyValue('--border')).toBeDefined();

    document.body.removeChild(testElement);
  });

  test('dark theme CSS custom properties are different from light theme', () => {
    // Create test elements for light and dark themes
    const lightElement = document.createElement('div');
    lightElement.className = 'bg-background';
    
    const darkElement = document.createElement('div');
    darkElement.className = 'dark bg-background';
    
    document.body.appendChild(lightElement);
    document.body.appendChild(darkElement);

    const lightStyle = window.getComputedStyle(lightElement);
    const darkStyle = window.getComputedStyle(darkElement);
    
    // Background colors should be different between themes
    const lightBg = lightStyle.getPropertyValue('--background');
    const darkBg = darkStyle.getPropertyValue('--background');
    
    expect(lightBg).not.toBe(darkBg);

    document.body.removeChild(lightElement);
    document.body.removeChild(darkElement);
  });
});

describe('Professional Styling Tests', () => {
  test('components use consistent border radius', () => {
    render(
      <div>
        <Button>Test Button</Button>
        <Card>
          <CardContent>Test Card</CardContent>
        </Card>
      </div>
    );

    const button = screen.getByText('Test Button');
    const card = screen.getByText('Test Card').closest('div');

    // Both should use the consistent border radius
    expect(button).toHaveClass('rounded');
    expect(card?.parentElement).toHaveClass('rounded');
  });

  test('shadows are minimal and professional', () => {
    const testElement = document.createElement('div');
    testElement.className = 'shadow-sm';
    document.body.appendChild(testElement);

    const computedStyle = window.getComputedStyle(testElement);
    const boxShadow = computedStyle.getPropertyValue('box-shadow');
    
    // Should have minimal shadow
    expect(boxShadow).toContain('0 1px 2px');
    expect(boxShadow).toContain('0.05'); // Low opacity for professional look

    document.body.removeChild(testElement);
  });
});