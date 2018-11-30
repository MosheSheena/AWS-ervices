/*

/!*global WildRydes _config*!/

var AWS = window.AWS || {};

var data;
/!*
= [
    { "Name": "item1", "ProviderId": "1111","Cost": "100","Description": "alalala","TimeToDeliver": "1/01/2019","Quantity": "1" },
    { "Name": "item2", "ProviderId": "2222","Cost": "200","Description": "blalala","TimeToDeliver": "1/02/2019","Quantity": "2" },
    { "Name": "item3", "ProviderId": "3333","Cost": "300","Description": "clalala","TimeToDeliver": "1/02/2019","Quantity": "3" }
];
*!/

(function productsScopeWrapper($) {
    /////////////////////////////Handlers/////////////////////////////

    function handleRequestProducts() {
        // GET request to display the changes
        requestProducts();

    }


    function handleUploadProduct(productDetails) {
        // POST request to upload a product
        postProduct(productDetails);

        // GET request to display the changes
        requestProducts();

    }

    function handleBuyProduct(productDetails) {

        // POST request for buying a product
        requestBuyProduct(productDetails);

        // GET request to display the changes
        requestProducts();
    }

/////////////////////////////Handlers/////////////////////////////



//////////////////////////Ajax (HTTP methods)//////////////////////////

    function requestProducts() {
        $.ajax({
            method: 'GET',
            url: _config.api.invokeUrl + '/products',
            contentType: 'application/json',
            success: function ajaxSuccess(json) {
                data = json;
                createCard(data);
            },
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error requesting products: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                console.log("Status: " + jqXHR.status);
            }
        });
    }

    function postProduct(productToPost) {
        $.ajax({
            method: 'POST',
            url: _config.api.invokeUrl + '/products',
            headers: {
                Authorization: authToken
            },
            data: JSON.stringify({
                product: {
                    Name: productToPost.Name,
                    Cost: productToPost.Cost,
                    ProviderId: productToPost.ProviderId,
                    TimeToDeliver: productToPost.TimeToDeliver,
                    Quantity: productToPost.Quantity
                }
            }),
            contentType: 'application/json',
            success: function ajaxSuccess(code) {
                alert("upload has made!" + code);
            },
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error uploading your product: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                alert('An error occurred when upload a product:\n' + jqXHR.responseText);
            }
        });
    }

    function requestBuyProduct(productToBuy) {
        $.ajax({
            method: 'POST',
            url: _config.api.invokeUrl + '/purchase',
            headers: {
                Authorization: authToken
            },
            data: JSON.stringify({
                product: {
                    Name: productToBuy.Name,
                    Cost: productToBuy.Cost,
                    ProviderId: productToBuy.ProviderId,
                    TimeToDeliver: productToBuy.TimeToDeliver,
                    Quantity: productToBuy.Quantity
                }
            }),
            contentType: 'application/json',
            success: function ajaxSuccess(code) {
                alert("purchase has made!" + code);
            },
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error uploading your product: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                alert('An error occurred when trying to buy this product:\n' + jqXHR.responseText);
            }
        });
    }

//////////////////////////Ajax (HTTP methods)//////////////////////////
}(jQuery));

*/
