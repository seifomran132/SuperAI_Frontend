import { useId, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useBlocker, useNavigate } from '@tanstack/react-router';
import { ArrowRight, Trash2 } from 'lucide-react';
import { Dialog } from 'radix-ui';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { isApiError } from '~/api/errors';
import {
  meBrandKitsDeleteAssetMutation,
  meBrandKitsRemoveMutation,
  meBrandKitsUpdateMutation,
} from '~/api/generated/@tanstack/react-query.gen';
import type {
  BrandKitDetailDto,
  UpdateBrandKitDto,
} from '~/api/generated/types.gen';
import { PageScroll } from '~/components/PageScroll';
import { TextLink } from '~/components/TextLink';
import { Alert } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import '../i18n';
import {
  AssetDropZone,
  AssetTile,
  PendingTile,
} from '../components/AssetFiles';
import { ColorPalette } from '../components/ColorPalette';
import { Counter, DraftBadge, Section } from '../components/parts';
import {
  ProfileFields,
  cleanProfile,
  profileFits,
  type BrandProfile,
} from '../components/ProfileFields';
import { kitKey, refreshKits, useBrandKit } from '../model/queries';
import { ASSETS_MAX, ASSET_KINDS, NAME_MAX } from '../model/rules';
import { useAssetUploads } from '../model/useAssetUploads';

type Part = 'name' | 'colors' | 'profile';

const same = (a: unknown, b: unknown) =>
  JSON.stringify(a) === JSON.stringify(b);

function errorText(
  t: (key: string, options?: Record<string, unknown>) => string,
  error: unknown,
) {
  return isApiError(error)
    ? t(`errors:${error.code}`, { defaultValue: t('brandKits.saveError') })
    : t('brandKits.saveError');
}

