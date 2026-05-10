import { useState } from "react";
import { useListCities, getListCitiesQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Search, Globe, DollarSign, TrendingUp } from "lucide-react";
import { useDebounce } from "@/hooks/use-mobile";

export default function CitiesList() {
  const [searchQuery, setSearchQuery] = useState("");
  // In a real app we'd use a debounce hook here for the query parameter
  
  const { data: cities, isLoading } = useListCities({ q: searchQuery }, { 
    query: { queryKey: [...getListCitiesQueryKey(), { q: searchQuery }] } 
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Destinations</h1>
        <p className="text-muted-foreground">Explore cities around the world for your next trip.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search for a city or country..." 
          className="pl-10"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <Skeleton key={i} className="h-64 rounded-xl" />)}
        </div>
      ) : !cities || cities.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Globe className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p>No cities found matching "{searchQuery}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {cities.map(city => (
            <Card key={city.id} className="overflow-hidden group hover:border-primary transition-colors cursor-pointer">
              {city.imageUrl ? (
                <div className="h-40 overflow-hidden">
                  <img src={city.imageUrl} alt={city.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
              ) : (
                <div className="h-40 bg-muted flex items-center justify-center">
                  <MapPin className="h-8 w-8 text-muted-foreground opacity-20" />
                </div>
              )}
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-lg">{city.name}</CardTitle>
                <CardDescription>{city.country} • {city.region}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                  {city.description || "A beautiful destination waiting to be explored."}
                </p>
                <div className="flex justify-between items-center text-xs font-medium">
                  {city.costIndex && (
                    <div className="flex items-center text-muted-foreground">
                      <DollarSign className="h-3 w-3 mr-1" />
                      Cost Index: {city.costIndex}/100
                    </div>
                  )}
                  {city.popularityScore && (
                    <div className="flex items-center text-amber-600">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Pop: {city.popularityScore}%
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}