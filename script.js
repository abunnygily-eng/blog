// ========== ДАННЫЕ ==========
let users = [];
let posts = [];
let comments = [];
let postReactions = []; // { postId, userId, type }
let commentReactions = []; // { commentId, userId, type }
let currentUser = null;
let pendingVerification = null;

// ========== ЗАГРУЗКА ==========
function loadData() {
    const savedUsers = localStorage.getItem('hipeople_users');
    const savedPosts = localStorage.getItem('hipeople_posts');
    const savedComments = localStorage.getItem('hipeople_comments');
    const savedPostReactions = localStorage.getItem('hipeople_postReactions');
    const savedCommentReactions = localStorage.getItem('hipeople_commentReactions');
    const savedCurrentUser = localStorage.getItem('hipeople_currentUser');
    
    if (savedUsers) users = JSON.parse(savedUsers);
    if (savedPosts) posts = JSON.parse(savedPosts);
    if (savedComments) comments = JSON.parse(savedComments);
    if (savedPostReactions) postReactions = JSON.parse(savedPostReactions);
    if (savedCommentReactions) commentReactions = JSON.parse(savedCommentReactions);
    if (savedCurrentUser) currentUser = JSON.parse(savedCurrentUser);
    
    if (users.length === 0) {
        users.push({ 
            id: 1, 
            login: 'demo@hipeople.com', 
            username: 'Демо', 
            password: '12345678', 
            authType: 'email',
            bio: 'Привет! Я демо-пользователь. Добро пожаловать на платформу hiPEOPLE!',
            avatar: null
        });
    }
    
    if (posts.length === 0) {
        posts.push({
            id: 1,
            title: 'Добро пожаловать в hiPEOPLE!',
            content: 'Это ваша новая блог-платформа. Создавайте статьи, добавляйте теги, комментируйте.\n\n✔️ Кликайте по тегам\n✔️ Ставьте лайки и дизлайки\n✔️ Топ тем формируется автоматически\n✔️ Можно прикрепить фото',
            authorId: 1,
            authorName: 'Демо',
            authorLogin: 'demo@hipeople.com',
            authorAvatar: null,
            isAnonymous: false,
            image: null,
            tags: ['hiPEOPLE', 'начало', 'инструкция'],
            date: new Date().toLocaleDateString('ru-RU'),
            timestamp: Date.now()
        });
    }
    
    if (comments.length === 0) {
        comments.push({
            id: 1,
            postId: 1,
            parentId: null,
            authorId: 1,
            authorName: 'Демо',
            authorAvatar: null,
            text: 'Привет! Ставь лайки и дизлайки под статьями и комментариями!',
            date: new Date().toLocaleString('ru-RU')
        });
    }
}

function saveAll() {
    localStorage.setItem('hipeople_users', JSON.stringify(users));
    localStorage.setItem('hipeople_posts', JSON.stringify(posts));
    localStorage.setItem('hipeople_comments', JSON.stringify(comments));
    localStorage.setItem('hipeople_postReactions', JSON.stringify(postReactions));
    localStorage.setItem('hipeople_commentReactions', JSON.stringify(commentReactions));
    localStorage.setItem('hipeople_currentUser', JSON.stringify(currentUser));
}

function generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function showCodeModal(login, type, username, password) {
    const code = generateCode();
    pendingVerification = { login, type, code, username, password };
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'codeModal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Подтверждение ${type === 'email' ? 'email' : 'телефона'}</h3>
            <p>Код подтверждения отправлен на <strong>${login}</strong></p>
            <p style="font-size: 2rem; font-weight: bold; letter-spacing: 5px; background: #f0f2f5; padding: 10px; border-radius: 12px;">${code}</p>
            <p>(В демо-режиме код показан на экране)</p>
            <input type="text" id="verificationCode" placeholder="Введите код" maxlength="6">
            <div style="display: flex; gap: 10px; margin-top: 15px;">
                <button onclick="verifyCode()">Подтвердить</button>
                <button class="cancel-btn" onclick="closeModal()">Отмена</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function closeModal() {
    const modal = document.getElementById('codeModal');
    if (modal) modal.remove();
    pendingVerification = null;
}

function verifyCode() {
    const enteredCode = document.getElementById('verificationCode')?.value;
    if (!enteredCode || enteredCode !== pendingVerification.code) {
        showMessage('Неверный код подтверждения', 'error');
        return;
    }
    
    users.push({
        id: Date.now(),
        login: pendingVerification.login,
        username: pendingVerification.username,
        password: pendingVerification.password,
        authType: pendingVerification.type,
        bio: '',
        avatar: null
    });
    saveAll();
    closeModal();
    showMessage('Регистрация успешна! Теперь войдите', 'success');
    setTimeout(() => showLoginForm(), 1500);
}

function renderNav() {
    const nav = document.getElementById('navBar');
    if (!nav) return;
    
    if (currentUser) {
        const user = users.find(u => u.id === currentUser.id);
        const avatarHtml = user?.avatar ? `<img src="${user.avatar}" class="avatar-small" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22%23667eea%22%3E%3Cpath d=%22M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z%22/%3E%3C/svg%3E'">` : '';
        nav.innerHTML = `
            <a onclick="showMainPage()">🏠 Главная</a>
            <a onclick="showAllPosts()">📖 Все статьи</a>
            <a onclick="showTopTopics()">🏆 Топ тем</a>
            <a onclick="showSearchPage()">🔍 Поиск</a>
            <a onclick="showNewPostForm()">✍️ Новая статья</a>
            <a onclick="showProfile()">👤 Профиль</a>
            <a onclick="logout()">🚪 Выйти</a>
            <span class="user-info">${avatarHtml} ${escapeHtml(currentUser.username)}</span>
        `;
    } else {
        nav.innerHTML = `
            <a onclick="showMainPage()">🏠 Главная</a>
            <a onclick="showAllPosts()">📖 Все статьи</a>
            <a onclick="showTopTopics()">🏆 Топ тем</a>
            <a onclick="showSearchPage()">🔍 Поиск</a>
            <a onclick="showLoginForm()">🔑 Вход</a>
            <a onclick="showRegisterForm()">📝 Регистрация</a>
        `;
    }
}

// ========== РАСЧЁТ РЕЙТИНГА СТАТЬИ ==========
function getPostRating(postId) {
    const reactions = postReactions.filter(r => r.postId === postId);
    const likes = reactions.filter(r => r.type === 'like').length;
    const dislikes = reactions.filter(r => r.type === 'dislike').length;
    const commentsCount = comments.filter(c => c.postId === postId).length;
    return { likes, dislikes, total: likes - dislikes, commentsCount };
}

function getUserReaction(postId) {
    if (!currentUser) return null;
    const reaction = postReactions.find(r => r.postId === postId && r.userId === currentUser.id);
    return reaction ? reaction.type : null;
}

function toggleReaction(postId, type) {
    if (!currentUser) {
        showMessage('Войдите, чтобы ставить реакции', 'error');
        return;
    }
    
    const existingIndex = postReactions.findIndex(r => r.postId === postId && r.userId === currentUser.id);
    
    if (existingIndex !== -1) {
        const existing = postReactions[existingIndex];
        if (existing.type === type) {
            postReactions.splice(existingIndex, 1);
        } else {
            postReactions[existingIndex].type = type;
        }
    } else {
        postReactions.push({ postId, userId: currentUser.id, type });
    }
    saveAll();
}

// ========== ТОП ТЕМ ==========
function showTopTopics() {
    const tagStats = {};
    posts.forEach(post => {
        post.tags.forEach(tag => {
            const rating = getPostRating(post.id);
            const score = rating.likes + rating.commentsCount + 1;
            if (!tagStats[tag]) {
                tagStats[tag] = { count: 0, totalScore: 0 };
            }
            tagStats[tag].count++;
            tagStats[tag].totalScore += score;
        });
    });
    
    const sortedTopics = Object.entries(tagStats)
        .map(([tag, data]) => ({ tag, count: data.count, score: data.totalScore }))
        .sort((a, b) => b.score - a.score);
    
    const content = document.getElementById('mainContent');
    content.innerHTML = `
        <h2>🏆 Топ обсуждаемых тем</h2>
        <p style="color:#6b7280; margin-bottom:20px;">Темы с наибольшей активностью (лайки + комментарии)</p>
        <div class="topics-list">
            ${sortedTopics.map((topic, index) => `
                <div class="topic-item">
                    <div>
                        <span style="font-size:1.5rem; margin-right:10px;">${index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index+1}.`}</span>
                        <span class="topic-name" onclick="filterByTag('${escapeHtml(topic.tag)}')">#${escapeHtml(topic.tag)}</span>
                    </div>
                    <div class="topic-stats">
                        📄 ${topic.count} статей | 💬 ${topic.score} активности
                    </div>
                </div>
            `).join('')}
        </div>
        <hr>
        <div id="tagCloud" class="tag-cloud"></div>
        <h2>🔥 Популярные статьи</h2>
        <div id="postsContainer"></div>
    `;
    
    renderTagCloud();
    const sortedPosts = [...posts].sort((a,b) => {
        const ratingA = getPostRating(a.id);
        const ratingB = getPostRating(b.id);
        return (ratingB.likes + ratingB.commentsCount) - (ratingA.likes + ratingA.commentsCount);
    });
    renderPostsList(sortedPosts);
}

// ========== ГЛАВНАЯ ==========
function showMainPage() {
    const content = document.getElementById('mainContent');
    content.innerHTML = `
        <div id="tagCloud" class="tag-cloud"></div>
        <h2>🔥 Последние статьи</h2>
        <div id="postsContainer"></div>
    `;
    renderTagCloud();
    renderPostsList([...posts].sort((a,b) => b.timestamp - a.timestamp));
}

function renderPostsList(postsToShow) {
    const container = document.getElementById('postsContainer');
    if (!container) return;
    
    if (postsToShow.length === 0) {
        container.innerHTML = '<div class="empty-state">📭 Пока нет статей. Будь первым!</div>';
        return;
    }
    
    container.innerHTML = postsToShow.map(post => {
        const isAnonymous = post.isAnonymous;
        const displayName = isAnonymous ? 'Аноним' : post.authorName;
        const rating = getPostRating(post.id);
        const userReaction = getUserReaction(post.id);
        
        const avatarHtml = (!isAnonymous && post.authorAvatar) ? `<img src="${post.authorAvatar}" class="author-avatar" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22%23667eea%22%3E%3Cpath d=%22M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z%22/%3E%3C/svg%3E'">` : (!isAnonymous ? '<div class="author-avatar" style="background:#667eea; border-radius:50%; width:32px; height:32px; display:flex; align-items:center; justify-content:center; color:white; font-weight:bold;">' + (post.authorName[0] || '?') + '</div>' : '<div class="author-avatar" style="background:#9ca3af; border-radius:50%; width:32px; height:32px; display:flex; align-items:center; justify-content:center; color:white; font-weight:bold;">?</div>');
        
        const imageHtml = post.image ? `<img src="${post.image}" class="post-image" onclick="viewPost(${post.id})">` : '';
        
        return `
        <div class="post-card">
            <h2><a onclick="viewPost(${post.id})">${escapeHtml(post.title)}</a></h2>
            <div class="post-excerpt">${escapeHtml(post.content.substring(0, 150))}${post.content.length > 150 ? '...' : ''}</div>
            ${imageHtml}
            <div class="tags">
                ${post.tags.map(tag => `<span class="tag" onclick="event.stopPropagation(); filterByTag('${escapeHtml(tag)}')">#${escapeHtml(tag)}</span>`).join('')}
            </div>
            <div class="author-info">
                ${avatarHtml}
                ${!isAnonymous ? `<div class="author-name" onclick="event.stopPropagation(); showUserProfile(${post.authorId})">✍️ ${escapeHtml(displayName)}</div>` : `<div class="author-name" style="cursor:default;">✍️ ${escapeHtml(displayName)}</div>`}
                <div class="author" style="margin-left:auto;">${post.date}</div>
            </div>
            <div class="reactions">
                <button class="reaction-btn ${userReaction === 'like' ? 'liked' : ''}" onclick="event.stopPropagation(); togglePostReaction(${post.id}, 'like'); showMainPage();">👍 ${rating.likes}</button>
                <button class="reaction-btn ${userReaction === 'dislike' ? 'disliked' : ''}" onclick="event.stopPropagation(); togglePostReaction(${post.id}, 'dislike'); showMainPage();">👎 ${rating.dislikes}</button>
                <button class="reaction-btn" onclick="event.stopPropagation(); viewPost(${post.id})">💬 ${rating.commentsCount}</button>
            </div>
        </div>
    `}).join('');
}

function togglePostReaction(postId, type) {
    if (!currentUser) {
        showMessage('Войдите, чтобы ставить реакции', 'error');
        return;
    }
    
    const existingIndex = postReactions.findIndex(r => r.postId === postId && r.userId === currentUser.id);
    
    if (existingIndex !== -1) {
        const existing = postReactions[existingIndex];
        if (existing.type === type) {
            postReactions.splice(existingIndex, 1);
        } else {
            postReactions[existingIndex].type = type;
        }
    } else {
        postReactions.push({ postId, userId: currentUser.id, type });
    }
    saveAll();
}

function renderTagCloud() {
    const container = document.getElementById('tagCloud');
    if (!container) return;
    
    const allTags = [];
    posts.forEach(post => {
        post.tags.forEach(tag => allTags.push(tag));
    });
    const unique = [...new Set(allTags)];
    
    if (unique.length === 0) {
        container.innerHTML = '<span>🏷️ Нет тегов</span>';
        return;
    }
    
    container.innerHTML = unique.map(tag => `
        <span class="tag-cloud-item" onclick="filterByTag('${escapeHtml(tag)}')">#${escapeHtml(tag)}</span>
    `).join('');
}

function filterByTag(tag) {
    const filtered = posts.filter(p => p.tags.includes(tag));
    const content = document.getElementById('mainContent');
    content.innerHTML = `
        <div id="tagCloud" class="tag-cloud"></div>
        <h2>📖 Статьи с тегом #${escapeHtml(tag)}</h2>
        <div id="postsContainer"></div>
    `;
    renderTagCloud();
    renderPostsList(filtered);
}

// ========== ПОИСК ==========
function showSearchPage() {
    const content = document.getElementById('mainContent');
    content.innerHTML = `
        <h2>🔍 Поиск статей</h2>
        <div class="search-bar">
            <input type="text" id="searchInput" placeholder="Поиск по заголовку, тексту, автору или тегам...">
            <button onclick="searchPosts()">Найти</button>
        </div>
        <div id="searchResults"></div>
    `;
}

function searchPosts() {
    const query = document.getElementById('searchInput')?.value.toLowerCase().trim();
    if (!query) {
        document.getElementById('searchResults').innerHTML = '<div class="empty-state">Введите поисковый запрос</div>';
        return;
    }
    
    const results = posts.filter(post => 
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query) ||
        (post.isAnonymous ? 'аноним' : post.authorName.toLowerCase()).includes(query) ||
        post.tags.some(tag => tag.toLowerCase().includes(query))
    );
    
    const container = document.getElementById('searchResults');
    if (results.length === 0) {
        container.innerHTML = `<div class="empty-state">🔎 Ничего не найдено по запросу "${escapeHtml(query)}"</div>`;
        return;
    }
    
    container.innerHTML = `<h3>Найдено: ${results.length} статей</h3>` + renderPostsListSimple(results);
}

function renderPostsListSimple(postsToShow) {
    return postsToShow.map(post => {
        const displayName = post.isAnonymous ? 'Аноним' : post.authorName;
        const rating = getPostRating(post.id);
        return `
        <div class="post-card">
            <h2><a onclick="viewPost(${post.id})">${escapeHtml(post.title)}</a></h2>
            <div class="post-excerpt">${escapeHtml(post.content.substring(0, 150))}${post.content.length > 150 ? '...' : ''}</div>
            <div class="tags">${post.tags.map(t => `<span class="tag" onclick="event.stopPropagation(); filterByTag('${escapeHtml(t)}')">#${escapeHtml(t)}</span>`).join('')}</div>
            <div class="author">✍️ ${escapeHtml(displayName)} • ${post.date}</div>
            <div class="reactions">👍 ${rating.likes} | 👎 ${rating.dislikes} | 💬 ${rating.commentsCount}</div>
        </div>
    `}).join('');
}

function showAllPosts() {
    const content = document.getElementById('mainContent');
    content.innerHTML = `
        <div id="tagCloud" class="tag-cloud"></div>
        <h2>📖 Все статьи</h2>
        <div id="postsContainer"></div>
    `;
    renderTagCloud();
    renderPostsList([...posts].sort((a,b) => b.timestamp - a.timestamp));
}

// ========== ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ ==========
function showUserProfile(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) {
        showMessage('Пользователь не найден', 'error');
        return;
    }
    
    const userPosts = posts.filter(p => p.authorId === userId && !p.isAnonymous);
    const avatarHtml = user?.avatar ? `<img src="${user.avatar}" style="width:120px; height:120px; border-radius:50%; object-fit:cover; border:3px solid #667eea;">` : `<div style="width:120px; height:120px; background:#667eea; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-size:3rem;">${user.username[0].toUpperCase()}</div>`;
    
    const content = document.getElementById('mainContent');
    content.innerHTML = `
        <div class="profile-header">
            <div class="profile-avatar">
                ${avatarHtml}
            </div>
            <div class="profile-info">
                <h2>${escapeHtml(user.username)}</h2>
                <p>${user.authType === 'email' ? '📧' : '📱'} ${escapeHtml(user.login)}</p>
                <p>📅 На платформе с ${new Date(user.id).toLocaleDateString('ru-RU')}</p>
            </div>
        </div>
        <div class="profile-bio">
            <strong>📝 О себе:</strong>
            <p>${escapeHtml(user.bio) || 'Пользователь пока ничего не рассказал о себе'}</p>
        </div>
        <hr>
        <h3>📄 Статьи ${escapeHtml(user.username)}</h3>
        <div id="userPostsContainer"></div>
        <button onclick="showMainPage()" style="margin-top:20px;">← На главную</button>
    `;
    
    const container = document.getElementById('userPostsContainer');
    if (userPosts.length === 0) {
        container.innerHTML = '<div class="empty-state">Пользователь ещё не написал ни одной статьи</div>';
    } else {
        container.innerHTML = userPosts.map(post => {
            const rating = getPostRating(post.id);
            return `
            <div class="post-card">
                <h2><a onclick="viewPost(${post.id})">${escapeHtml(post.title)}</a></h2>
                <div class="post-excerpt">${escapeHtml(post.content.substring(0, 100))}...</div>
                <div class="tags">${post.tags.map(t => `<span class="tag">#${escapeHtml(t)}</span>`).join('')}</div>
                <div class="author">📅 ${post.date}</div>
                <div class="reactions">👍 ${rating.likes} | 👎 ${rating.dislikes} | 💬 ${rating.commentsCount}</div>
            </div>
        `}).join('');
    }
}

// ========== ПРОСМОТР СТАТЬИ ==========
function viewPost(postId) {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    const isAnonymous = post.isAnonymous;
    const displayName = isAnonymous ? 'Аноним' : post.authorName;
    const rating = getPostRating(post.id);
    const userReaction = getUserReaction(post.id);
    
    const authorAvatar = (!isAnonymous && post.authorAvatar) ? `<img src="${post.authorAvatar}" class="comment-avatar" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22%23667eea%22%3E%3Cpath d=%22M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z%22/%3E%3C/svg%3E'">` : (!isAnonymous ? '<div style="width:32px; height:32px; background:#667eea; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-weight:bold;">' + (post.authorName[0] || '?') + '</div>' : '<div style="width:32px; height:32px; background:#9ca3af; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-weight:bold;">?</div>');
    
    const imageHtml = post.image ? `<img src="${post.image}" class="post-image">` : '';
    
    const content = document.getElementById('mainContent');
    content.innerHTML = `
        <div id="postView">
            <div class="post-card">
                <h2>${escapeHtml(post.title)}</h2>
                <div class="author-info">
                    ${authorAvatar}
                    ${!isAnonymous ? `<div class="author-name" onclick="showUserProfile(${post.authorId})">✍️ ${escapeHtml(displayName)}</div>` : `<div class="author-name" style="cursor:default;">✍️ ${escapeHtml(displayName)}</div>`}
                    <div class="author" style="margin-left:auto;">${post.date}</div>
                </div>
                ${imageHtml}
                <div class="tags">
                    ${post.tags.map(tag => `<span class="tag" onclick="filterByTag('${escapeHtml(tag)}')">#${escapeHtml(tag)}</span>`).join('')}
                </div>
                <p style="white-space: pre-line;">${escapeHtml(post.content)}</p>
                <div class="reactions">
                    <button class="reaction-btn ${userReaction === 'like' ? 'liked' : ''}" onclick="togglePostReaction(${post.id}, 'like'); viewPost(${post.id})">👍 ${rating.likes}</button>
                    <button class="reaction-btn ${userReaction === 'dislike' ? 'disliked' : ''}" onclick="togglePostReaction(${post.id}, 'dislike'); viewPost(${post.id})">👎 ${rating.dislikes}</button>
                </div>
                ${currentUser && currentUser.id === post.authorId ? `<button class="delete-btn" onclick="deletePost(${post.id})">🗑️ Удалить статью</button>` : ''}
            </div>
            <hr>
            <h3>💬 Обсуждение</h3>
            <div id="commentsContainer"></div>
            ${currentUser ? `
                <textarea id="newCommentText" rows="3" placeholder="Напишите комментарий..." style="width:100%; margin-top:20px"></textarea>
                <button onclick="addComment(${post.id}, null)">📝 Отправить комментарий</button>
            ` : `<p style="margin-top:20px"><a onclick="showLoginForm()">Войдите</a>, чтобы участвовать в обсуждении</p>`}
        </div>
    `;
    renderCommentsTree(postId);
}

function renderCommentsTree(postId, parentId = null, level = 0) {
    const container = document.getElementById('commentsContainer');
    if (!container) return;
    
    const postComments = comments.filter(c => c.postId === postId && (c.parentId === parentId || (parentId === null && !c.parentId)));
    postComments.sort((a,b) => a.id - b.id);
    
    if (level === 0 && postComments.length === 0) {
        container.innerHTML = '<div class="empty-state">💬 Пока нет комментариев. Будьте первым!</div>';
        return;
    }
    
    let html = '';
    for (const comment of postComments) {
        const commentAuthor = users.find(u => u.id === comment.authorId);
        const avatarHtml = commentAuthor?.avatar ? `<img src="${commentAuthor.avatar}" class="comment-avatar" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22%23667eea%22%3E%3Cpath d=%22M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z%22/%3E%3C/svg%3E'">` : '<div style="width:28px; height:28px; background:#667eea; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-weight:bold; font-size:12px;">' + (comment.authorName[0] || '?') + '</div>';
        
        html += `
            <div class="comment" style="margin-left: ${level * 20}px;">
                <div class="comment-header">
                    ${avatarHtml}
                    <strong onclick="showUserProfile(${comment.authorId})" style="cursor:pointer;">${escapeHtml(comment.authorName)}</strong>
                    <small>${comment.date}</small>
                </div>
                <div>${escapeHtml(comment.text)}</div>
                ${currentUser ? `<button class="reply-btn" onclick="showReplyForm(${postId}, ${comment.id})">💬 Ответить</button>` : ''}
                <div id="replyForm-${comment.id}" class="reply-form"></div>
            </div>
        `;
        
        const childContainer = document.createElement('div');
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = renderCommentsTreeRaw(postId, comment.id, level + 1);
        html += tempDiv.innerHTML;
    }
    
    if (level === 0) {
        container.innerHTML = html;
    } else {
        return html;
    }
}

