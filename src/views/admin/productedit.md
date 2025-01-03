<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Product Edit</title>

    <!-- font-awesome cdn link -->
    <link rel="stylesheet" href="https://pro.fontawesome.com/releases/v5.10.0/css/all.css"/>

    <!-- custom css file link -->
    <link rel="stylesheet" href="/styles/styles.css">
    <link rel="stylesheet" href="/styles/addProduct.css">

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
</head>
<body>

    <%- include('../partials/admin-header') %>

    <div class="container mt-5">
        <form action="/admin/product/edit/<%= product._id %>" method="post" enctype="multipart/form-data">
            <div class="mb-3">
                <label for="name" class="form-label">Name</label>
                <input name="name" type="text" class="form-control" id="name" value ="<%= product.name %>">
            </div>

            <div class="mb-3">
                <label for="product-category" class="form-label">Category</label>
                <select id="product-category" name="category" class="form-select">
                    <option><%= product.category.name %></option>

                    <% categories.forEach(category => { %>
                        <% if ( product.category.name !== category.name ) { %>
                            <option value="<%= category.name %>"><%= category.name %></option>
                        <% } %>
                        
                    <% }) %>

                </select>
            </div>

            <div class="mb-3">
                <label for="price" class="form-label">Price</label>
                <input name="price" type="number" class="form-control" id="price" value="<%= product.price %> ">
            </div>

            <div class="mb-3">
                <label for="description" class="form-label">Description</label>
                <input name="description" type="text" class="form-control" id="description" value="<%= product.description %>">
            </div>

            <div class="mb-3">
                <label for="quantity" class="form-label">Quantity</label>
                <input name="quantity" type="number" class="form-control" id="quantity" value="<%= product.quantity %>">
            </div>

            <div class="mb-3">
                <label for="image" class="form-label">Image</label>
                <input name="image" type="file" class="form-control" id="image" onchange="previewImage(event) " >
                <!-- for displaying uploded product image -->
                <div class="mt-3">
                    <img id="imagePreview" src="/product-images/<%= product.image %>" alt="Image Preview" style="max-width: 100%; height: auto;  height: 100px;">
                </div>
            </div>

            <div class="mb-3">
                <label for="size" class="form-label">Size</label>
                <input name="size" type="text" class="form-control" id="size" value="<%= product.size %>">
            </div>

            <div class="mb-3">
                <label for="colour" class="form-label">Colour</label>
                <input name="colour" type="text" class="form-control" id="colour" value="<%= product.colour %>">
            </div>

            <div class="form-check form-switch mb-3">
                <input name="isFeatured" class="form-check-input" type="checkbox" id="isFeatured">
                <label class="form-check-label" for="isFeatured">Is featured product</label>
            </div>

            <button type="submit" class="btn btn-primary">update Product</button>
        </form>
    </div>

    <script>
        function previewImage(event){

        const input = event.target;
        const preview = document.getElementById('imagePreview');

        if (input.files && input.files[0]) {
            const reader = new FileReader();

            reader.onload = function(e) {
                preview.src = e.target.result;
                preview.style.display = 'block';
            };

            reader.readAsDataURL(input.files[0]);
        }
}

    </script>

</body>
</html>
