// Global variables
let accomp = [];
let timerSeconds = 1500; // 25 minutes default
let timerInterval;
let isPaused = false;
let isLoop = false;
const audioSources = [
'https://cdn.pixabay.com/audio/2024/07/31/audio_ca7b04c1bd.mp3',
'https://cdn.uppbeat.io/audio-files/bd8b8d896868ba0f13070ce660e33d5e/d93ef703791aac925d15efcfe1d91999/59d54f73347de37fe034ad6e791c3446/STREAMING-fluff-qube-main-version-23976-01-55.mp3',
'https://cdn.uppbeat.io/audio-files/08653f6c4e0880f1e134bb2d18e7aa90/3a21fd662f93765b0a767e3a4474868c/e3adfc34b28a48a103719b25d11a4a0e/STREAMING-nu-day-kem-main-version-16727-05-05.mp3',
'https://cdn.uppbeat.io/audio-files/fd6f99da8569b8fae0e89b28891fc96a/aa8ef77b52cc5a658cee3f942b709c31/3ff37795df4cb998661c4d999ba28147/STREAMING-cold-brew-ra-main-version-29719-02-38.mp3',
'https://cdn.uppbeat.io/audio-files/feb0842d36ded48702cb4038d4bc3c09/9a9a9962343b6d9b4f3ba7ec6bae73bd/8ae423fc62a429eb68ebb995cbea7256/STREAMING-malibop-lloom-main-version-25577-03-18.mp3',
'https://cdn.uppbeat.io/audio-files/6dc9bc42bb6db2adb9da948c6d4cc319/2dcaae85d7d918f5bafdb5d64f9b46b1/96e779b9cdbd33944c95b64bd8244cd2/STREAMING-lonely-nights-yasumu-main-version-22495-02-12.mp3',
'https://cdn.uppbeat.io/audio-output/294/2384/main-version/streaming-previews/STREAMING-autumn-coffee-bosnow-main-version-02-16-8826.mp3',
'https://cdn.uppbeat.io/audio-files/d698e5b0e6235427c770929d50b27956/bb0b79902fa8b55a24297320841e8756/561f937b498f4936175671c711c43708/STREAMING-straight-chillin-braden-deal-main-version-26107-02-44.mp3',
'https://cdn.uppbeat.io/audio-files/95efc2c018c6c8d9e52ae87eb7af0395/5902e72d996e782018052268f98fc1c0/81e4f493a115ada138ff572cdd7590fb/STREAMING-midnight-glow-wooll-main-version-27378-02-40.mp3',
'https://cdn.uppbeat.io/audio-files/77c5e386047fdaa2fcd9971748957c4a/e0520c207248eb4b9ef9903ee92b58bf/420b276b5719c394fcafe0d0e321f70e/STREAMING-second-stop-cafe-auv-main-version-32211-02-34.mp3',
'https://cdn.uppbeat.io/audio-files/37f2dfeadea4a411cc6393845b6fb27d/c3e69905621dd45b29cb3f1a425d3006/95a2f61449548a76cfa2ac1b32be3c9b/STREAMING-moonlight-kidcut-main-version-17773-02-31.mp3',
'https://cdn.uppbeat.io/audio-files/4e7077eceba732f66703a46ca4df3c09/49831497be2da9408ae30a0bf4980a61/5213bc56fcaad0629cea1ad734c79b01/STREAMING-aurora-mum-child-main-version-17287-02-00.mp3',
'https://cdn.uppbeat.io/audio-files/4e7077eceba732f66703a46ca4df3c09/a777e8c8ce8f57dde9f4804aad6e8d56/29ea10cf12e16c49061e291ed999729b/STREAMING-sleeping-our-noons-away-mum-child-main-version-17274-02-05.mp3',
'https://cdn.uppbeat.io/audio-files/46731dd22c02a7edc7c194026cc94ae7/2cf03956ec654db8213f14ccaa86635c/593d9b5c48cb05588210eec5152ad584/STREAMING-levitating-indoors-yawnathan-main-version-28205-02-31.mp3',
'https://cdn.uppbeat.io/audio-files/4e7077eceba732f66703a46ca4df3c09/9ce76d6e17f6766516f41341a87b021d/29784ef530c6f144ccd8a814ecc6dd00/STREAMING-leaving-the-city-mum-child-main-version-17305-02-25.mp3',,
'https://cdn.uppbeat.io/audio-files/9fea0ae6cc0c520f6b25e8c40681e539/8ea714519bc0db57778367e7ced03193/859d311171e4c1bc8dde64726ed73bc5/STREAMING-blue-was-brightest-haquin-main-version-16924-02-12.mp3'
];

