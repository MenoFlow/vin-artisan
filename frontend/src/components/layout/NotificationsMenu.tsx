import { useState, useEffect } from "react";
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
  DialogFooter,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

interface AdminMessage {
  id: number;
  email: string;
  message: string;
  status: "new" | "read" | "responded";
  created_at: string;
}
const MESSAGES_PER_PAGE = 3;

const NotificationsMenu = () => {
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<AdminMessage | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchMessages = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/admin_messages");
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id: number) => {
    await fetch(`http://localhost:3000/api/admin_messages/${id}/read`, { method: "PATCH" });
    fetchMessages();
  };

  const deleteMessage = async (id: number) => {
    if (!confirm("Voulez-vous vraiment supprimer ce message ?")) return;
    await fetch(`http://localhost:3000/api/admin_messages/${id}`, { method: "DELETE" });
    fetchMessages();
    setSelectedMessage(null);
  };

  const deleteAllMessages = async () => {
    if (!confirm("Voulez-vous vraiment supprimer tous les messages ?")) return;
    await fetch(`http://localhost:3000/api/admin_messages`, { method: "DELETE" });
    fetchMessages();
    setSelectedMessage(null);
  };

  // Pagination
  const totalPages = Math.ceil(messages.length / MESSAGES_PER_PAGE);
  const startIndex = (currentPage - 1) * MESSAGES_PER_PAGE;
  const paginatedMessages = messages
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(startIndex, startIndex + MESSAGES_PER_PAGE);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-6 w-6" />
            {messages.some(m => m.status === "new") && (
              <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-red-500 rounded-full" />
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-full sm:w-96 p-2 flex flex-col max-h-[80vh]" style={{ height: '350px' }}>
          {/* Titre et bouton Supprimer tout */}
          <DropdownMenuLabel className="flex justify-between items-center mb-2">
            <span className="text-lg font-semibold">Notifications</span>
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={deleteAllMessages}
                title="Supprimer tout"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </DropdownMenuLabel>

          {/* Zone des messages scrollable */}
          <div className="flex-1 overflow-y-auto">
            {paginatedMessages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Aucun message
              </div>
            ) : (
              paginatedMessages.map((msg) => (
                <DropdownMenuItem
                  key={msg.id}
                  className={`p-3 cursor-pointer flex flex-col gap-1
                    hover:bg-[hsl(var(--secondary))] transition-colors
                    ${msg.status === "new" ? "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]" : "bg-[hsl(var(--popover))] text-[hsl(var(--popover-foreground))]"}
                    border-b border-[hsl(var(--border))] last:border-b-0`}
                  onClick={() => setSelectedMessage(msg)}
                >
                  {/* Ligne email + date */}
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-sm font-semibold truncate max-w-[70%]" title={msg.email}>
                      {msg.email}
                    </span>
                    <span className="text-xs text-[hsl(var(--muted-foreground))] whitespace-nowrap">
                      {new Date(msg.created_at).toLocaleString()}
                    </span>
                  </div>

                  {/* Ligne message + badge */}
                  <div className="flex justify-between items-start mt-1">
                    <p className="text-sm text-[hsl(var(--muted-foreground))] line-clamp-2 flex-1">
                      {msg.message}
                    </p>
                    {msg.status === "new" && (
                      <Badge
                        variant="outline"
                        className="ml-2 bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0"
                      >
                        Nouveau
                      </Badge>
                    )}
                  </div>
                </DropdownMenuItem>
              ))
            )}
          </div>

          {/* Pagination fixée en bas */}
          <div className="flex justify-between items-center mt-2 pt-2 border-t border-[hsl(var(--border))]">
            <Button
              size="sm"
              variant="ghost"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              title="Page précédente"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <span className="text-xs text-[hsl(var(--muted-foreground))]">
              {currentPage} / {totalPages}
            </span>

            <Button
              size="sm"
              variant="ghost"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              title="Page suivante"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </DropdownMenuContent>

      </DropdownMenu>

      {/* Modal pour consulter le message */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Message de {selectedMessage?.email}
            </DialogTitle>
            <DialogDescription>
              Consultez le contenu du message et marquez-le comme lu ou supprimez-le.
            </DialogDescription>
          </DialogHeader>
          <div className="my-4 p-4 bg-gray-50 rounded-md border border-gray-200 text-gray-700 flex justify-between items-start gap-4">
            <p className="flex-1">{selectedMessage?.message}</p>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => selectedMessage && markAsRead(selectedMessage.id)}
                title="Marquer comme lu"
              >
                <CheckCircle className="h-5 w-5 text-green-500" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => selectedMessage && deleteMessage(selectedMessage.id)}
                title="Supprimer"
              >
                <Trash2 className="h-5 w-5 text-red-500" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NotificationsMenu;
