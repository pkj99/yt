let allVideos = [];
let heroPlayer;

function onYouTubeIframeAPIReady() {
    fetch('js/movies_data.json').then(r => r.json()).then(data => {
        allVideos = data;
        const featured = data.find(v => v.type === 'movie') || data[0];
        initHero(featured);
        renderGrid(data);
    });
}

function initHero(video) {
    document.getElementById('hero-title').innerText = video.title;
    document.getElementById('main-play-btn').onclick = () => openModal(video.id, video.title);
    
    heroPlayer = new YT.Player('hero-player', {
        videoId: video.id,
        playerVars: { 'autoplay': 1, 'controls': 0, 'mute': 1, 'playlist': video.id, 'loop': 1 },
        events: { 'onReady': e => setTimeout(() => e.target.pauseVideo(), 30000) }
    });
}

function renderGrid(data) {
    const grid = document.getElementById('main-grid');
    const hero = document.getElementById('hero-section');

    grid.innerHTML = data.map(v => `
        <div class="video-item" 
             onmouseover="changeHeroBg('${v.id}', '${v.title.replace(/'/g, "\\'")}')"
             onclick="openModal('${v.id}', '${v.title.replace(/'/g, "\\'")}', '${v.type}')">
            <img src="${v.thumbnail}">
            ${v.type === 'drama' ? '<span class="badge">劇集</span>' : ''}
            <p>${v.title}</p>
        </div>
    `).join('');
}

function changeHeroBg(id, title) {

    const vid = allVideos.find(v => v.id === id);
    const hero = document.getElementById('hero-section');
    hero.style.backgroundImage = `url(https://img.youtube.com/vi/${id}/maxresdefault.jpg)`;
    document.getElementById('hero-title').innerText = title;
    document.getElementById('hero-overview').innerText = vid.overview;
    let info = vid.rating.toString(); 
    if (vid.release_date){
        info = info + "    [ " + vid.release_date + " ]";
    }
    document.getElementById('hero-info').innerText = info;
    // if(heroPlayer && heroPlayer.pauseVideo) heroPlayer.pauseVideo();
    initHero(vid);
	// heroPlayer.loadVideoById(id);
}

function openModal(id, title, type) {
    const movie = allVideos.find(v => v.id === id || (v.episodes && v.episodes.some(e => e.id === id)));
    document.getElementById('modal-title').innerText = title;
    const epList = document.getElementById('ep-list');
    epList.innerHTML = '';

    if (movie && movie.type === 'drama') {
        movie.episodes.forEach(ep => {
            const btn = document.createElement('button');
            btn.className = 'ep-btn';
            btn.innerText = ep.ep_label;
            btn.onclick = () => loadPlayer(ep.id);
            epList.appendChild(btn);
        });
        loadPlayer(movie.episodes[0].id);
    } else {
        loadPlayer(id);
    }
    document.getElementById('videoModal').style.display = 'block';
}

function loadPlayer(id) {
    document.getElementById('modal-player').innerHTML = `<iframe width="100%" height="500" src="https://www.youtube.com/embed/${id}?autoplay=1" frameborder="0" allowfullscreen></iframe>`;
}

function closeModal() {
    document.getElementById('videoModal').style.display = 'none';
    document.getElementById('modal-player').innerHTML = '';
}

function filterByType(type) {
    const filtered = type === 'all' ? allVideos : allVideos.filter(v => v.type === type);
    renderGrid(filtered);
}

function filterByGenre(genre) {
    const filtered = genre === '劇情' ? allVideos : allVideos.filter(v => v.genre === genre);
    renderGrid(filtered);
}
window.onscroll = () => {
    document.getElementById('navbar').style.background = window.scrollY > 50 ? '#141414' : 'linear-gradient(rgba(0,0,0,0.7), transparent)';
};