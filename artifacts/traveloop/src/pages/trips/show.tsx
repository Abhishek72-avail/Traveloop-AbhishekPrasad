import { useParams, Link, useLocation } from "wouter";
import { useGetTrip, useDeleteTrip, getListTripsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Edit, Map, Plus, Trash2, Calendar, LayoutList, PieChart, CheckSquare, FileText } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function TripShow() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const tripId = Number(id);
  const { data: trip, isLoading } = useGetTrip(tripId, { query: { enabled: !!tripId } });
  const deleteTrip = useDeleteTrip();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  if (isLoading) return <div className="space-y-6"><Skeleton className="h-10 w-1/3" /><Skeleton className="h-64" /></div>;
  if (!trip) return <div>Trip not found</div>;

  const handleDelete = () => {
    if (confirm("Are you sure?")) {
      deleteTrip.mutate({ id: tripId }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListTripsQueryKey() });
          toast({ title: "Deleted" });
          setLocation("/trips");
        }
      });
    }
  };

  const menuItems = [
    { name: "Itinerary Builder", icon: Map, href: `/trips/${trip.id}/build`, desc: "Plan stops and activities" },
    { name: "Budget", icon: PieChart, href: `/trips/${trip.id}/budget`, desc: "Track expenses" },
    { name: "Checklist", icon: CheckSquare, href: `/trips/${trip.id}/checklist`, desc: "Packing list" },
    { name: "Notes", icon: FileText, href: `/trips/${trip.id}/notes`, desc: "Journal & important info" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => setLocation("/trips")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{trip.name}</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {format(new Date(trip.startDate), "PPP")} - {format(new Date(trip.endDate), "PPP")}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setLocation(`/trips/${trip.id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" /> Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      {trip.coverPhoto && (
        <div className="w-full h-64 rounded-xl overflow-hidden border">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {menuItems.map(item => (
          <Card key={item.name} className="cursor-pointer hover:border-primary transition-colors" onClick={() => setLocation(item.href)}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-lg font-medium">{item.name}</CardTitle>
              <item.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">{item.desc}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}