function ConfirmDialog({
  open,
  onOpenChange,
  title,
  body,
  confirm,
  cancel,
  danger = false,
  busy = false,
  error,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  body: string;
  confirm: string;
  cancel: string;
  danger?: boolean;
  busy?: boolean;
  error?: string | null;
  onConfirm: () => void;
}) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!busy) onOpenChange(next);
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="bg-fg/45 fixed inset-0 z-50" />
        <Dialog.Content className="bg-surface fixed inset-x-0 bottom-0 z-50 flex flex-col gap-4 rounded-t-lg p-6 sm:inset-0 sm:m-auto sm:h-fit sm:w-[calc(100%-2rem)] sm:max-w-md sm:rounded-lg">
          <Dialog.Title className="text-fg text-xl font-bold">
            {title}
          </Dialog.Title>
          <Dialog.Description className="text-fg-muted">
            {body}
          </Dialog.Description>
          {error ? <Alert variant="danger">{error}</Alert> : null}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Dialog.Close asChild>
              <Button type="button" variant="secondary" disabled={busy}>
                {cancel}
              </Button>
            </Dialog.Close>
            <Button
              type="button"
              variant={danger ? 'danger' : 'primary'}
              loading={busy}
              onClick={onConfirm}
            >
              {confirm}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Editor({ kit }: { kit: BrandKitDetailDto }) {
  const { t } = useTranslation();
  const ids = useId();
  const qc = useQueryClient();
  const navigate = useNavigate();

  // null = not edited: the field shows what the server has.
  const [nameDraft, setNameDraft] = useState<string | null>(null);
  const [colorsDraft, setColorsDraft] = useState<string[] | null>(null);
  const [profileDraft, setProfileDraft] = useState<BrandProfile | null>(null);
  const [nameMissing, setNameMissing] = useState(false);
  const [failed, setFailed] = useState<{
    parts: Part[];
    error: unknown;
  } | null>(null);
  const [suggested, setSuggested] = useState<string[]>([]);

  const name = nameDraft ?? kit.name;
  const colors = colorsDraft ?? kit.colors;
  const profile = profileDraft ?? kit.profile;
  const dirty: Record<Part, boolean> = {
    name: nameDraft !== null && nameDraft !== kit.name,
    colors: colorsDraft !== null && !same(colorsDraft, kit.colors),
    profile:
      profileDraft !== null &&
      !same(cleanProfile(profileDraft), cleanProfile(kit.profile)),
  };
  const anyDirty = dirty.name || dirty.colors || dirty.profile;

  const update = useMutation({ ...meBrandKitsUpdateMutation() });
  const [savingParts, setSavingParts] = useState<Part[]>([]);

  const save = (parts: Part[]) => {
    const wanted = parts.filter((p) => dirty[p]);
    if (wanted.length === 0) return;
    const body: UpdateBrandKitDto = {};
    if (wanted.includes('name')) {
      const value = name.trim();
      if (!value) return setNameMissing(true);
      if (value.length > NAME_MAX) return;
      body.name = value;
    }
    if (wanted.includes('colors')) body.colors = colors;
    if (wanted.includes('profile')) {
      if (!profileFits(profile)) return;
      body.profile = cleanProfile(profile);
    }
    setFailed(null);
    setSavingParts(wanted);
    update.mutate(
      { path: { id: kit.id }, body },
      {
        onSuccess: (saved) => {
          refreshKits(qc, saved);
          if (wanted.includes('name')) setNameDraft(null);
          if (wanted.includes('colors')) setColorsDraft(null);
          if (wanted.includes('profile')) setProfileDraft(null);
          toast.success(t('brandKits.saved'));
        },
        onError: (error) => setFailed({ parts: wanted, error }),
        onSettled: () => setSavingParts([]),
      },
    );
  };
  const saving = (part: Part) => savingParts.includes(part);
  const failure = (part: Part) =>
    failed?.parts.includes(part) ? (
      <Alert variant="danger">{errorText(t, failed.error)}</Alert>
    ) : null;

  const discard = () => {
    setNameDraft(null);
    setColorsDraft(null);
    setProfileDraft(null);
    setNameMissing(false);
    setFailed(null);
  };

  // Files
  const refetchKit = () =>
    void qc.invalidateQueries({ queryKey: kitKey(kit.id) });
  const uploads = useAssetUploads({
    kitId: kit.id,
    onUploaded: (result, kind) => {
      refetchKit();
      refreshKits(qc);
      if (kind === 'logo' && result.suggestedColors.length > 0) {
        setSuggested(result.suggestedColors);
      }
    },
  });
  const room = ASSETS_MAX - kit.assets.length - uploads.uploading;
  const full = kit.assets.length >= ASSETS_MAX;
  const [deletingAsset, setDeletingAsset] = useState<string | null>(null);
  const removeAsset = useMutation({ ...meBrandKitsDeleteAssetMutation() });
  const onDeleteAsset = (assetId: string) => {
    setDeletingAsset(assetId);
    removeAsset.mutate(
      { path: { id: kit.id, assetId } },
      {
        onSuccess: () => {
          refetchKit();
          refreshKits(qc);
        },
        onError: () => toast.error(t('brandKits.assets.deleteError')),
        onSettled: () => setDeletingAsset(null),
      },
    );
  };

  // Delete the kit
  const [confirmDelete, setConfirmDelete] = useState(false);
  const leaving = useRef(false);
  const removeKit = useMutation({ ...meBrandKitsRemoveMutation() });
  const onDeleteKit = () =>
    removeKit.mutate(
      { path: { id: kit.id } },
      {
        onSuccess: () => {
          leaving.current = true;
          setConfirmDelete(false);
          qc.removeQueries({ queryKey: kitKey(kit.id) });
          refreshKits(qc);
          toast.success(t('brandKits.delete.deleted'));
          void navigate({ to: '/brands' });
        },
      },
    );

  const blocker = useBlocker({
    shouldBlockFn: () => anyDirty && !leaving.current,
    enableBeforeUnload: () => anyDirty && !leaving.current,
    withResolver: true,
  });

  return (
    <>
      <div className="flex flex-col gap-3">
        <TextLink to="/brands" className="gap-1 self-start">
          <ArrowRight aria-hidden="true" className="size-4 ltr:rotate-180" />
          {t('brandKits.back')}
        </TextLink>
        <div className="flex flex-wrap items-center gap-3">
          <h1 dir="auto" className="text-fg text-3xl font-bold">
            {kit.name}
          </h1>
          {kit.status === 'draft' ? <DraftBadge /> : null}
        </div>
      </div>

      {kit.status === 'draft' ? (
        <Alert
          variant="warning"
          action={
            <Button asChild variant="secondary" size="sm">
              <Link to="/chat">{t('brandKits.draftNote.action')}</Link>
            </Button>
          }
        >
          <strong className="block">{t('brandKits.draftNote.title')}</strong>
          {t('brandKits.draftNote.body')}
        </Alert>
      ) : null}

      <Section
        id={`${ids}-identity`}
        title={t('brandKits.identity.title')}
        description={t('brandKits.identity.body')}
      >
        <form
          className="flex flex-col gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            save(['name']);
          }}
        >
          <label
            htmlFor={`${ids}-name`}
            className="text-fg text-sm font-semibold"
          >
            {t('brandKits.identity.label')}
          </label>
          <div className="flex flex-wrap gap-2">
            <Input
              id={`${ids}-name`}
              dir="auto"
              value={name}
              aria-invalid={nameMissing || name.length > NAME_MAX || undefined}
              aria-describedby={`${ids}-name-count${nameMissing ? ` ${ids}-name-error` : ''}`}
              onChange={(event) => {
                setNameDraft(event.target.value);
                setNameMissing(false);
              }}
              className="min-w-48 flex-1"
            />
            <Button
              type="submit"
              variant="secondary"
              disabled={!dirty.name}
              loading={saving('name')}
            >
              {t('brandKits.identity.save')}
            </Button>
          </div>
          <Counter
            id={`${ids}-name-count`}
            count={name.length}
            max={NAME_MAX}
          />
          {nameMissing ? (
            <p
              id={`${ids}-name-error`}
              role="alert"
              className="text-danger text-sm"
            >
              {t('brandKits.identity.required')}
            </p>
          ) : null}
          {failure('name')}
        </form>
      </Section>

      <Section
        id={`${ids}-colors`}
        title={t('brandKits.colors.title')}
        description={t('brandKits.colors.body')}
        aside={<Counter count={colors.length} max={12} />}
      >
        <ColorPalette
          value={colors}
          onChange={setColorsDraft}
          suggested={suggested}
        />
        {failure('colors')}
        <Button
          type="button"
          variant="secondary"
          className="self-start"
          disabled={!dirty.colors}
          loading={saving('colors')}
          onClick={() => save(['colors'])}
        >
          {t('brandKits.colors.save')}
        </Button>
      </Section>

      <Section
        id={`${ids}-files`}
        title={t('brandKits.assets.title')}
        description={t('brandKits.assets.body')}
        aside={<Counter count={kit.assets.length} max={ASSETS_MAX} />}
      >
        {full ? (
          <Alert variant="warning" id={`${ids}-files-full`}>
            {t('brandKits.assets.limitReached')}
          </Alert>
        ) : null}
        {ASSET_KINDS.map((kind, groupIndex) => {
          const group = t(`brandKits.assets.kinds.${kind}.title`);
          const stored = kit.assets.filter((a) => a.kind === kind);
          const pending = uploads.items.filter((i) => i.kind === kind);
          return (
            <section
              key={kind}
              aria-labelledby={`${ids}-${kind}`}
              className={
                groupIndex > 0
                  ? 'border-border-subtle flex flex-col gap-3 border-t pt-5'
                  : 'flex flex-col gap-3'
              }
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 id={`${ids}-${kind}`} className="text-fg font-bold">
                    {group}
                  </h3>
                  <p className="text-fg-muted text-sm">
                    {t(`brandKits.assets.kinds.${kind}.body`)}
                  </p>
                </div>
                <span className="text-fg-muted shrink-0 text-sm">
                  {t('brandKits.files', { count: stored.length })}
                </span>
              </div>
              <AssetDropZone
                kind={kind}
                disabled={full}
                describedBy={full ? `${ids}-files-full` : undefined}
                onFiles={(files) => uploads.add(kind, files, room)}
              />
              {stored.length + pending.length > 0 ? (
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {pending.map((item) => (
                    <PendingTile
                      key={item.id}
                      item={item}
                      onRetry={() => uploads.retry(item.id)}
                      onDismiss={() => uploads.dismiss(item.id)}
                    />
                  ))}
                  {stored.map((asset, index) => (
                    <AssetTile
                      key={asset.id}
                      kitId={kit.id}
                      asset={asset}
                      label={t('brandKits.assets.removeLabel', {
                        position: index + 1,
                        group,
                      })}
                      deleting={deletingAsset === asset.id}
                      onDelete={() => onDeleteAsset(asset.id)}
                    />
                  ))}
                </ul>
              ) : null}
            </section>
          );
        })}
      </Section>

      <Section
        id={`${ids}-profile`}
        title={t('brandKits.profile.title')}
        description={t('brandKits.profile.body')}
      >
        <ProfileFields value={profile} onChange={setProfileDraft} />
        {failure('profile')}
        <Button
          type="button"
          variant="secondary"
          className="self-start"
          disabled={!dirty.profile || !profileFits(profile)}
          loading={saving('profile')}
          onClick={() => save(['profile'])}
        >
          {t('brandKits.profile.save')}
        </Button>
      </Section>

      <Section
        id={`${ids}-delete`}
        title={t('brandKits.delete.title')}
        description={t('brandKits.delete.body')}
        tone="danger"
      >
        <Button
          type="button"
          variant="secondary"
          className="text-danger hover:text-danger border-danger-border self-start"
          onClick={() => setConfirmDelete(true)}
        >
          <Trash2 aria-hidden="true" />
          {t('brandKits.delete.action')}
        </Button>
      </Section>

      {anyDirty ? (
        <div className="bg-surface border-border-control sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 shadow-md sm:mx-0 sm:rounded-lg sm:border">
          <p className="text-fg font-semibold">{t('brandKits.unsaved.bar')}</p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={discard}
            >
              {t('brandKits.unsaved.discard')}
            </Button>
            <Button
              type="button"
              size="sm"
              loading={update.isPending}
              disabled={!profileFits(profile)}
              onClick={() => save(['name', 'colors', 'profile'])}
            >
              {t('brandKits.unsaved.save')}
            </Button>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={(open) => {
          setConfirmDelete(open);
          if (!open) removeKit.reset();
        }}
        title={t('brandKits.delete.confirmTitle', { name: kit.name })}
        body={t('brandKits.delete.confirmBody')}
        confirm={t('brandKits.delete.confirm')}
        cancel={t('brandKits.delete.cancel')}
        danger
        busy={removeKit.isPending}
        error={removeKit.isError ? t('brandKits.delete.error') : null}
        onConfirm={onDeleteKit}
      />
      <ConfirmDialog
        open={blocker.status === 'blocked'}
        onOpenChange={(open) => {
          if (!open && blocker.status === 'blocked') blocker.reset();
        }}
        title={t('brandKits.leave.title')}
        body={t('brandKits.leave.body')}
        confirm={t('brandKits.leave.leave')}
        cancel={t('brandKits.leave.stay')}
        danger
        onConfirm={() => {
          if (blocker.status === 'blocked') blocker.proceed();
        }}
      />
    </>
  );
}

