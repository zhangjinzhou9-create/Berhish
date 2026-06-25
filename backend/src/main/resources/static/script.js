const pages = {
    home: document.getElementById('homePage'),
    nav: document.getElementById('navPage'),
    me: document.getElementById('mePage')
};

const translations = {
    en: {
        menuHome: 'Home',
        menuNav: 'Quick Access',
        menuMe: 'Me',
        campusUser: 'Campus Flow User',
        dateSubtitle: 'Keep learning, keep growing.',
        languageLabel: 'Language',
        homeHeroTitle: "Enter a country and city to generate today's life tips",
        countryLabel: 'Country',
        cityLabel: 'City',
        searchBtn: 'Search',
        saveLocationBtn: 'Save to Profile',
        currentWeather: 'Current Weather',
        changeLocation: 'Change Location',
        windSpeed: 'Wind Speed',
        trend: 'Trend',
        countryInfo: 'Country Information',
        capital: 'Capital',
        region: 'Region',
        population: 'Population',
        languages: 'Languages',
        currency: 'Currency',
        quickTitle: 'Useful Web Shortcuts',
        profileTitle: 'Resume Profile',
        nameLabel: 'Name',
        studentIdLabel: 'Student ID',
        emailLabel: 'Email',
        phoneLabel: 'Phone',
        titleLabel: 'Title',
        summaryLabel: 'Summary',
        editBtn: 'Edit',
        saveBtn: 'Save',
        exportPdf: 'Export PDF',
        shortcutOpen: 'Open link',
        statusHomeIndependent: 'The Home page can search independently.',
        statusSavingLocation: 'Saving location to profile...',
        statusLocationSaveFailed: 'Location was not saved. Please check the database.',
        statusLocationSaved: 'Location saved to profile. Home page refreshed.',
        statusSaveLocationError: 'Save failed. Please confirm that the backend and database are running.',
        statusProfileLoadFailed: 'Profile failed to load, but Home can still search independently.',
        statusEditing: 'You can edit the profile now.',
        statusSaving: 'Saving...',
        statusProfileSaveFailed: 'Save failed. Please check the database.',
        statusProfileSaved: 'Saved successfully. Home location has been synchronized.',
        statusLoadingHome: 'Loading country information and weather...',
        statusFallbackData: 'Fallback data is shown. Please check the network or city name.',
        statusUpdated: 'Updated',
        statusHomeFailed: 'Home API failed. Please confirm that the backend is running.',
        statusRetryHome: 'Home failed to load. You can change the country and city and search again.',
        clothing: 'Clothing',
        reminder: 'Reminder',
        loading: 'Loading',
        generatingTips: 'Generating life tips...',
        readFailed: 'Load failed'
    },
    zh: {
        menuHome: '首页',
        menuNav: '快捷导航',
        menuMe: '个人',
        campusUser: 'Campus Flow 用户',
        dateSubtitle: '持续学习，持续成长。',
        languageLabel: '语言',
        homeHeroTitle: '输入国家和城市，生成今天的生活提示',
        countryLabel: '国家',
        cityLabel: '城市',
        searchBtn: '查询',
        saveLocationBtn: '保存到资料',
        currentWeather: '当前天气',
        changeLocation: '修改地区',
        windSpeed: '风速',
        trend: '趋势',
        countryInfo: '国家信息',
        capital: '首都',
        region: '地区',
        population: '人口',
        languages: '语言',
        currency: '货币',
        quickTitle: '常用网页入口',
        profileTitle: '简历资料',
        nameLabel: '姓名',
        studentIdLabel: '学号',
        emailLabel: '邮箱',
        phoneLabel: '电话',
        titleLabel: '标题',
        summaryLabel: '自我介绍',
        editBtn: '修改',
        saveBtn: '保存',
        exportPdf: '导出 PDF',
        shortcutOpen: '打开链接',
        statusHomeIndependent: '首页可以独立查询，不需要先打开个人资料。',
        statusSavingLocation: '正在保存地区到个人资料...',
        statusLocationSaveFailed: '地区没有保存成功，请检查数据库。',
        statusLocationSaved: '地区已保存到个人资料，首页也已刷新。',
        statusSaveLocationError: '保存失败，请确认后端和数据库正在运行。',
        statusProfileLoadFailed: '个人资料读取失败，但首页仍可独立查询。',
        statusEditing: '现在可以修改资料。',
        statusSaving: '正在保存...',
        statusProfileSaveFailed: '保存失败，请检查数据库。',
        statusProfileSaved: '保存成功，首页地区已同步。',
        statusLoadingHome: '正在读取国家信息和天气...',
        statusFallbackData: '正在显示备用数据，请检查网络或城市名称。',
        statusUpdated: '已更新',
        statusHomeFailed: '首页 API 读取失败，请确认后端正在运行。',
        statusRetryHome: '首页读取失败，可以修改国家和城市后重新查询。',
        clothing: '穿衣建议',
        reminder: '生活提醒',
        loading: '读取中',
        generatingTips: '正在生成生活建议...',
        readFailed: '读取失败'
    },
    ja: {
        menuHome: 'ホーム',
        menuNav: 'クイックアクセス',
        menuMe: 'プロフィール',
        campusUser: 'Campus Flow ユーザー',
        dateSubtitle: '学び続け、成長し続ける。',
        languageLabel: '言語',
        homeHeroTitle: '国と都市を入力して、今日の生活ヒントを表示',
        countryLabel: '国',
        cityLabel: '都市',
        searchBtn: '検索',
        saveLocationBtn: 'プロフィールに保存',
        currentWeather: '現在の天気',
        changeLocation: '地域を変更',
        windSpeed: '風速',
        trend: '傾向',
        countryInfo: '国の情報',
        capital: '首都',
        region: '地域',
        population: '人口',
        languages: '言語',
        currency: '通貨',
        quickTitle: '便利なウェブリンク',
        profileTitle: '履歴書プロフィール',
        nameLabel: '名前',
        studentIdLabel: '学生番号',
        emailLabel: 'メール',
        phoneLabel: '電話',
        titleLabel: 'タイトル',
        summaryLabel: '自己紹介',
        editBtn: '編集',
        saveBtn: '保存',
        exportPdf: 'PDF 出力',
        shortcutOpen: 'リンクを開く',
        statusHomeIndependent: 'ホーム画面はプロフィールを開かなくても検索できます。',
        statusSavingLocation: '地域をプロフィールに保存しています...',
        statusLocationSaveFailed: '地域を保存できませんでした。データベースを確認してください。',
        statusLocationSaved: '地域をプロフィールに保存し、ホーム画面も更新しました。',
        statusSaveLocationError: '保存に失敗しました。バックエンドとデータベースを確認してください。',
        statusProfileLoadFailed: 'プロフィールの読み込みに失敗しましたが、ホーム検索は利用できます。',
        statusEditing: 'プロフィールを編集できます。',
        statusSaving: '保存中...',
        statusProfileSaveFailed: '保存に失敗しました。データベースを確認してください。',
        statusProfileSaved: '保存しました。ホームの地域も同期しました。',
        statusLoadingHome: '国情報と天気を読み込んでいます...',
        statusFallbackData: '代替データを表示しています。ネットワークまたは都市名を確認してください。',
        statusUpdated: '更新済み',
        statusHomeFailed: 'ホーム API の読み込みに失敗しました。バックエンドを確認してください。',
        statusRetryHome: 'ホームの読み込みに失敗しました。国と都市を変更して再検索できます。',
        clothing: '服装',
        reminder: 'リマインダー',
        loading: '読み込み中',
        generatingTips: '生活ヒントを生成しています...',
        readFailed: '読み込み失敗'
    }
};

