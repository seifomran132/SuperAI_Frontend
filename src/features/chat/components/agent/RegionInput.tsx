import { useId, useRef, useState, type PointerEvent } from 'react';
import { ImageOff, Keyboard, RotateCcw, ScanSearch } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '~/components/ui/button';
import { useBrandAssetImage } from '~/features/brand-kits';
import { cn } from '~/lib/utils';
import type { AgentRegion, AgentUi, AgentValue } from '../../model/agent';
import {
  NUDGE,
  NUDGE_BIG,
  centred,
  fromPoints,
  growBy,
  isValidRegion,
  moveBy,
  percent,
  resizeCorner,
  toAnswer,
  type Corner,
} from '../../model/region';
import { Dock } from './AgentInputs';

type RegionUi = Extract<AgentUi, { type: 'region' }>;

type Drag =
  | { kind: 'draw'; from: { x: number; y: number } }
  | { kind: 'move'; from: { x: number; y: number }; start: AgentRegion }
  | { kind: 'corner'; corner: Corner };

const CORNERS: Corner[] = ['nw', 'ne', 'sw', 'se'];
// Inside the dir="ltr" image area, start/end are its left/right.
const cornerPos: Record<Corner, string> = {
  nw: 'start-0 top-0 -translate-x-1/2 -translate-y-1/2',
  ne: 'end-0 top-0 translate-x-1/2 -translate-y-1/2',
  sw: 'start-0 bottom-0 -translate-x-1/2 translate-y-1/2',
  se: 'end-0 bottom-0 translate-x-1/2 translate-y-1/2',
};

const boxStyle = (b: AgentRegion) => ({
  left: `${b.x * 100}%`,
  top: `${b.y * 100}%`,
  width: `${b.width * 100}%`,
  height: `${b.height * 100}%`,
});

/**
 * `region` (S30): the user drags a box around the product or the logo on the
 * uploaded design. Move it, resize it by its corners, redraw, or (when
 * optional) skip. Touch draws with one finger and the image takes the gesture;
 * the keyboard has Enter, arrows, Alt+arrows and Delete.
 */
