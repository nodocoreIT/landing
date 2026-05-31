"use client";

import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createClient } from "@/lib/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Task = {
  id: string;
  title: string;
  description: string | null;
  unit_code: string;
  status: "backlog" | "doing" | "review" | "done";
  priority: "alta" | "media" | "baja";
  assignee: string | null;
  due_date: string | null;
  position: number;
};

export type Profile = {
  id: string;
  full_name: string;
  initials: string;
  color: string;
};

type KanbanBoardProps = {
  initialTasks: Task[];
  profiles: Profile[];
  units: string[];
  searchTerm: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const COLUMNS: { id: Task["status"]; label: string; color: string }[] = [
  { id: "backlog", label: "Por hacer", color: "#9DACBE" },
  { id: "doing", label: "En progreso", color: "#2A6FDB" },
  { id: "review", label: "En revisión", color: "#DA5A0E" },
  { id: "done", label: "Hecho", color: "#1F8A5B" },
];

const PRIORITY_STYLES: Record<
  Task["priority"],
  { bg: string; color: string; label: string }
> = {
  alta: { bg: "#FBE6E1", color: "#C0392B", label: "Alta" },
  media: { bg: "#FCE9D8", color: "#B5630C", label: "Media" },
  baja: { bg: "var(--color-mist)", color: "var(--color-slate2)", label: "Baja" },
};

const MONTH_NAMES = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
}

// ─── TaskCard (pure visual) ───────────────────────────────────────────────────

function TaskCard({
  task,
  profiles,
}: {
  task: Task;
  profiles: Profile[];
}) {
  const assignee = profiles.find((p) => p.id === task.assignee);
  const priority = PRIORITY_STYLES[task.priority];

  return (
    <div
      style={{
        background: "white",
        border: "1px solid var(--color-mist)",
        borderRadius: 8,
        padding: 14,
        marginBottom: 8,
        boxShadow: "0 1px 2px rgba(18,30,47,.06)",
        cursor: "grab",
        userSelect: "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 11.5,
            background: "var(--color-mist-200)",
            borderRadius: 6,
            padding: "3px 8px",
            color: "var(--color-navy)",
            whiteSpace: "nowrap",
          }}
        >
          nodo | <span style={{ fontWeight: 600 }}>{task.unit_code}</span>
        </span>
        <span
          style={{
            fontSize: 11.5,
            fontWeight: 700,
            background: priority.bg,
            color: priority.color,
            borderRadius: 999,
            padding: "2px 8px",
          }}
        >
          {priority.label}
        </span>
      </div>

      <p
        style={{
          margin: 0,
          fontSize: 14.5,
          fontWeight: 600,
          color: "var(--color-ink)",
          lineHeight: 1.35,
          fontFamily: "var(--font-sans)",
          marginBottom: task.description ? 4 : 0,
        }}
      >
        {task.title}
      </p>

      {task.description && (
        <p
          style={{
            margin: 0,
            fontSize: 12.5,
            color: "var(--color-slate2)",
            lineHeight: 1.45,
            marginBottom: 10,
          }}
        >
          {task.description}
        </p>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 10,
        }}
      >
        {task.due_date ? (
          <span style={{ fontSize: 12, color: "var(--color-slate2)" }}>
            🗓 {formatDate(task.due_date)}
          </span>
        ) : (
          <span />
        )}
        {assignee && (
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: assignee.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
              fontWeight: 700,
              color: "white",
              flexShrink: 0,
            }}
            title={assignee.full_name}
          >
            {assignee.initials}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SortableCard ─────────────────────────────────────────────────────────────

function SortableCard({
  task,
  profiles,
}: {
  task: Task;
  profiles: Profile[];
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id, data: { type: "card", task } });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.45 : 1,
      }}
      {...attributes}
      {...listeners}
    >
      <TaskCard task={task} profiles={profiles} />
    </div>
  );
}

// ─── AddTaskForm ──────────────────────────────────────────────────────────────

