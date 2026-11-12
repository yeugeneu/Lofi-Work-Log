// Global variables
let accomp = [];
let timerSeconds = 1500; // 25 minutes default
let timerInterval;
let timerWorker = null;
let targetEndTime = null;
let isPaused = true;

function startTimerLoop() {
    stopTimerLoop();
    if (typeof Worker !== 'undefined') {
        try {
            const blob = new Blob([
                "const id = setInterval(() => postMessage('tick'), 1000); onmessage = (e) => { if (e.data === 'stop') clearInterval(id); };"
            ], { type: 'application/javascript' });
            const workerUrl = URL.createObjectURL(blob);
            timerWorker = new Worker(workerUrl);
            timerWorker.onmessage = () => updateTimer();
            URL.revokeObjectURL(workerUrl);
            return;
        } catch (err) {
            console.warn('Web Worker fallback to setInterval:', err);
        }
    }
    timerInterval = setInterval(updateTimer, 1000);
}

function stopTimerLoop() {
    if (timerWorker) {
        timerWorker.postMessage('stop');
        timerWorker.terminate();
        timerWorker = null;
    }
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// Expose to window for testing
window.getTimerSeconds = () => timerSeconds;
window.setTimerSeconds = (val) => {
    timerSeconds = val;
    if (!isPaused) {
        targetEndTime = Date.now() + timerSeconds * 1000;
    }
};
window.getIsPaused = () => isPaused;
window.setIsPaused = (val) => {
    isPaused = val;
    targetEndTime = isPaused ? null : Date.now() + timerSeconds * 1000;
};
window.getIsBreakMode = () => isBreakMode;
let isLoop = false;
let isMute = false;
let masterVolume = 1.0;
let isBreakMode = false;
let previousAudioSources = [];
let previousAudioDropdownValue = 'default';

const AMBIENT_FX_KEYS = ['sun', 'rain', 'snow', 'typing', 'cafe', 'office', 'thunder', 'fire', 'wave'];

const breakMusicSources = ['https://cdn.pixabay.com/download/audio/2024/10/10/audio_e5a9bdb16f.mp3'];

// Spotify Web Playback SDK variables
let spotifyPlayer = null;
let spotifyDeviceId = null;
let isSpotifyMode = false;
let spotifyAccessToken = null;

let audioSources = defaultSources;

const completeSoundFx = 'https://cdn.uppbeat.io/audio-files/d927511931994ce45cf5b95b34e23536/b8acdddc6e37f6b47b0057dbaf3b53af/9c3ce15f497635d0c185b92d34ce902c/STREAMING-level-complete-winner-piano-om-fx-1-00-06.mp3';

const sunSoundFx = 'https://cdn.uppbeat.io/audio-files/44fbdf1792559839ac2aaf16cfa6b689/d7b619f43e184454b1c0233423ee63dd/818e576c379605ded69f468f47d02b9c/STREAMING-mountain-forest-wind-on-early-spring-day-ivo-vicic-1-01-22.mp3';
const rainSoundFx = 'https://cdn.uppbeat.io/audio-files/8f7bad86600558899edb9677072692ee/c5a6544ca4d77d8cda881bae989f35de/c9b7d8fbdcf58a6e5a9bb4ee160b9cbb/STREAMING-rain-outside-window-betacut-medium-1-01-00.mp3';
const snowSoundFx = 'https://cdn.pixabay.com/audio/2023/08/31/audio_09d9b7815a.mp3';
const thunderSoundFx = 'https://cdn.pixabay.com/audio/2024/02/19/audio_8d25df9ef0.mp3';
const burningWoodSoundFx = 'https://cdn.pixabay.com/audio/2023/12/05/audio_517f50359d.mp3';
const wavesSoundFx = 'https://cdn.uppbeat.io/audio-files/a34d50ecafdf61ec63b0f3d2f41f9998/4c3ea554ad0fcfdd07b8bbfc7fbd979e/90aecc49466add15d636408c7a7e6a35/STREAMING-ocean-waves-on-beach-calm-gamemaster-audio-3-00-14.mp3';

const typingSoundFx = 'https://cdn.pixabay.com/audio/2022/02/07/audio_ddfb1f8f33.mp3';
const cafeSoundFx = 'https://cdn.pixabay.com/audio/2022/03/09/audio_f8356168cb.mp3';
const officeSoundFx = 'https://cdn.pixabay.com/audio/2021/08/04/audio_7851094223.mp3';

// Reminder and Popup Functions
function showReminder() {
    // Show Desktop Notification
    if (Notification.permission === 'granted') {
        new Notification("Time for a Break!", { body: "What have you accomplished in the last session?" });
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                new Notification("Time for a Break!", { body: "What have you accomplished in the last session?" });
            }
        });
    }

    // Hide Animations
    togglePixelArt(false);
    toggleTomatoIcon(false);

    document.querySelector('#reminderPopup').style.display = 'flex';
    if (window.audioPlayer) {
        window.audioPlayer.pause();
        toggleVinylAnimation(false);
    }
    resetTimer();
    toggleTheme();
    // Play completion sound effect once
    const completionSound = new Audio(completeSoundFx);
    completionSound.play().then(() => {
        completionSound.remove(); // Remove the audio element after playing
    }).catch(error => {
        console.error('Error playing completion sound:', error);
    });
    // Disable interaction with other elements while popup is open
    document.body.style.pointerEvents = 'none';
    document.querySelector('#reminderPopup').style.pointerEvents = 'auto';
}

// Accomplishment Functions
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
}

function loadAccomplishments() {
    fetch('/accomplishments', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then((response) => response.json())
    .then((data) => {
        accomp = data.map(item => ({ text: item.text, time: item.time }));
        updateAccomplishmentsList();
    })
    .catch((error) => console.error('Error loading JSON file', error));
}

function closeReminderPopup() {
    document.querySelector('#reminderPopup').style.display = 'none';
    document.body.style.pointerEvents = 'auto';
    toggleTheme();
}

function submitAccomplishment() {
    saveAccomplishmentFromInput();
    closeReminderPopup();
    resetTimer();
}

function submitAccomplishmentAndBreak() {
    saveAccomplishmentFromInput();
    closeReminderPopup();
    
    isBreakMode = true;
    document.body.classList.add('break-mode');
    
    // Save current audio state to restore later
    previousAudioSources = [...audioSources];
    previousAudioDropdownValue = document.querySelector('#audioSourceDropdown').value;
    
    timerSeconds = 300; // 5 minutes
    targetEndTime = null;
    document.querySelector('#timer').textContent = '00:05:00';
    document.title = '(00:05:00) Break - Focus Desk';
    
    // Switch to dedicated break music
    audioSources = breakMusicSources;
    playRandomAudio();
    
    // Ensure it's paused as per user preference
    isPaused = true;
    syncPlayPauseUI();
    
    console.log("Break started (paused)...");
}

function skipBreak() {
    isBreakMode = false;
    document.body.classList.remove('break-mode');
    
    // Restore audio state
    audioSources = previousAudioSources.length > 0 ? previousAudioSources : defaultSources;
    document.querySelector('#audioSourceDropdown').value = previousAudioDropdownValue;
    playRandomAudio();
    
    resetTimer();
    console.log("Break skipped.");
}

function saveAccomplishmentFromInput() {
    const input = document.querySelector('#accomplishmentInput');
    const accomplishment = input.value.trim();

    if (accomplishment) {
        const timestamp = new Date().toLocaleString();
        const newAccomplishment = {
            text: accomplishment,
            time: timestamp
        };
        
        fetch('/save-accomplishment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newAccomplishment),
        })
        .then(response => {
            accomp.push(newAccomplishment);
            updateAccomplishmentsList();
        })
        .catch((error) => console.error('Error:', error));
        input.value = '';
    }
}

