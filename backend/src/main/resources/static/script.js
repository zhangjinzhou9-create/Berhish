const pages = {
    home: document.getElementById('homePage'),
    me: document.getElementById('mePage'),
    account: document.getElementById('accountPage')
};

const pageMeta = {
    home: { number: '01 / 03', labelKey: 'navHome', contextKey: 'folioHome' },
    me: { number: '02 / 03', labelKey: 'navMe', contextKey: 'folioPortfolio' },
    account: { number: '03 / 03', labelKey: 'account', contextKey: 'folioAccount' }
};

const defaultLocation = { country: 'Japan', city: 'Kyoto' };
const locationStorageKey = 'campusFlowLocation';
const languageStorageKey = 'campusFlowLanguage';
let currentProfile = null;
let currentHomeData = null;
let currentOAuthUser = null;
let currentAccount = null;
let currentPortfolio = [];
let currentPortfolioOwnerName = '';
let csrfToken = '';
let profileBeforeEdit = null;
const storedLanguage = localStorage.getItem(languageStorageKey);
let currentLanguage = ['en', 'ja', 'zh'].includes(storedLanguage) ? storedLanguage : 'en';

const effects = window.CampusFlowEffects || {
    runEntrance() {},
    runSaveFeedback() {},
    bindShortcutHover() {}
};

