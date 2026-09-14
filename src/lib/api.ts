import coursesData from "@/data/courses.json";
import type { Course } from "@/types/course";

// This module is the single seam between the UI and "the backend."
// Right now it resolves from a local JSON file after an artificial delay,
// so every consumer already codes against a Promise-based contract.
// Swapping in a real API later means editing only this file.

const SIMULATED_LATENCY_MS = 500;

export function fetchCourses(options?: { simulateError?: boolean }): Promise<Course[]> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (options?.simulateError) {
        reject(new Error("Could not reach the course catalog. Please try again."));
        return;
      }
      resolve(coursesData.courses as Course[]);
    }, SIMULATED_LATENCY_MS);
  });
}