const pageTitleKeys = {
    home: 'menuHome',
    nav: 'menuNav',
    me: 'menuMe'
};

const defaultLocation = { country: 'Japan', city: 'Kyoto' };
const locationStorageKey = 'campusFlowLocation';
const languageStorageKey = 'campusFlowLanguage';

const form = document.getElementById('profileForm');
const homeLocationForm = document.getElementById('homeLocationForm');
const homeCountryInput = document.getElementById('homeCountryInput');
const homeCityInput = document.getElementById('homeCityInput');
const saveBtn = document.getElementById('saveBtn');
const saveStatus = document.getElementById('saveStatus');
const homeStatus = document.getElementById('homeStatus');
const languageSelect = document.getElementById('languageSelect');
const oauthStatusDot = document.getElementById('oauthStatusDot');
const oauthStatusTitle = document.getElementById('oauthStatusTitle');
const oauthStatusDetail = document.getElementById('oauthStatusDetail');
const oauthProviderBadge = document.getElementById('oauthProviderBadge');
const oauthModal = document.getElementById('oauthModal');
const sideAvatar = document.getElementById('sideAvatar');
const sideName = document.getElementById('sideName');
const sideSubtitle = document.getElementById('sideSubtitle');
let currentProfile = null;
let currentLanguage = localStorage.getItem(languageStorageKey) || 'en';

