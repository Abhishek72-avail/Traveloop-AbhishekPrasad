import { useListTrips, useDeleteTrip, getListTripsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { MapPin, Calendar, Plus, Trash2, Edit, Eye } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export default function TripsList() {
  const { data: trips, isLoading } = useListTrips();
  const deleteTrip = useDeleteTrip();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    if (confirm("Are you sure you want to delete this trip?")) {
      deleteTrip.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListTripsQueryKey() });
          toast({ title: "Trip deleted successfully" });
        },
        onError: () => {
          toast({ title: "Failed to delete trip", variant: "destructive" });
        }
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Trips</h1>
          <p className="text-muted-foreground">Manage your upcoming and past itineraries.</p>
        </div>
        <Button onClick={() => setLocation("/trips/new")}>
          <Plus className="mr-2 h-4 w-4" />
          New Trip
        </Button>
      </div>

      {!trips || trips.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
          <MapPin className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
          <CardTitle className="mb-2">No trips planned</CardTitle>
          <CardDescription className="mb-6">You haven't created any itineraries yet.</CardDescription>
          <Button onClick={() => setLocation("/trips/new")}>Plan your first trip</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map(trip => (
            <Card key={trip.id} className="overflow-hidden flex flex-col group cursor-pointer" onClick={() => setLocation(`/trips/${trip.id}`)}>
              {trip.coverPhoto ? (
                <div className="h-48 overflow-hidden">
                  <img src={trip.coverPhoto} alt={trip.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
              ) : (
                <div className="h-48 bg-muted flex items-center justify-center border-b">
                  <MapPin className="h-12 w-12 text-muted-foreground opacity-20" />
                </div>
              )}
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="line-clamp-1">{trip.name}</CardTitle>
                  <div className="flex bg-primary/10 text-primary text-xs font-semibold px-2 py-1 rounded">
                    {trip.stopCount || 0} stops
                  </div>
                </div>
                <CardDescription className="flex items-center gap-1 mt-1 text-xs">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(trip.startDate), "MMM d, yyyy")} - {format(new Date(trip.endDate), "MMM d, yyyy")}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {trip.description || "No description provided."}
                </p>
              </CardContent>
              <CardFooter className="bg-muted/50 border-t p-3 flex justify-between">
                <div className="text-xs font-medium text-muted-foreground">
                  {trip.totalBudget ? `$${trip.totalBudget.toLocaleString()}` : "No budget"}
                </div>
                <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setLocation(`/trips/${trip.id}/edit`)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={(e) => handleDelete(trip.id, e)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}