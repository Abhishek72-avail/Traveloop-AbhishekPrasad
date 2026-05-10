import { useGetAnalyticsOverview, useGetAdminUsers, getGetAnalyticsOverviewQueryKey, getGetAdminUsersQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, MapPin, Activity, Users, Settings } from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function AdminDashboard() {
  const { data: analytics, isLoading: isAnalyticsLoading, isError } = useGetAnalyticsOverview({
    query: { queryKey: getGetAnalyticsOverviewQueryKey(), retry: false }
  });
  
  const { data: users, isLoading: isUsersLoading } = useGetAdminUsers({
    query: { queryKey: getGetAdminUsersQueryKey(), retry: false }
  });

  if (isAnalyticsLoading || isUsersLoading) return <div className="space-y-6 animate-pulse p-8"><Skeleton className="h-10 w-full" /><Skeleton className="h-64" /></div>;

  // Use real data if admin, otherwise mock data to show the design
  const showMock = isError || !analytics || !users;
  
  const mockPieData = [
    { name: 'Active', value: 400 },
    { name: 'Inactive', value: 300 },
    { name: 'New', value: 300 },
  ];
  
  const mockLineData = [
    { name: 'Jan', uv: 4000 },
    { name: 'Feb', uv: 3000 },
    { name: 'Mar', uv: 2000 },
    { name: 'Apr', uv: 2780 },
    { name: 'May', uv: 1890 },
    { name: 'Jun', uv: 2390 },
  ];

  const barData = showMock ? mockLineData.map(d => ({ date: d.name, count: d.uv / 100 })) : analytics.tripsPerDay.slice(-10);
  const pieData = showMock ? mockPieData : [
    { name: 'Users', value: analytics.totalUsers },
    { name: 'Trips', value: analytics.totalTrips },
    { name: 'Cities', value: analytics.totalCities },
  ];

  const topCitiesList = showMock ? 
    [{ city: { name: "Paris", country: "France" }, tripCount: 150 }, { city: { name: "Rome", country: "Italy" }, tripCount: 120 }, { city: { name: "Tokyo", country: "Japan" }, tripCount: 95 }] : 
    analytics.topCities.slice(0, 5);

  const topActivitiesList = showMock ? 
    [{ activity: { name: "Museum Tour" }, useCount: 340 }, { activity: { name: "Wine Tasting" }, useCount: 210 }, { activity: { name: "Hiking" }, useCount: 180 }] : 
    analytics.topActivities.slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-24">
      {/* Header & Warning */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
        {showMock && (
          <div className="bg-amber-500/10 text-amber-600 px-4 py-2 rounded-md text-sm font-medium border border-amber-500/20">
            Preview Mode: You are not an admin. Showing mock data for design purposes.
          </div>
        )}
      </div>

      {/* Search and Filters Bar (Matching Wireframe) */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search bar ......." className="pl-9 bg-card border-border max-w-md" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
          <Button variant="outline" className="bg-card">Manage Users</Button>
          <Button variant="outline" className="bg-card">Popular cities</Button>
          <Button variant="outline" className="bg-card">Popular activities</Button>
          <Button variant="outline" className="bg-card">User Trends and Analytics</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Left Column: Charts Container */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border shadow-sm overflow-hidden bg-card/50">
            <CardContent className="p-6 space-y-8">
              
              {/* Top Row inside Left Panel */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="h-4 w-4 rounded-full bg-muted-foreground/30"></div>
                      <div className="h-3 w-32 bg-muted rounded-full"></div>
                    </div>
                  ))}
                </div>
                <div className="h-[200px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Line Chart */}
              <div className="h-[250px] w-full pt-4 border-t border-border/50">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={showMock ? mockLineData : analytics.tripsPerDay.slice(-15)}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#888888" strokeOpacity={0.2} />
                    <XAxis dataKey={showMock ? "name" : "date"} tickFormatter={val => showMock ? val : new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <RechartsTooltip />
                    <Line type="monotone" dataKey={showMock ? "uv" : "count"} stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Bar Chart Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-border/50">
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.2} />
                      <XAxis dataKey={showMock ? "date" : "date"} tickFormatter={val => showMock ? val : new Date(val).toLocaleDateString(undefined, { day: 'numeric' })} fontSize={10} axisLine={false} tickLine={false} />
                      <RechartsTooltip />
                      <Bar dataKey="count" fill="#FFBB28" radius={[4, 4, 0, 0]} barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3 flex flex-col justify-center">
                  <div className="h-4 w-full bg-muted rounded-sm"></div>
                  <div className="h-4 w-5/6 bg-muted rounded-sm"></div>
                  <div className="h-4 w-4/6 bg-muted rounded-sm"></div>
                  <div className="h-4 w-full bg-muted rounded-sm"></div>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Right Column: Lists & Management */}
        <div className="space-y-6">
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" /> Manage User Section
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This section is responsible for managing the users and their actions. This section will also allow the admin to view all the trips made by the user.
              </p>
              <Button className="w-full mt-4" variant="secondary">View All Users</Button>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" /> Popular cities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Lists of the popular cities where the users are visiting based on the current year trends.
              </p>
              <div className="space-y-3">
                {topCitiesList.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between items-center text-sm border-b border-border/50 pb-2 last:border-0 last:pb-0">
                    <span className="font-medium">{item.city.name}</span>
                    <span className="text-muted-foreground">{item.tripCount} trips</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" /> Popular activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Lists of the popular activities that the users are doing based on the current year trend data.
              </p>
              <div className="space-y-3">
                {topActivitiesList.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between items-center text-sm border-b border-border/50 pb-2 last:border-0 last:pb-0">
                    <span className="font-medium">{item.activity.name}</span>
                    <span className="text-muted-foreground">{item.useCount} times</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" /> User trends and analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This section will major focus on the providing analysis access various points and give useful information to the user.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}