function AddTaskForm({
  status,
  units,
  onAdd,
  onCancel,
}: {
  status: Task["status"];
  units: string[];
  onAdd: (task: Omit<Task, "id" | "position">) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [unit, setUnit] = useState(units[0] ?? "");
  const [priority, setPriority] = useState<Task["priority"]>("media");

  function handleSubmit() {
    if (!title.trim()) return;
    onAdd({ title: title.trim(), description: null, unit_code: unit, status, priority, assignee: null, due_date: null });
  }

  return (
    <div style={{ background: "white", border: "1px solid var(--color-mist)", borderRadius: 8, padding: 12, marginBottom: 8 }}>
      <textarea
        autoFocus
        placeholder="Título de la tarea..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        rows={2}
        style={{
          width: "100%", border: "1px solid var(--color-mist)", borderRadius: 6,
          padding: "6px 10px", fontSize: 13.5, fontFamily: "var(--font-sans)",
          resize: "none", outline: "none", marginBottom: 8, boxSizing: "border-box",
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
          if (e.key === "Escape") onCancel();
        }}
      />
      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          style={{ flex: 1, border: "1px solid var(--color-mist)", borderRadius: 6, padding: "5px 8px", fontSize: 12.5, fontFamily: "var(--font-sans)", outline: "none" }}
        >
          {units.map((u) => <option key={u} value={u}>{u}</option>)}
        </select>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as Task["priority"])}
          style={{ flex: 1, border: "1px solid var(--color-mist)", borderRadius: 6, padding: "5px 8px", fontSize: 12.5, fontFamily: "var(--font-sans)", outline: "none" }}
        >
          <option value="alta">Alta</option>
          <option value="media">Media</option>
          <option value="baja">Baja</option>
        </select>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <button
          onClick={handleSubmit}
          style={{ flex: 1, background: "var(--color-brand)", color: "white", border: "none", borderRadius: 6, padding: "7px 12px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)" }}
        >
          Agregar
        </button>
        <button
          onClick={onCancel}
          style={{ flex: 1, background: "transparent", color: "var(--color-slate2)", border: "1px solid var(--color-mist)", borderRadius: 6, padding: "7px 12px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)" }}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

// ─── KanbanColumn ─────────────────────────────────────────────────────────────

function KanbanColumn({
  column,
  tasks,
  profiles,
  units,
  isOver,
  onAddTask,
}: {
  column: (typeof COLUMNS)[number];
  tasks: Task[];
  profiles: Profile[];
  units: string[];
  isOver: boolean;
  onAddTask: (task: Omit<Task, "id" | "position">) => void;
}) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div
      style={{
        background: isOver ? "#E2EBF4" : "#EEF3F8",
        border: "1px solid var(--color-mist)",
        borderRadius: 10,
        padding: 12,
        display: "flex",
        flexDirection: "column",
        minHeight: 200,
        boxShadow: isOver ? "inset 0 0 0 2px var(--color-brand)" : "none",
        transition: "background 150ms, box-shadow 150ms",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
        <div style={{ width: 9, height: 9, borderRadius: "50%", background: column.color, flexShrink: 0 }} />
        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--color-navy)", fontFamily: "var(--font-display)", flex: 1 }}>
          {column.label}
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, background: "rgba(27,42,65,.1)", borderRadius: 999, padding: "2px 8px", color: "var(--color-navy)" }}>
          {tasks.length}
        </span>
      </div>

      {/* Drop zone + cards */}
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div style={{ flex: 1, minHeight: 40 }}>
          {tasks.map((task) => (
            <SortableCard key={task.id} task={task} profiles={profiles} />
          ))}
        </div>
      </SortableContext>

      {/* Add task */}
      {showForm ? (
        <AddTaskForm
          status={column.id}
          units={units}
          onAdd={(task) => { onAddTask(task); setShowForm(false); }}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <button
          onClick={() => setShowForm(true)}
          style={{
            width: "100%", padding: "8px 12px", borderRadius: 8,
            border: "1.5px dashed var(--color-slate2-300)", background: "transparent",
            color: "var(--color-slate2)", fontSize: 13, fontWeight: 600,
            cursor: "pointer", fontFamily: "var(--font-sans)", marginTop: 4,
            transition: "border-color 150ms, color 150ms, background 150ms",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget;
            el.style.borderColor = "var(--color-brand)";
            el.style.color = "var(--color-brand)";
            el.style.background = "white";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget;
            el.style.borderColor = "var(--color-slate2-300)";
            el.style.color = "var(--color-slate2)";
            el.style.background = "transparent";
          }}
        >
          + Agregar tarea
        </button>
      )}
    </div>
  );
}

// ─── KanbanBoard (root, owns DndContext) ──────────────────────────────────────

