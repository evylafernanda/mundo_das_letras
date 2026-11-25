const $ = (id) => document.getElementById(id);
const STORAGE_KEY = "mundoDasLetras_v1";
const state = { stars: 0, completed: [], letterSelections: 0, syllableDone: false, wordDone: [], sentenceDone: false, huntDone: 0, memoryDone: false };
function loadState() { try { const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)); if (saved) Object.assign(state, saved) } catch (e) { } }
function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); updateProgress() }
function toast(message) { const el = $("toast"); el.textContent = message; el.classList.add("show"); clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove("show"), 2300) }
function award(key, amount = 1) { if (state.completed.includes(key)) return; state.completed.push(key); state.stars += amount; saveState(); toast("Muito bem! Você ganhou uma estrela! ⭐") }
function speak(text) { if (!("speechSynthesis" in window)) { toast("A leitura em voz alta não está disponível neste navegador."); return } if (!$('voiceEnabled').checked) return; window.speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(text); utterance.lang = "pt-BR"; utterance.rate = .86; utterance.pitch = 1.05; const voices = window.speechSynthesis.getVoices(); utterance.voice = voices.find(voice => /^pt-BR$/i.test(voice.lang)) || voices.find(voice => /^pt(-|$)/i.test(voice.lang)) || null; window.speechSynthesis.speak(utterance) }
function updateProgress() { const done = state.completed.length; const total = 8; const percent = Math.min(100, Math.round(done / total * 100)); $("starCount").textContent = state.stars; $("totalStars").textContent = state.stars; $("activitiesDone").textContent = done; $("progressFill").style.width = percent + "%"; $("progressPercent").textContent = percent + "%"; $("streakText").textContent = done ? "Você está aprendendo!" : "Vamos começar!"; const badges = []; if (state.stars >= 1) badges.push("⭐ Primeira estrela"); if (state.letterSelections >= 5) badges.push("🔤 Amigo das letras"); if (state.syllableDone) badges.push("🧩 Mestre das sílabas"); if (state.wordDone.length >= 3) badges.push("💬 Caçador de palavras"); if (state.sentenceDone) badges.push("📖 Criador de frases"); if (state.memoryDone) badges.push("🧠 Boa memória"); $("achievements").innerHTML = badges.length ? badges.map(x => `<span class="achievement">${x}</span>`).join("") : "<p>Conclua atividades para ganhar suas primeiras estrelas!</p>" }
const letters = [["A", "Abelha", "🐝"], ["B", "Bola", "⚽"], ["C", "Casa", "🏠"], ["D", "Dado", "🎲"], ["E", "Elefante", "🐘"], ["F", "Flor", "🌸"], ["G", "Gato", "🐱"], ["H", "Helicóptero", "🚁"], ["I", "Igreja", "⛪"], ["J", "Janela", "🪟"], ["K", "Kiwi", "🥝"], ["L", "Lua", "🌙"], ["M", "Macaco", "🐵"], ["N", "Navio", "🚢"], ["O", "Ovo", "🥚"], ["P", "Pato", "🦆"], ["Q", "Queijo", "🧀"], ["R", "Rato", "🐭"], ["S", "Sol", "☀️"], ["T", "Tatu", "🦔"], ["U", "Uva", "🍇"], ["V", "Vaca", "🐮"], ["W", "Waffle", "🧇"], ["X", "Xícara", "☕"], ["Y", "Yoga", "🧘"], ["Z", "Zebra", "🦓"]];
const letterNames = ["A", "bê", "cê", "dê", "ê", "éfe", "gê", "agá", "i", "jota", "cá", "éle", "eme", "ene", "ó", "pê", "quê", "érre", "ésse", "tê", "u", "vê", "dáblio", "xis", "ípsilon", "zê"];
function spokenLetter(letter) { return letterNames[letter.charCodeAt(0) - 65] || letter }
function initAlphabet() { const grid = $("letterGrid"); letters.forEach(([l, w, emoji]) => { const b = document.createElement("button"); b.className = "letter-tile " + ("AEIOU".includes(l) ? "vowel" : ""); b.textContent = l; b.setAttribute("aria-label", `Letra ${l}`); b.addEventListener("click", () => { document.querySelectorAll(".letter-tile").forEach(x => x.classList.remove("selected")); b.classList.add("selected"); const phrase = `${spokenLetter(l)} de ${w}`; $("letterDetail").querySelector(".big-letter").textContent = l; $("letterDetail").querySelector("h3").textContent = `${l} de ${w}`; $("letterDetail").querySelector("p").textContent = `A letra ${l} começa a palavra ${w}. Vamos falar juntos: ${spokenLetter(l)}!`; $("letterDetail").querySelector(".activity-art").textContent = emoji; $("letterDetail").querySelector("[data-speak]").dataset.speak = phrase; speak(phrase); state.letterSelections++; if (state.letterSelections >= 5) award("alphabet", 2); else saveState() }); grid.appendChild(b) }) }
$("speakAlphabet").addEventListener("click", () => speak("Vamos conhecer o alfabeto: " + letters.map(([letter]) => spokenLetter(letter)).join(", ")));
document.addEventListener("click", e => { const btn = e.target.closest("[data-speak]"); if (btn) speak(btn.dataset.speak) });
const syllableRounds = [{ word: "SAPO", emoji: "🐸", parts: ["SA", "PO"], options: ["PO", "SA", "MA"] }, { word: "BOLA", emoji: "⚽", parts: ["BO", "LA"], options: ["LA", "BO", "TA"] }, { word: "CASA", emoji: "🏠", parts: ["CA", "SA"], options: ["SA", "CA", "PA"] }]; let syllableRound = 0, syllablePicked = [];
function renderSyllables() { const round = syllableRounds[syllableRound % syllableRounds.length]; syllablePicked = []; $("syllablePicture").textContent = round.emoji; $("syllablePicture").setAttribute("aria-label", `Figura de ${round.word.toLowerCase()}`); $("syllableAnswer").innerHTML = '<span class="placeholder">Escolha as sílabas abaixo</span>'; $("syllableFeedback").textContent = ""; $("syllableOptions").innerHTML = "";[...round.options].sort(() => Math.random() - .5).forEach(part => { const b = document.createElement("button"); b.className = "syllable-chip"; b.textContent = part; b.addEventListener("click", () => { if (b.disabled) return; syllablePicked.push(part); b.disabled = true; renderSyllableAnswer(); speak(part) }); $("syllableOptions").appendChild(b) }) }
function renderSyllableAnswer() { $("syllableAnswer").innerHTML = syllablePicked.length ? syllablePicked.map(x => `<span class="answer-chip">${x}</span>`).join("") : '<span class="placeholder">Escolha as sílabas abaixo</span>' }
$("resetSyllables").addEventListener("click", renderSyllables); $("checkSyllables").addEventListener("click", () => { const r = syllableRounds[syllableRound % syllableRounds.length]; if (syllablePicked.join("") === r.word) { $("syllableFeedback").textContent = `Isso mesmo! Você formou ${r.word}! 🎉`; $("syllableFeedback").className = "feedback"; state.syllableDone = true; award("syllables", 1); speak(r.word); syllableRound++; setTimeout(renderSyllables, 1500) } else { $("syllableFeedback").textContent = "Quase! Tente outra vez. Dica: fale cada pedacinho."; $("syllableFeedback").className = "feedback error"; speak("Tente outra vez, sem pressa") } });