export function RegionInput({
  ui,
  busy,
  error,
  onAnswer,
  other,
}: {
  ui: RegionUi;
  busy: boolean;
  error: string | null;
  onAnswer: (value: AgentValue) => void;
  /** The logo box marked earlier, shown faintly on the product step. */
  other?: AgentRegion | null;
}) {
  const { t } = useTranslation();
  const r = (key: string, options?: Record<string, unknown>) =>
    t(`chat.agent.region.${key}`, options);
  const id = useId();
  const image = useBrandAssetImage(ui.brandKitId, ui.assetId, 'preview');
  const area = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<AgentRegion | null>(ui.current ?? null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [showKeys, setShowKeys] = useState(false);
  const valid = isValidRegion(box);
  const tooSmall = box !== null && !valid && drag === null;

  const point = (event: PointerEvent) => {
    const rect = area.current!.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height,
    };
  };

  const onDown = (event: PointerEvent) => {
    if (busy || !image.url) return;
    const target = event.target as HTMLElement;
    const corner = target.dataset.corner as Corner | undefined;
    area.current?.setPointerCapture(event.pointerId);
    const p = point(event);
    if (corner && box) setDrag({ kind: 'corner', corner });
    else if (target.dataset.box && box)
      setDrag({ kind: 'move', from: p, start: box });
    else {
      setDrag({ kind: 'draw', from: p });
      setBox(fromPoints(p, p));
    }
  };
  const onMove = (event: PointerEvent) => {
    if (!drag) return;
    const p = point(event);
    if (drag.kind === 'draw') setBox(fromPoints(drag.from, p));
    else if (drag.kind === 'move')
      setBox(moveBy(drag.start, p.x - drag.from.x, p.y - drag.from.y));
    else if (box) setBox(resizeCorner(box, drag.corner, p));
  };
  const onUp = () => setDrag(null);

  const onKey = (event: React.KeyboardEvent) => {
    if (busy) return;
    if (event.key === 'Enter' && !box) {
      event.preventDefault();
      setBox(centred());
      return;
    }
    if ((event.key === 'Delete' || event.key === 'Backspace') && box) {
      event.preventDefault();
      setBox(null);
      return;
    }
    if (!box || !event.key.startsWith('Arrow')) return;
    event.preventDefault();
    const step = event.shiftKey ? NUDGE_BIG : NUDGE;
    const dx =
      event.key === 'ArrowLeft' ? -step : event.key === 'ArrowRight' ? step : 0;
    const dy =
      event.key === 'ArrowUp' ? -step : event.key === 'ArrowDown' ? step : 0;
    setBox(event.altKey ? growBy(box, dx, dy) : moveBy(box, dx, dy));
  };

  return (
    <Dock>
      <p className="text-fg-muted flex items-center gap-2 text-sm">
        <ScanSearch aria-hidden="true" className="text-brand size-4 shrink-0" />
        {r(`hint.${ui.target}`)}
      </p>
      <div className="bg-surface-muted flex justify-center rounded-lg p-3">
        <div
          ref={area}
          dir="ltr"
          role="application"
          tabIndex={0}
          aria-label={r(`canvasLabel.${ui.target}`)}
          aria-describedby={`${id}-keys`}
          onKeyDown={onKey}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          className="focus-visible:outline-focus relative max-h-[50dvh] w-full max-w-xl touch-none overflow-hidden rounded-md outline-hidden select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid"
          style={{ aspectRatio: `${ui.width} / ${ui.height}` }}
        >
          {image.url ? (
            <img
              src={image.url}
              alt=""
              draggable={false}
              className="pointer-events-none h-full w-full object-contain"
            />
          ) : image.isError ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
              <ImageOff aria-hidden="true" className="text-fg-muted size-6" />
              <p className="text-fg-muted text-sm">{r('imageError')}</p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={image.refetch}
              >
                {t('chat.agent.retry')}
              </Button>
            </div>
          ) : (
            <div className="bg-surface h-full w-full animate-pulse motion-reduce:animate-none" />
          )}

          {other && ui.target === 'product' ? (
            <div
              aria-hidden="true"
              className="border-fg-subtle/70 pointer-events-none absolute border-2 border-dashed"
              style={boxStyle(other)}
            >
              <span className="bg-surface/80 text-fg-muted absolute start-1 top-1 rounded px-1 text-[11px]">
                {r('otherLogo')}
              </span>
            </div>
          ) : null}

          {box ? (
            <div
              data-box="1"
              className={cn(
                'absolute cursor-move border-2 shadow-[0_0_0_9999px_rgb(0_0_0/0.35)]',
                valid ? 'border-mode-2' : 'border-danger border-dashed',
              )}
              style={boxStyle(box)}
            >
              <span
                data-box="1"
                className="bg-surface text-fg absolute -top-3 start-1 rounded px-1.5 text-[11px] font-semibold"
              >
                {r(`boxLabel.${ui.target}`)}
              </span>
              {valid
                ? CORNERS.map((corner) => (
                    // A 44px hit area around a 16px visible handle.
                    <span
                      key={corner}
                      data-corner={corner}
                      aria-hidden="true"
                      className={cn(
                        'absolute flex size-11 items-center justify-center',
                        cornerPos[corner],
                        corner === 'nw' || corner === 'se'
                          ? 'cursor-nwse-resize'
                          : 'cursor-nesw-resize',
                      )}
                    >
                      <span
                        data-corner={corner}
                        className="bg-surface border-mode-2 size-4 rounded-sm border-2"
                      />
                    </span>
                  ))
                : null}
            </div>
          ) : null}
        </div>
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {box
          ? r('announce', {
              x: percent(box.x),
              y: percent(box.y),
              width: percent(box.width),
              height: percent(box.height),
            })
          : ''}
      </p>
      {tooSmall ? (
        <p role="alert" className="text-danger text-sm">
          {r('tooSmall')}
        </p>
      ) : box ? (
        <p className="text-fg-muted text-sm">{r('adjustHint')}</p>
      ) : null}
      {error ? (
        <p role="alert" className="text-danger text-sm">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          aria-expanded={showKeys}
          aria-controls={`${id}-keys`}
          onClick={() => setShowKeys((v) => !v)}
          className="text-brand inline-flex min-h-11 items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline"
        >
          <Keyboard aria-hidden="true" className="size-4" />
          {r('keyboard')}
        </button>
        <div className="flex flex-wrap gap-2">
          {box ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={busy}
              onClick={() => setBox(null)}
            >
              <RotateCcw aria-hidden="true" />
              {r('reset')}
            </Button>
          ) : null}
          {ui.optional ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={busy}
              onClick={() => onAnswer({ skip: true })}
            >
              {r('skip')}
            </Button>
          ) : null}
          <Button
            type="button"
            size="sm"
            loading={busy}
            disabled={!valid}
            onClick={() => valid && onAnswer({ region: toAnswer(box) })}
          >
            {t('chat.agent.send')}
          </Button>
        </div>
      </div>
      <p
        id={`${id}-keys`}
        hidden={!showKeys}
        className="text-fg-muted bg-surface-muted rounded-md p-3 text-sm"
      >
        {r('keyboardHelp')}
      </p>
    </Dock>
  );
}
