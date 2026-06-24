// shield-patch.js
// Patch runtime para o Escudo: ao ativar, o escudo se anexa ao jogador e protege 1 colisão.
// Este arquivo é carregado depois de game.js (defer) e faz um monkey-patch nas funções
// activatePower e handleCollision, preservando o comportamento original.
(function(){
  'use strict';

  // aguarda que as funções originais estejam definidas (normalmente já estarão porque os scripts são defer)
  var origActivate = window.activatePower;
  var origHandleCollision = window.handleCollision;

  window.activatePower = function(type){
    try {
      if (typeof origActivate === 'function') origActivate(type);
    } catch(e){ console.warn('activatePower original failed', e); }

    try {
      if (type === 'shield') {
        var rs = window.runState || null;
        if (rs && rs.player) {
          rs.player.shieldActive = true;
          rs.player.shieldHits = 1;

          // mostra indicador no HUD
          var el = document.querySelector('.powerup-indicator[data-power="shield"]');
          if (el) el.removeAttribute('hidden');

          // som e feedback
          if (typeof window.sfxPowerup === 'function') window.sfxPowerup();
          if (typeof window.spawnFloatingText === 'function') window.spawnFloatingText('Escudo ativado', window.innerWidth/2, 80, 'is-shield');
        } else {
          // se runState ainda não existir, guarda na window para aplicar depois
          window.__pendingShield = 1;
        }
      }
    } catch (e) {
      console.warn('shield patch activate error', e);
    }
  };

  // aplicar pending shield se existir quando runState for criado
  function applyPendingShield() {
    try {
      if (window.__pendingShield && window.runState && window.runState.player) {
        window.runState.player.shieldActive = true;
        window.runState.player.shieldHits = window.__pendingShield;
        delete window.__pendingShield;
        var el = document.querySelector('.powerup-indicator[data-power="shield"]');
        if (el) el.removeAttribute('hidden');
        if (typeof window.sfxPowerup === 'function') window.sfxPowerup();
        if (typeof window.spawnFloatingText === 'function') window.spawnFloatingText('Escudo ativado', window.innerWidth/2, 80, 'is-shield');
      }
    } catch (e) { console.warn(e); }
  }

  // observa criação do runState (caso seja criado posteriormente)
  var runStateObserver = setInterval(function(){
    if (window.runState && window.runState.player) { applyPendingShield(); clearInterval(runStateObserver); }
  }, 300);

  // override handleCollision para consumir escudo antes de aplicar dano
  window.handleCollision = function(rs){
    try {
      var player = (rs && rs.player) || (window.runState && window.runState.player) || null;
      if (player && player.shieldActive && player.shieldHits > 0) {
        player.shieldHits -= 1;
        player.shieldActive = false;
        // feedback sonoro / visual
        if (typeof window.sfxShieldBreak === 'function') window.sfxShieldBreak();
        if (typeof window.spawnFloatingText === 'function') window.spawnFloatingText('+Escudo!', window.innerWidth/2, window.innerHeight/3, 'is-shield-break');
        try { document.querySelector('.powerup-indicator[data-power="shield"]')?.setAttribute('hidden', ''); } catch(e){}
        // não propagar dano
        return;
      }
    } catch (e) { console.warn('shield patch collision check failed', e); }

    // chama implementação original
    if (typeof origHandleCollision === 'function') return origHandleCollision(rs);
  };

})();
