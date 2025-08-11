// faq-accordion.js
document.querySelectorAll('.accordion-question').forEach(question => {
  question.addEventListener('click', () => {
    const answer = question.nextElementSibling;
    const isOpen = answer.classList.contains('open');
    if (isOpen) {
      answer.classList.remove('open');
    } else {
      // Close other open answers
      document.querySelectorAll('.accordion-answer.open').forEach(openAnswer => {
        openAnswer.classList.remove('open');
      });
      answer.classList.add('open');
      question.scrollIntoView({behavior: 'smooth', block: 'start'});
    }
  });
});
