const app = document.querySelector('#app');
const pausePanel = document.querySelector('#pause-panel');
const paths = [
  ['feelings', 'Releasing feelings', 'The three Sedona questions, one at a time.'],
  ['wants', 'Releasing wants', 'Guidance through the first three of the six steps.'],
  ['topics', 'Releasing by topics', 'Explore attachment and aversion around money, relationships and more.'],
  ['goals', 'Releasing goals', 'Read your goal and release the reactions it brings up.'],
  ['quick', 'Quick release', 'A single invitation to loosen your grip.']
];
const topicChoices = {
  money: 'having money', approval: 'receiving approval', relationships: 'being in a relationship',
  thinking: 'figuring things out', worrying: 'worrying', control: 'being in control',
  resistance: 'resisting', holding: 'holding on', letting: 'letting go'
};
let session = {};
let selectedWant = '';
let releasing = {};
let afterRelease;
let pausedControl;
let pending = false;

function escapeText(value) {
  return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}
function button(label, action, value = '', primary = false) {
  return `<button type="button" data-action="${action}" data-value="${escapeText(value)}" class="${primary ? 'primary' : ''}">${escapeText(label)}</button>`;
}
function render(html) {
  app.hidden = false;
  pausePanel.hidden = true;
  app.innerHTML = html;
  app.querySelector('h1, h2')?.focus({preventScroll:true});
  window.scrollTo(0, 0);
}
function focusLabel() {
  if (!session.focus) return '';
  return `<aside class="focus-card"><small>Your focus</small><p>${escapeText(session.focus)}</p></aside>`;
}
function screen(label, title, body, controls) {
  render(`<section class="session"><span class="eyebrow">${escapeText(label)}</span>
    ${focusLabel()}<h2 tabindex="-1">${escapeText(title)}</h2>${body}
    <div class="answers">${controls}</div>
    <div class="session-tools">${button('Pause','pause')}${button('Finish here','finish')}</div></section>`);
}
function field(label, value = '', placeholder = '') {
  return `<label for="entry">${label}</label><textarea id="entry" rows="3" maxlength="1000" placeholder="${escapeText(placeholder)}">${escapeText(value)}</textarea><p id="error" role="status"></p>`;
}
function home() {
  session = {};
  render(`<div class="hero"><span class="eyebrow">A little room</span><h1 tabindex="-1">What would you<br>like to release?</h1><p>Choose a practice. Take it one question at a time.</p></div>
    <div class="path-list">${paths.map(([key,label,description],i)=>`<button class="path-card" data-action="start" data-value="${key}">
      <span class="path-number">0${i+1}</span><span><strong>${label}</strong><small>${description}</small></span><span aria-hidden="true">→</span></button>`).join('')}</div>
    <p><a href="/guide.html">Read the field guide</a></p>`);
}
function start(path) {
  session = {path, focus:'', topicIndex:0, topicMode:'attachment', answers:{}};
  if (path === 'topics') return topics();
  const titles = {
    feelings:['What are you feeling?','Name a feeling or the situation bringing it up.','For example, hurt after a conversation'],
    wants:['What are you holding on to?','Name an issue where you feel a need for approval, control or security.','For example, needing someone to understand me'],
    goals:['What would you allow yourself to experience?','Write one goal. You can begin with “I allow myself to…”','I allow myself to enjoy…'],
    quick:['What would you like to loosen?','A feeling, thought or inner demand. A few words are enough.','What is here right now?']
  };
  const [title,copy,placeholder] = titles[path];
  screen(paths.find(p=>p[0]===path)[1],title,`<p>${copy}</p>`+field('Your focus','',placeholder),button('Begin','save-focus','',true));
}
function saveFocus() {
  const entry = app.querySelector('#entry');
  const value = entry.value.trim();
  if (!value) {
    app.querySelector('#error').textContent = 'Add a few words to focus on.';
    entry.focus();
    return;
  }
  session.focus = value;
  if (session.path === 'wants') return wantsStep(1);
  if (session.path === 'goals') return goalReaction();
  if (session.path === 'topics') return chooseTopicMode();
  if (session.path === 'quick') return quick();
  screen('Notice','Give the feeling a little room.',
    '<p>Notice how it feels right now. Let it be here for a moment.</p>',
    button('Continue','feelings-round','',true));
}
function wantsStep(step) {
  const content = {
    1:['Step 1 of 3 · Choose freedom','Would you like a little more inner freedom here?',
      'The course calls this imperturbability — inner steadiness. Notice the possibility of loosening your grip on approval, control or security.',
      button('I’m willing','wants-step','2')+button('I’m unsure','wants-step','2')],
    2:['Step 2 of 3 · Decide to practise','Could you give releasing a try?',
      'You can begin with a small willingness to let go. Take this one moment at a time.',
      button('I’ll try','wants-step','3')+button('There is resistance','resistance')],
  };
  if (step === 3) return wantPicker(() => beginRelease('want'));
  const [label,title,copy,controls] = content[step];
  screen(label,title,`<p>${copy}</p>`,controls);
}
function wantPicker(next) {
  session.wantNext = next;
  screen('Notice the want','What does the inner demand feel like?',
    '<p>Approval — “I need love or agreement.”<br>Control — “This must go my way.”<br>Security — “I need a guarantee.”</p>',
    ['approval','control','security'].map(w=>button(w[0].toUpperCase()+w.slice(1),'choose-want',w)).join('')+
    button('Not sure — stay with the feeling','choose-want',''));
}
function beginRelease(kind, next = check) {
  afterRelease = next;
  releasing = {kind, index:0};
  releaseQuestion();
}
function releaseQuestion() {
  const object = releasing.kind === 'want' && selectedWant ? 'wanting '+selectedWant : 'this feeling';
  const question = [`Could you let go of ${object}?`,'Would you?','When?'][releasing.index];
  if (!question) return afterRelease();
  screen(releasing.kind === 'want' ? 'Release the want' : 'Release the feeling',question,
    '<p>Notice your response. Answer in your own time.</p>',
    releasing.index === 2
      ? button('Now','advance')+button('Not yet','unwilling')
      : button('Yes','advance')+button('Maybe','advance')+button('No','unwilling'));
}
function unwilling() {
  screen('Allow your response','Could the unwillingness be here too?',
    '<p>Notice any effort to force the feeling away.</p>',
    button('Continue with the questions','advance')+button('Release the effort','release-effort'));
}
function quick() {
  screen('Quick release','Could you loosen your grip on this, just a little?',
    '<p>Notice what you are holding. Allow it for a moment, then see whether you can soften the hold.</p>',
    button('I’ve taken a moment','check')+button('I feel stuck','stuck'));
}
function check() {
  screen('Check in','What is here now?','<p>Notice any change, or no change.</p>',
    button('A little lighter','complete')+button('About the same','stuck')+
    button('Something different','new-reaction')+button('I’d like to pause','pause'));
}
function complete() {
  const next = session.path === 'topics' ? button('Next topic question','topic-next','',true)
    : session.path === 'goals' ? button('Read the goal again','goal-reaction','',true)
    : button('Another round','repeat','',true);
  screen('A moment to notice','What would you like to do next?','<p>You can continue or stop here.</p>',
    next+button('Finish here','finish'));
}
function goalReaction() {
  screen('Releasing goals','Read your goal slowly. What comes up?',
    '<p>Notice a thought, feeling or sensation, including doubt or pressure.</p>'+field('Your reaction (optional)',session.reaction||''),
    button('Release this feeling','goal-feeling')+button('Find the want underneath','goal-want'));
}
function topics() {
  screen('Releasing by topics','What topic would you like to explore?',
    '<p>Choose one, or type your own below.</p>'+
    `<div class="topic-options">${Object.entries(topicChoices).map(([key,value])=>button(value,'topic-preset',key)).join('')}</div>`+
    field('Your topic','','For example, having money or being accepted'),
    button('Use my topic','save-focus','',true));
}
function chooseTopicMode() {
  screen('Choose an exercise','How would you like to explore this?',
    '<p>Attachment explores clinging or needing it. Aversion explores resisting or pushing it away.</p>',
    button('Attachment','topic-mode','attachment')+button('Aversion','topic-mode','aversion'));
}
function topicQuestion() {
  const topic = session.focus;
  const attachment = session.topicMode === 'attachment';
  const questions = attachment ? [
    `What thoughts come up about your attachment to ${topic}?`,
    `What feels advantageous about ${topic}?`,
    `What feels disadvantageous about ${topic}?`,
    `Imagine never being able to experience ${topic}. What comes up?`,
    `Could you let go of your attachment to ${topic}?`
  ] : [
    `What thoughts come up about your aversion to ${topic}?`,
    `What do you like about ${topic}?`,
    `What do you dislike about ${topic}?`,
    `Imagine always experiencing ${topic}. What comes up?`,
    `Could you let go of your aversion to ${topic}?`
  ];
  if (session.topicIndex >= questions.length) {
    return screen('Topic exercise complete','Notice how you feel about the topic now.',
      '<p>You can explore the other side, repeat this exercise or finish.</p>',
      button('Explore '+(attachment?'aversion':'attachment'),'topic-mode',attachment?'aversion':'attachment')+
      button('Repeat this exercise','topic-mode',session.topicMode));
  }
  screen(`${attachment?'Attachment':'Aversion'} · ${session.topicIndex+1} of 5`,questions[session.topicIndex],
    '<p>Notice the reaction and the want underneath. Work with one reaction at a time.</p>'+
    field('What comes up? (optional)',session.answers[session.topicIndex]||''),
    button('Find and release the want','topic-release','',true)+button('Next question','topic-next'));
}
function finish() {
  screen('Close your practice','Enough for now.',
    '<p>Notice how you feel. Rest or choose one useful next action.</p>'+field('Optional reflection or next action'),
    button('Return home','home','',true));
}
const actions = {
  home, start, 'save-focus':saveFocus,
  'feelings-round':()=>beginRelease('feeling'),
  'wants-step':value=>wantsStep(Number(value)),
  resistance:()=>{selectedWant='control';beginRelease('want',()=>wantsStep(3));},
  'choose-want':value=>{selectedWant=value;session.wantNext();},
  advance:()=>{releasing.index++;releaseQuestion();},
  unwilling,
  'release-effort':()=>{selectedWant='control';beginRelease('want');},
  check, complete,
  repeat:()=>{if(session.path==='quick')return quick();if(session.path==='topics')return topicQuestion();if(session.path==='goals')return goalReaction();if(session.path==='wants')return wantsStep(3);beginRelease('feeling');},
  'new-reaction':()=>session.path==='goals'?goalReaction():session.path==='topics'?topicQuestion():wantPicker(()=>beginRelease(selectedWant?'want':'feeling')),
  stuck:()=>screen('Stuckness','Could you let go of wanting to control this stuckness?',
    '<p>Allow the effort itself to be here. See whether you can soften it.</p>',
    button('Take a moment, then check','check')+button('Return to my practice','repeat')),
  'goal-reaction':goalReaction,
  'goal-feeling':()=>{session.reaction=app.querySelector('#entry').value;beginRelease('feeling');},
  'goal-want':()=>{session.reaction=app.querySelector('#entry').value;wantPicker(()=>beginRelease(selectedWant?'want':'feeling'));},
  'topic-preset':key=>{session.focus=topicChoices[key];chooseTopicMode();},
  'topic-mode':value=>{session.topicMode=value;session.topicIndex=0;session.answers={};topicQuestion();},
  'topic-release':()=>{session.answers[session.topicIndex]=app.querySelector('#entry').value;wantPicker(()=>beginRelease(selectedWant?'want':'feeling',()=>{
    screen('Notice what remains','Is there another reaction to this question?',
      '<p>Release another layer, or continue to the next part of the exercise.</p>',
      button('Another reaction','topic-question')+button('Next question','topic-next'));
  }));},
  'topic-question':topicQuestion,
  'topic-next':()=>{const entry=app.querySelector('#entry');if(entry)session.answers[session.topicIndex]=entry.value;session.topicIndex++;topicQuestion();},
  pause:(_,control)=>{pausedControl=control;app.hidden=true;pausePanel.hidden=false;pausePanel.querySelector('h2').focus();},
  resume:()=>{app.hidden=false;pausePanel.hidden=true;pausedControl?.focus();},
  finish
};
document.addEventListener('click',event=>{
  const control=event.target.closest('button[data-action]');
  if(!control||pending)return;
  pending=true;
  control.classList.add('is-activating');
  window.setTimeout(()=>{
    control.classList.remove('is-activating');
    pending=false;
    actions[control.dataset.action]?.(control.dataset.value,control);
  },180);
});
const params=new URLSearchParams(location.search);
const requested=params.get('practice');
const routes={quick:'feelings',wants:'wants',goal:'goals',stuck:'quick'};
if(routes[requested])start(routes[requested]);else home();
