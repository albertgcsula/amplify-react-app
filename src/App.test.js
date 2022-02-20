import { render, screen } from '@testing-library/react';
import App from './App';

test('renders react posts header', () => {
  render(<App />);
  const headerElement = screen.getByText(/React Posts/i);
  expect(headerElement).toBeInTheDocument();
});