function updateAccomplishmentsList() {
    const list = document.querySelector('#accomplishmentsList');
    list.innerHTML = '';
    accomp.forEach((item, index) => {
        const li = document.createElement('li');
        const contentDiv = document.createElement('div');
        const timeSpan = document.createElement('span');
        timeSpan.textContent = item.time;
        contentDiv.appendChild(timeSpan);
        contentDiv.appendChild(document.createTextNode(` ${item.text}`));
        li.appendChild(contentDiv);
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'accomp-delete';
        deleteButton.setAttribute('aria-label', 'Delete accomplishment');
        deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
        deleteButton.onclick = () => deleteAccomplishment(index);
        
        li.appendChild(deleteButton);
        list.appendChild(li);
    });
}

function deleteAccomplishment(index) {
    const accomplishment = accomp[index];
    if (confirm(`Are you sure you want to delete this accomplishment?\n\n'${accomplishment.text}'`)) {
        fetch('/delete-accomplishment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ index: index }),
        })
        .then(response => response.json())
        .then(() => {
            accomp.splice(index, 1);
            updateAccomplishmentsList();
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }
}

function clearAccomplishments() {
    if (confirm('Are you sure you want to clear all accomplishments? This action cannot be undone.')) {
        accomp = [];
        updateAccomplishmentsList();
        fetch('/clear-accomplishments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(response => response.json())
        .catch((error) => {
            console.error('Error:', error);
        });
    }
}

function exportAccomplishments() {
    const jsonData = JSON.stringify(accomp, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    const now = new Date();
    const tzoffset = now.getTimezoneOffset() * 60000; // offset in milliseconds
    const dateTime = (new Date(Date.now() - tzoffset)).toISOString();
    a.download = `accomplishments-${dateTime}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}


// Timer Functions
function updateTimer() {
    if (!isPaused) {
        if (targetEndTime) {
            timerSeconds = Math.max(0, Math.round((targetEndTime - Date.now()) / 1000));
        } else {
            timerSeconds--;
        }
        if (timerSeconds <= 0) {
            if (isBreakMode) {
                // Break is over
                isBreakMode = false;
                document.body.classList.remove('break-mode');
                
                // Restore audio state
                audioSources = previousAudioSources.length > 0 ? previousAudioSources : defaultSources;
                document.querySelector('#audioSourceDropdown').value = previousAudioDropdownValue;
                playRandomAudio();
                
                // Play completion sound
                const completionSound = new Audio(completeSoundFx);
                completionSound.play().catch(e => console.error('Error playing sound:', e));
                
                // Save "Break" accomplishment
                const timestamp = new Date().toLocaleString();
                const breakAccomplishment = { text: "Break", time: timestamp };
                fetch('/save-accomplishment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(breakAccomplishment),
                }).then(() => {
                    accomp.push(breakAccomplishment);
                    updateAccomplishmentsList();
                });
                
                // Reset to focus session
                resetTimer();
                
                // Notification
                if (Notification.permission === 'granted') {
                    new Notification("Break is over!", { body: "Ready to focus again?" });
                }
            } else {
                showReminder();
            }
            return;
        }

        const hours = Math.floor(timerSeconds / 3600);
        const minutes = Math.floor((timerSeconds % 3600) / 60);
        const seconds = timerSeconds % 60;
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.querySelector('#timer').textContent = timeString;
        document.title = `(${timeString}) ${isBreakMode ? 'Break' : 'Focus'} - Focus Desk`;
    }
}

function resetTimer() {
    stopTimerLoop();
    targetEndTime = null;
    
    if (isBreakMode) {
        audioSources = previousAudioSources.length > 0 ? previousAudioSources : defaultSources;
        document.querySelector('#audioSourceDropdown').value = previousAudioDropdownValue;
    }
    
    isBreakMode = false;
    document.body.classList.remove('break-mode');
    timerSeconds = 1500; // Reset to 25 minutes
    localStorage.removeItem('timerSeconds');
    document.querySelector('#timer').textContent = '00:25:00';
    document.title = 'Focus Desk - Zen Focus';
    document.querySelector('#custom-hours').value = 0;
    document.querySelector('#custom-minutes').value = 25;
    document.querySelector('#custom-seconds').value = 0;

    // Hide Animations
    togglePixelArt(false);
    toggleTomatoIcon(false);

    isPaused = true;
    if (window.audioPlayer) {
        window.audioPlayer.pause();
        toggleVinylAnimation(false);
    }
    document.querySelector('#pauseResume').textContent = 'Play';
    document.querySelector('#playPauseIcon').className = 'fas fa-play';
    startTimerLoop();
}

function customizeTimer() {
    const hours = parseInt(document.querySelector('#custom-hours').value) || 0;
    const minutes = parseInt(document.querySelector('#custom-minutes').value) || 0;
    const seconds = parseInt(document.querySelector('#custom-seconds').value) || 0;

    if (hours >= 0 && minutes >= 0 && seconds >= 0) {
        timerSeconds = hours * 3600 + minutes * 60 + seconds;
        if (timerSeconds > 0) {
            stopTimerLoop();
            targetEndTime = null;
            startTimerLoop();
            
            document.querySelector('#pauseResume').textContent = 'Play';
            document.querySelector('#playPauseIcon').className = 'fas fa-play';
            document.querySelector('#timer').textContent = `${formatTime(hours,minutes,seconds)}`;
            document.title = 'Focus Desk - Zen Focus';
            
            isPaused = true;
            togglePixelArt(false);
            toggleTomatoIcon(false);
            
            localStorage.setItem('timerSeconds', timerSeconds);
        } else {
            alert('Please enter a valid time greater than 0 seconds.');
        }
    } else {
        alert('Please enter valid positive numbers for hours, minutes, and seconds.');
    }
}

function formatTime(hours, minutes, seconds) {
    return [hours, minutes, seconds]
        .map(v => v < 10 ? '0' + v : v)
        .join(':');
}

function syncPlayPauseUI() {
    const mainBtn = document.querySelector('#pauseResume');
    const breakBtn = document.querySelector('#breakPauseResume');
    const dockIcon = document.querySelector('#playPauseIcon');
    const logo = document.querySelector('.logo');
    
    if (mainBtn) mainBtn.textContent = isPaused ? 'Play' : 'Pause';
    if (breakBtn) breakBtn.textContent = isPaused ? 'Play' : 'Pause';
    if (dockIcon) dockIcon.className = isPaused ? 'fas fa-play' : 'fas fa-pause';
    if (logo) logo.classList.toggle('playing', !isPaused);
    
    toggleVinylAnimation(!isPaused);
    togglePixelArt(!isPaused);
    toggleTomatoIcon(!isPaused);
}

function pauseResumeTimer() {
    isPaused = !isPaused;
    targetEndTime = isPaused ? null : Date.now() + timerSeconds * 1000;
    
    syncPlayPauseUI();

    if (isSpotifyMode && spotifyPlayer) {
        spotifyPlayer.togglePlay();
        return;
    }

    if (!window.audioPlayer) {
        playRandomAudio();
    }

    if (isPaused) {
        window.audioPlayer.pause();
    } else {
        window.audioPlayer.play().catch(error => {
            console.error('Error resuming audio:', error);
        });
    }
}

function toggleVinylAnimation(isPlaying) {
    const vinylRecord = document.querySelector('.vinyl-record');
    if (vinylRecord) {
        if (isPlaying) {
            vinylRecord.classList.add('playing');
        } else {
            vinylRecord.classList.remove('playing');
        }
    }
}

function togglePixelArt(isPlaying) {
    console.log(`Toggling pixel art: ${isPlaying}`);
    const pixelArtBg = document.querySelector('#pixel-art-bg');
    if (pixelArtBg) {
        if (isPlaying) {
            pixelArtBg.classList.add('active');
        } else {
            pixelArtBg.classList.remove('active');
        }
    }
}

function toggleTomatoIcon(isPlaying) {
    const tomatoIcon = document.querySelector('#tomato-icon');
    if (tomatoIcon) {
        if (isPlaying) {
            tomatoIcon.classList.add('active');
        } else {
            tomatoIcon.classList.remove('active');
        }
    }
}

// Audio Functions
function formatAudioTime(sec) {
    if (!Number.isFinite(sec) || sec < 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' + s : s}`;
}

function parseTrackMetadata(src) {
    const dropdown = document.querySelector('#audioSourceDropdown');
    const vibeName = dropdown && dropdown.selectedOptions[0]
        ? dropdown.selectedOptions[0].text.replace(' 🟢', '')
        : 'Lo-Fi';
    const trackIdx = audioSources.indexOf(src);
    const trackNum = trackIdx >= 0 ? trackIdx + 1 : 1;

    if (isBreakMode) {
        return { title: 'Break Time Chill', artist: 'Rest Session • Break Mode' };
    }

    if (src && src.includes('STREAMING-')) {
        const match = src.match(/STREAMING-(.+?)-main-version/i);
        if (match && match[1]) {
            const words = match[1].split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1));
            if (words.length >= 2) {
                const artist = words[words.length - 1];
                const title = words.slice(0, -1).join(' ');
                return { title, artist: `${artist} • ${vibeName}` };
            }
            return { title: words.join(' '), artist: `${vibeName} • Track ${trackNum}` };
        }
    }

    return {
        title: `${vibeName} Stream #${trackNum}`,
        artist: `Focus Desk Radio • Track ${trackNum} of ${audioSources.length}`
    };
}

function updateNowPlayingUI(src) {
    const titleEl = document.getElementById('trackTitle');
    const artistEl = document.getElementById('trackArtist');
    if (!titleEl || !artistEl) return;

    const meta = parseTrackMetadata(src);
    titleEl.textContent = meta.title;
    titleEl.title = meta.title;
    artistEl.textContent = meta.artist;
}

function bindAudioProgressEvents(player) {
    const curTimeEl = document.getElementById('trackCurrentTime');
    const durTimeEl = document.getElementById('trackDuration');
    const fillEl = document.getElementById('trackProgressFill');

    if (curTimeEl) curTimeEl.textContent = '0:00';
    if (durTimeEl) durTimeEl.textContent = '0:00';
    if (fillEl) fillEl.style.width = '0%';

    player.addEventListener('loadedmetadata', () => {
        if (durTimeEl) durTimeEl.textContent = formatAudioTime(player.duration);
    });

    player.addEventListener('timeupdate', () => {
        if (curTimeEl) curTimeEl.textContent = formatAudioTime(player.currentTime);
        if (durTimeEl && player.duration) durTimeEl.textContent = formatAudioTime(player.duration);
        if (fillEl && player.duration > 0) {
            fillEl.style.width = `${Math.min(100, (player.currentTime / player.duration) * 100)}%`;
        }
    });
}

function seekAudioTrack(event) {
    if (!window.audioPlayer || !window.audioPlayer.duration) return;
    const bar = event.currentTarget;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    window.audioPlayer.currentTime = ratio * window.audioPlayer.duration;
}

function playRandomAudio() {
    const randomSource = audioSources[Math.floor(Math.random() * audioSources.length)];

    if (window.audioPlayer) {
        window.audioPlayer.pause();
    }

    window.audioPlayer = new Audio(randomSource);
    updateNowPlayingUI(randomSource);
    bindAudioProgressEvents(window.audioPlayer);

    window.audioPlayer.addEventListener('error', function() {
        console.log(`Error loading audio ${randomSource}, play the next audio file`);
        nextTrack();
    });

    window.audioPlayer.addEventListener('ended', function() {
        nextTrack();
    });

    window.audioPlayer.loop = isLoop;
    window.audioPlayer.volume = masterVolume;
    window.audioPlayer.muted = isMute;
}

function previousTrack() {
    if (isSpotifyMode && spotifyPlayer) {
        spotifyPlayer.previousTrack();
        return;
    }
    if (window.audioPlayer) {
        const currentIndex = audioSources.indexOf(window.audioPlayer.src);
        const newIndex = (currentIndex - 1 + audioSources.length) % audioSources.length;
        window.audioPlayer.src = audioSources[newIndex];
        updateNowPlayingUI(audioSources[newIndex]);
        
        if (!isPaused) {
            window.audioPlayer.play().catch(error => {
                console.error('Error playing previous track:', error);
            });
        }
        syncPlayPauseUI();
    }
}

function nextTrack() {
    if (isSpotifyMode && spotifyPlayer) {
        spotifyPlayer.nextTrack();
        return;
    }
    if (window.audioPlayer) {
        const currentIndex = audioSources.indexOf(window.audioPlayer.src);
        const newIndex = (currentIndex + 1) % audioSources.length;
        window.audioPlayer.src = audioSources[newIndex];
        updateNowPlayingUI(audioSources[newIndex]);
        
        if (!isPaused) {
            window.audioPlayer.play().catch(error => {
                console.error('Error playing next track:', error);
            });
        }
        syncPlayPauseUI();
    }
}

function changeAudioSource() {
    const selectedSource = document.querySelector('#audioSourceDropdown').value;
    const vinylLabel = document.querySelector('#vinyl-label-text');
    console.info(`Setting audio source to ${selectedSource}`);

    // Stop current local player if it exists
    if (window.audioPlayer) {
        window.audioPlayer.pause();
    }

    if (selectedSource === 'spotify') {
        if (!spotifyAccessToken) {
            alert('Please login to Spotify first!');
            document.querySelector('#audioSourceDropdown').value = 'default';
            changeAudioSource();
            return;
        }
        isSpotifyMode = true;
        vinylLabel.textContent = 'Spotify';
        vinylLabel.style.backgroundColor = '#1DB954'; // Spotify Green
        transferSpotifyPlayback();
        return;
    }

    isSpotifyMode = false;
    // If we were in Spotify mode, pause the Spotify player
    if (spotifyPlayer) {
        spotifyPlayer.pause();
    }

    switch(selectedSource) {
        case 'focusMusic':
            audioSources = focusMusicSources;
            vinylLabel.textContent = 'Focus';
            break;
        case 'cafeMusic':
            audioSources = cafeMusicSources;
            vinylLabel.textContent = 'Cafe';
            break;
        case 'ghibliInspired':
            audioSources = ghibliInspiredSources;
            vinylLabel.textContent = 'Ghibli';
            break;
        case 'lazyLofi':
            audioSources = lazyLofiSources;
            vinylLabel.textContent = 'Lazy';
            break;
        case 'lofiChill':
            audioSources = lofiChillSources;
            vinylLabel.textContent = 'Lo-Fi';
            break;
        case 'jazzBeats':
            audioSources = jazzBeatsSources;
            vinylLabel.textContent = 'Jazz';
            break;
        case 'sad':
            audioSources = sadSources;
            vinylLabel.textContent = 'Sad';
            break;
        case 'goodVibe':
            audioSources = goodVibeSources;
            vinylLabel.textContent = 'Good Vibe';
            break;
        case 'timelapse':
            audioSources = timelapseSources;
            vinylLabel.textContent = 'Timelapse';
            break;
        case 'calm':
            audioSources = calmSources;
            vinylLabel.textContent = 'Calm';
            break;
        default:
            audioSources = defaultSources;
            vinylLabel.textContent = 'Lo-Fi';
            break;
    }

    // Update vinyl label color based on vibe
    const vibeColors = {
        'focusMusic': '#3498db',     // Deep Blue
        'cafeMusic': '#795548',      // Coffee Brown
        'ghibliInspired': '#2ecc71', // Forest Green
        'lazyLofi': '#e67e22',       // Sunset Orange
        'lofiChill': '#9b59b6',      // Cool Purple
        'jazzBeats': '#f1c40f',      // Mustard Yellow
        'sad': '#95a5a6',            // Slate Gray
        'goodVibe': '#ffeb3b',       // Bright Yellow
        'timelapse': '#1abc9c',      // Teal
        'calm': '#f06292',           // Soft Pink
        'default': '#a18c8c'         // Original
    };
    
    if (vinylLabel) {
        vinylLabel.style.backgroundColor = vibeColors[selectedSource] || vibeColors['default'];
    }
    
    // Switch to new vibe category
    playRandomAudio();
    
    if (!isPaused) {
        window.audioPlayer.play().catch(error => {
            console.error('Error playing new audio source:', error);
        });
    }
    syncPlayPauseUI();

    localStorage.setItem('selectedAudio', selectedSource);
}


function toggleLoop() {    
    console.log(`Toggling loop to ${!isLoop}`);
    if (window.audioPlayer) {
        isLoop = !isLoop;
        window.audioPlayer.loop = isLoop; 
        const loopToggleButton = document.querySelector('#loopToggle');
        if (isLoop) {
            loopToggleButton.classList.add('dark-theme');
        } else {
            loopToggleButton.classList.remove('dark-theme');
        }
    }
}

function toggleMute() {
    isMute = !isMute;
    console.log(`Toggling mute to ${isMute}`);
    
    if (window.audioPlayer) {
        window.audioPlayer.muted = isMute;
    }
    
    AMBIENT_FX_KEYS.forEach(fx => {
        if (window[`${fx}Audio`]) {
            window[`${fx}Audio`].muted = isMute;
        }
    });

    const muteToggleButton = document.querySelector('#mute');
    if (isMute) {
        muteToggleButton.classList.add('dark-theme');
    } else {
        muteToggleButton.classList.remove('dark-theme');
    }
}

let activeWeatherStack = [];
let activeEnvStack = [];

function syncTomatoAppearance() {
    const tomatoIcon = document.querySelector('#tomato-icon');
    if (!tomatoIcon) return;

    const currentWeather = activeWeatherStack.length > 0 ? activeWeatherStack[activeWeatherStack.length - 1] : '';
    const currentItem = activeEnvStack.length > 0 ? activeEnvStack[activeEnvStack.length - 1] : '';

    if (currentWeather) {
        tomatoIcon.setAttribute('data-weather', currentWeather);
    } else {
        tomatoIcon.removeAttribute('data-weather');
    }

    if (currentItem) {
        tomatoIcon.setAttribute('data-item', currentItem);
    } else {
        tomatoIcon.removeAttribute('data-item');
    }
}

function setWeatherState(weatherKey, isActive) {
    activeWeatherStack = activeWeatherStack.filter(w => w !== weatherKey);
    if (isActive) {
        activeWeatherStack.push(weatherKey);
    }
    syncTomatoAppearance();
}

function setEnvItemState(itemKey, isActive) {
    activeEnvStack = activeEnvStack.filter(i => i !== itemKey);
    if (isActive) {
        activeEnvStack.push(itemKey);
    }
    syncTomatoAppearance();
}

function toggleSun() {
    const sunGlare = document.querySelector('.sun-glare');
    const skyBackground = document.querySelector('.sky-background');
    
    const sunToggle = document.querySelector('#sunToggle');    
    const rainToggle = document.querySelector('#rainToggle');
    const thunderToggle = document.querySelector('#thunderToggle');
    const moonToggle = document.querySelector('#moonToggle');

    if (!window.sunAudio) {
        window.sunAudio = new Audio(sunSoundFx);
        window.sunAudio.volume = parseFloat(document.getElementById('sunVolume').value) * masterVolume;
        window.sunAudio.loop = true;
    }
    
    if (sunToggle.classList.contains('dark-theme')) {
        console.info('❌☀️');
        sunGlare.style.display = 'none';
        skyBackground.classList.remove('active');
        sunToggle.classList.remove('dark-theme');
        window.sunAudio?.pause();
        setWeatherState('sun', false);
        
        // Remove existing glare
        sunGlare.innerHTML = '';
    } else {
        console.info('☀️☀️');
        
        // Remove Rain/Thunder if toggled on
        rainToggle.classList.contains('dark-theme') ? toggleRain() : console.log("Not rainy 😊");
        thunderToggle.classList.contains('dark-theme') ? toggleThunder() : console.log("Not thundering 😊");
        moonToggle.classList.contains('dark-theme') ? toggleMoon() : console.log("Not Dark Theme 😊");
        

        sunGlare.style.display = 'block';
        skyBackground.classList.add('active');
        sunToggle.classList.add('dark-theme');
        window.sunAudio.play();
        setWeatherState('sun', true);
    }
}

function createRain() {
    const rainContainer = document.querySelector('.rain');
    if (!rainContainer || rainContainer.style.display === 'none') return;

    const drop = document.createElement('div');
    drop.classList.add('raindrop');

    const size = Math.random() * 1.5 + 1;
    const posX = Math.floor(Math.random() * window.innerWidth);
    const duration = Math.random() * 0.6 + 0.45;

    drop.style.left = posX + 'px';
    drop.style.width = size + 'px';
    drop.style.animationDuration = duration + 's';

    rainContainer.appendChild(drop);

    setTimeout(() => {
        drop.remove();
        if (rainContainer.style.display !== 'none') {
            const splash = document.createElement('div');
            splash.classList.add('rain-splash');
            splash.style.left = posX + 'px';
            rainContainer.appendChild(splash);
            setTimeout(() => splash.remove(), 350);
        }
    }, duration * 1000);
}

const SNOW_SEGMENT_COUNT = 40;
let snowSegments = new Array(SNOW_SEGMENT_COUNT).fill(0);
let isShovelActive = false;
let currentSnowTool = null;

const SNOW_TOOLS = {
    spoon: {
        radius: 0,
        centerScoop: 7,
        sideScoop: 3,
        puffs: 3,
        puffColor: '#ffffff',
        svg: `
          <svg viewBox="0 0 64 64" width="60" height="60" fill="none">
            <path d="M48 12 C52 8, 56 12, 52 16 L28 40" stroke="#94a3b8" stroke-width="5" stroke-linecap="round"/>
            <path d="M48 12 L28 40" stroke="#e2e8f0" stroke-width="2" stroke-linecap="round"/>
            <ellipse cx="20" cy="46" rx="12" ry="8" transform="rotate(-35 20 46)" fill="#cbd5e1" stroke="#64748b" stroke-width="2.5"/>
            <ellipse cx="19" cy="44" rx="8" ry="4.5" transform="rotate(-35 19 44)" fill="#f8fafc"/>
          </svg>`
    },
    mug: {
        radius: 1,
        centerScoop: 15,
        sideScoop: 9,
        puffs: 6,
        puffColor: '#fffbeb',
        svg: `
          <svg viewBox="0 0 64 64" width="60" height="60" fill="none">
            <path d="M24 16 C22 11, 27 9, 25 4" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" opacity="0.85"/>
            <path d="M34 15 C32 10, 37 8, 35 3" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" opacity="0.85"/>
            <path d="M44 26 H50 C54 26, 56 29, 56 33 C56 37, 54 40, 50 40 H44" stroke="#d97706" stroke-width="4.5" stroke-linecap="round"/>
            <rect x="14" y="20" width="31" height="28" rx="6" fill="#f59e0b" stroke="#78350f" stroke-width="2.5"/>
            <ellipse cx="29.5" cy="21" rx="14" ry="4" fill="#451a03" stroke="#78350f" stroke-width="2"/>
            <path d="M20 31 H39" stroke="#fef3c7" stroke-width="2.5" stroke-linecap="round" opacity="0.6"/>
          </svg>`
    },
    trash: {
        radius: 1,
        centerScoop: 22,
        sideScoop: 13,
        puffs: 7,
        puffColor: '#f1f5f9',
        svg: `
          <svg viewBox="0 0 64 64" width="60" height="60" fill="none">
            <path d="M16 20 L20 52 C20.5 54, 22 55, 25 55 H39 C42 55, 43.5 54, 44 52 L48 20 Z" fill="#94a3b8" stroke="#334155" stroke-width="2.5" stroke-linejoin="round"/>
            <line x1="25" y1="25" x2="26" y2="49" stroke="#475569" stroke-width="2.5" stroke-linecap="round"/>
            <line x1="32" y1="25" x2="32" y2="49" stroke="#475569" stroke-width="2.5" stroke-linecap="round"/>
            <line x1="39" y1="25" x2="38" y2="49" stroke="#475569" stroke-width="2.5" stroke-linecap="round"/>
            <g transform="rotate(-18 16 18)">
              <rect x="13" y="13" width="38" height="6" rx="3" fill="#cbd5e1" stroke="#334155" stroke-width="2.5"/>
              <path d="M27 13 V9 C27 7.5, 37 7.5, 37 9 V13" stroke="#334155" stroke-width="2.5" stroke-linecap="round"/>
            </g>
          </svg>`
    },
    penguin: {
        radius: 2,
        centerScoop: 20,
        sideScoop: 14,
        puffs: 9,
        puffColor: '#ffffff',
        svg: `
          <svg viewBox="0 0 64 64" width="62" height="62" fill="none">
            <ellipse cx="25" cy="53" rx="6" ry="3" fill="#f97316"/>
            <ellipse cx="39" cy="53" rx="6" ry="3" fill="#f97316"/>
            <ellipse cx="32" cy="33" rx="16" ry="20" fill="#1e293b" stroke="#0f172a" stroke-width="2.5"/>
            <ellipse cx="32" cy="36" rx="11" ry="14" fill="#ffffff"/>
            <path d="M16 28 C11 33, 11 41, 16 43" fill="#1e293b" stroke="#0f172a" stroke-width="2" stroke-linecap="round"/>
            <path d="M48 28 C53 33, 53 41, 48 43" fill="#1e293b" stroke="#0f172a" stroke-width="2" stroke-linecap="round"/>
            <path d="M19 26 Q32 31 45 26" stroke="#ef4444" stroke-width="5" stroke-linecap="round"/>
            <path d="M38 28 L41 37" stroke="#ef4444" stroke-width="4.5" stroke-linecap="round"/>
            <circle cx="27" cy="20" r="2.2" fill="#ffffff"/>
            <circle cx="27" cy="20" r="1.2" fill="#0f172a"/>
            <circle cx="37" cy="20" r="2.2" fill="#ffffff"/>
            <circle cx="37" cy="20" r="1.2" fill="#0f172a"/>
            <polygon points="32,21 28,25 36,25" fill="#f59e0b"/>
          </svg>`
    },
    shovel: {
        radius: 1,
        centerScoop: 26,
        sideScoop: 15,
        puffs: 9,
        puffColor: '#ffffff',
        svg: `
          <svg viewBox="0 0 64 64" width="64" height="64" fill="none">
            <!-- Red D-Grip Handle -->
            <path d="M45 6 L57 18 L53 22 L41 10 Z" fill="#dc2626" stroke="#7f1d1d" stroke-width="2" stroke-linejoin="round"/>
            <path d="M46 11 L52 17" stroke="#fca5a5" stroke-width="1.8" stroke-linecap="round"/>
            <!-- Ergonomic Ash Wood Shaft -->
            <path d="M46 16 L24 38" stroke="#78350f" stroke-width="6.5" stroke-linecap="round"/>
            <path d="M46 16 L24 38" stroke="#d97706" stroke-width="3.8" stroke-linecap="round"/>
            <!-- Metal Collar -->
            <path d="M22 35 L28 41" stroke="#94a3b8" stroke-width="4.5" stroke-linecap="round"/>
            <!-- Ribbed Wide Snow Pusher Blade -->
            <path d="M12 29 L35 52 L23 61 C15 63, 4 52, 6 44 Z" fill="#ef4444" stroke="#991b1b" stroke-width="2.2" stroke-linejoin="round"/>
            <!-- Blade Ribs -->
            <path d="M16 35 L9 44 M22 41 L14 51 M28 47 L20 57" stroke="#b91c1c" stroke-width="1.8" stroke-linecap="round"/>
            <!-- Steel Wear Strip Along Leading Edge -->
            <path d="M6 44 C4 52, 15 63, 23 61 L20 62.5 C12 63.5, 3 54, 4.5 46 Z" fill="#cbd5e1" stroke="#475569" stroke-width="1.4"/>
            <!-- Fresh Snow on Blade -->
            <path d="M8 46 C10 52, 16 57, 22 58 C18 54, 14 50, 8 46 Z" fill="#ffffff" opacity="0.92"/>
          </svg>`
    },
    zamboni: {
        radius: 3,
        centerScoop: 36,
        sideScoop: 26,
        puffs: 14,
        puffColor: '#e0f2fe',
        svg: `
          <svg viewBox="0 0 64 64" width="64" height="64" fill="none">
            <!-- Conditioner Rear Unit -->
            <rect x="44" y="36" width="14" height="12" rx="2" fill="#94a3b8" stroke="#1e293b" stroke-width="2.2"/>
            <!-- Main Zamboni Body -->
            <path d="M8 32 C8 27, 12 25, 18 25 H38 L42 16 H50 V46 H8 Z" fill="#0284c7" stroke="#0f172a" stroke-width="2.5" stroke-linejoin="round"/>
            <!-- White Racing Stripe -->
            <rect x="9" y="34" width="40" height="5" fill="#ffffff"/>
            <!-- Steering Wheel & Seat -->
            <line x1="35" y1="25" x2="32" y2="18" stroke="#1e293b" stroke-width="2.5" stroke-linecap="round"/>
            <ellipse cx="31" cy="17" rx="4" ry="1.8" transform="rotate(-20 31 17)" stroke="#ef4444" stroke-width="2.2"/>
            <!-- Headlight -->
            <circle cx="9" cy="31" r="2.5" fill="#fde047" stroke="#ca8a04" stroke-width="1.2"/>
            <!-- Wheels -->
            <circle cx="18" cy="47" r="6.5" fill="#1e293b" stroke="#0f172a" stroke-width="2"/>
            <circle cx="18" cy="47" r="2.8" fill="#cbd5e1"/>
            <circle cx="38" cy="47" r="6.5" fill="#1e293b" stroke="#0f172a" stroke-width="2"/>
            <circle cx="38" cy="47" r="2.8" fill="#cbd5e1"/>
          </svg>`
    }
};

function initSnowPile(snowContainer) {
    snowSegments = new Array(SNOW_SEGMENT_COUNT).fill(3);
    const pile = document.createElement('div');
    pile.className = 'snow-pile';
    for (let i = 0; i < SNOW_SEGMENT_COUNT; i++) {
        const seg = document.createElement('div');
        seg.className = 'snow-segment';
        seg.style.left = `${(i / SNOW_SEGMENT_COUNT) * 100}%`;
        seg.style.height = `${snowSegments[i]}px`;
        pile.appendChild(seg);
    }
    snowContainer.innerHTML = '';
    snowContainer.appendChild(pile);
}

function updateSnowSegmentDOM(index) {
    const snowContainer = document.querySelector('.snow');
    if (!snowContainer) return;
    const segments = snowContainer.querySelectorAll('.snow-segment');
    if (segments[index]) {
        segments[index].style.height = `${Math.max(0, snowSegments[index])}px`;
    }
}

function addSnowAtPosition(posX) {
    const idx = Math.min(
        SNOW_SEGMENT_COUNT - 1,
        Math.max(0, Math.floor((posX / window.innerWidth) * SNOW_SEGMENT_COUNT))
    );
    snowSegments[idx] = Math.min(snowSegments[idx] + 0.9, 65);
    updateSnowSegmentDOM(idx);

    if (idx > 0) {
        snowSegments[idx - 1] = Math.min(snowSegments[idx - 1] + 0.45, 65);
        updateSnowSegmentDOM(idx - 1);
    }
    if (idx < SNOW_SEGMENT_COUNT - 1) {
        snowSegments[idx + 1] = Math.min(snowSegments[idx + 1] + 0.45, 65);
        updateSnowSegmentDOM(idx + 1);
    }
}

function spawnSnowPuffs(x, count = 6, color = '#ffffff') {
    const snowContainer = document.querySelector('.snow');
    if (!snowContainer || snowContainer.style.display === 'none') return;

    for (let i = 0; i < count; i++) {
        const puff = document.createElement('div');
        puff.className = 'snow-puff';
        const size = Math.random() * 6 + 4;
        const dx = (Math.random() - 0.5) * 110;
        const dy = -(Math.random() * 60 + 25);
        puff.style.width = `${size}px`;
        puff.style.height = `${size}px`;
        puff.style.background = color;
        puff.style.left = `${x + (Math.random() - 0.5) * 26}px`;
        puff.style.setProperty('--puff-dx', `${dx}px`);
        puff.style.setProperty('--puff-dy', `${dy}px`);
        snowContainer.appendChild(puff);
        setTimeout(() => puff.remove(), 550);
    }
}

function shovelSnowAt(clientX, clientY) {
    if (!isShovelActive || !currentSnowTool) return;
    const toolConfig = SNOW_TOOLS[currentSnowTool] || SNOW_TOOLS.spoon;

    const shovelCursor = document.getElementById('snowShovelCursor');
    if (shovelCursor) {
        shovelCursor.classList.add('scooping');
        clearTimeout(window.shovelScoopTimeout);
        window.shovelScoopTimeout = setTimeout(() => {
            shovelCursor.classList.remove('scooping');
        }, 200);
    }

    // Check if click is near the bottom floor of the viewport
    if (clientY < window.innerHeight - 105) return;

    const centerIdx = Math.min(
        SNOW_SEGMENT_COUNT - 1,
        Math.max(0, Math.floor((clientX / window.innerWidth) * SNOW_SEGMENT_COUNT))
    );

    let clearedAny = false;
    const radius = toolConfig.radius;
    for (let offset = -radius; offset <= radius; offset++) {
        const idx = centerIdx + offset;
        if (idx >= 0 && idx < SNOW_SEGMENT_COUNT && snowSegments[idx] > 0.5) {
            const scoopAmount = offset === 0 ? toolConfig.centerScoop : toolConfig.sideScoop;
            snowSegments[idx] = Math.max(0, snowSegments[idx] - scoopAmount);
            updateSnowSegmentDOM(idx);
            clearedAny = true;
        }
    }

    if (clearedAny) {
        spawnSnowPuffs(clientX, toolConfig.puffs, toolConfig.puffColor);
    }
}

function selectSnowTool(toolKey) {
    if (isShovelActive && currentSnowTool === toolKey) {
        toggleShovelTool(false);
        return;
    }
    currentSnowTool = toolKey;
    isShovelActive = true;

    const cursor = document.getElementById('snowShovelCursor');
    if (cursor && SNOW_TOOLS[toolKey]) {
        cursor.innerHTML = SNOW_TOOLS[toolKey].svg;
        cursor.setAttribute('data-tool', toolKey);
        cursor.classList.add('active');
    }

    document.querySelectorAll('.snow-tool-option').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-snow-tool') === toolKey);
    });
    document.body.classList.add('shovel-mode-active');
}