function renderCommentsTreeRaw(postId, parentId, level) {
    const childComments = comments.filter(c => c.postId === postId && c.parentId === parentId);
    childComments.sort((a,b) => a.id - b.id);
    
    let html = '';
    for (const comment of childComments) {
        const commentAuthor = users.find(u => u.id === comment.authorId);
        const avatarHtml = commentAuthor?.avatar ? `<img src="${commentAuthor.avatar}" class="comment-avatar" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22%23667eea%22%3E%3Cpath d=%22M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z%22/%3E%3C/svg%3E'">` : '<div style="width:28px; height:28px; background:#667eea; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-weight:bold; font-size:12px;">' + (comment.authorName[0] || '?') + '</div>';
        
        html += `
            <div class="comment" style="margin-left: ${level * 20}px;">
                <div class="comment-header">
                    ${avatarHtml}
                    <strong onclick="showUserProfile(${comment.authorId})" style="cursor:pointer;">${escapeHtml(comment.authorName)}</strong>
                    <small>${comment.date}</small>
                </div>
                <div>${escapeHtml(comment.text)}</div>
                ${currentUser ? `<button class="reply-btn" onclick="showReplyForm(${postId}, ${comment.id})">💬 Ответить</button>` : ''}
                <div id="replyForm-${comment.id}" class="reply-form"></div>
            </div>
        `;
        html += renderCommentsTreeRaw(postId, comment.id, level + 1);
    }
    return html;
}

