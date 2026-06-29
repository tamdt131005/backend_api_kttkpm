@ignore
Feature: Dọn dẹp các sản phẩm test khỏi giỏ hàng một cách an toàn

  Background:
    * url baseUrl

  Scenario:
    Given path '/api/cart'
    And header Authorization = 'Bearer ' + token
    When method GET
    Then status 200
    * def items = response.data.items
    
    # Tìm item sản phẩm 1, biến thể 1
    * def filter1 = function(x){ return x.sanpham_id == 1 && x.bienthe_id == 1 }
    * def items1 = karate.filter(items, filter1)
    * def id1 = items1.length > 0 ? items1[0].giohang_id : null

    # Tìm item sản phẩm 2, biến thể 3
    * def filter2 = function(x){ return x.sanpham_id == 2 && x.bienthe_id == 3 }
    * def items2 = karate.filter(items, filter2)
    * def id2 = items2.length > 0 ? items2[0].giohang_id : null

    # Thực hiện xóa tuần tự (phẳng) nếu tồn tại
    * if (id1 != null) karate.call('delete_helper.feature', { giohang_id: id1, token: token })
    * if (id2 != null) karate.call('delete_helper.feature', { giohang_id: id2, token: token })
