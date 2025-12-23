import { useState, useEffect, ReactNode } from "react";
import { ChevronLeft, ChevronRight, Bell, CheckCircle, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface AdminMessage {
  id: number;
  email: string;
  message: string;
  status: "new" | "read" | "responded";
  created_at: string;
}

const MESSAGES_PER_PAGE = 3;

interface NotificationsMenuProps {
  children: ReactNode; // Le bouton trigger personnalisé (avec badge commandes)
}

const NotificationsMenu = ({ children }: NotificationsMenuProps) => {
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<AdminMessage | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchMessages = async () => {
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + "/api/admin_messages");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error("Erreur lors du chargement des messages admin :", err);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 10000); // Toutes les 10 secondes
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id: number) => {
    try {
      await fetch(import.meta.env.VITE_API_URL + `/api/admin_messages/${id}/read`, {
        method: "PATCH",
      });
      fetchMessages();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteMessage = async (id: number) => {
    if (!confirm("Voulez-vous vraiment supprimer ce message ?")) return;
    try {
      await fetch(import.meta.env.VITE_API_URL + `/api/admin_messages/${id}`, {
        method: "DELETE",
      });
      fetchMessages();
      if (selectedMessage?.id === id) setSelectedMessage(null);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteAllMessages = async () => {
    if (!confirm("Voulez-vous vraiment supprimer TOUS les messages ?")) return;
    try {
      await fetch(import.meta.env.VITE_API_URL + `/api/admin_messages`, {
        method: "DELETE",
      });
      fetchMessages();
      setSelectedMessage(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Pagination
  const totalPages = Math.ceil(messages.length / MESSAGES_PER_PAGE);
  const startIndex = (currentPage - 1) * MESSAGES_PER_PAGE;
  const paginatedMessages = messages
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(startIndex, startIndex + MESSAGES_PER_PAGE);

  const hasNewMessages = messages.some((m) => m.status === "new");

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {children || (
            // Fallback si rien n'est passé (rarement utilisé)
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-6 w-6" />
              {hasNewMessages && (
                <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-red-500 rounded-full animate-pulse" />
              )}
            </Button>
          )}
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-96 p-4 max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <DropdownMenuLabel className="text-lg font-semibold p-0">
              Notifications
            </DropdownMenuLabel>
            {messages.length > 0 && (
              <Button variant="ghost" size="sm" onClick={deleteAllMessages}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Liste des messages */}
          <div className="flex-1 overflow-y-auto -mx-4 px-4">
            {paginatedMessages.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Aucun message pour le moment
              </p>
            ) : (
              <div className="space-y-2">
                {paginatedMessages.map((msg) => (
                  <DropdownMenuItem
                    key={msg.id}
                    className={`
                      p-4 rounded-lg cursor-pointer flex flex-col gap-2
                      transition-colors border
                      ${msg.status === "new"
                        ? "bg-accent/50 border-accent hover:bg-accent/70"
                        : "bg-popover border-border hover:bg-accent/30"
                      }
                    `}
                    onSelect={() => setSelectedMessage(msg)}
                  >
                    <div className="flex justify-between items-start">
                      <p className="font-medium text-sm truncate flex-1">{msg.email}</p>
                      {msg.status === "new" && (
                        <Badge variant="default" className="text-xs">
                          Nouveau
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{msg.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(msg.created_at).toLocaleString()}
                    </p>
                  </DropdownMenuItem>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-4 pt-4 border-t">
              <Button
                size="sm"
                variant="ghost"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                {currentPage} / {totalPages}
              </span>
              <Button
                size="sm"
                variant="ghost"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog pour voir le message complet */}
      <Dialog open={!!selectedMessage} onOpenChange={(open) => !open && setSelectedMessage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Message de {selectedMessage?.email}</DialogTitle>
            <DialogDescription>
              Reçu le {selectedMessage && new Date(selectedMessage.created_at).toLocaleString()}
            </DialogDescription>
          </DialogHeader>

          <div className="my-6 p-5 bg-muted/50 rounded-lg border">
            <p className="text-base leading-relaxed">{selectedMessage?.message}</p>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => selectedMessage && markAsRead(selectedMessage.id)}
              disabled={selectedMessage?.status !== "new"}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Marquer comme lu
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedMessage && deleteMessage(selectedMessage.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NotificationsMenu;