function showReplyForm(postId, parentCommentId) {
    const formDiv = document.getElementById(`replyForm-${parentCommentId}`);
    if (!formDiv) return;
    
    if (formDiv.style.display === 'block') {
        formDiv.style.display = 'none';
        formDiv.innerHTML = '';
        return;
    }
    
    formDiv.style.display = 'block';
    formDiv.innerHTML = `
        <textarea id="replyText-${parentCommentId}" rows="2" placeholder="Напишите ответ..."></textarea>
        <button onclick="addComment(${postId}, ${parentCommentId})">📝 Ответить</button>
        <button class="cancel-btn" onclick="cancelReply(${parentCommentId})">Отмена</button>
    `;
}

function cancelReply(parentCommentId) {
    const formDiv = document.getElementById(`replyForm-${parentCommentId}`);
    if (formDiv) {
        formDiv.style.display = 'none';
        formDiv.innerHTML = '';
    }
}

function addComment(postId, parentId) {
    let text;
    if (parentId) {
        text = document.getElementById(`replyText-${parentId}`)?.value;
    } else {
        text = document.getElementById('newCommentText')?.value;
    }
    
    if (!text || !text.trim()) {
        showMessage('Напишите комментарий', 'error');
        return;
    }
    
    const newComment = {
        id: Date.now(),
        postId: postId,
        parentId: parentId || null,
        authorId: currentUser.id,
        authorName: currentUser.username,
        authorAvatar: users.find(u => u.id === currentUser.id)?.avatar || null,
        text: text.trim(),
        date: new Date().toLocaleString('ru-RU')
    };
    comments.push(newComment);
    saveAll();
    
    if (parentId) {
        document.getElementById(`replyText-${parentId}`).value = '';
        cancelReply(parentId);
    } else {
        document.getElementById('newCommentText').value = '';
    }
    
    viewPost(postId);
}