const translations = {
    en: {
        navHome: 'Today', navMe: 'Portfolio',
        languageLabel: 'Language', localDate: 'LOCAL DATE', account: 'Account',
        folioHome: 'Kyoto · live conditions', folioPortfolio: 'Selected work · public view', folioAccount: 'Guest · browse freely',
        accountEyebrow: 'ACCOUNT / SIGN IN', accountTitle: 'Welcome back.',
        accountIntro: 'Sign in to edit your profile and save your usual place. You can keep browsing as a guest.',
        todayChapter: 'TODAY / KYOTO', todayHeadline: 'A quiet day in', headlineSpacer: ' ', headlinePunctuation: '.', todayLead: 'Weather first. Everything else can wait.',
        peopleLabel: 'people', todayPhotoMain: 'red lines / Kyoto, 2026', todayPhotoSecond: 'after the rain', todayPhotoThird: 'wind from the water',
        portfolioPublicView: 'PORTFOLIO / PUBLIC VIEW', portfolioIndex: 'ABOUT / WORKS',
        portraitMainCaption: 'spring beside the water', portraitSmallCaption: 'one leaf / late season',
        portfolioChapter: 'PORTFOLIO / SELECTED WORK', selectedWork: 'SELECTED WORK',
        openSignIn: 'Sign in / Create account', manageAccount: 'Manage account', close: 'Close',
        ownerEditMode: 'OWNER EDIT MODE', editSheetTitle: 'Edit your page.', addWork: 'ADD A WORK',
        addWorkHelp: 'Upload an image, audio file, or text file', workTypeLabel: 'Category', descriptionLabel: 'Description',
        mediaTypeLabel: 'Media type', chooseFileLabel: 'Choose file', mediaImage: 'Image', mediaAudio: 'Audio', mediaText: 'Text',
        layoutSizeLabel: 'Display size', layoutStandard: 'Standard', layoutWide: 'Wide', layoutTall: 'Tall',
        mediaFitLabel: 'Image display', fitContain: 'Show complete image', fitCover: 'Fill the frame',
        imageUploadHint: 'JPG, PNG, GIF, or WebP · up to 15 MB', audioUploadHint: 'MP3, WAV, OGG, or M4A · up to 25 MB',
        textUploadHint: 'TXT, Markdown, CSV, or JSON · up to 5 MB', addToPortfolio: '+ Upload to portfolio',
        chooseUploadFile: 'Choose a local file before uploading.', uploadingWork: 'Uploading your work…',
        saveDisplay: 'Save display', removeWork: 'Remove', displaySaved: 'Work display updated.',
        showPassword: 'SHOW', hidePassword: 'HIDE',
        statusLabel: 'Status', accountImageCaption: 'KYOTO / EVENING',
        finding: 'Finding\u2026', updatedNow: 'updated just now', limitedUpdate: 'limited update',
        checkingSignIn: 'Checking sign-in…', checkingSignInDetail: 'This only takes a moment.', checking: 'Checking',
        githubSigninNote: 'Use your GitHub identity and public profile.', googleSigninNote: 'Use your Google name, email, and profile image.',
        browseMode: 'Browse mode', signedInStatus: 'Signed in', localAccount: 'Local account',
        roleLabel: 'Role', accountSummary: 'Account summary', visibilityLabel: 'Visibility',
        localAccountTitle: 'Username and password', localAccountCopy: 'Create an account or sign in to edit your own page.',
        authReady: 'Use at least 12 characters for a new password.', continueGuest: 'Continue as guest',
        thirdPartyOption: 'Or use a third-party account',
        guestProfileTitle: 'Visual diary / web design student',
        guestProfileSummary: 'A small collection of photographs, sketches, and web experiments made between classes and walks through Kyoto.',
        guestWork01Title: 'Blue hour platform', guestWork01Description: 'A quiet station study just before the evening light disappears.',
        guestWork02Title: 'Garden observer', guestWork02Description: 'A black cat framed by summer grass and fallen leaves.',
        guestWork03Title: 'Window notes', guestWork03Description: 'Reflections, signs, and passing light collected during an ordinary afternoon.',
        guestWork04Title: 'Pond after rain', guestWork04Description: 'Soft ripples and muted greens after a short shower.',
        adminTitle: 'User management', adminCopy: 'Administrator accounts can review, disable, or remove test accounts.',
        deleteAccount: 'DELETE', deleteAccountConfirm: 'Delete this account and all of its saved work?',
        loadingLocation: 'Loading profile location...',
        countryLabel: 'Country', cityLabel: 'City', searchBtn: 'Search', saveToProfile: 'Save to Profile',
        locationHelp: 'Search is temporary. Save to Profile updates your default campus location.', signInToSaveLocation: 'Sign in to save location',
        homeInitialStatus: "Choose a location to see today's conditions.",
        currentWeather: 'Current Weather', cityMetric: 'City', windMetric: 'Wind', trendMetric: 'Trend',
        countryInfo: 'Country', nameMetric: 'Name', capitalMetric: 'Capital', regionMetric: 'Region',
        populationMetric: 'Population', languagesMetric: 'Languages', currenciesMetric: 'Currencies',
        dailyTip: 'Daily Tip', clothing: 'Clothing', reminder: 'Reminder',
        quickEyebrow: 'Quick Access', quickTitle: 'Project Entrances',
        quickSubtitle: 'Local APIs, OAuth targets, and classroom evidence links are arranged by project workflow.',
        projectApiLabel: 'Project API Matrix', studyLinksEyebrow: 'Daily Study Links',
        studyLinksCopy: 'Research, translation and note-taking shortcuts stay visible without competing with the main content.',
        oauthEyebrow: 'Sign in', oauthTitle: 'Your Account', oauthNotConnected: 'Not signed in',
        oauthChoose: 'Choose an account to continue. You can still browse as a guest.', notLoggedIn: 'Guest',
        noOAuthUser: 'Guest mode', oauthUserMeta: 'Sign in to edit your profile and save your usual place.',
        loginGithub: 'Login with GitHub', loginGoogle: 'Login with Google', logout: 'Logout',
        refreshStatus: 'Refresh Status', usernameLabel: 'Username',
        passwordLabel: 'Password', userTypeLabel: 'User Type', login: 'Login', register: 'Register',
        profileEyebrow: 'Personal Workspace', profileTitle: 'My Profile', profileSubtitle: 'Keep your student profile current and export a clean resume when you need it.', nameLabel: 'Name',
        studentIdLabel: 'Student ID', emailLabel: 'Email', phoneLabel: 'Phone', titleLabel: 'Title', identityTitleLabel: 'Identity',
        roleStudentCreator: 'Student creator', rolePhotographer: 'Photographer', roleArtist: 'Artist',
        roleNovelist: 'Novelist', roleDesigner: 'Designer', roleFilmmaker: 'Filmmaker', roleMusician: 'Musician',
        summaryLabel: 'Summary', edit: 'Edit', save: 'Save', cancel: 'Cancel', exportPrint: 'Export PDF / Print Resume',
        ownerModeLabel: 'Owner Editing Mode', publicResumeLabel: 'Public Resume Preview', profileInitialStatus: 'Public preview hides private fields.', profileVisitorNote: 'Owner editing is locked. Sign in to edit private details.', profileOwnerNote: 'Owner editing mode is active. Private details are visible only to you.', signInToEdit: 'Sign in to edit your profile.', education: 'Education', skills: 'Skills',
        projects: 'Projects', languages: 'Languages', aboutMe: 'About Me',
        thirdPartyLogin: 'Account & Connected Service', modalTitle: 'Your Account',
        modalCopy: 'Sign in to edit your profile and connect one useful campus service.',
        signGoogle: 'Continue with Google', signGithub: 'Continue with GitHub', googlePurpose: 'Use your Google identity, name, email, and profile image.', githubPurpose: 'Use your GitHub identity and public profile.',
        calendarAction: 'View upcoming Calendar events', githubAction: 'View GitHub profile and repositories', connectedWith: 'Connected with', noUpcomingEvents: 'No upcoming events were returned.', noRepositories: 'No public repositories were returned.', serviceLoadFailed: 'Connected service could not be loaded.',
        loadingHome: 'Loading country information and weather...', updated: 'Updated',
        fallbackHome: 'Using fallback data, please check city name or network.',
        homeApiFailed: 'Home API failed. Please confirm that the backend is running.',
        savingLocation: 'Saving location to profile...', locationSaved: 'Location saved to profile. Home page refreshed.',
        editingProfile: 'You can edit the profile now.', saving: 'Saving...',
        profileSaved: 'Saved successfully. Home location has been synchronized.',
        noEducation: 'No education records returned.', noSkills: 'No skills returned.',
        noProjects: 'No projects returned.', noLanguages: 'No languages returned.',
        databaseStatus: 'Database status', databaseFallback: 'fallback profile data', databaseAvailable: 'available',
        oauthRedirecting: 'Redirecting to', oauthWaiting: 'Waiting for authorization',
        oauthLoggedIn: 'Signed in with', oauthAuthorizedAs: 'Account',
        oauthStatusFailed: 'Could not check sign-in', oauthApiLoading: 'Loading',
        oauthApiSucceeded: 'OAuth API verification succeeded', oauthApiReturned: 'returned a valid response.',
        oauthApiFailed: 'OAuth API verification failed', oauthProviderRequired: 'Please login with the correct provider first.',
        registered: 'Registered',
        oauthLoginFailed: 'Sign-in failed', oauthProviderIncomplete: 'The sign-in provider did not complete authorization.',
        oauthLoggedOut: 'Signed out', oauthLoggedOutDetail: 'You can continue browsing as a guest.',
        shortcutLocalHomeTitle: 'Local Home API', shortcutLocalHomeDesc: 'Live country, city, weather and life-tip response used by the first screen.',
        shortcutLocalProfileTitle: 'Local Profile API', shortcutLocalProfileDesc: 'Profile data source for Me, resume preview and location persistence.',
        shortcutApiDocsTitle: 'API Docs', shortcutApiDocsDesc: 'Endpoint documentation for quick verification.',
        shortcutOpenApiTitle: 'OpenAPI', shortcutOpenApiDesc: 'OpenAPI YAML for checking request and response contracts.',
        shortcutKcgiTitle: 'KCGI', shortcutKcgiDesc: 'School context for the Campus Flow profile and report screenshots.',
        shortcutGithubTitle: 'GitHub', shortcutGithubDesc: 'OAuth provider and repository API target.',
        shortcutCalendarTitle: 'Google Calendar', shortcutCalendarDesc: 'Google OAuth provider and Calendar API target.',
        shortcutMeteoTitle: 'Open-Meteo', shortcutMeteoDesc: 'Geocoding and weather source used by Home.',
        shortcutCountriesTitle: 'REST Countries', shortcutCountriesDesc: 'Country information source with local fallback support.',
        shortcutCore: 'Core API', shortcutDocs: 'Docs', shortcutProvider: 'Provider', shortcutData: 'Data Source', open: 'Open'
    },
    zh: {
        navHome: '\u4eca\u65e5', navMe: '\u4f5c\u54c1\u6863\u6848',
        languageLabel: '\u8bed\u8a00', localDate: '\u5f53\u5730\u65e5\u671f', account: '\u8d26\u6237',
        folioHome: '\u4eac\u90fd \u00b7 \u5b9e\u65f6\u72b6\u51b5', folioPortfolio: '\u7cbe\u9009\u4f5c\u54c1 \u00b7 \u516c\u5f00\u9875', folioAccount: '\u8bbf\u5ba2 \u00b7 \u81ea\u7531\u6d4f\u89c8',
        accountEyebrow: '\u8d26\u6237 / \u767b\u5f55', accountTitle: '\u6b22\u8fce\u56de\u6765\u3002',
        accountIntro: '\u767b\u5f55\u540e\u53ef\u4ee5\u7f16\u8f91\u8d44\u6599\u5e76\u4fdd\u5b58\u5e38\u7528\u5730\u70b9\uff1b\u672a\u767b\u5f55\u4e5f\u53ef\u4ee5\u7ee7\u7eed\u6d4f\u89c8\u3002',
        todayChapter: '\u4eca\u65e5 / \u4eac\u90fd', todayHeadline: '\u5b89\u9759\u7684\u4e00\u5929\uff0c', headlineSpacer: '', headlinePunctuation: '\u3002', todayLead: '\u5148\u770b\u5929\u6c14\uff0c\u5176\u4ed6\u4e8b\u7a0d\u540e\u518d\u8bf4\u3002',
        peopleLabel: '\u4eba', todayPhotoMain: '\u7ea2\u8272\u7ebf\u6761 / \u4eac\u90fd\uff0c2026', todayPhotoSecond: '\u96e8\u540e', todayPhotoThird: '\u6c34\u9762\u6765\u7684\u98ce',
        portfolioPublicView: '\u4f5c\u54c1\u96c6 / \u516c\u5f00\u9875', portfolioIndex: '\u5173\u4e8e / \u4f5c\u54c1',
        portraitMainCaption: '\u6cb3\u8fb9\u7684\u6625\u5929', portraitSmallCaption: '\u5b63\u8282\u672b\u7684\u4e00\u7247\u53f6',
        portfolioChapter: '\u4f5c\u54c1\u96c6 / \u7cbe\u9009', selectedWork: '\u7cbe\u9009\u4f5c\u54c1',
        openSignIn: '\u767b\u5f55 / \u6ce8\u518c', manageAccount: '\u7ba1\u7406\u8d26\u6237', close: '\u5173\u95ed',
        ownerEditMode: '\u9875\u9762\u7f16\u8f91', editSheetTitle: '\u7f16\u8f91\u4f60\u7684\u9875\u9762\u3002', addWork: '\u6dfb\u52a0\u4f5c\u54c1',
        addWorkHelp: '\u4ece\u672c\u5730\u4e0a\u4f20\u56fe\u50cf\u3001\u97f3\u9891\u6216\u6587\u672c\u6587\u4ef6', workTypeLabel: '\u4f5c\u54c1\u5206\u7c7b', descriptionLabel: '\u63cf\u8ff0',
        mediaTypeLabel: '\u6587\u4ef6\u7c7b\u578b', chooseFileLabel: '\u9009\u62e9\u6587\u4ef6', mediaImage: '\u56fe\u50cf', mediaAudio: '\u97f3\u9891', mediaText: '\u6587\u672c',
        layoutSizeLabel: '\u5c55\u793a\u5c3a\u5bf8', layoutStandard: '\u6807\u51c6', layoutWide: '\u5bbd\u5e45', layoutTall: '\u7ad6\u5e45',
        mediaFitLabel: '\u56fe\u50cf\u663e\u793a', fitContain: '\u5b8c\u6574\u663e\u793a', fitCover: '\u586b\u6ee1\u753b\u6846',
        imageUploadHint: 'JPG\u3001PNG\u3001GIF \u6216 WebP \u00b7 \u6700\u5927 15 MB', audioUploadHint: 'MP3\u3001WAV\u3001OGG \u6216 M4A \u00b7 \u6700\u5927 25 MB',
        textUploadHint: 'TXT\u3001Markdown\u3001CSV \u6216 JSON \u00b7 \u6700\u5927 5 MB', addToPortfolio: '+ \u4e0a\u4f20\u5230\u4f5c\u54c1\u96c6',
        chooseUploadFile: '\u8bf7\u5148\u9009\u62e9\u4e00\u4e2a\u672c\u5730\u6587\u4ef6\u3002', uploadingWork: '\u6b63\u5728\u4e0a\u4f20\u4f5c\u54c1\u2026',
        saveDisplay: '\u4fdd\u5b58\u5c55\u793a', removeWork: '\u5220\u9664', displaySaved: '\u4f5c\u54c1\u5c55\u793a\u5df2\u66f4\u65b0\u3002',
        showPassword: '\u663e\u793a', hidePassword: '\u9690\u85cf',
        statusLabel: '\u72b6\u6001', accountImageCaption: '\u4eac\u90fd / \u508d\u665a',
        finding: '\u67e5\u8be2\u4e2d\u2026', updatedNow: '\u521a\u521a\u66f4\u65b0', limitedUpdate: '\u6709\u9650\u66f4\u65b0',
        checkingSignIn: '\u6b63\u5728\u68c0\u67e5\u767b\u5f55\u72b6\u6001\u2026', checkingSignInDetail: '\u901a\u5e38\u53ea\u9700\u7247\u523b\u3002', checking: '\u68c0\u67e5\u4e2d',
        githubSigninNote: '\u4f7f\u7528 GitHub \u8eab\u4efd\u548c\u516c\u5f00\u8d44\u6599\u3002', googleSigninNote: '\u4f7f\u7528 Google \u59d3\u540d\u3001\u90ae\u7bb1\u548c\u5934\u50cf\u3002',
        browseMode: '\u6d4f\u89c8\u6a21\u5f0f', signedInStatus: '\u5df2\u767b\u5f55', localAccount: '\u672c\u5730\u8d26\u53f7',
        roleLabel: '\u89d2\u8272', accountSummary: '\u8d26\u6237\u6982\u89c8', visibilityLabel: '\u53ef\u89c1\u8303\u56f4',
        localAccountTitle: '\u7528\u6237\u540d\u548c\u5bc6\u7801', localAccountCopy: '\u6ce8\u518c\u6216\u767b\u5f55\u540e\u5373\u53ef\u7f16\u8f91\u81ea\u5df1\u7684\u9875\u9762\u3002',
        authReady: '\u65b0\u5bc6\u7801\u81f3\u5c11\u4f7f\u7528 12 \u4e2a\u5b57\u7b26\u3002', continueGuest: '\u4ee5\u8bbf\u5ba2\u8eab\u4efd\u7ee7\u7eed',
        thirdPartyOption: '\u6216\u4f7f\u7528\u7b2c\u4e09\u65b9\u8d26\u53f7',
        guestProfileTitle: '\u89c6\u89c9\u65e5\u8bb0 / \u7f51\u9875\u8bbe\u8ba1\u5b66\u751f',
        guestProfileSummary: '\u6536\u96c6\u8bfe\u95f4\u4e0e\u4eac\u90fd\u6563\u6b65\u9014\u4e2d\u5b8c\u6210\u7684\u6444\u5f71\u3001\u901f\u5199\u548c\u7f51\u9875\u5b9e\u9a8c\u3002',
        guestWork01Title: '\u84dd\u8c03\u65f6\u523b\u7684\u7ad9\u53f0', guestWork01Description: '\u591c\u8272\u843d\u4e0b\u524d\uff0c\u8f66\u7ad9\u7247\u523b\u7684\u5b89\u9759\u8bb0\u5f55\u3002',
        guestWork02Title: '\u5ead\u9662\u89c2\u5bdf\u8005', guestWork02Description: '\u590f\u8349\u4e0e\u843d\u53f6\u4e4b\u95f4\u7684\u9ed1\u732b\u3002',
        guestWork03Title: '\u7a97\u8fb9\u624b\u8bb0', guestWork03Description: '\u666e\u901a\u5348\u540e\u6536\u96c6\u7684\u53cd\u5149\u3001\u6807\u8bb0\u4e0e\u6d41\u52a8\u5149\u5f71\u3002',
        guestWork04Title: '\u96e8\u540e\u6c60\u5858', guestWork04Description: '\u77ed\u6682\u9635\u96e8\u540e\u7684\u5fae\u6ce2\u548c\u4f4e\u9971\u548c\u7eff\u8272\u3002',
        adminTitle: '\u7528\u6237\u7ba1\u7406', adminCopy: '\u7ba1\u7406\u5458\u53ef\u4ee5\u67e5\u770b\u3001\u505c\u7528\u6216\u5220\u9664\u6d4b\u8bd5\u8d26\u6237\u3002',
        deleteAccount: '\u5220\u9664', deleteAccountConfirm: '\u5220\u9664\u8be5\u8d26\u6237\u53ca\u5176\u6240\u6709\u5df2\u4fdd\u5b58\u4f5c\u54c1\uff1f',
        loadingLocation: '\u6b63\u5728\u8bfb\u53d6\u4e2a\u4eba\u4f4d\u7f6e...',
        countryLabel: '\u56fd\u5bb6', cityLabel: '\u57ce\u5e02', searchBtn: '\u67e5\u8be2', saveToProfile: '\u4fdd\u5b58\u5230\u8d44\u6599',
        locationHelp: '\u67e5\u8be2\u4ec5\u7528\u4e8e\u4e34\u65f6\u67e5\u770b\uff1b\u201c\u4fdd\u5b58\u5230\u8d44\u6599\u201d\u4f1a\u66f4\u65b0\u4f60\u7684\u9ed8\u8ba4\u6821\u56ed\u5730\u70b9\u3002', signInToSaveLocation: '\u767b\u5f55\u540e\u4fdd\u5b58\u5730\u70b9',
        homeInitialStatus: '\u9009\u62e9\u5730\u70b9\u540e\u67e5\u770b\u4eca\u65e5\u4fe1\u606f\u3002',
        currentWeather: '\u5f53\u524d\u5929\u6c14', cityMetric: '\u57ce\u5e02', windMetric: '\u98ce\u901f', trendMetric: '\u8d8b\u52bf',
        countryInfo: '\u56fd\u5bb6\u4fe1\u606f', nameMetric: '\u540d\u79f0', capitalMetric: '\u9996\u90fd', regionMetric: '\u5730\u533a',
        populationMetric: '\u4eba\u53e3', languagesMetric: '\u8bed\u8a00', currenciesMetric: '\u8d27\u5e01',
        dailyTip: '\u4eca\u65e5\u63d0\u793a', clothing: '\u7a7f\u8863\u5efa\u8bae', reminder: '\u63d0\u9192',
        quickEyebrow: '\u5feb\u901f\u5165\u53e3', quickTitle: '\u9879\u76ee\u5165\u53e3',
        quickSubtitle: '\u672c\u5730 API\u3001OAuth \u76ee\u6807\u548c\u8bfe\u5802\u9a8c\u6536\u94fe\u63a5\u6309\u7167\u9879\u76ee\u5de5\u4f5c\u6d41\u6392\u5217\u3002',
        projectApiLabel: '\u9879\u76ee API \u77e9\u9635', studyLinksEyebrow: '\u65e5\u5e38\u5b66\u4e60\u5165\u53e3',
        studyLinksCopy: '\u8bfe\u5802\u3001\u68c0\u7d22\u3001\u7ffb\u8bd1\u548c\u7b14\u8bb0\u94fe\u63a5\u4fdd\u6301\u53ef\u89c1\uff0c\u4f46\u4e0d\u62a2\u5360\u9879\u76ee API \u5361\u7247\u7684\u4e3b\u89c6\u89c9\u3002',
        oauthEyebrow: '\u767b\u5f55', oauthTitle: '\u6211\u7684\u8d26\u6237', oauthNotConnected: '\u5c1a\u672a\u767b\u5f55',
        oauthChoose: '\u9009\u62e9\u4e00\u4e2a\u8d26\u6237\u7ee7\u7eed\uff1b\u672a\u767b\u5f55\u4e5f\u53ef\u4ee5\u6d4f\u89c8\u3002', notLoggedIn: '\u8bbf\u5ba2',
        noOAuthUser: '\u8bbf\u5ba2\u6a21\u5f0f', oauthUserMeta: '\u767b\u5f55\u540e\u53ef\u4ee5\u7f16\u8f91\u8d44\u6599\u5e76\u4fdd\u5b58\u5e38\u7528\u5730\u70b9\u3002',
        loginGithub: '\u4f7f\u7528 GitHub \u767b\u5f55', loginGoogle: '\u4f7f\u7528 Google \u767b\u5f55', logout: '\u9000\u51fa', refreshStatus: '\u5237\u65b0\u72b6\u6001',
        usernameLabel: '\u7528\u6237\u540d', passwordLabel: '\u5bc6\u7801', userTypeLabel: '\u7528\u6237\u7c7b\u578b', login: '\u767b\u5f55', register: '\u6ce8\u518c',
        profileEyebrow: '\u4e2a\u4eba\u5de5\u4f5c\u533a', profileTitle: '\u6211\u7684\u8d44\u6599', profileSubtitle: '\u7ef4\u62a4\u5b66\u751f\u8d44\u6599\uff0c\u5e76\u5728\u9700\u8981\u65f6\u5bfc\u51fa\u6574\u6d01\u7684\u7b80\u5386\u3002', nameLabel: '\u59d3\u540d', studentIdLabel: '\u5b66\u53f7', emailLabel: '\u90ae\u7bb1', phoneLabel: '\u7535\u8bdd', titleLabel: '\u6807\u9898', identityTitleLabel: '\u8eab\u4efd\u6807\u9898', summaryLabel: '\u7b80\u4ecb',
        roleStudentCreator: '\u5b66\u751f\u521b\u4f5c\u8005', rolePhotographer: '\u6444\u5f71\u5bb6', roleArtist: '\u753b\u5e08',
        roleNovelist: '\u5c0f\u8bf4\u5bb6', roleDesigner: '\u8bbe\u8ba1\u5e08', roleFilmmaker: '\u5f71\u50cf\u521b\u4f5c\u8005', roleMusician: '\u97f3\u4e50\u521b\u4f5c\u8005',
        edit: '\u7f16\u8f91', save: '\u4fdd\u5b58', cancel: '\u53d6\u6d88', exportPrint: '\u5bfc\u51fa PDF / \u6253\u5370\u7b80\u5386', ownerModeLabel: '\u6240\u6709\u8005\u7f16\u8f91\u6a21\u5f0f', publicResumeLabel: '\u516c\u5f00\u7b80\u5386\u9884\u89c8', profileInitialStatus: '\u516c\u5f00\u9884\u89c8\u4e0d\u663e\u793a\u79c1\u5bc6\u5b57\u6bb5\u3002', profileVisitorNote: '\u6240\u6709\u8005\u7f16\u8f91\u5f53\u524d\u5df2\u9501\u5b9a\u3002\u767b\u5f55\u540e\u53ef\u4ee5\u4fee\u6539\u79c1\u5bc6\u8d44\u6599\u3002', profileOwnerNote: '\u6240\u6709\u8005\u7f16\u8f91\u6a21\u5f0f\u5df2\u542f\u7528\uff0c\u79c1\u5bc6\u8d44\u6599\u4ec5\u5bf9\u4f60\u53ef\u89c1\u3002', signInToEdit: '\u767b\u5f55\u540e\u624d\u80fd\u7f16\u8f91\u8d44\u6599\u3002',
        education: '\u6559\u80b2\u7ecf\u5386', skills: '\u6280\u80fd', projects: '\u9879\u76ee', languages: '\u8bed\u8a00', aboutMe: '\u5173\u4e8e\u6211',
        thirdPartyLogin: '\u8d26\u6237\u4e0e\u8fde\u63a5\u670d\u52a1', modalTitle: '\u6211\u7684\u8d26\u6237', modalCopy: '\u767b\u5f55\u540e\u53ef\u4ee5\u7f16\u8f91\u8d44\u6599\uff0c\u5e76\u8fde\u63a5\u4e00\u9879\u6709\u7528\u7684\u6821\u56ed\u670d\u52a1\u3002',
        signGoogle: '\u4f7f\u7528 Google \u7ee7\u7eed', signGithub: '\u4f7f\u7528 GitHub \u7ee7\u7eed', googlePurpose: '\u4f7f\u7528 Google \u8eab\u4efd\u3001\u59d3\u540d\u3001\u90ae\u7bb1\u548c\u5934\u50cf\u767b\u5f55\u3002', githubPurpose: '\u4f7f\u7528 GitHub \u8eab\u4efd\u548c\u516c\u5f00\u8d44\u6599\u767b\u5f55\u3002', calendarAction: '\u67e5\u770b\u8fd1\u671f Calendar \u65e5\u7a0b', githubAction: '\u67e5\u770b GitHub \u8d44\u6599\u548c\u4ed3\u5e93', connectedWith: '\u5df2\u8fde\u63a5', noUpcomingEvents: '\u6ca1\u6709\u8fd4\u56de\u8fd1\u671f\u65e5\u7a0b\u3002', noRepositories: '\u6ca1\u6709\u8fd4\u56de\u516c\u5f00\u4ed3\u5e93\u3002', serviceLoadFailed: '\u65e0\u6cd5\u8bfb\u53d6\u5df2\u8fde\u63a5\u7684\u670d\u52a1\u3002', loadingHome: '\u6b63\u5728\u8bfb\u53d6\u56fd\u5bb6\u4fe1\u606f\u548c\u5929\u6c14...', updated: '\u5df2\u66f4\u65b0',
        fallbackHome: '\u6b63\u5728\u4f7f\u7528\u5907\u7528\u6570\u636e\uff0c\u8bf7\u68c0\u67e5\u57ce\u5e02\u540d\u6216\u7f51\u7edc\u3002', homeApiFailed: 'Home API \u8bfb\u53d6\u5931\u8d25\uff0c\u8bf7\u786e\u8ba4\u540e\u7aef\u6b63\u5728\u8fd0\u884c\u3002',
        savingLocation: '\u6b63\u5728\u4fdd\u5b58\u4f4d\u7f6e\u5230\u4e2a\u4eba\u8d44\u6599...', locationSaved: '\u4f4d\u7f6e\u5df2\u4fdd\u5b58\u5230\u8d44\u6599\uff0c\u9996\u9875\u5df2\u5237\u65b0\u3002',
        editingProfile: '\u73b0\u5728\u53ef\u4ee5\u7f16\u8f91\u8d44\u6599\u3002', saving: '\u6b63\u5728\u4fdd\u5b58...', profileSaved: '\u4fdd\u5b58\u6210\u529f\uff0c\u9996\u9875\u4f4d\u7f6e\u5df2\u540c\u6b65\u3002',
        noEducation: '\u6ca1\u6709\u8fd4\u56de\u6559\u80b2\u8bb0\u5f55\u3002', noSkills: '\u6ca1\u6709\u8fd4\u56de\u6280\u80fd\u6570\u636e\u3002', noProjects: '\u6ca1\u6709\u8fd4\u56de\u9879\u76ee\u6570\u636e\u3002', noLanguages: '\u6ca1\u6709\u8fd4\u56de\u8bed\u8a00\u6570\u636e\u3002',
        databaseStatus: '\u6570\u636e\u5e93\u72b6\u6001', databaseFallback: '\u5907\u7528\u8d44\u6599\u6570\u636e', databaseAvailable: '\u53ef\u7528',
        oauthRedirecting: '\u6b63\u5728\u8df3\u8f6c\u5230', oauthWaiting: '\u7b49\u5f85\u767b\u5f55', oauthLoggedIn: '\u5df2\u901a\u8fc7', oauthAuthorizedAs: '\u5f53\u524d\u8d26\u6237', oauthStatusFailed: '\u65e0\u6cd5\u68c0\u67e5\u767b\u5f55\u72b6\u6001',
        oauthApiLoading: '\u6b63\u5728\u8bfb\u53d6', oauthApiSucceeded: 'OAuth API \u9a8c\u8bc1\u6210\u529f', oauthApiReturned: '\u8fd4\u56de\u4e86\u6709\u6548\u7ed3\u679c\u3002', oauthApiFailed: 'OAuth API \u9a8c\u8bc1\u5931\u8d25', oauthProviderRequired: '\u8bf7\u5148\u4f7f\u7528\u6b63\u786e\u7684 provider \u767b\u5f55\u3002',
        registered: '\u5df2\u6ce8\u518c',
        oauthLoginFailed: '\u767b\u5f55\u5931\u8d25', oauthProviderIncomplete: '\u7b2c\u4e09\u65b9\u767b\u5f55\u672a\u5b8c\u6210\u3002', oauthLoggedOut: '\u5df2\u9000\u51fa\u767b\u5f55', oauthLoggedOutDetail: '\u73b0\u5728\u53ef\u4ee5\u4ee5\u8bbf\u5ba2\u8eab\u4efd\u7ee7\u7eed\u6d4f\u89c8\u3002',
        shortcutLocalHomeTitle: '\u672c\u5730 Home API', shortcutLocalHomeDesc: '\u9996\u5c4f\u4f7f\u7528\u7684\u56fd\u5bb6\u3001\u57ce\u5e02\u3001\u5929\u6c14\u548c\u751f\u6d3b\u5efa\u8bae\u63a5\u53e3\u3002', shortcutLocalProfileTitle: '\u672c\u5730 Profile API', shortcutLocalProfileDesc: 'Me \u9875\u9762\u3001\u7b80\u5386\u9884\u89c8\u548c\u4f4d\u7f6e\u4fdd\u5b58\u7684\u6570\u636e\u6765\u6e90\u3002',
        shortcutApiDocsTitle: 'API \u6587\u6863', shortcutApiDocsDesc: '\u9002\u5408\u8bfe\u5802\u9a8c\u6536\u65f6\u5feb\u901f\u68c0\u67e5\u63a5\u53e3\u3002', shortcutOpenApiTitle: 'OpenAPI', shortcutOpenApiDesc: '\u7528\u4e8e\u786e\u8ba4\u8bf7\u6c42\u548c\u54cd\u5e94\u7ed3\u6784\u7684 YAML \u6587\u4ef6\u3002',
        shortcutKcgiTitle: 'KCGI', shortcutKcgiDesc: 'Campus Flow \u4e2a\u4eba\u8d44\u6599\u548c\u62a5\u544a\u622a\u56fe\u7684\u5b66\u6821\u80cc\u666f\u3002', shortcutGithubTitle: 'GitHub', shortcutGithubDesc: 'OAuth provider \u548c\u4ed3\u5e93 API \u6d4b\u8bd5\u76ee\u6807\u3002', shortcutCalendarTitle: 'Google Calendar', shortcutCalendarDesc: 'Google OAuth \u548c Calendar API \u6d4b\u8bd5\u76ee\u6807\u3002',
        shortcutMeteoTitle: 'Open-Meteo', shortcutMeteoDesc: 'Home \u9875\u9762\u4f7f\u7528\u7684\u5730\u7406\u7f16\u7801\u548c\u5929\u6c14\u6570\u636e\u6765\u6e90\u3002', shortcutCountriesTitle: 'REST Countries', shortcutCountriesDesc: '\u56fd\u5bb6\u4fe1\u606f\u6765\u6e90\uff0c\u5e76\u914d\u5408\u672c\u5730 fallback\u3002', shortcutCore: '\u6838\u5fc3 API', shortcutDocs: '\u6587\u6863', shortcutProvider: '\u670d\u52a1\u5165\u53e3', shortcutData: '\u6570\u636e\u6765\u6e90', open: '\u6253\u5f00'
    },
    ja: {
        navHome: '\u4eca\u65e5', navQuick: '\u30af\u30a4\u30c3\u30af', navOAuth: '\u8a8d\u8a3c', navMe: '\u4f5c\u54c1',
        languageLabel: '\u8a00\u8a9e', account: '\u30a2\u30ab\u30a6\u30f3\u30c8',
        accountEyebrow: '\u30a2\u30ab\u30a6\u30f3\u30c8 / \u30ed\u30b0\u30a4\u30f3', accountTitle: '\u304a\u304b\u3048\u308a\u306a\u3055\u3044\u3002',
        accountIntro: '\u30ed\u30b0\u30a4\u30f3\u3059\u308b\u3068\u30d7\u30ed\u30d5\u30a3\u30fc\u30eb\u3068\u3044\u3064\u3082\u306e\u5834\u6240\u3092\u4fdd\u5b58\u3067\u304d\u307e\u3059\u3002\u30b2\u30b9\u30c8\u306e\u307e\u307e\u3067\u3082\u95b2\u89a7\u3067\u304d\u307e\u3059\u3002',
        todayChapter: '\u4eca\u65e5 / \u4eac\u90fd', todayHeadline: '\u9759\u304b\u306a\u4e00\u65e5\u3001', todayLead: '\u307e\u305a\u5929\u6c17\u3002\u305d\u306e\u4ed6\u306f\u3042\u3068\u3067\u3002',
        portfolioPublicView: '\u4f5c\u54c1\u96c6 / \u516c\u958b\u30da\u30fc\u30b8', portfolioIndex: '\u7d39\u4ecb / \u4f5c\u54c1',
        portraitMainCaption: '\u6c34\u8fba\u306e\u6625', portraitSmallCaption: '\u5b63\u7bc0\u306e\u7d42\u308f\u308a\u306e\u4e00\u679a',
        portfolioChapter: '\u4f5c\u54c1\u96c6 / \u30bb\u30ec\u30af\u30c8', selectedWork: '\u30bb\u30ec\u30af\u30c8\u4f5c\u54c1',
        openSignIn: '\u30ed\u30b0\u30a4\u30f3 / \u767b\u9332', manageAccount: '\u30a2\u30ab\u30a6\u30f3\u30c8\u7ba1\u7406', close: '\u9589\u3058\u308b',
        statusLabel: '\u72b6\u614b', accountImageCaption: '\u4eac\u90fd / \u5915\u66ae\u308c',
        languageLabel: '\u8a00\u8a9e', account: '\u30a2\u30ab\u30a6\u30f3\u30c8',
        accountEyebrow: '\u30a2\u30ab\u30a6\u30f3\u30c8 / \u30ed\u30b0\u30a4\u30f3', accountTitle: '\u304a\u304b\u3048\u308a\u306a\u3055\u3044\u3002',
        accountIntro: '\u30ed\u30b0\u30a4\u30f3\u3059\u308b\u3068\u30d7\u30ed\u30d5\u30a3\u30fc\u30eb\u3068\u3088\u304f\u4f7f\u3046\u5834\u6240\u3092\u4fdd\u5b58\u3067\u304d\u307e\u3059\u3002\u30b2\u30b9\u30c8\u306e\u307e\u307e\u3067\u3082\u95b2\u89a7\u3067\u304d\u307e\u3059\u3002',
        checkingSignIn: '\u30ed\u30b0\u30a4\u30f3\u72b6\u614b\u3092\u78ba\u8a8d\u4e2d\u2026', checkingSignInDetail: '\u3057\u3070\u3089\u304f\u304a\u5f85\u3061\u304f\u3060\u3055\u3044\u3002', checking: '\u78ba\u8a8d\u4e2d',
        githubSigninNote: 'GitHub \u306e\u30a2\u30ab\u30a6\u30f3\u30c8\u3068\u516c\u958b\u30d7\u30ed\u30d5\u30a3\u30fc\u30eb\u3092\u4f7f\u7528\u3057\u307e\u3059\u3002', googleSigninNote: 'Google \u30a2\u30ab\u30a6\u30f3\u30c8\u3068\u4efb\u610f\u306e\u30ab\u30ec\u30f3\u30c0\u30fc\u3092\u4f7f\u7528\u3057\u307e\u3059\u3002',
        browseMode: '\u95b2\u89a7\u30e2\u30fc\u30c9', signedInStatus: '\u30ed\u30b0\u30a4\u30f3\u6e08\u307f', localAccount: '\u30ed\u30fc\u30ab\u30eb\u30a2\u30ab\u30a6\u30f3\u30c8',
        roleLabel: '\u5f79\u5272', accountSummary: '\u30a2\u30ab\u30a6\u30f3\u30c8\u6982\u8981', visibilityLabel: '\u516c\u958b\u7bc4\u56f2',
        localAccountTitle: '\u30e6\u30fc\u30b6\u30fc\u540d\u3068\u30d1\u30b9\u30ef\u30fc\u30c9', localAccountCopy: '\u767b\u9332\u307e\u305f\u306f\u30ed\u30b0\u30a4\u30f3\u3057\u3066\u81ea\u5206\u306e\u30da\u30fc\u30b8\u3092\u7de8\u96c6\u3067\u304d\u307e\u3059\u3002',
        authReady: '\u65b0\u3057\u3044\u30d1\u30b9\u30ef\u30fc\u30c9\u306f 12 \u6587\u5b57\u4ee5\u4e0a\u3067\u3059\u3002', continueGuest: '\u30b2\u30b9\u30c8\u3068\u3057\u3066\u7d9a\u884c',
        adminTitle: '\u30e6\u30fc\u30b6\u30fc\u7ba1\u7406', adminCopy: '\u7ba1\u7406\u8005\u306f\u30a2\u30ab\u30a6\u30f3\u30c8\u306e\u78ba\u8a8d\u3001\u505c\u6b62\u3001\u524a\u9664\u304c\u3067\u304d\u307e\u3059\u3002',
        deleteAccount: '\u524a\u9664', deleteAccountConfirm: '\u3053\u306e\u30a2\u30ab\u30a6\u30f3\u30c8\u3068\u4fdd\u5b58\u4f5c\u54c1\u3092\u3059\u3079\u3066\u524a\u9664\u3057\u307e\u3059\u304b\uff1f',
        countryLabel: '\u56fd', cityLabel: '\u90fd\u5e02', searchBtn: '\u691c\u7d22', saveToProfile: '\u30d7\u30ed\u30d5\u30a3\u30fc\u30eb\u306b\u4fdd\u5b58', locationHelp: '\u691c\u7d22\u306f\u4e00\u6642\u7684\u306a\u8868\u793a\u3067\u3059\u3002\u300c\u30d7\u30ed\u30d5\u30a3\u30fc\u30eb\u306b\u4fdd\u5b58\u300d\u3067\u65e2\u5b9a\u306e\u30ad\u30e3\u30f3\u30d1\u30b9\u6240\u5728\u5730\u3092\u66f4\u65b0\u3057\u307e\u3059\u3002', signInToSaveLocation: '\u30ed\u30b0\u30a4\u30f3\u3057\u3066\u6240\u5728\u5730\u3092\u4fdd\u5b58',
        quickEyebrow: '\u30af\u30a4\u30c3\u30af\u30a2\u30af\u30bb\u30b9', quickTitle: '\u30d7\u30ed\u30b8\u30a7\u30af\u30c8\u5165\u53e3', projectApiLabel: '\u30d7\u30ed\u30b8\u30a7\u30af\u30c8 API', studyLinksEyebrow: '\u5b66\u7fd2\u30ea\u30f3\u30af', studyLinksCopy: '\u6388\u696d\u3001\u8abf\u67fb\u3001\u7ffb\u8a33\u3001\u30ce\u30fc\u30c8\u306e\u30ea\u30f3\u30af\u3067\u3059\u3002', oauthTitle: '\u8a8d\u8a3c\u30c6\u30b9\u30c8', profileTitle: '\u5c65\u6b74\u66f8\u30d7\u30ed\u30d5\u30a3\u30fc\u30eb',
        oauthNotConnected: '\u30ed\u30b0\u30a4\u30f3\u3057\u3066\u3044\u307e\u305b\u3093', oauthChoose: '\u30a2\u30ab\u30a6\u30f3\u30c8\u3092\u9078\u3093\u3067\u7d9a\u884c\u3057\u3066\u304f\u3060\u3055\u3044\u3002\u30b2\u30b9\u30c8\u306e\u307e\u307e\u3067\u3082\u95b2\u89a7\u3067\u304d\u307e\u3059\u3002', notLoggedIn: '\u30b2\u30b9\u30c8',
        noOAuthUser: '\u30b2\u30b9\u30c8\u30e2\u30fc\u30c9', oauthUserMeta: '\u30ed\u30b0\u30a4\u30f3\u3059\u308b\u3068\u30d7\u30ed\u30d5\u30a3\u30fc\u30eb\u3068\u3088\u304f\u4f7f\u3046\u5834\u6240\u3092\u4fdd\u5b58\u3067\u304d\u307e\u3059\u3002',
        oauthRedirecting: '\u79fb\u52d5\u4e2d', oauthWaiting: '\u30ed\u30b0\u30a4\u30f3\u5f85\u3061', oauthLoggedIn: '\u30ed\u30b0\u30a4\u30f3\u4e2d', oauthAuthorizedAs: '\u30a2\u30ab\u30a6\u30f3\u30c8', oauthStatusFailed: '\u30ed\u30b0\u30a4\u30f3\u72b6\u614b\u3092\u78ba\u8a8d\u3067\u304d\u307e\u305b\u3093',
        oauthLoginFailed: '\u30ed\u30b0\u30a4\u30f3\u306b\u5931\u6557\u3057\u307e\u3057\u305f', oauthProviderIncomplete: '\u30ed\u30b0\u30a4\u30f3\u304c\u5b8c\u4e86\u3057\u307e\u305b\u3093\u3067\u3057\u305f\u3002', oauthLoggedOut: '\u30ed\u30b0\u30a2\u30a6\u30c8\u3057\u307e\u3057\u305f', oauthLoggedOutDetail: '\u30b2\u30b9\u30c8\u3068\u3057\u3066\u95b2\u89a7\u3092\u7d9a\u3051\u3089\u308c\u307e\u3059\u3002',
        currentWeather: '\u73fe\u5728\u306e\u5929\u6c17', countryInfo: '\u56fd\u60c5\u5831', dailyTip: '\u4eca\u65e5\u306e\u30d2\u30f3\u30c8', profileEyebrow: '\u500b\u4eba\u30ef\u30fc\u30af\u30b9\u30da\u30fc\u30b9', profileTitle: '\u30de\u30a4\u30d7\u30ed\u30d5\u30a3\u30fc\u30eb', profileSubtitle: '\u5b66\u751f\u30d7\u30ed\u30d5\u30a3\u30fc\u30eb\u3092\u6700\u65b0\u306b\u4fdd\u3061\u3001\u5fc5\u8981\u306a\u3068\u304d\u306b\u5c65\u6b74\u66f8\u3092\u51fa\u529b\u3067\u304d\u307e\u3059\u3002', ownerModeLabel: '\u6240\u6709\u8005\u7de8\u96c6\u30e2\u30fc\u30c9', publicResumeLabel: '\u516c\u958b\u5c65\u6b74\u66f8\u30d7\u30ec\u30d3\u30e5\u30fc', profileVisitorNote: '\u6240\u6709\u8005\u7de8\u96c6\u306f\u30ed\u30c3\u30af\u3055\u308c\u3066\u3044\u307e\u3059\u3002\u30ed\u30b0\u30a4\u30f3\u3059\u308b\u3068\u975e\u516c\u958b\u60c5\u5831\u3092\u7de8\u96c6\u3067\u304d\u307e\u3059\u3002', profileOwnerNote: '\u6240\u6709\u8005\u7de8\u96c6\u30e2\u30fc\u30c9\u304c\u6709\u52b9\u3067\u3059\u3002\u975e\u516c\u958b\u60c5\u5831\u306f\u3042\u306a\u305f\u3060\u3051\u306b\u8868\u793a\u3055\u308c\u307e\u3059\u3002', profileInitialStatus: '\u516c\u958b\u30d7\u30ec\u30d3\u30e5\u30fc\u3067\u306f\u975e\u516c\u9805\u76ee\u3092\u8868\u793a\u3057\u307e\u305b\u3093\u3002', edit: '\u7de8\u96c6', save: '\u4fdd\u5b58', cancel: '\u30ad\u30e3\u30f3\u30bb\u30eb', exportPrint: 'PDF \u51fa\u529b / \u5c65\u6b74\u66f8\u3092\u5370\u5237', thirdPartyLogin: '\u30a2\u30ab\u30a6\u30f3\u30c8\u3068\u9023\u643a\u30b5\u30fc\u30d3\u30b9', modalTitle: '\u30de\u30a4\u30a2\u30ab\u30a6\u30f3\u30c8', modalCopy: '\u30ed\u30b0\u30a4\u30f3\u3059\u308b\u3068\u30d7\u30ed\u30d5\u30a3\u30fc\u30eb\u3092\u7de8\u96c6\u3057\u3001\u5f79\u7acb\u3064\u30ad\u30e3\u30f3\u30d1\u30b9\u30b5\u30fc\u30d3\u30b9\u3092\u4e00\u3064\u9023\u643a\u3067\u304d\u307e\u3059\u3002', signGoogle: 'Google \u3067\u7d9a\u884c', signGithub: 'GitHub \u3067\u7d9a\u884c', googlePurpose: '\u30d7\u30ed\u30d5\u30a3\u30fc\u30eb\u3092\u7de8\u96c6\u3057\u3001Calendar \u306e\u4eca\u5f8c\u306e\u4e88\u5b9a\u3092\u78ba\u8a8d\u3057\u307e\u3059\u3002', githubPurpose: '\u30d7\u30ed\u30d5\u30a3\u30fc\u30eb\u3092\u7de8\u96c6\u3057\u3001\u516c\u958b\u30ea\u30dd\u30b8\u30c8\u30ea\u3092\u78ba\u8a8d\u3057\u307e\u3059\u3002', calendarAction: 'Calendar \u306e\u4eca\u5f8c\u306e\u4e88\u5b9a\u3092\u8868\u793a', githubAction: 'GitHub \u30d7\u30ed\u30d5\u30a3\u30fc\u30eb\u3068\u30ea\u30dd\u30b8\u30c8\u30ea\u3092\u8868\u793a', connectedWith: '\u9023\u643a\u4e2d', logout: '\u30ed\u30b0\u30a2\u30a6\u30c8', login: '\u30ed\u30b0\u30a4\u30f3', register: '\u767b\u9332', open: 'Open'
    }
};

