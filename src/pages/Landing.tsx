
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Image, Users, Album, Shield } from 'lucide-react';
import { NavBar } from '@/components/NavBar';

const Landing = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary to-secondary py-16 md:py-24 text-white">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Your Health Data, Organized Beautifully
              </h1>
              <p className="text-xl mb-8 opacity-90">
                HealthyCare helps you manage and organize your health information with a beautiful, intuitive interface.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/login">
                  <Button className="bg-white text-primary hover:bg-white/90 px-6 py-5 rounded-xl font-semibold text-lg">
                    Get Started
                    <ArrowRight className="ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-muted">
          <div className="container-custom">
            <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users size={30} className="text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">User Management</h3>
                <p className="text-gray-600">
                  Efficiently manage user profiles and personal health information.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Album size={30} className="text-secondary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Health Albums</h3>
                <p className="text-gray-600">
                  Organize your health records into easy-to-access albums.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Image size={30} className="text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Photo Storage</h3>
                <p className="text-gray-600">
                  Securely store and manage medical images and documents.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield size={30} className="text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Secure Access</h3>
                <p className="text-gray-600">
                  Your health data is protected with state-of-the-art security.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 bg-accent text-white">
          <div className="container-custom text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Join thousands of users who trust HealthyCare with their health information management.
            </p>
            <Link to="/login">
              <Button className="bg-white text-accent hover:bg-white/90 px-6 py-5 rounded-xl font-semibold text-lg">
                Create Your Account
              </Button>
            </Link>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container-custom">
          <div className="text-center">
            <p className="text-sm opacity-80">
              &copy; 2025 HealthyCare. All rights reserved. 
              Savannah Informatics Frontend Assessment.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