const seasonAssets = {
    spring: 'assets/season-spring-optimized.jpg',
    summer: 'assets/season-summer-optimized.jpg',
    autumn: 'assets/season-autumn-optimized.jpg',
    winter: 'assets/season-winter-optimized.jpg'
};

const effects = window.CampusFlowEffects || {
    runEntrance() {},
    runSaveFeedback() {},
    bindShortcutHover() {}
};

const shortcuts = [
    ['Google', 'https://www.google.com'],
    ['YouTube', 'https://www.youtube.com'],
    ['GitHub', 'https://github.com'],
    ['Gmail', 'https://mail.google.com'],
    ['Google Translate', 'https://translate.google.com'],
    ['DeepL', 'https://www.deepl.com/translator'],
    ['Notion', 'https://www.notion.so'],
    ['Bilibili', 'https://www.bilibili.com'],
    ['Zhihu', 'https://www.zhihu.com'],
    ['Xiaohongshu', 'https://www.xiaohongshu.com'],
    ['KCGI', 'https://www.kcg.edu/'],
    ['Google Maps', 'https://maps.google.com']
];

function text(key) {
    return translations[currentLanguage]?.[key] || translations.en[key] || key;
}

function applyLanguage() {
    document.documentElement.lang = currentLanguage === 'zh' ? 'zh-CN' : currentLanguage;
    languageSelect.value = currentLanguage;

    document.querySelectorAll('[data-i18n]').forEach(element => {
        element.textContent = text(element.dataset.i18n);
    });

    document.querySelectorAll('[data-i18n-label]').forEach(label => {
        const firstTextNode = Array.from(label.childNodes).find(node => node.nodeType === Node.TEXT_NODE);
        if (firstTextNode) firstTextNode.nodeValue = text(label.dataset.i18nLabel);
    });

    const activePage = document.querySelector('.menu-item.active')?.dataset.page || 'home';
    document.getElementById('pageTitle').textContent = text(pageTitleKeys[activePage]);
    document.getElementById('todayText').textContent = formatToday();
    renderShortcuts();
    refreshStaticMessages();
}

function formatToday() {
    const locale = currentLanguage === 'zh' ? 'zh-CN' : currentLanguage === 'ja' ? 'ja-JP' : 'en-US';
    return new Date().toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });
}

function seasonForDate(date = new Date()) {
    const month = date.getMonth() + 1;
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'autumn';
    return 'winter';
}

function setSeasonImageVariable(variableName, season) {
    const imagePath = seasonAssets[season] || seasonAssets.spring;
    document.documentElement.style.setProperty(variableName, `url("${imagePath}")`);
}