const wordRounds = [{ emoji: "🍌", answer: "BANANA", choices: ["BANANA", "BOLA", "CASA"] }, { emoji: "🐱", answer: "GATO", choices: ["PATO", "GATO", "RATO"] }, { emoji: "☀️", answer: "SOL", choices: ["LUA", "FLOR", "SOL"] }, { emoji: "🏠", answer: "CASA", choices: ["CASA", "MESA", "BOLA"] }, { emoji: "🐶", answer: "CACHORRO", choices: ["GATO", "CAVALO", "CACHORRO"] }]; let wordIndex = 0;
function renderWord() { const r = wordRounds[wordIndex % wordRounds.length]; $("wordPicture").textContent = r.emoji; $("wordFeedback").textContent = ""; $("wordChoices").innerHTML = ""; r.choices.forEach(word => { const b = document.createElement("button"); b.className = "choice-button"; b.textContent = word; b.addEventListener("click", () => { if (b.dataset.done) return; document.querySelectorAll(".choice-button").forEach(x => x.disabled = true); if (word === r.answer) { b.classList.add("correct"); $("wordFeedback").textContent = "Muito bem! Você acertou! ⭐"; $("wordFeedback").className = "feedback"; state.wordDone.push(wordIndex); award("word-" + wordIndex); speak(word) } else { b.classList.add("wrong"); $("wordFeedback").textContent = "Não foi dessa vez. Vamos tentar a próxima!"; $("wordFeedback").className = "feedback error"; speak("Vamos tentar novamente") } }); $("wordChoices").appendChild(b) }) }
$("nextWord").addEventListener("click", () => { wordIndex++; renderWord() });

