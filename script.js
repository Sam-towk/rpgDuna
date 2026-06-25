document.addEventListener("DOMContentLoaded", () => {
    // 1. Navegação - Efeito de Scroll
    const mainNav = document.getElementById("mainNav");
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            mainNav.classList.add("scrolled");
        } else {
            mainNav.classList.remove("scrolled");
        }
    });

    // 2. Efeito Máquina de Escrever no Hero
    const titleElement = document.getElementById("heroTitle");
    const titleText = "O Império tem olhos para você";
    let charIndex = 0;

    function typeWriter() {
        if (charIndex < titleText.length) {
            titleElement.innerHTML = titleText.substring(0, charIndex + 1) + '<span class="cursor"></span>';
            charIndex++;
            setTimeout(typeWriter, Math.random() * 50 + 50); // velocidade aleatória para parecer natural
        } else {
            titleElement.innerHTML = titleText + '<span class="cursor"></span>';
        }
    }
    
    setTimeout(typeWriter, 1000); // Aguarda um pouco antes de começar

    // 3. Scroll Reveal
    const revealElements = document.querySelectorAll('.scroll-reveal');
    const revealOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    revealElements.forEach(el => revealObserver.observe(el));

    // 4. Cursor Customizado (mouse)
    const style = document.createElement('style');
    style.innerHTML = `
        body::after {
            left: var(--cursor-x, 50%);
            top: var(--cursor-y, 50%);
        }
    `;
    document.head.appendChild(style);

    window.addEventListener('mousemove', (e) => {
        document.body.style.setProperty('--cursor-x', e.clientX + 'px');
        document.body.style.setProperty('--cursor-y', e.clientY + 'px');
    });

    // 5. RSVP - Lógica do Terminal (Google Sheets)
    // COLOQUE AQUI A URL DO SEU GOOGLE APPS SCRIPT GERADA NA PLANILHA
    const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbzaSUp_4iMIzACcerdzpcraFuXJu6qoulXB8ijFE5VtBjFiVK-vzTY-OnBi9o_KPbFp/exec'; 

    window.handleRSVP = async function() {
        const name = document.getElementById('inputName').value;
        const houseElement = document.querySelector('input[name="house"]:checked');
        const message = document.getElementById('inputMessage').value || 'Sem mensagem';
        const responseDiv = document.getElementById('terminalResponse');

        if (!name || !houseElement) {
            responseDiv.style.display = 'block';
            responseDiv.style.color = '#ff5050'; // Cor de erro
            responseDiv.innerHTML = 'ERRO: Identificação ou Casa não selecionada. O Império exige clareza.';
            return;
        }

        const house = houseElement.value;
        
        responseDiv.style.display = 'block';
        responseDiv.style.color = 'var(--gold)';
        responseDiv.innerHTML = 'Transmitindo mensagem pela Rede Imperial... aguarde.';

        // Modo de teste se a URL não estiver configurada
        if (!GOOGLE_SHEETS_URL) {
            responseDiv.innerHTML = `Transmissão simulada, <strong>${name}</strong>. (Configure o link do Google Sheets no script.js para salvar de verdade).`;
            return;
        }

        try {
            // Envia os dados para a planilha
            await fetch(GOOGLE_SHEETS_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nome: name,
                    casa: house,
                    mensagem: message,
                    data: new Date().toLocaleString()
                })
            });

            responseDiv.innerHTML = `Transmissão recebida, <strong>${name}</strong>. A Casa ${house.toUpperCase()} foi registrada nos arquivos da CHOAM. O Mestre aguarda.`;
            
            // Limpa o formulário
            document.getElementById('inputName').value = '';
            document.getElementById('inputMessage').value = '';
            houseElement.checked = false;
        } catch (error) {
            responseDiv.style.color = '#ff5050';
            responseDiv.innerHTML = 'FALHA DE TRANSMISSÃO: Interferência no canal espacial (Erro ao salvar).';
        }
    };

    window.handleDecline = function() {
        const responseDiv = document.getElementById('terminalResponse');
        responseDiv.style.display = 'block';
        responseDiv.style.color = '#ff5050';
        responseDiv.innerHTML = 'A recusa foi notada. A Bene Gesserit não esquece.';
    };

    // 6. Canvas de Areia Animada
    const canvas = document.getElementById('sandCanvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let w, h;

    function resizeCanvas() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Particle {
        constructor() {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = Math.random() * 1.5 + 0.5; // Vento para a direita
            this.speedY = Math.random() * 0.5 - 0.25; // Leve variação vertical
            this.opacity = Math.random() * 0.5 + 0.1;
            this.color = `rgba(212, 169, 106, ${this.opacity})`; // Cor de areia (var(--sand))
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // Se sair da tela, volta para o início
            if (this.x > w) {
                this.x = -10;
                this.y = Math.random() * h;
            }
            if (this.y > h || this.y < 0) {
                this.y = Math.random() * h;
            }
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function initParticles() {
        particles = [];
        // Quantidade de partículas proporcional ao tamanho da tela (max 400 para performance)
        const numParticles = Math.min((w * h) / 8000, 400); 
        for (let i = 0; i < numParticles; i++) {
            particles.push(new Particle());
        }
    }

    initParticles();
    // Re-inicia as partículas caso a janela mude muito de tamanho
    window.addEventListener('resize', initParticles);

    function animateParticles() {
        ctx.clearRect(0, 0, w, h);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animateParticles);
    }

    animateParticles();
});
