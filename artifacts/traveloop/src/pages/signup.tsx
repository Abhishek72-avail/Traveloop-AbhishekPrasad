import { useRef, useState } from "react";
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
import { PlaneTakeoff, User, Mail, Lock, Phone, MapPin, Globe, Camera, ChevronLeft } from "lucide-react";

const signupSchema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Min. 6 characters"),
  phoneNumber: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  additionalInfo: z.string().optional(),
});

type SignupFormValues = z.infer<typeof signupSchema>;

function FieldIcon({ icon: Icon }: { icon: React.ElementType }) {
  return <Icon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />;
}

const inp = "pl-8 h-9 text-sm border-gray-200 rounded-md focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30";

export default function Signup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const signupMutation = useSignup();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "", lastName: "", email: "",
      password: "", phoneNumber: "", city: "", country: "", additionalInfo: "",
    },
  });

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ variant: "destructive", title: "Please select an image file" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ variant: "destructive", title: "Image must be under 5 MB" });
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

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
    <div className="h-screen flex overflow-hidden">
      {/* ── Left Panel ─────────────────────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[36%] xl:w-[33%] flex-col relative overflow-hidden shrink-0"
        style={{ background: "linear-gradient(160deg, #0d4f6b 0%, #1a6b8a 50%, #164e63 100%)" }}
      >
        <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #7dd3fc, transparent)" }} />
        <div className="absolute -bottom-10 -right-10 w-60 h-60 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #38bdf8, transparent)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-5" style={{ background: "radial-gradient(circle, #ffffff, transparent)" }} />

        <div className="relative z-10 flex flex-col h-full p-8 xl:p-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
              <PlaneTakeoff className="h-4 w-4 text-white" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">Traveloop</span>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <span className="text-xs font-semibold tracking-widest text-sky-300 uppercase mb-3">Join the Platform</span>
            <h1 className="text-3xl xl:text-4xl font-bold text-white leading-snug mb-4">
              Start planning<br />
              <span className="text-sky-300">extraordinary</span><br />
              journeys today.
            </h1>
            <p className="text-blue-100/70 text-sm leading-relaxed mb-8">
              Create your free account and unlock AI-powered trip planning, real-time budgets, and smart collaboration tools.
            </p>
            <div className="space-y-2.5">
              {[
                "Unlimited trip itineraries",
                "Live budget & expense tracking",
                "Collaborative team workspaces",
                "Smart packing checklists",
                "Public trip sharing & export",
              ].map(item => (
                <div key={item} className="flex items-center gap-2.5 text-sm text-blue-100/80">
                  <div className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <p className="text-blue-200/40 text-xs">Free forever for individuals · No credit card required</p>
        </div>
      </div>

      {/* ── Right Panel ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-4 sm:px-8">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-4 lg:hidden">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0d4f6b, #0e7490)" }}>
              <PlaneTakeoff className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-800">Traveloop</span>
          </div>

          {/* Card */}
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            {/* Header */}
            <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex items-center gap-5">
              {/* Clickable avatar with upload */}
              <div className="shrink-0">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  className="relative group w-16 h-16 rounded-full overflow-hidden ring-4 ring-cyan-100 border-2 border-white shadow focus:outline-none focus:ring-cyan-400 transition-all"
                  title="Click to upload photo"
                >
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(145deg, #0d4f6b, #0e7490)" }}>
                      <User className="h-7 w-7 text-white" />
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="h-5 w-5 text-white" />
                    <span className="text-white text-[9px] font-medium mt-0.5">Upload</span>
                  </div>
                </button>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900">Create your account</h2>
                <p className="text-gray-400 text-xs mt-0.5">
                  {avatarPreview ? "Photo selected ✓ · " : "Click the photo to upload · "}
                  Fill in your details to get started
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="px-6 py-4 flex-1">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  {/* Row 1: Name */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <FormField control={form.control} name="firstName" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium text-gray-600">First Name <span className="text-red-400">*</span></FormLabel>
                        <FormControl>
                          <div className="relative">
                            <FieldIcon icon={User} />
                            <Input placeholder="John" className={inp} {...field} />
                          </div>
                        </FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="lastName" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium text-gray-600">Last Name <span className="text-red-400">*</span></FormLabel>
                        <FormControl>
                          <div className="relative">
                            <FieldIcon icon={User} />
                            <Input placeholder="Doe" className={inp} {...field} />
                          </div>
                        </FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )} />
                  </div>

                  {/* Row 2: Email + Phone */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium text-gray-600">Email Address <span className="text-red-400">*</span></FormLabel>
                        <FormControl>
                          <div className="relative">
                            <FieldIcon icon={Mail} />
                            <Input type="email" placeholder="john@company.com" className={inp} {...field} />
                          </div>
                        </FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium text-gray-600">Phone Number</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <FieldIcon icon={Phone} />
                            <Input type="tel" placeholder="+1 (555) 000-0000" className={inp} {...field} />
                          </div>
                        </FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )} />
                  </div>

                  {/* Row 3: City + Country */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <FormField control={form.control} name="city" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium text-gray-600">City</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <FieldIcon icon={MapPin} />
                            <Input placeholder="New York" className={inp} {...field} />
                          </div>
                        </FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="country" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium text-gray-600">Country</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <FieldIcon icon={Globe} />
                            <Input placeholder="United States" className={inp} {...field} />
                          </div>
                        </FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )} />
                  </div>

                  {/* Row 4: Password full width */}
                  <div className="mb-3">
                    <FormField control={form.control} name="password" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium text-gray-600">Password <span className="text-red-400">*</span></FormLabel>
                        <FormControl>
                          <div className="relative">
                            <FieldIcon icon={Lock} />
                            <Input type="password" placeholder="Min. 6 characters" className={inp} {...field} />
                          </div>
                        </FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )} />
                  </div>

                  {/* Row 5: Additional Info */}
                  <div className="mb-4">
                    <FormField control={form.control} name="additionalInfo" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium text-gray-600">Additional Information</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Share your travel style, preferences, or anything you'd like us to know..."
                            className="resize-none text-sm border-gray-200 rounded-md focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 min-h-[56px] max-h-[56px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )} />
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    className="w-full h-10 font-semibold text-sm rounded-lg transition-all duration-200 shadow hover:shadow-md"
                    style={{ background: "linear-gradient(135deg, #0d4f6b, #0e7490)" }}
                    disabled={signupMutation.isPending}
                  >
                    {signupMutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Creating account...
                      </span>
                    ) : "Register & Get Started"}
                  </Button>
                </form>
              </Form>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 rounded-b-2xl flex items-center justify-between">
              <p className="text-xs text-gray-400">
                By registering you agree to our{" "}
                <span className="underline cursor-pointer" style={{ color: "#0e7490" }}>Terms</span>
                {" & "}
                <span className="underline cursor-pointer" style={{ color: "#0e7490" }}>Privacy Policy</span>
              </p>
              <button
                className="text-xs font-semibold flex items-center gap-1 hover:underline"
                style={{ color: "#0e7490" }}
                onClick={() => setLocation("/login")}
              >
                <ChevronLeft className="h-3 w-3" />
                Back to Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