const sentenceRounds = [{ correct: ["O", "GATO", "DORME"], words: ["DORME", "O", "GATO"] }, { correct: ["A", "MENINA", "SORRI"], words: ["SORRI", "A", "MENINA"] }, { correct: ["EU", "GOSTO", "DE", "LIVROS"], words: ["DE", "LIVROS", "EU", "GOSTO"] }]; let sentenceIndex = 0, sentencePicked = [];
function renderSentence() { const r = sentenceRounds[sentenceIndex % sentenceRounds.length]; sentencePicked = []; $("sentenceAnswer").innerHTML = '<span class="placeholder">Sua frase aparecerá aqui</span>'; $("sentenceFeedback").textContent = ""; $("sentenceBank").innerHTML = "";[...r.words].sort(() => Math.random() - .5).forEach(word => { const b = document.createElement("button"); b.className = "bank-word"; b.textContent = word; b.addEventListener("click", () => { if (b.disabled) return; sentencePicked.push(word); b.disabled = true; $("sentenceAnswer").innerHTML = sentencePicked.map(x => `<span class="answer-chip">${x}</span>`).join(" "); speak(word) }); $("sentenceBank").appendChild(b) }) }
$("resetSentence").addEventListener("click", renderSentence); $("checkSentence").addEventListener("click", () => { const r = sentenceRounds[sentenceIndex % sentenceRounds.length]; if (sentencePicked.join("|") === r.correct.join("|")) { $("sentenceFeedback").textContent = "Parabéns! A frase está certinha! 🎉"; $("sentenceFeedback").className = "feedback"; state.sentenceDone = true; award("sentence-" + sentenceIndex); speak(r.correct.join(" ")); sentenceIndex++; setTimeout(renderSentence, 1600) } else { $("sentenceFeedback").textContent = "Vamos organizar as palavras de novo. Você consegue!"; $("sentenceFeedback").className = "feedback error" } });

const huntLetters = ["M", "A", "S", "P", "B", "T", "L", "C"]; let huntTarget = "";
function newHunt() { huntTarget = huntLetters[Math.floor(Math.random() * huntLetters.length)]; $("huntQuestion").textContent = `Encontre a letra ${huntTarget}`; $("huntOptions").innerHTML = ""; const opts = [huntTarget, ...huntLetters.filter(x => x !== huntTarget).sort(() => Math.random() - .5).slice(0, 2)].sort(() => Math.random() - .5); opts.forEach(l => { const b = document.createElement("button"); b.textContent = l; b.setAttribute("aria-label", `Letra ${l}`); b.addEventListener("click", () => { if (l === huntTarget) { $("huntFeedback").textContent = "Acertou! Você encontrou a letra! ⭐"; $("huntFeedback").className = "feedback"; state.huntDone++; award("hunt-" + state.huntDone); speak("Muito bem! Letra " + l) } else { $("huntFeedback").textContent = "Tente mais uma vez. Procure com calma."; $("huntFeedback").className = "feedback error" } }); $("huntOptions").appendChild(b) }); $("huntFeedback").textContent = "" }
$("newHunt").addEventListener("click", newHunt);

