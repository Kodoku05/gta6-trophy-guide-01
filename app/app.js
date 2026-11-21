// Keep this key stable so a refreshed guide retains the browser's earned IDs.
const STORAGE_KEY = 'leonida-field-guide-progress-v1';
const DATA_PATH = 'data/trophies.json';
const STAGES = [
  { number: 1, title: 'Protect the one-time window', text: 'During Chapter 1, take Lucia’s optional meditation at Jason’s house after Down to Earth. It is the only potentially missable trophy safeguard in the roadmap.' },
  { number: 2, title: 'Play the main story', text: 'Clear the named mission and chapter trophies as they arrive. Keep rotating manual saves; the game has no mission replay.' },
  { number: 3, title: 'Build progress on the way', text: 'Try new activities, scan vehicles, and take on open-world tasks as they appear. Anything left can be revisited later.' },
  { number: 4, title: 'Finish strands & the 100% list', text: 'After the finale, use Progress → Stats → 100% Completion, then close out stranger strands and related tasks.' },
  { number: 5, title: 'Sweep the map', text: 'Use the counters for collectibles, races, challenges, discoveries, robberies, properties, and miscellaneous trophies.' },
  { number: 6, title: 'Claim the platinum', text: 'Earn the other 54 trophies and Vice Got a Price! unlocks automatically.' }
];
const $ = (selector, root = document) => root.querySelector(selector);
let trophies = [];
let earned = new Set();
let currentKind = 'all';
let currentGrade = 'all';
let searchTerm = '';
let hideStorySpoilers = false;

function loadProgress() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (Array.isArray(parsed)) earned = new Set(parsed.filter(id => Number.isInteger(id) && id > 0 && id <= 55));
  } catch {
    earned = new Set();
  }
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
  updateProgress();
  renderTrophies();
  renderRoadmap();
}

function updateProgress() {
  const count = earned.size;
  $('#earned-count').textContent = count;
  $('#remaining-count').textContent = 55 - count;
  $('#progress-percent').textContent = `${Math.round(count / 55 * 100)}%`;
  $('#progress-fill').style.width = `${count / 55 * 100}%`;
  $('.progress-track').setAttribute('aria-valuenow', count);
}

function gradeLabel(grade) {
  return grade[0].toUpperCase() + grade.slice(1);
}

function shouldHideStory(trophy) {
  return hideStorySpoilers && trophy.kind.includes('story') && !earned.has(trophy.id);
}

function matchesFilters(trophy) {
  if (currentKind === 'missable' && !trophy.missable) return false;
  if (currentKind !== 'all' && currentKind !== 'missable' && !trophy.kind.includes(currentKind)) return false;
  if (currentGrade !== 'all' && trophy.grade !== currentGrade) return false;
  const hidden = shouldHideStory(trophy);
  const searchable = hidden ? 'hidden story trophy story' : `${trophy.name} ${trophy.description} ${trophy.guide}`;
  return searchable.toLocaleLowerCase().includes(searchTerm);
}

function renderSources(sources) {
  return sources.map(source => `<a href="${source.url}" target="_blank" rel="noreferrer">${source.title}<span aria-hidden="true"> ↗</span></a>`).join('');
}

