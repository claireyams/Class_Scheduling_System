import type { Course } from "@/types/course";
import { CourseCard } from "./CourseCard";
import { EmptyState } from "./StatusStates";

interface CourseListProps {
  courses: Course[];
}

export function CourseList({ courses }: CourseListProps) {
  if (courses.length === 0) {
    return (
      <EmptyState
        title="No courses match"
        description="Try a different search term or switch categories."
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
