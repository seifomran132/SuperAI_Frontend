import '../i18n';
import { Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { brand } from '~/brand';
import {
  Container,
  LandingFooter,
  LandingHeader,
  useBrandName,
} from '../components/layout';

// Interim notice until the company is registered and the full policy is
// reviewed (docs/legal/lam7a/privacy.md). Same header and footer as the home page.
const sections = [
  { id: 'collect', items: ['collect1', 'collect2', 'collect3', 'collect4'] },
  { id: 'use', items: ['use1', 'use2', 'use3'] },
  { id: 'share', items: ['share1', 'share2', 'share3'] },
  { id: 'where', body: 'whereBody' },
  { id: 'rights', items: ['rights1', 'rights2', 'rights3'], body: 'rightsHow' },
  { id: 'age', body: 'ageBody' },
] as const;

function Heading({ id, children }: { id: string; children: string }) {
  return (
    <h2 id={id} className="text-fg text-xl leading-8 font-bold">
      {children}
    </h2>
  );
}

/** Public privacy page, prerendered. */
export function PrivacyPage() {
  const { t } = useTranslation();
  const brandName = useBrandName();
  const p = (key: string) => t(`landing.privacy.${key}`, { brandName });
  const { email } = brand.contact;
  return (
    <div className="bg-canvas min-h-dvh">
      <LandingHeader />
      <main>
        <Container className="max-w-[760px] py-12 md:py-16">
          <h1 className="text-fg text-3xl leading-[48px] font-bold md:text-4xl md:leading-[56px]">
            {p('title')}
          </h1>
          <p className="text-fg mt-4 text-lg">{p('interim')}</p>
          <p className="text-fg-muted mt-2 text-sm">{p('updated')}</p>

          <div className="mt-10 flex flex-col gap-8 text-base leading-7">
            {sections.map((section) => (
              <section
                key={section.id}
                aria-labelledby={`privacy-${section.id}`}
                className="flex flex-col gap-3"
              >
                <Heading id={`privacy-${section.id}`}>
                  {p(`${section.id}Title`)}
                </Heading>
                {'items' in section ? (
                  <ul className="text-fg flex list-disc flex-col gap-2 ps-5">
                    {section.items.map((item) => (
                      <li key={item}>{p(item)}</li>
                    ))}
                  </ul>
                ) : null}
                {'body' in section ? (
                  <p className="text-fg">{p(section.body)}</p>
                ) : null}
              </section>
            ))}

            <section
              aria-labelledby="privacy-contact"
              className="flex flex-col gap-3"
            >
              <Heading id="privacy-contact">{p('contactTitle')}</Heading>
              <p className="text-fg">{p('contactBody')}</p>
              {email ? (
                <a
                  href={`mailto:${email}`}
                  className="text-fg inline-flex min-h-11 items-center gap-2 self-start font-medium underline underline-offset-4"
                >
                  <Mail aria-hidden="true" className="size-4" />
                  <bdi dir="ltr">{email}</bdi>
                </a>
              ) : null}
            </section>
          </div>
        </Container>
      </main>
      <LandingFooter />
    </div>
  );
}
