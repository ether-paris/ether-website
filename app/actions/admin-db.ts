"use server";

import { executeQuery } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function runQuery(prevState: any, formData: FormData) {
  const query = formData.get("query") as string;

  if (!query) {
    return { error: "Query cannot be empty", data: null };
  }

  // Basic security check (Note: In a real app, strict parsing/permissions are needed)
  if (
    query.toLowerCase().includes("drop table") ||
    query.toLowerCase().includes("delete from visitors")
  ) {
    // Optional: blocked queries
  }

  try {
    const result = executeQuery(query);
    revalidatePath("/admin");

    // Handle RunResult vs Select Result
    // bun:sqlite .run() returns { lastInsertRowid, changes }
    // .all() returns Array

    let displayData: any[] = [];

    if (Array.isArray(result)) {
      displayData = result;
    } else if (result && typeof result === "object") {
      // It's a RunResult
      displayData = [
        {
          message: "Query executed successfully",
          changes: (result as any).changes,
          lastInsertRowid: (result as any).lastInsertRowid,
        },
      ];
    }

    return { error: null, data: displayData };
  } catch (error: any) {
    return { error: error.message, data: null };
  }
}
