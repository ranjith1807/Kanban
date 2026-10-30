import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import axios from "axios";
import "./App.css";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";

export default function App() {
  const [lists, setLists] = useState<any[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [activeListId, setActiveListId] = useState<number | null>(null);

  // 1. Fetch the board data from Spring Boot on load
  useEffect(() => {
    axios.get(`${API_URL}/lists`).then((res) => setLists(res.data));
  }, []);

  // 2. Add a new card to a specific list
  const addTask = async (listId: number) => {
    if (!newTaskTitle.trim()) return;
    
    const targetList = lists.find(l => l.id === listId);
    // Calculate a position at the bottom of the list
    const position = targetList.cards.length > 0 
        ? targetList.cards[targetList.cards.length - 1].position + 1000.0 
        : 1000.0;

    const res = await axios.post(`${API_URL}/lists/${listId}/cards`, { 
        title: newTaskTitle, 
        position: position 
    });
    
    setLists(lists.map(l => l.id === listId ? { ...l, cards: [...l.cards, res.data] } : l));
    setNewTaskTitle("");
    setActiveListId(null);
  };

  // 3. Handle Drag and Drop
  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    
    // Dropped outside a list or didn't move
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    // Clone state for optimistic UI update
    const newLists = [...lists];
    const sourceList = newLists.find((l) => String(l.id) === source.droppableId);
    const destList = newLists.find((l) => String(l.id) === destination.droppableId);

    // Remove from source, insert into destination
    const [movedCard] = sourceList!.cards.splice(source.index, 1);
    destList!.cards.splice(destination.index, 0, movedCard);

    // Fractional Indexing Math
    const prevCard = destList!.cards[destination.index - 1];
    const nextCard = destList!.cards[destination.index + 1];
    
    let newPosition = 1000.0;
    if (prevCard && nextCard) {
        newPosition = (prevCard.position + nextCard.position) / 2.0;
    } else if (prevCard) {
        newPosition = prevCard.position + 1000.0;
    } else if (nextCard) {
        newPosition = nextCard.position / 2.0;
    }

    movedCard.position = newPosition;
    setLists(newLists); // Update UI instantly

    // Sync with backend asynchronously
    try {
        await axios.patch(`${API_URL}/cards/${draggableId}/move?targetListId=${destination.droppableId}&newPosition=${newPosition}`);
    } catch (error) {
        console.error("Failed to save card movement to database", error);
        // In a production app, you would revert the UI state here if the API fails
    }
  };

  return (
    <main className="app-shell">
      <header className="board-header">
        <div>
          <p className="board-eyebrow">WORKSPACE / OVERVIEW</p>
          <h1>Project Board</h1>
          <p className="board-subtitle">A little progress every day adds up.</p>
        </div>
        <div className="board-summary" aria-label={`${lists.length} lists`}>
          <span className="summary-indicator" />
          {lists.length} {lists.length === 1 ? "list" : "lists"}
        </div>
      </header>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="board-columns">
          {lists.map((list, listIndex) => (
            <Droppable key={list.id} droppableId={String(list.id)}>
              {(provided) => (
                <section
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`board-column column-tone-${listIndex % 3}`}
                >
                  <div className="column-heading">
                    <span className={`column-dot column-dot-${listIndex % 3}`} />
                    <h2>{list.title}</h2>
                    <span className="column-count">{list.cards.length}</span>
                  </div>
                  
                  <div className="card-stack">
                    {list.cards.map((card: any, index: number) => (
                      <Draggable key={card.id} draggableId={String(card.id)} index={index}>
                        {(provided, snapshot) => (
                          <article
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`task-card${snapshot.isDragging ? " task-card-dragging" : ""}`}
                          >
                            <span className="card-grip" aria-hidden="true">⠿</span>
                            <p>{card.title}</p>
                          </article>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                  
                  <div className="add-card-area">
                    {activeListId === list.id ? (
                      <div className="add-card-form">
                        <input
                          autoFocus
                          type="text" 
                          placeholder="What needs to be done?" 
                          aria-label={`New card for ${list.title}`}
                          className="task-input"
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') addTask(list.id); }}
                          onBlur={() => { if(!newTaskTitle) setActiveListId(null); }}
                        />
                        <div className="form-actions">
                          <button onClick={() => addTask(list.id)} className="add-button">Add card</button>
                          <button onClick={() => {setActiveListId(null); setNewTaskTitle("");}} className="cancel-button">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setActiveListId(list.id)}
                        className="add-card-button"
                      >
                        <span aria-hidden="true">+</span> Add a card
                      </button>
                    )}
                  </div>
                </section>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </main>
  );
}