Feature: Kiểm thử API thêm sản phẩm vào giỏ hàng (POST /api/cart)

Background:
    * url baseUrl
    # endpoint thực tế trong mã nguồn backend của bạn là /api/cart
    * def cartEndpoint = '/api/cart'

    # Đăng nhập để lấy token xác thực
    Given path '/api/auth/signin'
    And request { username: 'tamdt131005', password: 'Tam13102005@' }
    When method POST
    Then status 200
    * def token = response.token

    # Dọn dẹp giỏ hàng sạch sẽ trước khi thực hiện mỗi ca kiểm thử để đảm bảo tính độc lập
    * karate.call('clean_cart_helper.feature', { token: token })

Scenario Outline: <testCaseId> - <description>
    # Thiết lập Headers động dựa trên cấu hình trong file CSV
    * def reqHeaders = { 'Content-Type': 'application/json' }
    * if (useToken == 'true') reqHeaders['Authorization'] = 'Bearer ' + token

    # Chuẩn bị dữ liệu nếu là TC04 (đảm bảo sản phẩm 1, biến thể 1 đã có sẵn trong giỏ)
    * if (testCaseId == 'TC04') karate.call('add_helper.feature', { sanpham_id: 1, bienthe_id: 1, soluong: 1, token: token })

    Given path cartEndpoint
    And headers reqHeaders
    And request { sanpham_id: <sanpham_id>, bienthe_id: <bienthe_id>, soluong: <soluong> }
    When method POST
    Then status <expectedStatus>
    And match response.success == <expectedSuccess>
    * print response

    # Dọn dẹp sau khi kết thúc ca kiểm thử cuối cùng để tránh rác dữ liệu
    * if (testCaseId == 'TC06') karate.call('clean_cart_helper.feature', { token: token })

    Examples:
      | read('cart_test_data.csv') |