function applySeasonImages() {
    const seasons = ['spring', 'summer', 'autumn', 'winter'];
    const homeSeason = seasonForDate();
    const homeIndex = seasons.indexOf(homeSeason);
    const navSeason = seasons[(homeIndex + 1) % seasons.length];
    const meSeason = seasons[(homeIndex + 2) % seasons.length];

    document.body.dataset.season = homeSeason;
    setSeasonImageVariable('--theme-bg-image', homeSeason);
    setSeasonImageVariable('--home-season-image', homeSeason);
    setSeasonImageVariable('--nav-season-image', navSeason);
    setSeasonImageVariable('--me-season-image', meSeason);
}

function setSidebarIdentity(name = 'Student', avatarUrl = '', subtitle = text('campusUser')) {
    if (sideName) sideName.textContent = name || 'Student';
    if (sideSubtitle) sideSubtitle.textContent = subtitle || text('campusUser');
    if (!sideAvatar) return;

    sideAvatar.style.backgroundImage = '';
    sideAvatar.textContent = (name || 'S').trim().charAt(0).toUpperCase() || 'S';
    if (avatarUrl) {
        sideAvatar.textContent = '';
        sideAvatar.style.backgroundImage = `url("${avatarUrl}")`;
    }
}

function refreshStaticMessages() {
    const knownHomeMessages = Object.values(translations)
        .map(lang => lang.statusHomeIndependent)
        .concat(['']);
    if (knownHomeMessages.includes(homeStatus.textContent)) {
        setStatus(homeStatus, text('statusHomeIndependent'));
    }

    const dailyTip = document.getElementById('dailyTip');
    const knownTipMessages = Object.values(translations).map(lang => lang.generatingTips);
    if (knownTipMessages.includes(dailyTip.textContent)) {
        dailyTip.textContent = text('generatingTips');
    }
}

function switchPage(name) {
    Object.values(pages).forEach(page => page.classList.remove('active-page'));
    pages[name].classList.add('active-page');
    document.getElementById('pageTitle').textContent = text(pageTitleKeys[name]);

    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === name);
    });

    if (name === 'home') loadHome();
}

function savedHomeLocation() {
    const urlLocation = locationFromUrl();
    if (urlLocation) return urlLocation;

    try {
        return JSON.parse(localStorage.getItem(locationStorageKey)) || defaultLocation;
    } catch (error) {
        return defaultLocation;
    }
}

function locationFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const country = params.get('country');
    const city = params.get('city');
    if (!country && !city) return null;
    return {
        country: country || defaultLocation.country,
        city: city || defaultLocation.city
    };
}

function currentHomeLocation() {
    return {
        country: homeCountryInput.value.trim() || defaultLocation.country,
        city: homeCityInput.value.trim() || defaultLocation.city
    };
}

function setHomeInputs(location) {
    homeCountryInput.value = location.country || defaultLocation.country;
    homeCityInput.value = location.city || defaultLocation.city;
}

function rememberHomeLocation(location) {
    localStorage.setItem(locationStorageKey, JSON.stringify(location));
}

function setStatus(element, message, isError = false) {
    element.textContent = message;
    element.style.color = isError ? '#dc2626' : '#0f766e';
}

document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', () => switchPage(item.dataset.page));
});

languageSelect.addEventListener('change', () => {
    currentLanguage = languageSelect.value;
    localStorage.setItem(languageStorageKey, currentLanguage);
    applyLanguage();
});

document.getElementById('goProfileBtn').addEventListener('click', () => switchPage('me'));
document.getElementById('reloadHomeBtn')?.addEventListener('click', () => loadHome());
document.getElementById('exportPdfBtn').addEventListener('click', () => window.print());

document.querySelectorAll('[data-oauth-api]').forEach(button => {
    button.addEventListener('click', async () => {
        await loadOAuthApi(button.dataset.oauthApi);
    });
});