Object.assign(translations.ja, {
    navHome: '今日',
    navMe: '作品',
    languageLabel: '言語',
    localDate: '現地の日付',
    account: 'アカウント',
    folioHome: '京都 · 現在の天気',
    folioPortfolio: 'セレクト作品 · 公開ページ',
    folioAccount: 'ゲスト · 自由に閲覧',
    accountEyebrow: 'アカウント / ログイン',
    accountTitle: 'おかえりなさい。',
    accountIntro: 'ログインするとプロフィールといつもの場所を保存できます。ゲストのままでも閲覧できます。',
    todayChapter: '今日 / 京都',
    todayHeadline: '静かな一日、',
    headlineSpacer: '',
    headlinePunctuation: '。',
    todayLead: 'まず天気。そのほかは、あとで。',
    peopleLabel: '人',
    todayPhotoMain: '赤い線 / 京都、2026',
    todayPhotoSecond: '雨上がり',
    todayPhotoThird: '水辺からの風',
    portfolioPublicView: '作品集 / 公開ページ',
    portfolioIndex: '紹介 / 作品',
    portraitMainCaption: '水辺の春',
    portraitSmallCaption: '季節の終わりの一枚',
    portfolioChapter: '作品集 / セレクト',
    selectedWork: 'セレクト作品',
    openSignIn: 'ログイン / 登録',
    manageAccount: 'アカウント管理',
    close: '閉じる',
    ownerEditMode: 'ページ編集',
    editSheetTitle: 'ページを編集する。',
    addWork: '作品を追加',
    addWorkHelp: '画像・音声・テキストをローカルからアップロード',
    workTypeLabel: '作品カテゴリー',
    descriptionLabel: '説明',
    mediaTypeLabel: 'ファイル種類',
    chooseFileLabel: 'ファイルを選択',
    mediaImage: '画像',
    mediaAudio: '音声',
    mediaText: 'テキスト',
    layoutSizeLabel: '表示サイズ',
    layoutStandard: '標準',
    layoutWide: '横長',
    layoutTall: '縦長',
    mediaFitLabel: '画像表示',
    fitContain: '画像全体を表示',
    fitCover: '枠いっぱいに表示',
    imageUploadHint: 'JPG・PNG・GIF・WebP · 最大15 MB',
    audioUploadHint: 'MP3・WAV・OGG・M4A · 最大25 MB',
    textUploadHint: 'TXT・Markdown・CSV・JSON · 最大5 MB',
    addToPortfolio: '+ 作品集へアップロード',
    chooseUploadFile: '先にローカルファイルを選んでください。',
    uploadingWork: '作品をアップロードしています…',
    saveDisplay: '表示を保存',
    removeWork: '削除',
    displaySaved: '作品の表示を更新しました。',
    showPassword: '表示',
    hidePassword: '非表示',
    statusLabel: '状態',
    accountImageCaption: '京都 / 夕暮れ',
    finding: '検索中…',
    updatedNow: 'たった今更新',
    limitedUpdate: '限定更新',
    checkingSignIn: 'ログイン状態を確認中…',
    checkingSignInDetail: 'しばらくお待ちください。',
    checking: '確認中',
    githubSigninNote: 'GitHub のアカウントと公開プロフィールを使用します。',
    googleSigninNote: 'Google の名前、メール、プロフィール画像を使用します。',
    browseMode: '閲覧モード',
    signedInStatus: 'ログイン済み',
    localAccount: 'ローカルアカウント',
    roleLabel: '役割',
    accountSummary: 'アカウント概要',
    visibilityLabel: '公開範囲',
    localAccountTitle: 'ユーザー名とパスワード',
    localAccountCopy: '登録またはログインすると、自分のページを編集できます。',
    authReady: '新しいパスワードは12文字以上にしてください。',
    continueGuest: 'ゲストとして続ける',
    thirdPartyOption: 'または外部アカウントを使用',
    guestProfileTitle: 'ビジュアルダイアリー / ウェブデザイン学生',
    guestProfileSummary: '授業の合間や京都を歩くなかで制作した写真、スケッチ、ウェブ実験を集めた小さな作品集です。',
    guestWork01Title: '青の時間のホーム',
    guestWork01Description: '夕方の光が消える直前、静かな駅の一場面。',
    guestWork02Title: '庭の観察者',
    guestWork02Description: '夏草と落ち葉のあいだからこちらを見る黒猫。',
    guestWork03Title: '窓辺のノート',
    guestWork03Description: '何気ない午後に集めた反射、標識、通り過ぎる光。',
    guestWork04Title: '雨上がりの池',
    guestWork04Description: '短い雨のあとに残るやわらかな波紋と淡い緑。',
    adminTitle: 'ユーザー管理',
    adminCopy: '管理者はアカウントの確認、停止、削除ができます。',
    deleteAccount: '削除',
    deleteAccountConfirm: 'このアカウントと保存作品をすべて削除しますか？',
    countryLabel: '国',
    cityLabel: '都市',
    searchBtn: '検索',
    saveToProfile: 'プロフィールに保存',
    signInToSaveLocation: 'ログインして場所を保存',
    homeInitialStatus: '場所を選ぶと今日の情報を表示します。',
    currentWeather: '現在の天気',
    cityMetric: '都市',
    windMetric: '風速',
    trendMetric: '傾向',
    capitalMetric: '首都',
    languagesMetric: '言語',
    currenciesMetric: '通貨',
    oauthNotConnected: 'ログインしていません',
    oauthChoose: 'ログインする方法を選んでください。ゲストのままでも閲覧できます。',
    notLoggedIn: 'ゲスト',
    noOAuthUser: 'ゲストモード',
    oauthUserMeta: 'ログインするとプロフィールとよく使う場所を保存できます。',
    oauthRedirecting: '移動中：',
    oauthWaiting: '認証を待っています',
    oauthLoggedIn: 'ログイン中：',
    oauthAuthorizedAs: 'アカウント',
    oauthStatusFailed: 'ログイン状態を確認できません',
    oauthLoginFailed: 'ログインに失敗しました',
    oauthProviderIncomplete: '外部サービスの認証が完了しませんでした。',
    oauthLoggedOut: 'ログアウトしました',
    oauthLoggedOutDetail: 'ゲストとして閲覧を続けられます。',
    usernameLabel: 'ユーザー名',
    passwordLabel: 'パスワード',
    login: 'ログイン',
    register: '新規登録',
    nameLabel: '名前',
    emailLabel: 'メール',
    phoneLabel: '電話',
    titleLabel: 'タイトル',
    identityTitleLabel: '肩書き',
    roleStudentCreator: '学生クリエイター',
    rolePhotographer: '写真家',
    roleArtist: '画家',
    roleNovelist: '小説家',
    roleDesigner: 'デザイナー',
    roleFilmmaker: '映像作家',
    roleMusician: '音楽クリエイター',
    summaryLabel: '紹介文',
    edit: '編集',
    save: '保存',
    cancel: 'キャンセル',
    exportPrint: 'PDF出力 / 印刷',
    profileInitialStatus: '公開ページでは非公開項目を表示しません。',
    profileVisitorNote: '編集はロックされています。ログインすると自分の情報を編集できます。',
    profileOwnerNote: '編集モードです。非公開情報は自分だけに表示されます。',
    signInToEdit: 'ログインしてプロフィールを編集',
    modalTitle: 'アカウント',
    signGoogle: 'Google で続ける',
    signGithub: 'GitHub で続ける',
    googlePurpose: 'Google の名前、メール、プロフィール画像でログインします。',
    githubPurpose: 'GitHub のアカウントと公開プロフィールでログインします。',
    calendarAction: '今後の予定を表示',
    githubAction: 'GitHub のプロフィールとリポジトリを表示',
    noUpcomingEvents: '今後の予定はありません。',
    noRepositories: '公開リポジトリはありません。',
    serviceLoadFailed: '連携サービスを読み込めませんでした。',
    loadingHome: '国と天気の情報を読み込み中…',
    updated: '更新済み',
    fallbackHome: '予備データを表示しています。都市名またはネットワークを確認してください。',
    homeApiFailed: '今日の情報を読み込めません。バックエンドの状態を確認してください。',
    savingLocation: '場所をプロフィールに保存中…',
    locationSaved: '場所を保存し、今日ページを更新しました。',
    editingProfile: 'プロフィールを編集できます。',
    saving: '保存中…',
    profileSaved: '保存しました。今日ページの場所も更新されています。',
    oauthApiLoading: '読み込み中',
    oauthApiSucceeded: '連携サービスを確認しました',
    oauthApiReturned: '有効な応答が返りました。',
    oauthApiFailed: '連携サービスを確認できません',
    oauthProviderRequired: '対応する外部アカウントで先にログインしてください。',
    registered: '登録しました',
    authSucceeded: '成功しました。'
});

