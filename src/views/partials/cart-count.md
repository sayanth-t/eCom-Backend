                    <!-- Cart Icon -->
                    <a href="/cart" class="icon-header-item cl2 hov-cl1 trans-04 p-l-22 p-r-11 icon-header-noti js-show-cart" <% if(cartProductCount){ %>
                        data-notify = "<%= cartProductCount %>"
                      <% } else{ %>  
                        data-notify = "0"
                     <% } %>>
                        <i class="zmdi zmdi-shopping-cart"></i>
                    </a>
