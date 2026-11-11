# Arabic copy review

Generated from `src/i18n` by `npm run copy:table` — 1884 strings. Do not edit the Arabic here: write the correction in **Notes**, and the frontend team applies it to `ar.json`.

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
- [chat.emptyImage](#chatemptyimage)
- [chat.composer](#chatcomposer)
- [chat.announce](#chatannounce)
- [chat.message](#chatmessage)
- [chat.list](#chatlist)
- [chat.notFound](#chatnotfound)
- [chat.notice](#chatnotice)
- [chat.requestBalance](#chatrequestbalance)
- [chat.image](#chatimage)
- [chat.agent](#chatagent)
- [balance](#balance)
- [balance.redeem](#balanceredeem)
- [balance.activity](#balanceactivity)
- [account](#account)
- [account.profile](#accountprofile)
- [account.plan](#accountplan)
- [account.password](#accountpassword)
- [account.session](#accountsession)
- [plans](#plans)
- [usage](#usage)
- [usage.byMode](#usagebymode)
- [usage.chart](#usagechart)
- [usage.empty](#usageempty)
- [usage.designs](#usagedesigns)
- [reports.period](#reportsperiod)
- [reports.month](#reportsmonth)
- [reports.chart](#reportschart)
- [reports.state](#reportsstate)
- [legal](#legal)
- [admin.nav](#adminnav)
- [admin.titles](#admintitles)
- [admin.reports](#adminreports)
- [admin.common](#admincommon)
- [admin.users](#adminusers)
- [admin.detail](#admindetail)
- [admin.overview](#adminoverview)
- [admin.subscription](#adminsubscription)
- [admin.balance](#adminbalance)
- [admin.vouchers](#adminvouchers)
- [admin.dialog](#admindialog)
- [admin.catalog](#admincatalog)
- [admin.plans](#adminplans)
- [admin.providers](#adminproviders)
- [admin.models](#adminmodels)
- [admin.modes](#adminmodes)
- [admin.settings](#adminsettings)
- [admin.priceUpdates](#adminpriceupdates)
- [admin.agents](#adminagents)
- [landing.hero](#landinghero)
- [landing.modes](#landingmodes)
- [landing.balance](#landingbalance)
- [landing.plans](#landingplans)
- [landing.howTo](#landinghowto)
- [landing.faq](#landingfaq)
- [landing.closing](#landingclosing)
- [landing.footer](#landingfooter)
- [landing.privacy](#landingprivacy)
- [brandKits](#brandkits)
- [brandKits.newDialog](#brandkitsnewdialog)
- [brandKits.notFound](#brandkitsnotfound)
- [brandKits.draftNote](#brandkitsdraftnote)
- [brandKits.identity](#brandkitsidentity)
- [brandKits.colors](#brandkitscolors)
- [brandKits.assets](#brandkitsassets)
- [brandKits.profile](#brandkitsprofile)
- [brandKits.unsaved](#brandkitsunsaved)
- [brandKits.leave](#brandkitsleave)
- [brandKits.delete](#brandkitsdelete)
- [designs](#designs)
- [designs.formats](#designsformats)
- [designs.download](#designsdownload)
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
| `emailExists` | هذا البريد الإلكتروني مسجّل بالفعل. سجّل الدخول أو استعد كلمة المرور. | This email is already registered. Sign in or reset your password. | |

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
| `usage` | استهلاكي | My usage | |
| `accountMenu` | قائمة الحساب | Account menu | |
| `signOut` | تسجيل الخروج | Sign out | |
| `writing` | يكتب… | Typing… | |
| `adminEntry` | لوحة الإدارة | Admin panel | |
| `brands` | علاماتي التجارية | My brands | |
| `designs` | تصاميمي | My designs | |

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

## chat.emptyImage

| Key | العربية | English | Notes |
|---|---|---|---|
| `title` | صِف الصورة التي تريدها | Describe the image you want | |
| `hint` | أرفق صورة لتعديلها | Attach an image to edit it | |
| `chip1` | شعار بسيط لمقهى | A simple logo for a coffee shop | |
| `chip2` | منظر غروب على البحر | A calm sunset over the sea | |
| `chip3` | رسم توضيحي لطفل يقرأ | An illustration of a child reading | |
| `chip4` | أيقونة لتطبيق طقس | An icon for a weather app | |

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
| `region` | الرسائل | Messages | |

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

## chat.image

| Key | العربية | English | Notes |
|---|---|---|---|
| `attach` | إرفاق صورة | Attach an image | |
| `drop` | أفلت الصورة هنا | Drop the image here | |
| `dropHint` | صورة JPG أو PNG أو WebP، حتى 5 ميغابايت. | JPG, PNG or WebP image, up to 5 MB. | |
| `remove` | إزالة الصورة | Remove the image | |
| `uploading` | جاري رفع الصورة… | Uploading the image… | |
| `uploaded` | تم رفع الصورة | Image uploaded | |
| `modeNotice` | هذا الوضع لا يقرأ الصور. اختر وضعًا آخر لإرسال الصور. | This mode can't read images. Choose another mode to send the images. | |
| `readsImages` | يقرأ الصور | Reads images | |
| `imageBadge` | صورة | Image | |
| `ratio` | نسبة الصورة | Image ratio | |
| `ratioAuto` | تلقائي | Auto | |
| `ratioSquare` | مربع | Square | |
| `ratioPortrait` | عمودي | Portrait | |
| `ratioLandscape` | أفقي | Landscape | |
| `ratioTall` | طولي | Tall | |
| `ratioWide` | عريض | Wide | |
| `creating` | جارٍ إنشاء الصورة… | Creating the image… | |
| `openFull` | فتح بالحجم الكامل | Open full size | |
| `download` | تنزيل | Download | |
| `downloadFailed` | تعذّر تنزيل الصورة. حاول مرة أخرى. | Couldn't download the image. Try again. | |
| `generatedAlt` | صورة أنشأها المساعد | Image created by the assistant | |
| `view` | عرض الصورة | View image | |
| `close` | إغلاق | Close | |
| `loading` | جاري تحميل الصورة | Loading the image | |
| `loadFailed` | تعذّر تحميل الصورة | The image couldn't be loaded | |
| `alt` | صورة | Image | |
| `errors.UPLOAD_FAILED` | تعذّر رفع الصورة. حاول مرة أخرى. | The image couldn't be uploaded. Try again. | |
| `limitHint` | يمكنك إرفاق حتى {{max}} صور | You can attach up to {{max}} images | |
| `attachedList` | الصور المرفقة | Attached images | |

## chat.agent

| Key | العربية | English | Notes |
|---|---|---|---|
| `group` | مهام متخصصة | Specialised tasks | |
| `startsNew` | يبدأ محادثة جديدة | Starts a new chat | |
| `starting` | جارٍ البدء… | Starting… | |
| `startError` | تعذّر بدء المحادثة. حاول مرة أخرى. | Couldn’t start the chat. Try again. | |
| `cardAction` | ابدأ | Start | |
| `send` | متابعة | Continue | |
| `skip` | تخطّي | Skip | |
| `orDescribe` | أو صِفه بكلماتك | Or describe it in your words | |
| `newBrand` | علامة جديدة | New brand | |
| `newBrandBody` | نجهّز هويتها معًا خطوة بخطوة | We set it up together step by step | |
| `limitReached` | وصلت إلى حد باقتك من الهويات. | You’ve reached your plan’s brand kit limit. | |
| `viewPlans` | عرض الباقات | See plans | |
| `looksGood` | يبدو جيدًا | Looks good | |
| `edit` | تعديل | Change | |
| `editLabel` | تعديل {{label}} | Change {{label}} | |
| `anotherBrand` | علامة أخرى | Another brand | |
| `noText` | بدون نص | No text | |
| `files_zero` | لا ملفات | No files | |
| `files_one` | ملف واحد | 1 file | |
| `files_two` | ملفان | — | |
| `files_few` | {{count}} ملفات | — | |
| `files_many` | {{count}} ملفًا | — | |
| `files_other` | {{count}} ملف | {{count}} files | |
| `noColors` | بدون ألوان | No colours | |
| `moved` | تغيّرت المحادثة، فعرضنا السؤال الأخير. | The conversation moved on, so here is the latest question. | |
| `networkError` | تعذّر الإرسال. تحقق من الاتصال وحاول مرة أخرى. | Couldn’t send. Check your connection and try again. | |
| `retry` | إعادة المحاولة | Retry | |
| `notAvailable` | هذا المساعد غير متاح في باقتك. | This assistant isn’t available on your plan. | |
| `newChat` | محادثة جديدة | New chat | |
| `fitsSome_one` | رصيدك يكفي لتصميم واحد من {{variants}}. | Your balance covers 1 design of {{variants}}. | |
| `fitsSome_two` | رصيدك يكفي لتصميمين من {{variants}}. | — | |
| `fitsSome_few` | رصيدك يكفي لـ {{count}} تصميمات من {{variants}}. | — | |
| `fitsSome_many` | رصيدك يكفي لـ {{count}} تصميمًا من {{variants}}. | — | |
| `fitsSome_other` | رصيدك يكفي لـ {{count}} تصميم من {{variants}}. | Your balance covers {{count}} designs of {{variants}}. | |
| `fitsNone` | رصيدك لا يكفي لهذا التصميم. | Your balance doesn’t cover this design. | |
| `balance` | الرصيد | Balance | |
| `requestBalance` | طلب رصيد | Request balance | |
| `uploadsPending` | انتظر حتى يكتمل رفع الملفات. | Wait for the files to finish uploading. | |
| `maxFiles` | يمكنك إرسال {{count}} ملفات على الأكثر. | You can send up to {{count}} files. | |
| `inputLabel` | إجابتك | Your answer | |
| `counter` | {{count}} / {{max}} | {{count}} / {{max}} | |
| `answering` | جارٍ الإرسال… | Sending… | |
| `create` | أنشئ التصاميم | Create the designs | |
| `createSome_one` | أنشئ تصميمًا واحدًا | Create 1 design | |
| `createSome_two` | أنشئ تصميمين | — | |
| `createSome_few` | أنشئ {{count}} تصاميم | — | |
| `createSome_many` | أنشئ {{count}} تصميمًا | — | |
| `createSome_other` | أنشئ {{count}} تصميم | Create {{count}} designs | |
| `editIt` | عدّله | Edit it | |
| `cancel` | إلغاء | Cancel | |
| `working` | جارٍ التصميم… | Designing… | |
| `workingCount` | {{done}} من {{total}} | {{done}} of {{total}} | |
| `leaveNote` | يمكنك مغادرة المحادثة والعودة؛ ستجد تصاميمك هنا. | You can leave the chat and come back; your designs will be here. | |
| `ready` | تصاميمك جاهزة | Your designs are ready | |
| `noResults` | لم يخرج تصميم هذه المرة. لم يُحتسب إلا ما نُفّذ. | No design came out this time. Only what ran was charged. | |
| `editDesign` | تعديل | Edit | |
| `editDesignLabel` | تعديل التصميم {{n}} | Edit design {{n}} | |
| `downloadLabel` | تنزيل التصميم {{n}} | Download design {{n}} | |
| `finishStepFirst` | أكمل الخطوة الحالية أولًا. | Finish the current step first. | |
| `notReady` | لا يمكن إنشاء التصاميم الآن. حاول لاحقًا. | Designs can't be made right now. Please try again later. | |
| `next` | ماذا بعد؟ | What next? | |
| `multipleHint` | اختر كل ما ينطبق. | Pick all that apply. | |
| `region.hint.product` | اسحب مربعًا حول المنتج الذي تريد استبداله. | Drag a box around the product you want replaced. | |
| `region.hint.logo` | اسحب مربعًا حول الشعار الذي تريد استبداله. | Drag a box around the logo you want replaced. | |
| `region.boxLabel.product` | المنتج | Product | |
| `region.boxLabel.logo` | الشعار | Logo | |
| `region.canvasLabel.product` | التصميم: حدّد مكان المنتج | The design: mark the product | |
| `region.canvasLabel.logo` | التصميم: حدّد مكان الشعار | The design: mark the logo | |
| `region.adjustHint` | حرّك المربع أو اسحب ركنًا لتغيير حجمه. | Move the box, or drag a corner to resize it. | |
| `region.reset` | إعادة التحديد | Redraw | |
| `region.skip` | تخطَّ — يجده المصمم | Skip — the designer finds it | |
| `region.tooSmall` | المربع صغير جدًا. اسحب مربعًا أكبر. | The box is too small. Drag a bigger one. | |
| `region.imageError` | تعذّر تحميل التصميم. | Couldn't load the design. | |
| `region.keyboard` | اختصارات لوحة المفاتيح | Keyboard shortcuts | |
| `region.keyboardHelp` | Enter: مربع في المنتصف. الأسهم: تحريك (مع Shift خطوة أكبر). Alt مع الأسهم: تغيير الحجم. Delete: إعادة التحديد. | Enter: a box in the middle. Arrows: move (Shift for bigger steps). Alt with arrows: resize. Delete: redraw. | |
| `region.announce` | المربع من اليسار {{x}}٪ ومن الأعلى {{y}}٪، عرضه {{width}}٪ وارتفاعه {{height}}٪. | Box {{x}}% from the left and {{y}}% from the top, {{width}}% wide and {{height}}% tall. | |
| `region.corner.nw` | الركن العلوي الأيسر | Top-left corner | |
| `region.corner.ne` | الركن العلوي الأيمن | Top-right corner | |
| `region.corner.sw` | الركن السفلي الأيسر | Bottom-left corner | |
| `region.corner.se` | الركن السفلي الأيمن | Bottom-right corner | |
| `region.otherLogo` | الشعار | Logo | |
| `region.thumbnail` | التصميم مع المكان المحدَّد | The design with the marked area | |

## balance

| Key | العربية | English | Notes |
|---|---|---|---|
| `title` | الرصيد | Balance | |
| `available` | الرصيد المتاح | Available balance | |
| `note` | تُحتسب تكلفة كل رد من هذا الرصيد حسب الوضع المستخدم. | Each answer is charged from this balance according to the mode used. | |
| `request` | طلب رصيد | Request balance | |
| `viewUsage` | عرض الاستهلاك | View usage | |
| `plan` | باقتك: {{name}} | Your plan: {{name}} | |
| `expiry` | ينتهي رصيدك بانتهاء الباقة في {{date}} | Your balance expires when the plan ends on {{date}} | |
| `noPlan` | ليست لديك باقة نشطة. تواصل معنا للاشتراك. | You have no active plan. Contact us to subscribe. | |
| `contactUs` | تواصل معنا | Contact us | |
| `balanceError` | تعذّر تحميل الرصيد. تحقق من اتصالك ثم حاول مرة أخرى. | Could not load your balance. Check your connection and try again. | |

## balance.redeem

| Key | العربية | English | Notes |
|---|---|---|---|
| `open` | لديك كود؟ | Have a code? | |
| `title` | لديك كود؟ | Have a code? | |
| `label` | الكود | Code | |
| `placeholder` | WELCOME5 | WELCOME5 | |
| `hint` | لا يهم حجم الأحرف. | Capital letters do not matter. | |
| `submit` | استخدام الكود | Use code | |
| `verifying` | جارٍ التحقق… | Checking… | |
| `close` | إغلاق | Close | |
| `empty` | اكتب الكود أولًا. | Enter the code first. | |
| `needsPlanExtra` | هذا الكود يضيف رصيدًا، والرصيد يحتاج إلى باقة نشطة. | This code adds balance, and balance needs an active plan. | |
| `viewPlans` | عرض الباقات | View plans | |
| `rateLimited` | أدخلت أكواد خاطئة كثيرة. انتظر قليلًا ثم حاول مرة أخرى. | You entered too many wrong codes. Wait a moment and try again. | |
| `wait_zero` | يمكنك المحاولة الآن. | — | |
| `wait_one` | يمكنك المحاولة بعد ثانية واحدة. | You can try again in {{count}} second. | |
| `wait_two` | يمكنك المحاولة بعد ثانيتين. | — | |
| `wait_few` | يمكنك المحاولة بعد {{count}} ثوانٍ. | — | |
| `wait_many` | يمكنك المحاولة بعد {{count}} ثانية. | — | |
| `wait_other` | يمكنك المحاولة بعد {{count}} ثانية. | You can try again in {{count}} seconds. | |
| `balanceAdded` | أُضيف <money/> إلى رصيدك. | <money/> was added to your balance. | |
| `trialActivated` | تم تفعيل باقة «{{plan}}» حتى {{date}}. | Your plan “{{plan}}” is active until {{date}}. | |
| `another` | استخدام كود آخر | Use another code | |

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
| `types.voucher_credit` | رصيد كود | Code credit | |
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

## usage

| Key | العربية | English | Notes |
|---|---|---|---|
| `title` | استهلاكي | My usage | |
| `messages` | الرسائل | Messages | |
| `charged` | المبلغ المخصوم | Amount charged | |
| `utcNote` | يُحسب الشهر بتوقيت UTC. | The month is counted in UTC. | |
| `loading` | جارٍ تحميل استهلاكك… | Loading your usage… | |
| `error` | تعذّر تحميل استهلاكك. تحقق من اتصالك ثم حاول مرة أخرى. | Could not load your usage. Check your connection and try again. | |

## usage.byMode

| Key | العربية | English | Notes |
|---|---|---|---|
| `title` | حسب الوضع | By mode | |
| `mode` | الوضع | Mode | |
| `share` | الحصة من المبلغ | Share of the amount | |
| `amount` | المبلغ | Amount | |
| `removed` | وضع محذوف | Removed mode | |

## usage.chart

| Key | العربية | English | Notes |
|---|---|---|---|
| `title` | الاستهلاك اليومي | Daily usage | |
| `amount` | المبلغ | Amount | |
| `aria` | رسم بياني للاستهلاك اليومي في {{month}} | Daily usage chart for {{month}} | |
| `emptyHint` | لم تُسجَّل أي رسائل في {{month}}. | No messages were recorded in {{month}}. | |

## usage.empty

| Key | العربية | English | Notes |
|---|---|---|---|
| `title` | لا يوجد استهلاك في هذا الشهر | No usage this month | |
| `body` | لم ترسل أي رسالة في {{month}}. اختر شهرًا آخر من القائمة أعلاه. | You did not send any messages in {{month}}. Pick another month above. | |
| `bodyCurrent` | لم ترسل أي رسالة في {{month}} بعد. ابدأ محادثة جديدة. | You have not sent any messages in {{month}} yet. Start a new chat. | |

## usage.designs

| Key | العربية | English | Notes |
|---|---|---|---|
| `title` | التصاميم | Designs | |
| `agent` | الوكيل | Agent | |
| `runs` | مرات التصميم | Design runs | |
| `designs` | التصاميم | Designs | |
| `note` | تُحسب التصاميم منفصلة عن إجمالي الرسائل. | Designs are counted apart from the message totals. | |

## reports.period

| Key | العربية | English | Notes |
|---|---|---|---|
| `label` | الفترة | Period | |
| `last7` | آخر 7 أيام | Last 7 days | |
| `last30` | آخر 30 يومًا | Last 30 days | |
| `last90` | آخر 90 يومًا | Last 90 days | |
| `custom` | فترة مخصصة | Custom range | |
| `from` | من | From | |
| `to` | إلى | To | |
| `apply` | تطبيق | Apply | |
| `utcNote` | الأيام بتوقيت UTC | Days are in UTC | |
| `datePlaceholder` | YYYY-MM-DD | YYYY-MM-DD | |
| `summary` | من {{from}} إلى {{to}} · {{days}} | From {{from}} to {{to}} · {{days}} | |
| `lastValid` | آخر فترة صالحة: من {{from}} إلى {{to}} | Last valid period: from {{from}} to {{to}} | |
| `days_zero` | {{count}} يوم | — | |
| `days_one` | يوم واحد | {{count}} day | |
| `days_two` | يومان | — | |
| `days_few` | {{count}} أيام | — | |
| `days_many` | {{count}} يومًا | — | |
| `days_other` | {{count}} يوم | {{count}} days | |
| `errors.invalid` | اكتب التاريخ بالشكل YYYY-MM-DD. | Write the date as YYYY-MM-DD. | |
| `errors.startAfterEnd` | يجب أن يكون تاريخ البداية قبل تاريخ النهاية أو مساويًا له. | The start date must be on or before the end date. | |
| `errors.tooLong` | أقصى فترة هي 366 يومًا. قصّر الفترة وحاول مرة أخرى. | The longest period is 366 days. Shorten it and try again. | |
| `errors.future` | لا يمكن اختيار تاريخ في المستقبل. | You cannot pick a date in the future. | |

## reports.month

| Key | العربية | English | Notes |
|---|---|---|---|
| `label` | الشهر | Month | |
| `previous` | الشهر السابق | Previous month | |
| `next` | الشهر التالي | Next month | |
| `choose` | اختيار الشهر | Choose a month | |

## reports.chart

| Key | العربية | English | Notes |
|---|---|---|---|
| `showTable` | عرض كجدول | Show as table | |
| `showChart` | عرض كرسم بياني | Show as chart | |
| `emptyTitle` | لا نشاط في هذه الفترة | No activity in this period | |
| `scrollHint` | مرّر أفقيًا لعرض باقي الأيام. | Scroll sideways to see the other days. | |
| `scrollRegion` | الرسم البياني، يمكن تمريره أفقيًا | Chart, scrolls sideways | |
| `views` | نوع الرسم | Chart type | |
| `date` | التاريخ | Date | |
| `today` | اليوم | Today | |

## reports.state

| Key | العربية | English | Notes |
|---|---|---|---|
| `loading` | جارٍ تحميل التقرير… | Loading the report… | |
| `errorTitle` | تعذّر تحميل التقرير | Couldn't load the report | |
| `errorBody` | تحقق من اتصالك ثم أعد المحاولة. | Check your connection and try again. | |

## legal

| Key | العربية | English | Notes |
|---|---|---|---|
| `privacyTitle` | سياسة الخصوصية | Privacy policy | |
| `privacyDescription` | كيف تتعامل {{brandName}} مع بياناتك: ما نجمعه، ولماذا، ومع من نشاركه، وأين يُحفظ، وكيف تطلب نسخة منه أو حذفه. | How {{brandName}} handles your data: what we collect, why, who we share it with, where it is kept, and how to get a copy or have it deleted. | |

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
| `priceUpdates` | تحديثات الأسعار | Price updates | |
| `overview` | نظرة عامة | Overview | |
| `flagged` | الطلبات المُعلَّمة | Flagged requests | |
| `audit` | سجل التدقيق | Audit log | |
| `priceUpdatesCount` | تحديثات الأسعار، {{n}} بانتظار المراجعة | Price updates, {{n}} waiting for review | |
| `vouchers` | الأكواد | Codes | |
| `agents` | المساعدون | Agents | |

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
| `vouchers` | الأكواد | Codes | |
| `voucherNew` | كود جديد | New code | |
| `voucherDetail` | تفاصيل الكود | Code details | |
| `settings` | الإعدادات | Settings | |
| `priceUpdates` | تحديثات الأسعار | Price updates | |
| `overview` | نظرة عامة | Overview | |
| `flagged` | الطلبات المُعلَّمة | Flagged requests | |
| `audit` | سجل التدقيق | Audit log | |
| `batchNew` | مجموعة جديدة | New batch | |
| `batchDetail` | تفاصيل المجموعة | Batch details | |
| `agents` | المساعدون | Agents | |
| `agentRuns` | تشغيلات المساعدين | Agent runs | |
| `agentRun` | تفاصيل التشغيل | Run detail | |

## admin.reports

| Key | العربية | English | Notes |
|---|---|---|---|
| `usage.loading` | جارٍ تحميل الاستهلاك… | Loading usage… | |
| `usage.error` | تعذّر تحميل استهلاك المستخدم. | Couldn't load this user's usage. | |
| `usage.totals.charged` | المحتسب على المستخدم | Charged to the user | |
| `usage.totals.providerCost` | تكلفة المزوّد | Provider cost | |
| `usage.totals.margin` | الهامش | Margin | |
| `usage.totals.requests` | الطلبات | Requests | |
| `usage.totals.flagged` | طلبات مُعلَّمة | Flagged requests | |
| `usage.totals.absorbed` | تكلفة متحمَّلة | Absorbed cost | |
| `usage.totals.absorbedHint` | تجاوزت المبلغ المحجوز ولم تُحتسب عليه | Went over the held amount and was not charged | |
| `usage.totals.inputTokens` | توكنات الإدخال | Input tokens | |
| `usage.totals.cachedTokens` | توكنات مخزّنة | Cached tokens | |
| `usage.totals.outputTokens` | توكنات الإخراج | Output tokens | |
| `usage.byMode` | حسب الوضع | By mode | |
| `usage.byModel` | حسب النموذج | By model | |
| `usage.columns.mode` | الوضع | Mode | |
| `usage.columns.model` | النموذج | Model | |
| `usage.columns.requests` | الطلبات | Requests | |
| `usage.columns.charged` | المحتسب | Charged | |
| `usage.columns.providerCost` | تكلفة المزوّد | Provider cost | |
| `usage.columns.margin` | الهامش | Margin | |
| `usage.emptyTitle` | لا يوجد استهلاك في هذه الفترة | No usage in this period | |
| `usage.emptyBody` | جرّب فترة أطول. | Try a longer period. | |
| `usage.daily` | الاستهلاك اليومي | Daily usage | |
| `usage.chartLabel` | رسم بياني للاستهلاك اليومي للمستخدم | Chart of the user's daily usage | |
| `usage.chartEmptyHint` | لم تُسجَّل أي طلبات بين {{from}} و{{to}}. | No requests between {{from}} and {{to}}. | |
| `usage.views.money` | المبالغ | Amounts | |
| `usage.views.moneyTitle` | المبالغ اليومية | Daily amounts | |
| `usage.views.requests` | الطلبات | Requests | |
| `usage.views.requestsTitle` | الطلبات اليومية | Daily requests | |
| `usage.recent` | أحدث طلبات المستخدم | The user's latest requests | |
| `usage.recentNote` | تظهر أحدث الطلبات بغض النظر عن الفترة المختارة. | The latest requests are shown whatever period is chosen. | |
| `usage.recentEmpty` | لا توجد طلبات لهذا المستخدم | No requests for this user | |
| `usage.recentError` | تعذّر تحميل طلبات المستخدم. | Couldn't load the user's requests. | |
| `requests.title` | الطلبات | Requests | |
| `requests.note` | هذا عدّاد للطلبات المُعلَّمة وليس قائمة مهام: لا يمكن بعد تعليم طلب على أنه روجع. | This is a count of flagged requests, not a to-do list: a request cannot be marked as reviewed yet. | |
| `requests.filterLabel` | حالة الطلب | Request status | |
| `requests.chips.all` | الكل | All | |
| `requests.chips.reconciliation_required` | مُعلَّمة | Flagged | |
| `requests.chips.reserved` | محجوزة | Held | |
| `requests.chips.settled` | مُسوّاة | Settled | |
| `requests.chips.released` | مُحرَّرة | Released | |
| `requests.status.reconciliation_required` | مُعلَّمة | Flagged | |
| `requests.status.reserved` | محجوزة | Held | |
| `requests.status.settled` | مُسوّاة | Settled | |
| `requests.status.released` | مُحرَّرة | Released | |
| `requests.source.estimated` | تقديري | Estimated | |
| `requests.source.provider` | من المزوّد | From provider | |
| `requests.columns.time` | الوقت | Time | |
| `requests.columns.user` | المستخدم | User | |
| `requests.columns.mode` | الوضع | Mode | |
| `requests.columns.model` | النموذج | Model | |
| `requests.columns.status` | الحالة | Status | |
| `requests.columns.source` | مصدر الاستهلاك | Usage source | |
| `requests.columns.reserved` | المحجوز | Held | |
| `requests.columns.charged` | المحتسب | Charged | |
| `requests.columns.providerCost` | تكلفة المزوّد | Provider cost | |
| `requests.columns.absorbed` | المتحمَّل | Absorbed | |
| `requests.loading` | جارٍ تحميل الطلبات… | Loading requests… | |
| `requests.error` | تعذّر تحميل الطلبات. | Couldn't load the requests. | |
| `requests.loadMore` | تحميل المزيد | Load more | |
| `requests.loadMoreError` | تعذّر تحميل المزيد من الطلبات. | Couldn't load more requests. | |
| `requests.emptyFlagged` | لا توجد طلبات مُعلَّمة | No flagged requests | |
| `requests.emptyFlaggedBody` | لا شيء يحتاج إلى مراجعة الآن. | Nothing needs a look right now. | |
| `requests.emptyOther` | لا توجد طلبات بهذه الحالة | No requests with this status | |
| `requests.emptyOtherBody` | جرّب حالة أخرى. | Try another status. | |
| `audit.title` | سجل التدقيق | Audit log | |
| `audit.loading` | جارٍ تحميل السجل… | Loading the log… | |
| `audit.error` | تعذّر تحميل سجل التدقيق. | Couldn't load the audit log. | |
| `audit.loadMore` | تحميل المزيد | Load more | |
| `audit.loadMoreError` | تعذّر تحميل المزيد من السجلات. | Couldn't load more entries. | |
| `audit.empty` | لا توجد سجلات | No entries | |
| `audit.emptyBody` | لا تغييرات مسجّلة في هذه الفترة. | No changes recorded in this period. | |
| `audit.emptyFiltered` | لا توجد سجلات مطابقة | No matching entries | |
| `audit.emptyFilteredBody` | غيّر الفلاتر أو امسحها. | Change the filters or clear them. | |
| `audit.oldValue` | القيمة السابقة | Old value | |
| `audit.newValue` | القيمة الجديدة | New value | |
| `audit.noOldValue` | لا توجد قيمة سابقة | No old value | |
| `audit.noNewValue` | لا توجد قيمة جديدة | No new value | |
| `audit.expand` | عرض التفاصيل | Show details | |
| `audit.collapse` | إخفاء التفاصيل | Hide details | |
| `audit.columns.time` | الوقت | Time | |
| `audit.columns.actor` | المنفِّذ | Done by | |
| `audit.columns.action` | الإجراء | Action | |
| `audit.columns.resource` | المورد | Resource | |
| `audit.columns.reason` | السبب | Reason | |
| `audit.columns.details` | التفاصيل | Details | |
| `audit.actorType.user` | مستخدم | User | |
| `audit.actorType.admin` | مسؤول | Admin | |
| `audit.actorType.system` | النظام | System | |
| `audit.actorType.cli` | سطر الأوامر | Command line | |
| `audit.filters.label` | فلاتر السجل | Log filters | |
| `audit.filters.action` | الإجراء | Action | |
| `audit.filters.resourceType` | نوع المورد | Resource type | |
| `audit.filters.resourceId` | معرّف المورد | Resource id | |
| `audit.filters.actorId` | معرّف المسؤول | Admin id | |
| `audit.filters.actorIdHint` | بصيغة UUID | A UUID | |
| `audit.filters.datesHint` | بدون تاريخ يُعرض السجل كاملًا (بتوقيت UTC). | With no dates, the whole log is shown (UTC). | |
| `audit.filters.apply` | تطبيق | Apply | |
| `audit.filters.clear` | مسح الفلاتر | Clear filters | |
| `audit.errors.actorId` | اكتب معرّفًا صحيحًا بصيغة UUID. | Enter a valid UUID. | |
| `overview.attention.title` | تحتاج إلى انتباه | Needs attention | |
| `overview.attention.flagged` | طلبات مُعلَّمة | Flagged requests | |
| `overview.attention.flaggedHelp` | محسوبة من تقدير أو تحمّلنا جزءًا من تكلفتها. العدد الحالي لكل الفترات. | Based on an estimate, or we absorbed part of the cost. The current count across all dates. | |
| `overview.attention.flaggedLink` | عرض الطلبات | View requests | |
| `overview.attention.flaggedZero` | لا توجد طلبات مُعلَّمة | No flagged requests | |
| `overview.attention.findings` | تحديثات أسعار مفتوحة | Open price updates | |
| `overview.attention.findingsHelp` | تغييرات في أسعار النماذج بانتظار مراجعتك. | Model price changes waiting for your review. | |
| `overview.attention.findingsLink` | عرض تحديثات الأسعار | View price updates | |
| `overview.attention.findingsZero` | لا توجد تحديثات أسعار مفتوحة | No open price updates | |
| `overview.money.charged` | المحصَّل | Charged | |
| `overview.money.chargedHelp` | ما خُصم من أرصدة المستخدمين | Deducted from users' balances | |
| `overview.money.cost` | تكلفة المزوّد | Provider cost | |
| `overview.money.costHelp` | ما دفعناه للمزوّدين | What we paid the providers | |
| `overview.money.margin` | الهامش | Margin | |
| `overview.money.marginHelp` | المحصَّل ناقص تكلفة المزوّد | Charged minus provider cost | |
| `overview.money.marginNegativeHelp` | أقل من التكلفة في هذه الفترة | Below cost in this period | |
| `overview.money.marginPercent` | نسبة الهامش: | Margin: | |
| `overview.money.absorbed` | المُمتَص | Absorbed | |
| `overview.money.absorbedHelp` | تكلفة زادت عن المبلغ المحجوز وتحمّلناها | Cost above the reserved amount that we covered | |
| `overview.users.title` | المستخدمون | Users | |
| `overview.users.total` | الإجمالي | Total | |
| `overview.users.totalHelp` | الحسابات غير المحذوفة | Accounts not deleted | |
| `overview.users.new` | جدد | New | |
| `overview.users.newHelp` | سجّلوا في الفترة | Signed up in the period | |
| `overview.users.active` | نشطون | Active | |
| `overview.users.activeHelp` | لديهم طلب واحد على الأقل في الفترة | At least one request in the period | |
| `overview.plans.title` | الباقات النشطة | Active plans | |
| `overview.plans.help` | اشتراكات نشطة الآن | Subscriptions active now | |
| `overview.plans.total` | الإجمالي | Total | |
| `overview.plans.empty` | لا توجد اشتراكات نشطة | No active subscriptions | |
| `overview.images.title` | الصور | Images | |
| `overview.images.created` | أُنشئت في الفترة | Created in the period | |
| `overview.images.uploaded` | رفعها المستخدمون | Uploaded by users | |
| `overview.chart.aria` | رسم بياني يومي للفترة المحددة، والقيم الدقيقة في عرض الجدول | Daily chart for the selected period; exact values are in the table view | |
| `overview.chart.emptyHint` | لم تُسجَّل أي رسائل بين {{from}} و{{to}}. | No messages were recorded between {{from}} and {{to}}. | |
| `overview.chart.views.money` | المبالغ | Amounts | |
| `overview.chart.views.requests` | الطلبات | Requests | |
| `overview.chart.views.users` | مستخدمون جدد | New users | |
| `overview.chart.titles.money` | المحصَّل مقابل تكلفة المزوّد | Charged vs provider cost | |
| `overview.chart.titles.requests` | الطلبات اليومية | Requests per day | |
| `overview.chart.titles.users` | المستخدمون الجدد يوميًا | New users per day | |
| `overview.chart.series.charged` | المحصَّل | Charged | |
| `overview.chart.series.cost` | تكلفة المزوّد | Provider cost | |
| `overview.chart.series.requests` | الطلبات | Requests | |
| `overview.chart.series.users` | مستخدمون جدد | New users | |
| `overview.tops.modes` | أكثر الأوضاع استخدامًا | Most used modes | |
| `overview.tops.models` | أكثر النماذج استخدامًا | Most used models | |
| `overview.tops.limit` | أعلى 10 | Top 10 | |
| `overview.tops.mode` | الوضع | Mode | |
| `overview.tops.model` | النموذج | Model | |
| `overview.tops.requests` | الطلبات | Requests | |
| `overview.tops.charged` | المحصَّل | Charged | |
| `overview.tops.empty` | لا توجد بيانات في هذه الفترة | No data in this period | |
| `designs.title` | التصاميم | Designs | |
| `designs.help` | تشغيلات «مصمم جرافيك»، منفصلة عن أرقام المحادثات. | Graphic designer runs, apart from the chat figures. | |
| `designs.runs` | التشغيلات | Runs | |
| `designs.designs` | التصاميم | Designs | |
| `designs.flagged` | للمراجعة | To review | |
| `designs.charged` | المحتسب | Charged | |
| `designs.cost` | تكلفة المزوّد | Provider cost | |
| `designs.margin` | الهامش | Margin | |
| `designs.absorbed` | الممتص | Absorbed | |
| `designs.userRuns` | عرض تشغيلات هذا المستخدم | View this user's runs | |
| `designs.toReview` | تشغيلات تصميم للمراجعة | Design runs to review | |
| `designs.toReviewHelp` | تشغيلات لم يُعرف استخدامها الفعلي فاحتُسبت تقديريًا. | Runs whose real usage was unknown, charged by estimate. | |
| `designs.toReviewZero` | لا تشغيلات للمراجعة. | No runs to review. | |
| `designs.toReviewLink` | عرض التشغيلات | View runs | |
| `runs.tableLabel` | تشغيلات المساعدين | Agent runs | |
| `runs.filterLabel` | الحالة | Status | |
| `runs.chips.all` | الكل | All | |
| `runs.chips.reconciliation_required` | تحتاج مراجعة | Needs review | |
| `runs.chips.reserved` | جارٍ | Running | |
| `runs.chips.settled` | تمّ | Done | |
| `runs.chips.released` | لم يكتمل | Not completed | |
| `runs.status.reconciliation_required` | تحتاج مراجعة | Needs review | |
| `runs.status.reserved` | جارٍ | Running | |
| `runs.status.settled` | تمّ | Done | |
| `runs.status.released` | لم يكتمل | Not completed | |
| `runs.kind.create` | إنشاء | Create | |
| `runs.kind.edit` | تعديل | Edit | |
| `runs.forUser` | تشغيلات المستخدم {{email}} | Runs of {{email}} | |
| `runs.clearUser` | كل المستخدمين | All users | |
| `runs.columns.date` | التاريخ | Date | |
| `runs.columns.user` | المستخدم | User | |
| `runs.columns.kind` | النوع | Kind | |
| `runs.columns.status` | الحالة | Status | |
| `runs.columns.designs` | التصاميم | Designs | |
| `runs.columns.charged` | المحتسب | Charged | |
| `runs.columns.cost` | تكلفة المزوّد | Provider cost | |
| `runs.designsOf` | {{designs}} من {{variants}} | {{designs}} of {{variants}} | |
| `runs.open` | فتح التشغيل | Open run | |
| `runs.loading` | جارٍ تحميل التشغيلات | Loading runs | |
| `runs.error` | تعذّر تحميل التشغيلات. | Could not load the runs. | |
| `runs.empty` | لا تشغيلات بعد. | No runs yet. | |
| `runs.emptyFiltered` | لا تشغيلات بهذه الحالة. | No runs with this status. | |
| `runs.loadMore` | تحميل المزيد | Load more | |
| `runs.back` | تشغيلات المساعدين | Agent runs | |
| `runs.reserved` | المحجوز | Held | |
| `runs.reservedHelp` | المبلغ الذي حُجز من رصيده عند البدء. | Held from the user's balance at the start. | |
| `runs.charged` | المحتسب | Charged | |
| `runs.chargedHelp` | لا يزيد عن المحجوز. | Never more than held. | |
| `runs.cost` | تكلفة المزوّد | Provider cost | |
| `runs.absorbed` | الممتص | Absorbed | |
| `runs.absorbedHelp` | تكلفة تحمّلناها فوق المحتسب. | Cost we carried above the charge. | |
| `runs.facts` | تفاصيل الطلب | Request | |
| `runs.user` | المستخدم | User | |
| `runs.conversation` | المحادثة | Conversation | |
| `runs.request` | طلب التصميم | Design request | |
| `runs.startedAt` | بدأ في | Started | |
| `runs.settledAt` | انتهى في | Ended | |
| `runs.copy` | نسخ {{label}} | Copy {{label}} | |
| `runs.copied` | تم النسخ. | Copied. | |
| `runs.steps` | خطوات التشغيل | Run steps | |
| `runs.stepsHelp` | كل استدعاء لنموذج، بالترتيب. | Every model call, in order. | |
| `runs.stepKind.prompt` | كتابة الوصف | Write the prompt | |
| `runs.stepKind.image` | إنشاء الصورة | Create the image | |
| `runs.stepKind.check` | فحص الصورة | Check the image | |
| `runs.stepVariant` | التصميم {{n}} | Design {{n}} | |
| `runs.retry` | محاولة أخرى | Retry | |
| `runs.stepStatus.started` | جارٍ | Running | |
| `runs.stepStatus.done` | تمّ | Done | |
| `runs.stepStatus.failed` | فشل | Failed | |
| `runs.stepColumns.step` | الخطوة | Step | |
| `runs.stepColumns.model` | النموذج | Model | |
| `runs.stepColumns.status` | الحالة | Status | |
| `runs.stepColumns.usage` | الاستخدام | Usage | |
| `runs.stepColumns.cost` | تكلفة المزوّد | Provider cost | |
| `runs.stepColumns.charge` | المحتسب | Charged | |
| `runs.stepColumns.error` | الخطأ | Error | |
| `runs.tokensIn` | إدخال {{n}} | In {{n}} | |
| `runs.tokensOut` | إخراج {{n}} | Out {{n}} | |
| `runs.estimated` | تقديري | Estimated | |
| `runs.notFound` | لم يُعثر على هذا التشغيل. | This run was not found. | |

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
| `tabs.usage` | الاستهلاك | Usage | |
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
| `types.voucher_credit` | رصيد كود | Voucher credit | |
| `types.refund` | استرداد | Refund | |
| `types.adjustment` | تعديل يدوي | Manual adjustment | |
| `types.expiry` | انتهاء الرصيد | Balance expiry | |

## admin.vouchers

| Key | العربية | English | Notes |
|---|---|---|---|
| `new` | إنشاء كود | Create code | |
| `backToList` | العودة إلى القائمة | Back to the list | |
| `tableLabel` | قائمة الأكواد | Codes | |
| `filter.label` | الحالة | Status | |
| `filter.all` | الكل | All | |
| `filter.active` | مفعّل | Enabled | |
| `filter.inactive` | موقوف | Stopped | |
| `columns.code` | الكود | Code | |
| `columns.kind` | النوع | Type | |
| `columns.value` | القيمة | Value | |
| `columns.usage` | الاستخدام | Used | |
| `columns.period` | الفترة | Period | |
| `columns.status` | الحالة | Status | |
| `kind.balance` | رصيد | Balance | |
| `kind.trial` | تجربة | Trial | |
| `kindHint.balance` | يضيف مبلغًا إلى رصيد المستخدم، ويحتاج باقة نشطة. | Adds an amount to the user's balance. Needs an active plan. | |
| `kindHint.trial` | يبدأ باقة لعدد من الأيام ويضيف رصيدها المضمَّن. | Starts a plan for a number of days and adds its included balance. | |
| `status.active` | فعّال | Active | |
| `status.notStarted` | لم يبدأ | Not started | |
| `status.expired` | منتهي | Expired | |
| `status.usedUp` | مستنفد | Used up | |
| `status.inactive` | متوقف | Stopped | |
| `days_zero` | {{count}} يوم | — | |
| `days_one` | يوم واحد | {{count}} day | |
| `days_two` | يومان | — | |
| `days_few` | {{count}} أيام | — | |
| `days_many` | {{count}} يومًا | — | |
| `days_other` | {{count}} يوم | {{count}} days | |
| `trialValue` | {{plan}} · {{days}} | {{plan}} · {{days}} | |
| `windowFrom` | من {{date}} | From {{date}} | |
| `windowTo` | حتى {{date}} | Until {{date}} | |
| `noEnd` | بلا نهاية | No end | |
| `emptyTitle` | لا توجد أكواد بعد | No codes yet | |
| `emptyBody` | أنشئ كودًا لمنح مستخدم رصيدًا أو باقة تجريبية. | Create a code to give a user balance or a trial plan. | |
| `emptyFiltered.active` | لا توجد أكواد مفعّلة | No enabled codes | |
| `emptyFiltered.inactive` | لا توجد أكواد متوقفة | No stopped codes | |
| `emptyFilteredBody` | غيّر الفلتر لعرض باقي الأكواد. | Change the filter to see the other codes. | |
| `showAll` | عرض الكل | Show all | |
| `error` | تعذّر تحميل الأكواد. تحقق من اتصالك بالإنترنت ثم حاول مرة أخرى. | Could not load the codes. Check your connection and try again. | |
| `loadMore` | تحميل المزيد | Load more | |
| `loadMoreError` | تعذّر تحميل المزيد. | Could not load more. | |
| `formTitle` | كود جديد | New code | |
| `kindLabel` | نوع الكود | Code type | |
| `amount` | المبلغ | Amount | |
| `amountHint` | أكبر من 0 وحتى 1000.00$ | Above 0 and up to $1000.00 | |
| `plan` | الباقة | Plan | |
| `planHint` | الباقات النشطة فقط، دون الباقة الافتراضية | Active plans only, except the default plan | |
| `planPlaceholder` | اختر الباقة | Choose a plan | |
| `planLoading` | جارٍ تحميل الباقات… | Loading plans… | |
| `planLoadError` | تعذّر تحميل الباقات. | Could not load the plans. | |
| `trialDays` | عدد الأيام | Days | |
| `trialDaysHint` | من 1 إلى 365 | From 1 to 365 | |
| `maxRedemptions` | عدد مرات الاستخدام | Number of uses | |
| `maxRedemptionsHint` | يستخدمه كل مستخدم مرة واحدة فقط. | Each user can use it once. | |
| `code` | الكود (اختياري) | Code (optional) | |
| `codeHint` | من 4 إلى 40 حرفًا إنجليزيًا أو رقمًا أو شرطة. اتركه فارغًا ليُنشأ كود تلقائيًا. | 4 to 40 letters, digits or dashes. Leave empty to generate one. | |
| `dateTimePlaceholder` | YYYY-MM-DD HH:mm | YYYY-MM-DD HH:mm | |
| `startsAt` | يبدأ في | Starts at | |
| `startsAtHint` | بتوقيت جهازك. الافتراضي: الآن. | In your device's time. Default: now. | |
| `endsAt` | ينتهي في | Ends at | |
| `endsAtHint` | بتوقيت جهازك. اتركه فارغًا ليبقى الكود بلا نهاية. | In your device's time. Leave empty for no end. | |
| `newUsersOnly` | للمستخدمين الجدد فقط | New users only | |
| `newUsersOnlyHint` | من لم تكن لهم باقة غير الباقة الافتراضية. | Users who never had a plan other than the default one. | |
| `note` | ملاحظة داخلية | Internal note | |
| `createSubmit` | إنشاء الكود | Create code | |
| `creating` | جارٍ الإنشاء… | Creating… | |
| `errors.amountInvalid` | اكتب مبلغًا أكبر من 0، بأرقام وفاصلة عشرية فقط. | Enter an amount above 0, digits and a decimal point only. | |
| `errors.amountTooLarge` | الحد الأقصى للمبلغ 1000.00$. | The maximum amount is $1000.00. | |
| `errors.planRequired` | اختر الباقة. | Choose a plan. | |
| `errors.daysInvalid` | اكتب عدد أيام صحيحًا من 1 إلى 365. | Enter a whole number of days from 1 to 365. | |
| `errors.limitInvalid` | اكتب عددًا صحيحًا بين 1 و1,000,000. | Enter a whole number between 1 and 1,000,000. | |
| `errors.limitBelowUsed` | لا يمكن أن يكون الحد أقل من عدد الاستخدامات الحالية ({{used}}). | The limit cannot be below the current number of uses ({{used}}). | |
| `errors.codeInvalid` | من 4 إلى 40 حرفًا إنجليزيًا أو رقمًا أو شرطة فقط. | 4 to 40 letters, digits or dashes only. | |
| `errors.dateInvalid` | التاريخ غير صحيح. | The date is not valid. | |
| `errors.endBeforeStart` | يجب أن يكون تاريخ الانتهاء بعد تاريخ البدء. | The end must be after the start. | |
| `errors.endInPast` | يجب أن يكون تاريخ الانتهاء في المستقبل. | The end must be in the future. | |
| `createdTitle` | تم إنشاء الكود | Code created | |
| `createdBody` | هذا هو الكود الجديد، انسخه وشاركه مع المستخدمين. | This is the new code. Copy it and share it with users. | |
| `copyCode` | نسخ الكود | Copy code | |
| `copied` | تم النسخ | Copied | |
| `copyFailed` | تعذّر النسخ، انسخه يدويًا | Could not copy. Copy it by hand. | |
| `openCode` | فتح الكود | Open code | |
| `createAnother` | إنشاء كود آخر | Create another code | |
| `notFoundTitle` | الكود غير موجود | Code not found | |
| `detailError` | تعذّر تحميل الكود. جرّب مرة أخرى أو ارجع إلى القائمة. | Could not load the code. Try again or go back to the list. | |
| `summary` | ملخص الكود | Code summary | |
| `summaryNote` | النوع والقيمة والباقة وتاريخ البدء لا تتغير بعد الإنشاء. | Type, value, plan and start date cannot change after creation. | |
| `createdAt` | تاريخ الإنشاء | Created | |
| `createdBy` | أنشأه | Created by | |
| `yes` | نعم | Yes | |
| `no` | لا | No | |
| `settings` | الإعدادات | Settings | |
| `removeEnd` | إزالة التاريخ | Remove date | |
| `limitHint` | الحد الأقصى للاستخدام: لا يقل عن عدد الاستخدامات الحالية ({{used}}). | Maximum uses: not below the current number of uses ({{used}}). | |
| `undo` | تراجع | Undo | |
| `saveTitle` | حفظ التغييرات | Save changes | |
| `changesIntro` | سيتم تغيير: | This will change: | |
| `changeEnd` | تاريخ الانتهاء | End date | |
| `changeEndRemoved` | إزالة تاريخ الانتهاء | Remove the end date | |
| `changeLimit` | عدد مرات الاستخدام | Number of uses | |
| `changeNote` | الملاحظة الداخلية | Internal note | |
| `saved` | تم حفظ التغييرات | Changes saved | |
| `deactivate` | إيقاف الكود | Stop code | |
| `activate` | تفعيل الكود | Enable code | |
| `deactivateBody` | سيظهر الكود للمستخدمين كأنه غير موجود. يمكنك تفعيله لاحقًا. | Users will see the code as if it did not exist. You can enable it again later. | |
| `activateBody` | سيعمل الكود من جديد ضمن فترته وحدّه الأقصى. | The code works again within its period and limit. | |
| `deactivated` | تم إيقاف الكود | Code stopped | |
| `activated` | تم تفعيل الكود | Code enabled | |
| `inactiveBanner` | هذا الكود متوقف. يظهر للمستخدمين كأنه غير موجود. | This code is stopped. Users see it as if it did not exist. | |
| `usedUpBanner` | تم استخدام الكود بالكامل ({{used}} / {{max}}). ارفع الحد الأقصى من الإعدادات إن أردت السماح بمزيد من الاستخدام. | The code is fully used ({{used}} / {{max}}). Raise the limit in the settings to allow more uses. | |
| `redemptions` | الاستخدامات | Uses | |
| `redemptionColumns.user` | المستخدم | User | |
| `redemptionColumns.date` | تاريخ الاستخدام | Date | |
| `redemptionColumns.credited` | الرصيد المضاف | Balance added | |
| `redemptionColumns.subscription` | الاشتراك | Subscription | |
| `redemptionsEmpty` | لم يستخدم أحد هذا الكود بعد | Nobody has used this code yet | |
| `redemptionsError` | تعذّر تحميل الاستخدامات. حاول مرة أخرى. | Could not load the uses. Try again. | |
| `batches.tabSingles` | أكواد فردية | Single codes | |
| `batches.tabBatches` | مجموعات الأكواد | Code batches | |
| `batches.new` | إنشاء مجموعة أكواد | Create code batch | |
| `batches.backToList` | العودة إلى المجموعات | Back to batches | |
| `batches.tableLabel` | قائمة مجموعات الأكواد | Code batches list | |
| `batches.columns.name` | الاسم | Name | |
| `batches.columns.kind` | النوع | Kind | |
| `batches.columns.value` | القيمة | Value | |
| `batches.columns.usage` | الاستخدام | Usage | |
| `batches.columns.total` | القيمة الإجمالية | Total value | |
| `batches.columns.status` | الحالة | Status | |
| `batches.columns.ends` | ينتهي في | Ends | |
| `batches.emptyTitle` | لا توجد مجموعات أكواد بعد | No code batches yet | |
| `batches.emptyBody` | أنشئ مجموعة لتوليد عدة أكواد دفعة واحدة وتسليمها لموزّع. | Create a batch to generate several codes at once and hand them to a reseller. | |
| `batches.emptyFiltered.active` | لا توجد مجموعات مفعّلة | No active batches | |
| `batches.emptyFiltered.inactive` | لا توجد مجموعات موقوفة | No inactive batches | |
| `batches.emptyFilteredBody` | غيّر الفلتر لعرض باقي المجموعات. | Change the filter to see the other batches. | |
| `batches.error` | تعذّر تحميل المجموعات. تحقق من اتصالك بالإنترنت ثم حاول مرة أخرى. | Could not load the batches. Check your connection and try again. | |
| `batches.groupBatch` | المجموعة | Batch | |
| `batches.name` | اسم المجموعة | Batch name | |
| `batches.nameHint` | للاستخدام الداخلي، حتى 100 حرف. يُستخدم اسمًا لملف التنزيل. | Internal use, up to 100 characters. Used as the download file name. | |
| `batches.amount` | المبلغ لكل كود | Amount per code | |
| `batches.quantity` | عدد الأكواد | Number of codes | |
| `batches.quantityHint` | من 3 إلى 100. الافتراضي 10. | 3 to 100. Default 10. | |
| `batches.groupFormat` | شكل الكود | Code format | |
| `batches.prefix` | رمز البداية (اختياري) | Prefix (optional) | |
| `batches.prefixHint` | من 2 إلى 12 حرفًا إنجليزيًا أو رقمًا. يظهر بحروف كبيرة. | 2 to 12 English letters or digits. Shown in capitals. | |
| `batches.example` | مثال على الكود: | Example code: | |
| `batches.randomHint` | الأحرف بعد الرمز تُنشأ عشوائيًا لكل كود. | The characters after the prefix are random for each code. | |
| `batches.noPrefixHint` | بلا رمز يبدأ كل كود بالرمز الافتراضي {{defaultPrefix}}. الأحرف بعد الرمز تُنشأ عشوائيًا لكل كود. | Without a prefix every code starts with the default prefix {{defaultPrefix}}. The characters after it are random for each code. | |
| `batches.groupPeriod` | الفترة والشروط | Period and conditions | |
| `batches.groupConfirm` | التأكيد | Confirmation | |
| `batches.total` | الإجمالي | Total | |
| `batches.codesCount_zero` | {{count}} كود | — | |
| `batches.codesCount_one` | كود واحد | {{count}} code | |
| `batches.codesCount_two` | كودان | — | |
| `batches.codesCount_few` | {{count}} أكواد | — | |
| `batches.codesCount_many` | {{count}} كودًا | — | |
| `batches.codesCount_other` | {{count}} كود | {{count}} codes | |
| `batches.overLimit` | الإجمالي يتجاوز الحد الأقصى للمجموعة | The total exceeds the batch limit | |
| `batches.overLimitHint` | قلّل العدد أو المبلغ. | Lower the number or the amount. | |
| `batches.totalInvalid` | أدخل عدد الأكواد والمبلغ لعرض الإجمالي. | Enter the number of codes and the amount to see the total. | |
| `batches.summary` | ملخص المجموعة | Batch summary | |
| `batches.trialSummary` | {{codes}}، يمنح كل كود باقة «{{plan}}» لمدة {{days}}. | {{codes}}; each code gives the «{{plan}}» plan for {{days}}. | |
| `batches.createSubmit` | إنشاء المجموعة | Create batch | |
| `batches.createFailed` | تعذّر إنشاء المجموعة | Could not create the batch | |
| `batches.errors.nameRequired` | اسم المجموعة مطلوب. | Batch name is required. | |
| `batches.errors.quantityInvalid` | اكتب عددًا صحيحًا من 3 إلى 100. | Enter a whole number from 3 to 100. | |
| `batches.errors.prefixInvalid` | من 2 إلى 12 حرفًا إنجليزيًا أو رقمًا فقط. | 2 to 12 English letters or digits only. | |
| `batches.created` | تم إنشاء المجموعة | Batch created | |
| `batches.createdTitle` | أُنشئت {{codes}} جاهزة للاستخدام | {{codes}} created and ready to use | |
| `batches.createdBody` | نزّل الملف وسلّمه للموزّع. تجد الأكواد أيضًا في الجدول أدناه. | Download the file and give it to the reseller. The codes are also in the table below. | |
| `batches.noticeTitle` | هذه أكواد صالحة للاستخدام الآن | These are working codes | |
| `batches.noticeBody` | شارك الملف مع الموزّع المقصود فقط. من يملك الكود يستطيع استخدامه. | Share the file only with the intended reseller. Anyone with a code can use it. | |
| `batches.valuePerCode` | القيمة لكل كود | Value per code | |
| `batches.quantityLabel` | عدد الأكواد | Number of codes | |
| `batches.prefixLabel` | رمز البداية | Prefix | |
| `batches.summaryNote` | النوع والقيمة والعدد وتاريخ البدء لا تتغير بعد الإنشاء. | Kind, value, number and start date cannot change after creation. | |
| `batches.endsAtHint` | يسري على كل أكواد المجموعة. | Applies to every code in the batch. | |
| `batches.progress` | التقدم | Progress | |
| `batches.codesUsed` | الأكواد المستخدمة | Codes used | |
| `batches.credited` | الرصيد المضاف | Balance credited | |
| `batches.of` | من | of | |
| `batches.download` | تنزيل ملف CSV | Download CSV file | |
| `batches.deactivate` | إيقاف المجموعة | Turn batch off | |
| `batches.activate` | تفعيل المجموعة | Turn batch on | |
| `batches.deactivated` | تم إيقاف المجموعة | Batch turned off | |
| `batches.activated` | تم تفعيل المجموعة | Batch turned on | |
| `batches.inactiveBanner` | هذه المجموعة متوقفة. لا يعمل أي كود غير مستخدم فيها، وتظهر للمستخدمين كأنها غير موجودة. فعّلها لتعمل الأكواد من جديد، عدا ما أوقفته منها واحدًا واحدًا. | This batch is off. No unused code in it works and users see it as not existing. Turn it on to make the codes work again, except those you turned off one by one. | |
| `batches.codesTitle` | الأكواد ({{used}} / {{total}} مستخدم) | Codes ({{used}} / {{total}} used) | |
| `batches.codesLabel` | أكواد المجموعة | Codes in the batch | |
| `batches.codesFilter` | حالة الكود | Code status | |
| `batches.codeStatus.used` | مستخدم | Used | |
| `batches.codeStatus.unused` | غير مستخدم | Unused | |
| `batches.codeStatus.off` | متوقف | Off | |
| `batches.codeColumns.code` | الكود | Code | |
| `batches.codeColumns.status` | الحالة | Status | |
| `batches.codeColumns.redeemedAt` | تاريخ الاستخدام | Redeemed on | |
| `batches.codeColumns.user` | المستخدم | User | |
| `batches.codeColumns.actions` | إجراءات | Actions | |
| `batches.noUsedTitle` | لا توجد أكواد مستخدمة بعد | No used codes yet | |
| `batches.noUsedBody` | ستظهر هنا الأكواد التي استخدمها أصحابها. | Codes will appear here once their owners use them. | |
| `batches.noCodesTitle` | لا توجد أكواد | No codes | |
| `batches.noCodesBody` | غيّر الفلتر لعرض باقي الأكواد. | Change the filter to see the other codes. | |
| `batches.codesError` | تعذّر تحميل الأكواد. تحقق من اتصالك بالإنترنت ثم حاول مرة أخرى. | Could not load the codes. Check your connection and try again. | |
| `batches.downloadTitle` | تنزيل ملف الأكواد | Download the codes file | |
| `batches.warningTitle` | الملف يحتوي أكواد صالحة للاستخدام | The file contains working codes | |
| `batches.warningBody` | شاركه مع الموزّع المقصود فقط. من يملك الكود يستطيع استخدامه. | Share it only with the intended reseller. Anyone with a code can use it. | |
| `batches.warningNote` | لا يحتوي الملف على بيانات المستخدمين. يُسجَّل كل تنزيل في سجل التدقيق. | The file has no user data. Every download is recorded in the audit log. | |
| `batches.downloadFile` | تنزيل الملف | Download file | |
| `batches.downloading` | جارٍ التنزيل… | Downloading… | |
| `batches.downloadFailed` | تعذّر تنزيل الملف | Could not download the file | |
| `batches.downloadFailedBody` | لم يتغير شيء في المجموعة. تحقق من اتصالك ثم حاول مرة أخرى. | Nothing changed in the batch. Check your connection and try again. | |
| `batches.deactivateCodeBody` | سيظهر الكود للمستخدمين كأنه غير موجود، وسيبقى متوقفًا حتى لو أعدت تفعيل المجموعة. | Users will see the code as not existing, and it stays off even if you turn the batch back on. | |
| `batches.activateCodeBody` | سيعمل الكود من جديد ضمن فترته، ما دامت المجموعة فعّالة. | The code works again within its period, as long as the batch is on. | |
| `batches.deactivateBody` | ستتوقف كل أكواد المجموعة غير المستخدمة، وتظهر للمستخدمين كأنها غير موجودة. الأكواد التي استُخدمت من قبل لا تتأثر. يمكنك تفعيل المجموعة لاحقًا. | All unused codes in the batch stop working and users see them as not existing. Codes already used are not affected. You can turn the batch on later. | |
| `batches.activateBody` | ستعمل الأكواد غير المستخدمة من جديد ضمن فترتها، عدا الأكواد التي أوقفتها واحدًا واحدًا. | Unused codes work again within their period, except codes you turned off one by one. | |
| `batches.batchCodeTitle` | هذا الكود من مجموعة «{{name}}» | This code belongs to the batch «{{name}}» | |
| `batches.batchCodeBody` | يُستخدم مرة واحدة فقط، ويُعدَّل تاريخ انتهائه من المجموعة. | It can be used once, and its end date is set on the batch. | |
| `batches.openBatch` | فتح المجموعة | Open batch | |
| `batches.notFoundTitle` | المجموعة غير موجودة | Batch not found | |
| `batches.detailError` | تعذّر تحميل المجموعة. جرّب مرة أخرى أو ارجع إلى القائمة. | Could not load the batch. Try again or go back to the list. | |

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
| `isDefaultHint` | تصبح باقة المستخدمين بلا اشتراك، وتتوقف الباقة الافتراضية الحالية. | Becomes the plan for users without a subscription, and the current default plan stops. | |
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
| `maxBrandKits` | هويات العلامة التجارية | Brand kits | |
| `maxBrandKitsHint` | كم هوية يحفظها المشترك للمصمم الجرافيكي، من 0 إلى 100. | How many brand kits a subscriber keeps for the graphic designer, 0 to 100. | |
| `maxBrandKitsInvalid` | اكتب عددًا صحيحًا من 0 إلى 100. | Enter a whole number from 0 to 100. | |

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
| `addModel` | إضافة نموذج | Add model | |

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
| `test.imageSent` | أُرسلت صورة | Image sent | |
| `test.yes` | نعم | Yes | |
| `test.no` | لا | No | |
| `test.imageAlt` | الصورة التي أنشأها النموذج في الاختبار | Image the model created in the test | |
| `test.imageSize` | حجم الصورة | Image size | |
| `test.noImage` | لم يُرجع النموذج صورة | The model did not return an image | |
| `test.imageBytes` | {{bytes}} بايت | {{bytes}} bytes | |
| `supportsImages` | يقرأ الصور | Reads images | |
| `supportsImagesHint` | فعّله فقط إذا كان النموذج يقبل الصور. الأوضاع التي تستخدمه تظهر للمستخدمين بأنها تقرأ الصور، ويُرسل اختبار النموذج صورة صغيرة. | Turn on only if the model accepts images. Modes that use it are shown to users as reading images, and the model test sends a small image. | |
| `picker.stepsLabel` | خطوات إضافة النموذج | Add model steps | |
| `picker.stepPick` | اختيار النموذج | Pick the model | |
| `picker.stepDetails` | البيانات والسعر | Details and price | |
| `picker.provider` | المزوّد | Provider | |
| `picker.providerPlaceholder` | اختر المزوّد | Choose a provider | |
| `picker.chooseProvider` | اختر مزوّدًا لعرض النماذج التي يقدّمها. | Choose a provider to see the models it offers. | |
| `picker.noProviders` | لا يوجد مزوّدون يمكن جلب نماذجهم. أضف مزوّدًا ومفتاحه أولًا. | No provider can list its models. Add a provider and its key first. | |
| `picker.search` | بحث | Search | |
| `picker.searchPlaceholder` | ابحث بالمعرّف أو الاسم | Search by id or name | |
| `picker.manual` | إدخال يدوي | Enter manually | |
| `picker.tableLabel` | النماذج المتاحة لدى المزوّد | Models available at the provider | |
| `picker.columns.id` | معرّف النموذج عند المزود | Provider model id | |
| `picker.columns.name` | الاسم | Name | |
| `picker.columns.context` | نافذة السياق | Context window | |
| `picker.columns.maxOutput` | أقصى إخراج | Max output | |
| `picker.columns.input` | سعر الإدخال | Input price | |
| `picker.columns.output` | سعر الإخراج | Output price | |
| `picker.columns.perMillion` | لكل مليون رمز | per million tokens | |
| `picker.columns.notes` | ملاحظات | Notes | |
| `picker.added` | مضاف | Added | |
| `picker.viewModel` | عرض النموذج | View model | |
| `picker.deprecated` | متوقف من المزود | Retired by provider | |
| `picker.tiered` | سعر متدرّج | Tiered price | |
| `picker.images` | يقرأ الصور | Reads images | |
| `picker.select` | اختيار النموذج {{id}} | Choose model {{id}} | |
| `picker.hint` | الصفوف المضافة لا يمكن اختيارها. اضغط على صف لمتابعة الخطوة 2 بالبيانات معبّأة من الكتالوج. | Added rows can't be chosen. Click a row to continue to step 2 with the catalog data filled in. | |
| `picker.loading` | جارٍ جلب النماذج المتاحة… | Fetching the available models… | |
| `picker.emptyTitle` | لا توجد نماذج مطابقة | No matching models | |
| `picker.emptyBody` | غيّر البحث أو أدخل النموذج يدويًا. | Change the search or enter the model manually. | |
| `picker.emptyListTitle` | لا يقدّم هذا المزوّد أي نماذج | This provider lists no models | |
| `picker.emptyListBody` | إن كنت تعرف معرّف النموذج فأدخله يدويًا. | If you know the model id, enter it manually. | |
| `picker.noKeyTitle` | أضف مفتاح الواجهة البرمجية أولًا | Add the API key first | |
| `picker.noKeyBody` | لا يمكن عرض نماذج المزوّد قبل تعيين مفتاحه. | The provider's models can't be listed before its key is set. | |
| `picker.goProviders` | الانتقال إلى المزوّدين | Go to providers | |
| `picker.keyInvalidTitle` | مفتاح الواجهة البرمجية مرفوض | The API key was rejected | |
| `picker.replaceKey` | استبدال المفتاح | Replace the key | |
| `picker.unreachableTitle` | تعذّر الوصول إلى المزود | Couldn't reach the provider | |
| `picker.notFoundTitle` | المزوّد غير موجود | Provider not found | |
| `picker.backToProviders` | العودة إلى المزوّدين | Back to providers | |
| `picker.catalogUnavailable` | تعذّر الوصول إلى الكتالوج العام؛ أدخل البيانات والأسعار يدويًا | Couldn't reach the public catalog; enter the details and prices by hand | |
| `picker.loadingModel` | جارٍ تحميل بيانات النموذج… | Loading the model data… | |
| `picker.modelAddedTitle` | هذا النموذج مضاف بالفعل | This model is already added | |
| `picker.backToPicker` | العودة إلى الاختيار | Back to the picker | |
| `picker.fromCatalog` | من الكتالوج | From the catalog | |
| `picker.change` | تغيير | Change | |
| `picker.initialPriceTitle` | السعر الأولي | Initial price | |
| `picker.initialPriceHint` | بالدولار لكل مليون رمز. يمكن ترك الحقول فارغة وتحديد السعر لاحقًا. | In USD per million tokens. You can leave the fields empty and set the price later. | |
| `picker.optional` | اختياري | Optional | |
| `picker.priceIncomplete` | أدخل سعر الإدخال وسعر الإخراج معًا | Enter the input and output prices together | |
| `picker.catalogTitle` | الكتالوج | Catalog | |
| `picker.tiersWarning` | يكلّف المزود أكثر فوق حجم سياق معيّن، ونحن نحتسب سعرًا واحدًا. اخفض نافذة السياق إلى حد الشريحة أو سعّر بالشريحة الأعلى. | The provider charges more above a certain context size, and we bill one rate. Lower the context window to the tier limit or price at the higher tier. | |
| `picker.deprecatedWarning` | المزود يوقف هذا النموذج؛ لا تعتمد عليه في الأوضاع الجديدة. | The provider is retiring this model; don't rely on it in new modes. | |
| `picker.createdNote` | يُنشأ النموذج معطّلًا، ويمكن تفعيله من صفحته. | The model is created disabled; you can enable it from its page. | |
| `generatesImages` | ينشئ الصور | Creates images | |
| `generatesImagesHint` | فعّله لنماذج إنشاء الصور فقط. سعر الخرج لهذا النموذج هو سعر الصورة لكل مليون رمز خرج، لذلك يبدو مرتفعًا؛ الصورة الواحدة تكلّف تقريبًا بضعة سنتات. | Turn on for image-generation models only. This model's output price is its image rate per 1M output tokens, so it looks high; one image costs roughly a few cents. | |
| `generatesImagesBadge` | ينشئ الصور | Creates images | |
| `supportsImagesLocked` | مفعّل دائمًا لأن النموذج ينشئ الصور. أوقف «ينشئ الصور» أولًا لتغييره. | Always on because the model creates images. Turn off "Creates images" first to change it. | |
| `maxOutputImageHint` | الحد الأدنى 2,500 عند إنشاء الصور | Minimum 2,500 when creating images | |
| `maxOutputImageMin` | الحد الأدنى 2,500 عند إنشاء الصور | Minimum 2,500 when creating images | |

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
| `reasons.IMAGE_GENERATION_UNSUPPORTED` | مزوّد هذا النموذج لا يدعم إنشاء الصور. | This model's provider does not support image creation. | |
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

## admin.priceUpdates

| Key | العربية | English | Notes |
|---|---|---|---|
| `intro` | تتم المزامنة كل 6 ساعات. تُطبَّق التغييرات حتى 50% تلقائيًا، والأكبر تنتظر مراجعتك. | The sync runs every 6 hours. Changes up to 50% are applied automatically; larger ones wait for your review. | |
| `runNow` | تشغيل المزامنة الآن | Run sync now | |
| `running` | جارٍ التحقق… | Checking… | |
| `startedAt` | بدأت | Started | |
| `lastRun` | آخر مزامنة | Last sync | |
| `neverRun` | لم تتم أي مزامنة بعد | No sync has run yet | |
| `trigger` | التشغيل | Trigger | |
| `triggers.schedule` | تلقائي | scheduled | |
| `triggers.admin` | بطلب من مسؤول | by an admin | |
| `nextRun` | المزامنة القادمة | Next sync | |
| `failedTitle` | فشلت آخر مزامنة | The last sync failed | |
| `failedDetails` | التفاصيل | Details | |
| `stale` | لم تتم المزامنة منذ مدة؛ تحقّق من مهمة المزامنة | The sync hasn't run for a while; check the sync job | |
| `statusError` | تعذّر تحميل حالة المزامنة. | Couldn't load the sync status. | |
| `tabsLabel` | حالة التحديثات | Update status | |
| `tabs.open` | بانتظار المراجعة | Awaiting review | |
| `tabs.applied` | مطبّقة | Applied | |
| `tabs.dismissed` | متجاهلة | Dismissed | |
| `tabs.superseded` | لم تعد سارية | No longer valid | |
| `kindsLabel` | نوع التحديث | Update type | |
| `kinds.all` | الكل | All | |
| `kinds.large_change` | تغيير كبير | Large change | |
| `kinds.catalog_price_missing` | سعر مفقود | Missing price | |
| `kinds.model_retired` | نموذج متوقف | Retired model | |
| `listLabel` | التحديثات | Updates | |
| `loading` | جارٍ تحميل التحديثات… | Loading updates… | |
| `error` | تعذّر تحميل التحديثات | Couldn't load the updates | |
| `loadMore` | تحميل المزيد | Load more | |
| `empty.open.title` | لا توجد تحديثات بانتظار المراجعة | No updates waiting for review | |
| `empty.open.body` | ستظهر هنا تغييرات الأسعار الكبيرة والنماذج المتوقفة بعد أي مزامنة. | Large price changes and retired models show up here after any sync. | |
| `empty.applied.title` | لا توجد تحديثات مطبّقة | No applied updates | |
| `empty.applied.body` | ستظهر هنا الأسعار التي طبّقتها. | Prices you applied show up here. | |
| `empty.dismissed.title` | لا توجد تحديثات متجاهلة | No dismissed updates | |
| `empty.dismissed.body` | ستظهر هنا التنبيهات التي تجاهلتها. | Warnings you dismissed show up here. | |
| `empty.superseded.title` | لا توجد تحديثات لم تعد سارية | No updates that are no longer valid | |
| `empty.superseded.body` | تظهر هنا الاقتراحات التي حلّ محلها مزامنة أحدث. | Proposals replaced by a newer sync show up here. | |
| `card.firstSeen` | أول رصد | First seen | |
| `card.lastSeen` | آخر رصد | Last seen | |
| `card.current` | الحالي | Current | |
| `card.proposed` | المقترح | Proposed | |
| `card.rates.input` | الإدخال | Input | |
| `card.rates.output` | الإخراج | Output | |
| `card.rates.cachedInput` | الإدخال المخزّن | Cached input | |
| `card.rates.cacheWrite` | كتابة الذاكرة المؤقتة | Cache write | |
| `card.fromZero` | من الصفر | From zero | |
| `card.viewModel` | عرض النموذج | View model | |
| `card.noCatalogPrice` | لا يوجد سعر في الكتالوج | No price in the catalog | |
| `card.currentPriceIs` | السعر الحالي | Current price | |
| `card.wontChange` | لن يتغيّر السعر تلقائيًا. | The price won't change automatically. | |
| `card.retiredTitle` | لم يعد المزود يقدّم هذا النموذج | The provider no longer offers this model | |
| `card.retiredBody` | قد تفشل الردود عليه. المزامنة لا توقف النماذج ولا الأوضاع؛ هذا قرار يتخذه المسؤول. | Replies on it may fail. The sync doesn't stop models or modes; that is the admin's decision. | |
| `card.modesUsing` | أوضاع مفعّلة تستخدمه | Enabled modes using it | |
| `card.noModes` | لا تستخدمه أوضاع مفعّلة | Not used by any enabled mode | |
| `card.appliedBy` | طُبِّق السعر بواسطة | Price applied by | |
| `card.dismissedBy` | تُجوهل بواسطة | Dismissed by | |
| `card.closedBySync` | أُغلق تلقائيًا بالمزامنة | Closed automatically by the sync | |
| `card.reason` | السبب | Reason | |
| `card.apply` | تطبيق السعر | Apply the price | |
| `card.dismiss` | تجاهل | Dismiss | |
| `card.actionsFor` | {{name}} | {{name}} | |
| `dialog.applyTitle` | تطبيق السعر | Apply the price | |
| `dialog.applyBody` | يصبح السعر المقترح هو السعر الحالي للنموذج من الآن، ولا يغيّر تكلفة الرسائل السابقة. | The proposed price becomes the model's current price from now on. It doesn't change the cost of earlier messages. | |
| `dialog.perMillion` | (لكل مليون رمز) | (per million tokens) | |
| `dialog.changeLabel` | نسبة التغيير | Change | |
| `dialog.dismissTitle` | تجاهل التحديث | Dismiss the update | |
| `dialog.dismissNotice` | لن يُعرض هذا الاقتراح مرة أخرى. | This proposal won't be shown again. | |
| `dialog.dismissSubmit` | تجاهل | Dismiss | |
| `dialog.retiredTitle` | تجاهل تنبيه النموذج المتوقف | Dismiss the retired-model warning | |
| `dialog.retiredNoticeTitle` | تجاهل دائم | Permanent dismissal | |
| `dialog.retiredNotice` | يخفي التجاهل هذا التنبيه نهائيًا. يبقى النموذج مفعّلًا، وقد يرفضه المزود بالفعل. | Dismissing hides this warning for good. The model stays enabled, and the provider may already reject it. | |
| `dialog.retiredSubmit` | تجاهل نهائيًا | Dismiss for good | |
| `dialog.runTitle` | تشغيل المزامنة الآن | Run sync now | |
| `dialog.runDescription` | فحص الكتالوج العام وقوائم المزوّدين | Checks the public catalog and the provider lists | |
| `dialog.runBody` | يتحقق من الكتالوج العام وقوائم المزوّدين. قد يستغرق أكثر من 30 ثانية، ويمكنك متابعة العمل أثناء ذلك. | Checks the public catalog and the provider model lists. It can take more than 30 seconds, and you can keep working meanwhile. | |
| `dialog.runSubmit` | تشغيل المزامنة | Run the sync | |
| `dialog.to` | إلى | to | |
| `toast.applied` | تم تطبيق السعر الجديد | The new price was applied | |
| `toast.dismissed` | تم تجاهل التحديث | The update was dismissed | |
| `toast.runStarted` | بدأت المزامنة | The sync started | |
| `toast.runAlready` | المزامنة تعمل الآن | A sync is already running | |
| `summary.title` | نتيجة المزامنة | Sync result | |
| `summary.close` | إغلاق النتيجة | Close the result | |
| `summary.checked` | تم فحصه | Checked | |
| `summary.applied` | طُبّق تلقائيًا | Applied automatically | |
| `summary.unchanged` | دون تغيير | Unchanged | |
| `summary.held` | بانتظار المراجعة | Held for review | |
| `summary.noCatalogPrice` | بلا سعر في الكتالوج | No catalog price | |
| `summary.notInCatalog` | غير موجود في الكتالوج | Not in the catalog | |
| `summary.skipped` | تخطّي | Skipped | |
| `summary.failed` | فشل | Failed | |
| `summary.providersChecked` | مزوّدون تم فحصهم | Providers checked | |
| `summary.providersUnreachable` | تعذّر الوصول إلى مزوّدين | Providers unreachable | |
| `summary.ignored` | تم تجاهله | Ignored | |
| `summary.retired` | نماذج متوقفة عند المزود | Models retired by the provider | |
| `summary.retiredInUse` | منها {{n}} مستخدم في أوضاع مفعّلة | {{n}} of them used by enabled modes | |
| `summary.noCatalogTitle` | تعذّر الوصول إلى الكتالوج | Couldn't reach the catalog | |
| `summary.noCatalogBody` | لم تتغيّر أي أسعار. | No prices changed. | |
| `live.finished` | انتهت المزامنة | Sync finished | |
| `live.failed` | انتهت المزامنة بخطأ | The sync ended with an error | |

## admin.agents

| Key | العربية | English | Notes |
|---|---|---|---|
| `intro` | يظهر المساعد للمستخدمين عندما يكون مفعّلًا وفي باقاتهم فقط. المساعد المتوقف مخفي عن الجميع. | Users see an agent only when it is on and in their plan. An agent that is off is hidden from everyone. | |
| `tableLabel` | المساعدون | Agents | |
| `error` | تعذّر تحميل المساعدين. | Could not load the agents. | |
| `emptyTitle` | لا يوجد مساعدون | No agents | |
| `emptyBody` | تُضاف المساعدات من الخادم. | Agents are added on the server. | |
| `columns.agent` | المساعد | Agent | |
| `columns.key` | المفتاح | Key | |
| `columns.status` | الحالة والجاهزية | Status and readiness | |
| `columns.plans` | الباقات | Plans | |
| `columns.sort` | الترتيب | Order | |
| `columns.updated` | آخر تحديث | Last updated | |
| `columns.actions` | إجراءات | Actions | |
| `on` | مفعّل | On | |
| `off` | متوقف | Off | |
| `ready` | جاهز | Ready | |
| `notReady` | غير جاهز | Not ready | |
| `noPlans` | لا باقات | No plans | |
| `onNoPlans` | مفعّل لكن لا يظهر لأحد: اختر باقة. | On, but nobody sees it: pick a plan. | |
| `edit` | تعديل | Edit | |
| `editLabel` | تعديل {{name}} | Edit {{name}} | |
| `dialogTitle` | تعديل المساعد | Edit agent | |
| `save` | حفظ التغييرات | Save changes | |
| `saved` | تم حفظ التغييرات. | Changes saved. | |
| `visibility` | الظهور | Visibility | |
| `enabled` | مفعّل للمستخدمين | On for users | |
| `enabledHint` | متوقف: المساعد مخفي عن كل المستخدمين حتى لو اخترت باقات. | Off: the agent is hidden from every user, even on the chosen plans. | |
| `texts` | الاسم والوصف | Name and description | |
| `labelAr` | الاسم بالعربية | Arabic name | |
| `labelEn` | الاسم بالإنجليزية | English name | |
| `descriptionAr` | الوصف بالعربية | Arabic description | |
| `descriptionEn` | الوصف بالإنجليزية | English description | |
| `sortHint` | من 0 إلى 1000. يظهر الأصغر أولًا. | 0 to 1000. Lower comes first. | |
| `plansTitle` | الباقات | Plans | |
| `plansLabel` | الباقات التي تقدّم هذا المساعد | Plans that offer this agent | |
| `plansHint` | لن يرى المستخدمون في الباقات الأخرى هذا المساعد. | Users on other plans will not see this agent. | |
| `planInactive` | غير نشطة | Inactive | |
| `plansLoading` | جارٍ تحميل الباقات… | Loading plans… | |
| `plansError` | تعذّر تحميل الباقات. لا تُرسل الباقات حتى تُحمَّل. | Could not load the plans. Plans are not sent until they load. | |
| `noPlansWarning` | مفعّل بلا باقات: لن يراه أي مستخدم. | On with no plans: no user will see it. | |
| `models` | النماذج والتكلفة | Models and cost | |
| `promptModel` | نموذج كتابة الوصف | Prompt model | |
| `promptModelHint` | نماذج النصوص فقط. | Text models only. | |
| `imageModel` | نموذج إنشاء الصور | Image model | |
| `imageModelHint` | النماذج التي تنشئ الصور فقط. | Models that create images only. | |
| `checkModel` | نموذج فحص الصور | Check model | |
| `checkModelHint` | النماذج التي تقرأ الصور ولا تنشئها. | Models that read images and do not create them. | |
| `noModel` | لم يُحدَّد | Not set | |
| `modelOff` | {{name}} (موقوف) | {{name}} (off) | |
| `variants` | عدد التصاميم في كل طلب | Designs per request | |
| `variantsHint` | من 1 إلى 3. الافتراضي 2. كل تصميم يُحسب من الاستخدام الفعلي. | 1 to 3. Default 2. Each design is charged at real usage. | |
| `margin` | هامش الربح (%) | Margin (%) | |
| `marginPlaceholder` | الافتراضي | Default | |
| `marginHint` | من 0 إلى 500. اتركه فارغًا لاستخدام هامش كل نموذج. عند تحديده يحلّ محل هوامش النماذج. | 0 to 500. Leave empty to use each model's margin. When set, it replaces the models' margins. | |
| `readyNotice` | المساعد جاهز. | The agent is ready. | |
| `notReadyTitle` | المساعد غير جاهز | The agent is not ready | |
| `missing` | ينقصه: {{models}}. | Missing: {{models}}. | |
| `notReadyBody` | تحتاج النماذج أيضًا أن تكون مفعّلة ولها أسعار في صفحة النماذج حتى يعمل التسعير. | The models must also be on and priced on the models page for pricing to work. | |
| `onNotReady` | المساعد غير جاهز: لا يمكن تسعير التصاميم بعد. | The agent is not ready: designs cannot be priced yet. | |
| `required` | هذا الحقل مطلوب. | This field is required. | |
| `instructions` | التعليمات | Instructions | |
| `custom` | مخصّصة | Custom | |
| `advanced` | تعليمات متقدمة | Advanced instructions | |
| `promptInstructions` | تعليمات كتابة الوصف | Prompt instructions | |
| `checkInstructions` | تعليمات الفحص | Check instructions | |
| `instructionsHint` | اتركها فارغة لاستخدام التعليمات الافتراضية. حتى 4000 حرف. | Leave empty to use the default instructions. Up to 4000 characters. | |
| `checkWarning` | يجب أن يبقى ردّ الفاحص بصيغة JSON التي يقرؤها المساعد، وإلا تفشل الفحوص. | The checker must still answer the JSON the agent reads, or checks fail. | |
| `restoreDefault` | استعادة الافتراضي | Restore default | |
| `instructionsTooLong` | النص أطول من 4000 حرف. | The text is longer than 4000 characters. | |

## landing.hero

| Key | العربية | English | Notes |
|---|---|---|---|
| `body` | اسأل بالعربية واحصل على إجابات منظمة: تلخيص، كتابة، ترجمة، وشرح. | Ask in Arabic and get organized answers: summaries, writing, translation and explanations. | |
| `previewLabel` | نموذج لصفحة المحادثة | A sample of the chat page | |
| `previewQuestion` | لخّص لي أهم بنود عقد الإيجار. | Summarize the main terms of the lease. | |
| `previewTitle` | أهم البنود | Main terms | |
| `previewItem1` | مدة العقد سنة واحدة. | The lease runs for one year. | |
| `previewItem2` | الإيجار الشهري 4,500 ريال. | Monthly rent is 4,500 riyals. | |
| `previewItem3` | المستأجر يتحمل فواتير الخدمات. | The tenant pays for utilities. | |
| `previewPlaceholder` | اكتب رسالتك… | Write your message… | |

## landing.modes

| Key | العربية | English | Notes |
|---|---|---|---|
| `title` | أوضاع لكل مهمة | A mode for every task | |
| `intro` | تختار الوضع المناسب لكل رسالة، وتغيّره متى شئت. | Pick the right mode for each message, and change it whenever you like. | |
| `fast` | سريع | Fast | |
| `fastTitle` | إجابات سريعة للاستخدام اليومي، بتكلفة أقل. | Quick answers for everyday use, at a lower cost. | |
| `fastBody` | مناسب للأسئلة القصيرة، والصياغة، والترجمة. | Good for short questions, wording and translation. | |
| `pro` | احترافي | Professional | |
| `proTitle` | تفكير أعمق للمهام المعقدة، بتكلفة أعلى. | Deeper thinking for complex tasks, at a higher cost. | |
| `proBody` | مناسب للتحليل، والمستندات الطويلة، والكتابة المتقنة. | Good for analysis, long documents and polished writing. | |
| `image` | تصميم | Design | |
| `imageBadge` | صورة | Image | |
| `imageTitle` | أنشئ صورًا من وصف تكتبه، وعدّل صورة ترفقها. | Create images from a description, and edit an image you attach. | |
| `imageBody` | مناسب للتصاميم والمشاهد والأفكار المرئية. | Good for designs, scenes and visual ideas. | |

## landing.balance

| Key | العربية | English | Notes |
|---|---|---|---|
| `title` | رصيد واحد لكل الأوضاع | One balance for every mode | |
| `body` | يأتي مع باقتك رصيد واحد مشترك. تُحتسب تكلفة كل رد من هذا الرصيد حسب الوضع الذي تختار، وتتابع رصيدك المتبقي في أي وقت من شريط الرصيد. | Your plan comes with one shared balance. The cost of each reply comes out of it based on the mode you choose, and you can check what is left at any time in the balance bar. | |
| `label` | الرصيد | Balance | |

## landing.plans

| Key | العربية | English | Notes |
|---|---|---|---|
| `title` | الباقات | Plans | |
| `included` | الرصيد المضمّن: | Included balance: | |
| `all` | عرض جميع الباقات | See all plans | |

## landing.howTo

| Key | العربية | English | Notes |
|---|---|---|---|
| `title` | كيف أحصل على باقة؟ | How do I get a plan? | |
| `step` | الخطوة {{number}} | Step {{number}} | |
| `step1` | أنشئ حسابك مجانًا | Create your free account | |
| `step2` | راسلنا على البريد الإلكتروني | Email us | |
| `step2Generic` | تواصل مع فريقنا | Contact our team | |
| `step3` | نفعّل باقتك ويظهر رصيدك في حسابك | We activate your plan and your balance appears in your account | |
| `note` | الاشتراك وإضافة الرصيد عن طريق فريقنا. | Subscriptions and balance are handled by our team. | |
| `contact` | تواصل معنا | Contact us | |

## landing.faq

| Key | العربية | English | Notes |
|---|---|---|---|
| `title` | أسئلة شائعة | Frequently asked questions | |
| `q1` | ما الفرق بين الأوضاع؟ | What is the difference between the modes? | |
| `a1` | السريع للأسئلة اليومية بتكلفة أقل، والاحترافي للمهام المعقدة بتكلفة أعلى، والتصميم لإنشاء الصور. تختار الوضع لكل رسالة. | Fast is for everyday questions at a lower cost, Professional is for complex tasks at a higher cost, and Design is for creating images. You choose the mode for each message. | |
| `q2` | كيف يُحتسب الرصيد؟ | How is the balance charged? | |
| `a2` | لديك رصيد واحد مشترك لكل الأوضاع، وتُخصم تكلفة كل رد منه حسب الوضع المستخدم. | You have one balance shared across all modes, and the cost of each reply comes out of it based on the mode used. | |
| `q3` | كيف أحصل على باقة؟ | How do I get a plan? | |
| `a3` | أنشئ حسابك ثم تواصل معنا، وسنفعّل الباقة المناسبة لك. | Create your account, then contact us and we will activate the right plan for you. | |
| `q4` | هل يدعم {{brandName}} اللغة العربية فقط؟ | Does {{brandName}} support only Arabic? | |
| `a4` | صُمم {{brandName}} للعربية أولًا، ويمكنك أيضًا الكتابة بلغات أخرى. | {{brandName}} is built for Arabic first, and you can also write in other languages. | |
| `q5` | ماذا يحدث عند انتهاء رصيدي؟ | What happens when my balance runs out? | |
| `a5` | تحتاج كل رسالة إلى رصيد كافٍ. إذا لم يكفِ رصيدك، تواصل معنا لإضافة رصيد إلى حسابك. | Every message needs enough balance. If yours is not enough, contact us to add balance to your account. | |

## landing.closing

| Key | العربية | English | Notes |
|---|---|---|---|
| `title` | ابدأ بحساب مجاني | Start with a free account | |
| `body` | أنشئ حسابك مجانًا، ثم اختر الباقة المناسبة لك. | Create your free account, then choose the plan that suits you. | |

## landing.footer

| Key | العربية | English | Notes |
|---|---|---|---|
| `terms` | الشروط والأحكام | Terms and conditions | |
| `privacy` | سياسة الخصوصية | Privacy policy | |
| `rights` | جميع الحقوق محفوظة | All rights reserved | |

## landing.privacy

| Key | العربية | English | Notes |
|---|---|---|---|
| `title` | سياسة الخصوصية | Privacy policy | |
| `interim` | إشعار مؤقت يوضح كيف نتعامل مع بياناتك، إلى أن ننشر سياسة الخصوصية الكاملة وشروط الاستخدام. | An interim notice on how we handle your data, until we publish the full privacy policy and terms of use. | |
| `updated` | آخر تحديث: 10 نوفمبر 2026 | Last updated: 10 November 2026 | |
| `collectTitle` | ما نجمعه | What we collect | |
| `collect1` | بيانات الحساب: الاسم والبريد الإلكتروني وكلمة المرور، وهي محفوظة مشفّرة ولا يمكننا قراءتها. | Account details: name, email and password, which is stored hashed so we cannot read it. | |
| `collect2` | المحادثات: رسائلك والإجابات، والصور التي ترفعها أو تُنشئها. | Conversations: your messages and the answers, and images you upload or create. | |
| `collect3` | الرصيد والاستخدام: الباقة، والرصيد، وتكلفة كل إجابة، والوضع المستخدم، والأكواد المستخدمة. | Balance and usage: your plan, balance, the cost of each answer, the mode used, and codes redeemed. | |
| `collect4` | بيانات تقنية: عنوان IP ونوع المتصفح، في سجلات الدخول والأمان. | Technical data: IP address and browser type, in sign-in and security logs. | |
| `useTitle` | كيف نستخدمها | How we use it | |
| `use1` | لتقديم الخدمة: إنتاج الإجابات والصور، وحفظ محادثاتك، وحساب رصيدك. | To provide the service: producing answers and images, keeping your conversations, and working out your balance. | |
| `use2` | لحماية الحسابات ومنع إساءة الاستخدام، وللتواصل معك بشأن حسابك. | To protect accounts, prevent abuse, and contact you about your account. | |
| `use3` | لا نبيع بياناتك، ولا نستخدمها للإعلانات، ولا ندرّب نماذج على محادثاتك. لا نستخدم ملفات تتبع ولا أدوات تحليل. | We do not sell your data, use it for advertising, or train models on your conversations. We use no tracking cookies or analytics. | |
| `shareTitle` | مع من نشاركها | Who we share it with | |
| `share1` | مزودو نماذج الذكاء الاصطناعي: تصلهم رسالتك وما سبقها من المحادثة والصور المرفقة لإنتاج الإجابة فقط، دون اسمك أو بريدك، ويعالجونها وفق شروطهم. | AI model providers: they receive your message, the earlier messages of the conversation and attached images, only to produce the answer, without your name or email, and handle them under their own terms. | |
| `share2` | مزود البريد الإلكتروني: لإرسال رسائل تأكيد البريد واستعادة كلمة المرور. | Our email provider: to send email confirmation and password-reset messages. | |
| `share3` | لا أحد غيرهم، إلا إذا ألزمنا القانون بذلك. | No one else, unless the law requires it. | |
| `whereTitle` | أين تُحفظ | Where it is kept | |
| `whereBody` | تُحفظ بياناتك على خوادمنا في ليتوانيا (الاتحاد الأوروبي). ويعالج مزودو النماذج والبريد بعضها خارج مصر. | Your data is kept on our servers in Lithuania (European Union). Model and email providers process some of it outside Egypt. | |
| `rightsTitle` | حقوقك | Your rights | |
| `rights1` | أن تحصل على نسخة من بياناتك. | Get a copy of your data. | |
| `rights2` | أن تصحّحها؛ يمكنك تعديل اسمك من صفحة الحساب. | Correct it; you can change your name on the account page. | |
| `rights3` | أن تحذف محادثاتك أو حسابك. | Have your conversations or your account deleted. | |
| `rightsHow` | أرسل طلبك من البريد المسجّل في حسابك. | Send your request from the email address on your account. | |
| `ageTitle` | العمر | Age | |
| `ageBody` | الخدمة لمن هم في الثامنة عشرة أو أكبر. | The service is for people aged 18 or over. | |
| `contactTitle` | تواصل معنا | Contact us | |
| `contactBody` | لأي سؤال عن بياناتك: | For any question about your data: | |

## brandKits

| Key | العربية | English | Notes |
|---|---|---|---|
| `title` | علاماتي التجارية | My brands | |
| `intro` | احفظ ألوان علامتك وشعاراتها وأسلوبها هنا، ليستخدمها «مصمم جرافيك» في المحادثة. | Keep your brand's colours, logos and style here, for the Graphic designer in the chat. | |
| `new` | هوية جديدة | New brand kit | |
| `limitReached` | وصلت إلى حد باقتك من الهويات ({{count}}). | You've reached your plan's brand kit limit ({{count}}). | |
| `viewPlans` | عرض الباقات | See plans | |
| `draft` | مسودة | Draft | |
| `files_zero` | لا ملفات | No files | |
| `files_one` | ملف واحد | 1 file | |
| `files_two` | ملفان | — | |
| `files_few` | {{count}} ملفات | — | |
| `files_many` | {{count}} ملفًا | — | |
| `files_other` | {{count}} ملف | {{count}} files | |
| `moreColors` | +{{count}} | +{{count}} | |
| `loadMore` | تحميل المزيد | Load more | |
| `loading` | جارٍ تحميل الهويات | Loading brand kits | |
| `loadError` | تعذّر تحميل الهويات. | Couldn't load your brand kits. | |
| `emptyTitle` | لا توجد هويات بعد | No brand kits yet | |
| `emptyBody` | أنشئ هوية هنا، أو اختر «مصمم جرافيك» في محادثة جديدة ليجهّزها معك خطوة بخطوة. | Create one here, or pick the Graphic designer in a new chat to set it up step by step. | |
| `startChat` | محادثة جديدة | New chat | |
| `back` | علاماتي التجارية | My brands | |
| `saved` | تم الحفظ. | Saved. | |
| `saveError` | تعذّر الحفظ. حاول مرة أخرى. | Couldn't save. Try again. | |
| `counter` | {{count}} / {{max}} | {{count}} / {{max}} | |

## brandKits.newDialog

| Key | العربية | English | Notes |
|---|---|---|---|
| `title` | هوية جديدة | New brand kit | |
| `body` | اكتب اسم العلامة التجارية. يمكنك إضافة الألوان والملفات بعدها. | Enter the brand name. You can add colours and files next. | |
| `create` | إنشاء | Create | |
| `cancel` | إلغاء | Cancel | |

## brandKits.notFound

| Key | العربية | English | Notes |
|---|---|---|---|
| `title` | لم نجد هذه الهوية | Brand kit not found | |
| `body` | ربما حُذفت. ارجع إلى قائمة هوياتك. | It may have been deleted. Go back to your brand kits. | |
| `action` | العودة إلى علاماتي التجارية | Back to My brands | |

## brandKits.draftNote

| Key | العربية | English | Notes |
|---|---|---|---|
| `title` | لم يكتمل إعداد هذه الهوية بعد | This brand kit isn't finished yet | |
| `body` | أكملها مع «مصمم جرافيك» في المحادثة: اختر هذه الهوية وأجب عن الأسئلة. | Finish it with the Graphic designer in the chat: pick this kit and answer the questions. | |
| `action` | إكمال مع مصمم جرافيك | Finish with the Graphic designer | |

## brandKits.identity

| Key | العربية | English | Notes |
|---|---|---|---|
| `title` | الاسم | Name | |
| `body` | يظهر في قائمتك وللمصمم في المحادثة. | Shown in your list and to the designer in the chat. | |
| `label` | اسم العلامة التجارية | Brand name | |
| `save` | حفظ الاسم | Save name | |
| `required` | اكتب اسمًا للهوية. | Enter a name for the brand kit. | |

## brandKits.colors

| Key | العربية | English | Notes |
|---|---|---|---|
| `title` | الألوان | Colours | |
| `body` | رتّب الألوان من الأهم إلى الأقل أهمية. اللون الأول هو الأساسي في تصاميمك. | Order the colours from most to least important. The first is the main colour of your designs. | |
| `main` | الأهم | Main | |
| `earlier` | تقديم {{hex}} | Move {{hex}} earlier | |
| `later` | تأخير {{hex}} | Move {{hex}} later | |
| `remove` | إزالة {{hex}} | Remove {{hex}} | |
| `picker` | اختيار لون | Pick a colour | |
| `hexLabel` | رمز اللون | Colour code | |
| `add` | إضافة لون | Add colour | |
| `invalid` | اكتب رمز لون مثل #1A4B8C. | Enter a colour code such as #1A4B8C. | |
| `duplicate` | هذا اللون موجود بالفعل. | This colour is already in the palette. | |
| `full` | وصلت إلى 12 لونًا. أزل لونًا لإضافة غيره. | You have 12 colours. Remove one to add another. | |
| `suggestedTitle` | ألوان من شعارك | Colours from your logo | |
| `suggestedNote` | لا تُضاف الألوان إلا إذا ضغطت «إضافة». | Colours are added only when you press Add. | |
| `addSuggested` | إضافة | Add | |
| `addSuggestedLabel` | إضافة {{hex}} | Add {{hex}} | |
| `empty` | لا ألوان بعد. | No colours yet. | |
| `save` | حفظ الألوان | Save colours | |

## brandKits.assets

| Key | العربية | English | Notes |
|---|---|---|---|
| `title` | الملفات | Files | |
| `body` | كل ملف يُرفع ضمن مجموعته. يمكنك حذف أي ملف في أي وقت. | Each file goes in its group. You can delete any file at any time. | |
| `kinds.logo.title` | شعارات | Logos | |
| `kinds.logo.body` | شعارك بأشكاله المختلفة. نقترح عليك ألوانًا منها. | Your logo in its different forms. We suggest colours from it. | |
| `kinds.reference.title` | تصاميم سابقة | Past designs | |
| `kinds.reference.body` | أعمال سابقة يسترشد بها المصمم في الأسلوب. | Earlier work the designer follows for style. | |
| `kinds.product.title` | صور المنتجات | Product photos | |
| `kinds.product.body` | صور منتجاتك أو خدماتك. | Photos of your products or services. | |
| `kinds.guideline.title` | أدلة الهوية | Brand guidelines | |
| `kinds.guideline.body` | دليل استخدام الشعار والألوان إن وجد. | Your logo and colour guide, if you have one. | |
| `kinds.design.title` | تصميم للتعديل | Design to edit | |
| `kinds.design.body` | التصميم الذي تريد تعديله. | The design you want edited. | |
| `drop` | اسحب الملفات هنا أو اضغط للاختيار | Drop files here or click to choose | |
| `pick` | اختيار ملفات | Choose files | |
| `camera` | التقاط صورة | Take a photo | |
| `hintImages` | PNG أو JPG أو WebP أو SVG، حتى 10 ميغابايت لكل ملف | PNG, JPG, WebP or SVG, up to 10 MB each | |
| `hintGuideline` | PDF حتى 20 ميغابايت، أو صورة حتى 10 ميغابايت | PDF up to 20 MB, or an image up to 10 MB | |
| `uploading` | جارٍ رفع {{name}} | Uploading {{name}} | |
| `failed` | تعذّر رفع {{name}} | Couldn't upload {{name}} | |
| `retry` | إعادة المحاولة | Retry | |
| `dismiss` | إزالة | Remove | |
| `removeLabel` | حذف الملف {{position}} من {{group}} | Delete file {{position}} from {{group}} | |
| `pdf` | PDF | PDF | |
| `limitReached` | وصلت الهوية إلى 40 ملفًا. احذف بعض الملفات لإضافة غيرها. | This brand kit has 40 files. Delete some to add more. | |
| `previewError` | تعذّر عرض الصورة | Couldn't show the image | |
| `deleteError` | تعذّر حذف الملف. حاول مرة أخرى. | Couldn't delete the file. Try again. | |
| `uploadFailed` | تعذّر رفع الملف. تحقّق من اتصالك وحاول مرة أخرى. | Couldn't upload the file. Check your connection and try again. | |

## brandKits.profile

| Key | العربية | English | Notes |
|---|---|---|---|
| `title` | الأسلوب والتعليمات | Style and instructions | |
| `body` | يستخدمها «مصمم جرافيك» ليصمّم بصوت علامتك. كلها اختيارية. | The Graphic designer uses these to design in your brand's voice. All optional. | |
| `style` | الأسلوب البصري | Visual style | |
| `tone` | النبرة | Tone | |
| `fontStyle` | شكل الخطوط | Font style | |
| `fontStyleHint` | صف كيف تبدو خطوطك. لا نحتاج اسم الخط. | Describe how your fonts look. No font name needed. | |
| `dos` | افعل | Do | |
| `donts` | تجنّب | Avoid | |
| `addRule` | إضافة قاعدة | Add rule | |
| `ruleLabel` | {{list}}، القاعدة {{position}} | {{list}}, rule {{position}} | |
| `removeRule` | إزالة القاعدة {{position}} من {{list}} | Remove rule {{position}} from {{list}} | |
| `ruleTooLong` | القاعدة أطول من 200 حرف. | The rule is longer than 200 characters. | |
| `notes` | ملاحظات | Notes | |
| `save` | حفظ التغييرات | Save changes | |
| `tooLong` | النص أطول من المسموح. | The text is too long. | |

## brandKits.unsaved

| Key | العربية | English | Notes |
|---|---|---|---|
| `bar` | تغييرات غير محفوظة. | Unsaved changes. | |
| `discard` | تجاهل | Discard | |
| `save` | حفظ | Save | |

## brandKits.leave

| Key | العربية | English | Notes |
|---|---|---|---|
| `title` | مغادرة دون حفظ؟ | Leave without saving? | |
| `body` | لديك تغييرات غير محفوظة في هذه الهوية. إذا غادرت ستفقدها. | You have unsaved changes to this brand kit. If you leave, they will be lost. | |
| `stay` | البقاء | Stay | |
| `leave` | المغادرة دون حفظ | Leave without saving | |

## brandKits.delete

| Key | العربية | English | Notes |
|---|---|---|---|
| `title` | حذف الهوية | Delete brand kit | |
| `body` | تُحذف الهوية وجميع ملفاتها نهائيًا، ولا يمكن التراجع عن ذلك. | The kit and all its files are deleted for good. This can't be undone. | |
| `action` | حذف هذه الهوية | Delete this brand kit | |
| `confirmTitle` | حذف «{{name}}»؟ | Delete “{{name}}”? | |
| `confirmBody` | تُحذف الهوية وملفاتها نهائيًا. لا يمكن التراجع عن ذلك. | The kit and its files are deleted for good. This can't be undone. | |
| `confirm` | حذف نهائيًا | Delete for good | |
| `cancel` | إلغاء | Cancel | |
| `deleted` | حُذفت الهوية. | Brand kit deleted. | |
| `error` | تعذّر حذف الهوية. حاول مرة أخرى. | Couldn't delete the brand kit. Try again. | |

## designs

| Key | العربية | English | Notes |
|---|---|---|---|
| `title` | تصاميمي | My designs | |
| `intro` | التصاميم التي سلّمها لك «مصمم جرافيك»، الأحدث أولًا. | Designs the Graphic designer delivered to you, newest first. | |
| `brandFilter` | العلامة التجارية | Brand | |
| `allBrands` | كل العلامات | All brands | |
| `deletedBrand` | علامة محذوفة | Deleted brand | |
| `edited` | تصميم معدَّل | Edited design | |
| `version` | v{{n}} | v{{n}} | |
| `needsReview` | تحقّق من النص | Check the text | |
| `openChat` | فتح المحادثة | Open the chat | |
| `openViewer` | عرض التصميم بالحجم الكامل | View the design full size | |
| `designLabel` | التصميم {{n}} | Design {{n}} | |
| `loadMore` | تحميل المزيد | Load more | |
| `loading` | جارٍ تحميل التصاميم | Loading designs | |
| `loadError` | تعذّر تحميل التصاميم. | Couldn't load your designs. | |
| `loadMoreError` | تعذّر تحميل المزيد. | Couldn't load more. | |
| `emptyTitle` | لا تصاميم بعد | No designs yet | |
| `emptyBody` | اطلب تصميمًا من «مصمم جرافيك» في محادثة جديدة، وسيظهر هنا. | Ask the Graphic designer for a design in a new chat, and it will show here. | |
| `emptyBrand` | لا تصاميم لهذه العلامة بعد. | No designs for this brand yet. | |
| `startChat` | محادثة جديدة | New chat | |
| `imageError` | تعذّر عرض التصميم | Couldn't show the design | |

## designs.formats

| Key | العربية | English | Notes |
|---|---|---|---|
| `instagram_post` | منشور إنستغرام | Instagram post | |
| `instagram_story` | ستوري إنستغرام | Instagram story | |
| `facebook_post` | منشور فيسبوك | Facebook post | |
| `banner` | بانر | Banner | |
| `product_image` | صورة منتج | Product image | |

## designs.download

| Key | العربية | English | Notes |
|---|---|---|---|
| `action` | تنزيل | Download | |
| `options` | خيارات التنزيل | Download options | |
| `type` | النوع | Type | |
| `size` | الحجم | Size | |
| `original` | الحجم الأصلي | Original size | |
| `standard` | مقاس منصات التواصل | Social media size | |
| `jpgNote` | JPG بخلفية بيضاء. | JPG on a white background. | |
| `downloading` | جارٍ التنزيل… | Downloading… | |
| `done` | تم التنزيل. | Downloaded. | |
| `error` | تعذّر تنزيل التصميم. حاول مرة أخرى. | Couldn't download the design. Try again. | |
| `title` | تنزيل التصميم | Download the design | |
| `close` | إغلاق | Close | |

## errors

| Key | العربية | English | Notes |
|---|---|---|---|
| `ACCOUNT_DELETED` | تم حذف هذا الحساب. | This account has been deleted. | |
| `ACCOUNT_NOT_ACTIVE` | حساب المستخدم غير نشط. | The user's account is not active. | |
| `ACCOUNT_NOT_FOUND` | لم يتم العثور على حسابك. يرجى التواصل مع الدعم. | Your account was not found. Please contact support. | |
| `ACCOUNT_SUSPENDED` | تم إيقاف حسابك مؤقتًا. يرجى التواصل مع الدعم. | Your account is suspended. Please contact support. | |
| `AGENT_NOT_AVAILABLE` | هذا المساعد غير متاح في باقتك. | This assistant isn't available on your plan. | |
| `AGENT_NOT_FOUND` | لم يتم العثور على هذا المساعد. | This agent was not found. | |
| `AGENT_NOT_READY` | لا يمكن إنشاء التصاميم الآن. حاول لاحقًا. | Designs can't be made right now. Please try again later. | |
| `AGENT_RUN_NOT_FOUND` | لم يتم العثور على هذا التشغيل. | This agent run was not found. | |
| `AGENT_STEP_MISMATCH` | تغيّرت المحادثة. حدِّث الصفحة وأجب على السؤال الأخير. | The conversation moved on. Refresh and answer the latest question. | |
| `ATTACHMENT_ALREADY_USED` | أُرسلت هذه الصورة بالفعل في رسالة أخرى. أرفقها مرة أخرى. | This image was already sent in another message. Attach it again. | |
| `ATTACHMENT_NOT_FOUND` | لم يتم العثور على الصورة. يرجى إرفاقها مرة أخرى. | Image not found. Please attach it again. | |
| `ATTACHMENT_TOO_LARGE` | حجم الصورة أكبر من 5 ميغابايت. | The image is larger than 5 MB. | |
| `ATTACHMENT_TYPE_NOT_ALLOWED` | هذا النوع من الملفات غير مدعوم. أرسل صورة JPG أو PNG أو WebP. | This file type isn't supported. Send a JPG, PNG or WebP image. | |
| `BRAND_ASSET_LIMIT_REACHED` | وصلت إلى الحد الأقصى للملفات في هذه الهوية (40 ملفًا). احذف بعض الملفات أولًا. | This brand kit already has the maximum of 40 files. Delete some first. | |
| `BRAND_ASSET_NOT_FOUND` | لم يتم العثور على هذا الملف. | This file was not found. | |
| `BRAND_ASSET_TOO_LARGE` | الملف كبير جدًا. الحد الأقصى 10 ميغابايت للصور و20 ميغابايت لملفات PDF. | The file is too large. Images can be up to 10 MB and PDFs up to 20 MB. | |
| `BRAND_ASSET_TYPE_NOT_ALLOWED` | هذا النوع من الملفات غير مدعوم. أرسل صورة JPG أو PNG أو WebP أو SVG، أو ملف PDF. | This file type isn't supported. Send a JPG, PNG, WebP or SVG image, or a PDF. | |
| `BRAND_KIT_LIMIT_REACHED` | وصلت إلى الحد الأقصى لعدد هويات العلامة التجارية في باقتك. احذف واحدة أو رقِّ باقتك. | You've reached your plan's brand kit limit. Delete one or upgrade your plan. | |
| `BRAND_KIT_NOT_FOUND` | لم يتم العثور على هوية العلامة التجارية هذه. | This brand kit was not found. | |
| `CANNOT_MODIFY_SELF` | لا يمكنك تنفيذ هذا الإجراء على حسابك. | You can't do this to your own account. | |
| `CATALOG_FINDING_NOT_APPLICABLE` | لا يوجد سعر مقترح لتطبيقه في هذه الملاحظة. | This finding has no proposed price to apply. | |
| `CATALOG_FINDING_NOT_FOUND` | لم يتم العثور على هذه الملاحظة. | Finding not found. | |
| `CATALOG_FINDING_NOT_OPEN` | تمت معالجة هذه الملاحظة بالفعل. | This finding has already been handled. | |
| `CATALOG_FINDING_OUTDATED` | تغيّر السعر منذ هذه الملاحظة. شغّل المزامنة مرة أخرى. | The price changed since this finding. Run the sync again. | |
| `CATALOG_SYNC_RUNNING` | المزامنة تعمل الآن. انتظر حتى تنتهي. | A sync is already running. Wait for it to finish. | |
| `CONTENT_BLOCKED` | تعذّر إكمال الرد بسبب سياسة المحتوى. جرّب صياغة مختلفة. | The answer was stopped by the content policy. Try rephrasing. | |
| `CONTEXT_TOO_LONG` | الرسالة طويلة جدًا لهذا الوضع. يرجى اختصارها. | This message is too long for this mode. Please shorten it. | |
| `CONVERSATION_BUSY` | لا يزال الرد السابق قيد الكتابة. انتظر حتى ينتهي. | The previous answer is still being written. Please wait for it to finish. | |
| `CONVERSATION_IS_AGENT` | هذه محادثة مع مساعد. أجب على أسئلته، أو ابدأ محادثة جديدة للدردشة. | This conversation is with an assistant. Answer its questions, or start a new chat. | |
| `CONVERSATION_NOT_AGENT` | هذه المحادثة ليست مع مساعد. | This conversation isn't with an assistant. | |
| `CONVERSATION_NOT_FOUND` | لم يتم العثور على المحادثة. | Conversation not found. | |
| `DEFAULT_PLAN_REQUIRED` | يجب أن تكون هناك باقة افتراضية دائمًا. | There must always be a default plan. | |
| `DESIGN_IN_PROGRESS` | ما زلت أعمل على تصاميمك. انتظر حتى تظهر. | I'm still working on your designs. Wait until they appear. | |
| `DESIGN_NOT_FOUND` | لم يتم العثور على هذا التصميم. | This design was not found. | |
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
| `MODE_NO_IMAGE_SUPPORT` | هذا الوضع لا يقرأ الصور. اختر وضعًا آخر لإرسال الصورة. | This mode can't read images. Choose another mode to send the image. | |
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
| `PROVIDER_KEY_MISSING` | لم يتم تعيين مفتاح لهذا المزوّد بعد. | This provider has no API key yet. | |
| `PROVIDER_KEY_NOT_USED` | هذا المزوّد لا يستخدم مفتاحًا. | This provider doesn't use a key. | |
| `PROVIDER_MISCONFIGURED` | إعداد مزوّد الذكاء الاصطناعي غير صحيح (المفتاح أو النموذج). | The AI provider is misconfigured (key or model). | |
| `PROVIDER_NOT_FOUND` | لم يتم العثور على المزوّد. | Provider not found. | |
| `PROVIDER_TIMEOUT` | استغرق الرد وقتًا أطول من المتوقع. يرجى المحاولة مرة أخرى. | The answer took too long. Please try again. | |
| `PROVIDER_UNAVAILABLE` | الخدمة مشغولة حاليًا. يرجى المحاولة بعد قليل. | The service is busy right now. Please try again shortly. | |
| `RATE_LIMITED` | أرسلت رسائل كثيرة خلال وقت قصير. انتظر قليلًا ثم حاول مرة أخرى. | You're sending messages too quickly. Please wait a moment and try again. | |
| `TOO_MANY_ATTACHMENTS` | يمكنك إرفاق 3 صور كحد أقصى في كل رسالة. | You can attach up to 3 images per message. | |
| `UNAUTHENTICATED` | يرجى تسجيل الدخول للمتابعة. | Please sign in to continue. | |
| `USER_NOT_FOUND` | لم يتم العثور على المستخدم. | User not found. | |
| `VALIDATION_FAILED` | بعض البيانات غير صحيحة. يرجى المراجعة والمحاولة مرة أخرى. | Some information is invalid. Please check and try again. | |
| `VOUCHER_ALREADY_REDEEMED` | لقد استخدمت هذا الكود من قبل. | You've already used this code. | |
| `VOUCHER_BATCH_NOT_FOUND` | لم يتم العثور على هذه المجموعة من الأكواد. | This voucher batch was not found. | |
| `VOUCHER_CODE_TAKEN` | يوجد كود بهذا الاسم بالفعل. | A voucher with this code already exists. | |
| `VOUCHER_EXPIRED` | انتهت صلاحية هذا الكود أو لم يبدأ بعد. | This code has expired or is not active yet. | |
| `VOUCHER_NOT_ELIGIBLE` | لا يمكنك استخدام هذا الكود على حسابك. | This code can't be used on your account. | |
| `VOUCHER_NOT_FOUND` | هذا الكود غير صحيح. تأكد منه وحاول مرة أخرى. | This code isn't valid. Check it and try again. | |
| `VOUCHER_USED_UP` | تم استخدام هذا الكود بالكامل. | This code has been fully used. | |
