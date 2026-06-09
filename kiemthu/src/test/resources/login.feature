Feature: Kịch bản kiểm thử API Xác thực và Giỏ hàng với JWT

  Background:
    # URL gốc được lấy từ karate-config.js (mặc định là http://localhost:3000)
    * url baseUrl
    # Tạo chuỗi ngẫu nhiên để đảm bảo không bị trùng lặp username/email khi chạy lại test
    * def randomStr = java.util.UUID.randomUUID().toString().substring(0, 8)
    * def username = 'user_' + randomStr
    * def email = username + '@test.com'

  Scenario: Đăng ký, Đăng nhập thành công và truy cập API bảo mật bằng JWT

    # --- BƯỚC 1: ĐĂNG KÝ TÀI KHOẢN ---
    Given path '/api/auth/signup'
    And request
    """
    {
      "username": '#(username)',
      "password": "Password123@",
      "fullname": "Nguoi Dung Test JWT",
      "email": '#(email)'
    }
    """
    When method POST
    Then status 201
    And match response.success == true
    And match response.message == "Đăng ký tài khoản thành công!"

    # --- BƯỚC 2: ĐĂNG NHẬP LẤY TOKEN JWT ---
    Given path '/api/auth/signin'
    And request
    """
    {
      "username": '#(username)',
      "password": "Password123@"
    }
    """
    When method POST
    Then status 200
    And match response.success == true
    And match response.token != null
    And match response.user.username == username
    # Lưu token lại để sử dụng cho các request sau
    * def token = response.token

    # --- BƯỚC 3: TRUY CẬP API GIỎ HÀNG BẢO MẬT (Không kèm Token - Mong đợi lỗi 401) ---
    Given path '/api/cart'
    When method GET
    Then status 401
    And match response.success == false

    # --- BƯỚC 4: TRUY CẬP API GIỎ HÀNG BẢO MẬT (Kèm Token hợp lệ - Mong đợi thành công 200) ---
    Given path '/api/cart'
    And header Authorization = 'Bearer ' + token
    When method GET
    Then status 200
    And match response.success == true
    And match response.message == "Lấy giỏ hàng thành công"