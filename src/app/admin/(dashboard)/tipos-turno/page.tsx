"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { toast } from "sonner";

interface AppointmentType {
  id: string;
  name: string;
  duration: number;
  active: boolean;
}

export default function TiposTurnoPage() {
  const [types, setTypes] = useState<AppointmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", duration: 30 });
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState({ name: "", duration: 30 });

  async function fetchTypes() {
    const res = await fetch("/api/appointment-types");
    const data = await res.json();
    setTypes(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchTypes();
  }, []);

  async function handleCreate() {
    if (!newForm.name.trim()) return;
    const res = await fetch("/api/appointment-types", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newForm),
    });
    if (res.ok) {
      toast.success("Tipo de turno creado");
      setShowNew(false);
      setNewForm({ name: "", duration: 30 });
      fetchTypes();
    } else {
      toast.error("Error al crear tipo de turno");
    }
  }

  async function handleUpdate(id: string) {
    const res = await fetch(`/api/appointment-types/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    if (res.ok) {
      toast.success("Tipo de turno actualizado");
      setEditingId(null);
      fetchTypes();
    } else {
      toast.error("Error al actualizar");
    }
  }

  async function handleToggleActive(id: string, currentActive: boolean) {
    const res = await fetch(`/api/appointment-types/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !currentActive }),
    });
    if (res.ok) {
      toast.success(currentActive ? "Tipo desactivado" : "Tipo activado");
      fetchTypes();
    }
  }

  if (loading) {
    return <div className="text-gray-500">Cargando...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tipos de turno</h1>
        <Button onClick={() => setShowNew(true)} disabled={showNew}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo tipo
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500">
            <div className="col-span-4">Nombre</div>
            <div className="col-span-3">Duracion (min)</div>
            <div className="col-span-2">Estado</div>
            <div className="col-span-3">Acciones</div>
          </div>
        </CardHeader>
        <CardContent className="divide-y divide-gray-100">
          {showNew && (
            <div className="grid grid-cols-12 gap-4 items-center py-3">
              <div className="col-span-4">
                <Input
                  value={newForm.name}
                  onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                  placeholder="Nombre del tipo"
                />
              </div>
              <div className="col-span-3">
                <Input
                  type="number"
                  value={newForm.duration}
                  onChange={(e) =>
                    setNewForm({ ...newForm, duration: parseInt(e.target.value) || 30 })
                  }
                  min={15}
                  max={240}
                />
              </div>
              <div className="col-span-2" />
              <div className="col-span-3 flex gap-2">
                <Button size="sm" onClick={handleCreate}>
                  <Check className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setShowNew(false);
                    setNewForm({ name: "", duration: 30 });
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {types.map((type) => (
            <div key={type.id} className="grid grid-cols-12 gap-4 items-center py-3">
              {editingId === type.id ? (
                <>
                  <div className="col-span-4">
                    <Input
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-span-3">
                    <Input
                      type="number"
                      value={editForm.duration}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          duration: parseInt(e.target.value) || 30,
                        })
                      }
                      min={15}
                      max={240}
                    />
                  </div>
                  <div className="col-span-2" />
                  <div className="col-span-3 flex gap-2">
                    <Button size="sm" onClick={() => handleUpdate(type.id)}>
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingId(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="col-span-4 text-sm text-gray-900">
                    {type.name}
                  </div>
                  <div className="col-span-3 text-sm text-gray-600">
                    {type.duration} min
                  </div>
                  <div className="col-span-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        type.active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {type.active ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                  <div className="col-span-3 flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingId(type.id);
                        setEditForm({
                          name: type.name,
                          duration: type.duration,
                        });
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleToggleActive(type.id, type.active)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}

          {types.length === 0 && !showNew && (
            <p className="text-sm text-gray-500 py-4 text-center">
              No hay tipos de turno configurados
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
