import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Home, User, LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export const NavBar = () => {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-md">
      <div className="container-custom py-4">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center space-x-2"
            onClick={closeMenu}
          >
            <span className="text-primary text-xl font-bold">HealthyCare</span>
          </Link>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMenu}>
              {isMenuOpen ? (
                <X data-testid="close-icon" size={24} />
              ) : (
                <Menu data-testid="menu-icon" size={24} />
              )}
            </Button>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <Link
                  to="/home"
                  className={cn(
                    "flex items-center space-x-1 hover:text-primary transition-colors",
                    isActive("/home") && "text-primary font-medium"
                  )}
                >
                  <Home size={18} />
                  <span>Home</span>
                </Link>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-1 hover:text-primary transition-colors"
                  onClick={logout}
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </Button>
              </>
            ) : (
              <>
                <Link
                  to="/"
                  className={cn(
                    "hover:text-primary transition-colors",
                    isActive("/") && "text-primary font-medium"
                  )}
                >
                  Home
                </Link>
                <Link to="/login">
                  <Button className="btn-primary">Login</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white py-4 px-4 shadow-inner animate-fade-in">
          <div className="flex flex-col space-y-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/home"
                  className={cn(
                    "flex items-center space-x-2 p-2 rounded-md hover:bg-muted transition-colors",
                    isActive("/home") && "bg-muted text-primary font-medium"
                  )}
                  onClick={closeMenu}
                >
                  <Home size={18} />
                  <span>Home</span>
                </Link>
                <Button
                  variant="ghost"
                  className="flex items-center justify-start space-x-2 p-2 rounded-md hover:bg-muted transition-colors w-full"
                  onClick={() => {
                    logout();
                    closeMenu();
                  }}
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </Button>
              </>
            ) : (
              <>
                <Link
                  to="/"
                  className={cn(
                    "p-2 rounded-md hover:bg-muted transition-colors",
                    isActive("/") && "bg-muted text-primary font-medium"
                  )}
                  onClick={closeMenu}
                >
                  Home
                </Link>
                <Link
                  to="/login"
                  className="p-2 rounded-md bg-primary text-white hover:bg-primary/90 transition-colors text-center"
                  onClick={closeMenu}
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