const ghibliInspiredSources = [
'https://cdn.uppbeat.io/audio-files/c4e5b95268bf111c59d7d9649ed5bd7d/6ac5b00245391cef7605fe3abb5db5be/161f25f0ee547beff777a77096be30bb/STREAMING-adrift-theo-gerard-main-version-25168-02-17.mp3',
'https://cdn.uppbeat.io/audio-files/7ca00d8b9e9088256e127670a0c823d2/b0ad7139aec2e38ef51522b1388288f7/856daa4ca00c049af8208d10e96a8238/STREAMING-elegy-of-the-heartstrings-studiokolomna-main-version-28963-02-04.mp3',
'https://cdn.uppbeat.io/audio-files/dea4043ccc3a0740a011ed2d8284ee82/2a82d95631c9e965831d48e9ae0d3e3e/a71ec0123bccee5d6cf5e9800675b245/STREAMING-this-time-around-oliver-massa-main-version-13816-01-33.mp3',
'https://cdn.uppbeat.io/audio-files/48c197ea701573c6a391cd76382175f7/89ec339b32a6a14bd25b978ce40b40f0/16f3bec4ca0f35d3c1564525e012cfe6/STREAMING-joie-de-vivre-albert-behar-main-version-17795-02-22.mp3',
'https://cdn.uppbeat.io/audio-files/859609878169b59906409378a56d244d/f9ef592e8ad0e03f53a820bace4e4b60/c687daa54ef9ff2a671e08b887e16fb9/STREAMING-adventure-theme-aaron-paul-low-main-version-25195-02-28.mp3',
'https://cdn.uppbeat.io/audio-files/ecb87cac8317887235872504e3bce04e/0b794230248a6277f702c8c20c643987/20dbb22a464080391991cda9f05fe970/STREAMING-kunisaki-jonathan-doherty-main-version-24768-03-55.mp3',
'https://cdn.uppbeat.io/audio-files/dea4043ccc3a0740a011ed2d8284ee82/74c4add261bd76c05de6192370545e70/c127f5e159acfc445aacc6fb9a0bdc04/STREAMING-all-good-things-oliver-massa-main-version-21725-03-38.mp3',
'https://cdn.uppbeat.io/audio-files/0e5573c69208594d8a7e799df2ff2bcc/92fc526b2427072d2a86c86f86e8dffb/99c36d46509f541231ad954617ce94f8/STREAMING-through-time-simon-folwar-main-version-33545-02-29.mp3',
'https://cdn.uppbeat.io/audio-files/6acf0e1e998166efd11dea1a992a0780/d26746f5f7e81ef1319f0b352f76c8fb/7a10ab538ce0b4166da3bc092d38c6b6/STREAMING-memories-jonny-easton-main-version-17339-03-22.mp3',
'https://cdn.uppbeat.io/audio-files/48c197ea701573c6a391cd76382175f7/749fd48e6ee93048c20c85fa580d6b1d/cd345e82b41c1eec7d3faf25a0e9a184/STREAMING-secret-garden-albert-behar-main-version-21829-01-06.mp3',
'https://cdn.uppbeat.io/audio-files/d86b5dc87412daa6133085b96040752d/21ee7e1ce15a3471604385a415aa29ff/b13102f2c09cfb1c712df78968b0060a/STREAMING-hundred-n-seven-ian-aisling-main-version-27022-02-56.mp3',
'https://cdn.uppbeat.io/audio-files/c4e5b95268bf111c59d7d9649ed5bd7d/703b9cc3d85649917a1e57a22eec4b37/b901a2e5716836d21f775c70f6438562/STREAMING-impressionist-theo-gerard-main-version-25167-00-47.mp3',
'https://cdn.uppbeat.io/audio-files/d86b5dc87412daa6133085b96040752d/5f19013b4aa070ac0179f22001c4ce40/e4991a959dfe88ba34ab57c521da2086/STREAMING-empty-moon-ian-aisling-main-version-24985-03-59.mp3',
'https://cdn.uppbeat.io/audio-files/a0cc5e822231d61becc96360f5e653b5/530b64bece37f9728003147f41aa918a/5a8a907ef0e4957ce6f4778a3e2ffe2c/STREAMING-old-street-ilya-kuznetsov-main-version-31500-02-41.mp3',
'https://cdn.uppbeat.io/audio-files/0e600bf393a5e1e897e195e258525c7a/9f576e52a1bae98c227e208bcfc72eda/b626f8c8253c5335bf727665e51cff93/STREAMING-dancing-on-top-of-clouds-morning-mist-main-version-23748-02-24.mp3',
'https://cdn.uppbeat.io/audio-files/c4e5b95268bf111c59d7d9649ed5bd7d/382dfa142e310fe45908c1342ab327d5/54b7b7ddef3d2d7644f7cedd3f90b249/STREAMING-pure-elegance-theo-gerard-main-version-25156-00-49.mp3',
'https://cdn.uppbeat.io/audio-files/be2a92d868444c66d14d59801a67ce1e/d4f51dbff238ea13282d9d324ad160eb/fa8778cb559976d40f7cce96ff541e6c/STREAMING-une-petite-promenade-jacob-armerding-main-version-23448-03-34.mp3',
'https://cdn.uppbeat.io/audio-files/d86b5dc87412daa6133085b96040752d/1bab071969b3d392fb924934291edb17/5a3b967ea47294a71d6f263f7f414521/STREAMING-glimpse-of-euphoria-ian-aisling-main-version-24763-01-39.mp3',
'https://cdn.uppbeat.io/audio-files/d86b5dc87412daa6133085b96040752d/42a807b6239424d2b571513731c0bc27/f81a2e192547a9465b3ed03ce8cd556b/STREAMING-gardenia-ian-aisling-main-version-24762-02-26.mp3'
];

