Feature: Kiểm thử chức năng Giỏ hàng (API Cart)

  Background:
    * url baseUrl
    # Đăng nhập để lấy token xác thực
    Given path '/api/auth/signin'
    And request { username: 'tamdt131005', password: 'Tam13102005@' }
    When method POST
    Then status 200
    * def token = response.token

  Scenario: TC01 - Validate dữ liệu đầu vào khi thêm sản phẩm vào giỏ hàng (sanpham_id không hợp lệ)
    Given path '/api/cart'
    And header Authorization = 'Bearer ' + token
    And request { sanpham_id: 'abc', bienthe_id: 1, soluong: 2 }
    When method POST
    Then status 400
    And match response.success == false
    And match response.message == "Dữ liệu đầu vào không hợp lệ"

  Scenario: TC02 - Validate dữ liệu đầu vào khi thêm sản phẩm vào giỏ hàng (soluong nhỏ hơn 1)
    Given path '/api/cart'
    And header Authorization = 'Bearer ' + token
    And request { sanpham_id: 1, bienthe_id: 1, soluong: 0 }
    When method POST
    Then status 400
    And match response.success == false
    And match response.message == "Dữ liệu đầu vào không hợp lệ"

  Scenario: TC03 - Validate dữ liệu đầu vào khi cập nhật giỏ hàng (soluong không hợp lệ)
    Given path '/api/cart/1'
    And header Authorization = 'Bearer ' + token
    And request { soluong: -5 }
    When method PUT
    Then status 400
    And match response.success == false

  Scenario: TC04 - Validate dữ liệu đầu vào khi cập nhật giỏ hàng (ID giỏ hàng trong URL không phải là số)
    Given path '/api/cart/abc'
    And header Authorization = 'Bearer ' + token
    And request { soluong: 2 }
    When method PUT
    Then status 400
    And match response.success == false

  Scenario: TC05 - Thêm sản phẩm vượt quá tồn kho thực tế
    Given path '/api/cart'
    And header Authorization = 'Bearer ' + token
    # Biến thể 1 có tồn kho là 50 (theo dữ liệu sql_v2)
    And request { sanpham_id: 1, bienthe_id: 1, soluong: 100 }
    When method POST
    Then status 400
    And match response.success == false
    And match response.message contains "Số lượng vượt quá tồn kho"

  Scenario: TC06 - Luồng nghiệp vụ giỏ hàng (Thêm -> Cộng dồn -> Cập nhật hợp lệ -> Cập nhật quá tồn kho -> Xóa)
    # Dọn dẹp sản phẩm trùng nếu có từ trước trong giỏ hàng để tránh cộng dồn sai lệch tồn kho
    Given path '/api/cart'
    And header Authorization = 'Bearer ' + token
    When method GET
    Then status 200
    * def items = response.data.items
    * def filtered = karate.filter(items, function(x){ return x.sanpham_id == 1 && x.bienthe_id == 1 })
    * def oldItem = filtered.length > 0 ? filtered[0] : null
    * if (oldItem) karate.call('delete_helper.feature', { giohang_id: oldItem.giohang_id, token: token })

    # 1. Thêm mới sản phẩm vào giỏ hàng
    Given path '/api/cart'
    And header Authorization = 'Bearer ' + token
    And request { sanpham_id: 1, bienthe_id: 1, soluong: 5 }
    When method POST
    Then status 201
    And match response.success == true
    And match response.message == "Thêm vào giỏ hàng thành công"
    * def giohang_id = response.data.giohang_id
    * assert giohang_id != null

    # 2. Thử thêm cùng sản phẩm & biến thể đó một lần nữa -> Phải báo lỗi 400 và không cho thêm
    Given path '/api/cart'
    And header Authorization = 'Bearer ' + token
    And request { sanpham_id: 1, bienthe_id: 1, soluong: 3 }
    When method POST
    Then status 400
    And match response.success == false
    And match response.message == "Sản phẩm đã có trong giỏ hàng"

    # Kiểm tra giỏ hàng để xác nhận số lượng vẫn là 5 (không đổi)
    Given path '/api/cart'
    And header Authorization = 'Bearer ' + token
    When method GET
    Then status 200
    And match response.success == true
    * def items = response.data.items
    * def addedItem = karate.filter(items, function(x){ return x.giohang_id == giohang_id })[0]
    * match addedItem.soluong == 5

    # 3. Cập nhật số lượng lên 15 cái (vẫn nhỏ hơn tồn kho 50)
    Given path '/api/cart/' + giohang_id
    And header Authorization = 'Bearer ' + token
    And request { soluong: 15 }
    When method PUT
    Then status 200
    And match response.success == true
    And match response.message == "Cập nhật giỏ hàng thành công"

    # Kiểm tra giỏ hàng xem số lượng đã lên 15 chưa
    Given path '/api/cart'
    And header Authorization = 'Bearer ' + token
    When method GET
    Then status 200
    * def items = response.data.items
    * def updatedItem = karate.filter(items, function(x){ return x.giohang_id == giohang_id })[0]
    * match updatedItem.soluong == 15

    # 4. Cập nhật số lượng vượt quá tồn kho (ví dụ 99999 cái) -> Phải lỗi 400
    Given path '/api/cart/' + giohang_id
    And header Authorization = 'Bearer ' + token
    And request { soluong: 99999 }
    When method PUT
    Then status 400
    And match response.success == false
    And match response.message contains "Số lượng vượt quá tồn kho"

    # 5. Xóa sản phẩm khỏi giỏ hàng
    Given path '/api/cart/' + giohang_id
    And header Authorization = 'Bearer ' + token
    When method DELETE
    Then status 200
    And match response.success == true
    And match response.message == "Xóa sản phẩm khỏi giỏ thành công"

    # Kiểm tra giỏ hàng xem sản phẩm đã biến mất chưa
    Given path '/api/cart'
    And header Authorization = 'Bearer ' + token
    When method GET
    Then status 200
    * def items = response.data.items
    * def deletedItem = karate.filter(items, function(x){ return x.giohang_id == giohang_id })
    * match deletedItem == []
