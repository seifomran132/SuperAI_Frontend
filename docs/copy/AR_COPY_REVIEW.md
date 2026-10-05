# Arabic copy review

Generated from `src/i18n` by `npm run copy:table` — 704 strings. Do not edit the Arabic here: write the correction in **Notes**, and the frontend team applies it to `ar.json`.

- `{{name}}` parts are filled in by the app (brand name, amounts, dates); keep them as they are.
- `errors.*` strings are shown when the API returns that error code.
- Keys ending in `_one`, `_two`, `_few`, `_many`, `_other`, `_zero` are Arabic plural forms of one message.

## Contents

- [common](#common)
- [common.crash](#commoncrash)
- [common.newVersion](#commonnewversion)
- [auth.fields](#authfields)
- [auth](#auth)
- [auth.signIn](#authsignin)
- [auth.signUp](#authsignup)
- [auth.checkEmail](#authcheckemail)
- [auth.forgotPassword](#authforgotpassword)
- [auth.resetPassword](#authresetpassword)
- [auth.linkExpired](#authlinkexpired)
- [auth.callback](#authcallback)
- [auth.completeProfile](#authcompleteprofile)
- [auth.accountUnavailable](#authaccountunavailable)
- [auth.validation](#authvalidation)
- [contact](#contact)
- [authErrors](#autherrors)
- [shell](#shell)
- [shell.list](#shelllist)
- [chat](#chat)
- [chat.empty](#chatempty)
- [chat.composer](#chatcomposer)
- [chat.announce](#chatannounce)
- [chat.message](#chatmessage)
- [chat.list](#chatlist)
- [chat.notFound](#chatnotfound)
- [chat.notice](#chatnotice)
- [chat.requestBalance](#chatrequestbalance)
- [balance](#balance)
- [balance.activity](#balanceactivity)
- [account](#account)
- [account.profile](#accountprofile)
- [account.plan](#accountplan)
- [account.password](#accountpassword)
- [account.session](#accountsession)
- [plans](#plans)
- [admin.nav](#adminnav)
- [admin.titles](#admintitles)
- [admin](#admin)
- [admin.common](#admincommon)
- [admin.users](#adminusers)
- [admin.detail](#admindetail)
- [admin.overview](#adminoverview)
- [admin.subscription](#adminsubscription)
- [admin.balance](#adminbalance)
- [admin.dialog](#admindialog)
- [admin.catalog](#admincatalog)
- [admin.plans](#adminplans)
- [admin.providers](#adminproviders)
- [admin.models](#adminmodels)
- [admin.modes](#adminmodes)
- [admin.settings](#adminsettings)
- [errors](#errors)

## common

| Key | العربية | English | Notes |
|---|---|---|---|
| `loading` | جاري التحميل… | Loading… | |
| `retry` | إعادة المحاولة | Try again | |
| `unexpectedError` | حدث خطأ غير متوقع. حاول مرة أخرى. | Something went wrong. Try again. | |
| `networkError` | تعذّر الاتصال. تحقق من اتصالك وحاول مرة أخرى. | Couldn't connect. Check your connection and try again. | |
| `showPassword` | إظهار كلمة المرور | Show password | |
| `hidePassword` | إخفاء كلمة المرور | Hide password | |
| `notifications` | الإشعارات | Notifications | |
| `closeNotification` | إغلاق الإشعار | Close notification | |
| `notFound` | الصفحة غير موجودة | Page not found | |
| `backHome` | العودة إلى الرئيسية | Back to home | |
| `reload` | إعادة التحميل | Reload | |
| `goToChat` | الذهاب إلى المحادثات | Go to conversations | |
| `offline` | لا يوجد اتصال بالإنترنت. ستبقى رسالتك محفوظة، وأعد المحاولة عند عودة الاتصال. | You are offline. Your message stays saved; try again when the connection is back. | |

## common.crash

| Key | العربية | English | Notes |
|---|---|---|---|
| `title` | حدث خطأ غير متوقع | Something unexpected happened | |
| `body` | تعذّر عرض هذه الصفحة. أعد التحميل، وإن استمرت المشكلة فارجع إلى المحادثات. | This page could not be shown. Reload it, or go back to your conversations if it keeps happening. | |

## common.newVersion

| Key | العربية | English | Notes |
|---|---|---|---|
| `title` | نسخة جديدة متاحة | A new version is available | |
| `body` | تم تحديث التطبيق. أعد التحميل للمتابعة. | The app was updated. Reload to continue. | |

## auth.fields

| Key | العربية | English | Notes |
|---|---|---|---|
| `fullName` | الاسم الكامل | Full name | |
| `fullNamePlaceholder` | مثال: أحمد محمد | For example: Ahmed Mohamed | |
| `email` | البريد الإلكتروني | Email | |
| `emailPlaceholder` | name@example.com | name@example.com | |
| `password` | كلمة المرور | Password | |
| `newPassword` | كلمة المرور الجديدة | New password | |
| `confirmPassword` | تأكيد كلمة المرور | Confirm password | |
| `phone` | رقم الجوال | Phone number | |
| `phoneExample` | +966 50 123 4567 | +966 50 123 4567 | |
| `optional` | اختياري | Optional | |
| `passwordHint` | 8 أحرف على الأقل | At least 8 characters | |

## auth

| Key | العربية | English | Notes |
|---|---|---|---|
| `backToSignIn` | العودة لتسجيل الدخول | Back to sign in | |

## auth.signIn

| Key | العربية | English | Notes |
|---|---|---|---|
| `title` | تسجيل الدخول | Sign in | |
| `subtitle` | مرحبًا بعودتك. أدخل بياناتك للمتابعة. | Welcome back. Enter your details to continue. | |
| `forgotPassword` | نسيت كلمة المرور؟ | Forgot your password? | |
| `submit` | تسجيل الدخول | Sign in | |
| `noAccount` | ليس لديك حساب؟ | Don't have an account? | |
| `signUpLink` | إنشاء حساب | Create account | |
| `resendConfirmation` | إعادة إرسال رابط التأكيد | Resend confirmation link | |

## auth.signUp

| Key | العربية | English | Notes |
|---|---|---|---|
| `title` | إنشاء حساب | Create account | |
| `subtitle` | ابدأ باستخدام {{brandName}} في دقائق. | Start using {{brandName}} in minutes. | |
| `submit` | إنشاء حساب | Create account | |
| `haveAccount` | لديك حساب بالفعل؟ | Already have an account? | |
| `signInLink` | تسجيل الدخول | Sign in | |

## auth.checkEmail

| Key | العربية | English | Notes |
|---|---|---|---|
| `title` | تحقق من بريدك الإلكتروني | Check your email | |
| `signupSentTo` | أرسلنا رابط التأكيد إلى | We sent the confirmation link to | |
| `signupSent` | أرسلنا رابط التأكيد إلى بريدك الإلكتروني. | We sent the confirmation link to your email. | |
| `signupNext` | افتح الرسالة واضغط على الرابط لتفعيل حسابك. إن لم تجدها، تحقق من البريد غير المرغوب فيه. | Open the message and select the link to activate your account. If you can't find it, check your spam folder. | |
| `resetSentTo` | أرسلنا رابط إعادة تعيين كلمة المرور إلى | We sent a password reset link to | |
| `resetSent` | أرسلنا رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني. | We sent a password reset link to your email. | |
| `resetNext` | افتح الرسالة واضغط على الرابط لاختيار كلمة مرور جديدة. إن لم تجدها، تحقق من البريد غير المرغوب فيه. | Open the message and select the link to choose a new password. If you can't find it, check your spam folder. | |
| `resend` | إعادة الإرسال | Resend | |
| `resendIn` | إعادة الإرسال بعد {{seconds}} ثانية | Resend in {{seconds}} seconds | |
| `resent` | أُرسل الرابط مرة أخرى. | The link was sent again. | |

## auth.forgotPassword

| Key | العربية | English | Notes |
|---|---|---|---|
| `title` | نسيت كلمة المرور؟ | Forgot your password? | |
| `subtitle` | أدخل بريدك الإلكتروني وسنرسل لك رابطًا لإعادة تعيين كلمة المرور. | Enter your email and we'll send you a link to reset your password. | |
| `submit` | إرسال رابط إعادة التعيين | Send reset link | |

## auth.resetPassword

| Key | العربية | English | Notes |
|---|---|---|---|
| `title` | تعيين كلمة مرور جديدة | Set a new password | |
| `subtitle` | اختر كلمة مرور جديدة لحسابك. | Choose a new password for your account. | |
| `submit` | حفظ كلمة المرور | Save password | |
| `saved` | تم حفظ كلمة المرور. | Password saved. | |

## auth.linkExpired

| Key | العربية | English | Notes |
|---|---|---|---|
| `title` | انتهت صلاحية الرابط | The link has expired | |
| `newLink` | طلب رابط جديد | Request a new link | |
| `signupHint` | سجّل الدخول ثم اضغط «إعادة إرسال رابط التأكيد». | Sign in, then select "Resend confirmation link". | |

## auth.callback

| Key | العربية | English | Notes |
|---|---|---|---|
| `checking` | جاري التحقق من الرابط… | Checking the link… | |

## auth.completeProfile

| Key | العربية | English | Notes |
|---|---|---|---|
| `title` | أكمل ملفك | Complete your profile | |
| `subtitle` | أكمل ملفك قبل بدء المحادثة. | Complete your profile before you start chatting. | |
| `phoneHint` | بالصيغة الدولية، مثال: | In international format, for example: | |
| `submit` | متابعة | Continue | |

## auth.accountUnavailable

| Key | العربية | English | Notes |
|---|---|---|---|
| `suspendedTitle` | تم إيقاف حسابك مؤقتًا | Your account is temporarily suspended | |
| `suspendedBody` | لا يمكنك استخدام {{brandName}} حاليًا. تواصل معنا لمعرفة السبب أو لإعادة تفعيل الحساب. | You can't use {{brandName}} right now. Contact us to find out why or to reactivate your account. | |
| `deletedTitle` | تم حذف هذا الحساب | This account was deleted | |
| `deletedBody` | لم يعد هذا الحساب متاحًا. تواصل معنا إن كنت تعتقد أن هذا خطأ. | This account is no longer available. Contact us if you think this is a mistake. | |
| `back` | العودة | Back | |

## auth.validation

| Key | العربية | English | Notes |
|---|---|---|---|
| `nameRequired` | أدخل اسمك الكامل. | Enter your full name. | |
| `nameTooLong` | الاسم طويل جدًا. الحد الأقصى 100 حرف. | The name is too long. The maximum is 100 characters. | |
| `emailInvalid` | أدخل بريدًا إلكترونيًا صحيحًا. | Enter a valid email address. | |
| `passwordRequired` | أدخل كلمة المرور. | Enter your password. | |
| `passwordTooShort` | كلمة المرور قصيرة. استخدم 8 أحرف على الأقل. | The password is too short. Use at least 8 characters. | |
| `passwordMismatch` | كلمتا المرور غير متطابقتين. | The passwords don't match. | |
| `phoneInvalid` | أدخل رقم جوال صحيحًا بالصيغة الدولية. | Enter a valid phone number in international format. | |

## contact

| Key | العربية | English | Notes |
|---|---|---|---|
| `title` | طرق التواصل | Contact options | |
| `whatsapp` | واتساب | WhatsApp | |
| `email` | البريد الإلكتروني | Email | |
| `phone` | الهاتف | Phone | |

## authErrors

| Key | العربية | English | Notes |
|---|---|---|---|
| `invalidCredentials` | البريد الإلكتروني أو كلمة المرور غير صحيحة. | The email or password is incorrect. | |
| `emailNotConfirmed` | لم تؤكد بريدك الإلكتروني بعد. أرسلنا لك رابط التأكيد. | You haven't confirmed your email yet. We sent you the confirmation link. | |
| `weakPassword` | كلمة المرور ضعيفة. استخدم 8 أحرف على الأقل. | The password is too weak. Use at least 8 characters. | |
| `rateLimited` | محاولات كثيرة. انتظر قليلًا ثم حاول مرة أخرى. | Too many attempts. Wait a moment and try again. | |
| `otpExpired` | انتهت صلاحية الرابط أو استُخدم من قبل. اطلب رابطًا جديدًا. | The link has expired or was already used. Request a new one. | |
| `samePassword` | كلمة المرور الجديدة مطابقة للقديمة. اختر كلمة مختلفة. | The new password is the same as the old one. Choose a different password. | |

## shell

| Key | العربية | English | Notes |
|---|---|---|---|
| `openMenu` | فتح القائمة | Open menu | |
| `closeMenu` | إغلاق القائمة | Close menu | |
| `sidebarTitle` | القائمة الجانبية | Sidebar | |
| `newChat` | محادثة جديدة | New chat | |
| `recent` | المحادثات الأخيرة | Recent chats | |
| `balance` | الرصيد | Balance | |
| `account` | الحساب | Account | |
| `accountMenu` | قائمة الحساب | Account menu | |
| `signOut` | تسجيل الخروج | Sign out | |
| `writing` | يكتب… | Typing… | |

## shell.list

| Key | العربية | English | Notes |
|---|---|---|---|
| `loading` | جاري تحميل المحادثات | Loading chats | |
| `loadingMore` | جاري تحميل المزيد | Loading more | |
| `emptyTitle` | لا توجد محادثات بعد | No chats yet | |
| `emptyBody` | ابدأ محادثتك الأولى وستظهر هنا. | Start your first chat and it will show up here. | |
| `error` | تعذّر تحميل المحادثات. حاول مرة أخرى. | Couldn't load your chats. Try again. | |
| `moreError` | تعذّر تحميل المزيد. | Couldn't load more. | |

## chat

| Key | العربية | English | Notes |
|---|---|---|---|
| `balanceChip` | الرصيد | Balance | |

## chat.empty

| Key | العربية | English | Notes |
|---|---|---|---|
| `title` | كيف أساعدك اليوم؟ | How can I help you today? | |
| `subtitle` | اكتب سؤالك أو اختر فكرة للبدء. | Type a question or pick an idea to start. | |
| `chip1` | لخّص لي نصًا طويلًا في نقاط | Summarize a long text in bullet points | |
| `chip2` | اكتب رسالة رسمية باحترافية | Write a professional formal message | |
| `chip3` | اشرح لي مفهومًا بطريقة بسيطة | Explain a concept in simple terms | |
| `chip4` | ساعدني في كتابة كود بايثون | Help me write Python code | |

## chat.composer

| Key | العربية | English | Notes |
|---|---|---|---|
| `label` | رسالتك | Your message | |
| `placeholder` | اكتب رسالتك… | Type your message… | |
| `send` | إرسال | Send | |
| `sendOffline` | لا يوجد اتصال بالإنترنت | No internet connection | |
| `stop` | إيقاف | Stop | |
| `helper` | تُحتسب تكلفة كل رد من رصيدك حسب الوضع المستخدم. | Each answer is charged to your balance by the mode used. | |
| `mode` | الوضع | Mode | |
| `modeMenu` | اختيار الوضع | Choose a mode | |
| `noModes` | لا توجد أوضاع متاحة | No modes available | |

## chat.announce

| Key | العربية | English | Notes |
|---|---|---|---|
| `done` | اكتمل الرد | Answer complete | |
| `stopped` | تم إيقاف الرد | Answer stopped | |
| `cut` | توقف الرد قبل اكتماله | Answer was cut short | |
| `error` | تعذّر إكمال الرد | The answer could not be completed | |

## chat.message

| Key | العربية | English | Notes |
|---|---|---|---|
| `preparing` | جاري الإعداد… | Getting ready… | |
| `writing` | جاري كتابة الرد… | Writing the answer… | |
| `cut` | توقف الرد قبل اكتماله | The answer stopped before it was finished | |
| `failed` | تعذّر إكمال الرد. حاول مرة أخرى. | Couldn't finish the answer. Try again. | |
| `retry` | إعادة المحاولة | Try again | |
| `copy` | نسخ | Copy | |
| `copied` | تم النسخ | Copied | |
| `copyCode` | نسخ الكود | Copy code | |
| `codeRegion` | مقطع كود (قابل للتمرير) | Code block (scrollable) | |
| `tableRegion` | جدول (قابل للتمرير) | Table (scrollable) | |
| `cost` | التكلفة <cost/> | Cost <cost/> | |
| `costWithBalance` | التكلفة <cost/> · الرصيد المتبقي <balance/> | Cost <cost/> · Remaining balance <balance/> | |

## chat.list

| Key | العربية | English | Notes |
|---|---|---|---|
| `loading` | جاري تحميل الرسائل | Loading messages | |
| `error` | تعذّر تحميل الرسائل. حاول مرة أخرى. | Couldn't load messages. Try again. | |
| `loadingOlder` | جاري تحميل رسائل أقدم | Loading older messages | |
| `olderError` | تعذّر تحميل الرسائل الأقدم. | Couldn't load older messages. | |

## chat.notFound

| Key | العربية | English | Notes |
|---|---|---|---|
| `action` | بدء محادثة جديدة | Start a new chat | |

## chat.notice

| Key | العربية | English | Notes |
|---|---|---|---|
| `insufficient` | رصيدك غير كافٍ لهذه الرسالة في وضع «{{mode}}» (التكلفة المتوقعة <estimate/>، رصيدك <balance/>). | Your balance is too low for this message in “{{mode}}” mode (expected cost <estimate/>, your balance <balance/>). | |
| `switchTo` | التبديل إلى «{{mode}}» (<estimate/> تقريبًا) | Switch to “{{mode}}” (about <estimate/>) | |
| `requestBalance` | تواصل معنا لإضافة رصيد | Contact us to add balance | |
| `contactUs` | تواصل معنا | Contact us | |
| `busy` | لا يزال الرد السابق قيد الكتابة. | The previous answer is still being written. | |
| `rateLimited` | أرسلت رسائل كثيرة خلال وقت قصير. حاول بعد {{seconds}} ثانية. | You sent too many messages. Try again in {{seconds}} seconds. | |
| `rateLimitedStatic` | أرسلت رسائل كثيرة خلال وقت قصير. حاول بعد {{seconds}} ثانية. | You sent too many messages. Try again in {{seconds}} seconds. | |

## chat.requestBalance

| Key | العربية | English | Notes |
|---|---|---|---|
| `title` | طلب رصيد | Request balance | |
| `body` | تتم إضافة الرصيد وتفعيل الباقات من فريقنا. تواصل معنا بإحدى الطرق التالية وسنساعدك. | Our team adds balance and activates plans. Contact us in one of these ways and we will help. | |
| `close` | إغلاق | Close | |

## balance

| Key | العربية | English | Notes |
|---|---|---|---|
| `title` | الرصيد | Balance | |
| `available` | الرصيد المتاح | Available balance | |
| `note` | تُحتسب تكلفة كل رد من هذا الرصيد حسب الوضع المستخدم. | Each answer is charged from this balance according to the mode used. | |
| `request` | طلب رصيد | Request balance | |
| `plan` | باقتك: {{name}} | Your plan: {{name}} | |
| `expiry` | ينتهي رصيدك بانتهاء الباقة في {{date}} | Your balance expires when the plan ends on {{date}} | |
| `noPlan` | ليست لديك باقة نشطة. تواصل معنا للاشتراك. | You have no active plan. Contact us to subscribe. | |
| `contactUs` | تواصل معنا | Contact us | |
| `balanceError` | تعذّر تحميل الرصيد. تحقق من اتصالك ثم حاول مرة أخرى. | Could not load your balance. Check your connection and try again. | |

## balance.activity

| Key | العربية | English | Notes |
|---|---|---|---|
| `title` | سجل العمليات | Activity | |
| `balanceAfter` | الرصيد بعد العملية | Balance after | |
| `emptyTitle` | لا توجد عمليات بعد | No activity yet | |
| `emptyBody` | ستظهر هنا عمليات رصيدك واستخدامك عند حدوثها. | Your balance and usage activity will show up here. | |
| `error` | تعذّر تحميل سجل العمليات. تحقق من اتصالك ثم حاول مرة أخرى. | Could not load your activity. Check your connection and try again. | |
| `moreError` | تعذّر تحميل المزيد من العمليات. | Could not load more activity. | |
| `loading` | جاري تحميل العمليات | Loading activity | |
| `loadingMore` | جاري تحميل المزيد | Loading more | |
| `today` | اليوم | Today | |
| `yesterday` | أمس | Yesterday | |
| `types.subscription_credit` | رصيد الباقة | Plan balance | |
| `types.purchase` | إضافة رصيد | Balance added | |
| `types.usage_charge` | استخدام المحادثة | Chat usage | |
| `types.voucher_credit` | رصيد قسيمة | Voucher balance | |
| `types.refund` | استرداد | Refund | |
| `types.adjustment` | تعديل من الفريق | Adjustment by the team | |
| `types.expiry` | انتهاء الرصيد | Balance expired | |

## account

| Key | العربية | English | Notes |
|---|---|---|---|
| `title` | الحساب | Account | |
| `loadError` | تعذّر تحميل الحساب. تحقق من اتصالك ثم حاول مرة أخرى. | Could not load your account. Check your connection and try again. | |

## account.profile

| Key | العربية | English | Notes |
|---|---|---|---|
| `title` | الملف الشخصي | Profile | |
| `optional` | (اختياري) | (optional) | |
| `emailNote` | لا يمكن تغيير البريد الإلكتروني من هنا. | The email address cannot be changed here. | |
| `save` | حفظ | Save | |
| `saved` | تم حفظ التغييرات. | Changes saved. | |
| `failed` | تعذّر حفظ التغييرات. حاول مرة أخرى. | Could not save the changes. Try again. | |

## account.plan

| Key | العربية | English | Notes |
|---|---|---|---|
| `title` | الباقة | Plan | |
| `start` | تاريخ البدء | Start date | |
| `end` | تاريخ الانتهاء | End date | |
| `price` | السعر | Price | |
| `free` | مجاني | Free | |
| `perMonth` | / شهريًا | / month | |
| `modes` | الأوضاع المتاحة | Available modes | |
| `expiryNote` | ينتهي رصيدك بانتهاء الباقة. لتغيير الباقة أو تجديدها تواصل معنا. | Your balance expires when the plan ends. Contact us to change or renew it. | |
| `noPlan` | ليست لديك باقة نشطة. تواصل معنا للاشتراك. | You have no active plan. Contact us to subscribe. | |
| `contact` | تواصل معنا | Contact us | |
| `viewPlans` | عرض الباقات | View plans | |
| `error` | تعذّر تحميل الباقة. حاول مرة أخرى. | Could not load your plan. Try again. | |

## account.password

| Key | العربية | English | Notes |
|---|---|---|---|
| `title` | تغيير كلمة المرور | Change password | |
| `save` | حفظ كلمة المرور | Save password | |
| `saved` | تم تغيير كلمة المرور. | Password changed. | |

## account.session

| Key | العربية | English | Notes |
|---|---|---|---|
| `title` | الجلسة | Session | |
| `body` | سجّل خروجك من هذا الجهاز. | Sign out on this device. | |
| `signOut` | تسجيل الخروج | Sign out | |

## plans

| Key | العربية | English | Notes |
|---|---|---|---|
| `title` | الباقات | Plans | |
| `intro` | رصيد واحد مشترك لجميع الأوضاع، وتُحتسب تكلفة كل رد حسب الوضع والاستخدام الفعلي. الاشتراك وإضافة الرصيد عن طريق فريقنا. | One shared balance for all modes. Each answer is charged by mode and actual use. Plans and balance are added by our team. | |
| `free` | مجاني | Free | |
| `perMonth` | / شهريًا | / month | |
| `currentBalance` | الرصيد الحالي: | Current balance: | |
| `duration` | مدة الباقة شهر واحد من التفعيل، وينتهي الرصيد بانتهائها. | A plan lasts one month from activation, and the balance expires when it ends. | |
| `current` | باقتك الحالية | Your current plan | |
| `subscribe` | تواصل معنا للاشتراك | Contact us to subscribe | |
| `emptyTitle` | لا توجد باقات متاحة حاليًا | No plans available right now | |
| `emptyBody` | تواصل معنا لمعرفة الخيارات المتاحة. | Contact us to learn about the options. | |
| `error` | تعذّر تحميل الباقات. حاول مرة أخرى. | Could not load the plans. Try again. | |
| `loading` | جاري تحميل الباقات | Loading plans | |

## admin.nav

| Key | العربية | English | Notes |
|---|---|---|---|
| `users` | المستخدمون | Users | |
| `plans` | الباقات | Plans | |
| `providers` | المزوّدون | Providers | |
| `models` | النماذج | Models | |
| `modes` | الأوضاع | Modes | |
| `settings` | الإعدادات | Settings | |
| `backToApp` | العودة إلى التطبيق | Back to the app | |
| `panel` | لوحة الإدارة | Admin panel | |
| `menu` | قائمة الإدارة | Admin menu | |
| `openMenu` | فتح قائمة الإدارة | Open admin menu | |
| `closeMenu` | إغلاق القائمة | Close menu | |

## admin.titles

| Key | العربية | English | Notes |
|---|---|---|---|
| `users` | المستخدمون | Users | |
| `userDetail` | تفاصيل المستخدم | User details | |
| `plans` | الباقات | Plans | |
| `planNew` | باقة جديدة | New plan | |
| `planDetail` | تفاصيل الباقة | Plan details | |
| `providers` | المزوّدون | Providers | |
| `models` | النماذج | Models | |
| `modelNew` | نموذج جديد | New model | |
| `modelDetail` | تفاصيل النموذج | Model details | |
| `modes` | الأوضاع | Modes | |
| `modeNew` | وضع جديد | New mode | |
| `modeDetail` | تفاصيل الوضع | Mode details | |
| `settings` | الإعدادات | Settings | |

## admin

| Key | العربية | English | Notes |
|---|---|---|---|
| `entry` | لوحة الإدارة | Admin panel | |

## admin.common

| Key | العربية | English | Notes |
|---|---|---|---|
| `cancel` | إلغاء | Cancel | |
| `loading` | جاري التحميل | Loading | |
| `system` | النظام | System | |
| `none` | - | - | |
| `copy` | نسخ | Copy | |
| `copied` | تم النسخ | Copied | |

## admin.users

| Key | العربية | English | Notes |
|---|---|---|---|
| `search` | ابحث بالبريد الإلكتروني أو الاسم | Search by email or name | |
| `searchLabel` | بحث عن مستخدم | Search users | |
| `statusFilter` | الحالة | Status | |
| `roleFilter` | الصلاحية | Role | |
| `all` | الكل | All | |
| `status.active` | نشط | Active | |
| `status.suspended` | موقوف | Suspended | |
| `status.deleted` | محذوف | Deleted | |
| `role.admin` | مسؤول | Admin | |
| `role.user` | مستخدم | User | |
| `columns.email` | البريد الإلكتروني | Email | |
| `columns.name` | الاسم | Name | |
| `columns.status` | الحالة | Status | |
| `columns.role` | الصلاحية | Role | |
| `columns.lastSignIn` | آخر دخول | Last sign-in | |
| `columns.createdAt` | تاريخ التسجيل | Created | |
| `columns.actions` | إجراءات | Actions | |
| `rowActions` | إجراءات المستخدم | User actions | |
| `open` | فتح | Open | |
| `activatePlan` | تفعيل باقة | Activate plan | |
| `addFunds` | إضافة رصيد | Add funds | |
| `unnamed` | بدون اسم | No name | |
| `neverSignedIn` | لم يسجّل الدخول | Never signed in | |
| `emptyTitle` | لا يوجد مستخدمون مطابقون | No matching users | |
| `emptyBody` | غيّر البحث أو المرشحات وحاول مرة أخرى. | Change the search or filters and try again. | |
| `error` | تعذّر تحميل المستخدمين. | Couldn't load users. | |
| `range` | <n>{{from}}–{{to}}</n> من <n>{{total}}</n> | <n>{{from}}–{{to}}</n> of <n>{{total}}</n> | |
| `pageOf` | الصفحة {{page}} من {{pages}} | Page {{page}} of {{pages}} | |
| `prev` | الصفحة السابقة | Previous page | |
| `next` | الصفحة التالية | Next page | |
| `tableLabel` | جدول المستخدمين | Users table | |

## admin.detail

| Key | العربية | English | Notes |
|---|---|---|---|
| `breadcrumb` | مسار التنقل | Breadcrumb | |
| `emailConfirmed` | البريد مؤكد | Email confirmed | |
| `emailUnconfirmed` | البريد غير مؤكد | Email not confirmed | |
| `tabsLabel` | أقسام المستخدم | User sections | |
| `tabs.overview` | نظرة عامة | Overview | |
| `tabs.subscription` | الاشتراك | Subscription | |
| `tabs.balance` | الرصيد | Balance | |
| `notFoundTitle` | لم يتم العثور على المستخدم | User not found | |
| `backToUsers` | العودة إلى المستخدمين | Back to users | |
| `error` | تعذّر تحميل المستخدم. | Couldn't load the user. | |

## admin.overview

| Key | العربية | English | Notes |
|---|---|---|---|
| `facts` | بيانات الحساب | Account details | |
| `email` | البريد الإلكتروني | Email | |
| `name` | الاسم | Name | |
| `phone` | رقم الجوال | Phone | |
| `status` | الحالة | Status | |
| `role` | الصلاحية | Role | |
| `createdAt` | تاريخ التسجيل | Created | |
| `lastSignIn` | آخر دخول | Last sign-in | |
| `userId` | المعرّف | ID | |
| `actions` | إجراءات الحساب | Account actions | |
| `suspend` | إيقاف الحساب | Suspend account | |
| `reactivate` | إعادة التفعيل | Reactivate | |
| `grantAdmin` | منح صلاحية مسؤول | Grant admin role | |
| `removeAdmin` | إزالة الصلاحية | Remove admin role | |
| `suspendBody` | يخرج المستخدم من حسابه ولا يستطيع الدخول حتى تعيد تفعيله. | The user is signed out and cannot sign in until you reactivate the account. | |
| `reactivateBody` | يستعيد المستخدم الدخول إلى حسابه. | The user can sign in again. | |
| `grantBody` | يستطيع المسؤول الدخول إلى لوحة الإدارة وتغيير الباقات والأرصدة. | An admin can open the admin panel and change plans and balances. | |
| `removeBody` | يفقد المستخدم الدخول إلى لوحة الإدارة. | The user loses access to the admin panel. | |
| `suspendTitle` | إيقاف الحساب | Suspend account | |
| `reactivateTitle` | إعادة تفعيل الحساب | Reactivate account | |
| `grantTitle` | منح صلاحية مسؤول | Grant admin role | |
| `removeTitle` | إزالة صلاحية المسؤول | Remove admin role | |
| `done.suspended` | تم إيقاف الحساب | Account suspended | |
| `done.active` | تمت إعادة تفعيل الحساب | Account reactivated | |
| `done.granted` | تم منح صلاحية المسؤول | Admin role granted | |
| `done.removed` | تمت إزالة صلاحية المسؤول | Admin role removed | |
| `done.unchanged` | لا تغيير: القيمة محدّثة بالفعل | No change: already set | |

## admin.subscription

| Key | العربية | English | Notes |
|---|---|---|---|
| `current` | الباقة الحالية | Current plan | |
| `none` | لا توجد باقة نشطة | No active plan | |
| `noneBody` | يستخدم هذا المستخدم الباقة الافتراضية. | This user is on the default plan. | |
| `periodEnd` | ينتهي في | Ends on | |
| `noEnd` | بدون تاريخ انتهاء | No end date | |
| `included` | الرصيد المضمّن | Included balance | |
| `price` | السعر الشهري | Monthly price | |
| `activate` | تفعيل باقة | Activate plan | |
| `end` | إنهاء الباقة | End plan | |
| `history` | سجل الاشتراكات | Subscription history | |
| `historyEmptyTitle` | لا يوجد سجل اشتراكات | No subscription history | |
| `historyEmptyBody` | ستظهر هنا الباقات التي فُعّلت لهذا المستخدم. | Plans activated for this user appear here. | |
| `columns.plan` | الباقة | Plan | |
| `columns.status` | الحالة | Status | |
| `columns.source` | المصدر | Source | |
| `columns.started` | بدأت | Started | |
| `columns.end` | تنتهي / انتهت | Ends / ended | |
| `columns.included` | الرصيد المضمّن | Included balance | |
| `status.active` | نشطة | Active | |
| `status.replaced` | استُبدلت | Replaced | |
| `status.cancelled` | أُنهيت | Ended | |
| `status.expired` | انتهت | Expired | |
| `source.admin` | مسؤول | Admin | |
| `source.payment` | دفعة | Payment | |
| `source.system` | النظام | System | |
| `error` | تعذّر تحميل الاشتراكات. | Couldn't load subscriptions. | |
| `activateTitle` | تفعيل باقة | Activate plan | |
| `planLabel` | الباقة | Plan | |
| `planPlaceholder` | اختر الباقة | Choose a plan | |
| `planRequired` | اختر الباقة | Choose a plan | |
| `plansError` | تعذّر تحميل الباقات. | Couldn't load plans. | |
| `noPlans` | لا توجد باقات نشطة | No active plans | |
| `endDateLabel` | تاريخ الانتهاء (اختياري) | End date (optional) | |
| `endDateHint` | شهر واحد افتراضيًا | One month by default | |
| `endDatePast` | اختر تاريخًا في المستقبل | Choose a future date | |
| `activateSubmit` | تفعيل الباقة | Activate plan | |
| `endTitle` | إنهاء الباقة | End plan | |
| `endSubmit` | إنهاء الباقة | End plan | |
| `endWarning` | سينتهي كل رصيد المستخدم فورًا | All of the user's balance expires immediately | |
| `endWarningBody` | لا يمكن التراجع عن هذا الإجراء. | This cannot be undone. | |
| `activated` | تم تفعيل الباقة | Plan activated | |
| `ended` | تم إنهاء الباقة | Plan ended | |
| `credited` | أُضيف إلى الرصيد | Added to balance | |

## admin.balance

| Key | العربية | English | Notes |
|---|---|---|---|
| `available` | المتاح للإنفاق | Spendable | |
| `total` | الرصيد الكلي | Total balance | |
| `reserved` | محجوز لردود جارية | Held for answers in progress | |
| `error` | تعذّر تحميل الرصيد. | Couldn't load the balance. | |
| `ledger` | سجل العمليات | Ledger | |
| `ledgerEmptyTitle` | لا توجد عمليات بعد | No entries yet | |
| `ledgerEmptyBody` | ستظهر هنا كل حركة على رصيد المستخدم. | Every change to the user's balance appears here. | |
| `ledgerError` | تعذّر تحميل السجل. | Couldn't load the ledger. | |
| `loadMore` | تحميل المزيد | Load more | |
| `loadMoreError` | تعذّر تحميل المزيد. | Couldn't load more. | |
| `adjust` | إضافة أو خصم رصيد | Add or remove funds | |
| `recordPayment` | تسجيل دفعة | Record payment | |
| `columns.type` | النوع | Type | |
| `columns.amount` | المبلغ | Amount | |
| `columns.after` | الرصيد بعد العملية | Balance after | |
| `columns.actor` | المنفّذ | By | |
| `columns.reason` | السبب | Reason | |
| `columns.reference` | المرجع | Reference | |
| `columns.date` | التاريخ | Date | |
| `actor.admin` | مسؤول | Admin | |
| `actor.system` | النظام | System | |
| `actor.user` | المستخدم | User | |
| `actor.cli` | سطر الأوامر | Command line | |
| `adjustTitle` | إضافة أو خصم رصيد | Add or remove funds | |
| `amountLabel` | المبلغ | Amount | |
| `amountHint` | استخدم - للخصم | Use - to remove | |
| `currency` | USD | USD | |
| `amountInvalidSigned` | أدخل مبلغًا صحيحًا مثل 5.00 أو -2.50 | Enter a valid amount such as 5.00 or -2.50 | |
| `amountInvalid` | أدخل مبلغًا صحيحًا مثل 5.00 | Enter a valid amount such as 5.00 | |
| `amountZero` | يجب ألا يكون المبلغ صفرًا | The amount cannot be zero | |
| `amountTooLarge` | الحد الأقصى 10,000 دولار | Maximum is 10,000 USD | |
| `adjustSubmit` | تنفيذ | Apply | |
| `adjusted` | تم تعديل الرصيد | Balance updated | |
| `paymentTitle` | تسجيل دفعة | Record payment | |
| `referenceLabel` | مرجع الدفعة | Payment reference | |
| `referenceHint` | رقم الحوالة أو الفاتورة. لا يمكن تسجيل المرجع نفسه مرتين. | Transfer or invoice number. The same reference cannot be recorded twice. | |
| `referenceRequired` | مرجع الدفعة مطلوب | The payment reference is required | |
| `paymentSubmit` | تسجيل الدفعة | Record payment | |
| `recorded` | تم تسجيل الدفعة | Payment recorded | |
| `replayed` | هذه الدفعة مسجّلة من قبل، ولم يتغيّر الرصيد | This payment was already recorded; the balance did not change | |
| `types.subscription_credit` | رصيد الباقة | Plan balance | |
| `types.purchase` | تسجيل دفعة | Payment recorded | |
| `types.usage_charge` | استخدام المحادثة | Chat usage | |
| `types.voucher_credit` | رصيد قسيمة | Voucher credit | |
| `types.refund` | استرداد | Refund | |
| `types.adjustment` | تعديل يدوي | Manual adjustment | |
| `types.expiry` | انتهاء الرصيد | Balance expiry | |

## admin.dialog

| Key | العربية | English | Notes |
|---|---|---|---|
| `user` | المستخدم: {{name}} | User: {{name}} | |
| `reason` | السبب | Reason | |
| `reasonHint` | يُسجَّل في سجل التدقيق | Saved in the audit log | |
| `required` | مطلوب | required | |
| `close` | إغلاق | Close | |
| `reasonRequired` | السبب مطلوب | The reason is required | |
| `reasonShort` | اكتب 3 أحرف على الأقل | Write at least 3 characters | |
| `reasonLong` | الحد الأقصى 500 حرف | Maximum 500 characters | |
| `failed` | تعذّر تنفيذ الإجراء | The action failed | |
| `fieldInvalid` | القيمة غير صحيحة | This value is not valid | |
| `submit` | تنفيذ | Confirm | |
| `keyReused` | تم تغيير بيانات العملية. أعد الإرسال لاستخدام مفتاح جديد. | The action details changed. Submit again to use a new key. | |

## admin.catalog

| Key | العربية | English | Notes |
|---|---|---|---|
| `save` | حفظ التغييرات | Save changes | |
| `enable` | تفعيل | Enable | |
| `disable` | تعطيل | Disable | |
| `enabled` | مفعّل | Enabled | |
| `disabled` | معطّل | Disabled | |
| `active` | نشطة | Active | |
| `inactive` | غير نشطة | Inactive | |
| `nameAr` | الاسم بالعربية | Name (Arabic) | |
| `nameEn` | الاسم بالإنجليزية | Name (English) | |
| `labelAr` | الاسم الظاهر بالعربية | Label (Arabic) | |
| `labelEn` | الاسم الظاهر بالإنجليزية | Label (English) | |
| `descriptionAr` | الوصف بالعربية | Description (Arabic) | |
| `descriptionEn` | الوصف بالإنجليزية | Description (English) | |
| `sortOrder` | الترتيب | Sort order | |
| `keyHint` | من 2 إلى 32 حرفًا: أحرف إنجليزية صغيرة وأرقام و - و _. لا يمكن تغييره لاحقًا. | 2 to 32 characters: lowercase letters, digits, - and _. Cannot be changed later. | |
| `keyInvalid` | استخدم من 2 إلى 32 حرفًا: أحرف إنجليزية صغيرة وأرقام و - و _ | Use 2 to 32 characters: lowercase letters, digits, - and _ | |
| `required` | هذا الحقل مطلوب | This field is required | |
| `decimalInvalid` | أدخل مبلغًا صحيحًا، مثل 10 أو 4.75 | Enter a valid amount, like 10 or 4.75 | |
| `integerInvalid` | أدخل عددًا صحيحًا موجبًا ضمن الحد المسموح | Enter a positive whole number within the limit | |
| `sortInvalid` | أدخل عددًا صحيحًا من 0 إلى 1000 | Enter a whole number from 0 to 1000 | |
| `percentInvalid` | أدخل نسبة بين 0 و 500 | Enter a percentage between 0 and 500 | |
| `keyReserved` | هذا المفتاح محجوز، اختر مفتاحًا آخر | This key is reserved, choose another | |

## admin.plans

| Key | العربية | English | Notes |
|---|---|---|---|
| `new` | باقة جديدة | New plan | |
| `tableLabel` | قائمة الباقات | Plans | |
| `error` | تعذّر تحميل الباقات. | Could not load plans. | |
| `detailError` | تعذّر تحميل الباقة. | Could not load the plan. | |
| `emptyTitle` | لا توجد باقات | No plans | |
| `emptyBody` | أنشئ أول باقة لتظهر للعملاء. | Create the first plan so customers can see it. | |
| `notFoundTitle` | الباقة غير موجودة | Plan not found | |
| `backToList` | العودة إلى الباقات | Back to plans | |
| `columns.name` | الباقة | Plan | |
| `columns.price` | السعر الشهري | Monthly price | |
| `columns.included` | الرصيد المضمّن | Included balance | |
| `columns.modes` | الأوضاع | Modes | |
| `columns.status` | الحالة | Status | |
| `columns.subscribers` | المشتركون النشطون | Active subscribers | |
| `public` | معروضة للعملاء | Public | |
| `hidden` | مخفية | Hidden | |
| `default` | الافتراضية | Default | |
| `formTitle` | بيانات الباقة | Plan details | |
| `key` | المفتاح | Key | |
| `monthlyPrice` | السعر الشهري (بالدولار) | Monthly price (USD) | |
| `includedBalance` | الرصيد المضمّن شهريًا (بالدولار) | Monthly included balance (USD) | |
| `newSubscriptionsOnly` | يسري على الاشتراكات الجديدة فقط. | Applies to new subscriptions only. | |
| `isPublic` | معروضة في صفحة الباقات | Listed on the plans page | |
| `isPublicHint` | تظهر للعملاء في قائمة الباقات العامة. | Customers see it in the public plans list. | |
| `isActive` | نشطة | Active | |
| `isActiveHint` | الباقة غير النشطة لا يمكن تعيينها لمستخدمين جدد. | An inactive plan cannot be assigned to new users. | |
| `isDefault` | الباقة الافتراضية | Default plan | |
| `isDefaultHint` | تصبح باقة المستخدمين بلا اشتراك، وتتوقف الباقة الافتراضية الحالية. | Becomes the plan of users without a subscription; the current default stops being the default. | |
| `isDefaultCurrent` | هذه هي الباقة الافتراضية. اجعل باقة أخرى افتراضية لتغييرها. | This is the default plan. Make another plan the default to change it. | |
| `createTitle` | إنشاء الباقة | Create plan | |
| `createSubmit` | إنشاء الباقة | Create plan | |
| `saveTitle` | حفظ تغييرات الباقة | Save plan changes | |
| `created` | تم إنشاء الباقة | Plan created | |
| `saved` | تم حفظ الباقة | Plan saved | |
| `modes` | الأوضاع المضمّنة | Included modes | |
| `noModes` | لا توجد أوضاع بعد. | No modes yet. | |
| `modesTitle` | الأوضاع في الباقة | Modes in this plan | |
| `modesSave` | حفظ الأوضاع | Save modes | |
| `modesSaved` | تم حفظ أوضاع الباقة | Plan modes saved | |

## admin.providers

| Key | العربية | English | Notes |
|---|---|---|---|
| `add` | إضافة مزوّد | Add provider | |
| `tableLabel` | قائمة المزوّدين | Providers | |
| `error` | تعذّر تحميل المزوّدين. | Could not load providers. | |
| `emptyTitle` | لا يوجد مزوّدون | No providers | |
| `emptyBody` | أضف مزوّدًا متوافقًا مع OpenAI للبدء. | Add an OpenAI-compatible provider to start. | |
| `columns.provider` | المزوّد | Provider | |
| `columns.kind` | النوع | Kind | |
| `columns.baseUrl` | عنوان الواجهة | Base URL | |
| `columns.status` | الحالة | Status | |
| `columns.key` | المفتاح | Key | |
| `columns.actions` | إجراءات | Actions | |
| `noKey` | لا يوجد مفتاح | No key | |
| `setKey` | تعيين المفتاح | Set key | |
| `replaceKey` | استبدال المفتاح | Replace key | |
| `removeKey` | إزالة المفتاح | Remove key | |
| `setKeyTitle` | تعيين مفتاح المزوّد | Set provider key | |
| `setKeySubmit` | حفظ المفتاح | Save key | |
| `keyLabel` | مفتاح الواجهة البرمجية | API key | |
| `keyHint` | يتحقق النظام من المفتاح لدى المزوّد قبل حفظه، ولن يظهر مرة أخرى. | The key is checked with the provider before saving and is never shown again. | |
| `keyRequired` | أدخل المفتاح | Enter the key | |
| `keySaved` | تم حفظ المفتاح | Key saved | |
| `removeKeyTitle` | إزالة مفتاح المزوّد | Remove provider key | |
| `removeKeySubmit` | إزالة المفتاح | Remove key | |
| `removeKeyWarning` | بعد الإزالة تتوقف الأوضاع التي تعتمد على هذا المزوّد عن العمل حتى تعيّن مفتاحًا جديدًا. | Modes that use this provider stop working until you set a new key. | |
| `keyRemoved` | تمت إزالة المفتاح | Key removed | |
| `enableTitle` | تفعيل المزوّد | Enable provider | |
| `disableTitle` | تعطيل المزوّد | Disable provider | |
| `enabled` | تم تفعيل المزوّد | Provider enabled | |
| `disabled` | تم تعطيل المزوّد | Provider disabled | |
| `addTitle` | إضافة مزوّد | Add provider | |
| `addDescription` | مزوّد متوافق مع OpenAI. | An OpenAI-compatible provider. | |
| `addSubmit` | إضافة المزوّد | Add provider | |
| `added` | تمت إضافة المزوّد | Provider added | |
| `code` | الرمز | Code | |
| `displayName` | الاسم | Name | |
| `baseUrl` | عنوان الواجهة (Base URL) | Base URL | |
| `baseUrlHint` | جذر الواجهة، مثل https://api.example.com/v1 | API root, like https://api.example.com/v1 | |
| `baseUrlInvalid` | أدخل عنوانًا يبدأ بـ http:// أو https:// | Enter an address starting with http:// or https:// | |
| `keyInvalidFormat` | المفتاح من 8 إلى 500 حرف بلا مسافات | The key is 8 to 500 characters with no spaces | |

## admin.models

| Key | العربية | English | Notes |
|---|---|---|---|
| `new` | نموذج جديد | New model | |
| `tableLabel` | قائمة النماذج | Models | |
| `error` | تعذّر تحميل النماذج. | Could not load models. | |
| `detailError` | تعذّر تحميل النموذج. | Could not load the model. | |
| `emptyTitle` | لا توجد نماذج | No models | |
| `emptyBody` | أضف نموذجًا ثم حدّد سعره. | Add a model, then set its price. | |
| `notFoundTitle` | النموذج غير موجود | Model not found | |
| `backToList` | العودة إلى النماذج | Back to models | |
| `columns.model` | النموذج | Model | |
| `columns.provider` | المزوّد | Provider | |
| `columns.context` | نافذة السياق | Context window | |
| `columns.maxOutput` | أقصى إخراج | Max output | |
| `columns.margin` | الهامش | Margin | |
| `columns.thinking` | التفكير | Thinking | |
| `columns.status` | الحالة | Status | |
| `columns.modes` | الأوضاع | Modes | |
| `columns.price` | السعر الحالي لكل مليون | Current price per 1M | |
| `inShort` | دخل | In | |
| `outShort` | خرج | Out | |
| `noPriceShort` | بلا سعر | No price | |
| `marginDefault` | الافتراضي | Default | |
| `marginOverrideShort` | مخصص | Custom | |
| `thinkingOptions.off` | متوقف | Off | |
| `thinkingOptions.low` | منخفض | Low | |
| `thinkingOptions.default` | افتراضي | Default | |
| `formTitle` | بيانات النموذج | Model details | |
| `provider` | المزوّد | Provider | |
| `providerPlaceholder` | اختر المزوّد | Choose a provider | |
| `providerModelId` | معرّف النموذج لدى المزوّد | Provider model id | |
| `providerModelIdHint` | لا يمكن تغييره لاحقًا. | Cannot be changed later. | |
| `displayName` | الاسم الداخلي | Internal name | |
| `displayNameHint` | للإدارة فقط، ولا يظهر للمستخدمين. | For admins only; never shown to users. | |
| `thinking` | التفكير | Thinking | |
| `thinkingHint` | تُحتسب رموز التفكير كرموز إخراج. | Thinking tokens are billed as output. | |
| `contextWindow` | نافذة السياق (رموز) | Context window (tokens) | |
| `maxOutput` | أقصى رموز الإخراج | Max output tokens | |
| `maxOutputTooLarge` | يجب ألا يتجاوز أقصى الإخراج نافذة السياق | Max output must not exceed the context window | |
| `marginOverride` | هامش خاص بالنموذج (%) | Model margin (%) | |
| `marginOverrideHint` | اتركه فارغًا لاستخدام الهامش الافتراضي. | Leave empty to use the default margin. | |
| `enabledHint` | لا يمكن تعطيله ما دام وضع مفعّل يعتمد عليه. | Cannot be disabled while an enabled mode uses it. | |
| `createTitle` | إضافة النموذج | Add model | |
| `createSubmit` | إضافة النموذج | Add model | |
| `saveTitle` | حفظ تغييرات النموذج | Save model changes | |
| `created` | تمت إضافة النموذج | Model added | |
| `saved` | تم حفظ النموذج | Model saved | |
| `pricesTitle` | الأسعار | Prices | |
| `pricesError` | تعذّر تحميل الأسعار. | Could not load prices. | |
| `pricesEmpty` | لم يُحدَّد أي سعر بعد. | No price has been set yet. | |
| `noPrice` | لا يوجد سعر ساري الآن، ولن تعمل الأوضاع التي تعتمد على هذا النموذج. | No price is in effect, so modes using this model will not work. | |
| `currentPrice` | (الساري) | (current) | |
| `priceSchedule` | جدولة سعر جديد | Schedule a new price | |
| `priceTitle` | جدولة سعر جديد | Schedule a new price | |
| `priceSubmit` | حفظ السعر | Save price | |
| `priceSaved` | تم حفظ السعر | Price saved | |
| `priceColumns.from` | من | From | |
| `priceColumns.to` | إلى | To | |
| `priceColumns.input` | الدخل | Input | |
| `priceColumns.output` | الخرج | Output | |
| `priceColumns.cached` | دخل مخزّن | Cached input | |
| `priceColumns.cacheWrite` | كتابة المخزّن | Cache write | |
| `inputPrice` | سعر الدخل | Input price | |
| `outputPrice` | سعر الخرج | Output price | |
| `cachedPrice` | سعر الدخل المخزّن | Cached input price | |
| `cacheWritePrice` | سعر كتابة المخزّن | Cache write price | |
| `perMillion` | بالدولار لكل مليون رمز. | USD per 1M tokens. | |
| `cachedHint` | اتركه فارغًا لاستخدام سعر الدخل. بالدولار لكل مليون رمز. | Leave empty to use the input price. USD per 1M tokens. | |
| `effectiveFrom` | يسري من | Effective from | |
| `effectiveFromHint` | بتوقيت جهازك. اتركه فارغًا ليسري الآن، ولا يمكن أن يكون في الماضي. | In your device time. Leave empty to start now; cannot be in the past. | |
| `effectivePast` | اختر وقتًا في المستقبل | Choose a time in the future | |
| `test.title` | اختبار النموذج | Test model | |
| `test.intro` | يرسل طلبًا حقيقيًا إلى المزوّد ويُحتسب عليك. | Sends a real request to the provider, and you are charged for it. | |
| `test.open` | اختبار النموذج | Test model | |
| `test.confirmTitle` | اختبار النموذج | Test model | |
| `test.confirmSubmit` | إرسال الطلب المدفوع | Send paid request | |
| `test.paidWarning` | هذا طلب حقيقي مدفوع | This is a real, paid request | |
| `test.paidWarningBody` | سيُرسل الطلب إلى المزوّد وتُحتسب تكلفته عليك، ولا يُخصم من أي رصيد مستخدم. | The request goes to the provider and its cost is charged to you. No user balance is charged. | |
| `test.prompt` | نص الاختبار | Test prompt | |
| `test.promptHint` | اتركه فارغًا لاستخدام نص قصير افتراضي. | Leave empty for a short default prompt. | |
| `test.maxOutput` | أقصى رموز الإخراج | Max output tokens | |
| `test.maxOutputHint` | اجعله صغيرًا لتقليل التكلفة. | Keep it small to limit the cost. | |
| `test.ok` | أجاب النموذج. | The model answered. | |
| `test.failed` | فشل الاختبار. | The test failed. | |
| `test.reply` | الرد | Reply | |
| `test.finishReason` | سبب الانتهاء | Finish reason | |
| `test.providerCost` | تكلفة المزوّد | Provider cost | |
| `test.customerCharge` | ما يُحتسب على العميل | Customer charge | |
| `test.firstChunk` | زمن أول نص | Time to first text | |
| `test.duration` | الزمن الكلي | Total time | |
| `test.inputTokens` | رموز الدخل | Input tokens | |
| `test.cachedTokens` | رموز دخل مخزّنة | Cached input tokens | |
| `test.cacheWriteTokens` | رموز كتابة المخزّن | Cache write tokens | |
| `test.outputTokens` | رموز الخرج | Output tokens | |
| `test.promptTooLong` | النص أطول من 500 حرف | The prompt is longer than 500 characters | |
| `test.maxOutputInvalid` | أدخل عددًا من 1 إلى 256 | Enter a number from 1 to 256 | |

## admin.modes

| Key | العربية | English | Notes |
|---|---|---|---|
| `new` | وضع جديد | New mode | |
| `tableLabel` | قائمة الأوضاع | Modes | |
| `error` | تعذّر تحميل الأوضاع. | Could not load modes. | |
| `detailError` | تعذّر تحميل الوضع. | Could not load the mode. | |
| `emptyTitle` | لا توجد أوضاع | No modes | |
| `emptyBody` | أنشئ وضعًا واربطه بنموذج. | Create a mode and link it to a model. | |
| `notFoundTitle` | الوضع غير موجود | Mode not found | |
| `backToList` | العودة إلى الأوضاع | Back to modes | |
| `columns.mode` | الوضع | Mode | |
| `columns.ready` | الجاهزية | Readiness | |
| `columns.model` | النموذج | Model | |
| `columns.status` | الحالة | Status | |
| `columns.sort` | الترتيب | Order | |
| `ready` | جاهز | Ready | |
| `notReady` | غير جاهز | Not ready | |
| `reasons.NO_MODEL` | لم يُربط بنموذج. | No model is linked. | |
| `reasons.MODEL_DISABLED` | النموذج معطّل. | The model is disabled. | |
| `reasons.PROVIDER_DISABLED` | المزوّد معطّل. | The provider is disabled. | |
| `reasons.NO_API_KEY` | لا يوجد مفتاح للمزوّد. | The provider has no key. | |
| `reasons.NO_CURRENT_PRICE` | لا يوجد سعر ساري للنموذج. | The model has no price in effect. | |
| `noModel` | بلا نموذج | No model | |
| `formTitle` | بيانات الوضع | Mode details | |
| `key` | المفتاح | Key | |
| `model` | النموذج | Model | |
| `modelHint` | لا يمكن ترك الوضع المفعّل بلا نموذج. | An enabled mode cannot be left without a model. | |
| `noModelOption` | بلا نموذج | No model | |
| `modelRequiredToEnable` | اختر نموذجًا قبل تفعيل الوضع | Choose a model before enabling the mode | |
| `systemPrompt` | تعليمات النظام الخاصة بالوضع | Mode system prompt | |
| `systemPromptHint` | اتركها فارغة لاستخدام التعليمات الافتراضية من الإعدادات. لا تظهر للمستخدمين. | Leave empty to use the default prompt from settings. Never shown to users. | |
| `enabledHint` | يتطلب نموذجًا مفعّلًا ومزوّدًا مفعّلًا وسعرًا ساريًا. | Needs an enabled model, an enabled provider and a price in effect. | |
| `createTitle` | إنشاء الوضع | Create mode | |
| `createSubmit` | إنشاء الوضع | Create mode | |
| `saveTitle` | حفظ تغييرات الوضع | Save mode changes | |
| `created` | تم إنشاء الوضع | Mode created | |
| `saved` | تم حفظ الوضع | Mode saved | |

## admin.settings

| Key | العربية | English | Notes |
|---|---|---|---|
| `marginTitle` | الهامش الافتراضي | Default margin | |
| `marginBody` | نسبة تُضاف إلى تكلفة المزوّد عند احتساب ما يدفعه العميل. | Percentage added to the provider cost when working out what a customer pays. | |
| `marginLabel` | الهامش الافتراضي (%) | Default margin (%) | |
| `marginHint` | من 0 إلى 500. يمكن تخصيص هامش مختلف لكل نموذج. | From 0 to 500. A model can have its own margin. | |
| `marginConfirm` | حفظ الهامش الافتراضي | Save default margin | |
| `marginConfirmBody` | يؤثر على أسعار النماذج التي ليس لها هامش خاص. | Affects the prices of models without their own margin. | |
| `marginError` | تعذّر تحميل الهامش. | Could not load the margin. | |
| `promptTitle` | تعليمات النظام الافتراضية | Default system prompt | |
| `promptBody` | تُرسل إلى كل وضع ليس له تعليمات خاصة. لا تظهر للمستخدمين. | Sent in every mode without its own prompt. Never shown to users. | |
| `promptLabel` | التعليمات | Prompt | |
| `promptCounter` | {{count}} / {{max}} | {{count}} / {{max}} | |
| `promptTooLong` | التعليمات أطول من الحد المسموح | The prompt is longer than allowed | |
| `promptConfirm` | حفظ التعليمات الافتراضية | Save default prompt | |
| `promptConfirmBody` | تسري على المحادثات الجديدة. | Applies to new conversations. | |
| `promptError` | تعذّر تحميل التعليمات. | Could not load the prompt. | |
| `saved` | تم حفظ الإعدادات | Settings saved | |
| `promptRequired` | التعليمات مطلوبة | The prompt is required | |

## errors

| Key | العربية | English | Notes |
|---|---|---|---|
| `ACCOUNT_DELETED` | تم حذف هذا الحساب. | This account has been deleted. | |
| `ACCOUNT_NOT_ACTIVE` | حساب المستخدم غير نشط. | The user's account is not active. | |
| `ACCOUNT_NOT_FOUND` | لم يتم العثور على حسابك. يرجى التواصل مع الدعم. | Your account was not found. Please contact support. | |
| `ACCOUNT_SUSPENDED` | تم إيقاف حسابك مؤقتًا. يرجى التواصل مع الدعم. | Your account is suspended. Please contact support. | |
| `CANNOT_MODIFY_SELF` | لا يمكنك تنفيذ هذا الإجراء على حسابك. | You can't do this to your own account. | |
| `CONTENT_BLOCKED` | تعذّر إكمال الرد بسبب سياسة المحتوى. جرّب صياغة مختلفة. | The answer was stopped by the content policy. Try rephrasing. | |
| `CONTEXT_TOO_LONG` | الرسالة طويلة جدًا لهذا الوضع. يرجى اختصارها. | This message is too long for this mode. Please shorten it. | |
| `CONVERSATION_BUSY` | لا يزال الرد السابق قيد الكتابة. انتظر حتى ينتهي. | The previous answer is still being written. Please wait for it to finish. | |
| `CONVERSATION_NOT_FOUND` | لم يتم العثور على المحادثة. | Conversation not found. | |
| `DEFAULT_PLAN_REQUIRED` | يجب أن تكون هناك باقة افتراضية دائمًا. | There must always be a default plan. | |
| `DUPLICATE_REQUEST` | تم إرسال هذه الرسالة بالفعل. | This message was already sent. | |
| `EMAIL_NOT_CONFIRMED` | لم يؤكد المستخدم بريده الإلكتروني بعد. | The user hasn't confirmed their email yet. | |
| `FORBIDDEN` | ليست لديك صلاحية لتنفيذ هذا الإجراء. | You don't have permission to do this. | |
| `IDEMPOTENCY_KEY_REUSED` | استُخدم هذا المفتاح لعملية مختلفة. أنشئ مفتاحًا جديدًا. | This key was already used for a different operation. Generate a new one. | |
| `INSUFFICIENT_BALANCE` | رصيدك غير كافٍ لهذه الرسالة. | Your balance is not enough for this message. | |
| `INVALID_TOKEN` | انتهت جلستك. يرجى تسجيل الدخول مرة أخرى. | Your session has expired. Please sign in again. | |
| `LAST_ADMIN` | لا يمكن إزالة آخر مسؤول. | The last admin can't be removed. | |
| `MODEL_ALREADY_EXISTS` | هذا النموذج مضاف بالفعل لهذا المزوّد. | This model already exists for the provider. | |
| `MODEL_IN_USE` | هناك أوضاع مفعّلة تعتمد عليه. عطّلها أو انقلها إلى نموذج آخر أولًا. | Enabled modes depend on it. Disable them or move them to another model first. | |
| `MODEL_NOT_FOUND` | لم يتم العثور على النموذج. | Model not found. | |
| `MODE_ALREADY_EXISTS` | يوجد وضع بهذا المفتاح بالفعل. | A mode with this key already exists. | |
| `MODE_NOT_AVAILABLE` | هذا الوضع غير متاح في باقتك الحالية. | This mode is not available on your current plan. | |
| `MODE_NOT_FOUND` | لم يتم العثور على الوضع. | Mode not found. | |
| `NO_ACTIVE_SUBSCRIPTION` | ليست لديك باقة نشطة. تواصل معنا للاشتراك. | You don't have an active plan. Contact us to subscribe. | |
| `PAYMENT_REFERENCE_REUSED` | رقم الدفعة هذا مسجّل بالفعل بمبلغ أو مستخدم مختلف. | This payment reference is already recorded with a different amount or user. | |
| `PLAN_ALREADY_EXISTS` | توجد باقة بهذا المفتاح بالفعل. | A plan with this key already exists. | |
| `PLAN_NOT_ACTIVE` | الباقة غير نشطة. | The plan is not active. | |
| `PLAN_NOT_FOUND` | لم يتم العثور على الباقة. | Plan not found. | |
| `PRICE_PERIOD_CONFLICT` | يتعارض هذا السعر مع سعر آخر مجدول. | This price conflicts with another scheduled price. | |
| `PROFILE_INCOMPLETE` | يرجى إكمال ملفك الشخصي (الاسم الكامل) قبل بدء المحادثة. | Please complete your profile (full name) before chatting. | |
| `PROVIDER_ALREADY_EXISTS` | يوجد مزوّد بهذا الرمز بالفعل. | A provider with this code already exists. | |
| `PROVIDER_ERROR` | حدث خطأ أثناء إنشاء الرد. يرجى المحاولة مرة أخرى. | Something went wrong while writing the answer. Please try again. | |
| `PROVIDER_KEY_INVALID` | رفض المزوّد مفتاح الواجهة البرمجية. | The provider rejected the API key. | |
| `PROVIDER_KEY_NOT_USED` | هذا المزوّد لا يستخدم مفتاحًا. | This provider doesn't use a key. | |
| `PROVIDER_MISCONFIGURED` | إعداد مزوّد الذكاء الاصطناعي غير صحيح (المفتاح أو النموذج). | The AI provider is misconfigured (key or model). | |
| `PROVIDER_NOT_FOUND` | لم يتم العثور على المزوّد. | Provider not found. | |
| `PROVIDER_TIMEOUT` | استغرق الرد وقتًا أطول من المتوقع. يرجى المحاولة مرة أخرى. | The answer took too long. Please try again. | |
| `PROVIDER_UNAVAILABLE` | الخدمة مشغولة حاليًا. يرجى المحاولة بعد قليل. | The service is busy right now. Please try again shortly. | |
| `RATE_LIMITED` | أرسلت رسائل كثيرة خلال وقت قصير. انتظر قليلًا ثم حاول مرة أخرى. | You're sending messages too quickly. Please wait a moment and try again. | |
| `UNAUTHENTICATED` | يرجى تسجيل الدخول للمتابعة. | Please sign in to continue. | |
| `USER_NOT_FOUND` | لم يتم العثور على المستخدم. | User not found. | |
| `VALIDATION_FAILED` | بعض البيانات غير صحيحة. يرجى المراجعة والمحاولة مرة أخرى. | Some information is invalid. Please check and try again. | |
