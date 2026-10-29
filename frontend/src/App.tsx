import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import axios from "axios";

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
    <div className="p-8 min-h-screen font-sans">
      <h1 className="text-3xl font-bold text-slate-800 mb-8 tracking-tight">Project Board</h1>
      
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 items-start overflow-x-auto pb-4">
          {lists.map((list) => (
            <Droppable key={list.id} droppableId={String(list.id)}>
              {(provided) => (
                <div 
                  ref={provided.innerRef} 
                  {...provided.droppableProps} 
                  className="bg-slate-200/50 w-80 p-4 rounded-xl shrink-0"
                >
                  <h2 className="font-semibold text-slate-700 mb-4 px-1">{list.title}</h2>
                  
                  <div className="flex flex-col gap-3 min-h-[50px]">
                    {list.cards.map((card: any, index: number) => (
                      <Draggable key={card.id} draggableId={String(card.id)} index={index}>
                        {(provided, snapshot) => (
                          <div 
                            ref={provided.innerRef} 
                            {...provided.draggableProps} 
                            {...provided.dragHandleProps} 
                            className={`bg-white p-3 rounded-lg shadow-sm border border-slate-200 
                                ${snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-400 rotate-2' : 'hover:border-slate-300'} 
                                transition-all duration-200`}
                          >
                            <p className="text-slate-700 text-sm">{card.title}</p>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                  
                  {/* Add Task Input Area */}
                  <div className="mt-4">
                    {activeListId === list.id ? (
                      <div className="flex flex-col gap-2">
                        <input 
                          autoFocus
                          type="text" 
                          placeholder="What needs to be done?" 
                          className="border border-slate-300 p-2 rounded-lg w-full text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500" 
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') addTask(list.id); }}
                          onBlur={() => { if(!newTaskTitle) setActiveListId(null); }}
                        />
                        <div className="flex gap-2">
                            <button onClick={() => addTask(list.id)} className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-700">Add</button>
                            <button onClick={() => {setActiveListId(null); setNewTaskTitle("");}} className="text-slate-500 hover:text-slate-700 px-2 text-sm font-medium">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setActiveListId(list.id)}
                        className="flex items-center gap-1 text-slate-500 hover:text-slate-800 hover:bg-slate-300/50 w-full p-2 rounded-lg transition-colors text-sm font-medium"
                      >
                        <span className="text-lg leading-none">+</span> Add a card
                      </button>
                    )}
                  </div>

                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}