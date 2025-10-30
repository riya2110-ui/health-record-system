// main.js - simple accessible slider with support for image and video slides
(function(){
  const slider = document.getElementById('media-slider');
  if(!slider) return;
  const slidesEl = slider.querySelector('.slides');
  const slides = Array.from(slidesEl.querySelectorAll('.slide'));
  const dots = Array.from(slider.querySelectorAll('.nav-dot'));
  const prevBtn = slider.querySelector('.prev');
  const nextBtn = slider.querySelector('.next');
  const playPauseBtn = slider.querySelector('.playpause');

  let current = 0;
  let autoplay = true;
  let timer = null;
  const DEFAULT_DELAY = 4500; // ms between slides when image

  function setSlide(index){
    index = (index + slides.length) % slides.length;
    if(index === current) return;

    // pause any playing video on previous
    const prevSlide = slides[current];
    const prevVideo = prevSlide.querySelector('video');
    if(prevVideo && !prevVideo.paused){
      prevVideo.pause();
      prevVideo.currentTime = 0;
    }
    prevSlide.setAttribute('aria-hidden', 'true');
    dots[current].setAttribute('aria-selected', 'false');

    const nextSlide = slides[index];
    nextSlide.setAttribute('aria-hidden', 'false');
    dots[index].setAttribute('aria-selected', 'true');

    current = index;

    // if new slide is video, play it
    const video = nextSlide.querySelector('video');
    if(video){
      // try to autoplay; many browsers require muted to autoplay
      video.muted = true;
      video.play().catch(()=>{});
    }

    // reset timer for autoplay
    resetTimer();
  }

  function prev(){ setSlide(current - 1); }
  function next(){ setSlide(current + 1); }

  function resetTimer(){
    if(timer) clearTimeout(timer);
    if(!autoplay) return;

    const active = slides[current];
    const video = active.querySelector('video');
    if(video){
      // wait for video to end or fallback to DEFAULT_DELAY
      const remaining = (video.duration && !isNaN(video.duration)) ? (video.duration - video.currentTime) * 1000 : DEFAULT_DELAY;
      timer = setTimeout(()=>{
        // if video still playing, wait a bit
        if(!video.paused && !video.ended){
          video.addEventListener('ended', ()=> next(), { once: true });
        } else {
          next();
        }
      }, Math.max(remaining, 600));
    } else {
      timer = setTimeout(()=> next(), DEFAULT_DELAY);
    }
  }

  function toggleAutoplay(){
    autoplay = !autoplay;
    if(playPauseBtn){
      playPauseBtn.textContent = autoplay ? '⏸' : '▶';
      playPauseBtn.setAttribute('aria-label', autoplay ? 'Pause autoplay' : 'Start autoplay');
    }
    if(autoplay) resetTimer(); else if(timer) clearTimeout(timer);
  }

  // attach events
  prevBtn.addEventListener('click', ()=>{ prev(); });
  nextBtn.addEventListener('click', ()=>{ next(); });
  if(playPauseBtn) playPauseBtn.addEventListener('click', ()=>{ toggleAutoplay(); });

  dots.forEach((d, i)=> d.addEventListener('click', ()=> setSlide(i)));

  // pause on hover (use pointer events)
  slider.addEventListener('pointerenter', ()=>{ if(autoplay && timer) clearTimeout(timer); });
  slider.addEventListener('pointerleave', ()=>{ if(autoplay) resetTimer(); });

  // keyboard support
  slider.addEventListener('keydown', (e)=>{
    if(e.key === 'ArrowLeft') prev();
    if(e.key === 'ArrowRight') next();
    if(e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); toggleAutoplay(); }
  });

  // setup initial attributes
  slides.forEach((s, i)=>{
    s.id = 'slide-' + i;
    s.setAttribute('aria-hidden', i === 0 ? 'false' : 'true');
  });
  dots.forEach((d, i)=> d.setAttribute('aria-selected', i === 0 ? 'true' : 'false'));
  slider.setAttribute('tabindex', '0');

  // start autoplay
  resetTimer();
})();