function openOAuthModal() {
    oauthModal?.classList.remove('hidden');
    oauthModal?.setAttribute('aria-hidden', 'false');
}

function closeOAuthModal() {
    oauthModal?.classList.add('hidden');
    oauthModal?.setAttribute('aria-hidden', 'true');
}

document.getElementById('oauthChooseBtn')?.addEventListener('click', openOAuthModal);
document.getElementById('oauthModalClose')?.addEventListener('click', closeOAuthModal);
oauthModal?.addEventListener('click', event => {
    if (event.target === oauthModal) closeOAuthModal();
});

document.querySelectorAll('[data-oauth-provider]').forEach(button => {
    button.addEventListener('click', () => {
        const provider = button.dataset.oauthProvider;
        setOAuthState('pending', `Redirecting to ${provider} login...`, 'Waiting for authorization', provider);
        window.location.href = `/oauth2/authorization/${provider}`;
    });
});

document.getElementById('oauthRefreshBtn')?.addEventListener('click', loadOAuthStatus);

function setOAuthState(state, title, detail, provider = 'Not logged in') {
    if (!oauthStatusDot || !oauthStatusTitle || !oauthStatusDetail || !oauthProviderBadge) return;

    oauthStatusDot.classList.remove('ok', 'error', 'pending');
    oauthProviderBadge.classList.remove('ok', 'error', 'pending');
    if (state === 'ok') {
        oauthStatusDot.classList.add('ok');
        oauthProviderBadge.classList.add('ok');
    }
    if (state === 'error') {
        oauthStatusDot.classList.add('error');
        oauthProviderBadge.classList.add('error');
    }
    if (state === 'pending') {
        oauthStatusDot.classList.add('pending');
        oauthProviderBadge.classList.add('pending');
    }

    oauthStatusTitle.textContent = title;
    oauthStatusDetail.textContent = detail;
    oauthProviderBadge.textContent = provider || 'Not logged in';
}

async function loadOAuthStatus() {
    try {
        const response = await fetch('/api/oauth/status', {
            headers: { 'Accept': 'application/json' }
        });
        const data = await response.json();
        if (data.authenticated) {
            const provider = data.currentProvider || 'oauth';
            const displayName = data.name || data.login || data.email || 'authorized user';
            setOAuthState('ok', `Logged in with ${provider}`, `Authorized as ${displayName}. You can verify the related API below.`, provider);
            setSidebarIdentity(displayName, data.avatarUrl || '', provider);
            return data;
        }

        setOAuthState('idle', 'OAuth not connected', 'Choose Google or GitHub to verify third-party login.', 'Not logged in');
        if (currentProfile) {
            setSidebarIdentity(currentProfile.name || 'Student', '', text('campusUser'));
        }
        return data;
    } catch (error) {
        setOAuthState('error', 'OAuth status check failed', 'The app could not read login status. Confirm that the backend is running.', 'Error');
        console.error(error);
        return null;
    }
}

async function loadOAuthApi(apiPath) {
    const output = document.getElementById('oauthResult');
    if (!output) return;
    output.textContent = `Loading ${apiPath} ...`;
    setOAuthState('pending', 'Checking OAuth API...', `Requesting ${apiPath}`, 'Checking');

    try {
        const response = await fetch(apiPath, {
            headers: { 'Accept': 'application/json' }
        });
        const contentType = response.headers.get('content-type') || '';
        const data = contentType.includes('application/json')
            ? await response.json()
            : { message: await response.text() };

        output.textContent = JSON.stringify(data, null, 2);
        if (response.ok) {
            setOAuthState('ok', 'OAuth API verification succeeded', `${data.source || apiPath} returned a valid response.`, data.source || 'Authorized');
        } else {
            setOAuthState('error', 'OAuth API verification failed', data.error || 'Login is missing, expired, or for the wrong provider.', 'Failed');
        }
    } catch (error) {
        output.textContent = `OAuth API request failed: ${error.message}`;
        setOAuthState('error', 'OAuth API request failed', error.message, 'Error');
        console.error(error);
    }
}

