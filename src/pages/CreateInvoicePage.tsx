import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

const CreateInvoicePage = () => {
  const [invoiceData, setInvoiceData] = useState({
    clientName: "",
    clientEmail: "",
    clientAddress: "",
    invoiceNumber: `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
    date: new Date().toISOString().split('T')[0],
    dueDate: "",
    notes: "",
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    { description: "", quantity: 1, rate: 0, amount: 0 }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInvoiceData({
      ...invoiceData,
      [e.target.name]: e.target.value,
    });
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Calculate amount automatically
    if (field === 'quantity' || field === 'rate') {
      const quantity = field === 'quantity' ? Number(value) : updatedItems[index].quantity;
      const rate = field === 'rate' ? Number(value) : updatedItems[index].rate;
      updatedItems[index].amount = quantity * rate;
    }
    
    setItems(updatedItems);
  };

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, rate: 0, amount: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => total + item.amount, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const invoice = {
      ...invoiceData,
      items,
      total: calculateTotal(),
      status: 'pending',
    };

    try {
      // TODO: Replace with actual API call to your PHP backend
      const response = await fetch('/api/invoices/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(invoice),
      });

      if (response.ok) {
        toast({
          title: "Invoice created successfully",
          description: "Your invoice has been saved and can now be downloaded.",
        });
        navigate('/dashboard');
      } else {
        throw new Error('Failed to create invoice');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create invoice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportToExcel = () => {
    // TODO: Implement Excel export functionality
    // This would typically create an Excel file with the invoice data
    toast({
      title: "Excel Export",
      description: "Excel export functionality will be connected to your backend.",
    });
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Create Invoice</h1>
          <p className="text-muted-foreground mt-2">Generate a new invoice for your services</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Invoice Details */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
              <CardDescription>Basic information about this invoice</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Input
                    id="invoiceNumber"
                    name="invoiceNumber"
                    value={invoiceData.invoiceNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Invoice Date</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={invoiceData.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  value={invoiceData.dueDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Client Information */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
              <CardDescription>Details about the client for this invoice</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientName">Client Name</Label>
                  <Input
                    id="clientName"
                    name="clientName"
                    placeholder="John Doe"
                    value={invoiceData.clientName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientEmail">Client Email</Label>
                  <Input
                    id="clientEmail"
                    name="clientEmail"
                    type="email"
                    placeholder="john@example.com"
                    value={invoiceData.clientEmail}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientAddress">Client Address</Label>
                <Textarea
                  id="clientAddress"
                  name="clientAddress"
                  placeholder="123 Main St, City, State, ZIP"
                  value={invoiceData.clientAddress}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Invoice Items */}
          <Card className="shadow-medium">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Invoice Items</CardTitle>
                  <CardDescription>Add services and items to this invoice</CardDescription>
                </div>
                <Button type="button" variant="outline" onClick={addItem}>
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-4 items-end">
                    <div className="col-span-12 md:col-span-5 space-y-2">
                      <Label>Description</Label>
                      <Input
                        placeholder="Tax preparation service"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-span-4 md:col-span-2 space-y-2">
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                        required
                      />
                    </div>
                    <div className="col-span-4 md:col-span-2 space-y-2">
                      <Label>Rate ($)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.rate}
                        onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                        required
                      />
                    </div>
                    <div className="col-span-3 md:col-span-2 space-y-2">
                      <Label>Amount</Label>
                      <Input
                        type="number"
                        value={item.amount.toFixed(2)}
                        readOnly
                        className="bg-muted"
                      />
                    </div>
                    <div className="col-span-1">
                      {items.length > 1 && (
                        <Button 
                          type="button" 
                          variant="destructive" 
                          size="sm"
                          onClick={() => removeItem(index)}
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t">
                <div className="flex justify-end">
                  <div className="text-right">
                    <p className="text-lg font-semibold">
                      Total: ${calculateTotal().toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
              <CardDescription>Any additional information for this invoice</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                name="notes"
                placeholder="Payment terms, additional instructions, etc."
                value={invoiceData.notes}
                onChange={handleInputChange}
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="secondary" 
              onClick={exportToExcel}
            >
              Export to Excel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Invoice"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateInvoicePage;