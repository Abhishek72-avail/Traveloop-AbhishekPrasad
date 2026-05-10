import { useLocation } from "wouter";
import { useCreateTrip, getListTripsQueryKey } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";

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
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => setLocation("/trips")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Trip</h1>
          <p className="text-muted-foreground">Start planning your next adventure.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trip Details</CardTitle>
          <CardDescription>Enter the basic information for your new itinerary.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <Label>Trip Name</Label>
                  <FormControl><Input placeholder="Euro Trip 2025" {...field} /></FormControl>
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
                  <FormControl><Textarea placeholder="A brief description of this trip" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="totalBudget" render={({ field }) => (
                  <FormItem>
                    <Label>Total Budget ($)</Label>
                    <FormControl><Input type="number" placeholder="5000" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="coverPhoto" render={({ field }) => (
                  <FormItem>
                    <Label>Cover Photo URL</Label>
                    <FormControl><Input placeholder="https://example.com/image.jpg" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="flex justify-end pt-4">
                <Button type="button" variant="outline" className="mr-2" onClick={() => setLocation("/trips")}>Cancel</Button>
                <Button type="submit" disabled={createTrip.isPending}>
                  {createTrip.isPending ? "Creating..." : "Create Trip"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}