import { useListTrips, useDeleteTrip, getListTripsQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { Search, Filter, Plus, Trash2, Edit, CalendarDays, Map } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

export default function TripsList() {
  const { data: trips, isLoading } = useListTrips();
  const deleteTrip = useDeleteTrip();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
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
      <div className="space-y-6 animate-pulse max-w-4xl mx-auto pb-24">
        <Skeleton className="h-10 w-full mb-8" />
        <Skeleton className="h-8 w-32 mb-4" />
        <Skeleton className="h-32 w-full rounded-xl mb-8" />
        <Skeleton className="h-8 w-32 mb-4" />
        <Skeleton className="h-32 w-full rounded-xl mb-4" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  // Simple categorization logic based on dates (Mock logic for UI display)
  const now = new Date();
  const ongoingTrips = trips?.filter(t => new Date(t.startDate) <= now && new Date(t.endDate) >= now) || [];
  const upcomingTrips = trips?.filter(t => new Date(t.startDate) > now) || [];
  const completedTrips = trips?.filter(t => new Date(t.endDate) < now) || [];

  // If no dates match, we just put them in upcoming to avoid empty states for now
  if (trips && ongoingTrips.length === 0 && upcomingTrips.length === 0 && completedTrips.length === 0) {
    trips.forEach(t => upcomingTrips.push(t));
  }

  const renderTripCard = (trip: any) => (
    <div 
      key={trip.id} 
      className="group w-full bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col md:flex-row relative"
      onClick={() => setLocation(`/trips/${trip.id}`)}
    >
      <div className="w-full md:w-48 h-32 md:h-auto bg-muted shrink-0 relative overflow-hidden">
        {trip.coverPhoto ? (
          <img src={trip.coverPhoto} alt={trip.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-sky-900/10">
            <Map className="h-8 w-8 text-sky-700/30" />
          </div>
        )}
      </div>
      
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-card-foreground group-hover:text-primary transition-colors">{trip.name}</h3>
            <div className="flex items-center text-sm font-medium text-muted-foreground mt-1.5">
              <CalendarDays className="h-4 w-4 mr-2 opacity-70" />
              {format(new Date(trip.startDate), "MMM d, yyyy")} - {format(new Date(trip.endDate), "MMM d, yyyy")}
              <span className="mx-2 text-border">•</span>
              <span className="text-primary/80 font-semibold">{trip.stopCount || 0} stops</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={(e) => { e.stopPropagation(); setLocation(`/trips/${trip.id}/edit`); }}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={(e) => handleDelete(trip.id, e)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground mt-3 line-clamp-1">
          {trip.description || "Short Over View of the Trip. No description provided."}
        </p>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-24">
      
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Trip Listing</h1>
        <Button onClick={() => setLocation("/trips/new")} className="shadow-sm">
          <Plus className="mr-2 h-4 w-4" />
          Plan New Trip
        </Button>
      </div>

      {/* Search and Filters Bar (Matching Wireframe) */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search bar ......." className="pl-9 bg-card border-border" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
          <Button variant="outline" className="bg-card">Group by</Button>
          <Button variant="outline" className="bg-card">Filter</Button>
          <Button variant="outline" className="bg-card">Sort by...</Button>
        </div>
      </div>

      {!trips || trips.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 bg-card/50 rounded-2xl border border-dashed border-border mt-8">
          <Map className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No trips found</h2>
          <p className="text-muted-foreground text-center max-w-md mb-6">You haven't created any itineraries yet. Click the button below to start your first adventure!</p>
          <Button onClick={() => setLocation("/trips/new")} size="lg">Plan your first trip</Button>
        </div>
      ) : (
        <div className="space-y-10 mt-8">
          
          {/* Ongoing Section */}
          {ongoingTrips.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4 border-b border-border pb-2">Ongoing</h2>
              <div className="space-y-4">
                {ongoingTrips.map(renderTripCard)}
              </div>
            </div>
          )}

          {/* Upcoming Section */}
          {upcomingTrips.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4 border-b border-border pb-2">Up-coming</h2>
              <div className="space-y-4">
                {upcomingTrips.map(renderTripCard)}
              </div>
            </div>
          )}

          {/* Completed Section */}
          {completedTrips.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4 border-b border-border pb-2">Completed</h2>
              <div className="space-y-4">
                {completedTrips.map(renderTripCard)}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}