import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useKanbanStore } from '../store/kanbanStore'

interface ColumnModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (name: string) => Promise<void>
}

export const ColumnModal = ({ isOpen, onClose, onSubmit }: ColumnModalProps) => {
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const board = useKanbanStore((state) => state.board)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const trimmedName = name.trim()

    if (!trimmedName) {
      setError('Column name is required')
      return
    }

    if (trimmedName.length > 50) {
      setError('Column name cannot exceed 50 characters')
      return
    }

    // Check for duplicate column names
    if (board) {
      const isDuplicate = board.columns.some(
        (col) => col.name.toLowerCase() === trimmedName.toLowerCase()
      )
      if (isDuplicate) {
        setError('A column with this name already exists')
        return
      }
    }

    setIsLoading(true)
    try {
      await onSubmit(trimmedName)
      setName('')
    } catch {
      // Error handled in hook
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setName('')
    setError('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative z-50 w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Column</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="columnName">Column Name</Label>
            <Input
              id="columnName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Review, Testing"
              disabled={isLoading}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Add Column'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}