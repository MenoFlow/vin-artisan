import { toast } from "sonner";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { LoginCredentials, RegisterData } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Wine } from "lucide-react";
import { PasswordInput } from "@/components/ui/password-input";

const loginSchema = z.object({
  email: z.string().email({ message: "Email invalide" }),
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères!" }),
});


const registerSchema = loginSchema.extend({
  name: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères" }),
  passwordConfirm: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères..." }),
}).refine((data) => data.password.toString() === data.passwordConfirm.toString(), {
  message: "Les mots de passe ne correspondent pas",
  path: ["passwordConfirm"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [settings, setSettings] = useState({
    registration: true,
    maintenance: false

  });
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });


  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      passwordConfirm: "",
    },
  });

  const onLoginSubmit = async (values) => {
    const credentials: LoginCredentials = {
      email: values.email,
      password: values.password
    };

    const site_en_maintenance = settings?.maintenance;
    const user = await login(credentials);
    const CURRENT_USER_KEY = "vin-artisan-current-user";
    const current_user = localStorage.getItem(CURRENT_USER_KEY);

    if (user) {
      if (site_en_maintenance){
        if (JSON.parse(current_user).role === 'admin'){
          navigate("/");
        } else {
          navigate("/en_maintenance");
        }  
      } else {
        navigate("/");
      }  
    }
  };

  const fetchSettings = async () => {
    try{
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/settings', {
        method: 'GET'
      });
      const data = await response.json();
      
      setSettings(data);
    } catch (error){
      toast("Erreur");
    }
  }
  
  useEffect(() => {
    fetchSettings();
  }, [])

  const onRegisterSubmit = async (values: RegisterFormValues) => {
    const registerData: RegisterData = {
      name: values.name,
      email: values.email,
      password: values.password,
    };

    // API call (à décommenter pour utiliser avec backend)
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'ajout');
      }
      
      const data = await response.json();
      toast.success("utilisateur ajouté avec succès");
      const user = await register(registerData);
      if (user) {
        navigate("/");
      }
      return data;
    } catch (error) {
      console.error("Erreur API:", error);
      toast.error("Erreur lors de l'ajout de l'utilisateur");
      throw error;
    }
    
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/20">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <Wine className="h-12 w-12 text-wine" />
          </div>
          <CardTitle className="text-2xl font-bold">VinExpert</CardTitle>
          <CardDescription>
            Gestion de production et vente de vin
          </CardDescription>
          
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "register")}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">Connexion</TabsTrigger>
              <TabsTrigger value="register">Inscription</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="email@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mot de passe</FormLabel>
                        <FormControl>
                          <PasswordInput {...field}/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full bg-wine hover:bg-wine-light">
                    Se connecter
                  </Button>
                </form>
              </Form>

            </TabsContent>
            <TabsContent value="register">
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                  <FormField
                    control={registerForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom</FormLabel>
                        <FormControl>
                          <Input placeholder="Votre nom" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="email@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mot de passe</FormLabel>
                        <FormControl>
                        <PasswordInput {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="passwordConfirm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel></FormLabel>
                        <FormControl>
                          <PasswordInput {...field}/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button disabled={settings?.registration ? false : true} type="submit" className={`w-full bg-wine hover:bg-wine-light text-white`}>
                    
                    {settings?.registration ? "S'inscrire" : "Inscription désactivé par l'administrateur"}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            © 2025 VinExpert. Tous droits réservés.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AuthPage;
