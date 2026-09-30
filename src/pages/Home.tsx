import React, { useState } from 'react';
import { Navbar } from '../components/navbar/Navbar';
import { Hero } from '../components/hero/Hero';
import { TranscriptGenerator } from '../components/generator/TranscriptGenerator';
import { TranscriptOutput } from '../components/transcript/TranscriptOutput';
import { HowItWorks } from '../components/how-it-works/HowItWorks';
import { Features } from '../components/features/Features';
import { FAQ } from '../components/faq/FAQ';
import { Footer } from '../components/footer/Footer';
import { AuthModal } from '../components/auth/AuthModal';
import type { AuthMode, TranscriptData } from '../types/transcript';
import { useAuth } from '../hooks/useAuth';
import { generateTranscript } from '../services/transcriptService';

export const Home: React.FC = () => {
  const { user } = useAuth();
  const [url, setUrl] = useState('');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTranscript, setActiveTranscript] = useState<TranscriptData | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'info' | 'error' | 'success'>('info');

  const handleOpenAuth = (mode: AuthMode = 'signin') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleCloseAuth = () => {
    setAuthModalOpen(false);
  };

  const handleScrollToGenerator = () => {
    const el = document.getElementById('generator-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      const input = document.getElementById('youtube-url-input');
      if (input) {
        setTimeout(() => input.focus(), 400);
      }
    }
  };

  const handleScrollToHowItWorks = () => {
    const el = document.getElementById('how-it-works');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleGenerateClick = async () => {
    if (!user) {
      // Unauthenticated user -> opens authentication modal
      handleOpenAuth('signup');
      return;
    }

    if (!url.trim()) {
      setStatusType('error');
      setStatusMessage('Please enter a YouTube video URL or select one of the samples below.');
      return;
    }

    setIsGenerating(true);
    setStatusMessage(null);

    try {
      const result = await generateTranscript(url.trim());

      if (result.success && result.transcript) {
        setActiveTranscript(result.transcript);
        setStatusType('success');
        setStatusMessage(
          `Transcript successfully extracted for "${result.transcript.video.title}"!`
        );

        // Smooth scroll down to the transcript output section
        setTimeout(() => {
          const outputEl = document.getElementById('transcript-output');
          if (outputEl) {
            outputEl.scrollIntoView({ behavior: 'smooth' });
          }
        }, 150);
      } else {
        setStatusType('error');
        setStatusMessage(result.error || 'Failed to generate transcript.');
      }
    } catch (err: any) {
      setStatusType('error');
      setStatusMessage(err?.message || 'An unexpected error occurred while extracting transcript.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F2EB] text-[#1B1E19]">
      {/* Sticky Navbar */}
      <Navbar onOpenAuth={handleOpenAuth} />

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <Hero
          onScrollToGenerator={handleScrollToGenerator}
          onScrollToHowItWorks={handleScrollToHowItWorks}
        />

        {/* Transcript Generator (Visual Centerpiece) */}
        <TranscriptGenerator
          url={url}
          setUrl={(newUrl) => {
            setUrl(newUrl);
            if (statusMessage) setStatusMessage(null);
          }}
          onGenerateClick={handleGenerateClick}
          isLoading={isGenerating}
          statusMessage={statusMessage}
          statusType={statusType}
          onDismissStatusMessage={() => setStatusMessage(null)}
        />

        {/* Transcript Output Section (Empty State, Mock Transcript & Live Apify Transcript) */}
        <TranscriptOutput
          initialShowMock={false}
          realTranscript={activeTranscript}
          isLoading={isGenerating}
        />

        {/* How It Works */}
        <HowItWorks />

        {/* Features Grid */}
        <Features />

        {/* FAQ Section */}
        <FAQ />
      </main>

      {/* Footer */}
      <Footer />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={handleCloseAuth}
        initialMode={authMode}
      />
    </div>
  );
};
