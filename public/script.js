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
'https://cdn.uppbeat.io/audio-files/9fea0ae6cc0c520f6b25e8c40681e539/8ea714519bc0db57778367e7ced03193/859d311171e4c1bc8dde64726ed73bc5/STREAMING-blue-was-brightest-haquin-main-version-16924-02-12.mp3',
'https://t4.bcbits.com/stream/8c775e4fe8dcfaa41ea06cb28d492b24/mp3-128/3735348463?p=0&ts=1723929576&t=eef43c124be6c751d3610aa72b335eadb034a49c&token=1723929576_f3e39563967940bec80c56595b0804294f7c9b55' // ToDO: this one has copyright concern, remove if wish to publish
];

const completeSoundFx = 'https://cdn.uppbeat.io/audio-files/d927511931994ce45cf5b95b34e23536/b8acdddc6e37f6b47b0057dbaf3b53af/9c3ce15f497635d0c185b92d34ce902c/STREAMING-level-complete-winner-piano-om-fx-1-00-06.mp3';

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
    .catch((error) => console.error("Error loading JSON file", error));
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
    if (confirm(`Are you sure you want to delete this accomplishment?\n\n"${accomplishment.text}"`)) {
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
    if (confirm("Are you sure you want to clear all accomplishments? This action cannot be undone.")) {
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
    document.getElementById('timer').textContent = "00:25:00";
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
            alert("Please enter a valid time greater than 0 seconds.");
        }
    } else {
        alert("Please enter valid positive numbers for hours, minutes, and seconds.");
    }
}

function formatTime(hours, minutes, seconds) {
    return [hours, minutes, seconds]
      .map(v => v < 10 ? "0" + v : v)
      .join(":");
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

function playRandomAudio() {
    const randomSource = audioSources[Math.floor(Math.random() * audioSources.length)];
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
        const currentIndex = audioSources.indexOf(window.audioPlayer.src);
        const newIndex = (currentIndex - 1 + audioSources.length) % audioSources.length;
        window.audioPlayer.src = audioSources[newIndex];
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
        const currentIndex = audioSources.indexOf(window.audioPlayer.src);
        const newIndex = (currentIndex + 1) % audioSources.length;
        window.audioPlayer.src = audioSources[newIndex];
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


// Start the timer immediately
window.onload = async function() {
    loadAccomplishments();
    playRandomAudio();
    resetTimer();
};
