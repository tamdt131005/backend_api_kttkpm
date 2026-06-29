Feature: Kiểm thử chức năng Chỉnh sửa thông tin cá nhân (PUT /api/profile)

  Background:
    # URL cơ sở của API
    * url baseUrl
    
    # Đăng nhập bằng tài khoản thử nghiệm để lấy Token xác thực (JWT)
    Given path '/api/auth/signin'
    And request { username: 'tamdt131005', password: 'Tam13102005@' }
    When method POST
    Then status 200
    * def token = response.token
    
    # Hàm chuyển đổi giá trị chuỗi 'null' từ file CSV thành giá trị null thực sự trong định dạng JSON
    * def n = function(x){ return x == 'null' ? null : x }

  # --- Kịch bản kiểm thử hướng dữ liệu (Data-Driven Testing) sử dụng Scenario Outline ---
  Scenario Outline: <tc> - <desc>
    Given path '/api/profile'
    # Gán Token xác thực vào header của request
    And header Authorization = 'Bearer ' + token
    And request
    """
    {
      "id": #(n(id)),
      "email": #(n(email)),
      "fullname": #(n(fullname)),
      "phone": #(n(phone)),
      "sex": #(n(sex)),
      "ngaysinh": #(n(ngaysinh)),
      "avatar": #(n(avatar))
    }
    """
    When method PUT
    Then status <status>
    And match response.success == <success>

    # Đọc dữ liệu kiểm thử từ file CSV
    Examples:
      | read('profile_data.csv') |