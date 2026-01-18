import { useNavigate } from 'react-router-dom';
import { Camera, Music, Sparkles, ArrowRight, Disc3 } from 'lucide-react';
import { Button, Card } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';

export function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      navigate('/scan');
    } else {
      navigate('/signup');
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)]">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-warm-50 to-secondary-50" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary-200/30 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-neutral-200/60 text-sm text-neutral-600 mb-6 shadow-sm">
              <Disc3 className="w-4 h-4 text-secondary-500" />
              <span>Bring your mixtapes back to life</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-neutral-900 mb-6 text-balance">
              Turn handwritten song lists into
              <span className="text-primary-600"> digital playlists</span>
            </h1>

            <p className="text-lg sm:text-xl text-neutral-600 mb-10 text-balance max-w-2xl mx-auto">
              Snap a photo of your old mixtape tracklists and we&apos;ll use AI to read your handwriting
              and create a playlist on Spotify. Those memories deserve to be heard again.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" onClick={handleGetStarted} icon={<Camera className="w-5 h-5" />}>
                Scan Your Mixtape
                <ArrowRight className="w-5 h-5 ml-1" />
              </Button>
              <Button variant="ghost" size="lg" onClick={() => navigate('/login')}>
                I have an account
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-display font-bold text-neutral-900 mb-4">
              How it works
            </h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              Three simple steps to transform your handwritten memories into a playlist you can enjoy anywhere
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card hover className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary-100 flex items-center justify-center">
                <Camera className="w-7 h-7 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">1. Capture</h3>
              <p className="text-neutral-600">
                Take a photo of your handwritten song list from an old mixtape, CD case, or notebook
              </p>
            </Card>

            <Card hover className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-secondary-100 flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-secondary-600" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">2. Review</h3>
              <p className="text-neutral-600">
                Our AI reads your handwriting and matches songs. Review and adjust any that need it
              </p>
            </Card>

            <Card hover className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-warm-100 flex items-center justify-center">
                <Music className="w-7 h-7 text-warm-600" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">3. Listen</h3>
              <p className="text-neutral-600">
                Export directly to Spotify and relive those memories whenever you want
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-neutral-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-display font-bold text-neutral-900 mb-4">
              Perfect for old mixtapes
            </h2>
            <p className="text-neutral-600 mb-8">
              Our smart matching handles the quirks of handwritten lists: abbreviations, two-column layouts,
              artist-song formats, and even slightly messy handwriting. We prioritize finding the original
              versions of classic songs, not covers or remasters.
            </p>

            <div className="flex flex-wrap justify-center gap-3">
              {['Two-column layouts', 'Abbreviations', 'Multiple formats', 'Handwriting recognition', 'Smart song matching'].map((feature) => (
                <span
                  key={feature}
                  className="px-4 py-2 rounded-full bg-white border border-neutral-200 text-sm text-neutral-700"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-neutral-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-display font-bold mb-4">
            Ready to relive the memories?
          </h2>
          <p className="text-neutral-400 mb-8 max-w-2xl mx-auto">
            Dust off those old cassette cases and give your mixtapes a second life.
            Your past self had great taste - it&apos;s time to hear it again.
          </p>
          <Button size="lg" variant="accent" onClick={handleGetStarted}>
            Get Started Free
            <ArrowRight className="w-5 h-5 ml-1" />
          </Button>
        </div>
      </section>
    </div>
  );
}