/** `/brands/$brandKitId` (S24 frame 3): name, colours, files and profile of one kit. */
export function BrandKitPage({ brandKitId }: { brandKitId: string }) {
  const { t } = useTranslation();
  const kit = useBrandKit(brandKitId);

  let body;
  if (kit.notFound) {
    body = (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <h1 className="text-fg text-2xl font-bold">
          {t('brandKits.notFound.title')}
        </h1>
        <p className="text-fg-muted">{t('brandKits.notFound.body')}</p>
        <Button asChild>
          <Link to="/brands">{t('brandKits.notFound.action')}</Link>
        </Button>
      </div>
    );
  } else if (kit.status === 'pending') {
    body = (
      <div
        role="status"
        aria-label={t('brandKits.loading')}
        className="flex flex-col gap-6"
      >
        <div className="bg-surface-muted h-10 w-1/3 animate-pulse rounded-md" />
        <div className="bg-surface-muted h-40 animate-pulse rounded-lg" />
        <div className="bg-surface-muted h-64 animate-pulse rounded-lg" />
      </div>
    );
  } else if (kit.status === 'error') {
    body = (
      <Alert
        variant="danger"
        action={
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => void kit.refetch()}
          >
            {t('common.retry')}
          </Button>
        }
      >
        {errorText(t, kit.error)}
      </Alert>
    );
  } else {
    // A different kit starts with clean drafts.
    body = <Editor key={kit.data.id} kit={kit.data} />;
  }
  return <PageScroll className="max-w-[880px]">{body}</PageScroll>;
}