function t(key) {
    return translations[currentLanguage]?.[key] || translations.en[key] || key;
}

function applyLanguage() {
    document.documentElement.lang = currentLanguage === 'zh' ? 'zh-CN' : currentLanguage === 'ja' ? 'ja' : 'en';
    const languageSelect = $('languageSelect');
    if (languageSelect) languageSelect.value = currentLanguage;

    document.querySelectorAll('[data-i18n]').forEach(element => {
        element.textContent = t(element.dataset.i18n);
    });

    document.querySelectorAll('[data-i18n-label]').forEach(label => {
        const firstTextNode = Array.from(label.childNodes).find(node => node.nodeType === Node.TEXT_NODE);
        if (firstTextNode) {
            firstTextNode.nodeValue = t(label.dataset.i18nLabel);
        }
    });

    updateFolio();
    updateOwnerUi();
    if (currentHomeData) renderHome(currentHomeData);
    if (currentProfile) renderProfile(currentProfile);
    if (currentPortfolio.length) renderPortfolio();
    updatePortfolioOwnerLabel();
}

function updateFolio(name = document.body.dataset.page || 'home') {
    const meta = pageMeta[name] || pageMeta.home;
    if ($('folioNumber')) $('folioNumber').textContent = meta.number;
    if ($('folioLabel')) $('folioLabel').textContent = t(meta.labelKey);
    if ($('folioContext')) $('folioContext').textContent = t(meta.contextKey);
}