const lazyLofiSources = [
'https://cdn.uppbeat.io/audio-files/9522211dcb40a5f6f421199a416268d2/489ebd7efd2c5d966ef63c0c0a1f89f2/8abb2d49069f14e2d1609e244bbd9709/STREAMING-waves-alexander-plam-main-version-16612-02-14.mp3',
'https://cdn.uppbeat.io/audio-files/9522211dcb40a5f6f421199a416268d2/4c4d88cc2695b6351065555eebc0dc54/f76b213826c2b9e4c6d04e0bb8bd693e/STREAMING-flutter-alexander-plam-main-version-16615-01-48.mp3',
'https://cdn.uppbeat.io/audio-files/1eaed6f18d69074e114db529f2bd7e46/73d70ecc8e926f8641b2e67524a794ae/c1bf0eaa535fa647814dfab584435744/STREAMING-your-love-is-what-i-need-soundroll-main-version-12292-03-37.mp3',
'https://cdn.uppbeat.io/audio-files/d9a4509e97bb95458a102098b25d49ab/6bd1a9977c427d6c5fda607a1b60f38e/72a8770e0bdf43299d044633b76d4008/STREAMING-late-night-yokonap-main-version-21262-02-32.mp3',
'https://cdn.uppbeat.io/audio-files/f54ab6f74b5438a7286ea064f94b7d81/682580d811727bd2d4e8e06e77173e1f/1be0b246b40e631f1396886ccf1e73de/STREAMING-sunny-morning-avbe-main-version-18772-03-29.mp3',
'https://cdn.uppbeat.io/audio-files/9fea0ae6cc0c520f6b25e8c40681e539/e1a24a54815caffe770dbeee2e670ef5/168eb3eae2984621a126bd2ede3edb64/STREAMING-slumber-haquin-main-version-16915-01-59.mp3',
'https://cdn.uppbeat.io/audio-files/46731dd22c02a7edc7c194026cc94ae7/41dad85985a7d1cfe51c356d3acac7bc/e593b1697e0477b257be83584a24e440/STREAMING-weightless-evening-yawnathan-main-version-25835-03-04.mp3',
'https://cdn.uppbeat.io/audio-files/dea4043ccc3a0740a011ed2d8284ee82/c5484a7ff8e9e5cf576f8c82ab4268e3/54964c5d42384263e9e62c00a997213f/STREAMING-satie-oliver-massa-main-version-13820-02-42.mp3',
'https://cdn.uppbeat.io/audio-files/9522211dcb40a5f6f421199a416268d2/ac9dd2e8e267dfe43aee49ab9dfb0773/81c385ad61259ae94b203bd2245c47b7/STREAMING-slowly-alexander-plam-main-version-16614-03-40.mp3',
'https://cdn.uppbeat.io/audio-files/b0a759f14be8e2cb5831ec764ec690dc/6a051ddb9bbb47994534bd4752914dea/3b8ac97d9ca4a47ddc44d6bdcdfd617c/STREAMING-black-coffee-all-good-folks-main-version-3878-01-19.mp3'
];

