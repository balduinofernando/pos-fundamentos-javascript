document.addEventListener("DOMContentLoaded", function () {

  let cart = {};
  let itemToRemove = null;

  async function toggleFullscreen() {
    if (!document.fullscreenElement) {
      // Enter fullscreen
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      } else if (document.documentElement.webkitRequestFullscreen) { // Safari
        await document.documentElement.webkitRequestFullscreen();
      } else if (document.documentElement.msRequestFullscreen) { // IE11
        await document.documentElement.msRequestFullscreen();
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (document.webkitExitFullscreen) { // Safari
        await document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) { // IE11
        await document.msExitFullscreen();
      }
    }
  }

  document.getElementById('fullscreen-toggle').addEventListener('click', toggleFullscreen);

  async function getProductsList(pesquisa = '') {
    const url = pesquisa ? `https://dummyjson.com/products/search?q=${pesquisa}` : "https://dummyjson.com/products"

    await fetch(url)
      .then((response) => response.json())
      .then((data) => {
        renderProducts(data.products)
      }).catch((error) => console.error("Error while loading the products", error))
  }

/*   function updateUrlWithSearchTerm(query) {
    const newUrl = query
      ? `${window.location.origin}${window.location.pathname}?pesquisa=${encodeURIComponent(query)}`
      : `${window.location.origin}${window.location.pathname}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
  } */


  document.getElementById("search-input").addEventListener("keydown", async function (event) {
    if (event.key == "Enter") {
      const query = event.target.value;

      // Atualiza a URL sem recarregar a página
   //   updateUrlWithSearchTerm(query)
      getProductsList(query)
    }
  });

  async function renderProducts(products) {

    const productList = document.getElementById('product-list');

    /* Clear the items on page refresh */
    productList.innerHTML = '';

    products.forEach((product) => {
      /* article */
      const articleTag = document.createElement("article");
      articleTag.className = "col cursor-pointer d-flex text-center flex-column";

      /* Image Thumbnail */
      const imageTag = document.createElement("img");
      imageTag.className = "img-thumbnail img-fluid";
      imageTag.src = product.images[0];
      imageTag.alt = product.title
      imageTag.title = product.title

      /* Span para nome, preço e stock */
      const spanTag = document.createElement("p");
      spanTag.className = "fs-6 mb-0";
      spanTag.innerText = `${product.title}`

      const priceQde = document.createElement("p");
      priceQde.className = "fs-6 mb-0";
      priceQde.innerText = `(${formatarMoeda(product.price)}) - Stock: ${product.stock}`

      /* Button - Adicionar */
      const buttonTag = document.createElement("button");
      buttonTag.className = "btn-xs btn btn-dark rounded-0";
      buttonTag.innerText = "Adicionar";
      buttonTag.addEventListener("click", () => addItemToCart(product));

      articleTag.appendChild(imageTag)
      articleTag.appendChild(spanTag)
      articleTag.appendChild(priceQde)
      articleTag.appendChild(buttonTag)

      productList.appendChild(articleTag);
    });

  }

  function formatarMoeda(valor, codigoISO = 'pt-AO', moeda = 'AOA') {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA'
    }).format(valor)
  }

  async function renderCartItems() {
    const cartTableBody = document.querySelector("#cart-items"); // selecciona o tbody
    /* const cartTotal = document.querySelector("#cart-total"); */
    const screenTotal = document.querySelector("#screenTotal");

    cartTableBody.innerHTML = '';

    let total = 0;

    Object.values(cart).forEach(function (item) {
      const linha = document.createElement("tr");

      const colunaQuantidade = document.createElement("td");
      colunaQuantidade.innerText = item.quantity;
      linha.appendChild(colunaQuantidade);

      const colunaNome = document.createElement("td");
      colunaNome.innerText = item.name;
      linha.appendChild(colunaNome);

      const colunaPreco = document.createElement("td");
      colunaPreco.innerText = formatarMoeda(item.price, 'pt-PT', 'EUR');
      linha.appendChild(colunaPreco)

      const colunaSubTotal = document.createElement("td");
      let subTotalValue = item.price * item.quantity;
      colunaSubTotal.innerText = formatarMoeda(subTotalValue);
      linha.appendChild(colunaSubTotal);

      const colunaAcao = document.createElement("td");
      const btnAcaoRemover = document.createElement("button");

      btnAcaoRemover.className = "btn btn-sm btn-outline-danger";
      btnAcaoRemover.innerText = "Remover";
      btnAcaoRemover.addEventListener("click", function () {
        showRemoveItemModal(item);
      })
      colunaAcao.appendChild(btnAcaoRemover);
      linha.appendChild(colunaAcao);

      cartTableBody.appendChild(linha);

      total += item.price * item.quantity;
    });

    /* cartTotal.innerText = `${new Intl.NumberFormat('pt-AO', { style: 'currency', 'currency': 'AOA' }).format(total)}`; */
    screenTotal.innerText = `Total de Compra : ${formatarMoeda(total)}`;

  }

  async function addItemToCart(product) {
    if (!product || !product.id) {
      console.log("produto Inválido", product);
      return;
    }

    if (!cart[product.id]) {
      cart[product.id] = {
        id: product.id,
        name: product.title,
        price: product.price,
        quantity: 1
      };
    } else {
      cart[product.id].quantity += 1;
    }

    console.log("Produto Adicionado ao Carrinho", cart[product.id])
    console.log("Carrinho", cart)

    await renderCartItems();

  }

  async function checkOut() {

  }

  async function showRemoveItemModal(item) {
    itemToRemove = item;

    var keyField = document.getElementById('supervisor-key');
    new bootstrap.Modal(document.getElementById('removeItemModal')).show();


    if (keyField) {
      keyField.value = ''; // Limpa o campo
      // Usa setTimeout para garantir que o DOM esteja pronto para receber o foco
      setTimeout(() => {
        keyField.focus(); // Define o foco no campo
      }, 100); // Ajuste o tempo se necessário
    }
  }


  document.getElementById('confirm-remove-btn').addEventListener('click', async () => {

    const SUPERVISOR_KEY = 123123;
    let key = document.getElementById('supervisor-key').value;

    if (key == SUPERVISOR_KEY) {
      await removeCartItem(itemToRemove);

      new bootstrap.Modal(document.getElementById('removeItemModal')).hide();
      hideModal("removeItemModal");
      document.getElementById('supervisor-key').value = '';

    } else {
      document.getElementById('removal-error').classList.remove('d-none');
    }
  });

  async function removeCartItem(product) {
    if (cart[product.id]) {
      await delete cart[product.id];
    }
    await renderCartItems();
  }

  getProductsList();


  // Função para esconder um modal
  function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('fade');
      modal.classList.remove('show');

      setTimeout(() => {
        modal.style.display = 'none'; // Garante que o modal não esteja visível
        // Remove o backdrop, se presente
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
          backdrop.parentNode.removeChild(backdrop);
        }
      }, 200); // Ajuste o tempo para coincidir com a duração da animação do fade
    }
  }
});
