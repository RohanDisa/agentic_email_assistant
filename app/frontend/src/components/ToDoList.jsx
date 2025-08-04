import { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";

// Animations
const slideIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Component Content Styles
const ComponentContent = styled.div`
  padding: 1.5rem;
  text-align: left;
  color: #9ca3af;
`;

const ComponentTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: white;
  text-align: center;
`;

const ComponentDescription = styled.p`
  text-align: center;
  margin-bottom: 2rem;
`;

// Todo-specific styles
const TodoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 400px;
  overflow-y: auto;
`;

const TodoItem = styled.div`
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: ${slideIn} 0.3s ease-out;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const TodoTitle = styled.h3`
  color: white;
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
`;

const TodoDescription = styled.p`
  color: #9ca3af;
  font-size: 0.875rem;
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
`;

const TodoMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: #6b7280;
`;

const TodoStatus = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-weight: 500;
  background-color: ${props => {
    switch (props.status) {
      case 'completed': return 'rgba(34, 197, 94, 0.2)';
      case 'in-progress': return 'rgba(251, 191, 36, 0.2)';
      default: return 'rgba(107, 114, 128, 0.2)';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'completed': return '#22c55e';
      case 'in-progress': return '#fbbf24';
      default: return '#9ca3af';
    }
  }};
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #9ca3af;
`;

const ErrorMessage = styled.div`
  text-align: center;
  color: #f87171;
  padding: 2rem;
  background-color: rgba(248, 113, 113, 0.1);
  border-radius: 0.5rem;
  border: 1px solid rgba(248, 113, 113, 0.2);
`;

const ToDoList = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      // Fetch from your existing API endpoint
      const response = await fetch('http://127.0.0.1:8000/gmail/todos');
      
      if (!response.ok) {
        throw new Error('Failed to fetch todos');
      }
      
      const data = await response.json();
      setTodos(data.todos);
    } catch (err) {
      setError(err.message);
      
      setTodos([
        {
          id: 1,
          title: "Review email templates",
          description: "Update and optimize existing email templates for better engagement",
          status: "pending",
          created_at: "2024-01-15T10:30:00Z",
          due_date: "2024-01-20"
        },
        {
          id: 2,
          title: "Organize inbox filters",
          description: "Set up automated filters to categorize incoming emails",
          status: "in-progress",
          created_at: "2024-01-14T14:20:00Z",
          due_date: "2024-01-18"
        },
        {
          id: 3,
          title: "Schedule client follow-ups",
          description: "Send follow-up emails to clients from last week's meetings",
          status: "completed",
          created_at: "2024-01-12T09:15:00Z",
          due_date: "2024-01-17"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <ComponentContent>
        <ComponentTitle>To-Do List</ComponentTitle>
        <LoadingSpinner>Loading your todos...</LoadingSpinner>
      </ComponentContent>
    );
  }

  if (error && todos.length === 0) {
    return (
      <ComponentContent>
        <ComponentTitle>To-Do List</ComponentTitle>
        <ErrorMessage>
          Error loading todos: {error}
        </ErrorMessage>
      </ComponentContent>
    );
  }

  return (
    <ComponentContent>
      <ComponentTitle>To-Do List</ComponentTitle>
      {todos.length === 0 ? (
        <ComponentDescription>No todos found. Create some todos in your database to see them here!</ComponentDescription>
      ) : (
        <>
          <ComponentDescription>You have {todos.length} todo{todos.length !== 1 ? 's' : ''}</ComponentDescription>
          <TodoList>
            {todos.map((todo) => (
              <TodoItem key={todo.id}>
                <TodoTitle>{todo.title}</TodoTitle>
                {todo.description && (
                  <TodoDescription>{todo.description}</TodoDescription>
                )}
                <TodoMeta>
                  <TodoStatus status={todo.status}>
                    {todo.status?.replace('-', ' ') || 'pending'}
                  </TodoStatus>
                  <span>
                    {todo.due_date && `Due: ${formatDate(todo.due_date)}`}
                  </span>
                </TodoMeta>
              </TodoItem>
            ))}
          </TodoList>
        </>
      )}
    </ComponentContent>
  );
};

export default ToDoList;