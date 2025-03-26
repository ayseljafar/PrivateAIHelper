import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

const profileFormSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  name: z.string().optional(),
});

const apiKeysFormSchema = z.object({
  openaiApiKey: z.string().min(1, {
    message: "OpenAI API key is required.",
  }),
});

const securityFormSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  deploymentAlerts: z.boolean(),
  securityAlerts: z.boolean(),
  weeklyReports: z.boolean(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type ApiKeysFormValues = z.infer<typeof apiKeysFormSchema>;
type SecurityFormValues = z.infer<typeof securityFormSchema>;
type NotificationSettingsValues = z.infer<typeof notificationSettingsSchema>;

export default function Settings() {
  const [activeTab, setActiveTab] = useState<string>("account");
  const { user } = useAuth();
  const { toast } = useToast();

  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: user?.username || "",
      name: user?.name || "",
    },
  });

  // API Keys form
  const apiKeysForm = useForm<ApiKeysFormValues>({
    resolver: zodResolver(apiKeysFormSchema),
    defaultValues: {
      openaiApiKey: "",
    },
  });

  // Security form
  const securityForm = useForm<SecurityFormValues>({
    resolver: zodResolver(securityFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Notification settings form
  const notificationsForm = useForm<NotificationSettingsValues>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      emailNotifications: true,
      deploymentAlerts: true,
      securityAlerts: true,
      weeklyReports: false,
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      const res = await apiRequest("PATCH", "/api/user/profile", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update profile",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update API keys mutation
  const updateApiKeysMutation = useMutation({
    mutationFn: async (data: ApiKeysFormValues) => {
      const res = await apiRequest("POST", "/api/settings/apikeys", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "API keys updated",
        description: "Your API keys have been updated successfully.",
      });
      apiKeysForm.reset({ openaiApiKey: "" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update API keys",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async (data: SecurityFormValues) => {
      const res = await apiRequest("POST", "/api/user/change-password", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully.",
      });
      securityForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update password",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update notification settings mutation
  const updateNotificationsMutation = useMutation({
    mutationFn: async (data: NotificationSettingsValues) => {
      const res = await apiRequest("POST", "/api/settings/notifications", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Notification settings updated",
        description: "Your notification preferences have been saved.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update notification settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Form submission handlers
  const onProfileSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };

  const onApiKeysSubmit = (data: ApiKeysFormValues) => {
    updateApiKeysMutation.mutate(data);
  };

  const onSecuritySubmit = (data: SecurityFormValues) => {
    updatePasswordMutation.mutate(data);
  };

  const onNotificationsSubmit = (data: NotificationSettingsValues) => {
    updateNotificationsMutation.mutate(data);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Settings</h1>
        <p className="text-neutral-600">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
        <div className="space-y-1">
          <Tabs 
            orientation="vertical" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="space-y-4"
          >
            <TabsList className="flex flex-row md:flex-col h-auto space-x-2 md:space-x-0 md:space-y-1 rounded-none p-0">
              <TabsTrigger 
                value="account" 
                className="justify-start w-full py-2 px-3 text-left data-[state=active]:bg-neutral-100 data-[state=active]:text-primary hover:bg-neutral-50"
              >
                <i className="ri-user-line mr-2"></i>
                Account
              </TabsTrigger>
              <TabsTrigger 
                value="api-keys" 
                className="justify-start w-full py-2 px-3 text-left data-[state=active]:bg-neutral-100 data-[state=active]:text-primary hover:bg-neutral-50"
              >
                <i className="ri-key-line mr-2"></i>
                API Keys
              </TabsTrigger>
              <TabsTrigger 
                value="security" 
                className="justify-start w-full py-2 px-3 text-left data-[state=active]:bg-neutral-100 data-[state=active]:text-primary hover:bg-neutral-50"
              >
                <i className="ri-shield-line mr-2"></i>
                Security
              </TabsTrigger>
              <TabsTrigger 
                value="notifications" 
                className="justify-start w-full py-2 px-3 text-left data-[state=active]:bg-neutral-100 data-[state=active]:text-primary hover:bg-neutral-50"
              >
                <i className="ri-notification-line mr-2"></i>
                Notifications
              </TabsTrigger>
              <TabsTrigger 
                value="appearance" 
                className="justify-start w-full py-2 px-3 text-left data-[state=active]:bg-neutral-100 data-[state=active]:text-primary hover:bg-neutral-50"
              >
                <i className="ri-palette-line mr-2"></i>
                Appearance
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="space-y-6">
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your account information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form 
                    id="profile-form" 
                    onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={profileForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            This is your display name.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button 
                  type="submit" 
                  form="profile-form"
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="api-keys" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>API Keys</CardTitle>
                <CardDescription>
                  Configure your API keys for external services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...apiKeysForm}>
                  <form 
                    id="api-keys-form" 
                    onSubmit={apiKeysForm.handleSubmit(onApiKeysSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={apiKeysForm.control}
                      name="openaiApiKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>OpenAI API Key</FormLabel>
                          <FormControl>
                            <Input {...field} type="password" />
                          </FormControl>
                          <FormDescription>
                            Required for AI code generation and natural language processing.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button 
                  type="submit" 
                  form="api-keys-form"
                  disabled={updateApiKeysMutation.isPending}
                >
                  {updateApiKeysMutation.isPending ? "Saving..." : "Save API Keys"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Update your password and security preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...securityForm}>
                  <form 
                    id="security-form" 
                    onSubmit={securityForm.handleSubmit(onSecuritySubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={securityForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Password</FormLabel>
                          <FormControl>
                            <Input {...field} type="password" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={securityForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input {...field} type="password" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={securityForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm New Password</FormLabel>
                          <FormControl>
                            <Input {...field} type="password" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button 
                  type="submit" 
                  form="security-form"
                  disabled={updatePasswordMutation.isPending}
                >
                  {updatePasswordMutation.isPending ? "Updating..." : "Update Password"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Manage when and how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...notificationsForm}>
                  <form 
                    id="notifications-form" 
                    onSubmit={notificationsForm.handleSubmit(onNotificationsSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={notificationsForm.control}
                      name="emailNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between p-3 rounded-lg border">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Email Notifications</FormLabel>
                            <FormDescription>
                              Receive notifications via email
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={notificationsForm.control}
                      name="deploymentAlerts"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between p-3 rounded-lg border">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Deployment Alerts</FormLabel>
                            <FormDescription>
                              Get notified about deployment success or failures
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={notificationsForm.control}
                      name="securityAlerts"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between p-3 rounded-lg border">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Security Alerts</FormLabel>
                            <FormDescription>
                              Get notified about important security events
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={notificationsForm.control}
                      name="weeklyReports"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between p-3 rounded-lg border">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Weekly Reports</FormLabel>
                            <FormDescription>
                              Receive weekly summary of activities and stats
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button 
                  type="submit" 
                  form="notifications-form"
                  disabled={updateNotificationsMutation.isPending}
                >
                  {updateNotificationsMutation.isPending ? "Saving..." : "Save Preferences"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Customize the look and feel of your interface
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">Theme</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="border rounded-lg p-4 cursor-pointer bg-white flex flex-col items-center justify-center gap-2 ring-2 ring-primary">
                      <div className="w-full h-20 bg-white border rounded-md"></div>
                      <span className="text-sm font-medium">Light</span>
                    </div>
                    <div className="border rounded-lg p-4 cursor-pointer bg-neutral-100 flex flex-col items-center justify-center gap-2">
                      <div className="w-full h-20 bg-neutral-900 border rounded-md"></div>
                      <span className="text-sm font-medium">Dark</span>
                    </div>
                    <div className="border rounded-lg p-4 cursor-pointer bg-neutral-100 flex flex-col items-center justify-center gap-2">
                      <div className="w-full h-20 bg-gradient-to-b from-white to-neutral-900 border rounded-md"></div>
                      <span className="text-sm font-medium">System</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-3">Accent Color</h3>
                  <div className="grid grid-cols-6 gap-2">
                    <div className="w-10 h-10 rounded-full bg-primary cursor-pointer ring-2 ring-primary ring-offset-2"></div>
                    <div className="w-10 h-10 rounded-full bg-blue-500 cursor-pointer"></div>
                    <div className="w-10 h-10 rounded-full bg-green-500 cursor-pointer"></div>
                    <div className="w-10 h-10 rounded-full bg-purple-500 cursor-pointer"></div>
                    <div className="w-10 h-10 rounded-full bg-amber-500 cursor-pointer"></div>
                    <div className="w-10 h-10 rounded-full bg-rose-500 cursor-pointer"></div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-3">Font Size</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col items-center gap-1 cursor-pointer">
                      <div className="w-full h-10 border rounded-md flex items-center justify-center text-sm">Aa</div>
                      <span className="text-xs">Small</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 cursor-pointer ring-2 ring-primary rounded-md">
                      <div className="w-full h-10 border rounded-md flex items-center justify-center">Aa</div>
                      <span className="text-xs">Medium</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 cursor-pointer">
                      <div className="w-full h-10 border rounded-md flex items-center justify-center text-lg">Aa</div>
                      <span className="text-xs">Large</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button>
                  Save Preferences
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </div>
      </div>
    </div>
  );
}