function renderTrophy(trophy) {
  const hidden = shouldHideStory(trophy);
  const checked = earned.has(trophy.id);
  const tags = trophy.kind.map(kind => `<span class="kind-tag kind-${kind}">${kind}</span>`).join('');
  const missable = trophy.missable ? '<span class="missable-flag"><i aria-hidden="true">!</i> Missable</span>' : '';
  return `<article class="trophy-card${checked ? ' is-earned' : ''}${trophy.missable ? ' has-missable' : ''}" id="trophy-${trophy.id}">
    <label class="earned-check" aria-label="Mark ${hidden ? 'hidden story trophy' : escapeHtml(trophy.name)} as earned"><input type="checkbox" data-earned-id="${trophy.id}" ${checked ? 'checked' : ''}><span aria-hidden="true"></span></label>
    <div class="card-main">
      <div class="card-topline"><span class="trophy-number">${String(trophy.id).padStart(2, '0')}</span>${tags}${missable}<span class="grade-pill grade-${trophy.grade}">${gradeLabel(trophy.grade)}</span></div>
      <h3>${hidden ? 'Hidden story trophy' : escapeHtml(trophy.name)}</h3>
      <p class="trophy-description">${hidden ? 'Earn this story trophy to reveal its details.' : escapeHtml(trophy.description)}</p>
      <details class="guide-details" ${trophy.id === 1 || trophy.id === 28 || new URLSearchParams(location.hash.slice(1)).get('trophy') === String(trophy.id) ? 'open' : ''}>
        <summary><span>Guide &amp; sources</span><span class="summary-cue">Read guide <b aria-hidden="true">＋</b></span></summary>
        <div class="guide-content"><p>${escapeHtml(trophy.guide)}</p><div class="source-list"><span class="source-label">SOURCES</span>${renderSources(trophy.sources)}</div></div>
      </details>
    </div>
  </article>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

function renderTrophies() {
  const filtered = trophies.filter(matchesFilters);
  $('#trophy-list').innerHTML = filtered.map(renderTrophy).join('');
  $('#visible-count').textContent = filtered.length;
  $('#empty-state').hidden = filtered.length > 0;
  $('#trophy-list').hidden = filtered.length === 0;
  $('#trophy-list').querySelectorAll('[data-earned-id]').forEach(input => input.addEventListener('change', () => {
    const id = Number(input.dataset.earnedId);
    if (input.checked) earned.add(id); else earned.delete(id);
    saveProgress();
  }));
}

function stageFor(trophy) {
  return STAGES.find(stage => stage.number === trophy.roadmap.stage);
}

function renderRoadmap() {
  $('#roadmap-list').innerHTML = STAGES.map(stage => {
    const items = trophies.filter(trophy => trophy.roadmap.stage === stage.number);
    return `<article class="roadmap-card stage-${stage.number}"><div class="stage-head"><span class="stage-number">0${stage.number}</span><span class="stage-rule"></span></div><h3>${stage.title}</h3><p>${stage.text}</p><div class="stage-trophies">${items.map(trophy => `<a href="#trophy=${trophy.id}" class="stage-trophy${trophy.missable ? ' stage-missable' : ''}">${trophy.missable ? '<i>!</i> ' : ''}${escapeHtml(trophy.name)}</a>`).join('')}</div></article>`;
  }).join('');
}

function applyHashState() {
  const params = new URLSearchParams(location.hash.slice(1));
  if (params.has('filter')) {
    const kind = params.get('filter');
    currentKind = ['story', 'missable', 'collectibles', 'activities'].includes(kind) ? kind : 'all';
    $('#kind-filter').value = currentKind;
  }
  if (params.has('spoiler')) {
    hideStorySpoilers = params.get('spoiler') === '1';
    $('#spoiler-toggle').checked = hideStorySpoilers;
  }
  const trophyId = Number(params.get('trophy'));
  const trophy = trophies.find(item => item.id === trophyId);
  renderTrophies();
  if (trophy) requestAnimationFrame(() => {
    const card = $(`#trophy-${trophyId}`);
    card?.scrollIntoView({ block: 'center', behavior: 'instant' });
    $('details', card)?.setAttribute('open', '');
  });
  if (params.has('roadmap') || location.hash === '#roadmap') requestAnimationFrame(() => $('#roadmap').scrollIntoView({ block: 'start', behavior: 'instant' }));
}

function exportProgress() {
  const payload = { title: 'Leonida Field Guide progress', version: 1, exportedAt: new Date().toISOString(), earned: [...earned].sort((a, b) => a - b) };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'leonida-trophy-progress.json';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showStatus('Progress exported to a JSON file.');
}

async function importProgress(file) {
  try {
    const payload = JSON.parse(await file.text());
    const values = Array.isArray(payload) ? payload : payload.earned;
    if (!Array.isArray(values) || values.some(id => !Number.isInteger(id) || id < 1 || id > 55)) throw new Error('Use a progress file with trophy IDs from 1 to 55.');
    earned = new Set(values);
    saveProgress();
    showStatus(`Imported ${earned.size} earned ${earned.size === 1 ? 'trophy' : 'trophies'}.`);
  } catch (error) {
    showStatus(error.message || 'That file could not be read as trophy progress.', true);
  }
}

function showStatus(message, isError = false) {
  const status = $('#status-message');
  status.textContent = message;
  status.classList.toggle('is-error', isError);
  clearTimeout(showStatus.timeout);
  showStatus.timeout = setTimeout(() => { status.textContent = ''; }, 4200);
}

function bindControls() {
  $('#search').addEventListener('input', event => { searchTerm = event.target.value.trim().toLocaleLowerCase(); renderTrophies(); });
  $('#kind-filter').addEventListener('change', event => { currentKind = event.target.value; renderTrophies(); });
  $('#grade-filter').addEventListener('change', event => { currentGrade = event.target.value; renderTrophies(); });
  $('#spoiler-toggle').addEventListener('change', event => { hideStorySpoilers = event.target.checked; renderTrophies(); });
  $('#export-button').addEventListener('click', exportProgress);
  $('#import-button').addEventListener('click', () => $('#import-file').click());
  $('#import-file').addEventListener('change', event => { if (event.target.files[0]) importProgress(event.target.files[0]); event.target.value = ''; });
  document.addEventListener('keydown', event => { if (event.key === '/' && !['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) { event.preventDefault(); $('#search').focus(); } });
}

async function startGuide() {
  loadProgress();
  bindControls();
  try {
    const response = await fetch(DATA_PATH);
    if (!response.ok) throw new Error(`Could not load trophy data (${response.status}).`);
    const data = await response.json();
    if (!Array.isArray(data.trophies) || data.trophies.length !== 55) throw new Error('The trophy list is incomplete.');
    trophies = data.trophies;
    updateProgress();
    renderRoadmap();
    applyHashState();
    window.addEventListener('hashchange', applyHashState);
  } catch (error) {
    $('#trophy-list').innerHTML = `<p class="load-error">${escapeHtml(error.message)} Open this page through <code>node serve.ts</code> so the local trophy data can load.</p>`;
  }
}

startGuide();
