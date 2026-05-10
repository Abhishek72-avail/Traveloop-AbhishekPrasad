import { useLocation } from "wouter";
import { useCreateTrip, getListTripsQueryKey } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Image as ImageIcon, MapPin } from "lucide-react";

const tripSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  coverPhoto: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  totalBudget: z.coerce.number().min(0, "Budget must be positive").optional(),
});

export default function NewTrip() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createTrip = useCreateTrip();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof tripSchema>>({
    resolver: zodResolver(tripSchema),
    defaultValues: { name: "", description: "", startDate: "", endDate: "", coverPhoto: "", totalBudget: 0 },
  });

  const onSubmit = (values: z.infer<typeof tripSchema>) => {
    createTrip.mutate(
      { data: values },
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries({ queryKey: getListTripsQueryKey() });
          toast({ title: "Trip created successfully" });
          setLocation(`/trips/${data.id}`);
        },
        onError: (err) => {
          toast({
            variant: "destructive",
            title: "Failed to create trip",
            description: err.message,
          });
        },
      }
    );
  };

  return (
    <div className="max-w-4xl mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 border-b pb-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/trips")} className="hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Plan a new trip</h1>
      </div>

      {/* Form Section */}
      <div className="max-w-2xl mb-12 pl-4 md:pl-12">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem className="grid grid-cols-[120px_1fr] md:grid-cols-[160px_1fr] items-center gap-4 space-y-0">
                <Label className="text-right font-medium text-muted-foreground">Trip Name:</Label>
                <div>
                  <FormControl><Input className="w-full max-w-md bg-card" placeholder="e.g. Summer in Paris" {...field} /></FormControl>
                  <FormMessage className="mt-1" />
                </div>
              </FormItem>
            )} />
            
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem className="grid grid-cols-[120px_1fr] md:grid-cols-[160px_1fr] items-center gap-4 space-y-0">
                <Label className="text-right font-medium text-muted-foreground">Select a Place:</Label>
                <div>
                  <FormControl><Input className="w-full max-w-md bg-card" placeholder="Where do you want to go?" {...field} /></FormControl>
                  <FormMessage className="mt-1" />
                </div>
              </FormItem>
            )} />

            <FormField control={form.control} name="startDate" render={({ field }) => (
              <FormItem className="grid grid-cols-[120px_1fr] md:grid-cols-[160px_1fr] items-center gap-4 space-y-0">
                <Label className="text-right font-medium text-muted-foreground">Start Date:</Label>
                <div>
                  <FormControl><Input type="date" className="w-full max-w-md bg-card" {...field} /></FormControl>
                  <FormMessage className="mt-1" />
                </div>
              </FormItem>
            )} />

            <FormField control={form.control} name="endDate" render={({ field }) => (
              <FormItem className="grid grid-cols-[120px_1fr] md:grid-cols-[160px_1fr] items-center gap-4 space-y-0">
                <Label className="text-right font-medium text-muted-foreground">End Date:</Label>
                <div>
                  <FormControl><Input type="date" className="w-full max-w-md bg-card" {...field} /></FormControl>
                  <FormMessage className="mt-1" />
                </div>
              </FormItem>
            )} />

            <FormField control={form.control} name="coverPhoto" render={({ field }) => (
              <FormItem className="grid grid-cols-[120px_1fr] md:grid-cols-[160px_1fr] items-center gap-4 space-y-0">
                <Label className="text-right font-medium text-muted-foreground">Cover Photo (URL):</Label>
                <div>
                  <FormControl><Input className="w-full max-w-md bg-card" placeholder="https://example.com/image.jpg" {...field} /></FormControl>
                  <FormMessage className="mt-1" />
                </div>
              </FormItem>
            )} />

            <div className="grid grid-cols-[120px_1fr] md:grid-cols-[160px_1fr] items-center gap-4 pt-4">
              <div /> {/* Empty space for label column */}
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setLocation("/trips")}>Cancel</Button>
                <Button type="submit" disabled={createTrip.isPending} className="px-8 shadow-sm">
                  {createTrip.isPending ? "Saving..." : "Save Trip"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>

      {/* Suggestions Section */}
      <div className="mt-8">
        <div className="bg-muted/50 p-4 border-y border-border mb-8">
          <h2 className="text-lg font-medium text-foreground ml-4">Suggestion for Places to Visit/Activities to perform</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 px-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-square rounded-2xl bg-card border border-border shadow-sm flex flex-col items-center justify-center p-6 text-center hover:shadow-md transition-all cursor-pointer group">
               <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                 <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
               </div>
               <p className="text-sm font-medium text-foreground">Placeholder {i}</p>
               <p className="text-xs text-muted-foreground mt-1">Recommended destination</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}