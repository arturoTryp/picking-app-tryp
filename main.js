let orderIndex = 0;
let local = true;
const token = "Bearer keyqVvsqb9MB4p1Wn";
const btnLocal = document.getElementById("btnLocal");
const btnForaneo = document.getElementById("btnForaneo");
const orderName = document.getElementById("orderName");
const clientName = document.getElementById("clientName");
const clientOrderNumber = document.getElementById("orderNumber");
const orderProductsNumber = document.getElementById("numberOfProducts");
const addressProvince = document.getElementById("addressProvince");
const addressStreet = document.getElementById("addressStreet");
const addressMunicipio = document.getElementById("municipio");
const producstCardsContainer = document.querySelector(
  ".variants-cards-container"
);
const backArrow = document.getElementById("leftArrow");
const nextArrow = document.getElementById("rightArrow");
const pickedCheckbox = document.getElementById("pickedCheckbox");
const params = {
  method: "GET",
  headers: { Authorization: token },
};

main();

//Funcion para llamar a APIs
async function callAPI(urlAPI, params = null) {
  const response = params ? await fetch(urlAPI, params) : await fetch(urlAPI);
  const data = await response.json();
  return data;
}

async function getOrdersData() {
  const response = await callAPI(
    "https://api.airtable.com/v0/appsrYW53pV5fd9IT/tblbHeOGtdNVQQ9FU?fields%5B%5D=Is+First+Order&fields%5B%5D=Name&fields%5B%5D=Name+(Shipping)&fields%5B%5D=Last+Name+(Shipping)&fields%5B%5D=Shipping+Address+1&fields%5B%5D=Shipping+Address+2&fields%5B%5D=Shipping+Province&fields%5B%5D=Tags&fields%5B%5D=Picked+Up&filterByFormula=AND(%7BFinancial+Status%7D%3D%22paid%22%2C+%7BFulfillment+Status%7D%3DBLANK()%2C+SEARCH('prueba'%2CARRAYJOIN(Tags%2C%22%2C%22))+%3D+0)&sort%5B0%5D%5Bfield%5D=Created+At&sort%5B0%5D%5Bdirection%5D=asc",
    params
  );

  const openOrdersArray = response.records;

  const ordersLineItemsObject = await openOrdersArray;

  return await ordersLineItemsObject;
}

async function getLineItems(orderName) {
  const url = `https://api.airtable.com/v0/appsrYW53pV5fd9IT/tbl4dkYqn9YG4MHar?fields%5B%5D=Barcode&fields%5B%5D=Order+Identifier&fields%5B%5D=Product+Name&fields%5B%5D=Quantity&fields%5B%5D=SKU&fields%5B%5D=Variant+Name&fields%5B%5D=Vendor+name&fields%5B%5D=Variant+Img&fields%5B%5D=Product+Imgs&filterByFormula=AND(%7BOrder+Identifier%7D%3D%22${orderName}%22%2C%7BAssigned+Fulfillment+Location%7D%3D%22Zamora+187%22)`;
  const lineItemResponse = await callAPI(url, params);
  return lineItemResponse.records;
}

async function main() {
  const orderData = await getOrdersData();
  let ordersArray;

  if (local) {
    ordersArray = orderData.filter((order) =>
      order.fields.Tags.includes("local")
    );
  } else {
    ordersArray = orderData.filter(
      (order) => !order.fields.Tags.includes("local")
    );
  }

  render(orderIndex, ordersArray, local);
}

async function render(index, ordersArray, local) {
  const ordersAmount = ordersArray.length;
  console.log(ordersArray);
  const order = ordersArray[index].fields;
  const lineItems = await getLineItems(order.Name);
  let cantidadArticulos = 0;

  for (let x in lineItems) {
    cantidadArticulos += lineItems[x].fields.Quantity;
  }

  index == 0
    ? backArrow.classList.add("inactive")
    : backArrow.classList.remove("inactive");

  index == ordersAmount - 1
    ? nextArrow.classList.add("inactive")
    : nextArrow.classList.remove("inactive");

  if (local) {
    btnLocal.classList.add("btn-active");
    btnForaneo.classList.remove("btn-active");
  } else {
    btnLocal.classList.remove("btn-active");
    btnForaneo.classList.add("btn-active");
  }

  orderName.innerText = order.Name;
  clientName.innerText =
    order["Name (Shipping)"] + " " + order["Last Name (Shipping)"];

  if (order["Is First Order"]) {
    clientOrderNumber.innerText = "SI PONER BOLSA TRYP";
    clientOrderNumber.style.color = "var(--cannabis)";
  } else {
    clientOrderNumber.innerText = "NO PONER BOLSA TRYP";
    clientOrderNumber.style.color = "var(--magenta)";
  }

  orderProductsNumber.innerText = `Cantidad de artículos: ${cantidadArticulos}`;

  addressProvince.innerText = order["Shipping Province"][0];
  addressStreet.innerText = order["Shipping Address 1"];
  addressMunicipio.innerText = order["Shipping Address 2"];

  order["Picked Up"]
    ? pickedCheckbox.setAttribute("checked", true)
    : pickedCheckbox.removeAttribute("checked", true);

  console.log(order["Picked Up"]);

  //Crear HTML de Variantes Cards por cara variante

  let HTMLconcat = "";
  lineItems.map((lineItem) => {
    const variantIMGURL = lineItem.fields["Variant Img"]
      ? lineItem.fields["Variant Img"][0].url
      : lineItem.fields["Product Imgs"][0].url;

    const barcode = lineItem.fields["Barcode"]
      ? lineItem.fields["Barcode"][0].text
      : "";

    const lineItemHTML = `<div class="line-item-card-container">
                            <img id="variantImg" src="${variantIMGURL}" alt="" />
                            <div class="variant-data-container">
                            <div>
                                <span id="variantName">${lineItem.fields["Variant Name"][0]}</span>
                                <span id="productName">${lineItem.fields["Product Name"]}</span>
                            </div>
                            <div>
                                <span id="vendorName">${lineItem.fields["Vendor name"]}</span>
                                <span id="quantity">Cantidad: ${lineItem.fields["Quantity"]}</span>
                            </div>
                            </div>
                            <div class="variant-location-container">
                            <span id="barcode">${barcode}</span>
                            <span id="SKU">${lineItem.fields["SKU"]}</span>
                            </div>
                        </div>`;
    HTMLconcat += lineItemHTML;
  });

  producstCardsContainer.innerHTML = HTMLconcat;
}

nextArrow.addEventListener("click", (e) => {
  orderIndex++;
  main();
});

backArrow.addEventListener("click", (e) => {
  orderIndex--;
  main();
});

btnForaneo.addEventListener("click", (e) => {
  local = false;
  orderIndex = 0;
  main();
});

btnLocal.addEventListener("click", (e) => {
  local = true;
  orderIndex = 0;
  main();
});

pickedCheckbox.addEventListener("change", (e) => {
  if (e.target.checked) {
    console.log("checked");
  } else {
    console.log("un-checked");
  }
});
