import { useTranslation } from 'react-i18next';
import { useBrandAssetImage } from '~/features/brand-kits';
import type { AgentRegion } from '../../model/agent';

/** The uploaded design with the marked box, in the user's answer bubble (S30). */
export default function RegionThumbnail({
  brandKitId,
  assetId,
  width,
  height,
  region,
}: {
  brandKitId: string;
  assetId: string;
  width: number;
  height: number;
  region: AgentRegion;
}) {
  const { t } = useTranslation();
  const image = useBrandAssetImage(brandKitId, assetId, 'preview');
  return (
    <div
      dir="ltr"
      role="img"
      aria-label={t('chat.agent.region.thumbnail')}
      className="bg-surface relative w-44 overflow-hidden rounded-md"
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      {image.url ? (
        <img src={image.url} alt="" className="h-full w-full object-contain" />
      ) : (
        <div className="bg-surface-muted h-full w-full" />
      )}
      <div
        aria-hidden="true"
        className="border-mode-2 absolute border-2"
        style={{
          left: `${region.x * 100}%`,
          top: `${region.y * 100}%`,
          width: `${region.width * 100}%`,
          height: `${region.height * 100}%`,
        }}
      />
    </div>
  );
}
