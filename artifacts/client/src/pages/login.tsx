import { useLocation } from "wouter";
import { useLogin } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { PlaneTakeoff, Globe, MapPin, ShieldCheck, Sparkles, Mail, Lock } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const features = [
  { icon: Globe, title: "Global Itineraries", desc: "Plan multi-city trips with smart stop sequencing" },
  { icon: MapPin, title: "Live Budget Tracking", desc: "Real-time breakdown across accommodation, transport & food" },
  { icon: ShieldCheck, title: "Enterprise-Grade Security", desc: "SSO-ready with role-based access control" },
  { icon: Sparkles, title: "AI-Powered Planning", desc: "Personalised recommendations for every destination" },
];

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const loginMutation = useLogin();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(
      { data: values },
      {
        onSuccess: (data) => {
          localStorage.setItem("traveloop_token", data.token);
          setLocation("/");
        },
        onError: (err) => {
          toast({
            variant: "destructive",
            title: "Sign in failed",
            description: err.message || "Please check your credentials and try again.",
          });
        },
      }
    );
  };

  return (
    <div className="flex min-h-screen">
      {/* ── Left Panel ─────────────────────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[55%] xl:w-[60%] flex-col relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, #0d4f6b 0%, #1a6b8a 40%, #0e7490 70%, #164e63 100%)" }}
      >
        {/* Background decorative circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #7dd3fc, transparent)" }} />
        <div className="absolute top-1/2 -right-16 w-72 h-72 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #38bdf8, transparent)" }} />
        <div className="absolute -bottom-16 left-1/3 w-80 h-80 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #0ea5e9, transparent)" }} />

        {/* World map subtle overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        <div className="relative z-10 flex flex-col h-full p-10 xl:p-14">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
              <PlaneTakeoff className="h-5 w-5 text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">Traveloop</span>
          </div>

          {/* Hero content */}
          <div className="flex-1 flex flex-col justify-center mt-10">
            <div className="mb-3">
              <span className="text-xs font-semibold tracking-widest text-sky-300 uppercase">Enterprise Travel Platform</span>
            </div>
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-5">
              Plan smarter.<br />Travel better.<br />
              <span className="text-sky-300">Together.</span>
            </h1>
            <p className="text-blue-100/80 text-lg leading-relaxed max-w-md mb-10">
              The all-in-one travel management workspace trusted by teams worldwide — itineraries, budgets, checklists and collaboration in one place.
            </p>

            {/* Feature list */}
            <div className="space-y-5">
              {features.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-lg bg-white/10 backdrop-blur flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="h-4 w-4 text-sky-300" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{title}</p>
                    <p className="text-blue-200/70 text-xs mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom badge */}
          <div className="mt-8 flex items-center gap-2 text-blue-200/60 text-xs">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>SOC 2 Type II · GDPR compliant · 256-bit encryption</span>
          </div>
        </div>
      </div>

      {/* ── Right Panel (Login Form) ────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-white px-6 py-12 sm:px-10 lg:px-16 xl:px-24">
        {/* Mobile logo */}
        <div className="flex items-center gap-2 mb-10 lg:hidden">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0d4f6b, #0e7490)" }}>
            <PlaneTakeoff className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-xl text-gray-800">Traveloop</span>
        </div>

        <div className="w-full max-w-md">
          {/* Avatar / logo circle */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 rounded-full shadow-lg flex items-center justify-center border-4 border-white ring-4 ring-cyan-100" style={{ background: "linear-gradient(145deg, #0d4f6b, #0e7490)" }}>
              <PlaneTakeoff className="h-9 w-9 text-white" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-gray-500 text-sm mt-1">Sign in to your Traveloop workspace</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium text-sm">Email Address</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="name@company.com"
                          className="pl-10 h-11 border-gray-200 focus:border-cyan-500 focus:ring-cyan-500/20 rounded-lg"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-gray-700 font-medium text-sm">Password</FormLabel>
                      <button type="button" className="text-xs font-medium hover:underline" style={{ color: "#0e7490" }}>
                        Forgot password?
                      </button>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="pl-10 h-11 border-gray-200 focus:border-cyan-500 focus:ring-cyan-500/20 rounded-lg"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-11 font-semibold text-sm rounded-lg mt-2 transition-all duration-200 shadow-md hover:shadow-lg"
                style={{ background: "linear-gradient(135deg, #0d4f6b, #0e7490)" }}
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Signing in...
                  </span>
                ) : "Sign In"}
              </Button>
            </form>
          </Form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Don't have an account?{" "}
              <button
                className="font-semibold hover:underline"
                style={{ color: "#0e7490" }}
                onClick={() => setLocation("/signup")}
              >
                Create a free account
              </button>
            </p>
          </div>
        </div>

        <p className="mt-10 text-xs text-gray-400 text-center">
          © {new Date().getFullYear()} Traveloop Inc. · Privacy Policy · Terms of Service
        </p>
      </div>
    </div>
  );
}