function isOwnerAuthenticated() {
    return Boolean(currentAccount);
}

function updateOwnerUi() {
    const owner = isOwnerAuthenticated();
    const account = currentAccount;
    const provider = account?.provider || currentOAuthUser?.currentProvider || '';
    const displayName = account?.displayName || currentProfile?.name || t('notLoggedIn');
    const role = account?.role || 'GUEST';
    document.querySelectorAll('.private-field').forEach(field => field.classList.toggle('is-hidden', !owner));
    if ($('editBtn')) $('editBtn').textContent = owner ? t('edit') : t('signInToEdit');
    if ($('profileAccessNote')) $('profileAccessNote').textContent = owner ? t('profileOwnerNote') : t('profileVisitorNote');
    if ($('saveLocationBtn')) $('saveLocationBtn').textContent = owner ? t('saveToProfile') : t('signInToSaveLocation');
    if ($('openAuthBtn')) $('openAuthBtn').textContent = owner ? t('manageAccount') : t('openSignIn');
    $('passportCard')?.classList.toggle('is-hidden', !owner);
    if ($('accountConnectionStatus')) {
        const status = owner
            ? `${provider === 'local' ? t('localAccount') : provider.toUpperCase()} · ${t('signedInStatus')}`
            : `${t('notLoggedIn')} · ${t('browseMode')}`;
        $('accountConnectionStatus').textContent = status;
        $('accountConnectionStatus').classList.toggle('connected', owner);
    }
    if ($('accountHolderName')) $('accountHolderName').textContent = displayName.toUpperCase();
    if ($('accountRole')) $('accountRole').textContent = role;
    if ($('folioContext') && document.body.dataset.page === 'account') {
        $('folioContext').textContent = owner ? `${displayName} · ${role}` : t(pageMeta.account.contextKey);
    }
    if (account) {
        setIdentity(displayName, account.avatarUrl || '');
        setOAuthState(
            'ok',
            `${t('signedInStatus')}: ${displayName}`,
            `${role} · ${provider === 'local' ? t('localAccount') : provider}`,
            provider === 'local' ? role : provider,
            account
        );
    }
    updateConnectedAccount();
    $('adminPanel')?.classList.toggle('is-hidden', role !== 'ADMIN');
    if (role === 'ADMIN') loadAdminUsers();
}

const shortcuts = [
    {
        titleKey: 'shortcutLocalHomeTitle',
        descriptionKey: 'shortcutLocalHomeDesc',
        categoryKey: 'shortcutCore',
        url: '/api/home',
        image: 'assets/campus-photo-08.jpg'
    },
    {
        titleKey: 'shortcutLocalProfileTitle',
        descriptionKey: 'shortcutLocalProfileDesc',
        categoryKey: 'shortcutCore',
        url: '/api/profile',
        image: 'assets/campus-photo-01.jpg'
    },
    {
        titleKey: 'shortcutApiDocsTitle',
        descriptionKey: 'shortcutApiDocsDesc',
        categoryKey: 'shortcutDocs',
        url: '/api-docs.html',
        image: 'assets/campus-photo-07.jpg'
    },
    {
        titleKey: 'shortcutOpenApiTitle',
        descriptionKey: 'shortcutOpenApiDesc',
        categoryKey: 'shortcutDocs',
        url: '/openapi.yaml',
        image: 'assets/campus-photo-06.jpg'
    },
    {
        titleKey: 'shortcutGithubTitle',
        descriptionKey: 'shortcutGithubDesc',
        categoryKey: 'shortcutProvider',
        url: 'https://github.com/',
        image: 'assets/campus-photo-03.jpg'
    },
    {
        titleKey: 'shortcutCalendarTitle',
        descriptionKey: 'shortcutCalendarDesc',
        categoryKey: 'shortcutProvider',
        url: 'https://calendar.google.com/',
        image: 'assets/campus-photo-02.jpg'
    },
    {
        titleKey: 'shortcutMeteoTitle',
        descriptionKey: 'shortcutMeteoDesc',
        categoryKey: 'shortcutData',
        url: 'https://open-meteo.com/',
        image: 'assets/campus-photo-04.jpg'
    },
    {
        titleKey: 'shortcutCountriesTitle',
        descriptionKey: 'shortcutCountriesDesc',
        categoryKey: 'shortcutData',
        url: 'https://restcountries.com/',
        image: 'assets/campus-photo-05.jpg'
    },
    {
        titleKey: 'shortcutKcgiTitle',
        descriptionKey: 'shortcutKcgiDesc',
        categoryKey: 'shortcutProvider',
        url: 'https://www.kcg.edu/',
        image: 'assets/campus-photo-09.jpg'
    }
];

const studyLinks = [
    { title: 'Google', note: 'Search', url: 'https://www.google.com/' },
    { title: 'Gmail', note: 'Mail', url: 'https://mail.google.com/' },
    { title: 'Google Translate', note: 'Translate', url: 'https://translate.google.com/' },
    { title: 'DeepL', note: 'Translate', url: 'https://www.deepl.com/translator' },
    { title: 'Google Calendar', note: 'Schedule', url: 'https://calendar.google.com/' },
    { title: 'YouTube', note: 'Lecture Video', url: 'https://www.youtube.com/' },
    { title: 'Notion', note: 'Notes', url: 'https://www.notion.so/' },
    { title: 'Google Maps', note: 'Campus Route', url: 'https://www.google.com/maps' },
    { title: 'Bilibili', note: 'Chinese Study', url: 'https://www.bilibili.com/' },
    { title: 'Zhihu', note: 'Research', url: 'https://www.zhihu.com/' }
];

function $(id) {
    return document.getElementById(id);
}

function setStatus(element, message, isError = false) {
    if (!element) return;
    element.textContent = message;
    element.classList.toggle('status-error', isError);
    element.classList.toggle('status-ok', !isError);
    element.classList.toggle('is-loading', !isError && /loading|saving|connecting|checking|waiting/i.test(String(message)));
}

function updateIssueDate() {
    const issueDate = $('issueDate');
    if (!issueDate) return;
    const now = new Date();
    const parts = Object.fromEntries(
        new Intl.DateTimeFormat('en', { year: 'numeric', month: '2-digit', day: '2-digit' })
            .formatToParts(now)
            .filter(part => part.type !== 'literal')
            .map(part => [part.type, part.value])
    );
    issueDate.textContent = `${parts.year}.${parts.month}.${parts.day}`;
    issueDate.dateTime = `${parts.year}-${parts.month}-${parts.day}`;
}

function setFolioStatus(status) {
    if ($('folioStatus')) $('folioStatus').textContent = status;
}

function safeText(value, fallback = '--') {
    if (value === null || value === undefined || value === '') return fallback;
    return String(value);
}

function listText(value) {
    const items = Array.isArray(value)
        ? value
        : value && typeof value === 'object'
            ? Object.values(value)
            : [safeText(value)];
    return items.map(localizePlaceName).join(currentLanguage === 'zh' ? '\u3001' : ', ') || '--';
}

function formatTemperature(value) {
    return `${safeText(value, '--')}\u00B0`;
}

function localizePlaceName(value) {
    const text = safeText(value);
    if (currentLanguage !== 'zh') return text;
    const names = {
        Kyoto: '\u4eac\u90fd',
        Japan: '\u65e5\u672c',
        Tokyo: '\u4e1c\u4eac',
        Asia: '\u4e9a\u6d32',
        Japanese: '\u65e5\u8bed',
        'Japanese yen': '\u65e5\u5143'
    };
    return names[text] || text;
}

function canonicalPlaceName(value) {
    const text = safeText(value, '');
    const names = {
        '\u4eac\u90fd': 'Kyoto',
        '\u65e5\u672c': 'Japan',
        '\u4e1c\u4eac': 'Tokyo',
        '\u4e9a\u6d32': 'Asia'
    };
    return names[text] || text;
}

