import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';

test('renders App', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );

  const element = screen.getByText(/KappaSigmaMu Society/i);
  expect(element).toBeInTheDocument();
});
