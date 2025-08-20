import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Download, Plus, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
  description: string;
}

const ClientDashboard = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      // TODO: Replace with actual API call to your PHP backend
      const response = await fetch('/api/invoices/my-invoices', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setInvoices(data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch invoices.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadInvoice = async (invoiceId: string) => {
    try {
      // TODO: Replace with actual API call to your PHP backend
      const response = await fetch(`/api/invoices/${invoiceId}/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${invoiceId}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: "Success",
          description: "Invoice downloaded successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download invoice.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-success text-success-foreground';
      case 'pending':
        return 'bg-secondary text-secondary-foreground';
      case 'overdue':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  // Mock data for demo - replace with real data from your backend
  const mockInvoices: Invoice[] = [
    {
      id: '1',
      invoiceNumber: 'INV-2024-001',
      date: '2024-01-15',
      amount: 500.00,
      status: 'paid',
      description: 'Tax Preparation Services Q4 2023'
    },
    {
      id: '2',
      invoiceNumber: 'INV-2024-002',
      date: '2024-02-20',
      amount: 750.00,
      status: 'pending',
      description: 'Business Tax Consultation'
    },
    {
      id: '3',
      invoiceNumber: 'INV-2024-003',
      date: '2024-03-10',
      amount: 300.00,
      status: 'overdue',
      description: 'Personal Tax Review'
    }
  ];

  const displayInvoices = invoices.length > 0 ? invoices : mockInvoices;

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Client Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage your invoices and tax documents</p>
        </div>

        <Tabs defaultValue="invoices" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="invoices">My Invoices</TabsTrigger>
            <TabsTrigger value="documents">Tax Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="invoices" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-foreground">Invoices</h2>
              <Link to="/create-invoice">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Invoice
                </Button>
              </Link>
            </div>

            <div className="grid gap-6">
              {displayInvoices.map((invoice) => (
                <Card key={invoice.id} className="shadow-medium hover:shadow-strong transition-all duration-300">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="w-5 h-5" />
                          {invoice.invoiceNumber}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {invoice.description}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(invoice.status)}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Date: {invoice.date}</p>
                        <p className="text-lg font-semibold">${invoice.amount.toFixed(2)}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => downloadInvoice(invoice.id)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-foreground">Tax Documents</h2>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Upload Document
              </Button>
            </div>

            <Card className="shadow-medium">
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Documents Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Upload your tax documents to get started with your tax preparation.
                  </p>
                  <Button>Upload First Document</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ClientDashboard;