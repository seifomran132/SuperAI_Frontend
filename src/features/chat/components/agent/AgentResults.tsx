import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '~/components/ui/button';
import { aspectOf } from '~/features/designs';
import {
  DesignCard,
  DesignDownload,
  DesignPreview,
  ReviewNote,
  VersionBadge,
} from '~/features/designs/ui';
import { cn } from '~/lib/utils';
import type { AgentDesign } from '../../model/agent';
import { ImageViewer } from '../ImageViewer';

/**
 * The designs of a results message (S27): in their shapes, with «تعديل» and
 * «تنزيل». «تعديل» works on any shown design, but only while the conversation
 * is at its results step (the API refuses another step).
 */
export default function AgentResults({
  designs,
  canEdit,
  onEdit,
}: {
  designs: AgentDesign[];
  canEdit: boolean;
  onEdit?: (outputId: string) => void;
}) {
  const { t } = useTranslation();
  const [viewing, setViewing] = useState<{ src: string; alt: string } | null>(
    null,
  );
  const wide = designs.some((d) => d.width > d.height * 1.2);
  return (
    <>
      <ul
        className={cn(
          'grid w-full gap-3',
          wide ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2',
        )}
      >
        {designs.map((design, index) => {
          const label = t('designs.designLabel', { n: index + 1 });
          const aspect = aspectOf(design.width, design.height);
          return (
            <DesignCard
              key={design.outputId}
              preview={
                <DesignPreview
                  attachmentId={design.attachmentId}
                  aspectRatio={aspect}
                  label={label}
                  className={aspect === '9:16' ? 'h-96' : 'max-h-96'}
                  onOpen={(src) => setViewing({ src, alt: label })}
                />
              }
              title={label}
              badges={
                <>
                  {design.needsReview ? <ReviewNote /> : null}
                  <VersionBadge version={design.version} />
                </>
              }
              meta={
                canEdit || !design.editable
                  ? undefined
                  : t('chat.agent.finishStepFirst')
              }
              actions={
                <>
                  {design.editable && onEdit ? (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={!canEdit}
                      aria-label={t('chat.agent.editDesignLabel', {
                        n: index + 1,
                      })}
                      onClick={() => onEdit(design.outputId)}
                    >
                      <Pencil aria-hidden="true" />
                      {t('chat.agent.editDesign')}
                    </Button>
                  ) : null}
                  <DesignDownload
                    designId={design.outputId}
                    aspectRatio={aspect}
                    label={t('chat.agent.downloadLabel', { n: index + 1 })}
                  />
                </>
              }
            />
          );
        })}
      </ul>
      {viewing ? (
        <ImageViewer
          open
          onOpenChange={(open) => !open && setViewing(null)}
          src={viewing.src}
          alt={viewing.alt}
        />
      ) : null}
    </>
  );
}
