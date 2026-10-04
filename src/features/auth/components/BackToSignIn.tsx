import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { TextLink } from '~/components/TextLink';

/** "Back" link. In RTL back points right, so the arrow is the right-pointing one (mirrored if LTR). */
export function BackToSignIn() {
  const { t } = useTranslation();
  return (
    <div className="mt-4 flex justify-center">
      <TextLink to="/sign-in" className="gap-2">
        <ArrowRight aria-hidden="true" className="size-4 ltr:-scale-x-100" />
        {t('auth.backToSignIn')}
      </TextLink>
    </div>
  );
}