function toggleShovelTool(forceState) {
    const nextState = typeof forceState === 'boolean' ? forceState : !isShovelActive;
    if (!nextState) {
        isShovelActive = false;
        currentSnowTool = null;
        const cursor = document.getElementById('snowShovelCursor');
        if (cursor) cursor.classList.remove('active');
        document.querySelectorAll('.snow-tool-option').forEach(btn => btn.classList.remove('active'));
        document.body.classList.remove('shovel-mode-active');
    } else {
        selectSnowTool(currentSnowTool || 'penguin');
    }
}

window.addEventListener('mousemove', (e) => {
    if (!isShovelActive) return;
    const cursor = document.getElementById('snowShovelCursor');
    if (cursor) {
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
    }
});

window.addEventListener('mousedown', (e) => {
    if (!isShovelActive) return;
    if (e.target && e.target.closest('#shovelToolBtn')) return;
    shovelSnowAt(e.clientX, e.clientY);
});

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isShovelActive) {
        toggleShovelTool(false);
    }
});

function createSnow() {
    const snowContainer = document.querySelector('.snow');
    if (!snowContainer || snowContainer.style.display === 'none') return;

    const flake = document.createElement('div');
    flake.classList.add('snowflake');

    const size = Math.random() * 4 + 2; // Slightly larger than raindrops
    const posX = Math.floor(Math.random() * window.innerWidth);
    const duration = Math.random() * 4 + 3; // Slower fall than rain

    flake.style.left = posX + 'px';
    flake.style.width = size + 'px';
    flake.style.height = size + 'px';
    flake.style.animationDuration = duration + 's';

    snowContainer.appendChild(flake);

    setTimeout(() => {
        flake.remove();
        if (snowContainer.style.display !== 'none') {
            addSnowAtPosition(posX);
        }
    }, duration * 1000);
}

  
function toggleRain() {
    const rainContainer = document.querySelector('.rain');
    const rainToggle = document.querySelector('#rainToggle');
    if (!window.rainAudio) {
        window.rainAudio = new Audio(rainSoundFx);
        window.rainAudio.volume = parseFloat(document.getElementById('rainVolume').value) * masterVolume;
        window.rainAudio.loop = true;
    }

    if (rainToggle.classList.contains('dark-theme')) {
        console.info('❌🌧️');
        rainContainer.style.display = 'none';
        rainToggle.classList.remove('dark-theme');
        window.rainAudio?.pause();
        setWeatherState('rain', false);
        // Stop rain animation
        clearInterval(window.rainInterval);
        // Remove existing raindrops
        rainContainer.innerHTML = '';
    } else {
        console.info('🌧️🌧️');
        rainContainer.style.display = 'block';
        rainToggle.classList.add('dark-theme');
        window.rainAudio.play();
        setWeatherState('rain', true);

        // Start rain animation
        window.rainInterval = setInterval(createRain, 20);
    }
}