const completeSoundFx = 'https://cdn.uppbeat.io/audio-files/d927511931994ce45cf5b95b34e23536/b8acdddc6e37f6b47b0057dbaf3b53af/9c3ce15f497635d0c185b92d34ce902c/STREAMING-level-complete-winner-piano-om-fx-1-00-06.mp3';

// Reminder and Popup Functions
function showReminder() {
    document.getElementById('reminderPopup').style.display = 'block';
    window.audioPlayer.pause();
    resetTimer();
    // Play completion sound effect once
    const completionSound = new Audio(completeSoundFx);
    completionSound.play().then(() => {
        completionSound.remove(); // Remove the audio element after playing
    }).catch(error => {
        console.error('Error playing completion sound:', error);
    });
    // Disable interaction with other elements
    document.body.style.pointerEvents = 'none';
    document.getElementById('reminderPopup').style.pointerEvents = 'auto';

    // Add event listener to re-enable interactions when popup is closed
    document.getElementById('reminderPopup').querySelector('button').addEventListener('click', function() {
        document.body.style.pointerEvents = 'auto';
        document.getElementById('reminderPopup').style.display = 'none';
    }, { once: true });
}

// Accomplishment Functions
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

function submitAccomplishment() {
    const input = document.getElementById('accomplishmentInput');
    const accomplishment = input.value.trim();

    if (accomplishment) {
        const timestamp = new Date().toLocaleString();

        // First, let's create the data to be sent
        const newAccomplishment = {
        text: accomplishment,
        time: timestamp
        };
        
        // server side POST method
        fetch('/save-accomplishment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newAccomplishment),
        })
        .then(response => {
            console.log({response});
            response.json();
            accomp.push(newAccomplishment);
            updateAccomplishmentsList();
        })
        .catch((error) => {
            console.error('Error:', error);
        });
        input.value = '';
    }

    document.getElementById('reminderPopup').style.display = 'none';
    resetTimer();
}