async function autoVerifyOAuthFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const provider = params.get('oauth');
    const oauthError = params.get('oauthError');
    const logout = params.get('logout');
    if (logout) {
        switchPage('me');
        setOAuthState('idle', 'OAuth logged out', 'You are not connected to Google or GitHub now.', 'Not logged in');
        return;
    }
    if (oauthError) {
        switchPage('me');
        const status = await loadOAuthStatus();
        if (status?.authenticated) {
            clearOAuthQuery();
            return;
        }
        setOAuthState('error', 'OAuth login failed', oauthError === 'true' ? 'The third-party provider did not complete authorization.' : oauthError, 'Failed');
        return;
    }
    if (!provider) return;

    const apiByProvider = {
        github: '/api/oauth/github/profile',
        google: '/api/oauth/google/calendar'
    };
    const apiPath = apiByProvider[provider];
    if (!apiPath) return;

    switchPage('me');
    await loadOAuthStatus();
    await loadOAuthApi(apiPath);
    clearOAuthQuery();
}

function clearOAuthQuery() {
    const url = new URL(window.location.href);
    url.searchParams.delete('oauth');
    url.searchParams.delete('oauthError');
    url.searchParams.delete('logout');
    window.history.replaceState({}, '', url);
}

homeLocationForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const location = currentHomeLocation();
    rememberHomeLocation(location);
    await loadHome(location);
});

document.getElementById('saveLocationBtn').addEventListener('click', async () => {
    const location = currentHomeLocation();
    rememberHomeLocation(location);
    setStatus(homeStatus, text('statusSavingLocation'));

    try {
        const result = await saveProfile({
            country: location.country,
            city: location.city,
            location: `${location.city}, ${location.country}`
        });

        if (result.saved === false) {
            setStatus(homeStatus, result.message || text('statusLocationSaveFailed'), true);
            return;
        }

        currentProfile = result.profile;
        fillForm(currentProfile);
        renderPreview(currentProfile);
        setStatus(homeStatus, text('statusLocationSaved'));
        effects.runSaveFeedback(homeStatus);
        await loadHome(location);
    } catch (error) {
        setStatus(homeStatus, text('statusSaveLocationError'), true);
        console.error(error);
    }
});

function renderShortcuts() {
    const grid = document.getElementById('shortcutGrid');
    grid.innerHTML = shortcuts.map(([name, url]) => `
        <a class="shortcut" href="${url}" target="_blank" rel="noopener noreferrer">
            <span>${name}</span>
            <small>${text('shortcutOpen')} -&gt;</small>
        </a>
    `).join('');
    effects.bindShortcutHover();
}

async function loadProfile() {
    try {
        const response = await fetch('/api/profile');
        if (!response.ok) throw new Error('Profile API failed');

        currentProfile = await response.json();
        fillForm(currentProfile);
        renderPreview(currentProfile);
        setSidebarIdentity(currentProfile.name || 'Student', '', text('campusUser'));

        if (!localStorage.getItem(locationStorageKey) && !locationFromUrl()) {
            const profileLocation = {
                country: currentProfile.country || defaultLocation.country,
                city: currentProfile.city || defaultLocation.city
            };
            setHomeInputs(profileLocation);
            rememberHomeLocation(profileLocation);
            await loadHome(profileLocation);
        }
    } catch (error) {
        currentProfile = defaultProfile();
        fillForm(currentProfile);
        renderPreview(currentProfile);
        setSidebarIdentity(currentProfile.name || 'Student', '', text('campusUser'));
        setStatus(saveStatus, text('statusProfileLoadFailed'), true);
        console.error(error);
    }
}

