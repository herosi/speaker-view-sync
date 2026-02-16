/*
Reveal.js Speaker-view-sync - POC code (sync plugin template)
*/

window.RevealSpeakerviewsync = function () {

  let windowType = window.location.search.includes('receiver') ? 'NOTES' : 'MAIN';
  
  let speakerWindow = null;
  let currentSlideWindow = null;

  return {
    id: 'RevealSpeakerviewsync',
    
    init: (deck) => {
      
      console.log('========================================');
      console.log(`[${windowType}] Speaker-view-sync Plugin initialized`);
      console.log('========================================');
      
      // Message Listener
      window.addEventListener('message', (event) => {
        let data = event.data;
        
        // Parse JSON if data is past as a string.
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);
          } catch (e) {
            return;
          }
        }
        
        // Update window from reveal-notes
        if (data && data.namespace === 'reveal-notes') {
          if (event.source && event.source !== window) {
            speakerWindow = event.source;
            console.log(`[${windowType}] ✅ Speaker view captured from reveal-speaker message`);
          }
        }
        
        // Process a received message on reveal-sync
        if (data && data.namespace === 'reveal-sync') {
          // Process your data received here
          // ...
          if (data.type == 'keepalive') {
            if (currentSlideWindow !== event.source) {
              currentSlideWindow = event.source;
            }
          } else {
            console.log(`[${windowType}] 🎯 Received:`, data.type, 'from:', data.from);
          }
        }
      });
      
      // Send a message by pressing the Ctrl key
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Control') {
          // Write your message to send here.
          const message = {
            namespace: 'reveal-sync',
            type: 'test',
            from: windowType,
            timestamp: Date.now()
          };
          
          console.log(`[${windowType}] 📤 Sending test...`);
          
          // Send a message to the NOTES view (from MAIN)
          if (windowType === 'MAIN' && speakerWindow && !speakerWindow.closed) {
            if (currentSlideWindow) {
              currentSlideWindow.postMessage(JSON.stringify(message), '*');
              console.log(`[${windowType}]    ✓ Sent to speaker view`);
            }
          } else if (windowType === 'MAIN') {
            console.log(`[${windowType}]    ⚠ Speaker view not available (press S first)`);
          }
          
          // Send a message to the MAIN window (from NOTES)
          if (windowType === 'NOTES' && window.parent.opener) {
            window.parent.opener.postMessage(JSON.stringify(message), '*');
            console.log(`[${windowType}]    ✓ Sent to main`);
          } else if (windowType === 'NOTES') {
            console.log(`[${windowType}]    ⚠ window.opener is null`);
          }
        }
      });

      // Notify the iframe window of the current-slide iframe
      // Keeping updating is necessary for reloading the web page
      //
      // Quick hack: The speaker view contains two iframes: one for the current slide
      // and one for the upcoming slide. They have the same contents, but display
      // different slides.
      // I couldn't find a reliable way to distinguish them from inside the iframe,
      // so as a workaround, I use `postMessageEvents=true` to detect the current slide,
      // since the upcoming one doesn't have this parameter.
      if (windowType === 'NOTES' && window.location.search.includes('postMessageEvents=true')) {
        const intervalId = setInterval(() => {
          const message = {
            namespace: 'reveal-sync',
            type: 'keepalive',
            from: windowType,
          };
          window.parent.opener.postMessage(JSON.stringify(message), '*');
        }, 1000);
      }

      console.log(`[${windowType}] 💡 Press 'S' to open speaker view`);
      console.log(`[${windowType}] 💡 Press 'Ctrl' to send test message`);
    }
  };
};