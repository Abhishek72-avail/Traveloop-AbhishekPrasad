import { useParams, Link } from "wouter";
import { useGetPublicTrip, useCopyTrip } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Map, Share2, Copy } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function TripShare() {
  const { id } = useParams();
  const tripId = Number(id);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: trip, isLoading } = useGetPublicTrip(tripId, { query: { enabled: !!tripId, queryKey: [`/api/trips/${tripId}/public`] } });
  const copyTrip = useCopyTrip();

  if (isLoading) return <div className="space-y-6 max-w-4xl mx-auto p-8"><Skeleton className="h-10 w-1/3" /><Skeleton className="h-64" /></div>;
  if (!trip) return <div className="p-8 text-center">Trip not found or is private</div>;

  const handleCopyTrip = () => {
    copyTrip.mutate(
      { id: tripId },
      {
        onSuccess: () => {
          toast({ title: "Trip copied to your account!" });
        },
        onError: () => {
          toast({ variant: "destructive", title: "Failed to copy trip. Please login first." });
        }
      }
    );
  };

  const handleShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link copied to clipboard!" });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{trip.name}</h1>
          <p className="text-muted-foreground flex items-center gap-2 mt-1">
            <Calendar className="h-4 w-4" />
            {format(new Date(trip.startDate), "PPP")} - {format(new Date(trip.endDate), "PPP")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleShareLink}>
            <Share2 className="mr-2 h-4 w-4" /> Share Link
          </Button>
          <Button onClick={handleCopyTrip} disabled={copyTrip.isPending}>
            <Copy className="mr-2 h-4 w-4" /> {copyTrip.isPending ? "Copying..." : "Copy to My Trips"}
          </Button>
        </div>
      </div>

      {trip.coverPhoto && (
        <div className="w-full h-64 md:h-80 rounded-xl overflow-hidden border">
          <img src={trip.coverPhoto} alt={trip.name} className="w-full h-full object-cover" />
        </div>
      )}

      {trip.description && (
        <Card>
          <CardContent className="p-6">
            <p>{trip.description}</p>
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Map className="h-5 w-5 text-primary" /> Itinerary
        </h2>
        
        {!trip.stops || trip.stops.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            No stops planned for this trip yet.
          </Card>
        ) : (
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
            {trip.stops.map((stop, index) => (
              <div key={stop.id} className="relative flex items-center group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-300 text-slate-500 shadow shrink-0 z-10">
                  <span className="font-semibold text-sm">{index + 1}</span>
                </div>
                <Card className="ml-4 w-full p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg">{stop.city?.name || "Unknown City"}</h3>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(stop.arrivalDate), "MMM d")} - {format(new Date(stop.departureDate), "MMM d")}
                      </p>
                    </div>
                  </div>
                  {stop.activities && stop.activities.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Activities</h4>
                      {stop.activities.map(sa => (
                        <div key={sa.id} className="text-sm p-2 bg-muted/50 rounded flex justify-between">
                          <span>{sa.activity.name}</span>
                          {sa.scheduledTime && <span className="text-muted-foreground">{format(new Date(sa.scheduledTime), "h:mm a")}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="pt-8 text-center border-t">
        <p className="text-muted-foreground mb-4">Want to plan your own trip?</p>
        <Link href="/">
          <Button variant="outline">Sign up for Traveloop</Button>
        </Link>
      </div>
    </div>
  );
}