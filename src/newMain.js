const token2 = "Bearer keyqVvsqb9MB4p1Wn";

async function sortByKey(array, key) {
  return array.sort(function(a, b) {
    var x = a[key];
    var y = b[key];
    return x < y ? -1 : x > y ? 1 : 0;
  });
}
//Funcion para llamar a APIs
async function callAPI(urlAPI, params = null) {
  const response = params ? await fetch(urlAPI, params) : await fetch(urlAPI);
  const data = await response.json();
  return data;
}

async function getSelectedOrders() {
  let url =
    "https://api.airtable.com/v0/appsrYW53pV5fd9IT/tblbHeOGtdNVQQ9FU/listRecords";
  const formula = `AND( {Financial Status}="paid", FIND("local",ARRAYJOIN(Tags)), NOT(FIND("prueba",ARRAYJOIN(Tags))), OR({Fulfillment Status}=BLANK(), {Fulfillment Status}="partial" ) )`;
  const body = {
    fields: ["Picked Up", "Name", "∞ Shopify Id"],
    filterByFormula: formula,
  };

  const params = {
    method: "POST",
    headers: { Authorization: token2, "Content-type": "application/json" },
    body: JSON.stringify(body),
  };

  const response = await callAPI(url, params);

  const openOrdersArray = await response.records;

  return openOrdersArray;
}

async function getOrderLineItems() {
  const ordersArray = await getSelectedOrders();

  lineItemsArray = [];

  console.log("Ordenes", ordersArray);

  for (let order of ordersArray) {
    const formula = `AND({Shopify Order ID} =${order.fields["∞ Shopify Id"]})`;
    let url =
      "https://api.airtable.com/v0/appsrYW53pV5fd9IT/tbl4dkYqn9YG4MHar/listRecords";
    const body = {
      fields: [
        "Barcode",
        "Name",
        "∞ Shopify Id",
        "Quantity",
        "Variant Name",
        "Variant Img",
        "Product Imgs",
      ],
      filterByFormula: formula,
    };
    const params = {
      method: "POST",
      headers: { Authorization: token2, "Content-type": "application/json" },
      body: JSON.stringify(body),
    };
    const response = await callAPI(url, params);

    for (let record of response.records) {
      lineItemsArray.push(record);
    }
  }

  console.log("All line items", lineItemsArray);

  const filterLineItemsArray = [];

  for (let line of lineItemsArray) {
    if (line.fields.Name !== "Tip") filterLineItemsArray.push(line.fields);
  }

  console.log("Filtered line items", filterLineItemsArray);
  let lastLineItemArray = [];

  filterLineItemsArray.forEach((object) => {
    object["location"] = object.Barcode[0].text;
    object["mueble"] = parseInt(
      object.Barcode[0].text.substring(0, object.Barcode[0].text.indexOf("-"))
    );
    lastLineItemArray.push(object);
  });

  const sortedArray = await sortByKey(lastLineItemArray, "mueble");

  console.log("sorted array", sortedArray);
  return sortedArray;
}

(async () => {
  const listaSuper = await getOrderLineItems();
  console.log("Lista de super", listaSuper);
})();
