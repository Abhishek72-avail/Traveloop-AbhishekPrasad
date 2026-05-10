import { useParams, useLocation } from "wouter";
import { useGetTrip, useListStops, useCreateStop, useDeleteStop, getListStopsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Plus, MapPin, Trash2, Clock } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function TripBuild() {
  const { id } = useParams();
  const tripId = Number(id);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: trip, isLoading: isTripLoading } = useGetTrip(tripId, { query: { enabled: !!tripId } });
  const { data: stops, isLoading: isStopsLoading } = useListStops(tripId, { query: { enabled: !!tripId, queryKey: getListStopsQueryKey(tripId) } });
  
  const deleteStop = useDeleteStop();

  if (isTripLoading || isStopsLoading) return <div className="space-y-6"><Skeleton className="h-10 w-1/3" /><Skeleton className="h-64" /></div>;
  if (!trip) return <div>Trip not found</div>;

  const handleDeleteStop = (stopId: number) => {
    if (confirm("Remove this stop?")) {
      deleteStop.mutate({ tripId, id: stopId }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListStopsQueryKey(tripId) });
          toast({ title: "Stop removed" });
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => setLocation(`/trips/${tripId}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Itinerary Builder</h1>
            <p className="text-muted-foreground">{trip.name}</p>
          </div>
        </div>
        <Button onClick={() => setLocation(`/cities`)}>
          <Plus className="mr-2 h-4 w-4" /> Add Destination
        </Button>
      </div>

      {!stops || stops.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
          <MapPin className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
          <CardTitle className="mb-2">No stops yet</CardTitle>
          <CardDescription className="mb-6">Add your first destination to start building.</CardDescription>
          <Button onClick={() => setLocation(`/cities`)}>Browse Cities</Button>
        </Card>
      ) : (
        <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
          {stops.map((stop, index) => (
            <div key={stop.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-300 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                <span className="font-semibold text-sm">{index + 1}</span>
              </div>
              <Card className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-lg">{stop.city?.name || "Unknown City"}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(stop.arrivalDate), "MMM d")} - {format(new Date(stop.departureDate), "MMM d")}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteStop(stop.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {stop.accommodation && (
                  <div className="text-sm mt-2 p-2 bg-muted rounded">
                    <strong>Stay:</strong> {stop.accommodation}
                  </div>
                )}
                {/* Activities could be mapped here if we used useGetTrip instead of useListStops and extracted from TripDetail */}
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}