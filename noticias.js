const slider = document.getElementById("slider");
const indicatorsContainer = document.getElementById("sliderIndicators");
const areaDev = document.getElementById("areaDev");
const loginDev = document.getElementById("loginDev");

const formNoticia = document.getElementById("formNoticia");
const formSlide = document.getElementById("formSlide");

const mensagem = document.getElementById("mensagem");
const loading = document.getElementById("loading");
const listaNoticias = document.getElementById("listaNoticias");

const API_URL = 'https://76f08b4f-e4c1-4e2c-9b33-819d2a22a673-00-12vpqmhqy112a.worf.replit.dev';
const IMAGEM_PADRAO = "https://via.placeholder.com/800x300?text=Padrão";

let noticias = [];
let slides = [
  { id: 1, imagem: "silk-stories.png" },
  { id: 2, imagem: "camisas.jpg" },
  { id: 3, imagem: "silk-stories.png" }
];

let devLogado = false;
let slideIndex = 0;
let slideEditando = null;
let noticiaEditando = null;

//---------------------------------------------------------
// SLIDER CORRIGIDO (AGORA FUNCIONA 100%)
//---------------------------------------------------------
function renderizarSlider() {
  slider.innerHTML = "";
  indicatorsContainer.innerHTML = "";

  slides.forEach((s, i) => {
    const slide = document.createElement("div");
    slide.classList.add("slide");

    // AGORA ATIVA O SLIDE CORRETO (CORREÇÃO)
    if (i === slideIndex) slide.classList.add("active");

    slide.innerHTML = `
      <img src="${s.imagem}" alt="Slide ${i+1}">
    `;

    // MODO DEV – BOTÕES
    if (devLogado) {
      const acoes = document.createElement("div");
      acoes.classList.add("acoes");

      const btnEditar = document.createElement("button");
      btnEditar.textContent = "✏️ Editar";
      btnEditar.onclick = () => carregarSlideNoForm(s.id);

      const btnExcluir = document.createElement("button");
      btnExcluir.textContent = "🗑️ Excluir";
      btnExcluir.onclick = () => excluirSlide(s.id);

      acoes.appendChild(btnEditar);
      acoes.appendChild(btnExcluir);
      slide.appendChild(acoes);
    }

    slider.appendChild(slide);

    // INDICADORES (CORRIGIDO)
    const dot = document.createElement("div");
    dot.classList.add("dot");
    if (i === slideIndex) dot.classList.add("active");

    dot.addEventListener("click", () => showSlide(i));
    indicatorsContainer.appendChild(dot);
  });
}

function showSlide(index) {
  slideIndex = index;

  const slidesEl = document.querySelectorAll(".slide");
  const dots = document.querySelectorAll(".dot");

  slidesEl.forEach((s, i) => s.classList.toggle("active", i === slideIndex));
  dots.forEach((d, i) => d.classList.toggle("active", i === slideIndex));
}

function nextSlide() {
  slideIndex = (slideIndex + 1) % slides.length;
  renderizarSlider();
}

function prevSlide() {
  slideIndex = (slideIndex - 1 + slides.length) % slides.length;
  renderizarSlider();
}

// Autoplay
setInterval(() => nextSlide(), 5000);

//---------------------------------------------------------
// NOTÍCIAS
//---------------------------------------------------------
async function carregarNoticias() {
  try {
    loading.style.display = "block";
    const res = await fetch(API_URL + '/noticias');
    noticias = await res.json();
    renderizarNoticias();
  } finally {
    loading.style.display = "none";
  }
}

function renderizarNoticias() {
  listaNoticias.innerHTML = "";

  noticias.forEach(n => {
    const card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML = `
      <img src="${n.imagem || IMAGEM_PADRAO}">
      <h2>${n.titulo}</h2>
      <p>${n.descricao}</p>
    `;

    // Botões DEV
    if (devLogado) {
      const acoes = document.createElement("div");
      acoes.classList.add("acoes");

      const btnEditar = document.createElement("button");
      btnEditar.textContent = "✏️ Editar";
      btnEditar.onclick = () => carregarNoticiaNoForm(n);

      const btnExcluir = document.createElement("button");
      btnExcluir.textContent = "🗑️ Excluir";
      btnExcluir.onclick = () => excluirNoticia(n.id);

      acoes.appendChild(btnEditar);
      acoes.appendChild(btnExcluir);
      card.appendChild(acoes);
    }

    listaNoticias.appendChild(card);
  });
}

