

AOS.init(
  {
      duration: 1200,
  }
);

window.addEventListener("scroll", function () {
  const navButton = document.getElementById("navigation-button");
  const triggerPoint = 300; // Altere esse valor conforme necessário

  if (window.scrollY >= triggerPoint) {
      navButton.classList.remove("desactive");
  } else {
      navButton.classList.remove("desactive");
  }
});

  window.addEventListener('DOMContentLoaded', function () {
    const isMobile = window.innerWidth <= 768;

    const iframeDesktop = document.querySelector('iframe.desktop');
    const iframeMobile = document.querySelector('iframe.mobile');

    // Remove o src de ambos para garantir que nenhum carregue antes da verificação
    iframeDesktop.removeAttribute('src');
    iframeMobile.removeAttribute('src');

    if (isMobile) {
      iframeMobile.src = "https://player-vz-fa2c182e-ab9.tv.pandavideo.com.br/embed/?v=f9ec0c8f-cdb6-4bb5-9f48-d45f4e8dec3b";
    } else {
      iframeDesktop.src = "https://player-vz-fa2c182e-ab9.tv.pandavideo.com.br/embed/?v=d361b71a-0b84-4ba9-b95f-76adb8670c52";
    }
  });
