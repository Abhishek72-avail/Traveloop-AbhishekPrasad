import { useLocation } from "wouter";
import { useSignup } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import {
  PlaneTakeoff, User, Mail, Lock, Phone,
  MapPin, Globe, FileText, ChevronLeft
} from "lucide-react";

const signupSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phoneNumber: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  additionalInfo: z.string().optional(),
});

type SignupFormValues = z.infer<typeof signupSchema>;

const inputClass = "h-10 border-gray-200 focus:border-cyan-500 focus:ring-cyan-500/20 rounded-lg text-sm";

function FieldIcon({ icon: Icon }: { icon: React.ElementType }) {
  return <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />;
}

export default function Signup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const signupMutation = useSignup();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "", lastName: "", email: "",
      password: "", phoneNumber: "", city: "", country: "", additionalInfo: "",
    },
  });

  const onSubmit = (values: SignupFormValues) => {
    const name = `${values.firstName.trim()} ${values.lastName.trim()}`.trim();
    signupMutation.mutate(
      { data: { name, email: values.email, password: values.password } },
      {
        onSuccess: (data) => {
          localStorage.setItem("traveloop_token", data.token);
          setLocation("/");
        },
        onError: (err) => {
          toast({
            variant: "destructive",
            title: "Registration failed",
            description: err.message || "An error occurred. Please try again.",
          });
        },
      }
    );
  };

  return (
    <div className="flex min-h-screen">
      {/* ── Left Panel ─────────────────────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[38%] xl:w-[35%] flex-col relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #0d4f6b 0%, #1a6b8a 50%, #164e63 100%)" }}
      >
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #7dd3fc, transparent)" }} />
        <div className="absolute -bottom-10 -right-10 w-72 h-72 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #38bdf8, transparent)" }} />

        <div className="relative z-10 flex flex-col h-full p-10 xl:p-12">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
              <PlaneTakeoff className="h-5 w-5 text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">Traveloop</span>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <div className="mb-3">
              <span className="text-xs font-semibold tracking-widest text-sky-300 uppercase">Join the Platform</span>
            </div>
            <h1 className="text-3xl xl:text-4xl font-bold text-white leading-snug mb-5">
              Start planning<br />
              <span className="text-sky-300">extraordinary</span><br />
              journeys today.
            </h1>
            <p className="text-blue-100/75 text-base leading-relaxed">
              Create your free account and get access to AI-powered trip planning, real-time budget tracking, and smart collaboration tools.
            </p>

            <div className="mt-10 space-y-3">
              {[
                "Unlimited trip itineraries",
                "Live budget & expense tracking",
                "Collaborative team workspaces",
                "Smart packing checklists",
                "Public trip sharing",
              ].map(item => (
                <div key={item} className="flex items-center gap-3 text-sm text-blue-100/80">
                  <div className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <p className="text-blue-200/40 text-xs mt-8">
            Free forever for individuals · No credit card required
          </p>
        </div>
      </div>

      {/* ── Right Panel (Register Form) ─────────────────────────────── */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="min-h-full flex flex-col items-center justify-center py-10 px-6 sm:px-10">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0d4f6b, #0e7490)" }}>
              <PlaneTakeoff className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-800">Traveloop</span>
          </div>

          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Card header */}
            <div className="px-8 pt-8 pb-6 border-b border-gray-100">
              {/* Avatar circle */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg border-4 border-white ring-4 ring-cyan-100"
                    style={{ background: "linear-gradient(145deg, #0d4f6b, #0e7490)" }}
                  >
                    <User className="h-9 w-9 text-white" />
                  </div>
                  <div
                    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full border-2 border-white flex items-center justify-center"
                    style={{ background: "#0e7490" }}
                  >
                    <PlaneTakeoff className="h-3 w-3 text-white" />
                  </div>
                </div>
              </div>

              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
                <p className="text-gray-500 text-sm mt-1">Fill in your details to get started with Traveloop</p>
              </div>
            </div>

            {/* Form body */}
            <div className="px-8 py-7">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                  {/* Section: Personal Info */}
                  <div>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <User className="h-3.5 w-3.5" />
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-medium text-sm">First Name <span className="text-red-400">*</span></FormLabel>
                            <FormControl>
                              <div className="relative">
                                <FieldIcon icon={User} />
                                <Input placeholder="John" className={`pl-9 ${inputClass}`} {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-medium text-sm">Last Name <span className="text-red-400">*</span></FormLabel>
                            <FormControl>
                              <div className="relative">
                                <FieldIcon icon={User} />
                                <Input placeholder="Doe" className={`pl-9 ${inputClass}`} {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-medium text-sm">Email Address <span className="text-red-400">*</span></FormLabel>
                            <FormControl>
                              <div className="relative">
                                <FieldIcon icon={Mail} />
                                <Input type="email" placeholder="john@company.com" className={`pl-9 ${inputClass}`} {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-medium text-sm">Phone Number</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <FieldIcon icon={Phone} />
                                <Input type="tel" placeholder="+1 (555) 000-0000" className={`pl-9 ${inputClass}`} {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-100" />

                  {/* Section: Location */}
                  <div>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5" />
                      Location
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-medium text-sm">City</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <FieldIcon icon={MapPin} />
                                <Input placeholder="New York" className={`pl-9 ${inputClass}`} {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-medium text-sm">Country</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <FieldIcon icon={Globe} />
                                <Input placeholder="United States" className={`pl-9 ${inputClass}`} {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-100" />

                  {/* Section: Account Security */}
                  <div>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Lock className="h-3.5 w-3.5" />
                      Account Security
                    </h3>
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium text-sm">Password <span className="text-red-400">*</span></FormLabel>
                          <FormControl>
                            <div className="relative">
                              <FieldIcon icon={Lock} />
                              <Input type="password" placeholder="Min. 6 characters" className={`pl-9 ${inputClass}`} {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-100" />

                  {/* Section: Additional Info */}
                  <div>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5" />
                      Additional Information
                    </h3>
                    <FormField
                      control={form.control}
                      name="additionalInfo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium text-sm">Tell us about yourself</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Share your travel style, preferences, or anything else you'd like us to know..."
                              className="resize-none border-gray-200 focus:border-cyan-500 focus:ring-cyan-500/20 rounded-lg text-sm min-h-[90px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    className="w-full h-11 font-semibold text-sm rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                    style={{ background: "linear-gradient(135deg, #0d4f6b, #0e7490)" }}
                    disabled={signupMutation.isPending}
                  >
                    {signupMutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Creating your account...
                      </span>
                    ) : "Register & Get Started"}
                  </Button>

                  <p className="text-center text-xs text-gray-400">
                    By registering, you agree to our{" "}
                    <span className="underline cursor-pointer" style={{ color: "#0e7490" }}>Terms of Service</span>
                    {" "}and{" "}
                    <span className="underline cursor-pointer" style={{ color: "#0e7490" }}>Privacy Policy</span>.
                  </p>
                </form>
              </Form>
            </div>

            {/* Card footer */}
            <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-500">
                Already have an account?{" "}
                <button
                  className="font-semibold hover:underline inline-flex items-center gap-1"
                  style={{ color: "#0e7490" }}
                  onClick={() => setLocation("/login")}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Back to Sign In
                </button>
              </p>
            </div>
          </div>

          <p className="mt-6 text-xs text-gray-400 text-center">
            © {new Date().getFullYear()} Traveloop Inc. · All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