const memoryEmojis = ["🐶", "🍎", "⚽", "🌞"]; let memoryCards = [], memoryOpen = [], memoryLock = false, memoryMatches = 0;
function startMemory() { memoryCards = [...memoryEmojis, ...memoryEmojis].sort(() => Math.random() - .5); memoryOpen = []; memoryLock = false; memoryMatches = 0; $("memoryFeedback").textContent = "Encontre todos os pares!"; $("memoryGrid").innerHTML = ""; memoryCards.forEach((emoji, i) => { const b = document.createElement("button"); b.className = "memory-card"; b.textContent = "?"; b.setAttribute("aria-label", "Carta fechada"); b.dataset.index = i; b.addEventListener("click", () => flipMemory(b, emoji)); $("memoryGrid").appendChild(b) }) }
function flipMemory(btn, emoji) { if (memoryLock || btn.classList.contains("matched") || memoryOpen.some(x => x.btn === btn)) return; btn.textContent = emoji; btn.classList.add("flipped"); btn.setAttribute("aria-label", emoji); memoryOpen.push({ btn, emoji }); speak(emoji); if (memoryOpen.length === 2) { if (memoryOpen[0].emoji === memoryOpen[1].emoji) { memoryOpen.forEach(x => x.btn.classList.add("matched")); memoryOpen = []; memoryMatches++; if (memoryMatches === 4) { $("memoryFeedback").textContent = "Você encontrou todos os pares! Que memória incrível!"; state.memoryDone = true; award("memory", 2) } } else { memoryLock = true; setTimeout(() => { memoryOpen.forEach(x => { x.btn.textContent = "?"; x.btn.classList.remove("flipped"); x.btn.setAttribute("aria-label", "Carta fechada") }); memoryOpen = []; memoryLock = false }, 900) } } }
$("restartMemory").addEventListener("click", startMemory);

$("openAccessibility").addEventListener("click", () => $("accessibilityDialog").showModal()); $("closeAccessibility").addEventListener("click", () => $("accessibilityDialog").close());
function applySettings() { document.body.classList.toggle("large-text", $("largeText").checked); document.body.classList.toggle("high-contrast", $("highContrast").checked); document.body.classList.toggle("reduce-motion", $("reduceMotion").checked) }
["largeText", "highContrast", "reduceMotion"].forEach(id => $(id).addEventListener("change", applySettings));
$("testVoice").addEventListener("click", () => speak("Olá! Bem-vindo ao Mundo das Letras. Você aprende no seu ritmo."));
function openLearningView(id) {
    const section = document.getElementById(id);
    if (!section || !section.classList.contains("learning-section")) return false;
    document.querySelectorAll(".learning-section").forEach(item => item.classList.toggle("active", item === section));
    document.body.classList.add("activity-view");
    document.querySelectorAll(".nav-link").forEach(link => link.classList.toggle("active", link.getAttribute("href") === `#${id}`));
    history.replaceState(null, "", `#${id}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
    return true;
}

document.querySelectorAll(".learning-section").forEach(section => {
    const back = document.createElement("button");
    back.className = "button secondary small back-to-path";
    back.type = "button";
    back.textContent = "← Voltar às trilhas";
    back.addEventListener("click", () => {
        document.body.classList.remove("activity-view");
        section.classList.remove("active");
        history.replaceState(null, "", "#inicio");
        document.querySelectorAll(".nav-link").forEach(link => link.classList.toggle("active", link.getAttribute("href") === "#inicio"));
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
    section.prepend(back);
});

document.addEventListener("click", event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute("href").slice(1);
    if (id === "inicio") {
        event.preventDefault();
        document.body.classList.remove("activity-view");
        document.querySelectorAll(".learning-section").forEach(item => item.classList.remove("active"));
        history.replaceState(null, "", "#inicio");
        document.querySelectorAll(".nav-link").forEach(item => item.classList.toggle("active", item.getAttribute("href") === "#inicio"));
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
    }
    if (!openLearningView(id)) return;
    event.preventDefault();
    document.querySelector("#mainNav").classList.remove("open");
    $("menuToggle").setAttribute("aria-expanded", "false");
});

$("continueButton").addEventListener("click", () => {
    const target = state.completed.includes("alphabet") ? "silabas" : state.completed.includes("syllables") ? "palavras" : "alfabeto";
    openLearningView(target);
});
$("resetProgress").addEventListener("click", () => { if (confirm("Quer mesmo apagar suas estrelas e reiniciar o progresso?")) { Object.assign(state, { stars: 0, completed: [], letterSelections: 0, syllableDone: false, wordDone: [], sentenceDone: false, huntDone: 0, memoryDone: false }); saveState(); toast("Seu progresso foi reiniciado.") } });
$("menuToggle").addEventListener("click", () => { const nav = $("mainNav"), open = nav.classList.toggle("open"); $("menuToggle").setAttribute("aria-expanded", String(open)) });
document.querySelectorAll(".nav-link").forEach(link => link.addEventListener("click", () => { $("mainNav").classList.remove("open"); $("menuToggle").setAttribute("aria-expanded", "false") }));
loadState(); initAlphabet(); renderSyllables(); renderWord(); renderSentence(); newHunt(); startMemory(); updateProgress();
