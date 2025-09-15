import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Download,
  Users,
  DollarSign,
  TrendingUp,
  Search,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  created_at: string;
  total: number;
  status: "pending" | "paid" | "overdue";
  description: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  created_at: string;
  status: "active" | "inactive";
}

const AdminDashboard = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // TODO: Replace with actual API calls to your PHP backend
      const [invoicesResponse, usersResponse] = await Promise.all([
        fetch("http://localhost:5000/api/admin/invoices", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }),
        fetch("http://localhost:5000/api/admin/users", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }),
      ]);

      if (invoicesResponse.ok && usersResponse.ok) {
        const invoicesData = await invoicesResponse.json();
        const usersData = await usersResponse.json();
        setInvoices(invoicesData);
        setUsers(usersData);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  console.log("Invoices:", invoices);
  console.log("Users:", users);

  const downloadInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/invoices/${invoiceId}/download`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
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
      case "paid":
        return "bg-success text-success-foreground";
      case "pending":
        return "bg-secondary text-secondary-foreground";
      case "overdue":
        return "bg-destructive text-destructive-foreground";
      case "active":
        return "bg-success text-success-foreground";
      case "cancelled":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const updateInvoiceStatus = async (
    invoiceId: string,
    newStatus: "paid" | "cancelled"
  ) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/${invoiceId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        // Update local state
        setInvoices((prev) =>
          prev.map((inv) =>
            inv.id === invoiceId ? { ...inv, status: newStatus } : inv
          )
        );

        toast({
          title: "Success",
          description: `Invoice status updated to ${newStatus}`,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update invoice status",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update invoice status",
        variant: "destructive",
      });
    }
  };

  const displayInvoices = invoices;
  const displayUsers = users;

  const filteredInvoices = displayInvoices.filter(
    (invoice) =>
      invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = displayUsers.filter(
    (user) =>
      `${user.firstName} ${user.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRevenue = displayInvoices.reduce(
    (sum, invoice) => sum + Number(invoice.total || 0),
    0
  );
  const paidInvoices = displayInvoices.filter(
    (invoice) => invoice.status === "paid"
  ).length;
  const pendingInvoices = displayInvoices.filter(
    (invoice) => invoice.status === "pending"
  ).length;

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage all clients, invoices, and business operations
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-medium">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Users className="w-8 h-8 text-primary mr-3" />
                <div className="text-2xl font-bold">{displayUsers.length}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-medium">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <DollarSign className="w-8 h-8 text-success mr-3" />
                <div className="text-2xl font-bold">
                  ${Number(totalRevenue || 0).toFixed(2)}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-medium">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Paid Invoices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-success mr-3" />
                <div className="text-2xl font-bold">{paidInvoices}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-medium">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Invoices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <FileText className="w-8 h-8 text-secondary mr-3" />
                <div className="text-2xl font-bold">{pendingInvoices}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="invoices" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="invoices">All Invoices</TabsTrigger>
            <TabsTrigger value="users">All Users</TabsTrigger>
          </TabsList>

          <TabsContent value="invoices" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-foreground">
                All Invoices
              </h2>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search invoices..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-6">
              {filteredInvoices.map((invoice) => (
                <Card
                  key={invoice.id}
                  className="shadow-medium hover:shadow-strong transition-all duration-300"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="w-5 h-5" />
                          {invoice.invoiceNumber}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          Client: {invoice.clientName} ({invoice.clientEmail})
                        </CardDescription>
                        <CardDescription>{invoice.description}</CardDescription>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <Badge className={getStatusColor(invoice.status)}>
                          {(invoice.status ?? "unknown")
                            .charAt(0)
                            .toUpperCase() +
                            (invoice.status ?? "unknown").slice(1)}
                        </Badge>

                       {invoice.status === "pending" && (
                         <div className="flex gap-2">
                           <Button
                             size="sm"
                             variant="outline"
                             disabled={invoice.status === "paid"}
                             onClick={() =>
                               updateInvoiceStatus(invoice.id, "paid")
                             }
                           >
                             Mark Paid
                           </Button>
                           <Button
                             size="sm"
                             variant="destructive"
                             disabled={invoice.status === "cancelled"}
                             onClick={() =>
                               updateInvoiceStatus(invoice.id, "cancelled")
                             }
                           >
                             Cancel
                           </Button>
                         </div>
                       )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          Date: {invoice.created_at}
                        </p>
                        <p className="text-lg font-semibold">
                          ${Number(invoice.total || 0).toFixed(2)}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadInvoice(invoice.id)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-foreground">
                All Users
              </h2>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>

            <div className="grid gap-6">
              {filteredUsers.map((user) => (
                <Card
                  key={user.id}
                  className="shadow-medium hover:shadow-strong transition-all duration-300"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="w-5 h-5" />
                          {user.firstName} {user.lastName}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {user.email}
                        </CardDescription>
                        {user.company && (
                          <CardDescription>
                            Company: {user.company}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          Registered: {user.created_at}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          View Profile
                        </Button>
                        <Button variant="outline" size="sm">
                          View Invoices
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
