"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { xFetch } from "@/utility/xFetch";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/ReactToastify.min.css';

// ----------------------------------------------------------
// SORTABLE ROW COMPONENT
// ----------------------------------------------------------
const SortableRow = ({ id, label }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  return (
    <tr
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className="border-b hover:bg-gray-50"
    >
      <td className="p-3 flex items-center gap-3 bg-white">
        <GripVertical
          size={18}
          className="cursor-grab text-gray-400"
          {...attributes}
          {...listeners}
        />
        {label}
      </td>
    </tr>
  );
};

// ----------------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------------
export default function TableReorder() {
  const [columns, setColumns] = useState([]);
  const [columnOrder, setColumnOrder] = useState([]);

  // Search
  const [search, setSearch] = useState("");

  const sensors = useSensors(useSensor(PointerSensor));

  //---------------------------------------------------------
  // FETCH columns
  //---------------------------------------------------------
  useEffect(() => {
    xFetch({ path: "/services/profile/columns" })
      .then((data) => {
        setColumns(data);

        const order = data
          .map((item) => item.fieldId)
          .filter((id) => id);

        setColumnOrder(order);
      })
      .catch(() => {
        setColumns([]);
      });
  }, []);

  //---------------------------------------------------------
  // FILTERED LIST
  //---------------------------------------------------------
  const filteredOrder = useMemo(() => {
    if (!search.trim()) return columnOrder;

    return columnOrder.filter((fid) => {
      const col = columns.find((c) => c.fieldId === fid);
      if (!col) return false;

      const label =
        col.displayName || col.fieldName || col.name || "Unnamed";

      return label.toLowerCase().includes(search.toLowerCase());
    });
  }, [search, columns, columnOrder]);

  //---------------------------------------------------------
  // Drag end
  //---------------------------------------------------------
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      const oldIndex = columnOrder.indexOf(active.id);
      const newIndex = columnOrder.indexOf(over.id);

      setColumnOrder((prev) => arrayMove(prev, oldIndex, newIndex));
    }
  };

  //---------------------------------------------------------
  // SAVE ORDER
  //---------------------------------------------------------
  const handleSave = async () => {
    
      const payload = columnOrder.map((fid) => ({
        fieldId: String(fid),
      }));

      await xFetch({
          path: "/services/profile/updateLeadTableReorder",
          method: "POST",
          payload: { data: payload },
      })
      .then(() => toast.success("Column order saved successfully!"))
      .catch((err) => toast.error("Error in updating reorder!"));
  };

  //---------------------------------------------------------
  // UI
  //---------------------------------------------------------
  return (
    <div className="w-full p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl">Reorder Table Columns</h2>

        {/* SEARCH */}
        <div className="flex space-x-2">
            <input
              className="border border-gray-300 rounded px-3 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search columns..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
        </div>
      </div>
      
      
      {/* SCROLLABLE TABLE */}
      <div
        className="border rounded-xl shadow bg-white"
        style={{
          maxHeight: "350px", // FIXED HEIGHT
          overflowY: "auto",
        }}
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredOrder}
            strategy={verticalListSortingStrategy}
          >
            <table className="w-full text-left">
              <thead className="bg-gray-100 border-b sticky top-0 z-10">
                <tr>
                  <th className="p-3 font-medium text-gray-700">
                    Table Column Name
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredOrder.map((fid) => {
                  const col = columns.find((c) => c.fieldId === fid);
                  if (!col) return null;

                  const label =
                    col.displayName || col.fieldName || col.name || "Unnamed";

                  return <SortableRow key={fid} id={fid} label={label} />;
                })}
              </tbody>
            </table>
          </SortableContext>
        </DndContext>
      </div>

      {/* SAVE BUTTON */}
      <div className="mt-5 flex justify-center">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Save
        </button>
      </div>
    </div>
  );
}