function updateAccomplishmentsList() {
    const list = document.getElementById('accomplishmentsList');
    list.innerHTML = '';
    accomp.forEach((item, index) => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${item.time}</span>: ${item.text}`;
        
        const deleteButton = document.createElement('button');
        deleteButton.id = 'accompDelete';
        deleteButton.textContent = 'Delete';
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

function showManualAccomplishment() {
    showReminder();
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
    a.download = 'accomplishments.json';
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
        document.getElementById('timer').textContent = timeString;
    }
}

function resetTimer() {
    clearInterval(timerInterval);
    timerSeconds = 1500; // Reset to 1 hour
    document.getElementById('timer').textContent = '00:25:00';
    document.getElementById('custom-hours').value = 0;
    document.getElementById('custom-minutes').value = 25;
    document.getElementById('custom-seconds').value = 0;

    isPaused = true;
    window.audioPlayer.pause();
    document.getElementById('pauseResume').textContent = 'Play';
    document.getElementById('playPauseIcon').className = 'fa fa-play';
    timerInterval = setInterval(updateTimer, 1000);
}

function customizeTimer() {
    const hours = parseInt(document.getElementById('custom-hours').value) || 0;
    const minutes = parseInt(document.getElementById('custom-minutes').value) || 0;
    const seconds = parseInt(document.getElementById('custom-seconds').value) || 0;

    if (hours >= 0 && minutes >= 0 && seconds >= 0) {
        timerSeconds = hours * 3600 + minutes * 60 + seconds;
        if (timerSeconds > 0) {
            clearInterval(timerInterval);
            timerInterval = setInterval(updateTimer, 1000);
            // isPaused = false;
            document.getElementById('pauseResume').textContent = 'Play';
            document.getElementById('playPauseIcon').className = 'fas fa-play';
            document.getElementById('timer').textContent = `${formatTime(hours,minutes,seconds)}`;
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
    document.getElementById('pauseResume').textContent = isPaused ? 'Play' : 'Pause';
    if (isPaused && window.audioPlayer) {
        window.audioPlayer.pause();
        document.getElementById('playPauseIcon').className = 'fas fa-play';
    } else if (!isPaused && window.audioPlayer) {
        window.audioPlayer.play().catch(error => {
            console.error('Error resuming audio:', error);
        });
        document.getElementById('playPauseIcon').className = 'fas fa-pause';
    }
}

// Audio Functions
function playRandomAudio() {
    const randomSource = lazyLofiSources[Math.floor(Math.random() * lazyLofiSources.length)];
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
    window.audioPlayer.volume = 1.0; // 100% volume
}

function previousTrack() {
    if (window.audioPlayer) {
        const currentIndex = lazyLofiSources.indexOf(window.audioPlayer.src);
        const newIndex = (currentIndex - 1 + lazyLofiSources.length) % lazyLofiSources.length;
        window.audioPlayer.src = lazyLofiSources[newIndex];
        window.audioPlayer.play()
        .then(()=> {
            document.getElementById('playPauseIcon').className = 'fas fa-pause';
            isPaused = false;
        })
        .catch(error => {
            console.error('Error playing previous track:', error);
        });
    }
}

function nextTrack() {
    if (window.audioPlayer) {
        const currentIndex = lazyLofiSources.indexOf(window.audioPlayer.src);
        const newIndex = (currentIndex + 1) % lazyLofiSources.length;
        window.audioPlayer.src = lazyLofiSources[newIndex];
        window.audioPlayer.play()
        .then(()=> {
            document.getElementById('playPauseIcon').className = 'fas fa-pause';
            isPaused = false;
        })
        .catch(error => {
            console.error('Error playing next track:', error);
        });
    }
}

function toggleLoop() {    
    console.log(`Toggling loop to ${!isLoop}`);
    if (window.audioPlayer) {
        isLoop = !isLoop;
        window.audioPlayer.loop = isLoop;  // Fixed: Set the loop property of audioPlayer
        const loopToggleButton = document.getElementById('loopToggle');
        if (isLoop) {
            loopToggleButton.classList.add('dark-theme');
        } else {
            loopToggleButton.classList.remove('dark-theme');
        }
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


// Start the timer immediately
window.onload = async function() {
    loadAccomplishments();
    playRandomAudio();
    resetTimer();
    setInterval(createRain, 20);
};
