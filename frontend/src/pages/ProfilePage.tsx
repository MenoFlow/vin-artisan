import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ChangePasswordForm from "@/components/auth/ChangePasswordForm";
import { deleteUserAccount } from "@/services/authService";
import { useNavigate } from "react-router-dom";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const profileSchema = z.object({
  name: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères" }),
  email: z.string().email({ message: "Email invalide" }),
});

const CURRENT_USER_KEY = "vin-artisan-current-user";

type ProfileFormValues = z.infer<typeof profileSchema>;

const ProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isClient } = useRoleAccess();
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
  });

  // console.log(user);
  const id = user.id;

  const onSubmit = async (data: ProfileFormValues) => {
    const response = await fetch(`http://localhost:3000/api/users/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Erreur lors de la mise à jour");
    }

    const newUserData = await response.json();
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUserData));
    // localStorage.getItem(vin-artisan-current-user);

    console.log(newUserData);

    toast({
      variant: "success",
      title: "Profil mis à jour",
      description: "Vos informations ont été mises à jour avec succès.",
    });
  };

  const handleDeleteAccount = () => {
    if (!user) return;
    const success = deleteUserAccount(user.id);

    if (success) {
      toast({
        variant: "success",
        title: "Compte supprimé",
        description: "Votre compte a été supprimé avec succès.",
      });
      navigate("/auth");
    } else {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression du compte.",
      });
    }
  };

  if (!user) return null;

  return (
    <div className="container max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Mon Profil</h1>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informations personnelles</CardTitle>
            <CardDescription>
              Gérez vos informations personnelles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <Button
                    type="submit"
                    className="bg-wine hover:bg-wine-light"
                  >
                    Enregistrer
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sécurité</CardTitle>
            <CardDescription>
              Gérez vos paramètres de sécurité et d'authentification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">
                Changer le mot de passe
              </h3>
              <Dialog
                aria-describedby="change-password-description"
                open={isPasswordDialogOpen}
                onOpenChange={setIsPasswordDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline">Modifier le mot de passe</Button>
                </DialogTrigger>
                <DialogContent
                  aria-describedby={undefined}
                  className="sm:max-w-[425px]"
                >
                  <DialogHeader>
                    <DialogTitle>Changer votre mot de passe</DialogTitle>
                  </DialogHeader>
                  <p
                    id="change-password-description"
                    className="text-sm text-gray-500 mb-4"
                  >
                    Veuillez entrer votre mot de passe actuel et le nouveau
                    mot de passe pour mettre à jour vos informations de
                    sécurité.
                  </p>
                  <ChangePasswordForm
                    onClose={() => setIsPasswordDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>

            {isClient && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium mb-2 text-red-600">
                  Zone dangereuse
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Une fois votre compte supprimé, toutes vos données seront
                  définitivement effacées. Cette action ne peut pas être
                  annulée.
                </p>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Supprimer mon compte</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Êtes-vous absolument sûr ?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Cette action ne peut pas être annulée. Cela supprimera
                        définitivement votre compte et toutes les données
                        associées.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Supprimer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rôle</CardTitle>
            <CardDescription>
              Vos permissions sur la plateforme
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Vous êtes actuellement enregistré en tant que :{" "}
              <span className="font-semibold">
                {user.role === "admin" ? "Administrateur" : "Client"}
              </span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
