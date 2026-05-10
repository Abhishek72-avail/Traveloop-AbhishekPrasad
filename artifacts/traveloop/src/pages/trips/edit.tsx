import { useParams, useLocation } from "wouter";
import { useGetTrip, useUpdateTrip, getGetTripQueryKey, getListTripsQueryKey } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useEffect, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const tripSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  coverPhoto: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  totalBudget: z.coerce.number().min(0, "Budget must be positive").optional(),
});

export default function EditTrip() {
  const { id } = useParams();
  const tripId = Number(id);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: trip, isLoading } = useGetTrip(tripId, { query: { enabled: !!tripId, queryKey: getGetTripQueryKey(tripId) } });
  const updateTrip = useUpdateTrip();

  const form = useForm<z.infer<typeof tripSchema>>({
    resolver: zodResolver(tripSchema),
    defaultValues: { name: "", description: "", startDate: "", endDate: "", coverPhoto: "", totalBudget: 0 },
  });

  const initializedForId = useRef<number | null>(null);

  useEffect(() => {
    if (trip && initializedForId.current !== trip.id) {
      initializedForId.current = trip.id;
      form.reset({
        name: trip.name,
        description: trip.description || "",
        startDate: trip.startDate.split("T")[0],
        endDate: trip.endDate.split("T")[0],
        coverPhoto: trip.coverPhoto || "",
        totalBudget: trip.totalBudget || 0,
      });
    }
  }, [trip, form]);

  if (isLoading) return <div className="space-y-6"><Skeleton className="h-10 w-1/3" /><Skeleton className="h-64" /></div>;
  if (!trip) return <div>Trip not found</div>;

  const onSubmit = (values: z.infer<typeof tripSchema>) => {
    updateTrip.mutate(
      { id: tripId, data: values },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetTripQueryKey(tripId) });
          queryClient.invalidateQueries({ queryKey: getListTripsQueryKey() });
          toast({ title: "Trip updated successfully" });
          setLocation(`/trips/${tripId}`);
        },
        onError: (err) => {
          toast({ variant: "destructive", title: "Failed to update trip", description: err.message });
        },
      }
    );
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => setLocation(`/trips/${tripId}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Trip</h1>
          <p className="text-muted-foreground">Update your itinerary details.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trip Details</CardTitle>
          <CardDescription>Modify the information below.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <Label>Trip Name</Label>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="startDate" render={({ field }) => (
                  <FormItem>
                    <Label>Start Date</Label>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="endDate" render={({ field }) => (
                  <FormItem>
                    <Label>End Date</Label>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <Label>Description</Label>
                  <FormControl><Textarea {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="totalBudget" render={({ field }) => (
                  <FormItem>
                    <Label>Total Budget ($)</Label>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="coverPhoto" render={({ field }) => (
                  <FormItem>
                    <Label>Cover Photo URL</Label>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="flex justify-end pt-4">
                <Button type="button" variant="outline" className="mr-2" onClick={() => setLocation(`/trips/${tripId}`)}>Cancel</Button>
                <Button type="submit" disabled={updateTrip.isPending}>
                  {updateTrip.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}