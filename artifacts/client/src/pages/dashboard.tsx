import { useGetDashboard } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Search, Plus, Calendar, Map, ImagePlus } from "lucide-react";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export default function Dashboard() {
  const { data: dashboard, isLoading } = useGetDashboard();
  const [customBanner, setCustomBanner] = useState<string | null>(null);

  useEffect(() => {
    const savedBanner = localStorage.getItem("traveloop_dashboard_banner");
    if (savedBanner) setCustomBanner(savedBanner);
  }, []);

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setCustomBanner(base64String);
        localStorage.setItem("traveloop_dashboard_banner", base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse p-4 md:p-8">
        <Skeleton className="w-full h-64 md:h-80 rounded-2xl" />
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
        <Skeleton className="h-8 w-64 mt-8 mb-4" />
        <div className="flex gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-40 w-40 rounded-xl flex-shrink-0" />
          ))}
        </div>
        <Skeleton className="h-8 w-48 mt-8 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!dashboard) return null;

  return (
    <div className="relative min-h-screen pb-24 max-w-7xl mx-auto">
      {/* Banner Image */}
      <div className="group w-full h-64 md:h-80 lg:h-96 rounded-2xl overflow-hidden relative mb-8 shadow-sm cursor-pointer">
        <img 
          src={customBanner || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop"} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          alt="Travel Banner" 
        />
        <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleBannerUpload} 
          />
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight drop-shadow-md flex items-center gap-3">
            <ImagePlus className="h-8 w-8" />
            Change Banner Image
          </h1>
          <p className="text-white/80 mt-2 font-medium">Click to upload a new banner</p>
        </label>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row gap-3 mb-12">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search bar ......." className="pl-9 h-10 border-muted-foreground/30 bg-background/50 backdrop-blur-sm" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
          <Button variant="outline" className="border-muted-foreground/30 h-10 whitespace-nowrap">Group by</Button>
          <Button variant="outline" className="border-muted-foreground/30 h-10 whitespace-nowrap">Filter</Button>
          <Button variant="outline" className="border-muted-foreground/30 h-10 whitespace-nowrap">Sort by...</Button>
        </div>
      </div>

      {/* Top Regional Selections */}
      <div className="mb-14">
        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground whitespace-nowrap">Top Regional Selections</h2>
          <div className="h-px bg-border flex-1 mt-1" />
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
          {dashboard.popularCities.length > 0 ? dashboard.popularCities.map((city) => (
            <div 
              key={city.id} 
              className="relative w-40 h-40 md:w-48 md:h-48 rounded-xl overflow-hidden flex-shrink-0 snap-center group cursor-pointer border border-border shadow-sm hover:shadow-md transition-all"
            >
              {city.imageUrl ? (
                <img src={city.imageUrl} alt={city.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <MapPin className="h-8 w-8 text-muted-foreground/50" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 left-0 p-3 w-full">
                <p className="text-white font-semibold text-sm md:text-base truncate">{city.name}</p>
                <p className="text-white/70 text-xs truncate">{city.country}</p>
              </div>
            </div>
          )) : (
            <div className="text-muted-foreground italic text-sm py-8">No regional data available yet.</div>
          )}
        </div>
      </div>

      {/* Previous Trips */}
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground whitespace-nowrap">Previous Trips</h2>
          <div className="h-px bg-border flex-1 mt-1" />
        </div>
        
        {dashboard.recentTrips.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-muted/30 rounded-2xl border border-dashed border-border">
            <Map className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground font-medium mb-2">No previous trips found</p>
            <p className="text-sm text-muted-foreground/70 text-center max-w-sm mb-6">You haven't planned any trips yet. Click the button below to start your first adventure!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboard.recentTrips.map((trip) => (
              <Link key={trip.id} href={`/trips/${trip.id}`}>
                <div className="group h-[320px] rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-lg transition-all cursor-pointer relative bg-card flex flex-col">
                  <div className="h-3/5 w-full relative overflow-hidden bg-muted">
                    {trip.coverPhoto ? (
                      <img src={trip.coverPhoto} alt={trip.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-sky-900/10">
                        <Map className="h-10 w-10 text-sky-700/30" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-background/90 backdrop-blur text-foreground text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">
                      {trip.stopCount || 0} stops
                    </div>
                  </div>
                  <div className="flex-1 p-5 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-card-foreground line-clamp-1 group-hover:text-primary transition-colors">{trip.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {trip.description || "No description provided."}
                      </p>
                    </div>
                    <div className="flex items-center text-xs font-medium text-muted-foreground mt-4 pt-4 border-t border-border">
                      <Calendar className="h-3.5 w-3.5 mr-1.5" />
                      {new Date(trip.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} 
                      {" - "}
                      {new Date(trip.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Floating Plan a Trip Button */}
      <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-50">
        <Link href="/trips/new">
          <Button size="lg" className="rounded-full shadow-xl h-14 px-6 text-base font-medium transition-transform hover:scale-105" style={{ background: "linear-gradient(135deg, #0d4f6b, #0e7490)" }}>
            <Plus className="mr-2 h-5 w-5" /> Plan a trip
          </Button>
        </Link>
      </div>
    </div>
  );
}