export default function KanbanBoard({
  initialTasks,
  profiles,
  units,
  searchTerm,
}: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [overColumnId, setOverColumnId] = useState<Task["status"] | null>(null);

  const supabase = createClient();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const filteredTasks = searchTerm
    ? tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
      )
    : tasks;

  function getColumnTasks(status: Task["status"]) {
    return filteredTasks
      .filter((t) => t.status === status)
      .sort((a, b) => a.position - b.position);
  }

  const columnIds = COLUMNS.map((c) => c.id as string);

  function resolveColumnId(id: string): Task["status"] | null {
    if (columnIds.includes(id)) return id as Task["status"];
    return tasks.find((t) => t.id === id)?.status ?? null;
  }

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === (event.active.id as string));
    if (task) setActiveTask(task);
  }

  function handleDragOver(event: DragOverEvent) {
    const { over } = event;
    if (!over) { setOverColumnId(null); return; }
    setOverColumnId(resolveColumnId(over.id as string));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);
    setOverColumnId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    const srcTask = tasks.find((t) => t.id === activeId);
    if (!srcTask) return;

    const targetStatus = resolveColumnId(overId) ?? srcTask.status;

    setTasks((prev) => {
      let next = prev.map((t) =>
        t.id === activeId ? { ...t, status: targetStatus } : t
      );

      // Reorder within target column
      const colTasks = next
        .filter((t) => t.status === targetStatus)
        .sort((a, b) => a.position - b.position);

      let reordered: Task[];

      if (columnIds.includes(overId)) {
        // Dropped on column itself → move to end
        const without = colTasks.filter((t) => t.id !== activeId);
        reordered = [...without, next.find((t) => t.id === activeId)!];
      } else {
        const fromIdx = colTasks.findIndex((t) => t.id === activeId);
        const toIdx = colTasks.findIndex((t) => t.id === overId);
        if (fromIdx !== -1 && toIdx !== -1) {
          reordered = arrayMove(colTasks, fromIdx, toIdx);
        } else if (fromIdx === -1 && toIdx !== -1) {
          // Cross-column move: insert at toIdx
          const without = colTasks.filter((t) => t.id !== activeId);
          without.splice(toIdx, 0, next.find((t) => t.id === activeId)!);
          reordered = without;
        } else {
          reordered = colTasks;
        }
      }

      // Re-assign positions
      const posMap = new Map(reordered.map((t, i) => [t.id, i * 1000]));
      next = next.map((t) =>
        posMap.has(t.id) ? { ...t, position: posMap.get(t.id)! } : t
      );

      // Persist after state is committed
      const updatedTask = next.find((t) => t.id === activeId)!;
      supabase
        .from("tasks")
        .update({ status: updatedTask.status, position: updatedTask.position })
        .eq("id", activeId)
        .then(({ error }) => { if (error) console.error("Error persisting task move:", error); });

      return next;
    });
  }

  async function handleAddTask(taskData: Omit<Task, "id" | "position">) {
    const colTasks = tasks
      .filter((t) => t.status === taskData.status)
      .sort((a, b) => a.position - b.position);
    const position = colTasks.length > 0 ? colTasks[colTasks.length - 1].position + 1000 : 0;

    const { data, error } = await supabase
      .from("tasks")
      .insert({ ...taskData, position })
      .select()
      .single();

    if (error) { console.error("Error adding task:", error); return; }
    if (data) setTasks((prev) => [...prev, data as Task]);
  }

  const completedCount = tasks.filter((t) => t.status === "done").length;
  const totalCount = tasks.length;
  const completedPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "24px 30px" }}>
      {/* Construction banner */}
      <div
        style={{
          background: "linear-gradient(135deg, var(--color-navy) 0%, var(--color-navy-700) 100%)",
          borderRadius: 10,
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h3 style={{ color: "white", fontSize: 17, margin: 0, marginBottom: 4 }}>
            El Core está en construcción 🚧
          </h3>
          <p style={{ margin: 0, color: "rgba(234,240,247,.74)", fontSize: 13.5, lineHeight: 1.5 }}>
            Este tablero es el roadmap vivo del equipo. Arrastre las tarjetas entre columnas para actualizar el estado de cada tarea del núcleo de negocio.
          </p>
        </div>
        <span
          style={{
            background: "rgba(255,255,255,.12)",
            color: "white",
            borderRadius: 999,
            padding: "6px 16px",
            fontSize: 13,
            fontWeight: 700,
            whiteSpace: "nowrap",
          }}
        >
          {completedCount} de {totalCount} completadas · {completedPct}%
        </span>
      </div>

      {/* Stats row */}
      <div
        className="panel-stats"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 14,
          marginBottom: 24,
        }}
      >
        {[
          { label: "Total de tareas", value: totalCount },
          { label: "En curso", value: tasks.filter((t) => t.status === "doing").length },
          { label: "En revisión", value: tasks.filter((t) => t.status === "review").length },
          { label: "Completadas", value: completedCount },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: "white",
              border: "1px solid var(--color-mist)",
              borderRadius: 10,
              padding: "18px 20px",
            }}
          >
            <p style={{ margin: 0, fontSize: 13, color: "var(--color-slate2)", fontWeight: 500, marginBottom: 6 }}>
              {stat.label}
            </p>
            <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 28, color: "var(--color-navy)" }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Kanban */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div
          className="kanban-board"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(206px, 1fr))",
            gap: 16,
          }}
        >
          {COLUMNS.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={getColumnTasks(column.id)}
              profiles={profiles}
              units={units}
              isOver={overColumnId === column.id}
              onAddTask={handleAddTask}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div style={{ transform: "rotate(1.5deg)", cursor: "grabbing" }}>
              <TaskCard task={activeTask} profiles={profiles} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
