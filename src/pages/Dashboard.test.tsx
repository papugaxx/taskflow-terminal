import { beforeEach, expect, test } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Dashboard } from './Dashboard';
import { DEFAULT_SETTINGS } from '../utils/storage';

beforeEach(() => {
  localStorage.clear();
});

test('creates a new task and stores it locally', async () => {
  render(<Dashboard settings={DEFAULT_SETTINGS} />);

  fireEvent.click(screen.getByText('New task'));

  fireEvent.change(await screen.findByPlaceholderText('e.g. Launch landing page'), {
    target: { value: 'ALPHA_NODE_01' },
  });
  fireEvent.change(screen.getByPlaceholderText('Add context, acceptance criteria or next steps...'), {
    target: { value: 'System integration test description' },
  });

  fireEvent.click(screen.getByText('Save task'));

  await waitFor(() => {
    expect(screen.getByText('ALPHA_NODE_01')).toBeInTheDocument();
    expect(screen.getByText('System integration test description')).toBeInTheDocument();
  });
});