function defaultProfile() {
    return {
        name: 'シュフシン',
        studentId: 'M25W7195',
        email: 'st232527@kcg.edu',
        phone: '123-4567-8901',
        country: defaultLocation.country,
        city: defaultLocation.city,
        title: 'Information Technology / Network Management Student',
        summary: 'I am studying information technology and network management. Campus Flow is my integrated web project for profile management, weather and country information, JWT authorization, OAuth API verification, Docker, and cloud deployment.',
        education: [{
            school: 'The Kyoto College of Graduate Studies for Informatics',
            degree: 'Master Program',
            major: 'Network Management',
            period: '2025 - Present',
            description: 'Main study areas include network management, cloud systems, database basics, web APIs, and software development.'
        }],
        skills: [
            'Java and Spring Boot API development',
            'HTML, CSS and JavaScript frontend development',
            'MySQL database design and SQL operations',
            'JWT authentication and role-based authorization',
            'OAuth 2.0 integration with Google and GitHub',
            'Docker, Docker Compose and Azure container deployment'
        ],
        projects: [{
            name: 'Campus Flow',
            description: 'A Spring Boot web application that combines a student profile, weather and country APIs, JWT login, OAuth verification, MySQL persistence, Docker sidecar deployment, and Azure App Service deployment.'
        }],
        languages: [
            { name: 'Chinese', level: 'Native' },
            { name: 'Japanese', level: 'Daily communication / learning toward JLPT N2' },
            { name: 'English', level: 'Basic reading and presentation' }
        ]
    };
}

function fillForm(profile) {
    form.name.value = profile.name || '';
    form.studentId.value = profile.studentId || '';
    form.email.value = profile.email || '';
    form.phone.value = profile.phone || '';
    form.country.value = profile.country || defaultLocation.country;
    form.city.value = profile.city || defaultLocation.city;
    form.title.value = profile.title || '';
    form.summary.value = profile.summary || '';
}

function collectForm() {
    const country = form.country.value.trim() || defaultLocation.country;
    const city = form.city.value.trim() || defaultLocation.city;
    return {
        name: form.name.value.trim(),
        studentId: form.studentId.value.trim(),
        email: form.email.value.trim(),
        phone: form.phone.value.trim(),
        location: `${city}, ${country}`,
        country,
        city,
        title: form.title.value.trim(),
        summary: form.summary.value.trim()
    };
}

function setEditing(enabled) {
    form.querySelectorAll('input, textarea').forEach(input => input.disabled = !enabled);
    saveBtn.disabled = !enabled;
}

document.getElementById('editBtn').addEventListener('click', () => {
    setEditing(true);
    setStatus(saveStatus, text('statusEditing'));
});

async function saveProfile(payload) {
    const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('Profile save failed');
    return response.json();
}

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = collectForm();
    setStatus(saveStatus, text('statusSaving'));

    try {
        const result = await saveProfile(payload);
        if (result.saved === false) {
            setStatus(saveStatus, result.message || text('statusProfileSaveFailed'), true);
            return;
        }

        currentProfile = result.profile;
        fillForm(currentProfile);
        renderPreview(currentProfile);
        setSidebarIdentity(currentProfile.name || 'Student', '', text('campusUser'));
        setEditing(false);

        const location = { country: currentProfile.country, city: currentProfile.city };
        setHomeInputs(location);
        rememberHomeLocation(location);
        setStatus(saveStatus, text('statusProfileSaved'));
        effects.runSaveFeedback(saveStatus);
        await loadHome(location);
    } catch (error) {
        setStatus(saveStatus, text('statusSaveLocationError'), true);
        console.error(error);
    }
});

