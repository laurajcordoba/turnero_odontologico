"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { toast } from "sonner";
import { LOCATION_OPTIONS_LIST } from "@/lib/validations";

interface ObraSocial {
  id: string;
  name: string;
  active: boolean;
  sedes: string[];
}

export default function ObrasSocialesPage() {
  const [obras, setObras] = useState<ObraSocial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", sedes: [] as string[] });
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState({ name: "", sedes: [] as string[] });

  async function fetchObras() {
    const res = await fetch("/api/obra-social?all=1");
    const data = await res.json();
    setObras(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => {
    fetchObras();
  }, []);

  function toggleSede(sedes: string[], sede: string) {
    if (sedes.includes(sede)) return sedes.filter((s) => s !== sede);
    return [...sedes, sede];
  }

  async function handleCreate() {
    if (!newForm.name.trim()) return;
    const res = await fetch("/api/obra-social", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newForm.name.trim(), sedes: newForm.sedes }),
    });
    if (res.ok) {
      toast.success("Obra social creada");
      setShowNew(false);
      setNewForm({ name: "", sedes: [] });
      fetchObras();
    } else {
      const err = await res.json();
      toast.error(err.error?.name?.[0] || "Error al crear obra social");
    }
  }

  async function handleUpdate(id: string) {
    if (!editForm.name.trim()) return;
    const res = await fetch(`/api/obra-social/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editForm.name.trim(), sedes: editForm.sedes }),
    });
    if (res.ok) {
      toast.success("Obra social actualizada");
      setEditingId(null);
      fetchObras();
    } else {
      toast.error("Error al actualizar");
    }
  }

  async function handleToggleActive(id: string, currentActive: boolean) {
    const res = await fetch(`/api/obra-social/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !currentActive }),
    });
    if (res.ok) {
      toast.success(currentActive ? "Obra social desactivada" : "Obra social activada");
      fetchObras();
    } else {
      toast.error("Error al cambiar estado");
    }
  }

  if (loading) {
    return <div className="text-gray-500">Cargando...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Obras sociales</h1>
        <Button onClick={() => setShowNew(true)} disabled={showNew}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva obra social
        </Button>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Las obras sociales activas se muestran en el formulario de reserva según la sede que elija el paciente. Asigne en qué sede(s) atiende cada obra; si no asigna ninguna, se mostrará en todas. La opción &quot;Particular&quot; siempre está disponible.
      </p>

      <Card>
        <CardHeader>
          <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500">
            <div className="col-span-5">Nombre</div>
            <div className="col-span-3">Sedes</div>
            <div className="col-span-2">Estado</div>
            <div className="col-span-2">Acciones</div>
          </div>
        </CardHeader>
        <CardContent className="divide-y divide-gray-100">
          {showNew && (
            <div className="grid grid-cols-12 gap-4 items-center py-3">
              <div className="col-span-5">
                <Input
                  value={newForm.name}
                  onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                  placeholder="Nombre de la obra social"
                />
              </div>
              <div className="col-span-3 flex flex-wrap gap-2">
                {LOCATION_OPTIONS_LIST.map((sede) => (
                  <label key={sede} className="flex items-center gap-1.5 text-sm">
                    <input
                      type="checkbox"
                      checked={newForm.sedes.includes(sede)}
                      onChange={() =>
                        setNewForm({ ...newForm, sedes: toggleSede(newForm.sedes, sede) })
                      }
                      className="rounded"
                    />
                    <span className="text-gray-700">
                      {sede === "25 de Mayo 824, Alta Italia, La Pampa." ? "Alta Italia" : "Colonia Tirolesa"}
                    </span>
                  </label>
                ))}
              </div>
              <div className="col-span-2" />
              <div className="col-span-2 flex gap-2">
                <Button size="sm" onClick={handleCreate}>
                  <Check className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setShowNew(false);
                    setNewForm({ name: "", sedes: [] });
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {obras.map((obra) => (
            <div key={obra.id} className="grid grid-cols-12 gap-4 items-center py-3">
              {editingId === obra.id ? (
                <>
                  <div className="col-span-5">
                    <Input
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      placeholder="Nombre"
                    />
                  </div>
                  <div className="col-span-3 flex flex-wrap gap-2">
                    {LOCATION_OPTIONS_LIST.map((sede) => (
                      <label key={sede} className="flex items-center gap-1.5 text-sm">
                        <input
                          type="checkbox"
                          checked={editForm.sedes.includes(sede)}
                          onChange={() =>
                            setEditForm({ ...editForm, sedes: toggleSede(editForm.sedes, sede) })
                          }
                          className="rounded"
                        />
                        <span className="text-gray-700">
                          {sede === "25 de Mayo 824, Alta Italia, La Pampa." ? "Alta Italia" : "Colonia Tirolesa"}
                        </span>
                      </label>
                    ))}
                  </div>
                  <div className="col-span-2" />
                  <div className="col-span-2 flex gap-2">
                    <Button size="sm" onClick={() => handleUpdate(obra.id)}>
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
                  <div className="col-span-5 text-sm text-gray-900">
                    {obra.name}
                  </div>
                  <div className="col-span-3 text-sm text-gray-600">
                    {obra.sedes?.length
                      ? obra.sedes.map((s) => (s === "25 de Mayo 824, Alta Italia, La Pampa." ? "Alta Italia" : "Colonia Tirolesa")).join(", ")
                      : "Todas"}
                  </div>
                  <div className="col-span-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        obra.active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {obra.active ? "Activa" : "Inactiva"}
                    </span>
                  </div>
                  <div className="col-span-2 flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingId(obra.id);
                        setEditForm({ name: obra.name, sedes: obra.sedes ?? [] });
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleToggleActive(obra.id, obra.active)}
                      title={obra.active ? "Desactivar" : "Activar"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}

          {obras.length === 0 && !showNew && (
            <p className="text-sm text-gray-500 py-4 text-center">
              No hay obras sociales. Agregue una o los pacientes podrán elegir &quot;Particular&quot;.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