function localizedWeatherCopy(weather = {}) {
    const code = Number(weather.weatherCode ?? -1);
    const temperature = Number(weather.temperature ?? 20);
    const wind = Number(weather.windSpeed ?? 0);
    const conditionKey = code === 0 ? 'clear'
        : code <= 3 ? 'cloudy'
        : code <= 48 ? 'fog'
        : code <= 67 ? 'rain'
        : code <= 77 ? 'snow'
        : code <= 86 ? 'showers'
        : code >= 95 ? 'thunder'
        : 'changeable';
    const clothingKey = temperature < 5 ? 'winter'
        : temperature < 12 ? 'coat'
        : temperature < 18 ? 'jacket'
        : temperature < 25 ? 'layers'
        : temperature < 30 ? 'light'
        : 'heat';
    const reminderKey = code >= 95 ? 'avoidOpen'
        : code >= 71 && code <= 86 ? 'slippery'
        : code >= 51 && code <= 67 ? 'umbrella'
        : code >= 45 && code <= 48 ? 'visibility'
        : wind >= 30 ? 'wind'
        : code === 0 && temperature >= 24 ? 'sun'
        : 'walk';
    const localized = {
        en: {
            condition: { clear: 'Clear', cloudy: 'Cloudy', fog: 'Fog', rain: 'Rain', snow: 'Snow', showers: 'Showers', thunder: 'Thunderstorms', changeable: 'Changeable' },
            clothing: { winter: 'Winter coat and warm shoes', coat: 'Warm coat', jacket: 'Jacket or light layers', layers: 'Light layers', light: 'Light clothing', heat: 'Breathable clothing and water' },
            reminder: { avoidOpen: 'Avoid exposed outdoor areas.', slippery: 'Allow extra travel time.', umbrella: 'Bring an umbrella.', visibility: 'Leave earlier in low visibility.', wind: 'Secure light belongings.', sun: 'Use sun protection and stay hydrated.', walk: 'Good conditions for errands or a short walk.' }
        },
        zh: {
            condition: { clear: '\u6674\u6717', cloudy: '\u591a\u4e91', fog: '\u6709\u96fe', rain: '\u6709\u96e8', snow: '\u6709\u96ea', showers: '\u9635\u96e8', thunder: '\u96f7\u66b4', changeable: '\u5929\u6c14\u591a\u53d8' },
            clothing: { winter: '\u7fbd\u7ed2\u670d\u548c\u4fdd\u6696\u978b', coat: '\u6e29\u6696\u5916\u5957', jacket: '\u5939\u514b\u6216\u8584\u5c42\u53e0\u7a7f', layers: '\u8f7b\u8584\u5c42\u53e0\u7a7f', light: '\u8f7b\u4fbf\u8863\u7269', heat: '\u900f\u6c14\u8863\u7269\u5e76\u53ca\u65f6\u8865\u6c34' },
            reminder: { avoidOpen: '\u907f\u514d\u5728\u7a7a\u65f7\u6237\u5916\u505c\u7559\u3002', slippery: '\u8def\u9762\u53ef\u80fd\u6e7f\u6ed1\uff0c\u8bf7\u9884\u7559\u65f6\u95f4\u3002', umbrella: '\u8bb0\u5f97\u5e26\u4f1e\u3002', visibility: '\u80fd\u89c1\u5ea6\u8f83\u4f4e\uff0c\u5efa\u8bae\u65e9\u70b9\u51fa\u53d1\u3002', wind: '\u6536\u597d\u5bb9\u6613\u88ab\u98ce\u5439\u8d70\u7684\u7269\u54c1\u3002', sun: '\u6ce8\u610f\u9632\u6652\u548c\u8865\u6c34\u3002', walk: '\u9002\u5408\u529e\u4e8b\u6216\u77ed\u9014\u6563\u6b65\u3002' }
        },
        ja: {
            condition: { clear: '\u6674\u308c', cloudy: '\u66c7\u308a', fog: '\u9727', rain: '\u96e8', snow: '\u96ea', showers: '\u306b\u308f\u304b\u96e8', thunder: '\u96f7\u96e8', changeable: '\u5909\u308f\u308a\u3084\u3059\u3044\u5929\u6c17' },
            clothing: { winter: '\u30c0\u30a6\u30f3\u3068\u6696\u304b\u3044\u9774', coat: '\u6696\u304b\u3044\u30b3\u30fc\u30c8', jacket: '\u30b8\u30e3\u30b1\u30c3\u30c8\u307e\u305f\u306f\u8584\u624b\u306e\u91cd\u306d\u7740', layers: '\u8584\u624b\u306e\u91cd\u306d\u7740', light: '\u8efd\u3044\u670d\u88c5', heat: '\u901a\u6c17\u6027\u306e\u826f\u3044\u670d\u3068\u6c34\u5206\u88dc\u7d66' },
            reminder: { avoidOpen: '\u958b\u3051\u305f\u5c4b\u5916\u306f\u907f\u3051\u3066\u304f\u3060\u3055\u3044\u3002', slippery: '\u8def\u9762\u306b\u6ce8\u610f\u3057\u3001\u6642\u9593\u306b\u4f59\u88d5\u3092\u3002', umbrella: '\u5098\u3092\u5fd8\u308c\u305a\u306b\u3002', visibility: '\u8996\u754c\u304c\u60aa\u3044\u305f\u3081\u65e9\u3081\u306e\u51fa\u767a\u3092\u3002', wind: '\u8efd\u3044\u8377\u7269\u306f\u3057\u3063\u304b\u308a\u53ce\u7d0d\u3057\u3066\u304f\u3060\u3055\u3044\u3002', sun: '\u65e5\u713c\u3051\u5bfe\u7b56\u3068\u6c34\u5206\u88dc\u7d66\u3092\u3002', walk: '\u7528\u4e8b\u3084\u77ed\u3044\u6563\u6b69\u306b\u5411\u3044\u3066\u3044\u307e\u3059\u3002' }
        }
    };
    const copy = localized[currentLanguage] || localized.en;
    return {
        condition: copy.condition[conditionKey],
        trend: copy.condition[conditionKey],
        tip: `${copy.clothing[clothingKey]}${currentLanguage === 'en' ? '. ' : '\u3002'}${copy.reminder[reminderKey]}`
    };
}

async function readResponseBody(response) {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
        return response.json();
    }
    const text = await response.text();
    return text ? { message: text } : {};
}

async function safeFetch(url, options = {}) {
    const controller = new AbortController();
    const { timeoutMs = 12000, ...fetchOptions } = options;
    const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
    const method = String(fetchOptions.method || 'GET').toUpperCase();
    const csrfHeaders = csrfToken && !['GET', 'HEAD', 'OPTIONS'].includes(method)
        ? { 'X-XSRF-TOKEN': csrfToken }
        : {};
    try {
        const response = await fetch(url, {
            ...fetchOptions,
            credentials: 'same-origin',
            signal: fetchOptions.signal || controller.signal,
            headers: { Accept: 'application/json', ...csrfHeaders, ...(fetchOptions.headers || {}) }
        });
        const data = await readResponseBody(response);
        if (!response.ok) {
            const message = data.error || data.message || `Request failed with ${response.status}`;
            const error = new Error(message);
            error.status = response.status;
            error.data = data;
            throw error;
        }
        return data;
    } catch (error) {
        if (error.status) throw error;
        if (error.name === 'AbortError') {
            const timeoutError = new Error('Request timed out. The page is still available; please try again.');
            timeoutError.data = { error: timeoutError.message };
            throw timeoutError;
        }
        const networkError = new Error(`Network error: ${error.message}`);
        networkError.data = { error: networkError.message };
        throw networkError;
    } finally {
        window.clearTimeout(timeout);
    }
}

async function loadCsrfToken() {
    try {
        const data = await safeFetch('/api/csrf');
        csrfToken = data.token || '';
    } catch (error) {
        csrfToken = '';
    }
}

