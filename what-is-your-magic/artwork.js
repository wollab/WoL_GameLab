// Presentation assets only: quiz-data.js and the original app remain unchanged.
(function(root){
  'use strict';
  const legacy=id=>({communicator:'meaningmaker',summarizer:'synthesizer'}[id]||id);
  root.WizardArtwork={
    portrait:id=>'assets/archetypes/cutouts/'+id+'.png',
    angle:id=>'assets/characters/cutouts/'+legacy(id)+'.png'
  };
})(window);
