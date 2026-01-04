import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Task } from '@/api/endpoints/boards'

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    title: string
    description: string
    priority: 'low' | 'medium' | 'high'
    due_date: string | null
  }) => Promise<void>
  task?: Task | null
  columnId: number
}

export const TaskModal = ({ isOpen, onClose, onSubmit, task }: TaskModalProps) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [dueDate, setDueDate] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ title?: string }>({})

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description || '')
      setPriority(task.priority)
      setDueDate(task.due_date || '')
    } else {
      setTitle('')
      setDescription('')
      setPriority('medium')
      setDueDate('')
    }
    setErrors({})
  }, [task, isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    if (!title.trim()) {
      setErrors({ title: 'Task title is required' })
      return
    }

    if (title.length > 200) {
      setErrors({ title: 'Task title cannot exceed 200 characters' })
      return
    }

    setIsLoading(true)
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        priority,
        due_date: dueDate || null,
      })
    } catch {
      // Error handled in hook
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setTitle('')
    setDescription('')
    setPriority('medium')
    setDueDate('')
    setErrors({})
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative z-50 w-full max-w-lg bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {task ? 'Edit Task' : 'Create Task'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              disabled={isLoading}
            />
            {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task description"
              rows={3}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date (optional)</Label>
              <Input
                id="due_date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}