function switchPage(name, updateHash = true) {
    if (!pages[name]) return;
    Object.entries(pages).forEach(([pageName, page]) => {
        const active = pageName === name;
        page.classList.toggle('active-page', active);
        page.hidden = !active;
    });
    setActiveNav(name);
    document.body.dataset.page = name;
    updateFolio(name);
    if (name === 'account') updateOwnerUi();
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (updateHash) {
        history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${name}`);
    }
    if (name === 'home' && currentHomeData) loadHome(currentHomeLocation());
    if (name === 'account' && currentProfile) loadOAuthStatus();
}

function setActiveNav(name) {
    document.querySelectorAll('[data-page-link]').forEach(button => {
        button.classList.toggle('active', button.dataset.pageLink === name);
    });
}

document.querySelectorAll('[data-page-link]').forEach(button => {
    button.addEventListener('click', event => {
        event.preventDefault();
        switchPage(button.dataset.pageLink);
    });
});

$('languageSelect')?.addEventListener('change', event => {
    currentLanguage = event.target.value;
    localStorage.setItem(languageStorageKey, currentLanguage);
    applyLanguage();
    updateUploadPicker();
    if (currentProfile) renderProfile(currentProfile);
    if (currentHomeData) renderHome(currentHomeData);
    updatePortfolioOwnerLabel();
    loadOAuthStatus();
});

function setIdentity(name = 'Student', avatarUrl = '') {
    const initial = (name || 'S').trim().charAt(0).toUpperCase() || 'S';
    $('accountAvatar').textContent = initial;
    $('previewAvatar').textContent = initial;
    if ($('accountHolderName')) $('accountHolderName').textContent = (name || 'Student').toUpperCase();
    $('oauthAvatar').style.backgroundImage = '';
    $('oauthAvatar').textContent = 'O';
    if (avatarUrl) {
        $('accountAvatar').textContent = '';
        $('accountAvatar').style.backgroundImage = `url("${avatarUrl}")`;
        $('oauthAvatar').textContent = '';
        $('oauthAvatar').style.backgroundImage = `url("${avatarUrl}")`;
        $('previewAvatar').textContent = '';
        $('previewAvatar').style.backgroundImage = `url("${avatarUrl}")`;
    } else {
        $('accountAvatar').style.backgroundImage = '';
        $('previewAvatar').style.backgroundImage = '';
    }
}

function getSavedLocation() {
    try {
        return JSON.parse(localStorage.getItem(locationStorageKey)) || defaultLocation;
    } catch (error) {
        return defaultLocation;
    }
}

function currentHomeLocation() {
    return {
        country: canonicalPlaceName($('homeCountryInput').value.trim()) || defaultLocation.country,
        city: canonicalPlaceName($('homeCityInput').value.trim()) || defaultLocation.city
    };
}

function setHomeInputs(location) {
    $('homeCountryInput').value = localizePlaceName(location.country || defaultLocation.country);
    $('homeCityInput').value = localizePlaceName(location.city || defaultLocation.city);
}

function rememberLocation(location) {
    localStorage.setItem(locationStorageKey, JSON.stringify(location));
}

async function loadHome(location = currentHomeLocation()) {
    const selected = {
        country: location.country || defaultLocation.country,
        city: location.city || defaultLocation.city
    };
    setHomeInputs(selected);
    setStatus($('homeStatus'), t('loadingHome'));

    try {
        const params = new URLSearchParams(selected);
        const data = await safeFetch(`/api/home?${params.toString()}`);
        currentHomeData = data;
        renderHome(data);
    } catch (error) {
        $('homeLocation').textContent = `${selected.city}, ${selected.country}`;
        $('temperature').textContent = formatTemperature('--');
        $('weatherCondition').textContent = 'Load failed';
        $('weatherTime').textContent = '';
        $('weatherCity').textContent = selected.city;
        $('windSpeed').textContent = '--';
        $('weatherTrend').textContent = '--';
        $('dailyTip').textContent = t('homeApiFailed');
        setStatus($('homeStatus'), error.message, true);
    }
}

function renderHome(data) {
    const city = data.city || {};
    const country = data.country || {};
    const weather = data.weather || {};
    const localizedWeather = localizedWeatherCopy(weather);
    const cityName = localizePlaceName(safeText(city.name, data.selectedCity));
    const countryName = localizePlaceName(safeText(country.name, data.selectedCountry));
    setHomeInputs({
        city: safeText(city.name, data.selectedCity),
        country: safeText(country.name, data.selectedCountry)
    });

    $('homeLocation').textContent = `${cityName}${currentLanguage === 'zh' ? '\uff0c' : ', '}${countryName}`;
    if ($('heroCityName')) $('heroCityName').textContent = cityName;
    $('temperature').textContent = formatTemperature(weather.temperature);
    $('weatherCondition').textContent = localizedWeather.condition;
    const weatherTime = safeText(weather.time, 'No update time').replace('T', ' ');
    const weatherTimezone = safeText(weather.timezone, '');
    $('weatherTime').textContent = weatherTimezone ? `${weatherTime} · ${weatherTimezone}` : weatherTime;
    $('weatherCity').textContent = cityName;
    $('windSpeed').textContent = `${safeText(weather.windSpeed, '--')} km/h`;
    $('weatherTrend').textContent = localizedWeather.trend;
    $('dailyTip').textContent = localizedWeather.tip;

    $('countryName').textContent = countryName;
    $('capitalName').textContent = localizePlaceName(safeText(country.capital));
    $('regionName').textContent = localizePlaceName(safeText(country.region));
    $('populationText').textContent = Number(country.population || 0).toLocaleString();
    $('languageText').textContent = listText(country.languages);
    $('currencyText').textContent = listText(country.currencies);

    const fallbackNotes = [country.note, city.note, weather.note].filter(Boolean);
    if (fallbackNotes.length) {
        setStatus($('homeStatus'), t('fallbackHome'), true);
        if ($('folioContext') && document.body.dataset.page === 'home') $('folioContext').textContent = `${cityName} \u00b7 ${t('limitedUpdate')}`;
    } else {
        setStatus($('homeStatus'), `${t('updated')}: ${cityName}${currentLanguage === 'zh' ? '\uff0c' : ', '}${countryName}`);
        if (document.body.dataset.page === 'home') {
            if ($('folioContext')) $('folioContext').textContent = `${cityName.toUpperCase()} \u00b7 ${t('updatedNow')}`;
        }
    }
}

$('homeLocationForm').addEventListener('submit', async event => {
    event.preventDefault();
    const location = currentHomeLocation();
    rememberLocation(location);
    const button = $('homeSearchBtn');
    if (button) {
        button.disabled = true;
        button.textContent = t('finding');
    }
    try {
        await loadHome(location);
    } finally {
        if (button) {
            button.disabled = false;
            button.textContent = t('searchBtn');
        }
    }
});

$('saveLocationBtn').addEventListener('click', async () => {
    if (!isOwnerAuthenticated()) {
        setStatus($('homeStatus'), t('signInToSaveLocation'), true);
        openOAuthModal();
        return;
    }
    const location = currentHomeLocation();
    rememberLocation(location);
    setStatus($('homeStatus'), t('savingLocation'));
    try {
        const profile = await safeFetch('/api/profile', { headers: jwtHeaders() });
        const payload = {
            name: profile.name || '',
            studentId: profile.studentId || '',
            email: profile.email || '',
            phone: profile.phone || '',
            title: profile.title || '',
            summary: profile.summary || '',
            country: location.country,
            city: location.city,
            location: `${location.city}, ${location.country}`
        };
        const result = await saveProfile(payload);
        if (result.saved === false) {
            setStatus($('homeStatus'), result.message || 'Location was not saved.', true);
            return;
        }
        currentProfile = result.profile || { ...profile, ...payload };
        renderProfile(currentProfile);
        setStatus($('homeStatus'), t('locationSaved'));
        effects.runSaveFeedback($('homeStatus'));
        await loadHome(location);
    } catch (error) {
        setStatus($('homeStatus'), error.message, true);
    }
});

function renderShortcuts() {
    const shortcutGrid = $('shortcutGrid');
    const studyLinkGrid = $('studyLinkGrid');

    if (shortcutGrid) {
        shortcutGrid.innerHTML = shortcuts.map(item => `
        <article class="shortcut">
            <img src="${item.image}" alt="">
            <div>
                <span class="shortcut-category">${t(item.categoryKey)}</span>
                <h3>${t(item.titleKey)}</h3>
                <p>${t(item.descriptionKey)}</p>
                <a class="secondary-btn" href="${item.url}" target="_blank" rel="noopener noreferrer">${t('open')}</a>
            </div>
        </article>
        `).join('');
    }

    if (studyLinkGrid) {
        studyLinkGrid.innerHTML = studyLinks.map(item => `
            <a class="study-link" href="${item.url}" target="_blank" rel="noopener noreferrer">
                <strong>${item.title}</strong>
                <span>${item.note}</span>
            </a>
        `).join('');
    }

    effects.bindShortcutHover();
}

async function loadProfile() {
    try {
        currentProfile = await safeFetch('/api/profile');
        renderProfile(currentProfile);
        await loadPortfolio();
        const profileLocation = {
            country: currentProfile.country || defaultLocation.country,
            city: currentProfile.city || defaultLocation.city
        };
        setHomeInputs(profileLocation);
        rememberLocation(profileLocation);
        return currentProfile;
    } catch (error) {
        setStatus($('saveStatus'), error.message, true);
        return null;
    }
}

function renderProfile(profile) {
    if (!profile) return;
    const guestPreset = profile.guestView === true && !isOwnerAuthenticated();
    const displayTitle = guestPreset ? t('guestProfileTitle') : localizedProfileTitle(profile.title);
    const displaySummary = guestPreset ? t('guestProfileSummary') : (profile.summary || '');
    const form = $('profileForm');
    form.name.value = profile.name || '';
    form.email.value = profile.email || '';
    form.phone.value = profile.phone || '';
    form.country.value = profile.country || defaultLocation.country;
    form.city.value = profile.city || defaultLocation.city;
    form.title.value = profileTitleKeys[profile.title] ? profile.title : 'STUDENT_CREATOR';
    form.summary.value = profile.summary || '';
    form.visibility.value = profile.visibility || 'PUBLIC';

    $('previewName').textContent = profile.name || 'Student';
    $('previewTitle').textContent = displayTitle;
    $('previewContact').textContent = [profile.email, [profile.city, profile.country].filter(Boolean).join(', ')].filter(Boolean).join(' | ');
    $('previewSummary').textContent = displaySummary;
    if ($('accountHolderName')) $('accountHolderName').textContent = (profile.name || 'Student').toUpperCase();
    if ($('previewAvatar')) {
        $('previewAvatar').textContent = (profile.name || 'S').charAt(0).toUpperCase();
        $('previewAvatar').style.backgroundImage = profile.avatarUrl ? `url("${profile.avatarUrl}")` : '';
    }
    setIdentity(
        currentAccount?.displayName || profile.name || 'Student',
        currentAccount?.avatarUrl || profile.avatarUrl || ''
    );
    if ($('folioContext') && document.body.dataset.page === 'me') {
        $('folioContext').textContent = `${profile.name || t('navMe')} · ${t('selectedWork')}`;
    }
}

async function loadPortfolio() {
    try {
        const data = await safeFetch('/api/portfolio');
        currentPortfolio = Array.isArray(data.items) ? data.items : [];
        currentPortfolioOwnerName = data.ownerName || '';
        if (!currentPortfolio.length && currentProfile?.guestView === true && !isOwnerAuthenticated()) {
            currentPortfolio = guestPortfolioDefaults();
            currentPortfolioOwnerName = currentProfile.name || '';
        }
        renderPortfolio();
        updatePortfolioOwnerLabel();
        return data;
    } catch (error) {
        currentPortfolio = [];
        if ($('portfolioGrid')) $('portfolioGrid').innerHTML = `<p class="muted">${safeText(error.message)}</p>`;
        return null;
    }
}

function guestPortfolioDefaults() {
    return [
        { id: -1, type: 'PHOTOGRAPHY', imageUrl: 'assets/campus-photo-01.jpg', presetKey: 'guestWork01' },
        { id: -2, type: 'PHOTOGRAPHY', imageUrl: 'assets/campus-photo-05.jpg', presetKey: 'guestWork02' },
        { id: -3, type: 'PHOTOGRAPHY', imageUrl: 'assets/campus-photo-08.jpg', presetKey: 'guestWork03' },
        { id: -4, type: 'PHOTOGRAPHY', imageUrl: 'assets/campus-extra-pond.jpg', presetKey: 'guestWork04' }
    ];
}

const profileTitleKeys = {
    STUDENT_CREATOR: 'roleStudentCreator',
    PHOTOGRAPHER: 'rolePhotographer',
    ARTIST: 'roleArtist',
    NOVELIST: 'roleNovelist',
    DESIGNER: 'roleDesigner',
    FILMMAKER: 'roleFilmmaker',
    MUSICIAN: 'roleMusician'
};

function localizedProfileTitle(value) {
    return t(profileTitleKeys[value] || 'roleStudentCreator');
}

function updatePortfolioOwnerLabel() {
    const label = $('portfolioOwnerLabel');
    if (!label) return;
    const count = currentPortfolio.length;
    const countText = currentLanguage === 'zh'
        ? `${count} \u9879\u4f5c\u54c1`
        : currentLanguage === 'ja'
            ? `${count} \u4f5c\u54c1`
            : `${count} ${count === 1 ? 'work' : 'works'}`;
    label.textContent = currentPortfolioOwnerName
        ? `${currentPortfolioOwnerName} · ${countText}`
        : countText;
}

function renderPortfolio() {
    const grid = $('portfolioGrid');
    if (!grid) return;
    grid.replaceChildren();
    if (!currentPortfolio.length) {
        const empty = document.createElement('p');
        empty.className = 'muted';
        empty.textContent = currentLanguage === 'zh'
            ? '\u6682\u65e0\u516c\u5f00\u4f5c\u54c1\u3002'
            : currentLanguage === 'ja'
                ? '\u516c\u958b\u4f5c\u54c1\u306f\u307e\u3060\u3042\u308a\u307e\u305b\u3093\u3002'
                : 'No public work has been added yet.';
        grid.appendChild(empty);
        return;
    }
    currentPortfolio.forEach(item => {
        const card = document.createElement('article');
        const layoutSize = ['STANDARD', 'WIDE', 'TALL'].includes(item.layoutSize) ? item.layoutSize : 'STANDARD';
        const mediaFit = item.mediaFit === 'CONTAIN' ? 'CONTAIN' : 'COVER';
        card.className = `portfolio-card layout-${layoutSize.toLowerCase()}`;
        const itemTitle = item.presetKey ? t(`${item.presetKey}Title`) : (item.title || 'Untitled');
        const itemDescription = item.presetKey ? t(`${item.presetKey}Description`) : (item.description || '');
        const mediaKind = item.mediaKind || 'IMAGE';
        let media;
        if (mediaKind === 'AUDIO') {
            media = document.createElement('div');
            media.className = 'portfolio-media portfolio-audio';
            const audio = document.createElement('audio');
            audio.controls = true;
            audio.preload = 'metadata';
            audio.src = item.imageUrl;
            audio.setAttribute('aria-label', itemTitle);
            media.appendChild(audio);
        } else if (mediaKind === 'TEXT') {
            media = document.createElement('a');
            media.className = 'portfolio-media portfolio-text';
            media.href = item.imageUrl;
            media.target = '_blank';
            media.rel = 'noopener';
            const mark = document.createElement('b');
            mark.textContent = 'TXT';
            const filename = document.createElement('small');
            filename.textContent = item.originalName || itemTitle;
            media.append(mark, filename);
        } else if (item.imageUrl) {
            media = document.createElement('img');
            media.className = `fit-${mediaFit.toLowerCase()}`;
            media.src = item.imageUrl;
            media.alt = itemTitle;
        } else {
            media = document.createElement('div');
            media.className = 'portfolio-media portfolio-missing';
            media.textContent = item.originalName || 'Media unavailable';
        }
        const type = document.createElement('span');
        type.textContent = item.type || 'WORK';
        const title = document.createElement('strong');
        title.textContent = itemTitle;
        const description = document.createElement('p');
        description.textContent = itemDescription;
        card.append(media, type, title, description);
        if (item.externalUrl) {
            card.tabIndex = 0;
            card.addEventListener('click', event => {
                if (!event.target.closest('a, audio, button')) {
                    window.open(item.externalUrl, '_blank', 'noopener');
                }
            });
        }
        grid.appendChild(card);
    });
}

function renderPortfolioManager() {
    const list = $('portfolioManageList');
    if (!list) return;
    list.replaceChildren();
    currentPortfolio.forEach(item => {
        const row = document.createElement('div');
        row.className = 'portfolio-manage-item';
        const copy = document.createElement('div');
        const title = document.createElement('strong');
        title.textContent = item.title || 'Untitled';
        const meta = document.createElement('small');
        meta.textContent = item.type || 'WORK';
        copy.append(title, meta);
        const controls = document.createElement('div');
        controls.className = 'portfolio-manage-controls';
        const layout = document.createElement('select');
        [
            ['STANDARD', t('layoutStandard')],
            ['WIDE', t('layoutWide')],
            ['TALL', t('layoutTall')]
        ].forEach(([value, label]) => layout.add(new Option(label, value)));
        layout.value = ['STANDARD', 'WIDE', 'TALL'].includes(item.layoutSize) ? item.layoutSize : 'STANDARD';
        const fit = document.createElement('select');
        [
            ['CONTAIN', t('fitContain')],
            ['COVER', t('fitCover')]
        ].forEach(([value, label]) => fit.add(new Option(label, value)));
        fit.value = item.mediaFit === 'CONTAIN' ? 'CONTAIN' : 'COVER';
        fit.disabled = (item.mediaKind || 'IMAGE') !== 'IMAGE';
        const saveDisplay = document.createElement('button');
        saveDisplay.type = 'button';
        saveDisplay.textContent = t('saveDisplay');
        saveDisplay.addEventListener('click', () => updatePortfolioPresentation(
            item,
            layout.value,
            fit.value,
            saveDisplay
        ));
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.textContent = t('removeWork');
        remove.addEventListener('click', () => deletePortfolioItem(item.id));
        controls.append(layout, fit, saveDisplay, remove);
        row.append(copy, controls);
        list.appendChild(row);
    });
}

async function updatePortfolioPresentation(item, layoutSize, mediaFit, button) {
    try {
        button.disabled = true;
        await safeFetch(`/api/portfolio/${item.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body: JSON.stringify({
                type: item.type || 'OTHER',
                title: item.title || 'Untitled',
                description: item.description || '',
                imageUrl: item.imageUrl || '',
                externalUrl: item.externalUrl || '',
                layoutSize,
                mediaFit,
                displayOrder: item.displayOrder ?? 100,
                public: item.public !== false
            })
        });
        await loadPortfolio();
        renderPortfolioManager();
        setStatus($('saveStatus'), t('displaySaved'));
    } catch (error) {
        setStatus($('saveStatus'), error.message, true);
    } finally {
        button.disabled = false;
    }
}

async function deletePortfolioItem(itemId) {
    try {
        await safeFetch(`/api/portfolio/${itemId}`, { method: 'DELETE' });
        await loadPortfolio();
        renderPortfolioManager();
    } catch (error) {
        setStatus($('saveStatus'), error.message, true);
    }
}

const uploadAccept = {
    IMAGE: '.jpg,.jpeg,.png,.gif,.webp,image/*',
    AUDIO: '.mp3,.wav,.ogg,.m4a,audio/*',
    TEXT: '.txt,.md,.csv,.json,text/plain,text/markdown,text/csv,application/json'
};

const uploadHintKey = {
    IMAGE: 'imageUploadHint',
    AUDIO: 'audioUploadHint',
    TEXT: 'textUploadHint'
};

function updateUploadPicker() {
    const kind = $('workMediaKind')?.value || 'IMAGE';
    const input = $('workFile');
    if (input) {
        input.accept = uploadAccept[kind];
        input.value = '';
    }
    if ($('workMediaFit')) {
        $('workMediaFit').disabled = kind !== 'IMAGE';
    }
    if ($('workFileHint')) $('workFileHint').textContent = t(uploadHintKey[kind]);
}

$('workMediaKind')?.addEventListener('change', updateUploadPicker);

$('addWorkBtn')?.addEventListener('click', async () => {
    const title = $('workTitle').value.trim();
    const file = $('workFile')?.files?.[0];
    if (!title) {
        setStatus($('saveStatus'), 'Add a title before saving the work.', true);
        return;
    }
    if (!file) {
        setStatus($('saveStatus'), t('chooseUploadFile'), true);
        return;
    }
    const formData = new FormData();
    formData.set('file', file);
    formData.set('mediaKind', $('workMediaKind').value);
    formData.set('type', $('workType').value);
    formData.set('title', title);
    formData.set('description', $('workDescription').value.trim());
    formData.set('layoutSize', $('workLayoutSize').value);
    formData.set('mediaFit', $('workMediaFit').value);
    formData.set('public', 'true');
    formData.set('displayOrder', String(currentPortfolio.length + 1));
    const button = $('addWorkBtn');
    try {
        button.disabled = true;
        setStatus($('saveStatus'), t('uploadingWork'));
        await safeFetch('/api/portfolio/upload', {
            method: 'POST',
            body: formData,
            timeoutMs: 60000
        });
        $('workTitle').value = '';
        $('workDescription').value = '';
        $('workFile').value = '';
        await loadPortfolio();
        renderPortfolioManager();
        setStatus($('saveStatus'), 'Work added to your portfolio.');
    } catch (error) {
        setStatus($('saveStatus'), error.message, true);
    } finally {
        button.disabled = false;
    }
});

function collectProfileForm() {
    const form = $('profileForm');
    const country = form.country.value.trim() || defaultLocation.country;
    const city = form.city.value.trim() || defaultLocation.city;
    return {
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        phone: form.phone.value.trim(),
        location: `${city}, ${country}`,
        country,
        city,
        title: form.title.value.trim(),
        summary: form.summary.value.trim(),
        visibility: form.visibility.value
    };
}

function setEditing(enabled) {
    if (enabled && !isOwnerAuthenticated()) {
        setStatus($('saveStatus'), t('signInToEdit'), true);
        openOAuthModal();
        return;
    }
    $('profileForm').querySelectorAll('input, textarea, select').forEach(input => {
        input.disabled = !enabled;
    });
    $('saveBtn').disabled = !enabled;
    $('cancelEditBtn').classList.toggle('is-hidden', !enabled);
    $('editBtn').classList.toggle('is-hidden', enabled);
    $('profileForm').classList.toggle('editing-open', enabled);
    $('profileForm').setAttribute('aria-hidden', String(!enabled));
    $('portfolioEditor')?.classList.toggle('is-hidden', !enabled);
    if (enabled) renderPortfolioManager();
}

