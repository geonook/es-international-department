"use client"

import Link from "next/link"
import { ExternalLink } from "lucide-react"
import MobileNav from "@/components/ui/mobile-nav"

/**
 * Resources Page - 1:1 Copy of Google Sites Design
 * Simple, clean layout matching original Google Sites exactly
 * White background, purple headers, basic typography
 */

export default function ResourcesPage() {
  return (
    <>
      {/* Google Fonts Import */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Lora:wght@400;600;700&family=Gentium+Basic:ital,wght@0,400;0,700;1,400&family=Lato:wght@300;400;700&display=swap" rel="stylesheet" />
      
      <div className="min-h-screen bg-white">
        {/* Simple Header - Matching current nav style */}
        <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-700 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">E</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-purple-700" style={{ fontFamily: 'Lora, serif' }}>
                    KCISLK ESID Info Hub
                  </h1>
                  <p className="text-xs text-gray-600" style={{ fontFamily: 'Lato, sans-serif' }}>
                    KCISLK Elementary School International Department
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center space-x-8">
                  {[
                    { name: "Home", href: "/" },
                    { name: "Events", href: "/events" },
                    { name: "Resources", href: "/resources", active: true },
                  ].map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                        item.active
                          ? "text-purple-700 bg-purple-100"
                          : "text-gray-600 hover:text-purple-700 hover:bg-purple-50"
                      }`}
                      style={{ fontFamily: 'Lato, sans-serif' }}
                    >
                      {item.name}
                      {item.active && (
                        <div className="h-0.5 bg-purple-700 rounded-full mt-1"></div>
                      )}
                    </Link>
                  ))}
                </nav>

                {/* Mobile Navigation */}
                <MobileNav />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content - Google Sites Style */}
        <main className="container mx-auto px-6 py-12 max-w-4xl">
          
          {/* Page Title - Simple Google Sites Style */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-purple-700 mb-4" style={{ fontFamily: 'Lora, serif' }}>
              Resources
            </h1>
          </div>

          {/* 1. Parent Resources Section */}
          <section className="mb-16">
            {/* Image Placeholder */}
            <div className="w-full h-48 bg-gray-100 rounded-lg mb-6 flex items-center justify-center">
              <div className="text-center text-gray-500" style={{ fontFamily: 'Lato, sans-serif' }}>
                <div className="text-sm">Parent Resources Image</div>
                <div className="text-xs mt-1">Parents supporting child development</div>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-purple-700 mb-4" style={{ fontFamily: 'Lora, serif' }}>
              Parent Resources
            </h2>
            <p className="text-gray-800 text-lg leading-relaxed mb-6" style={{ fontFamily: 'Gentium Basic, serif' }}>
              Parents play a crucial role in their children's development. Offers informative articles and online tools.
            </p>
            <a 
              href="https://drive.google.com/drive/folders/parent-support" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-purple-700 hover:text-purple-800 underline hover:no-underline transition-all duration-200"
              style={{ fontFamily: 'Gentium Basic, serif' }}
            >
              Access Parent Resources <ExternalLink className="inline w-4 h-4 ml-1" />
            </a>
          </section>

          {/* 2. G1-G2 Transition Materials Section */}
          <section className="mb-16">
            {/* Image Placeholder */}
            <div className="w-full h-48 bg-gray-100 rounded-lg mb-6 flex items-center justify-center">
              <div className="text-center text-gray-500" style={{ fontFamily: 'Lato, sans-serif' }}>
                <div className="text-sm">G1-G2 Transition Materials</div>
                <div className="text-xs mt-1">Summer 2025 Learning Resources</div>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-purple-700 mb-4" style={{ fontFamily: 'Lora, serif' }}>
              G1-G2 myView Transition Materials
            </h2>
            <p className="text-gray-800 text-lg leading-relaxed mb-6" style={{ fontFamily: 'Gentium Basic, serif' }}>
              Learning materials for smooth student transition from Grade 1 to Grade 2. Summer 2025 collection.
            </p>
            
            <div className="grid gap-3">
              {[
                "Henry on Wheels",
                "Baby Animals Grow", 
                "Thumbs Up for Art and Music!",
                "What Is the Story of Our Flag?",
                "My Autumn Book",
                "Review Games"
              ].map((title, index) => (
                <a 
                  key={index}
                  href={`https://drive.google.com/file/d/${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-700 hover:text-purple-800 underline hover:no-underline transition-all duration-200 text-lg"
                  style={{ fontFamily: 'Gentium Basic, serif' }}
                >
                  {title} <ExternalLink className="inline w-4 h-4 ml-1" />
                </a>
              ))}
            </div>
          </section>

          {/* 3. Reading Buddies Section */}
          <section className="mb-16">
            {/* Image Placeholder */}
            <div className="w-full h-48 bg-gray-100 rounded-lg mb-6 flex items-center justify-center">
              <div className="text-center text-gray-500" style={{ fontFamily: 'Lato, sans-serif' }}>
                <div className="text-sm">Reading Buddies</div>
                <div className="text-xs mt-1">YouTube Channel Content</div>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-purple-700 mb-4" style={{ fontFamily: 'Lora, serif' }}>
              Reading Buddies
            </h2>
            <p className="text-gray-800 text-lg leading-relaxed mb-6" style={{ fontFamily: 'Gentium Basic, serif' }}>
              Combines the science of reading with lots of laughter. YouTube channel with engaging video content.
            </p>
            <a 
              href="https://www.youtube.com/@readingbuddies" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-purple-700 hover:text-purple-800 underline hover:no-underline transition-all duration-200"
              style={{ fontFamily: 'Gentium Basic, serif' }}
            >
              Visit Reading Buddies YouTube Channel <ExternalLink className="inline w-4 h-4 ml-1" />
            </a>
          </section>

          {/* 4. Five Components of Reading Section */}
          <section className="mb-16">
            {/* Image Placeholder */}
            <div className="w-full h-48 bg-gray-100 rounded-lg mb-6 flex items-center justify-center">
              <div className="text-center text-gray-500" style={{ fontFamily: 'Lato, sans-serif' }}>
                <div className="text-sm">Five Components of Reading</div>
                <div className="text-xs mt-1">Scientific Research Document</div>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-purple-700 mb-4" style={{ fontFamily: 'Lora, serif' }}>
              The Five Components of Reading
            </h2>
            <p className="text-gray-800 text-lg leading-relaxed mb-6" style={{ fontFamily: 'Gentium Basic, serif' }}>
              Link to scientific research document. Emphasizes systematic practice of reading components: phonemic awareness, phonics, fluency, vocabulary, and comprehension.
            </p>
            <a 
              href="https://drive.google.com/file/d/five-components-reading" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-purple-700 hover:text-purple-800 underline hover:no-underline transition-all duration-200"
              style={{ fontFamily: 'Gentium Basic, serif' }}
            >
              Access Five Components Research Document <ExternalLink className="inline w-4 h-4 ml-1" />
            </a>
          </section>

          {/* 5. Reading Campaign Section */}
          <section className="mb-16">
            {/* Image Placeholder */}
            <div className="w-full h-48 bg-gray-100 rounded-lg mb-6 flex items-center justify-center">
              <div className="text-center text-gray-500" style={{ fontFamily: 'Lato, sans-serif' }}>
                <div className="text-sm">Reading Campaign</div>
                <div className="text-xs mt-1">Fall 2024 Weekly Challenge</div>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-purple-700 mb-4" style={{ fontFamily: 'Lora, serif' }}>
              Reading Campaign
            </h2>
            <p className="text-gray-800 text-lg leading-relaxed mb-6" style={{ fontFamily: 'Gentium Basic, serif' }}>
              Fall 2024: Weekly Reading Challenge. Focuses on reading beyond textbooks with weekly texts and comprehension activities.
            </p>
            <a 
              href="https://drive.google.com/drive/folders/weekly-reading-challenge" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-purple-700 hover:text-purple-800 underline hover:no-underline transition-all duration-200"
              style={{ fontFamily: 'Gentium Basic, serif' }}
            >
              Join Fall 2024 Weekly Reading Challenge <ExternalLink className="inline w-4 h-4 ml-1" />
            </a>
          </section>

          {/* 6. Building Background Knowledge Section */}
          <section className="mb-16">
            {/* Image Placeholder */}
            <div className="w-full h-48 bg-gray-100 rounded-lg mb-6 flex items-center justify-center">
              <div className="text-center text-gray-500" style={{ fontFamily: 'Lato, sans-serif' }}>
                <div className="text-sm">Building Background Knowledge</div>
                <div className="text-xs mt-1">Spring 2025 ELL Resources</div>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-purple-700 mb-4" style={{ fontFamily: 'Lora, serif' }}>
              Building Background Knowledge
            </h2>
            <p className="text-gray-800 text-lg leading-relaxed mb-6" style={{ fontFamily: 'Gentium Basic, serif' }}>
              Spring 2025 resources. Emphasizes importance for English Language Learners with comprehensive materials.
            </p>
            
            <div className="space-y-4">
              <a 
                href="https://drive.google.com/drive/folders/background-knowledge" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-purple-700 hover:text-purple-800 underline hover:no-underline transition-all duration-200"
                style={{ fontFamily: 'Gentium Basic, serif' }}
              >
                Access Spring 2025 Background Knowledge Resources <ExternalLink className="inline w-4 h-4 ml-1" />
              </a>
              
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2" style={{ fontFamily: 'Lora, serif' }}>
                  Recommended Platform:
                </h3>
                <a 
                  href="https://www.readworks.org/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-700 hover:text-purple-800 underline hover:no-underline transition-all duration-200"
                  style={{ fontFamily: 'Gentium Basic, serif' }}
                >
                  ReadWorks - Article a Day <ExternalLink className="inline w-4 h-4 ml-1" />
                </a>
                <p className="text-gray-700 text-base mt-2" style={{ fontFamily: 'Gentium Basic, serif' }}>
                  Daily reading articles with comprehension questions. Build reading stamina and background knowledge.
                </p>
              </div>
            </div>
          </section>

        </main>

        {/* Simple Footer */}
        <footer className="bg-gray-50 py-8 mt-16">
          <div className="container mx-auto px-6 text-center">
            <p className="text-gray-600" style={{ fontFamily: 'Lato, sans-serif' }}>
              &copy; 2025 KCISLK Elementary School International Department. All rights reserved.
            </p>
            <p className="text-gray-500 text-sm mt-2" style={{ fontFamily: 'Lato, sans-serif' }}>
              KCISLK Elementary School International Department | Excellence in International Education
            </p>
          </div>
        </footer>
      </div>
    </>
  )
}