function toggleSnow() {
    const snowContainer = document.querySelector('.snow');
    const snowToggle = document.querySelector('#snowToggle');
    const shovelBtn = document.getElementById('shovelToolBtn');
    if (!window.snowAudio) {
        window.snowAudio = new Audio(snowSoundFx);
        window.snowAudio.volume = parseFloat(document.getElementById('snowVolume').value) * masterVolume;
        window.snowAudio.loop = true;
    }

    if (snowToggle.classList.contains('dark-theme')) {
        console.info('❌☃️');
        snowContainer.style.display = 'none';
        snowToggle.classList.remove('dark-theme');
        window.snowAudio?.pause();
        setWeatherState('snow', false);
        // Stop snow animation & put down shovel
        clearInterval(window.snowInterval);
        toggleShovelTool(false);
        if (shovelBtn) shovelBtn.classList.remove('visible');
        snowContainer.innerHTML = '';
    } else {
        console.info('☃️☃️');
        snowContainer.style.display = 'block';
        snowToggle.classList.add('dark-theme');
        window.snowAudio.play();
        setWeatherState('snow', true);

        // Create segmented snow accumulation layer & show shovel button
        initSnowPile(snowContainer);
        if (shovelBtn) shovelBtn.classList.add('visible');

        // Start snow animation
        window.snowInterval = setInterval(createSnow, 30);
    }
}

