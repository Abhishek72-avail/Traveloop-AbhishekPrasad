import { useParams, useLocation } from "wouter";
import { useGetTripBudget, getGetTripBudgetQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const COLORS = {
  transport: 'hsl(var(--chart-1))',
  accommodation: 'hsl(var(--chart-2))',
  activities: 'hsl(var(--chart-3))',
  meals: 'hsl(var(--chart-4))',
  other: 'hsl(var(--chart-5))'
};

export default function TripBudget() {
  const { id } = useParams();
  const tripId = Number(id);
  const [, setLocation] = useLocation();

  const { data: budget, isLoading } = useGetTripBudget(tripId, { query: { enabled: !!tripId, queryKey: getGetTripBudgetQueryKey(tripId) } });

  if (isLoading) return <div className="space-y-6"><Skeleton className="h-10 w-1/3" /><Skeleton className="h-64" /></div>;
  if (!budget) return <div>Budget not found</div>;

  const pieData = Object.entries(budget.breakdown).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: value || 0
  })).filter(d => d.value > 0);

  const isOverBudget = budget.totalBudget && budget.totalEstimated > budget.totalBudget;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => setLocation(`/trips/${tripId}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budget & Costs</h1>
          <p className="text-muted-foreground">Financial breakdown of your trip.</p>
        </div>
      </div>

      {isOverBudget && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Over Budget Warning</AlertTitle>
          <AlertDescription>
            Your estimated costs (${budget.totalEstimated.toLocaleString()}) exceed your total budget (${budget.totalBudget?.toLocaleString()}).
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Budget</CardDescription>
            <CardTitle className="text-2xl">{budget.totalBudget ? `$${budget.totalBudget.toLocaleString()}` : "Not set"}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Estimated Cost</CardDescription>
            <CardTitle className={`text-2xl ${isOverBudget ? 'text-destructive' : ''}`}>
              ${budget.totalEstimated.toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Remaining</CardDescription>
            <CardTitle className="text-2xl">
              {budget.totalBudget ? `$${(budget.totalBudget - budget.totalEstimated).toLocaleString()}` : "N/A"}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg Daily Cost</CardDescription>
            <CardTitle className="text-2xl">
              ${budget.dailyCosts.length > 0 
                ? Math.round(budget.totalEstimated / budget.dailyCosts.length).toLocaleString() 
                : "0"}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cost Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS] || COLORS.other} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value: number) => `$${value}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">No cost data available.</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily Expenses</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {budget.dailyCosts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budget.dailyCosts}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})} />
                  <YAxis />
                  <RechartsTooltip 
                    formatter={(value: number) => `$${value}`}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  />
                  <Bar dataKey="cost" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">No daily data available.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}