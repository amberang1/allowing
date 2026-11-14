const app = document.querySelector('#app');
const paths = [
  ['feelings', 'Releasing feelings', 'The three Sedona questions, one at a time.'],
  ['wants', 'Releasing wants', 'Larry Crane’s six-step method.'],
  ['topics', 'Releasing by topics', 'Work through money, relationships or a topic of your own.'],
  ['goals', 'Releasing goals', 'Write a goal, then work with whatever comes up.'],
  ['quick', 'Quick release', 'Welcome the feeling and allow it to be here.']
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
let pending = false;

function escapeText(value) {
  return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}
function button(label, action, value = '', primary = false) {
  return `<button type="button" data-action="${action}" data-value="${escapeText(value)}" class="${primary ? 'primary' : ''}">${escapeText(label)}</button>`;
}
function render(html) {
  app.hidden = false;
  app.innerHTML = html;
  app.querySelector('h1, h2')?.focus({preventScroll:true});
  window.scrollTo(0, 0);
}
function focusLabel() {
  if (!session.focus) return '';
  const reaction = session.reaction?.trim();
  const want = selectedWant === 'security' ? 'Safety / security' : selectedWant;
  return `<aside class="focus-card"><small>Your focus</small><p>${escapeText(session.focus)}</p>
    ${reaction ? `<small>Your reaction</small><p>${escapeText(reaction)}</p>` : ''}
    ${want ? `<small>Type of want</small><p>${escapeText(want[0].toUpperCase()+want.slice(1))}</p>` : ''}
  </aside>`;
}
function pencilExample() {
  return `<details class="pencil-example">
    <summary>See the pencil example</summary>
    <figure>
      <img src="./pencil-release.webp" width="1774" height="887"
        alt="Three drawings: a hand grips a pencil, opens with the pencil resting freely, then lets the pencil drop." loading="lazy">
      <div class="pencil-captions"><span>Hold it</span><span>Open your hand</span><span>Let it drop</span></div>
      <figcaption>${session.path === 'quick' ? 'Picture the feeling as a pencil resting in your open hand. Let it be there. If you notice yourself gripping or trying to make it drop, allow that reaction too.' : 'In this exercise, imagine the feeling as a pencil in your hand. The pencil is something you’re holding, rather than part of your hand. Open your fingers and it can rest there freely. Then let it drop. Try the same with the feeling: let it be there, then see if you can relax your hold without pushing it away.'}</figcaption>
    </figure>
  </details>`;
}
function cloudExample() {
  return `<details class="pencil-example">
    <summary>See the cloud example</summary>
    <figure>
      <img src="./cloud-welcoming.webp" width="1774" height="887"
        alt="Three views of a cloud drifting and changing shape in an open sky. The cloud remains present in each view." loading="lazy">
      <div class="pencil-captions"><span>Notice it</span><span>Let it be here</span><span>Let it move in its own time</span></div>
      <figcaption>Imagine this feeling as a cloud in the sky. Let it be here. It might move, change shape or stay for a while. You can leave it alone.</figcaption>
    </figure>
  </details>`;
}

function screen(label, title, body, controls) {
  render(`<section class="session"><span class="eyebrow">${escapeText(label)}</span>
    ${focusLabel()}<h2 tabindex="-1">${escapeText(title)}</h2>${body}
    <div class="answers">${controls}</div>
    ${['Release the feeling','Quick release','Allow your response','Stuckness'].includes(label) || (label.startsWith('Release the want') || label.startsWith('Quick release')) ? (session.path === 'quick' ? cloudExample() : pencilExample() + cloudExample()) : ''}
    </section>`);
}
function field(label, value = '', placeholder = '') {
  return `<label for="entry">${label}</label><textarea id="entry" rows="3" maxlength="1000" placeholder="${escapeText(placeholder)}">${escapeText(value)}</textarea><p id="error" role="status"></p>`;
}
function home() {
  session = {};
  selectedWant = '';
  render(`<div class="hero"><span class="eyebrow">Allowing</span><h1 tabindex="-1">What would you<br>like to release?</h1><p>Pick where you’d like to start.</p></div>
    <div class="path-list">${paths.map(([key,label,description],i)=>`<button class="path-card" data-action="start" data-value="${key}">
      <span class="path-number">0${i+1}</span><span><strong>${label}</strong><small>${description}</small></span><span aria-hidden="true">→</span></button>`).join('')}</div>
    <p><a href="./guide.html">Read the field guide</a></p>`);
}
const goalExamples = {
  love: 'I allow myself to enjoy a loving, playful, committed partnership.',
  money: 'I allow myself to have and enjoy S$_____ in savings.',
  business: 'I allow myself to enjoy S$_____ in monthly business profit.',
  home: 'I allow myself to enjoy a peaceful home with room for a garden.',
  writing: 'I allow myself to enjoy sharing writing that matters to me.'
};
function start(path) {
  selectedWant = '';
  session = {path, focus:'', topicIndex:0, topicMode:'attachment', answers:{}};
  if (path === 'topics') return topics();
  const titles = {
    feelings:['What are you feeling?','Write the feeling, or what happened.','For example, hurt after a conversation'],
    wants:['What are you holding on to?','Write what’s on your mind. You’ll choose the want in a moment.','For example, needing someone to understand me'],
    goals:['What would you allow yourself to experience?','Write one goal in the present. Try “I allow myself to…” followed by what you’d like to have or experience.','I allow myself to enjoy…'],
    quick:['What are you feeling?','Write the feeling, or what’s bringing it up.','For example, feeling nervous about a presentation']
  };
  const [title,copy,placeholder] = titles[path];
  screen(paths.find(p=>p[0]===path)[1],title,`<p>${copy}</p>`+field('Your focus','',placeholder)+(path==='feelings'?'<p><a href="./feelings.html" target="_blank" rel="noopener">Need help naming the feeling? View the feelings charts ↗</a></p>':''),button('Begin','save-focus','',true));
  if (path === 'goals') {
    const example = params.get('example');
    if (Object.hasOwn(goalExamples, example)) app.querySelector('#entry').value = goalExamples[example];
  }
}
function saveFocus() {
  const entry = app.querySelector('#entry');
  const value = entry.value.trim();
  if (!value) {
    app.querySelector('#error').textContent = 'Type what you’d like to release.';
    entry.focus();
    return;
  }
  session.focus = value;
  if (session.path === 'wants') return wantsStep(1);
  if (session.path === 'goals') return goalReaction();
  if (session.path === 'topics') return chooseTopicMode();
  if (session.path === 'quick') return quick();
  screen('Notice','Start with the feeling.',
    '<p>Think about what you wrote. Let yourself feel it before you continue.</p>',
    button('Continue','feelings-round','',true));
}
function wantsStep(step) {
  const content = {
    1:['Step 1 of 3 · Choose freedom','Would you like a little more inner freedom here?',
      'Larry calls this “imperturbability”: being at ease even when things don’t go your way. For now, see if you’d prefer that to holding on to this want.',
      button('I’m willing','wants-step','2')+button('I’m unsure','wants-step','2')],
    2:['Step 2 of 3 · Decide','I decide to release and be imperturbable.',
      'Decide that you can release and be imperturbable — at ease, even when something bothers you.',
      button('I decide to release','wants-step','3')+button('There is resistance','resistance')],
  };
  if (step === 3) return wantPicker(() => beginRelease('want'));
  const [label,title,copy,controls] = content[step];
  screen(label,title,`<p>${copy}</p>`,controls);
}
function wantPicker(next) {
  selectedWant = '';
  session.wantNext = next;
  screen('Notice the want','What do you feel you need right now?',
    '<p>Approval — “I need love or agreement.”<br>Control — “This must go my way.”<br>Security — “I need a guarantee.”</p>',
    ['approval','control','security'].map(w=>button(w[0].toUpperCase()+w.slice(1),'choose-want',w)).join('')+
    button('Not sure','choose-want',''));
}
function beginRelease(kind, next = check) {
  if ((session.path === 'wants' || session.path === 'topics') && kind === 'want') {
    if (!selectedWant) return uncertainWant(next);
    afterRelease = next;
    releasing = {kind:'crane', index:0};
    return craneQuestion();
  }
  afterRelease = next;
  releasing = {kind, index:0};
  releaseQuestion();
}

function uncertainWant(next) {
  screen('Notice the want', 'Take a moment with your reaction.',
    '<p>Read what you wrote. Are you looking for approval, trying to change something, or wanting to feel safe? Choose the closest fit.</p>',
    button('Choose a want','choose-again') + button('Return home','home'));
  session.wantNext = () => beginRelease('want', next);
}
function craneQuestion() {
  const want = selectedWant === 'security' ? 'safety' : selectedWant;
  const prompts = [
    `Could I let go of wanting ${want}, so I can have ${want}?`,
    `Could I let go of wanting ${want} to have ${want}?`,
    `Which feels better — having ${want} or wanting ${want}?`,
    `Could I let go of wanting ${want}, so I can have ${want}?`,
    `Does it feel like I have ${want}, or still want ${want}?`
  ];
  let controls;
  if (releasing.index === 2) {
    controls = button('Having '+want,'crane-advance') + button('Wanting '+want,'crane-advance');
  } else if (releasing.index === 4) {
    controls = button('Having '+want,'crane-done') + button('Still wanting','crane-repeat') + button('Not sure','crane-unsure');
  } else {
    controls = button('Yes','crane-advance') + button('Not yet','crane-unwilling');
  }
  screen('Release the want · '+(releasing.index+1)+' of 5',prompts[releasing.index],
    '<p>Wait for your answer before tapping. “Having” means what it feels like to have approval, control or safety already.</p>', controls);
}

function releaseQuestion() {
  const object = releasing.kind === 'want' && selectedWant ? 'wanting '+selectedWant : 'this feeling';
  const question = [`Could you let go of ${object}?`,'Would you?','When?'][releasing.index];
  if (!question) return afterRelease();
  screen(releasing.kind === 'want' ? 'Release the want' : 'Release the feeling',question,
    '<p>Answer when you’re ready.</p>',
    releasing.index === 2
      ? button('Now','advance')+button('Not yet','unwilling')
      : button('Yes','advance')+button('Maybe','advance')+button('No','unwilling'));
}
function unwilling() {
  screen('Allow your response','Could the unwillingness be here too?',
    '<p>If you’re trying to push the feeling away, notice that too.</p>',
    button('Continue with the questions','advance')+button('Release the effort','release-effort'));
}
function quick() {
  screen('Quick release · 1 of 2','Notice the feeling.',
    '<p>Think about what you wrote. Notice the feeling itself, or any sensation that goes with it.</p>',
    button('Continue','welcome-feeling'));
}
function welcomeFeeling() {
  screen('Quick release · 2 of 2','Let the feeling be here.',
    '<p>You can say to yourself, “I allow this feeling to be here.” Let yourself feel it for a moment.</p>' +
    '<p>If you notice “I want it gone,” allow that reaction too. Stay with this as long as you like, whether the feeling changes or stays the same.</p>',
    button('Done','check'));
}
function check() {
  screen('Your practice', 'Would you like to release again?', '',
    button('Release again','repeat') + button('Return home','home'));
}
function goalReaction() {
  selectedWant = '';
  screen('Releasing goals','Read your goal slowly. What comes up?',
    '<p>Read the goal, then notice the first thought, feeling or sensation. You keep the goal and work with the feeling it brings up.</p>'+field('Your reaction (optional)',session.reaction||''),
    button('Release this feeling','goal-feeling')+button('Find the want underneath','goal-want'));
}
function topics() {
  screen('Releasing by topics','What topic would you like to explore?',
    '<p>Pick a topic or write your own.</p>'+
    `<div class="topic-options">${Object.entries(topicChoices).map(([key,value])=>button(value,'topic-preset',key)).join('')}</div>`+
    field('Your topic','','For example, having money or being accepted'),
    button('Use my topic','save-focus','',true));
}
function chooseTopicMode() {
  screen('Choose an exercise','How would you like to explore this?',
    '<p>Choose attachment if you feel you need it or can’t let it go. Choose aversion if you dislike it or want to avoid it.</p>',
    button('Attachment','topic-mode','attachment')+button('Aversion','topic-mode','aversion'));
}
function topicQuestion() {
  selectedWant = '';
  session.reaction = session.answers[session.topicIndex] || '';
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
    return screen('Topic exercise complete','Would you like to release again?', '',
      button('Release again','topic-mode',session.topicMode) + button('Return home','home'));
  }
  screen(`${attachment?'Attachment':'Aversion'} · ${session.topicIndex+1} of 5`,questions[session.topicIndex],
    '<p>Write your first reaction. Next, you’ll choose which want goes with it.</p>'+
    field('What comes up? (optional)',session.answers[session.topicIndex]||''),
    button('Choose the want','topic-release','',true)+button('Next question','topic-next'));
}
const actions = {
  home, start, 'save-focus':saveFocus, 'welcome-feeling':welcomeFeeling,
  'feelings-round':()=>beginRelease('feeling'),
  'wants-step':value=>wantsStep(Number(value)),
  resistance:()=>{selectedWant='control';beginRelease('want',()=>wantsStep(3));},
  'choose-want':value=>{selectedWant=value;session.wantNext();},
  'choose-again':()=>wantPicker(session.wantNext),
  'crane-advance':()=>{releasing.index++;craneQuestion();},
  'crane-repeat':()=>{releasing.index=0;craneQuestion();},
  'crane-done':()=>afterRelease(),
  'crane-unsure':()=>screen('Release the want','Would you like another round?', '',
    button('Release again','crane-repeat')+button('Continue','crane-done')),
  'crane-unwilling':()=>screen('Allow your response','Could I let go of wanting to control this stuckness?',
    '<p>If you’re trying hard to make this work, try releasing that effort first.</p>',
    button('Try again','crane-repeat')+button('Continue','crane-advance')),
  advance:()=>{releasing.index++;releaseQuestion();},
  unwilling,
  'release-effort':()=>{selectedWant='control';beginRelease('want',afterRelease||check);},
  check,
  repeat:()=>{if(session.path==='quick')return quick();if(session.path==='topics')return topicQuestion();if(session.path==='goals')return goalReaction();if(session.path==='wants')return wantsStep(3);beginRelease('feeling');},
  stuck:()=>screen('Stuckness','Could you let go of wanting to control this stuckness?',
    '<p>Notice the effort you’re putting into this. See if you can let some of it go.</p>',
    button('Continue','check')+button('Return to my practice','repeat')),
  'goal-reaction':goalReaction,
  'goal-feeling':()=>{session.reaction=app.querySelector('#entry').value;beginRelease('feeling');},
  'goal-want':()=>{session.reaction=app.querySelector('#entry').value;wantPicker(()=>beginRelease(selectedWant?'want':'feeling'));},
  'topic-preset':key=>{session.focus=topicChoices[key];chooseTopicMode();},
  'topic-mode':value=>{session.topicMode=value;session.topicIndex=0;session.answers={};topicQuestion();},
  'topic-release':()=>{session.reaction=app.querySelector('#entry').value;session.answers[session.topicIndex]=session.reaction;wantPicker(()=>beginRelease('want',()=>{
    screen('After this round','Is there another reaction to this question?',
      '<p>You can work on another reaction to this question, or go to the next one.</p>',
      button('Another reaction','topic-question')+button('Next question','topic-next'));
  }));},
  'topic-question':topicQuestion,
  'topic-next':()=>{const entry=app.querySelector('#entry');if(entry)session.answers[session.topicIndex]=entry.value;session.topicIndex++;topicQuestion();},

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
const routes={feelings:'feelings',quick:'feelings',welcoming:'quick',wants:'wants',topics:'topics',goal:'goals',goals:'goals',stuck:'quick'};

if(requested === 'stuck') {
  session = {path:'feelings',focus:'Trying to force a release'};
  actions.stuck();
} else if(routes[requested]) start(routes[requested]);
else home();


