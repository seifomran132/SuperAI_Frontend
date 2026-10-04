import { useState, type ReactNode } from 'react';
import { createFileRoute, notFound } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { TextLink } from '~/components/TextLink';
import { Alert } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { PasswordInput } from '~/components/ui/password-input';
import { AuthLayout } from '~/features/auth/AuthLayout';

// Temporary review gallery (F1). Dev-only: renders nothing in production builds.
// Copy is literal Arabic on purpose; real components take text via props/i18n.
export const Route = createFileRoute('/dev/ui')({
  beforeLoad: () => {
    if (!import.meta.env.DEV) throw notFound();
  },
  component: () => (import.meta.env.DEV ? <Gallery /> : null),
});

const schema = z.object({
  name: z.string().trim().min(1, 'أدخل اسمك الكامل'),
  email: z.email('أدخل بريدًا إلكترونيًا صحيحًا'),
  password: z.string().min(8, 'كلمة المرور قصيرة. استخدم 8 أحرف على الأقل'),
});
type DemoValues = z.infer<typeof schema>;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="grid gap-4">
      <h2 className="text-fg border-border-subtle border-b pb-2 text-lg font-bold">
        {title}
      </h2>
      {children}
    </section>
  );
}

function DemoForm() {
  const form = useForm<DemoValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '' },
  });
  const [busy, setBusy] = useState(false);
  const onSubmit = () => {
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      toast.success('تم الإرسال');
    }, 1200);
  };
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className="grid max-w-110 gap-5"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الاسم الكامل</FormLabel>
              <FormControl>
                <Input autoComplete="name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>البريد الإلكتروني</FormLabel>
              <FormControl>
                <Input dir="ltr" type="email" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>كلمة المرور</FormLabel>
              <FormControl>
                <PasswordInput autoComplete="new-password" {...field} />
              </FormControl>
              <FormDescription>8 أحرف على الأقل</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" loading={busy}>
          إنشاء حساب
        </Button>
      </form>
    </Form>
  );
}

function Gallery() {
  const retry = (
    <Button variant="secondary" size="sm">
      إعادة المحاولة
    </Button>
  );
  return (
    <div className="mx-auto grid max-w-4xl gap-10 p-6">
      <h1 className="text-2xl font-bold">معرض المكوّنات (للتطوير فقط)</h1>

      <Section title="الأزرار">
        <div className="flex flex-wrap items-center gap-3">
          <Button>أساسي</Button>
          <Button variant="secondary">ثانوي</Button>
          <Button variant="ghost">شفاف</Button>
          <Button variant="danger">خطر</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button loading>أساسي</Button>
          <Button variant="secondary" loading>
            ثانوي
          </Button>
          <Button variant="danger" loading>
            خطر
          </Button>
          <Button disabled>معطّل</Button>
          <Button variant="secondary" disabled>
            معطّل
          </Button>
          <Button size="sm">صغير 44</Button>
        </div>
      </Section>

      <Section title="الحقول">
        <div className="grid max-w-110 gap-5">
          <div className="grid gap-2">
            <Label htmlFor="g-default">افتراضي</Label>
            <Input id="g-default" placeholder="نص" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="g-hint">مع تلميح</Label>
            <Input id="g-hint" aria-describedby="g-hint-d" />
            <p id="g-hint-d" className="text-fg-muted text-sm">
              تلميح تحت الحقل
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="g-ltr">LTR (بريد)</Label>
            <Input
              id="g-ltr"
              dir="ltr"
              type="email"
              placeholder="name@example.com"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="g-err">خطأ</Label>
            <Input id="g-err" aria-invalid defaultValue="خطأ" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="g-dis">معطّل</Label>
            <Input id="g-dis" disabled defaultValue="معطّل" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="g-pw">كلمة المرور</Label>
            <PasswordInput id="g-pw" defaultValue="secret-pass" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="g-pw2">كلمة المرور (معطّل)</Label>
            <PasswordInput id="g-pw2" disabled defaultValue="secret-pass" />
          </div>
        </div>
      </Section>

      <Section title="التنبيهات">
        <div className="grid max-w-110 gap-3">
          <Alert variant="danger">
            البريد الإلكتروني أو كلمة المرور غير صحيحة.
          </Alert>
          <Alert variant="danger" action={retry}>
            تعذّر الاتصال. تحقق من اتصالك وحاول مرة أخرى.
          </Alert>
          <Alert variant="warning">
            محاولات كثيرة. انتظر قليلًا ثم حاول مرة أخرى.
          </Alert>
          <Alert
            variant="warning"
            action={
              <Button variant="secondary" size="sm">
                إعادة إرسال رابط التأكيد
              </Button>
            }
          >
            لم تؤكد بريدك الإلكتروني بعد. أرسلنا لك رابط التأكيد.
          </Alert>
          <Alert variant="success">تم تحديث كلمة المرور.</Alert>
          <Alert variant="success" action={<TextLink to="/">متابعة</TextLink>}>
            تم إنشاء الحساب.
          </Alert>
          <Alert variant="info">رسالة معلومات عامة.</Alert>
          <Alert variant="info" action={retry}>
            رسالة معلومات مع إجراء.
          </Alert>
        </div>
      </Section>

      <Section title="نموذج (react-hook-form + zod)">
        <DemoForm />
      </Section>

      <Section title="روابط وإشعارات">
        <div className="flex flex-wrap items-center gap-3">
          <TextLink to="/">رابط نصي</TextLink>
          <Button variant="secondary" onClick={() => toast.success('تم الحفظ')}>
            إشعار نجاح
          </Button>
          <Button
            variant="secondary"
            onClick={() => toast.error('تعذّر الاتصال')}
          >
            إشعار خطأ
          </Button>
          <Button variant="secondary" onClick={() => toast('إشعار عادي')}>
            إشعار عادي
          </Button>
        </div>
      </Section>

      <Section title="AuthLayout">
        <div className="border-border-subtle overflow-hidden rounded-lg border">
          <AuthLayout
            title="تسجيل الدخول"
            subtitle="مرحبًا بعودتك. أدخل بياناتك للمتابعة."
          >
            <div className="grid gap-5">
              <div className="grid gap-2">
                <Label htmlFor="a-email">البريد الإلكتروني</Label>
                <Input id="a-email" dir="ltr" type="email" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="a-pw">كلمة المرور</Label>
                <PasswordInput id="a-pw" />
              </div>
              <Button>تسجيل الدخول</Button>
              <TextLink to="/">إنشاء حساب</TextLink>
            </div>
          </AuthLayout>
        </div>
      </Section>
    </div>
  );
}
