"use client";

import { Todo } from "@/app/generated/prisma/client";
import { useUser } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";
import { useDebounceValue } from "usehooks-ts";
import axios from "axios";
import { useRouter } from "next/navigation";

interface SubsData {
  isSubscribed: boolean;
  subscriptionEnds: Date;
}

export default function DashboardPage() {
  const { user } = useUser();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debounceSearchTerm] = useDebounceValue(searchTerm, 500);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [maxError, setMaxError] = useState("");
  const router = useRouter();

  const fetchTodos = useCallback(
    async (page: number) => {
      try {
        setLoading(true);
        const response = await axios.get(
          `/api/todos?page=${page}&search=${debounceSearchTerm}`,
        );
        if (!response.data) {
          throw new Error("Failed to fetch data");
        }
        const data = response.data;
        setTodos(data.todos);
        setTotalPages(data.totalPages);
        setCurrentPage(data.currentPage);
        setLoading(false);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    },
    [debounceSearchTerm],
  );

  useEffect(() => {
    fetchTodos(1);
    fetchSubscriptionStatus();
  }, [fetchTodos]);

  const fetchSubscriptionStatus = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/subscription");
      if (!response.data) {
        throw new Error("Failed to fetch data");
      }
      const data: SubsData = response.data;
      setIsSubscribed(data.isSubscribed);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTodo = async () => {
    if (!newTodoTitle.trim()) return;
    try {
      await axios.post("/api/todos", { title: newTodoTitle });
      await fetchTodos(currentPage);
    } catch (error: any) {
      if (error.response?.status === 403) {
        setMaxError(error.response.data.message);
      }
      console.log(error);
    }
  };

  const handleUpdateTodo = async (id: string, completed: boolean) => {
    try {
      const response = await axios.patch(`/api/todos/${id}`, { completed });
      if (!response.data) {
        throw new Error("Failed to update todo");
      }
      await fetchTodos(currentPage);
    } catch (error) {
      console.log("error");
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      await axios.delete(`/api/todos/${id}`);
      await fetchTodos(currentPage);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-medium">My Todos</h1>
          <p className="text-sm text-gray-500">Welcome back, {user?.id}</p>
        </div>
        {isSubscribed && (
          <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700">
            Pro
          </span>
        )}
      </div>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Add a new todo..."
          value={newTodoTitle}
          onChange={(e) => setNewTodoTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddTodo()}
          className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-gray-300"
        />
        <button
          onClick={handleAddTodo}
          className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">
          Add
        </button>
      </div>

      {maxError && (
        <div className="flex gap-2 mb-4">
          <span>{maxError}</span>
          <span>
            <button
              onClick={() => {
                router.push("/subscription");
              }}
              className="p-2 text-sm rounded-lg bg-black text-white hover:bg-gray-800 disabled:opacity-50">
              Subscribe
            </button>
          </span>
        </div>
      )}

      <input
        type="text"
        placeholder="Search todos..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-gray-300 mb-4"
      />

      <div className="border rounded-lg overflow-hidden">
        {loading ? (
          <p className="text-sm text-gray-400 text-center py-6">Loading...</p>
        ) : todos.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">
            No todos found.
          </p>
        ) : (
          todos.map((todo) => (
            <div
              key={todo.id}
              className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => handleUpdateTodo(todo.id, !todo.completed)}
                className="w-4 h-4 cursor-pointer"
              />
              <span
                className={`flex-1 text-sm ${
                  todo.completed ? "line-through text-gray-400" : ""
                }`}>
                {todo.title}
              </span>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="text-xs text-red-400 hover:text-red-600">
                Delete
              </button>
            </div>
          ))
        )}
      </div>

      <div className="flex items-center justify-between mt-4">
        <button
          onClick={() => fetchTodos(currentPage - 1)}
          disabled={currentPage <= 1}
          className="text-sm px-3 py-1 border rounded-lg disabled:opacity-40 hover:bg-gray-50">
          ← Prev
        </button>
        <span className="text-sm text-gray-500">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => fetchTodos(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="text-sm px-3 py-1 border rounded-lg disabled:opacity-40 hover:bg-gray-50">
          Next →
        </button>
      </div>
    </div>
  );
}
