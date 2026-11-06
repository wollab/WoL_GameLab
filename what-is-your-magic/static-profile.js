// Static profiles retain native reading links; only sharing needs JavaScript.
(function(){
  'use strict';
  const main=document.querySelector('main[data-archetype]');
  WizardShare.init();
  ['profile-share','profile-share-footer'].forEach(id=>{
    const button=document.getElementById(id);
    if(!button)return;
    button.addEventListener('click',event=>WizardShare.openProfile(main.dataset.archetype,event.currentTarget));
    button.disabled=false;
  });
})();
