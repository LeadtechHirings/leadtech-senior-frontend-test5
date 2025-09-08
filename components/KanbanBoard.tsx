import React, { useState, useEffect } from 'react';

// --- Mock API ---
const mockApi = {
  fetchBoard: async () => ({
    'col-1': { id: 'col-1', title: 'To Do', tasks: [{ id: 'task-1', content: 'Analyze user feedback' }] },
    'col-2': { id: 'col-2', title: 'In Progress', tasks: [{ id: 'task-2', content: 'Develop feature X' }] },
    'col-3': { id: 'col-3', title: 'Done', tasks: [] },
  }),
  addNewTask: async (columnId: string, content: string) => ({ id: `task-${Date.now()}`, content }),
  moveTask: async (taskId: string, newColumnId: string) => ({ success: true }),
};

// --- The Main Component ---
export const KanbanBoard = () => {
  const [board, setBoard] = useState<any>(null); // Loose typing
  const [draggedItem, setDraggedItem] = useState(null);

  useEffect(() => {
    mockApi.fetchBoard().then(data => setBoard(data));
  }, []);

  const handleAddTask = (columnId: string) => {
    const content = prompt("New task content:");
    if (content) {
      mockApi.addNewTask(columnId, content).then(newTask => {
        const newBoard = { ...board };
        newBoard[columnId].tasks.push(newTask);
        setBoard(newBoard); // Direct state mutation before this line
      });
    }
  };

  const handleDragStart = (e, task, columnId) => {
    setDraggedItem({ task, sourceColumnId: columnId });
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Necessary for drop to work
  };

  const handleDrop = (e, targetColumnId: string) => {
    if (!draggedItem) return;

    const { task, sourceColumnId } = draggedItem;

    // Don't do anything if dropped in the same column
    if (sourceColumnId === targetColumnId) {
      setDraggedItem(null);
      return;
    }

    // Optimistically update the UI for a snappy feel!
    const newBoard = JSON.parse(JSON.stringify(board)); // Inefficient deep copy

    // Remove task from source column
    const sourceTasks = newBoard[sourceColumnId].tasks;
    const taskIndex = sourceTasks.findIndex(t => t.id === task.id);
    sourceTasks.splice(taskIndex, 1);

    // Add task to target column
    newBoard[targetColumnId].tasks.push(task);

    setBoard(newBoard);

    // Fire and forget API call
    mockApi.moveTask(task.id, targetColumnId).catch(err => {
      // No error handling or UI rollback
      console.error("Failed to move task:", err);
    });

    setDraggedItem(null);
  };

  if (!board) return <div>Loading board...</div>;

  return (
    <div style={{ display: 'flex', gap: '20px', padding: '20px' }}>
      {Object.values(board).map((column: any) => (
        <div
          key={column.id}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, column.id)}
          style={{ background: '#f4f4f4', padding: '10px', borderRadius: '5px', width: '300px' }}
        >
          <h3>{column.title}</h3>
          {column.tasks.map((task: any) => (
            <div
              key={task.id}
              draggable
              onDragStart={(e) => handleDragStart(e, task, column.id)}
              style={{ background: 'white', padding: '15px', margin: '10px 0', borderRadius: '5px', cursor: 'grab' }}
            >
              {task.content}
            </div>
          ))}
          {/* Using a div as a button */}
          <div onClick={() => handleAddTask(column.id)} style={{ cursor: 'pointer', color: 'blue' }}>
            + Add Task
          </div>
        </div>
      ))}
    </div>
  );
};