(function(){
  'use strict';

  // Loader wrapper: load original game.js then apply runtime patches
  function loadGameJs(){
    return new Promise(function(resolve, reject){
      var s = document.createElement('script');
      s.src = 'game.js';
      s.defer = true;
      s.onload = function(){ resolve(); };
      s.onerror = function(e){ reject(e); };
      document.head.appendChild(s);
    });
  }

  loadGameJs().then(function(){

    // Apply pending shield if present once runState exists
    (function applyPendingShieldOnce(){
      var timer = setInterval(function(){
        try {
          if (window.__pendingShield && window.runState && window.runState.player) {
            window.runState.player.shieldActive = true;
            window.runState.player.shieldHits = window.__pendingShield;
            delete window.__pendingShield;
            try { document.querySelector('.powerup-indicator[data-power="shield"]')?.removeAttribute('hidden'); } catch(e){}
            if (typeof sfxPowerup === 'function') sfxPowerup();
            if (typeof spawnFloatingText === 'function') spawnFloatingText('Escudo ativado', window.innerWidth/2, 80, 'is-shield');
            clearInterval(timer);
          }
        } catch (err) { console.warn(err); }
      }, 250);
    })();

    // Wrap activatePower to attach shield to player safely
    if (typeof window.activatePower === 'function') {
      var _origActivate = window.activatePower;
      window.activatePower = function(type) {
        try { _origActivate(type); } catch (e) { console.warn('orig activate error', e); }
        try {
          if (type === 'shield') {
            if (window.runState && window.runState.player) {
              window.runState.player.shieldActive = true;
              window.runState.player.shieldHits = 1;
              try { document.querySelector('.powerup-indicator[data-power="shield"]')?.removeAttribute('hidden'); } catch(e){}
              if (typeof sfxPowerup === 'function') sfxPowerup();
              if (typeof spawnFloatingText === 'function') spawnFloatingText('Escudo ativado', window.innerWidth/2, 80, 'is-shield');
            } else {
              window.__pendingShield = (window.__pendingShield || 0) + 1;
            }
          }
        } catch (e) { console.warn('shield activate patch failed', e); }
      };
    }

    // Wrap handleCollision to consume shield before life loss
    if (typeof window.handleCollision === 'function') {
      var _origHandleCollision = window.handleCollision;
      window.handleCollision = function(rs) {
        try {
          var playerRef = (rs && rs.player) ? rs.player : (window.runState && window.runState.player ? window.runState.player : null);
          if (playerRef && playerRef.shieldActive && (playerRef.shieldHits || 0) > 0) {
            playerRef.shieldHits = Math.max(0, (playerRef.shieldHits || 1) - 1);
            playerRef.shieldActive = false;
            if (typeof sfxShieldBreak === 'function') sfxShieldBreak();
            if (typeof spawnFloatingText === 'function') spawnFloatingText('+Escudo protegido!', window.innerWidth/2, window.innerHeight * 0.35, 'is-shield-break');
            try { document.querySelector('.powerup-indicator[data-power="shield"]')?.setAttribute('hidden',''); } catch(e){}
            return;
          }
        } catch (e) { console.warn('shield collision check failed', e); }
        return _origHandleCollision(rs);
      };
    }

  }).catch(function(err){
    console.error('Falha ao carregar game.js para aplicar correções:', err);
  });

})();
