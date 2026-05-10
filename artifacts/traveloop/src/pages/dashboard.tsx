import { useGetDashboard } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Map, MapPin, CalendarDays, TrendingUp, DollarSign } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: dashboard, isLoading } = useGetDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-96 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!dashboard) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Overview</h1>
        <p className="text-muted-foreground mt-1">Welcome back. Here is the status of your travel planning.</p>
      </div>

      {/* Stats row */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Trips</p>
              <h2 className="text-3xl font-bold">{dashboard.totalTrips}</h2>
            </div>
            <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
              <Map className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Upcoming</p>
              <h2 className="text-3xl font-bold">{dashboard.upcomingTrips}</h2>
            </div>
            <div className="h-12 w-12 bg-amber-500/10 text-amber-600 rounded-full flex items-center justify-center">
              <CalendarDays className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Budget Spent</p>
              <h2 className="text-3xl font-bold">${dashboard.totalBudgetSpent.toLocaleString()}</h2>
            </div>
            <div className="h-12 w-12 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center">
              <DollarSign className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Trips */}
        <Card className="col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Trips</CardTitle>
                <CardDescription>Your latest itineraries</CardDescription>
              </div>
              <Link href="/trips" className="text-sm text-primary font-medium hover:underline">
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {dashboard.recentTrips.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No trips planned yet.</p>
                <Link href="/trips/new" className="text-primary mt-2 inline-block font-medium">Create your first trip</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {dashboard.recentTrips.map(trip => (
                  <Link key={trip.id} href={`/trips/${trip.id}`}>
                    <div className="flex items-center justify-between p-3 hover:bg-muted rounded-lg transition-colors border border-transparent hover:border-border cursor-pointer">
                      <div>
                        <p className="font-semibold text-foreground">{trip.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">{trip.stopCount} stops</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Popular Cities */}
        <Card className="col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Popular Destinations</CardTitle>
                <CardDescription>Trending right now</CardDescription>
              </div>
              <Link href="/cities" className="text-sm text-primary font-medium hover:underline">
                Explore more
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboard.popularCities.map(city => (
                <div key={city.id} className="flex items-center p-3 rounded-lg border">
                  <div className="h-12 w-12 rounded bg-muted overflow-hidden flex-shrink-0 relative">
                    {city.imageUrl ? (
                      <img src={city.imageUrl} alt={city.name} className="object-cover w-full h-full" />
                    ) : (
                      <MapPin className="h-6 w-6 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-muted-foreground" />
                    )}
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="font-semibold">{city.name}</p>
                    <p className="text-sm text-muted-foreground">{city.country}</p>
                  </div>
                  <div className="text-right flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-xs font-bold">{city.popularityScore}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
