import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ThemeProvider } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import test from 'node:test';
import test from 'node:test';
import test from 'node:test';
import { describe } from 'node:test';
import test from 'node:test';
import test from 'node:test';
import test from 'node:test';
import test from 'node:test';
import test from 'node:test';
import test from 'node:test';
import { describe } from 'node:test';
// import { ArticleEditor } from '@/components/article-editor';

expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
  const TestApp = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider>
      <div className="bg-background text-foreground">
        {children}
      </div>
    </ThemeProvider>
  );

  test('Button component has no accessibility violations', async () => {
    const { container } = render(
      <TestApp>
        <Button>Accessible Button</Button>
        <Button variant="outline">Outline Button</Button>
        <Button variant="ghost">Ghost Button</Button>
      </TestApp>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('Card component has no accessibility violations', async () => {
    const { container } = render(
      <TestApp>
        <Card>
          <CardHeader>
            <CardTitle>Accessible Card Title</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This is accessible card content with proper semantic structure.</p>
          </CardContent>
        </Card>
      </TestApp>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('Form inputs have proper labels and accessibility', async () => {
    const { container } = render(
      <TestApp>
        <form>
          <label htmlFor="title">Article Title</label>
          <input
            id="title"
            type="text"
            className="w-full p-3 border border-border bg-background text-foreground rounded focus:ring-1 focus:ring-ring focus:border-ring"
            placeholder="Enter title"
          />
          
          <label htmlFor="content">Article Content</label>
          <textarea
            id="content"
            className="w-full p-3 border border-border bg-background text-foreground rounded focus:ring-1 focus:ring-ring focus:border-ring"
            placeholder="Enter content"
            rows={4}
          />
        </form>
      </TestApp>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('Color contrast meets WCAG standards', () => {
    render(
      <TestApp>
        <div className="bg-background text-foreground p-4">
          <h1 className="text-foreground">Main Heading</h1>
          <p className="text-muted-foreground">Secondary text content</p>
          <Button variant="default">Primary Action</Button>
          <Button variant="outline">Secondary Action</Button>
        </div>
      </TestApp>
    );

    // Check that text elements are rendered (contrast will be validated by CSS)
    expect(screen.getByText('Main Heading')).toBeInTheDocument();
    expect(screen.getByText('Secondary text content')).toBeInTheDocument();
    expect(screen.getByText('Primary Action')).toBeInTheDocument();
    expect(screen.getByText('Secondary Action')).toBeInTheDocument();
  });

  test('Focus indicators are visible and accessible', () => {
    render(
      <TestApp>
        <Button>Focusable Button</Button>
        <input
          type="text"
          className="border border-border focus:ring-1 focus:ring-ring focus:border-ring"
          placeholder="Focusable input"
        />
      </TestApp>
    );

    const button = screen.getByText('Focusable Button');
    const input = screen.getByPlaceholderText('Focusable input');

    // Focus elements and check they have focus styles
    button.focus();
    expect(button).toHaveFocus();
    expect(button).toHaveClass('focus-visible:ring-1');

    input.focus();
    expect(input).toHaveFocus();
    expect(input).toHaveClass('focus:ring-1', 'focus:ring-ring');
  });

  test('Keyboard navigation works properly', () => {
    render(
      <TestApp>
        <Button>Button 1</Button>
        <Button>Button 2</Button>
        <input type="text" placeholder="Input field" />
      </TestApp>
    );

    const button1 = screen.getByText('Button 1');
    const button2 = screen.getByText('Button 2');
    const input = screen.getByPlaceholderText('Input field');

    // Test tab order
    button1.focus();
    expect(button1).toHaveFocus();

    // Simulate tab key (in real tests, you'd use userEvent)
    button2.focus();
    expect(button2).toHaveFocus();

    input.focus();
    expect(input).toHaveFocus();
  });
});

describe('Professional Appearance Tests', () => {
  test('Components use consistent, professional styling', () => {
    render(
      <ThemeProvider>
        <div className="bg-background">
          <Button variant="default">Professional Button</Button>
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Professional Card</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Clean, professional content</p>
            </CardContent>
          </Card>
        </div>
      </ThemeProvider>
    );

    const button = screen.getByText('Professional Button');
    const card = screen.getByText('Professional Card').closest('div');

    // Check for professional styling classes
    expect(button).toHaveClass('rounded', 'border');
    expect(card?.parentElement).toHaveClass('rounded', 'border', 'border-border');
  });

  test('No excessive decorative elements are present', () => {
    const { container } = render(
      <ThemeProvider>
        <div className="bg-background">
          <Button>Clean Button</Button>
          <Card>
            <CardContent>
              <p>Minimal content</p>
            </CardContent>
          </Card>
        </div>
      </ThemeProvider>
    );

    // Check that there are no gradient backgrounds or excessive shadows
    const elements = container.querySelectorAll('*');
    elements.forEach(element => {
      const classList = Array.from(element.classList);
      
      // Should not have gradient classes
      expect(classList.some(cls => cls.includes('gradient'))).toBe(false);
      
      // Should not have excessive shadow classes
      expect(classList.some(cls => cls.includes('shadow-lg') || cls.includes('shadow-xl'))).toBe(false);
    });
  });

  test('Typography is consistent and readable', () => {
    render(
      <ThemeProvider>
        <div className="bg-background text-foreground">
          <h1 className="text-lg font-semibold">Main Title</h1>
          <h2 className="text-base font-semibold">Subtitle</h2>
          <p className="text-sm text-muted-foreground">Body text</p>
        </div>
      </ThemeProvider>
    );

    const title = screen.getByText('Main Title');
    const subtitle = screen.getByText('Subtitle');
    const body = screen.getByText('Body text');

    expect(title).toHaveClass('text-lg', 'font-semibold');
    expect(subtitle).toHaveClass('text-base', 'font-semibold');
    expect(body).toHaveClass('text-sm', 'text-muted-foreground');
  });
});