function deletePost(postId) {
    if (confirm('Удалить статью? Это действие нельзя отменить.')) {
        posts = posts.filter(p => p.id !== postId);
        comments = comments.filter(c => c.postId !== postId);
        postReactions = postReactions.filter(r => r.postId !== postId);
        saveAll();
        showMainPage();
    }
}

// ========== НОВАЯ СТАТЬЯ ==========
let selectedImageData = null;

function showNewPostForm() {
    if (!currentUser) {
        showLoginForm();
        return;
    }
    
    selectedImageData = null;
    
    const content = document.getElementById('mainContent');
    content.innerHTML = `
        <h2>✍️ Новая статья</h2>
        <form onsubmit="event.preventDefault(); createPost()">
            <input type="text" id="postTitle" placeholder="Заголовок" required>
            <textarea id="postContent" rows="10" placeholder="Твои мысли..." required></textarea>
            <input type="text" id="postTags" placeholder="Теги через запятую (например: жизнь, love, люди)">
            <div>
                <label class="checkbox-label">
                    <input type="checkbox" id="anonymousCheckbox">
                    <span>📝 Опубликовать анонимно</span>
                </label>
            </div>
            <div>
                <label class="checkbox-label">
                    <input type="checkbox" id="attachImageCheckbox" onchange="toggleImageUpload()">
                    <span>🖼️ Прикрепить фото</span>
                </label>
            </div>
            <div id="imageUploadBlock" style="display:none;">
                <input type="file" id="postImage" accept="image/*" onchange="previewImage()">
                <img id="imagePreview" class="image-preview" style="display:none;">
            </div>
            <button type="submit">Опубликовать</button>
        </form>
    `;
}

