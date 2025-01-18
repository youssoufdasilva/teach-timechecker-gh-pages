import { supabase } from "../../db/supabase";
import { useState, useEffect } from "react";
import { RealtimeChannel } from "@supabase/supabase-js";

function App() {
  interface Todo {
    id: string;
    todo: string;
    created_at: string;
  }

  const [todos, setTodos] = useState<Todo[] | null>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newTodo, setNewTodo] = useState("");

  // Create a function to handle inserts with proper typing
  const handleInserts = (payload: { new: Todo }) => {
    console.log("Insert payload :: ", payload);
    setTodos((prevTodos) => [...(prevTodos || []), payload.new]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTodo.trim()) return;

    try {
      const { error: insertError } = await supabase
        .from("todos")
        .insert({ todo: newTodo.trim() });

      if (insertError) throw insertError;

      // Clear the input after successful insert
      setNewTodo("");
    } catch (err) {
      console.error("Insert error :: ", err);
      setError(err as Error);
    }
  };

  useEffect(() => {
    let subscription: RealtimeChannel;

    const fetchTodos = async () => {
      try {
        const { data, error } = await supabase.from("todos").select("*");

        if (error) throw error;

        setTodos(data as Todo[]);

        // Listen to inserts
        subscription = supabase
          .channel("todos")
          .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "todos" },
            handleInserts
          )
          .subscribe();
      } catch (err) {
        console.error("Supabase error :: ", err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
        console.log("Loading state set to false");
      }
    };

    fetchTodos();

    // Cleanup subscription on unmount
    return () => {
      console.log("Cleaning up subscription");
      subscription?.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <main className="container flex flex-col items-center mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Database Connection Test</h1>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Enter a new todo"
            className="flex-1 p-2 border rounded"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Todo
          </button>
        </div>
      </form>

      {error && <p className="text-red-500">Error: {error.message}</p>}
      {!error && (
        <ul className="space-y-2">
          {todos?.map((entry) => (
            <li key={entry.id} className="p-2 bg-gray-100 rounded">
              {entry.todo}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export default App;
