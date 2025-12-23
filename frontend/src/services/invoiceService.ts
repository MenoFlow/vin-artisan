
import { jsPDF } from 'jspdf';
import {autoTable as autoTab} from 'jspdf-autotable';

import { Invoice, InvoiceItem } from '@/pages/FacturesPage';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const generateInvoicePDF = (invoice: Invoice): void => {
  try {
    const doc = new jsPDF();
    // Assurons-nous que tous les champs nécessaires sont définis avant de les utiliser
    const safeInvoice = {
      ...invoice,
      id: invoice.id || 'N/A',
      date: invoice.date || new Date().toISOString(),
      dueDate: invoice.dueDate || new Date().toISOString(),
      status: invoice.status || 'pending',
      customerName: invoice.customerName || 'Client',
      customerEmail: invoice.customerEmail || 'email@example.com',
      totalAmount: Number(invoice.totalAmount || 0),
      items: Array.isArray(invoice.items) ? invoice.items.map(item => ({
        ...item,
        id: item.id || `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        product: item.product || 'Produit inconnu',
        quantity: Number(item.quantity || 0),
        unitPrice: Number(item.unitPrice || 0),
        totalPrice: Number(item.totalPrice || 0)
      })) : []
    };
    
    // Add company logo/header
    doc.setFontSize(20);
    doc.setTextColor(128, 35, 56); // Wine color
    doc.text('VinExpert', 20, 20);
    
    // Company information
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('VinExpert', 20, 30);
    doc.text('Fianarantsoa', 20, 35);
    doc.text('Adresse exact: Lot 36/04 Isaha', 20, 40);
    doc.text('Email: wine@vinexpert.com', 20, 45);
    doc.text('Téléphone: +261 34 22 222 222', 20, 50);
    
    // Invoice details
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('FACTURE', 140, 30);
    
    doc.setFontSize(10);
    doc.text(`Numéro: #${safeInvoice.id}`, 140, 40);
    doc.text(`Date: ${new Date(safeInvoice.date).toLocaleDateString('fr-FR')}`, 140, 45);
    doc.text(`Échéance: ${new Date(safeInvoice.dueDate).toLocaleDateString('fr-FR')}`, 140, 50);
    doc.text(`Statut: ${safeInvoice.status === 'paid' ? 'Payée' : 'En attente'}`, 140, 55);
    
    // Customer information
    doc.setFontSize(14);
    doc.text('Client', 20, 70);
    
    doc.setFontSize(10);
    doc.text(safeInvoice.customerName, 20, 80);
    doc.text(safeInvoice.customerEmail, 20, 85);
    
    // Invoice items
    const tableColumn = ["Produit", "Quantité", "Prix unitaire", "Montant"];
    const tableRows = safeInvoice.items.map(item => [
      item.product,
      item.quantity.toString(),
      `${item.unitPrice.toFixed(2)} €`,
      `${item.totalPrice.toFixed(2)} €`
    ]);
    
    autoTab(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 100,
      theme: 'striped',
      headStyles: {
        fillColor: [128, 35, 56],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      footStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: 'bold'
      },
      foot: [
        ['', '', 'Total', `${safeInvoice.totalAmount.toFixed(2)} €`]
      ]
    });
    
    // Add footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text('VinExpert - Ce document atteste le paiement des articles des vins commandés, veuillez en faire bon usage', doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
    }
    
    // Save PDF
    doc.save(`Facture_${safeInvoice.id}.pdf`);
  } catch (error) {
    console.error("Erreur lors de la génération du PDF:", error);
    throw new Error("Erreur lors de la génération du PDF");
  }
};

// API pour les factures
export const fetchInvoices = async (): Promise<Invoice[]> => {
  try {
    
    const response = await fetch('http://localhost:3000/api/invoices');
    if (!response.ok) throw new Error('Erreur lors de la récupération des factures');
    const data = await response.json();
    // console.log(data);
    return data;
    
  } catch (error) {
    console.error('Erreur:', error);
    throw new Error('Erreur lors de la récupération des factures');
  }
};
// API pour les articles des factures
export const fetchInvoiceItems = async (): Promise<InvoiceItem[]> => {
  try {

    const response2 = await fetch('http://localhost:3000/api/invoice/items', {
      method: 'GET'
    });
    if (!response2.ok) throw new Error('Erreur lors de la récupération des articles des factures');
    const data = await response2.json();
    return data;
    
  } catch (error) {
    console.error('Erreur:', error);
    throw new Error('Erreur lors de la récupération des articles des factures');
  }
};

export const fetchInvoiceById = async (id: string): Promise<Invoice> => {
  try {
    // Version localStorage (pour démonstration)
    const savedInvoices = localStorage.getItem('invoices');
    if (savedInvoices) {
      const invoices = JSON.parse(savedInvoices);
      const invoice = invoices.find((inv: Invoice) => inv.id === id);
      if (invoice) return invoice;
    }
    throw new Error('Facture introuvable');
    
    // Version API REST (à décommenter pour utilisation avec backend)
    /*
    const response = await fetch(`/api/invoices/${id}`);
    if (!response.ok) throw new Error('Erreur lors de la récupération de la facture');
    const invoice = await response.json();
    return {
      ...invoice,
      totalAmount: Number(invoice.montant),
      customerName: invoice.client_nom,
      customerEmail: invoice.client_email,
      date: invoice.created_at,
      dueDate: invoice.due_date || new Date(new Date(invoice.created_at).getTime() + 30*24*60*60*1000).toISOString(),
      items: Array.isArray(invoice.items) ? invoice.items.map((item: any) => ({
        id: item.id,
        product: item.produit,
        quantity: Number(item.quantite),
        unitPrice: Number(item.prix_unitaire),
        totalPrice: Number(item.prix_total)
      })) : []
    };
    */
  } catch (error) {
    console.error('Erreur:', error);
    throw new Error('Erreur lors de la récupération de la facture');
  }
};

export const createInvoice = async (invoiceData: Omit<Invoice, 'id'>): Promise<Invoice> => {
  try {
    // Version localStorage (pour démonstration)
    const savedInvoices = localStorage.getItem('invoices');
    const invoices = savedInvoices ? JSON.parse(savedInvoices) : [];
    const newInvoice = {
      ...invoiceData,
      id: `INV-${Date.now()}`,
    };
    invoices.push(newInvoice);
    localStorage.setItem('invoices', JSON.stringify(invoices));
    return newInvoice;
    
    // Version API REST (à décommenter pour utilisation avec backend)
    /*
    const payload = {
      user_id: invoiceData.userId || invoiceData.clientId,
      montant: Number(invoiceData.totalAmount),
      statut: invoiceData.status,
      items: invoiceData.items.map(item => ({
        produit: item.product,
        quantite: Number(item.quantity),
        prix_unitaire: Number(item.unitPrice),
        prix_total: Number(item.totalPrice)
      }))
    };
    
    const response = await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) throw new Error('Erreur lors de la création de la facture');
    
    const data = await response.json();
    return {
      id: data.id,
      userId: data.user_id,
      customerName: data.client_nom,
      customerEmail: data.client_email,
      date: data.created_at,
      dueDate: data.due_date || new Date(new Date(data.created_at).getTime() + 30*24*60*60*1000).toISOString(),
      items: data.items.map((item: any) => ({
        id: item.id,
        product: item.produit,
        quantity: Number(item.quantite),
        unitPrice: Number(item.prix_unitaire),
        totalPrice: Number(item.prix_total)
      })),
      totalAmount: Number(data.montant),
      status: data.statut
    };
    */
  } catch (error) {
    console.error('Erreur:', error);
    throw new Error('Erreur lors de la création de la facture');
  }
};

export const updateInvoiceStatus = async (id: string, status: 'paid' | 'pending'): Promise<Invoice> => {
  try {
    // Version localStorage (pour démonstration)
    const savedInvoices = localStorage.getItem('invoices');
    if (savedInvoices) {
      const invoices = JSON.parse(savedInvoices);
      const updatedInvoices = invoices.map((inv: Invoice) => 
        inv.id === id ? { ...inv, status } : inv
      );
      localStorage.setItem('invoices', JSON.stringify(updatedInvoices));
      const updatedInvoice = updatedInvoices.find((inv: Invoice) => inv.id === id);
      if (updatedInvoice) return updatedInvoice;
    }
    throw new Error('Facture introuvable');
    
    // Version API REST (à décommenter pour utilisation avec backend)
    /*
    const response = await fetch(`/api/invoices/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    
    if (!response.ok) throw new Error('Erreur lors de la mise à jour du statut');
    
    const data = await response.json();
    return {
      id: data.id,
      userId: data.user_id,
      customerName: data.client_nom,
      customerEmail: data.client_email,
      date: data.created_at,
      dueDate: data.due_date,
      items: data.items ? data.items.map((item: any) => ({
        id: item.id,
        product: item.produit,
        quantity: Number(item.quantite),
        unitPrice: Number(item.prix_unitaire),
        totalPrice: Number(item.prix_total)
      })) : [],
      totalAmount: Number(data.montant),
      status: data.statut
    };
    */
  } catch (error) {
    console.error('Erreur:', error);
    throw new Error('Erreur lors de la mise à jour du statut');
  }
};

export const deleteInvoice = async (id: string): Promise<boolean> => {
  try {
    // Version localStorage (pour démonstration)
    const savedInvoices = localStorage.getItem('invoices');
    if (savedInvoices) {
      const invoices = JSON.parse(savedInvoices);
      const filteredInvoices = invoices.filter((inv: Invoice) => inv.id !== id);
      localStorage.setItem('invoices', JSON.stringify(filteredInvoices));
      return true;
    }
    return false;
    
    // Version API REST (à décommenter pour utilisation avec backend)
    /*
    const response = await fetch(`/api/invoices/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) throw new Error('Erreur lors de la suppression de la facture');
    return true;
    */
  } catch (error) {
    console.error('Erreur:', error);
    throw new Error('Erreur lors de la suppression de la facture');
  }
};
