
'use client';

import { useState, useEffect } from 'react';
import type { Announcement } from '@/app/data';
import { subscribeToData } from '@/app/data';
import { Header } from '@/components/layout/header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { collection, addDoc, doc, updateDoc, deleteDoc, serverTimestamp, Firestore } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/layout/sidebar-nav';

const AnnouncementDialog = ({
  announcement,
  isOpen,
  onClose,
  onSave,
}: {
  announcement: Partial<Announcement> | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (announcement: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => void;
}) => {
  const [formData, setFormData] = useState<Partial<Announcement> | null>(announcement);
  const { toast } = useToast();

  useEffect(() => {
    setFormData(announcement);
  }, [announcement]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSave = () => {
    if (!formData?.title || !formData?.content) {
        toast({
            title: "Data Tidak Lengkap",
            description: "Judul dan isi pengumuman harus diisi.",
            variant: "destructive",
        });
      return;
    }
    
    onSave({
        id: formData.id,
        title: formData.title,
        content: formData.content,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{announcement?.id ? 'Ubah Pengumuman' : 'Tambah Pengumuman Baru'}</DialogTitle>
          <DialogDescription>
            {announcement?.id
              ? 'Ubah detail pengumuman di bawah ini.'
              : 'Isi detail untuk pengumuman baru.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Judul
            </Label>
            <Input id="title" value={formData?.title || ''} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="content" className="text-right pt-2">
              Isi Pengumuman
            </Label>
            <Textarea id="content" value={formData?.content || ''} onChange={handleChange} className="col-span-3" rows={5} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button onClick={handleSave}>Simpan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


export default function AnnouncementsPage() {
  const { toast } = useToast();
  const db = useFirestore();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Partial<Announcement> | null>(null);

  useEffect(() => {
    if (!db) return;
    const unsubscribe = subscribeToData(db, 'announcements', (data) => {
        setAnnouncements(data as Announcement[]);
        setIsLoading(false);
    });
    return () => unsubscribe();
  }, [db]);

  const handleAdd = () => {
    setSelectedAnnouncement({});
    setIsDialogOpen(true);
  };

  const handleEdit = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setIsDialogOpen(true);
  };
  
  const handleDelete = (announcementId: string) => {
    if (!db) return;
    const docRef = doc(db, "announcements", announcementId);
    deleteDoc(docRef)
        .then(() => {
            toast({
                title: "Pengumuman Dihapus",
                description: "Pengumuman telah berhasil dihapus.",
            });
        })
        .catch((serverError) => {
            const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'delete',
            });
            errorEmitter.emit('permission-error', permissionError);
        });
  };

  const handleSave = (announcement: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    if (!db) return;
    const { id, ...announcementData } = announcement;
    
    if (id) {
        // Update existing announcement
        const announcementRef = doc(db, "announcements", id);
        const dataToUpdate = {
            ...announcementData,
            updatedAt: serverTimestamp()
        };
        updateDoc(announcementRef, dataToUpdate)
            .then(() => {
                toast({ title: "Pengumuman Diperbarui", description: "Pengumuman telah diperbarui." });
                setIsDialogOpen(false);
            })
            .catch((serverError) => {
                const permissionError = new FirestorePermissionError({
                    path: announcementRef.path,
                    operation: 'update',
                    requestResourceData: dataToUpdate,
                });
                errorEmitter.emit('permission-error', permissionError);
            });
    } else {
        // Add new announcement
        const dataToCreate = {
            ...announcementData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };
        addDoc(collection(db, "announcements"), dataToCreate)
            .then(() => {
                toast({ title: "Pengumuman Ditambahkan", description: "Pengumuman baru telah disimpan." });
                setIsDialogOpen(false);
            })
            .catch((serverError) => {
                const permissionError = new FirestorePermissionError({
                    path: 'announcements',
                    operation: 'create',
                    requestResourceData: dataToCreate,
                });
                errorEmitter.emit('permission-error', permissionError);
            });
    }
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarNav />
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col min-h-screen">
            <Header title="Pengumuman Penting" />
            <main className="flex-1 p-4 md:p-6 space-y-6">
            {isLoading ? (
                <div className="flex items-center justify-center pt-20">
                    <p>Loading announcements...</p>
                </div>
            ) : (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Kelola Pengumuman</CardTitle>
                            <CardDescription>
                                Buat, ubah, dan hapus pengumuman penting terkait arisan.
                            </CardDescription>
                        </div>
                        <Button onClick={handleAdd}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Tambah Pengumuman
                        </Button>
                    </CardHeader>
                    <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {announcements.map((announcement) => (
                        <Card key={announcement.id} className="flex flex-col">
                            <CardHeader className="flex-row items-start justify-between gap-4">
                                <div>
                                    <CardTitle className="text-lg">{announcement.title}</CardTitle>
                                    <CardDescription>
                                        Terakhir diubah: {announcement.updatedAt ? format(new Date(announcement.updatedAt), "d MMM yyyy, HH:mm", { locale: id }) : 'N/A'}
                                    </CardDescription>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="-mt-2 -mr-2">
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">Tindakan</span>
                                    </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Tindakan</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => handleEdit(announcement)}>Ubah</DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => handleDelete(announcement.id)}>Hapus</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </CardHeader>
                            <CardContent className="flex-grow">
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{announcement.content}</p>
                            </CardContent>
                        </Card>
                        ))}
                    </div>
                    </CardContent>
                </Card>
            )}
            </main>
        </div>
        
        {isDialogOpen && (
            <AnnouncementDialog
            announcement={selectedAnnouncement}
            isOpen={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            onSave={handleSave}
            />
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
