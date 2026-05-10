import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { 
  useListChecklistItems, useCreateChecklistItem, 
  useUpdateChecklistItem, useDeleteChecklistItem, useResetChecklist,
  getListChecklistItemsQueryKey 
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Trash2, Plus, RefreshCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { ChecklistItemCategory, ChecklistItemInputCategory } from "@workspace/api-client-react";

export default function TripChecklist() {
  const { id } = useParams();
  const tripId = Number(id);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: items, isLoading } = useListChecklistItems(tripId, { 
    query: { enabled: !!tripId, queryKey: getListChecklistItemsQueryKey(tripId) } 
  });
  
  const createItem = useCreateChecklistItem();
  const updateItem = useUpdateChecklistItem();
  const deleteItem = useDeleteChecklistItem();
  const resetChecklist = useResetChecklist();

  const [newItemLabel, setNewItemLabel] = useState("");
  const [newItemCategory, setNewItemCategory] = useState<ChecklistItemInputCategory>(ChecklistItemInputCategory.other);

  if (isLoading) return <div className="space-y-6"><Skeleton className="h-10 w-1/3" /><Skeleton className="h-64" /></div>;

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemLabel.trim()) return;

    createItem.mutate(
      { tripId, data: { label: newItemLabel, category: newItemCategory } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListChecklistItemsQueryKey(tripId) });
          setNewItemLabel("");
          toast({ title: "Item added" });
        }
      }
    );
  };

  const handleToggle = (itemId: number, currentStatus: boolean) => {
    updateItem.mutate(
      { tripId, itemId, data: { isPacked: !currentStatus } },
      {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getListChecklistItemsQueryKey(tripId) })
      }
    );
  };

  const handleDelete = (itemId: number) => {
    deleteItem.mutate(
      { tripId, itemId },
      {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getListChecklistItemsQueryKey(tripId) })
      }
    );
  };

  const handleReset = () => {
    if (confirm("Uncheck all items?")) {
      resetChecklist.mutate(
        { tripId },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListChecklistItemsQueryKey(tripId) });
            toast({ title: "Checklist reset" });
          }
        }
      );
    }
  };

  const categories = Object.values(ChecklistItemCategory);
  
  // Group items by category
  const groupedItems = items?.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof items>) || {};

  const totalItems = items?.length || 0;
  const packedItems = items?.filter(i => i.isPacked).length || 0;
  const progress = totalItems > 0 ? (packedItems / totalItems) * 100 : 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => setLocation(`/trips/${tripId}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Packing Checklist</h1>
            <p className="text-muted-foreground">{packedItems} of {totalItems} items packed</p>
          </div>
        </div>
        <Button variant="outline" onClick={handleReset} disabled={packedItems === 0 || resetChecklist.isPending}>
          <RefreshCcw className="mr-2 h-4 w-4" /> Reset
        </Button>
      </div>

      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleAddItem} className="flex gap-2">
            <Input 
              placeholder="Add new item..." 
              value={newItemLabel} 
              onChange={e => setNewItemLabel(e.target.value)}
              className="flex-1"
            />
            <Select value={newItemCategory} onValueChange={(val) => setNewItemCategory(val as ChecklistItemInputCategory)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" disabled={!newItemLabel.trim() || createItem.isPending}>
              <Plus className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {categories.map(category => {
          const categoryItems = groupedItems[category] || [];
          if (categoryItems.length === 0) return null;

          return (
            <Card key={category}>
              <CardHeader className="py-3 bg-muted/50 border-b">
                <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  {category} ({categoryItems.filter(i => i.isPacked).length}/{categoryItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {categoryItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <Checkbox 
                          id={`item-${item.id}`} 
                          checked={item.isPacked} 
                          onCheckedChange={() => handleToggle(item.id, item.isPacked)}
                        />
                        <label 
                          htmlFor={`item-${item.id}`} 
                          className={`text-sm font-medium leading-none cursor-pointer ${item.isPacked ? 'line-through text-muted-foreground' : ''}`}
                        >
                          {item.label}
                        </label>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
        {totalItems === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No items in your checklist yet.
          </div>
        )}
      </div>
    </div>
  );
}