'use client';
import Link from 'next/link';
import { useEffect } from 'react';

export default function MarketingPage() {
  // Add fade-up on mount
  useEffect(() => {
    const elements = document.querySelectorAll('.fade-up');
    elements.forEach((el: Element, index) => {
      setTimeout(() => {
        (el as HTMLElement).classList.add('animate-fade-up');
      }, index * 100);
    });
  }, []);

  return (
    <div>
      <header className="bg-primary text-white">
        <nav className="container mx-auto flex items-center justify-between px-4 py-5">
          <h1 className="text-2xl font-semibold">Optimum AI Consulting</h1>
          <div className="space-x-4">
            <a href="#features" className="hover:underline">Features</a>
            <a href="#pricing" className="hover:underline">Pricing</a>
            <a href="#contact" className="hover:underline">Contact</a>
            <Link href="/app">
              <button className="bg-secondary text-white px-4 py-2 rounded-full shadow hover:shadow-lg transition">Login</button>
            </Link>
          </div>
        </nav>
      </header>
      <section className="container mx-auto px-4 py-24 text-center">
        <h2 className="fade-up text-4xl font-bold mb-4">Smarter Reception for Your Business</h2>
        <p className="fade-up text-lg mb-8 max-w-2xl mx-auto">Our AI receptionist handles calls, books appointments, and saves you money—24/7.</p>
        <div className="fade-up space-x-4">
          <Link href="/app">
            <button className="bg-secondary px-6 py-3 text-white rounded-full shadow hover:shadow-lg transition">Start Free Trial</button>
          </Link>
          <a href="#features" className="text-white underline">Learn more</a>
        </div>
      </section>
      <section id="features" className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-semibold mb-8">Features</h3>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl p-6 shadow-card hover:shadow-hover transition fade-up">
            <h4 className="text-xl font-semibold mb-2">Call Handling</h4>
            <p className="text-muted">Answer, route, and manage calls seamlessly with AI.</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-card hover:shadow-hover transition fade-up">
            <h4 className="text-xl font-semibold mb-2">Appointment Scheduling</h4>
            <p className="text-muted">Sync with Google Calendar to create and modify bookings.</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-card hover:shadow-hover transition fade-up">
            <h4 className="text-xl font-semibold mb-2">Analytics & Savings</h4>
            <p className="text-muted">Track key metrics and ROI with ease.</p>
          </div>
        </div>
      </section>
      <section id="pricing" className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-semibold mb-8">Pricing</h3>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl p-6 shadow-card hover:shadow-hover transition">
            <h4 className="text-xl font-semibold mb-2">Starter</h4>
            <p className="text-3xl font-bold mb-4">$29<span className="text-base font-medium">/mo</span></p>
            <ul className="text-muted space-y-2">
              <li>50 call minutes</li>
              <li>Basic analytics</li>
              <li>Email support</li>
            </ul>
            <button className="mt-6 w-full bg-primary text-white py-2 rounded-full shadow hover:shadow-lg">Get Started</button>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-card hover:shadow-hover transition">
            <h4 className="text-xl font-semibold mb-2">Growth</h4>
            <p className="text-3xl font-bold mb-4">$79<span className="text-base font-medium">/mo</span></p>
            <ul className="text-muted space-y-2">
              <li>200 call minutes</li>
              <li>Advanced analytics</li>
              <li>Chat & email support</li>
            </ul>
            <button className="mt-6 w-full bg-primary text-white py-2 rounded-full shadow hover:shadow-lg">Start Trial</button>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-card hover:shadow-hover transition">
            <h4 className="text-xl font-semibold mb-2">Enterprise</h4>
            <p className="text-3xl font-bold mb-4">Custom</p>
            <ul className="text-muted space-y-2">
              <li>Unlimited minutes</li>
              <li>Custom integrations</li>
              <li>Dedicated support</li>
            </ul>
            <button className="mt-6 w-full bg-primary text-white py-2 rounded-full shadow hover:shadow-lg">Contact Sales</button>
          </div>
        </div>
      </section>
      <footer id="contact" className="bg-text text-bg py-8">
        <div className="container mx-auto text-center">
          <p>© {new Date().getFullYear()} Optimum AI Consulting. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

