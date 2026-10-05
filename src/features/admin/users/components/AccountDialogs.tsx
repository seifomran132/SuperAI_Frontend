import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import {
  adminUsersControllerSetAdminRoleMutation,
  adminUsersControllerSetStatusMutation,
} from '~/api/generated/@tanstack/react-query.gen';
import { Alert } from '~/components/ui/alert';
import { ReasonDialog } from '../../components/ReasonDialog';
import { invalidateUser } from '../model/queries';

interface DialogProps {
  userId: string;
  userName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Suspend (`target: suspended`) or reactivate (`active`) the account. */
export function StatusDialog({
  target,
  userId,
  ...rest
}: DialogProps & { target: 'suspended' | 'active' }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const mutation = useMutation(adminUsersControllerSetStatusMutation());
  const suspend = target === 'suspended';
  return (
    <ReasonDialog
      {...rest}
      title={t(
        suspend
          ? 'admin.overview.suspendTitle'
          : 'admin.overview.reactivateTitle',
      )}
      submitLabel={t(
        suspend ? 'admin.overview.suspend' : 'admin.overview.reactivate',
      )}
      danger={suspend}
      notice={
        <Alert variant={suspend ? 'warning' : 'info'}>
          {t(
            suspend
              ? 'admin.overview.suspendBody'
              : 'admin.overview.reactivateBody',
          )}
        </Alert>
      }
      onSubmit={async ({ reason }) => {
        const result = await mutation.mutateAsync({
          path: { id: userId },
          body: { reason, status: target },
        });
        await invalidateUser(queryClient, userId);
        toast.success(
          t(
            result.changed
              ? `admin.overview.done.${target === 'active' ? 'active' : 'suspended'}`
              : 'admin.overview.done.unchanged',
          ),
        );
      }}
    />
  );
}

/** Grant (`grant`) or remove the admin role. */
export function AdminRoleDialog({
  grant,
  userId,
  ...rest
}: DialogProps & { grant: boolean }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const mutation = useMutation(adminUsersControllerSetAdminRoleMutation());
  return (
    <ReasonDialog
      {...rest}
      title={t(
        grant ? 'admin.overview.grantTitle' : 'admin.overview.removeTitle',
      )}
      submitLabel={t(
        grant ? 'admin.overview.grantAdmin' : 'admin.overview.removeAdmin',
      )}
      danger={!grant}
      notice={
        <Alert variant="info">
          {t(grant ? 'admin.overview.grantBody' : 'admin.overview.removeBody')}
        </Alert>
      }
      onSubmit={async ({ reason }) => {
        const result = await mutation.mutateAsync({
          path: { id: userId },
          body: { reason, isAdmin: grant },
        });
        await invalidateUser(queryClient, userId);
        toast.success(
          t(
            result.changed
              ? `admin.overview.done.${grant ? 'granted' : 'removed'}`
              : 'admin.overview.done.unchanged',
          ),
        );
      }}
    />
  );
}
