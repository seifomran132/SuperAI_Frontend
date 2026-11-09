import '../i18n';
import { Closing, Faq } from '../components/Faq';
import { Hero } from '../components/Hero';
import { HowTo } from '../components/HowTo';
import { LandingPlans } from '../components/LandingPlans';
import { LandingFooter, LandingHeader } from '../components/layout';
import { Balance, Modes } from '../components/Modes';
import { useHomeRedirect } from '../model/useHomeRedirect';

/** Public home page, prerendered for search engines and link previews. */
export function LandingPage() {
  useHomeRedirect();
  return (
    <div className="bg-canvas min-h-dvh">
      <LandingHeader />
      <main>
        <Hero />
        <Modes />
        <Balance />
        <LandingPlans />
        <HowTo />
        <Faq />
        <Closing />
      </main>
      <LandingFooter />
    </div>
  );
}
