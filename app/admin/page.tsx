"use client";

import { useActionState, useState } from "react";
import { runQuery } from "@/app/actions/admin-db";
import CodeMirror from "@uiw/react-codemirror";
import { sql } from "@codemirror/lang-sql";

const DEFAULT_QUERY = "SELECT * FROM visitors ORDER BY timestamp DESC LIMIT 20";

export default function AdminPage() {
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [state, formAction] = useActionState(runQuery, {
    error: null,
    data: null,
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-6 text-3xl font-bold dark:text-white">SQL Console</h1>

        <form action={formAction} className="mb-8">
          {/* Hidden input to pass the query to the Server Action */}
          <input type="hidden" name="query" value={query} />

          <div className="overflow-hidden rounded-lg border border-gray-300 dark:border-zinc-800">
            <CodeMirror
              value={query}
              height="200px"
              extensions={[sql()]}
              onChange={(value) => setQuery(value)}
              theme="dark" // You can toggle this based on system pref if needed
              className="text-base"
            />
          </div>

          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              className="rounded bg-black px-4 py-2 text-white hover:bg-gray-800 dark:bg-white dark:text-black"
            >
              Run Query
            </button>
            <button
              type="button"
              onClick={() => setQuery("DELETE FROM visitors")}
              className="rounded border border-red-500 px-4 py-2 text-red-500 hover:bg-red-50"
            >
              Clear Data Template
            </button>
          </div>
        </form>

        {state.error && (
          <div className="mb-6 rounded bg-red-100 p-4 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            Error: {state.error}
          </div>
        )}

        {state.data && Array.isArray(state.data) && (
          <div className="overflow-x-auto rounded-lg border bg-white shadow dark:bg-zinc-900 dark:border-zinc-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-300">
                <tr>
                  {Object.keys((state.data[0] as object) || {}).map((key) => (
                    <th key={key} className="p-3 font-semibold">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-zinc-800 dark:text-gray-300">
                {state.data.map((row: any, i: number) => (
                  <tr
                    key={i}
                    className="hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                  >
                    {Object.values(row as object).map((val: any, j) => (
                      <td key={j} className="p-3">
                        {typeof val === "object"
                          ? JSON.stringify(val)
                          : String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {state.data.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                No results found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
