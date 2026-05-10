import { useState } from "react";
import { useListActivities, getListActivitiesQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Compass, DollarSign, Clock, Star, MapPin } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ActivityType } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";

export default function ActivitiesList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  
  const { data: activities, isLoading } = useListActivities(
    { q: searchQuery, type: typeFilter === "all" ? undefined : typeFilter }, 
    { query: { queryKey: [...getListActivitiesQueryKey(), { q: searchQuery, type: typeFilter }] } }
  );

  const types = Object.values(ActivityType);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Activities</h1>
        <p className="text-muted-foreground">Discover things to do around the world.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search activities..." 
            className="pl-10"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {types.map(type => (
              <SelectItem key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <Skeleton key={i} className="h-[340px] rounded-xl" />)}
        </div>
      ) : !activities || activities.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Compass className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p>No activities found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {activities.map(activity => (
            <Card key={activity.id} className="overflow-hidden flex flex-col group cursor-pointer hover:border-primary transition-colors">
              {activity.imageUrl ? (
                <div className="h-48 overflow-hidden">
                  <img src={activity.imageUrl} alt={activity.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
              ) : (
                <div className="h-48 bg-muted flex items-center justify-center border-b">
                  <Compass className="h-12 w-12 text-muted-foreground opacity-20" />
                </div>
              )}
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-lg leading-tight line-clamp-2">{activity.name}</CardTitle>
                  {activity.rating && (
                    <div className="flex items-center text-amber-500 text-sm font-medium shrink-0 bg-amber-50 px-1.5 py-0.5 rounded">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      {activity.rating}
                    </div>
                  )}
                </div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <Badge variant="secondary" className="font-normal text-[10px] uppercase px-1.5 py-0">{activity.type}</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0 flex-1">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {activity.description || "An amazing experience you don't want to miss."}
                </p>
              </CardContent>
              <CardFooter className="p-4 bg-muted/30 border-t flex justify-between text-sm font-medium">
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  {activity.estimatedCost}
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1" />
                  {activity.durationHours}h
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}