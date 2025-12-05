// simple reveal on load with stagger
  window.addEventListener('load', ()=>{
    document.querySelectorAll('.reveal').forEach((el,i)=>{
      setTimeout(()=>el.classList.add('show'), 90*i);
    });
  });

  function handleSignup(e){
    e.preventDefault();
    alert('Thanks! Your trial has started. Check your email.');
    e.target.reset && e.target.reset();
  }
  function handleContact(e){
    e.preventDefault();
    alert('Message sent — we will reply within 1 business day.');
    e.target.reset && e.target.reset();
  }