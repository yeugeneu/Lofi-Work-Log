// Global variables
let accomp = [];
let timerSeconds = 1500; // 25 minutes default
let timerInterval;
let isPaused = false;
let isLoop = false;
let isMute = false;
let isDarkTheme = false;

let audioSources = defaultSources;

const completeSoundFx = 'https://cdn.uppbeat.io/audio-files/d927511931994ce45cf5b95b34e23536/b8acdddc6e37f6b47b0057dbaf3b53af/9c3ce15f497635d0c185b92d34ce902c/STREAMING-level-complete-winner-piano-om-fx-1-00-06.mp3';

// const sunSoundFx = 'https://cdn.uppbeat.io/audio-files/44fbdf1792559839ac2aaf16cfa6b689/0b1eaccdf444f42aae30a96da4e5250c/7526d6c2f348547b4dbb742a0f1fc776/STREAMING-cuckoo-raven-bird-call-ambience-ivo-vicic-1-01-41.mp3';
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
    // Disable interaction with other elements
    document.body.style.pointerEvents = 'none';
    document.querySelector('#reminderPopup').style.pointerEvents = 'auto';

    // Add event listener to re-enable interactions when popup is closed
    document.querySelector('#reminderPopup').querySelectorAll('button').forEach(button => {
        button.addEventListener('click', function() {
            document.body.style.pointerEvents = 'auto';
            document.querySelector('#reminderPopup').style.display = 'none';
        }, { once: true });
    });
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
        console.log(data);
        data.forEach(item => {
            accomp.push({ text: item.text, time: item.time });
        })
        updateAccomplishmentsList();
    })
    .catch((error) => console.error('Error loading JSON file', error));
}
function closeReminderPopup() {
    document.querySelector('#reminderPopup').style.display = 'none';
    document.body.style.pointerEvents = 'auto';
}

function submitAccomplishment() {
    saveAccomplishmentFromInput();
    document.querySelector('#reminderPopup').style.display = 'none';
    resetTimer();
    toggleTheme();
}