function renderPreview(profile) {
    document.getElementById('previewName').textContent = profile.name || 'Student';
    document.getElementById('previewTitle').textContent = profile.title || '';
    document.getElementById('previewContact').textContent = `${profile.email || ''} | ${profile.phone || ''} | ${profile.city || ''}, ${profile.country || ''}`;
    document.getElementById('previewSummary').textContent = profile.summary || '';

    document.getElementById('previewEducation').innerHTML = (profile.education || []).map(item => `
        <p><strong>${item.school}</strong><br>${item.degree} / ${item.major}<br><span class="muted">${item.period}</span><br>${item.description}</p>
    `).join('');

    document.getElementById('previewSkills').textContent = (profile.skills || []).join(' · ');

    document.getElementById('previewProjects').innerHTML = (profile.projects || []).map(project => `
        <p><strong>${project.name}</strong><br>${project.description}</p>
    `).join('');

    document.getElementById('previewLanguages').textContent = (profile.languages || [])
        .map(item => `${item.name}: ${item.level}`)
        .join(' · ');
}

async function loadHome(location = currentHomeLocation()) {
    const selected = {
        country: location.country || defaultLocation.country,
        city: location.city || defaultLocation.city
    };
    setHomeInputs(selected);
    setStatus(homeStatus, text('statusLoadingHome'));

    try {
        const params = new URLSearchParams(selected);
        const response = await fetch(`/api/home?${params.toString()}`);
        if (!response.ok) throw new Error('Home API failed');
        const data = await response.json();

        document.getElementById('homeLocation').textContent = `${data.city.name}, ${data.country.name}`;
        document.getElementById('temperature').textContent = `${data.weather.temperature}°C`;
        document.getElementById('weatherCondition').textContent = data.weather.condition;
        document.getElementById('weatherTime').textContent = data.weather.time || '';
        document.getElementById('weatherCity').textContent = data.city.name;
        document.getElementById('windSpeed').textContent = `${data.weather.windSpeed} km/h`;
        document.getElementById('weatherTrend').textContent = data.tips.weatherTrend;
        document.getElementById('dailyTip').textContent = data.tips.dailyTip;
        document.getElementById('clothingTip').textContent = `${text('clothing')}: ${data.tips.clothing}`;
        document.getElementById('reminderTip').textContent = `${text('reminder')}: ${data.tips.reminder}`;

        document.getElementById('countryName').textContent = data.country.name;
        document.getElementById('capitalName').textContent = data.country.capital;
        document.getElementById('regionName').textContent = data.country.region;
        document.getElementById('populationText').textContent = Number(data.country.population || 0).toLocaleString();
        document.getElementById('languageText').textContent = (data.country.languages || []).join(', ') || '--';
        document.getElementById('currencyText').textContent = (data.country.currencies || []).join(', ') || '--';

        if (data.country.note || data.city.note || data.weather.note) {
            setStatus(homeStatus, text('statusFallbackData'), true);
        } else {
            setStatus(homeStatus, `${text('statusUpdated')}: ${data.selectedCity}, ${data.selectedCountry}`);
        }
    } catch (error) {
        document.getElementById('homeLocation').textContent = `${selected.city}, ${selected.country}`;
        document.getElementById('temperature').textContent = '--°C';
        document.getElementById('weatherCondition').textContent = text('readFailed');
        document.getElementById('weatherTime').textContent = '';
        document.getElementById('weatherCity').textContent = selected.city;
        document.getElementById('windSpeed').textContent = '--';
        document.getElementById('weatherTrend').textContent = '--';
        document.getElementById('dailyTip').textContent = text('statusHomeFailed');
        setStatus(homeStatus, text('statusRetryHome'), true);
        console.error(error);
    }
}

applySeasonImages();
applyLanguage();
setHomeInputs(savedHomeLocation());
loadHome(savedHomeLocation());
loadProfile();

const initialParams = new URLSearchParams(window.location.search);
const startPage = initialParams.get('page');
if (pages[startPage]) {
    switchPage(startPage);
}
if (initialParams.get('loginModal') === '1') {
    openOAuthModal();
}

autoVerifyOAuthFromUrl();
if (!initialParams.has('oauth') && !initialParams.has('oauthError') && !initialParams.has('logout')) {
    loadOAuthStatus();
}
window.addEventListener('load', effects.runEntrance);
