import React, { useState, useEffect } from 'react';

// --- (Mock API is the same) ---
const mockApi = {
  fetchBoard: async () => ({ /* ... */ }),
  addNewTask: async (columnId: string, content: string) => ({ id: `task-${Date.now()}`, content }),
  moveTask: async (taskId: string, newColumnId: string) => ({ success: true }),
};

export const KanbanBoard = () => {
  const [board, setBoard] = useState<any>(null);
  const [draggedItem, setDraggedItem] = useState(null);
  // NEW CHALLENGE: State for visual feedback during drag-over
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  useEffect(() => {
    mockApi.fetchBoard().then(data => setBoard(data));
  }, []);

  const handleAddTask = (columnId: string) => {
    // NEW CHALLENGE: Untestable side effect
    const content = prompt("New task content:");
    if (content) {
      mockApi.addNewTask(columnId, content).then(newTask => {
        const newBoard = { ...board };
        newBoard[columnId].tasks.push(newTask);
        setBoard(newBoard);
      });
    }
  };

  const handleDragStart = (e, task, columnId) => {
    setDraggedItem({ task, sourceColumnId: columnId });
  };
  
  // NEW CHALLENGE: High-frequency state updates
  const handleDragOver = (e, columnId: string) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  };
  
  const handleDragLeave = (e) => {
    setDragOverColumn(null);
  };

  const handleDrop = (e, targetColumnId: string) => {
    // ... (rest of the drop logic is the same) ...
    setDragOverColumn(null); // Reset visual state
    // ...
  };

  if (!board) return <div>Loading board...</div>;

  return (
    <div style={{ display: 'flex', gap: '20px', padding: '20px' }}>
      {Object.values(board).map((column: any) => (
        <div
          key={column.id}
          onDragOver={(e) => handleDragOver(e, column.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, column.id)}
          // Visual feedback style based on the new state
          style={{ 
            background: '#f4f4f4', padding: '10px', borderRadius: '5px', width: '300px',
            border: dragOverColumn === column.id ? '2px dashed blue' : '2px solid transparent' // New
          }}
        >
          {/* ... (rest of the component is the same) ... */}
        </div>
      ))}
    </div>
  );
};