//---------------------------------------------------------
// LOGIN DEV
//---------------------------------------------------------
loginDev.addEventListener("click", () => {
  if (!devLogado) {
    const u = prompt("Usuário:");
    const s = prompt("Senha:");

    if (u === "admin" && s === "domis2025") {
      devLogado = true;
      areaDev.style.display = "block";
      loginDev.textContent = "🚪 Sair do Modo Dev";
    } else {
      alert("Acesso negado!");
      return;
    }
  } else {
    devLogado = false;
    areaDev.style.display = "none";
    loginDev.textContent = "👨‍💻 Entrar como Desenvolvedor";
  }

  renderizarSlider();
  renderizarNoticias();
});

//---------------------------------------------------------
// CRUD NOTICIAS
//---------------------------------------------------------
function carregarNoticiaNoForm(n) {
  noticiaEditando = n.id;
  formNoticia.titulo.value = n.titulo;
  formNoticia.descricao.value = n.descricao;
  formNoticia.imagem.value = n.imagem;
}

formNoticia.addEventListener("submit", async e => {
  e.preventDefault();

  const titulo = formNoticia.titulo.value.trim();
  const descricao = formNoticia.descricao.value.trim();
  const imagem = formNoticia.imagem.value.trim() || IMAGEM_PADRAO;

  if (!titulo || !descricao) return mostrarMensagem("Preencha tudo!", true);

  if (noticiaEditando) {
    await fetch(`${API_URL}/noticias/${noticiaEditando}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titulo, descricao, imagem })
    });

    noticiaEditando = null;
    mostrarMensagem("Notícia atualizada!");
  } else {
    await fetch(`${API_URL}/noticias`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titulo, descricao, imagem })
    });

    mostrarMensagem("Notícia adicionada!");
  }

  formNoticia.reset();
  carregarNoticias();
});

//---------------------------------------------------------
// CRUD SLIDES
//---------------------------------------------------------
function carregarSlideNoForm(id) {
  const slide = slides.find(s => s.id === id);
  slideEditando = id;
  formSlide.slideImagem.value = slide.imagem;
}

document.getElementById("editarSlide").addEventListener("click", () => {
  if (!slideEditando) {
    mostrarMensagem("Selecione um slide para editar!", true);
    return;
  }

  const imagem = formSlide.slideImagem.value.trim();
  const i = slides.findIndex(s => s.id === slideEditando);

  slides[i].imagem = imagem || IMAGEM_PADRAO;

  slideEditando = null;
  formSlide.reset();
  renderizarSlider();
  mostrarMensagem("Slide atualizado!");
});

document.getElementById("adicionarSlide").addEventListener("click", () => {
  const imagem = formSlide.slideImagem.value.trim() || IMAGEM_PADRAO;

  slides.push({
    id: Date.now(),
    imagem
  });

  formSlide.reset();
  renderizarSlider();
  mostrarMensagem("Novo slide adicionado!");
});

//---------------------------------------------------------
// DELETE
//---------------------------------------------------------
async function excluirNoticia(id) {
  await fetch(`${API_URL}/noticias/${id}`, { method: "DELETE" });
  mostrarMensagem("Notícia excluída!");
  carregarNoticias();
}

function excluirSlide(id) {
  slides = slides.filter(s => s.id !== id);
  slideIndex = 0;
  renderizarSlider();
  mostrarMensagem("Slide excluído!");
}

//---------------------------------------------------------
function mostrarMensagem(t, erro = false) {
  mensagem.style.display = "block";
  mensagem.style.background = erro ? "#e74c3c" : "#2ecc71";
  mensagem.textContent = t;
  setTimeout(() => mensagem.style.display = "none", 3000);
}

//---------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  renderizarSlider();
  carregarNoticias();
});