$('editBtn').addEventListener('click', () => {
    if (!isOwnerAuthenticated()) {
        setStatus($('saveStatus'), t('signInToEdit'), true);
        openOAuthModal();
        return;
    }
    profileBeforeEdit = currentProfile ? structuredClone(currentProfile) : null;
    setEditing(true);
    setStatus($('saveStatus'), t('editingProfile'));
});

$('cancelEditBtn').addEventListener('click', () => {
    if (profileBeforeEdit) renderProfile(profileBeforeEdit);
    setEditing(false);
    setStatus($('saveStatus'), isOwnerAuthenticated() ? t('profileOwnerNote') : t('profileInitialStatus'));
});

async function saveProfile(payload) {
    return safeFetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8', ...jwtHeaders() },
        body: JSON.stringify(payload)
    });
}

$('profileForm').addEventListener('submit', async event => {
    event.preventDefault();
    setStatus($('saveStatus'), t('saving'));
    $('saveBtn').disabled = true;
    $('profileForm').classList.add('is-saving');
    try {
        const result = await saveProfile(collectProfileForm());
        if (result.saved === false) {
            setStatus($('saveStatus'), result.message || 'Profile was not saved.', true);
            return;
        }
        currentProfile = result.profile;
        renderProfile(currentProfile);
        setEditing(false);
        const location = { country: currentProfile.country, city: currentProfile.city };
        setHomeInputs(location);
        rememberLocation(location);
        setStatus($('saveStatus'), t('profileSaved'));
        effects.runSaveFeedback($('saveStatus'));
        await loadHome(location);
    } catch (error) {
        setStatus($('saveStatus'), error.message, true);
    } finally {
        $('profileForm').classList.remove('is-saving');
        if ($('profileForm').classList.contains('editing-open')) $('saveBtn').disabled = false;
    }
});

$('exportPdfBtn').addEventListener('click', () => window.print());

function openOAuthModal() {
    switchPage('account');
    const dialog = $('authDialog');
    if (dialog && !dialog.open) dialog.showModal();
}

function closeOAuthModal() {
    const dialog = $('authDialog');
    if (dialog?.open) dialog.close();
}

$('openAuthBtn')?.addEventListener('click', openOAuthModal);
$('closeAuthBtn')?.addEventListener('click', closeOAuthModal);
document.querySelector('.guest-action')?.addEventListener('click', closeOAuthModal);
$('authDialog')?.addEventListener('click', event => {
    if (event.target === $('authDialog')) closeOAuthModal();
});

document.querySelectorAll('[data-oauth-provider]').forEach(button => {
    button.addEventListener('click', () => {
        const provider = button.dataset.oauthProvider;
        document.querySelectorAll('[data-oauth-provider]').forEach(item => {
            item.disabled = true;
        });
        button.classList.add('is-loading');
        setOAuthState('pending', `${t('oauthRedirecting')} ${provider} login...`, t('oauthWaiting'), provider);
        window.location.href = `/oauth2/authorization/${provider}`;
    });
});

function setOAuthState(state, title, detail, provider = t('notLoggedIn'), user = {}) {
    const dot = $('oauthStatusDot');
    const badge = $('oauthProviderBadge');
    if (dot) dot.className = `status-dot ${state}`;
    if (badge) {
        badge.className = `provider-badge ${state}`;
        badge.textContent = provider || t('notLoggedIn');
    }
    if ($('oauthStatusTitle')) $('oauthStatusTitle').textContent = title;
    if ($('oauthStatusDetail')) $('oauthStatusDetail').textContent = detail;
    if ($('oauthUserName')) $('oauthUserName').textContent = user.name || user.login || user.email || t('noOAuthUser');
    if ($('oauthUserMeta')) $('oauthUserMeta').textContent = t('oauthUserMeta');
}

async function loadOAuthStatus() {
    try {
        const data = await safeFetch('/api/oauth/status');
        currentOAuthUser = data.authenticated ? data : null;
        if (data.authenticated) {
            const provider = data.currentProvider || 'OAuth';
            const displayName = data.name || data.login || data.email || 'authorized user';
            setOAuthState('ok', `${t('oauthLoggedIn')} ${provider}`, `${t('oauthAuthorizedAs')} ${displayName}.`, provider, data);
            setIdentity(displayName, data.avatarUrl || '');
        } else {
            setOAuthState('idle', t('oauthNotConnected'), t('oauthChoose'), t('notLoggedIn'));
            setIdentity(currentProfile?.name || 'Student');
        }
        updateOwnerUi();
        return data;
    } catch (error) {
        currentOAuthUser = null;
        setOAuthState('error', t('oauthStatusFailed'), error.message, 'Error');
        updateOwnerUi();
        return null;
    }
}

function updateConnectedAccount() {
    const panel = $('connectedAccount');
    if (!panel) return;
    const user = currentAccount;
    const connected = Boolean(user);
    panel.classList.toggle('is-hidden', !connected);
    document.querySelector('.provider-options')?.classList.toggle('is-hidden', connected);
    $('authForm')?.closest('.local-account')?.classList.toggle('is-hidden', connected);
    document.querySelector('.auth-divider')?.classList.toggle('is-hidden', connected);
    document.querySelector('.guest-action')?.classList.toggle('is-hidden', connected);
    if (!connected) return;

    const name = user.displayName || user.username || 'Student';
    const provider = user.provider || 'local';
    const providerLabel = provider === 'local' ? t('localAccount') : provider;
    $('connectedName').textContent = name;
    $('connectedMeta').textContent = `${user.role} · ${providerLabel}`;
    const hasConnectedService = provider === 'github';
    $('connectedServiceBtn').classList.toggle('is-hidden', !hasConnectedService);
    $('connectedServiceBtn').textContent = t('githubAction');
    $('connectedAvatar').textContent = (name.charAt(0) || 'S').toUpperCase();
    $('connectedAvatar').style.backgroundImage = user.avatarUrl ? `url("${user.avatarUrl}")` : '';
}

function appendServiceItem(container, title, meta = '', url = '') {
    const item = document.createElement(url ? 'a' : 'div');
    item.className = 'service-item';
    if (url) {
        item.href = url;
        item.target = '_blank';
        item.rel = 'noopener noreferrer';
    }
    const strong = document.createElement('strong');
    strong.textContent = title;
    item.appendChild(strong);
    if (meta) {
        const small = document.createElement('small');
        small.textContent = meta;
        item.appendChild(small);
    }
    container.appendChild(item);
}

async function loadConnectedService() {
    const result = $('connectedServiceResult');
    const provider = currentAccount?.provider;
    if (provider !== 'github') return;
    result.replaceChildren();
    result.textContent = t('oauthApiLoading');
    try {
        result.replaceChildren();
        const [profile, reposData] = await Promise.all([
            safeFetch('/api/oauth/github/profile'),
            safeFetch('/api/oauth/github/repos')
        ]);
        appendServiceItem(result, profile.name || profile.login || 'GitHub profile', `${profile.publicRepos ?? 0} public repositories`, profile.profileUrl || '');
        const repos = Array.isArray(reposData.repos) ? reposData.repos : [];
        if (!repos.length) appendServiceItem(result, t('noRepositories'));
        repos.slice(0, 5).forEach(repo => appendServiceItem(result, repo.name || 'Repository', repo.description || '', repo.html_url || ''));
    } catch (error) {
        result.textContent = `${t('serviceLoadFailed')} ${error.message}`;
    }
}

$('connectedServiceBtn').addEventListener('click', loadConnectedService);

async function loadOAuthApi(apiPath) {
    const output = $('oauthResult');
    output.textContent = `${t('oauthApiLoading')} ${apiPath} ...`;
    try {
        const data = await safeFetch(apiPath);
        output.textContent = JSON.stringify(data, null, 2);
        setOAuthState('ok', t('oauthApiSucceeded'), `${data.source || apiPath} ${t('oauthApiReturned')}`, data.source || 'Authorized');
    } catch (error) {
        const message = error.status === 401 ? t('oauthProviderRequired') : error.message;
        output.textContent = JSON.stringify(error.data || { error: message }, null, 2);
        setOAuthState('error', t('oauthApiFailed'), message, 'Failed');
    }
}

function jwtHeaders() {
    return {};
}

function updateAuthStatus(message, isError = false) {
    setStatus($('authStatus'), message, isError);
}

$('authForm').addEventListener('submit', async event => {
    event.preventDefault();
    updateAuthStatus(t('checkingSignIn'));
    try {
        const data = await safeFetch('/api/authenticate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body: JSON.stringify({
                username: $('authUsername').value.trim(),
                password: $('authPassword').value
            })
        });
        currentAccount = data.user || null;
        $('authPassword').value = '';
        updateAuthStatus(`${t('signedInStatus')}: ${data.user?.displayName || data.user?.username || ''}`);
        updateOwnerUi();
        await loadProfile();
        closeOAuthModal();
    } catch (error) {
        updateAuthStatus(error.message, true);
    }
});

$('registerBtn').addEventListener('click', async () => {
    updateAuthStatus(t('checkingSignIn'));
    try {
        const data = await safeFetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body: JSON.stringify({
                username: $('authUsername').value.trim(),
                password: $('authPassword').value
            })
        });
        currentAccount = data.user || null;
        $('authPassword').value = '';
        updateAuthStatus(`${t('registered')}: ${data.user?.displayName || data.user?.username || ''}`);
        updateOwnerUi();
        await loadProfile();
        closeOAuthModal();
    } catch (error) {
        updateAuthStatus(error.message, true);
    }
});

$('togglePasswordBtn')?.addEventListener('click', () => {
    const password = $('authPassword');
    const reveal = password.type === 'password';
    password.type = reveal ? 'text' : 'password';
    $('togglePasswordBtn').textContent = reveal ? t('hidePassword') : t('showPassword');
    $('togglePasswordBtn').setAttribute('aria-label', reveal ? t('hidePassword') : t('showPassword'));
});

$('logoutBtn')?.addEventListener('click', async () => {
    const oauthSession = Boolean(currentAccount?.provider && currentAccount.provider !== 'local');
    try {
        await safeFetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
        // Clear the browser view even if the local session has already expired.
    }
    if (oauthSession) {
        try {
            await safeFetch('/logout', { method: 'POST' });
        } catch (error) {
            // The OAuth session may already have expired; local state is still cleared below.
        }
    }
    currentAccount = null;
    currentOAuthUser = null;
    updateAuthStatus(t('authReady'));
    updateOwnerUi();
    await loadProfile();
    setOAuthState('idle', t('oauthLoggedOut'), t('oauthLoggedOutDetail'), t('notLoggedIn'));
});

async function loadCurrentAccount() {
    try {
        const data = await safeFetch('/api/auth/me');
        currentAccount = data.authenticated ? data.user : null;
        if (currentAccount) {
            updateAuthStatus(`${t('signedInStatus')}: ${currentAccount.displayName || currentAccount.username}`);
        } else {
            updateAuthStatus(t('authReady'));
        }
        updateOwnerUi();
        return currentAccount;
    } catch (error) {
        currentAccount = null;
        updateAuthStatus(error.message, true);
        updateOwnerUi();
        return null;
    }
}

async function loadAdminUsers() {
    if (currentAccount?.role !== 'ADMIN' || !$('adminUserList')) return;
    try {
        const data = await safeFetch('/api/admin/users');
        $('adminUserList').replaceChildren();
        (data.users || []).forEach(user => {
            const row = document.createElement('div');
            row.className = 'admin-user-row';
            const copy = document.createElement('div');
            const name = document.createElement('strong');
            name.textContent = user.displayName || user.username;
            const meta = document.createElement('small');
            meta.textContent = `${user.username} · ${user.role} · ${user.provider}`;
            copy.append(name, meta);
            const actions = document.createElement('div');
            actions.className = 'admin-user-actions';
            const toggle = document.createElement('button');
            toggle.type = 'button';
            toggle.textContent = user.enabled ? 'DISABLE' : 'ENABLE';
            toggle.disabled = user.id === currentAccount.id;
            toggle.addEventListener('click', async () => {
                await safeFetch(`/api/admin/users/${user.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json; charset=utf-8' },
                    body: JSON.stringify({ enabled: !user.enabled })
                });
                await loadAdminUsers();
            });
            const remove = document.createElement('button');
            remove.type = 'button';
            remove.textContent = t('deleteAccount');
            remove.disabled = user.id === currentAccount.id;
            remove.addEventListener('click', async () => {
                if (!window.confirm(t('deleteAccountConfirm'))) return;
                await safeFetch(`/api/admin/users/${user.id}`, { method: 'DELETE' });
                await loadAdminUsers();
            });
            actions.append(toggle, remove);
            row.append(copy, actions);
            $('adminUserList').appendChild(row);
        });
    } catch (error) {
        $('adminUserList').textContent = error.message;
    }
}

async function handleUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const page = params.get('page');
    const authError = params.get('authError');
    const authSuccess = params.get('authSuccess');

    if (page === 'oauth' || page === 'account') {
        switchPage('account');
    } else if (pages[page]) {
        switchPage(page);
    }
    if (authError) {
        switchPage('account');
        setOAuthState('error', t('oauthLoginFailed'), t('oauthProviderIncomplete'), 'Failed');
    }
    if (authSuccess) {
        openOAuthModal();
    }

    ['page', 'authError', 'authSuccess'].forEach(key => params.delete(key));
    const query = params.toString();
    history.replaceState(null, '', `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash || '#home'}`);
}

async function init() {
    updateIssueDate();
    window.setInterval(updateIssueDate, 60000);
    applyLanguage();
    const hashPage = window.location.hash.replace('#', '');
    if (pages[hashPage]) switchPage(hashPage, false);
    await loadCsrfToken();
    await loadOAuthStatus();
    await loadCurrentAccount();
    const profile = await loadProfile();
    await loadHome(profile ? { country: profile.country, city: profile.city } : getSavedLocation());
    await handleUrlParams();
    effects.runEntrance();
}

init();