function submitAccomplishmentAndBreak() {
    saveAccomplishmentFromInput();
    document.querySelector('#reminderPopup').style.display = 'none';
    resetTimer();
    toggleTheme();
    // Logic for starting break could be added here (e.g. 5 min timer)
    console.log("Break started...");
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
        li.innerHTML = `<div><span>${item.time}</span> ${item.text}</div>`;
        
        const deleteButton = document.createElement('button');
        deleteButton.id = 'accompDelete';
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
        .then(response => {
            console.log({response});
            response.json();
        })
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
    var tzoffset = now.getTimezoneOffset() * 60000; //offset in milliseconds
    var dateTime = (new Date(Date.now() - tzoffset)).toISOString();
    a.download = `accomplishments-${dateTime}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}


// Timer Functions
function updateTimer() {
    if (!isPaused) {
        timerSeconds--;
        if (timerSeconds <= 0) {
            showReminder();
            return;
        }

        const hours = Math.floor(timerSeconds / 3600);
        const minutes = Math.floor((timerSeconds % 3600) / 60);
        const seconds = timerSeconds % 60;
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.querySelector('#timer').textContent = timeString;
    }
}

function resetTimer() {
    clearInterval(timerInterval);
    timerSeconds = 1500; // Reset to 1 hour
    document.querySelector('#timer').textContent = '00:25:00';
    document.querySelector('#custom-hours').value = 0;
    document.querySelector('#custom-minutes').value = 25;
    document.querySelector('#custom-seconds').value = 0;

    isPaused = true;
    if (window.audioPlayer) {
        window.audioPlayer.pause();
        toggleVinylAnimation(false);
    }
    document.querySelector('#pauseResume').textContent = 'Play';
    document.querySelector('#playPauseIcon').className = 'fas fa-play';
    timerInterval = setInterval(updateTimer, 1000);
    // document.body.classList.toggle('dark-theme');
}

function customizeTimer() {
    const hours = parseInt(document.querySelector('#custom-hours').value) || 0;
    const minutes = parseInt(document.querySelector('#custom-minutes').value) || 0;
    const seconds = parseInt(document.querySelector('#custom-seconds').value) || 0;

    if (hours >= 0 && minutes >= 0 && seconds >= 0) {
        timerSeconds = hours * 3600 + minutes * 60 + seconds;
        if (timerSeconds > 0) {
            clearInterval(timerInterval);
            timerInterval = setInterval(updateTimer, 1000);
            
            document.querySelector('#pauseResume').textContent = 'Play';
            document.querySelector('#playPauseIcon').className = 'fas fa-play';
            document.querySelector('#timer').textContent = `${formatTime(hours,minutes,seconds)}`;
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

function pauseResumeTimer() {
    isPaused = !isPaused;
    document.querySelector('#pauseResume').textContent = isPaused ? 'Play' : 'Pause';
    if (isPaused && window.audioPlayer) {
        window.audioPlayer.pause();
        document.querySelector('#playPauseIcon').className = 'fas fa-play';
        toggleVinylAnimation(false);
    } else if (!isPaused && window.audioPlayer) {
        window.audioPlayer.play().catch(error => {
            console.error('Error resuming audio:', error);
        }).then(() => {
            document.querySelector('#playPauseIcon').className = 'fas fa-pause';
            toggleVinylAnimation(true);
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

// Audio Functions
function playRandomAudio() {
    // const randomSource = audioSources[Math.floor(Math.random() * audioSources.length)];
    const randomSource = audioSources[Math.floor(Math.random() * new Date().getTime() % audioSources.length)];

    window.audioPlayer = new Audio(randomSource);
    window.audioPlayer.addEventListener('error', function(e) {
        console.log(`Error loading audio ${randomSource}, play the next audio file`);
        nextTrack();
        window.audioPlayer.play().catch(error => {
            console.error('Error playing the next audio:', error);
        });
    });
    window.audioPlayer.addEventListener('ended', function() {
        nextTrack();
        window.audioPlayer.play().catch(error => {
            console.error('Error playing the next audio:', error);
        });
    });
    window.audioPlayer.loop = isLoop;
    window.audioPlayer.volume = 0.8; // 80% volume
}

function previousTrack() {
    if (window.audioPlayer) {
        const currentIndex = audioSources.indexOf(window.audioPlayer.src);
        const newIndex = (currentIndex - 1 + audioSources.length) % audioSources.length;
        window.audioPlayer.src = audioSources[newIndex];
        window.audioPlayer.play()
        .then(()=> {
            document.querySelector('#playPauseIcon').className = 'fas fa-pause';
            isPaused = false;
            toggleVinylAnimation(true);
        })
        .catch(error => {
            console.error('Error playing previous track:', error);
        });
    }
}

function nextTrack() {
    if (window.audioPlayer) {
        const currentIndex = audioSources.indexOf(window.audioPlayer.src);
        const newIndex = (currentIndex + 1) % audioSources.length;
        window.audioPlayer.src = audioSources[newIndex];
        window.audioPlayer.play()
        .then(()=> {
            document.querySelector('#playPauseIcon').className = 'fas fa-pause';
            isPaused = false;
            toggleVinylAnimation(true);
        })
        .catch(error => {
            console.error('Error playing next track:', error);
        });
    }
}

function changeAudioSource() {
    const selectedSource = document.querySelector('#audioSourceDropdown').value;
    const vinylLabel = document.querySelector('#vinyl-label-text');
    console.info(`Setting audio source to ${selectedSource}`);

    switch(selectedSource) {
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
    
    // If audio is currently playing, switch to a randome track of the new source
    if (window.audioPlayer && !window.audioPlayer.paused) {
        const randomSource = audioSources[Math.floor(Math.random() * new Date().getTime() % audioSources.length)];
        window.audioPlayer.src = randomSource;
        window.audioPlayer.play().then(() => {
            toggleVinylAnimation(true);
        }).catch(error => {
            console.error('Error playing new audio source:', error);
        });
    }
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
    console.log(`Toggling mute background music to ${!isMute}`);
    if (window.audioPlayer) {
        isMute = !isMute;
        window.audioPlayer.muted = isMute;
        const muteToggleButton = document.querySelector('#mute');
        if (isMute) {
            muteToggleButton.classList.add('dark-theme');
        } else {
            muteToggleButton.classList.remove('dark-theme');
        }
    }
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
        window.sunAudio.volume = 0.5;
        window.sunAudio.loop = true;
    }
    
    if (sunToggle.classList.contains('dark-theme')) {
        console.info('❌☀️');
        sunGlare.style.display = 'none';
        skyBackground.classList.remove('active');
        sunToggle.classList.remove('dark-theme');
        window.sunAudio?.pause();
        
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
    }
}

function createRain() {
    const rainContainer = document.querySelector('.rain');
    const drop = document.createElement('div');
    drop.classList.add('raindrop');

    const size = Math.random() * 2 + 1;
    const posX = Math.floor(Math.random() * window.innerWidth);
    const delay = Math.random() * -20;
    const duration = Math.random() * 1 + 0.5;

    drop.style.left = posX + 'px';
    drop.style.width = size + 'px';
    drop.style.animationDelay = delay + 's';
    drop.style.animationDuration = duration + 's';

    rainContainer.appendChild(drop);

    setTimeout(() => {
      drop.remove();
    }, duration * 1000);
}

function createSnow() {
    const snowContainer = document.querySelector('.snow');
    const flake = document.createElement('div');
    flake.classList.add('snowflake');

    const size = Math.random() * 4 + 2; // Slightly larger than raindrops
    const posX = Math.floor(Math.random() * window.innerWidth);
    const delay = Math.random() * -20;
    const duration = Math.random() * 5 + 3; // Slower fall than rain

    flake.style.left = posX + 'px';
    flake.style.width = size + 'px';
    flake.style.height = size + 'px';
    flake.style.animationDelay = delay + 's';
    flake.style.animationDuration = duration + 's';

    snowContainer.appendChild(flake);

    setTimeout(() => {
        flake.remove();
    }, duration * 1000);
}

  
function toggleRain() {
    const rainContainer = document.querySelector('.rain');
    const rainToggle = document.querySelector('#rainToggle');
    if (!window.rainAudio) {
        window.rainAudio = new Audio(rainSoundFx);
        window.rainAudio.volume = 0.5;
        window.rainAudio.loop = true;
    }

    if (rainToggle.classList.contains('dark-theme')) {
        console.info('❌🌧️');
        rainContainer.style.display = 'none';
        rainToggle.classList.remove('dark-theme');
        window.rainAudio?.pause();
        // Stop rain animation
        clearInterval(window.rainInterval);
        // Remove existing raindrops
        rainContainer.innerHTML = '';
    } else {
        console.info('🌧️🌧️');
        rainContainer.style.display = 'block';
        rainToggle.classList.add('dark-theme');
        window.rainAudio.play();

        // Start rain animation
        window.rainInterval = setInterval(createRain, 20);
    }
}

function toggleSnow() {
    const snowContainer = document.querySelector('.snow');
    const snowToggle = document.querySelector('#snowToggle');
    if (!window.snowAudio) {
        window.snowAudio = new Audio(snowSoundFx);
        window.snowAudio.volume = 0.5;
        window.snowAudio.loop = true;
    }

    if (snowToggle.classList.contains('dark-theme')) {
        console.info('❌☃️');
        snowContainer.style.display = 'none';
        snowToggle.classList.remove('dark-theme');
        window.snowAudio?.pause();
        // Stop rain animation
        clearInterval(window.snowInterval);
        // Remove existing raindrops
        snowContainer.innerHTML = '';
    } else {
        console.info('☃️☃️');
        snowContainer.style.display = 'block';
        snowToggle.classList.add('dark-theme');
        window.snowAudio.play();

        // Start rain animation
        window.snowInterval = setInterval(createSnow, 20);
    }
}

function toggleThunder() {
    const thunderToggle = document.querySelector('#thunderToggle');

    if (!window.thunderAudio) {
        window.thunderAudio = new Audio(thunderSoundFx);
        window.thunderAudio.volume = 0.6;
        window.thunderAudio.loop = true;
    }

    if (thunderToggle.classList.contains('dark-theme')) {
        console.info('❌⚡');
        thunderToggle.classList.remove('dark-theme');
        window.thunderAudio.pause();
    } else {
        console.info('⚡⚡');
        thunderToggle.classList.add('dark-theme');
        window.thunderAudio.play();
    }
}

function toggleFire() {
    const fireToggle = document.querySelector('#fireToggle');

    if (!window.fireAudio) {
        window.fireAudio = new Audio(burningWoodSoundFx);
        window.fireAudio.volume = 0.6;
        window.fireAudio.loop = true;
    }

    if (fireToggle.classList.contains('dark-theme')) {
        console.info('❌🔥');
        fireToggle.classList.remove('dark-theme');
        window.fireAudio.pause();
    } else {
        console.info('🔥🔥');
        fireToggle.classList.add('dark-theme');
        window.fireAudio.play();
    }
}

function toggleMoon() {
    const moonToggle = document.querySelector('#moonToggle');

    if (moonToggle.classList.contains('dark-theme')) {
        console.info('❌🌚');
        moonToggle.classList.remove('dark-theme');
        toggleTheme();
    } else {
        console.info('🌚🌚');
        moonToggle.classList.add('dark-theme');
        toggleTheme();
    }
}

function toggleWave() {
    const waveToggle = document.querySelector('#waveToggle');

    if (!window.waveAudio) {
        window.waveAudio = new Audio(wavesSoundFx);
        window.waveAudio.volume = 0.6;
        window.waveAudio.loop = true;
    }

    if (waveToggle.classList.contains('dark-theme')) {
        console.info('❌🌊');
        waveToggle.classList.remove('dark-theme');
        window.waveAudio.pause();
    } else {
        console.info('🌊🌊');
        waveToggle.classList.add('dark-theme');
        window.waveAudio.play();
    } 
}


function toggleTyping() {
    const typingToggle = document.querySelector('#typingToggle');

    if (!window.typingAudio) {
        window.typingAudio = new Audio(typingSoundFx);
        window.typingAudio.volume = 0.6;
        window.typingAudio.loop = true;
    }

    if (typingToggle.classList.contains('dark-theme')) {
        console.info('❌⌨️');
        typingToggle.classList.remove('dark-theme');
        window.typingAudio.pause();
    } else {
        console.info('⌨️⌨️');
        typingToggle.classList.add('dark-theme');
        window.typingAudio.play();
    }
}

function toggleCafe() {
    const cafeToggle = document.querySelector('#cafeToggle');

    if (!window.cafeAudio) {
        window.cafeAudio = new Audio(cafeSoundFx);
        window.cafeAudio.volume = 0.7;
        window.cafeAudio.loop = true;
    }

    if (cafeToggle.classList.contains('dark-theme')) {
        console.info('❌☕');
        cafeToggle.classList.remove('dark-theme');
        window.cafeAudio.pause();
    } else {
        console.info('☕️☕️');
        cafeToggle.classList.add('dark-theme');
        window.cafeAudio.play();
    }
}

function toggleOffice() {
    const officeToggle = document.querySelector('#officeToggle');

    if (!window.officeAudio) {
        window.officeAudio = new Audio(officeSoundFx);
        window.officeAudio.volume = 0.7;
        window.officeAudio.loop = true;
    }

    if (officeToggle.classList.contains('dark-theme')) {
        console.info('❌💼');
        officeToggle.classList.remove('dark-theme');
        window.officeAudio.pause();
    } else {
        console.info('💼💼');
        officeToggle.classList.add('dark-theme');
        window.officeAudio.play();
    }
}



// Start the timer immediately
window.onload = async function() {
    // Request Notification permission
    if ("Notification" in window && Notification.permission !== "denied") {
        Notification.requestPermission();
    }

    // Setup Volume Listeners
    ['sun', 'rain', 'snow', 'typing', 'cafe', 'office', 'thunder', 'fire', 'wave'].forEach(fx => {
        const slider = document.getElementById(`${fx}Volume`);
        if (slider) {
            slider.addEventListener('input', (e) => {
                if (window[`${fx}Audio`]) {
                    window[`${fx}Audio`].volume = parseFloat(e.target.value);
                }
            });
        }
    });

    loadAccomplishments();
    
    const savedAudio = localStorage.getItem('selectedAudio');
    if (savedAudio) {
        document.querySelector('#audioSourceDropdown').value = savedAudio;
        changeAudioSource();
    } else {
        playRandomAudio();
    }
    
    const savedTimer = localStorage.getItem('timerSeconds');
    if (savedTimer) {
        const t = parseInt(savedTimer);
        document.querySelector('#custom-hours').value = Math.floor(t / 3600);
        document.querySelector('#custom-minutes').value = Math.floor((t % 3600) / 60);
        document.querySelector('#custom-seconds').value = t % 60;
        customizeTimer();
    } else {
        resetTimer();
    }
};
