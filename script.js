document.addEventListener('DOMContentLoaded', function() {
    // Limpar localStorage ao carregar a página
    localStorage.removeItem('nomeJogador');
    localStorage.removeItem('pontos');
    
    let palavras;
    let palavrasUsadas = {};
    let ultimosUsos = {};
    let nomeJogador = localStorage.getItem('nomeJogador');
    let pontos = parseInt(localStorage.getItem('pontos'), 10) || 0;
    const maxTentativas = 50;

    const categoriaElemento = document.getElementById('categoria');
    const numeroCaracteresElemento = document.getElementById('numero-caracteres');
    const progressoElemento = document.getElementById('progresso');
    const tentativasElemento = document.getElementById('tentativas');
    const tentativaInput = document.getElementById('tentativa');
    const tentarButton = document.getElementById('tentar');
    const letrasErradasElemento = document.getElementById('letras-erradas');
    const selecionarCategoria = document.getElementById('selecionar-categoria');
    const novaPalavraInput = document.getElementById('nova-palavra');
    const iniciarJogoButton = document.getElementById('iniciar-jogo');
    const palavraAtualElemento = document.getElementById('palavra-atual');

    const popup = document.getElementById('popup');
    const closeBtn = document.querySelector('.close-btn');
    const nomeJogadorPopup = document.getElementById('nome-jogador-popup');
    const salvarNomeJogadorBtn = document.getElementById('salvar-nome-jogador');
    const nomeJogadorElemento = document.getElementById('nome-jogador');

    const letraCertaSom = document.getElementById('letra-certa-som');
    const letraErradaSom = document.getElementById('letra-errada-som');

    letraCertaSom.addEventListener('canplaythrough', () => console.log('letraCertaSom pronto para tocar'));
    letraErradaSom.addEventListener('canplaythrough', () => console.log('letraErradaSom pronto para tocar'));

    closeBtn.addEventListener('click', function() {
        popup.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target === popup) {
            popup.style.display = 'none';
        }
    });

    salvarNomeJogadorBtn.addEventListener('click', function() {
        nomeJogador = nomeJogadorPopup.value.trim();
        if (nomeJogador !== '') {
            localStorage.setItem('nomeJogador', nomeJogador);
            nomeJogadorElemento.textContent = `Jogador: ${nomeJogador} | Pontos: ${pontos}`;
            nomeJogadorPopup.value = '';
            popup.style.display = 'none';
            reiniciarJogo();
        } else {
            alert('Por favor, insira o nome do jogador.');
        }
    });

    let palavraAtual = '';
    let letrasCertas = new Set();
    let letrasErradas = new Set();
    let tentativasErradas = 0;

    function carregarPalavras() {
        fetch('palavras.json')
            .then(response => response.json())
            .then(data => {
                palavras = data;
                preencherSelecionarCategoria();
            })
            .catch(error => console.error('Erro ao carregar as palavras:', error));
    }

    function preencherSelecionarCategoria() {
        selecionarCategoria.innerHTML = '';
        Object.keys(palavras).forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria;
            option.textContent = categoria;
            selecionarCategoria.appendChild(option);
        });
    }

    function escolherPalavra() {
        const categoriaSelecionada = selecionarCategoria.value;
        const novaPalavra = novaPalavraInput.value.trim();

        if (novaPalavra) {
            palavraAtual = novaPalavra;
            categoriaElemento.textContent = `Categoria: Personalizada`;
        } else {
            const palavrasDisponiveis = palavras[categoriaSelecionada].filter(palavra => !palavrasUsadas[palavra]);

            if (palavrasDisponiveis.length === 0) {
                palavrasUsadas = {};
                return escolherPalavra();
            }

            palavraAtual = palavrasDisponiveis[Math.floor(Math.random() * palavrasDisponiveis.length)];
            palavrasUsadas[palavraAtual] = true;
            ultimosUsos[categoriaSelecionada] = Date.now();
            categoriaElemento.textContent = `Categoria: ${categoriaSelecionada}`;
        }
        numeroCaracteresElemento.textContent = `Número de Letras: ${contarCaracteres(palavraAtual)}`;
        progressoElemento.textContent = mostrarProgresso(palavraAtual, letrasCertas);
        tentativasElemento.textContent = `Tentativas restantes: ${maxTentativas - tentativasErradas}`;
        atualizarLetrasErradas();
        palavraAtualElemento.textContent = `Palavra Atual: ${palavraAtual}`;
    }

    function removerAcentos(texto) {
        return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    function contarCaracteres(palavra) {
        return palavra.replace(/\s/g, '').length;
    }

    function mostrarProgresso(palavra, letrasCertas) {
        return palavra.split('').map(letra => {
            if (letra === ' ') {
                return '   '; // Três espaços para separar palavras
            }
            const letraSemAcento = removerAcentos(letra).toLowerCase();
            return letrasCertas.has(letraSemAcento) ? letra : '_';
        }).join(' ').replace(/ {3}/g, '   '); // Adiciona um espaço após cada underscore e substitui três espaços por três espaços consecutivos
    }

    function atualizarLetrasErradas() {
        letrasErradasElemento.innerHTML = 'Letras erradas: ';
        letrasErradas.forEach(letra => {
            const span = document.createElement('span');
            span.className = 'letra-errada';
            span.textContent = letra + ' ';
            letrasErradasElemento.appendChild(span);
        });
    }

    function verificarFimDeJogo() {
        if (tentativasErradas >= maxTentativas) {
            alert(`Que pena! A palavra era "${palavraAtual}"`);
            reiniciarJogo();
        } else if (Array.from(removerAcentos(palavraAtual.toLowerCase())).every(letra => letrasCertas.has(letra))) {
            alert('Parabéns! Você acertou a palavra!');
            pontos++;
            localStorage.setItem('pontos', pontos);
            nomeJogadorElemento.textContent = `Jogador: ${nomeJogador} | Pontos: ${pontos}`;
            reiniciarJogo();
        }
    }

    function reiniciarJogo() {
        palavraAtual = '';
        letrasCertas.clear();
        letrasErradas.clear();
        tentativasErradas = 0;
        escolherPalavra();
    }

    function tentar() {
        const tentativa = tentativaInput.value.trim().toLowerCase();
        tentativaInput.value = '';

        if (tentativa.length === 0) {
            alert('Digite uma letra ou a palavra completa!');
            return;
        }

        if (tentativa.length > 1) {
            if (removerAcentos(tentativa) === removerAcentos(palavraAtual.toLowerCase())) {
                palavraAtual.split('').forEach(letra => letrasCertas.add(removerAcentos(letra.toLowerCase())));
                try {
                    letraCertaSom.play();
                } catch (e) {
                    console.error('Erro ao tocar o som da letra certa:', e);
                }
            } else {
                tentativasErradas++;
                try {
                    letraErradaSom.play();
                } catch (e) {
                    console.error('Erro ao tocar o som da letra errada:', e);
                }
            }
        } else {
            const letraSemAcento = removerAcentos(tentativa);
            if (removerAcentos(palavraAtual.toLowerCase()).includes(letraSemAcento)) {
                palavraAtual.split('').forEach(letra => {
                    if (removerAcentos(letra.toLowerCase()) === letraSemAcento) {
                        letrasCertas.add(letraSemAcento);
                    }
                });
                try {
                    letraCertaSom.play();
                } catch (e) {
                    console.error('Erro ao tocar o som da letra certa:', e);
                }
            } else {
                if (!letrasErradas.has(letraSemAcento)) {
                    letrasErradas.add(letraSemAcento);
                    tentativasErradas++;
                    try {
                        letraErradaSom.play();
                    } catch (e) {
                        console.error('Erro ao tocar o som da letra errada:', e);
                    }
                }
            }
        }

        progressoElemento.textContent = mostrarProgresso(palavraAtual, letrasCertas);
        tentativasElemento.textContent = `Tentativas restantes: ${maxTentativas - tentativasErradas}`;
        atualizarLetrasErradas();
        verificarFimDeJogo();
    }

    tentarButton.addEventListener('click', tentar);
    tentativaInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            tentar();
        }
    });
    iniciarJogoButton.addEventListener('click', reiniciarJogo);

    if (!nomeJogador) {
        popup.style.display = 'block';
    } else {
        nomeJogadorElemento.textContent = `Jogador: ${nomeJogador} | Pontos: ${pontos}`;
        escolherPalavra();
    }

    carregarPalavras();
});