function toggleImageUpload() {
    const isChecked = document.getElementById('attachImageCheckbox').checked;
    const uploadBlock = document.getElementById('imageUploadBlock');
    uploadBlock.style.display = isChecked ? 'block' : 'none';
    if (!isChecked) {
        selectedImageData = null;
        document.getElementById('imagePreview').style.display = 'none';
    }
}

function previewImage() {
    const file = document.getElementById('postImage').files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            selectedImageData = e.target.result;
            const preview = document.getElementById('imagePreview');
            preview.src = selectedImageData;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

function createPost() {
    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postContent').value;
    const tagsInput = document.getElementById('postTags').value;
    const isAnonymous = document.getElementById('anonymousCheckbox').checked;
    const attachImage = document.getElementById('attachImageCheckbox').checked;
    
    if (!title || !content) {
        showMessage('Заполните заголовок и текст статьи', 'error');
        return;
    }
    
    const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(t => t) : [];
    const user = users.find(u => u.id === currentUser.id);
    
    posts.unshift({
        id: Date.now(),
        title: title,
        content: content,
        authorId: currentUser.id,
        authorName: currentUser.username,
        authorLogin: currentUser.login,
        authorAvatar: user?.avatar || null,
        isAnonymous: isAnonymous,
        image: attachImage && selectedImageData ? selectedImageData : null,
        tags: tags,
        date: new Date().toLocaleDateString('ru-RU'),
        timestamp: Date.now()
    });
    saveAll();
    showMainPage();
}

// ========== ПРОФИЛЬ ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ ==========
function showProfile() {
    if (!currentUser) {
        showLoginForm();
        return;
    }
    
    const user = users.find(u => u.id === currentUser.id);
    const avatarHtml = user?.avatar ? `<img src="${user.avatar}" style="width:120px; height:120px; border-radius:50%; object-fit:cover; border:3px solid #667eea;">` : `<div style="width:120px; height:120px; background:#667eea; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-size:3rem;">${user.username[0].toUpperCase()}</div>`;
    
    const content = document.getElementById('mainContent');
    content.innerHTML = `
        <div class="profile-header">
            <div class="profile-avatar">
                ${avatarHtml}
                <button onclick="showAvatarUpload()">📷 Сменить фото</button>
            </div>
            <div class="profile-info">
                <h2>${escapeHtml(user.username)}</h2>
                <p>${user.authType === 'email' ? '📧' : '📱'} ${escapeHtml(user.login)}</p>
                <p>📅 Зарегистрирован: ${new Date(user.id).toLocaleDateString('ru-RU')}</p>
                <button onclick="showEditBio()">✏️ Редактировать информацию о себе</button>
            </div>
        </div>
        <div class="profile-bio">
            <strong>📝 О себе:</strong>
            <p>${escapeHtml(user.bio) || 'Пользователь пока ничего не рассказал о себе'}</p>
        </div>
        <hr>
        <h3>📄 Мои статьи</h3>
        <div id="myPostsContainer"></div>
    `;
    
    const myPosts = posts.filter(p => p.authorId === currentUser.id);
    const container = document.getElementById('myPostsContainer');
    if (myPosts.length === 0) {
        container.innerHTML = '<div class="empty-state">Вы ещё не написали ни одной статьи</div>';
    } else {
        container.innerHTML = myPosts.map(post => {
            const rating = getPostRating(post.id);
            return `
            <div class="post-card">
                <h2><a onclick="viewPost(${post.id})">${escapeHtml(post.title)}</a></h2>
                <div class="post-excerpt">${escapeHtml(post.content.substring(0, 100))}...</div>
                <div class="tags">${post.tags.map(t => `<span class="tag">#${escapeHtml(t)}</span>`).join('')}</div>
                ${post.isAnonymous ? '<div><span class="tag">Анонимно</span></div>' : ''}
                <div class="reactions">👍 ${rating.likes} | 👎 ${rating.dislikes} | 💬 ${rating.commentsCount}</div>
                <button class="delete-btn" onclick="deletePost(${post.id})">🗑️ Удалить</button>
            </div>
        `}).join('');
    }
}

function showAvatarUpload() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const user = users.find(u => u.id === currentUser.id);
                user.avatar = event.target.result;
                saveAll();
                showProfile();
                renderNav();
            };
            reader.readAsDataURL(file);
        }
    };
    input.click();
}

function showEditBio() {
    const user = users.find(u => u.id === currentUser.id);
    const content = document.getElementById('mainContent');
    content.innerHTML = `
        <h2>✏️ Редактировать профиль</h2>
        <div class="edit-form">
            <label><strong>О себе:</strong></label>
            <textarea id="bioInput" rows="5" placeholder="Расскажите о себе...">${escapeHtml(user.bio || '')}</textarea>
            <div style="display: flex; gap: 10px;">
                <button onclick="saveBio()">💾 Сохранить</button>
                <button class="cancel-btn" onclick="showProfile()">Отмена</button>
            </div>
        </div>
    `;
}

function saveBio() {
    const bio = document.getElementById('bioInput').value;
    const user = users.find(u => u.id === currentUser.id);
    user.bio = bio;
    saveAll();
    showProfile();
}

// ========== РЕГИСТРАЦИЯ ==========
let currentAuthType = 'email';

function showRegisterForm() {
    const content = document.getElementById('mainContent');
    content.innerHTML = `
        <div class="auth-container">
            <h2>✨ Регистрация</h2>
            <div id="formMessage" class="error-message" style="display:none"></div>
            <div class="auth-type">
                <button id="emailBtnReg" class="active" onclick="setAuthType('email')">📧 Email</button>
                <button id="phoneBtnReg" onclick="setAuthType('phone')">📱 Телефон</button>
            </div>
            <div id="emailBlockReg">
                <input type="email" id="regEmail" placeholder="Email" required>
            </div>
            <div id="phoneBlockReg" style="display:none">
                <input type="tel" id="regPhone" placeholder="Номер телефона (минимум 10 цифр)" required>
            </div>
            <input type="text" id="regUsername" placeholder="Имя пользователя" required>
            <input type="password" id="regPassword" placeholder="Пароль (минимум 8 символов)" required>
            <button onclick="startRegistration()">Зарегистрироваться</button>
            <p style="margin-top:20px; text-align:center">
                Уже есть аккаунт? <a onclick="showLoginForm()">Войти</a>
            </p>
        </div>
    `;
}

function setAuthType(type) {
    currentAuthType = type;
    const emailBtn = document.getElementById('emailBtnReg');
    const phoneBtn = document.getElementById('phoneBtnReg');
    const emailBlock = document.getElementById('emailBlockReg');
    const phoneBlock = document.getElementById('phoneBlockReg');
    
    if (type === 'email') {
        emailBtn.classList.add('active');
        phoneBtn.classList.remove('active');
        emailBlock.style.display = 'block';
        phoneBlock.style.display = 'none';
    } else {
        emailBtn.classList.remove('active');
        phoneBtn.classList.add('active');
        emailBlock.style.display = 'none';
        phoneBlock.style.display = 'block';
    }
}

function startRegistration() {
    let loginValue = '';
    if (currentAuthType === 'email') {
        loginValue = document.getElementById('regEmail')?.value;
        if (!loginValue || !loginValue.includes('@')) {
            showMessage('Введите корректный email', 'error');
            return;
        }
    } else {
        loginValue = document.getElementById('regPhone')?.value;
        if (!loginValue || loginValue.replace(/\D/g, '').length < 10) {
            showMessage('Введите корректный номер телефона (минимум 10 цифр)', 'error');
            return;
        }
    }
    
    const username = document.getElementById('regUsername')?.value;
    const password = document.getElementById('regPassword')?.value;
    
    if (!username || !username.trim()) {
        showMessage('Введите имя пользователя', 'error');
        return;
    }
    
    if (!password || password.length < 8) {
        showMessage('Пароль должен содержать минимум 8 символов', 'error');
        return;
    }
    
    if (users.find(u => u.login === loginValue)) {
        showMessage('Пользователь с таким email/телефоном уже существует', 'error');
        return;
    }
    
    showCodeModal(loginValue, currentAuthType, username, password);
}

// ========== ВХОД ==========
function showLoginForm() {
    const content = document.getElementById('mainContent');
    content.innerHTML = `
        <div class="auth-container">
            <h2>🔐 Вход в hiPEOPLE</h2>
            <div id="formMessage" class="error-message" style="display:none"></div>
            <input type="text" id="loginValue" placeholder="Email или номер телефона" required>
            <input type="password" id="loginPassword" placeholder="Пароль" required>
            <button onclick="login()">Войти</button>
            <p style="margin-top:20px; text-align:center">
                Нет аккаунта? <a onclick="showRegisterForm()">Зарегистрироваться</a>
            </p>
        </div>
    `;
}

function login() {
    const loginValue = document.getElementById('loginValue')?.value;
    const password = document.getElementById('loginPassword')?.value;
    
    if (!loginValue || !password) {
        showMessage('Заполните все поля', 'error');
        return;
    }
    
    const user = users.find(u => u.login === loginValue && u.password === password);
    if (user) {
        currentUser = {
            id: user.id,
            login: user.login,
            username: user.username
        };
        saveAll();
        renderNav();
        showMainPage();
    } else {
        showMessage('Неверный email/телефон или пароль', 'error');
    }
}

function logout() {
    currentUser = null;
    saveAll();
    renderNav();
    showMainPage();
}

function showMessage(msg, type) {
    const msgDiv = document.getElementById('formMessage');
    if (msgDiv) {
        msgDiv.textContent = msg;
        msgDiv.className = type === 'error' ? 'error-message' : 'success-message';
        msgDiv.style.display = 'block';
        setTimeout(() => { msgDiv.style.display = 'none'; }, 3000);
    } else {
        alert(msg);
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========== ЗАПУСК ==========
loadData();
saveAll();
renderNav();
showMainPage();