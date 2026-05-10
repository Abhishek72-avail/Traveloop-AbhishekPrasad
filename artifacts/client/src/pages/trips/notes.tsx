import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { 
  useListNotes, useCreateNote, useUpdateNote, useDeleteNote, getListNotesQueryKey 
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Trash2, Edit, Plus, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

const noteSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
});

export default function TripNotes() {
  const { id } = useParams();
  const tripId = Number(id);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);

  const { data: notes, isLoading } = useListNotes(tripId, { query: { enabled: !!tripId, queryKey: getListNotesQueryKey(tripId) } });
  
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();

  const form = useForm<z.infer<typeof noteSchema>>({
    resolver: zodResolver(noteSchema),
    defaultValues: { title: "", content: "" },
  });

  if (isLoading) return <div className="space-y-6"><Skeleton className="h-10 w-1/3" /><Skeleton className="h-64" /></div>;

  const onSubmit = (values: z.infer<typeof noteSchema>) => {
    if (editingNoteId) {
      updateNote.mutate(
        { tripId, noteId: editingNoteId, data: values },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListNotesQueryKey(tripId) });
            setIsDialogOpen(false);
            setEditingNoteId(null);
            form.reset();
            toast({ title: "Note updated" });
          }
        }
      );
    } else {
      createNote.mutate(
        { tripId, data: values },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListNotesQueryKey(tripId) });
            setIsDialogOpen(false);
            form.reset();
            toast({ title: "Note created" });
          }
        }
      );
    }
  };

  const handleEdit = (note: any) => {
    setEditingNoteId(note.id);
    form.reset({ title: note.title, content: note.content });
    setIsDialogOpen(true);
  };

  const handleDelete = (noteId: number) => {
    if (confirm("Delete this note?")) {
      deleteNote.mutate(
        { tripId, noteId },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListNotesQueryKey(tripId) });
            toast({ title: "Note deleted" });
          }
        }
      );
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => setLocation(`/trips/${tripId}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Trip Notes</h1>
            <p className="text-muted-foreground">Journal your thoughts and ideas.</p>
          </div>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingNoteId(null);
            form.reset({ title: "", content: "" });
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Note
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingNoteId ? "Edit Note" : "New Note"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl><Input placeholder="Flight details..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="content" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl><Textarea className="min-h-[150px]" placeholder="Confirmation codes, ideas..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="flex justify-end pt-2">
                  <Button type="submit" disabled={createNote.isPending || updateNote.isPending}>
                    {editingNoteId ? "Save Changes" : "Create Note"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {!notes || notes.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
          <FileText className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
          <CardTitle className="mb-2">No notes yet</CardTitle>
          <p className="text-muted-foreground mb-6">Jot down important details, reservation numbers, or travel ideas.</p>
          <Button onClick={() => setIsDialogOpen(true)}>Write a Note</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notes.map(note => (
            <Card key={note.id} className="flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg leading-tight">{note.title}</CardTitle>
                  <div className="flex gap-1 -mt-2 -mr-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => handleEdit(note)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(note.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {format(new Date(note.updatedAt || note.createdAt), "MMM d, yyyy 'at' h:mm a")}
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="whitespace-pre-wrap text-sm">{note.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}