import type { ComponentType } from 'react';
import { Mail, MessageCircle, Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { brand } from '~/brand';

interface Channel {
  key: 'whatsapp' | 'email' | 'phone';
  Icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' }>;
  href: string;
  /** Shown as typed (LTR); WhatsApp shows its name instead. */
  text: string | null;
}

/** wa.me wants digits only; a full URL from the config is used as given. */
function whatsappHref(value: string): string {
  if (/^https?:\/\//i.test(value)) return value;
  return `https://wa.me/${value.replace(/\D/g, '')}`;
}

function channels(): Channel[] {
  const { whatsapp, email, phone } = brand.contact;
  const list: Channel[] = [];
  if (whatsapp)
    list.push({
      key: 'whatsapp',
      Icon: MessageCircle,
      href: whatsappHref(whatsapp),
      text: null,
    });
  if (email)
    list.push({
      key: 'email',
      Icon: Mail,
      href: `mailto:${email}`,
      text: email,
    });
  if (phone)
    list.push({
      key: 'phone',
      Icon: Phone,
      href: `tel:${phone.replace(/\s/g, '')}`,
      text: phone,
    });
  return list;
}

/**
 * Where users ask the team for a plan, balance or help. Channels come from the
 * brand config; a channel with no value is not rendered, and with none at all
 * the whole block is hidden.
 */
export function ContactChannels() {
  const { t } = useTranslation();
  const list = channels();
  if (list.length === 0) return null;
  return (
    <section className="w-full text-start">
      <h2 className="text-fg mb-2 text-sm font-medium">{t('contact.title')}</h2>
      <ul className="grid gap-2">
        {list.map(({ key, Icon, href, text }) => (
          <li key={key}>
            <a
              href={href}
              className="bg-surface-muted text-fg-muted hover:text-fg focus-visible:outline-focus flex min-h-11 items-center gap-3 rounded-md px-3.5 text-sm outline-hidden focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <Icon
                aria-hidden="true"
                className="text-fg-subtle size-4 shrink-0"
              />
              {text ? <bdi dir="ltr">{text}</bdi> : t(`contact.${key}`)}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
