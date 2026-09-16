import { useEffect, useState } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/tasks'

function App() {
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [filter, setFilter] = useState('all')
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadTasks()
  }, [])

  async function loadTasks() {
    try {
      const response = await fetch(API_URL)
      if (!response.ok) throw new Error('Could not load your tasks.')
      setTasks(await response.json())
      setError('')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsLoading(false)
    }
  }

  async function addTask(event) {
    event.preventDefault()
    if (!title.trim()) return

    setIsSaving(true)
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description })
      })
      if (!response.ok) throw new Error('Could not add this task.')
      const task = await response.json()
      setTasks((currentTasks) => [task, ...currentTasks])
      setTitle('')
      setDescription('')
      setError('')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSaving(false)
    }
  }

  async function updateTask(id, changes) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes)
      })
      if (!response.ok) throw new Error('Could not update this task.')
      const updatedTask = await response.json()
      setTasks((currentTasks) => currentTasks.map((task) => (
        task.id === id ? updatedTask : task
      )))
      setError('')
      return true
    } catch (requestError) {
      setError(requestError.message)
      return false
    }
  }

  async function deleteTask(id) {
    try {
      const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Could not delete this task.')
      setTasks((currentTasks) => currentTasks.filter((task) => task.id !== id))
      setError('')
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  async function toggleTask(task) {
    await updateTask(task.id, { completed: !task.completed })
  }

  function startEditing(task) {
    setEditingId(task.id)
    setEditTitle(task.title)
    setEditDescription(task.description)
  }

  async function saveEdit(id) {
    if (!editTitle.trim()) return
    const saved = await updateTask(id, {
      title: editTitle,
      description: editDescription
    })
    if (saved) setEditingId(null)
  }

  const visibleTasks = tasks.filter((task) => {
    if (filter === 'active') return !task.completed
    if (filter === 'completed') return task.completed
    return true
  })

  const completedCount = tasks.filter((task) => task.completed).length

  return (
    <main className="dashboard-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Taskflow home">
          <span className="brand-mark">T</span>
          <span>taskflow</span>
        </a>
        <div className="date-note">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</div>
      </header>

      <section className="dashboard-header">
        <div>
          <p className="eyebrow">Your workspace</p>
          <h1>Make room for<br /><em>what matters.</em></h1>
          <p className="intro">A clear place for today&apos;s priorities, small wins, and everything in between.</p>
        </div>
        <div className="progress-card">
          <div className="progress-label"><span>Today&apos;s progress</span><strong>{tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0}%</strong></div>
          <div className="progress-track"><span style={{ width: `${tasks.length ? (completedCount / tasks.length) * 100 : 0}%` }} /></div>
          <p>{completedCount} of {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} complete</p>
        </div>
      </section>

      <section className="composer-section" aria-label="Add a task">
        <div className="section-kicker"><span className="kicker-line" /> Add a new task</div>
        <form className="composer" onSubmit={addTask}>
          <div className="composer-inputs">
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="What needs doing?" aria-label="Task title" />
            <input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Add a little context (optional)" aria-label="Task description" />
          </div>
          <button className="add-button" type="submit" disabled={isSaving || !title.trim()}><span>+</span> Add task</button>
        </form>
      </section>

      <section className="tasks-section" aria-label="Tasks">
        <div className="tasks-heading">
          <div><p className="section-kicker"><span className="kicker-line" /> Your list</p><h2>Tasks <span>{tasks.length}</span></h2></div>
          <div className="filters" role="tablist" aria-label="Filter tasks">
            {['all', 'active', 'completed'].map((option) => <button key={option} type="button" className={filter === option ? 'filter active' : 'filter'} onClick={() => setFilter(option)}>{option}</button>)}
          </div>
        </div>

        {error && <div className="error-message" role="alert">{error} <button type="button" onClick={loadTasks}>Try again</button></div>}
        {isLoading ? <div className="empty-state"><span className="loader" />Loading your tasks...</div> : visibleTasks.length === 0 ? <div className="empty-state"><span className="empty-mark">01</span><strong>{tasks.length ? 'Nothing here yet.' : 'Your list is wide open.'}</strong><p>{tasks.length ? 'Try another view to find a task.' : 'Add your first task above and get the day moving.'}</p></div> : <div className="task-list">
          {visibleTasks.map((task, index) => <article className={task.completed ? 'task-card completed' : 'task-card'} key={task.id} style={{ '--delay': `${index * 60}ms` }}>
            <button type="button" className="check-button" aria-label={task.completed ? 'Mark task active' : 'Mark task complete'} onClick={() => toggleTask(task)}>{task.completed && '✓'}</button>
            {editingId === task.id ? <div className="edit-fields"><input value={editTitle} onChange={(event) => setEditTitle(event.target.value)} aria-label="Edit task title" autoFocus /><input value={editDescription} onChange={(event) => setEditDescription(event.target.value)} aria-label="Edit task description" /><div className="edit-actions"><button type="button" onClick={() => saveEdit(task.id)}>Save</button><button type="button" onClick={() => setEditingId(null)}>Cancel</button></div></div> : <div className="task-content"><h3>{task.title}</h3>{task.description && <p>{task.description}</p>}</div>}
            {editingId !== task.id && <div className="task-actions"><button type="button" aria-label={`Edit ${task.title}`} onClick={() => startEditing(task)}>Edit</button><button type="button" aria-label={`Delete ${task.title}`} onClick={() => deleteTask(task.id)}>Delete</button></div>}
          </article>)}
        </div>}
      </section>
      <footer><span>taskflow</span><span>Keep going, one thing at a time.</span></footer>
    </main>
  )
}

export default App