function toggleAmbientSound(key, soundUrl) {
    const toggleBtn = document.querySelector(`#${key}Toggle`);
    const audioKey = `${key}Audio`;

    if (!window[audioKey]) {
        window[audioKey] = new Audio(soundUrl);
        window[audioKey].volume = parseFloat(document.getElementById(`${key}Volume`).value) * masterVolume;
        window[audioKey].loop = true;
        window[audioKey].muted = isMute;
    }

    if (toggleBtn.classList.contains('dark-theme')) {
        toggleBtn.classList.remove('dark-theme');
        window[audioKey].pause();
        setEnvItemState(key, false);
    } else {
        toggleBtn.classList.add('dark-theme');
        window[audioKey].play();
        setEnvItemState(key, true);
    }
}

function toggleThunder() { toggleAmbientSound('thunder', thunderSoundFx); }
function toggleFire() { toggleAmbientSound('fire', burningWoodSoundFx); }
function toggleWave() { toggleAmbientSound('wave', wavesSoundFx); }
function toggleTyping() { toggleAmbientSound('typing', typingSoundFx); }
function toggleCafe() { toggleAmbientSound('cafe', cafeSoundFx); }
function toggleOffice() { toggleAmbientSound('office', officeSoundFx); }

function toggleMoon() {
    const moonToggle = document.querySelector('#moonToggle');
    moonToggle.classList.toggle('dark-theme');
    toggleTheme();
}

