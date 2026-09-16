import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App.jsx'

const tasks = [{
  id: '1',
  title: 'Review deployment plan',
  description: 'Check the RDS settings.',
  completed: false
}]

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('Taskflow app', () => {
  it('loads tasks from the API', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => tasks
    }))

    render(<App />)

    expect(await screen.findByText('Review deployment plan')).toBeInTheDocument()
    expect(screen.getByText('Check the RDS settings.')).toBeInTheDocument()
  })

  it('creates a task through the API', async () => {
    const user = userEvent.setup()
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: '2', title: 'Ship feature', description: '', completed: false })
      })
    vi.stubGlobal('fetch', fetchMock)

    render(<App />)
    await screen.findByText('Your list is wide open.')

    await user.type(screen.getByLabelText('Task title'), 'Ship feature')
    await user.click(screen.getByRole('button', { name: /add task/i }))

    await waitFor(() => expect(screen.getByText('Ship feature')).toBeInTheDocument())
    expect(fetchMock).toHaveBeenLastCalledWith('/api/tasks', expect.objectContaining({ method: 'POST' }))
  })
})