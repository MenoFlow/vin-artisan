
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { changeUserPassword } from "@/services/authService";
import { PasswordInput } from "../ui/password-input";

const passwordSchema = z.object({
  currentPassword: z.string().min(1, { message: "Le mot de passe actuel est requis" }),
  newPassword: z.string().min(6, { message: "Le nouveau mot de passe doit contenir au moins 6 caractères" }),
  confirmPassword: z.string().min(6, { message: "La confirmation du mot de passe est requise" }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

const ChangePasswordForm = ({ onClose }: { onClose?: () => void }) => {
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    },
  });

  const onSubmit = async (data: PasswordFormValues) => {
    if (!user) return;
    const success = await changeUserPassword(user.id, data.currentPassword, data.newPassword);
    
    if (success) {
      toast({
        title: "Mot de passe modifié",
        description: "Votre mot de passe a été modifié avec succès.",
        variant: "success",
      });
      if (onClose) onClose();
      form.reset();
    } else {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Le mot de passe actuel est incorrect.",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mot de passe actuel</FormLabel>
              <FormControl>
                <PasswordInput {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nouveau mot de passe</FormLabel>
              <FormControl>
              <PasswordInput {...field}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmer le nouveau mot de passe</FormLabel>
              <FormControl>
              <PasswordInput {...field}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          {onClose && (
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
          )}
          <Button type="submit" className="bg-wine hover:bg-wine-light">
            Changer le mot de passe
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ChangePasswordForm;