function setAppTheme(themeName) {
    document.body.setAttribute('data-theme', themeName);
    document.querySelectorAll('.theme-swatch').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-theme-option') === themeName);
    });
    localStorage.setItem('focusDeskTheme', themeName);
}

// Start the timer immediately
window.onload = async function() {
    const savedTheme = localStorage.getItem('focusDeskTheme');
    if (savedTheme) {
        setAppTheme(savedTheme);
    }

    // Request Notification permission
    if ("Notification" in window && Notification.permission !== "denied") {
        Notification.requestPermission();
    }

    // Setup Volume Listeners
    AMBIENT_FX_KEYS.forEach(fx => {
        const slider = document.getElementById(`${fx}Volume`);
        if (slider) {
            slider.addEventListener('input', (e) => {
                if (window[`${fx}Audio`]) {
                    window[`${fx}Audio`].volume = parseFloat(e.target.value) * masterVolume;
                }
            });
        }
    });

    const masterSlider = document.getElementById('masterVolume');
    if (masterSlider) {
        masterSlider.addEventListener('input', (e) => {
            masterVolume = parseFloat(e.target.value);
            
            // Update music player
            if (window.audioPlayer) {
                window.audioPlayer.volume = masterVolume;
            }
            if (spotifyPlayer) {
                spotifyPlayer.setVolume(masterVolume);
            }
            
            // Update all active ambient sounds
            AMBIENT_FX_KEYS.forEach(fx => {
                const s = document.getElementById(`${fx}Volume`);
                if (s && window[`${fx}Audio`]) {
                    window[`${fx}Audio`].volume = parseFloat(s.value) * masterVolume;
                }
            });
        });
    }

    loadAccomplishments();
    
    const savedAudio = localStorage.getItem('selectedAudio');
    if (savedAudio) {
        document.querySelector('#audioSourceDropdown').value = savedAudio;
        changeAudioSource();
    } else {
        playRandomAudio();
    }
    
    resetTimer();

    syncPlayPauseUI();
};

