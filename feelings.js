const feelingsReference = document.querySelector('#feelings-reference');
const englishFeelings = feelingsReference.innerHTML;
const chineseFeelings = document.querySelector('#feelings-zh').innerHTML;

function openCategory() {
  const category = document.getElementById(location.hash.slice(1));
  if (category?.tagName === 'DETAILS') category.open = true;
}
function renderFeelings() {
  const openIds = [...feelingsReference.querySelectorAll('details[open]')].map(detail => detail.id);
  feelingsReference.innerHTML = language === 'zh-CN' ? chineseFeelings : englishFeelings;
  for (const id of openIds) document.getElementById(id).open = true;
  openCategory();
}
document.addEventListener('allowing-language-change', renderFeelings);
window.addEventListener('hashchange', openCategory);
if (language === 'zh-CN') renderFeelings();
else openCategory();
