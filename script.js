import musicList from "./assets/musicList.js";

document.addEventListener("DOMContentLoaded", function () {
	// DOM element references
	const elements = {
		musicProfile: document.querySelector(".music-profile img"),
		songName: document.querySelector(".song-name"),
		artistName: document.querySelector(".artist-name"),
		timeline: document.querySelector(".timeline input"),
		playBtn: document.querySelector(".ply-btn"),
		nextBtn: document.querySelector(".nxt-btn"),
		prevBtn: document.querySelector(".prv-btn"),
		shuffleBtn: document.querySelector(".shf-btn"),
		repeatBtn: document.querySelector(".rep-btn"),
		audio: new Audio(),
	};

	// Player state management
	const state = {
		currentTrackIndex: 0,
		isPlaying: false,
		isShuffled: false,
		isRepeated: false,
		shuffledOrder: [],
	};

	// Load and play a track by index
	function loadTrack(index) {
		if (index < 0 || index >= musicList.length) return;

		const track = musicList[index];
		elements.audio.src = track.audio;

		elements.audio.onerror = () => {
			console.error(`Failed to load audio source: ${track.audio}`);
			alert(
				`The audio file for "${track.title}" could not be loaded.`
			);
		};

		state.currentTrackIndex = index;

		updatePlayerInfo(track);

		if (state.isPlaying) {
			elements.audio
				.play()
				.then(() => updatePlayButton())
				.catch((e) => console.error("Playback failed:", e));
		}
	}

	// Update UI with track details
	function updatePlayerInfo(track) {
		elements.musicProfile.src = track.cover;
		elements.musicProfile.alt = `${track.title} album cover`;
		elements.songName.textContent = track.title;
		elements.artistName.textContent = track.artist;
		elements.timeline.value = 0;
	}

	// Toggle play/pause functionality
	function togglePlay() {
		if (state.isPlaying) {
			elements.audio.pause();
		} else {
			elements.audio
				.play()
				.then(() => updatePlayButton())
				.catch((e) => console.error("Playback failed:", e));
		}
		state.isPlaying = !state.isPlaying;
		updatePlayButton();
	}

	// Update play button icon based on state
	function updatePlayButton() {
		const playIcon = elements.playBtn.querySelector("svg path");
		playIcon.setAttribute(
			"d",
			state.isPlaying
				? "M48 64C21.5 64 0 85.5 0 112V400c0 26.5 21.5 48 48 48H80c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zm192 0c-26.5 0-48 21.5-48 48V400c0 26.5 21.5 48 48 48h32c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H240z"
				: "M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80L0 432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"
		);
	}

	// Play the next track
	function next() {
		let nextIndex;

		if (state.isShuffled && state.shuffledOrder.length > 0) {
			const currentShuffleIndex = state.shuffledOrder.indexOf(
				state.currentTrackIndex
			);
			nextIndex =
				state.shuffledOrder[
					(currentShuffleIndex + 1) % state.shuffledOrder.length
				];
		} else {
			nextIndex = (state.currentTrackIndex + 1) % musicList.length;
		}

		loadTrack(nextIndex);
	}

	// Play the previous track
	function prev() {
		if (elements.audio.currentTime > 3) {
			elements.audio.currentTime = 0;
		} else {
			let prevIndex;

			if (state.isShuffled && state.shuffledOrder.length > 0) {
				const currentShuffleIndex = state.shuffledOrder.indexOf(
					state.currentTrackIndex
				);
				prevIndex =
					state.shuffledOrder[
						(currentShuffleIndex -
							1 +
							state.shuffledOrder.length) %
							state.shuffledOrder.length
					];
			} else {
				prevIndex =
					(state.currentTrackIndex - 1 + musicList.length) %
					musicList.length;
			}

			loadTrack(prevIndex);
		}
	}

	// Toggle shuffle mode and update order
	function toggleShuffle() {
		state.isShuffled = !state.isShuffled;

		if (state.isShuffled) {
			generateShuffledOrder();
		}

		updateShuffleButton();
	}

	// Generate a shuffled track order
	function generateShuffledOrder() {
		state.shuffledOrder = [...Array(musicList.length).keys()];

		for (let i = state.shuffledOrder.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[state.shuffledOrder[i], state.shuffledOrder[j]] = [
				state.shuffledOrder[j],
				state.shuffledOrder[i],
			];
		}

		if (state.isPlaying) {
			const currentIndex = state.shuffledOrder.indexOf(
				state.currentTrackIndex
			);
			if (currentIndex !== -1) {
				[
					state.shuffledOrder[0],
					state.shuffledOrder[currentIndex],
				] = [
					state.shuffledOrder[currentIndex],
					state.shuffledOrder[0],
				];
			}
		}
	}

	// Update shuffle button icon
	function updateShuffleButton() {
		const shuffleIcon = elements.shuffleBtn.querySelector("svg path");
		shuffleIcon.setAttribute(
			"fill",
			state.isShuffled ? "#f04b45" : "#072833"
		);
	}

	// Toggle repeat mode
	function toggleRepeat() {
		state.isRepeated = !state.isRepeated;
		elements.audio.loop = state.isRepeated;
		updateRepeatButton();
	}

	// Update repeat button icon
	function updateRepeatButton() {
		const repeatIcon = elements.repeatBtn.querySelector("svg path");
		repeatIcon.setAttribute(
			"fill",
			state.isRepeated ? "#f04b45" : "#072833"
		);
	}

	// Update timeline progress bar
	function updateTimeline() {
		if (elements.audio.duration) {
			const percentage =
				(elements.audio.currentTime / elements.audio.duration) *
				100;
			elements.timeline.value = percentage;
		}

		if (!elements.audio.ended && state.isPlaying) {
			requestAnimationFrame(updateTimeline);
		}
	}

	// Handle timeline seek functionality
	function handleTimelineChange() {
		const seekTime =
			(elements.timeline.value / 100) * elements.audio.duration;
		elements.audio.currentTime = seekTime;
	}

	// Bind event listeners to controls
	function bindEvents() {
		elements.audio.addEventListener("ended", function () {
			if (state.isRepeated) {
				elements.audio.currentTime = 0;
				elements.audio.play();
			} else {
				next();
			}
		});

		elements.playBtn.addEventListener("click", togglePlay);
		elements.nextBtn.addEventListener("click", next);
		elements.prevBtn.addEventListener("click", prev);
		elements.shuffleBtn.addEventListener("click", toggleShuffle);
		elements.repeatBtn.addEventListener("click", toggleRepeat);

		elements.timeline.addEventListener("input", handleTimelineChange);
		elements.audio.addEventListener("timeupdate", function () {
			updateTimeline();
		});
	}

	// Initialize the music player
	function init() {
		bindEvents();
		loadTrack(0);
		updateShuffleButton();
		updateRepeatButton();
	}

	init();
});