// --- Spotify Web Playback SDK Implementation ---

window.onSpotifyWebPlaybackSDKReady = () => {
    fetchSpotifyToken();
};

async function fetchSpotifyToken() {
    try {
        const response = await fetch('/auth/token');
        const data = await response.json();
        if (data.access_token) {
            spotifyAccessToken = data.access_token;
            initSpotifyPlayer();
            const loginBtn = document.getElementById('spotifyLoginBtn');
            if (loginBtn) {
                loginBtn.innerHTML = '<i class="fab fa-spotify"></i> Connected';
                loginBtn.classList.add('dark-theme');
                loginBtn.onclick = null;
            }
        }
    } catch (err) {
        console.error('Failed to fetch Spotify token:', err);
    }
}

function initSpotifyPlayer() {
    spotifyPlayer = new Spotify.Player({
        name: 'Focus Desk Web Player',
        getOAuthToken: cb => { cb(spotifyAccessToken); },
        volume: masterVolume
    });

    spotifyPlayer.addListener('initialization_error', ({ message }) => { console.error('Spotify Init Error:', message); });
    spotifyPlayer.addListener('authentication_error', ({ message }) => { console.error('Spotify Auth Error:', message); });
    spotifyPlayer.addListener('account_error', ({ message }) => { console.error('Spotify Account Error:', message); });
    spotifyPlayer.addListener('playback_error', ({ message }) => { console.error('Spotify Playback Error:', message); });

    spotifyPlayer.addListener('player_state_changed', state => {
        if (!state) return;
        
        const { current_track } = state.track_window;
        const vinylLabel = document.querySelector('#vinyl-label-text');
        if (current_track && isSpotifyMode) {
            if (vinylLabel) vinylLabel.textContent = current_track.name;
            const titleEl = document.getElementById('trackTitle');
            const artistEl = document.getElementById('trackArtist');
            if (titleEl) {
                titleEl.textContent = current_track.name;
                titleEl.title = current_track.name;
            }
            if (artistEl && current_track.artists) {
                artistEl.textContent = `${current_track.artists.map(a => a.name).join(', ')} • Spotify`;
            }
        }
        
        if (isPaused !== state.paused) {
            isPaused = state.paused;
            targetEndTime = isPaused ? null : Date.now() + timerSeconds * 1000;
        }
        syncPlayPauseUI();
    });

    spotifyPlayer.addListener('ready', ({ device_id }) => {
        console.log('Spotify Player Ready with Device ID', device_id);
        spotifyDeviceId = device_id;
    });

    spotifyPlayer.addListener('not_ready', ({ device_id }) => {
        console.log('Spotify Player Device ID has gone offline', device_id);
    });

    spotifyPlayer.connect();
}

async function transferSpotifyPlayback() {
    if (!spotifyDeviceId || !spotifyAccessToken) return;
    
    try {
        await fetch('https://api.spotify.com/v1/me/player', {
            method: 'PUT',
            body: JSON.stringify({
                device_ids: [spotifyDeviceId],
                play: true,
            }),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${spotifyAccessToken}`
            },
        });
    } catch (err) {
        console.error('Error transferring Spotify playback:', err);
    }
}
