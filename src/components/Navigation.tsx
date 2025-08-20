import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";

interface NavigationProps {
  isAuthenticated?: boolean;
  userRole?: 'client' | 'admin';
  onLogout?: () => void;
}

const Navigation = ({ isAuthenticated = false, userRole, onLogout }: NavigationProps) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-background border-b shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">T</span>
              </div>
              <span className="text-xl font-bold text-foreground">TaxPro Consulting</span>
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                to="/"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/') 
                    ? 'text-primary bg-professional-light' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Home
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link
                    to={userRole === 'admin' ? '/admin' : '/dashboard'}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/dashboard') || isActive('/admin')
                        ? 'text-primary bg-professional-light' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={onLogout}
                    className="ml-4"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link to="/login">
                    <Button variant="ghost" size="sm">
                      Login
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button size="sm">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;