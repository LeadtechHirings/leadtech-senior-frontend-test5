import React, { useState, useEffect } from 'react';

const mockApi = {
  fetchBoard: async () => ({
    'col-1': { id: 'col-1', title: 'To Do', tasks: [{ id: 'task-1', content: 'Analyze user feedback' }] },
    'col-2': { id: 'col-2', title: 'In Progress', tasks: [{ id: 'task-2', content: 'Develop feature X' }, { id: 'task-3', content: 'Write documentation' }] },
    'col-3': { id: 'col-3', title: 'Done', tasks: [] },
  }),
  addNewTask: async (columnId: string, content: string) => {
    // Simulate network delay
    await new Promise(res => setTimeout(res, 500));
    return { id: `task-${Date.now()}`, content };
  },
  moveTask: async (taskId: string, newColumnId: string) => {
    // Simulate a potential network failure
    await new Promise(res => setTimeout(res, 800));
    if (Math.random() > 0.8) { // 20% chance of failure
      throw new Error("Failed to sync with the server.");
    }
    return { success: true };
  },
};

export const KanbanBoard = () => {
  const [board, setBoard] = useState<any>(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  useEffect(() => {
    mockApi.fetchBoard().then(data => setBoard(data));
  }, []);

  const handleAddTask = (columnId: string) => {
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
  
  const handleDragOver = (e, columnId: string) => {
    e.preventDefault();
    if (dragOverColumn !== columnId) {
      setDragOverColumn(columnId);
    }
  };
  
  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e, targetColumnId: string) => {
    if (!draggedItem) return;
    
    const { task, sourceColumnId } = draggedItem;

    if (sourceColumnId !== targetColumnId) {
      // Optimistically update the UI for a snappy feel!
      const newBoard = JSON.parse(JSON.stringify(board));

      const sourceTasks = newBoard[sourceColumnId].tasks;
      const taskIndex = sourceTasks.findIndex(t => t.id === task.id);
      if (taskIndex > -1) {
        sourceTasks.splice(taskIndex, 1);
        newBoard[targetColumnId].tasks.push(task);
        setBoard(newBoard);
      }
      
      mockApi.moveTask(task.id, targetColumnId)
        .catch(err => {
          console.error("Failed to move task:", err);
        });
    }

    setDraggedItem(null);
    setDragOverColumn(null);
  };

  if (!board) return <div>Loading board...</div>;

  return (
    <div style={{ display: 'flex', gap: '20px', padding: '20px', fontFamily: 'sans-serif' }}>
      {Object.values(board).map((column: any) => (
        <div
          key={column.id}
          onDragOver={(e) => handleDragOver(e, column.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, column.id)}
          style={{ 
            background: '#f4f4f4', 
            padding: '10px', 
            borderRadius: '5px', 
            width: '300px',
            transition: 'border 0.2s ease',
            border: dragOverColumn === column.id ? '2px dashed #007bff' : '2px solid transparent'
          }}
        >
          <h3>{column.title}</h3>
          <div>
            {column.tasks.map((task: any) => (
              <div
                key={task.id}
                draggable
                onDragStart={(e) => handleDragStart(e, task, column.id)}
                style={{ 
                  background: 'white', 
                  padding: '15px', 
                  margin: '10px 0', 
                  borderRadius: '5px', 
                  cursor: 'grab',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
              >
                {task.content}
              </div>
            ))}
          </div>
          <div 
            onClick={() => handleAddTask(column.id)} 
            style={{ cursor: 'pointer', color: '#007bff', padding: '10px', textAlign: 'center', borderRadius: '5px' }}
          >
            + Add Task
          </div>
        </div>
      ))}
    </div>
  );
};
