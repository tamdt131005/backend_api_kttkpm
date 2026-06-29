Feature: Kiểm thử chức năng đăng ký (POST /api/auth/signup)

  Background:
    # Thiết lập URL cơ sở cho API từ file karate-config.js
    * url baseUrl

  # --- Các test case validate định dạng dữ liệu đầu vào (Scenario Outline) ---
  Scenario Outline: <tc> - <desc>
    Given path '/api/auth/signup'
    And request { username: '<username>', password: '<password>', email: '<email>' }
    When method POST
    Then status <status>
    And match response.success == <success>

    Examples:
      | tc   | desc                        | username      | password   | email             | status | success |
      | TC01 | Username rỗng               |               | Pass@123   | user@gmail.com    | 400    | false   |
      | TC02 | Username quá ngắn (2 ký tự) | aa            | Pass@123   | user@gmail.com    | 400    | false   |
      | TC03 | Password rỗng               | user123       |            | user@gmail.com    | 400    | false   |
      | TC04 | Password quá ngắn (3 ký tự) | user123       | 123        | user@gmail.com    | 400    | false   |
      | TC05 | Email không hợp lệ          | user123       | Pass@123   | abc               | 400    | false   |
      | TC06 | Email không đúng định dạng  | user123456789 | Pass@12345 | abcgb             | 400    | false   |

  # --- Các test case kiểm tra logic nghiệp vụ đăng ký hệ thống ---

  # TC07: Đăng ký tài khoản nhưng tên đăng nhập đã tồn tại trong cơ sở dữ liệu
  Scenario: TC07 - Đăng ký với username đã tồn tại
    Given path '/api/auth/signup'
    And request
    """
    {
      "username": "tamdt131005",
      "password": "Pass@123",
      "email": "newuser@gmail.com"
    }
    """
    When method POST
    # Mong đợi mã lỗi 409 Conflict
    Then status 409
    And match response.success == false
    And match response.message == "Tên đăng nhập đã tồn tại!"

  # TC08: Đăng ký tài khoản nhưng email đã được sử dụng trước đó
  Scenario: TC08 - Đăng ký với email đã tồn tại
    Given path '/api/auth/signup'
    And request
    """
    {
      "username": "usernew",
      "password": "Pass@123",
      "email": "admin@gmail.com"
    }
    """
    When method POST
    # Mong đợi mã lỗi 409 Conflict
    Then status 409
    And match response.success == false
    And match response.message == "Email này đã được sử dụng!"

  # TC09: Đăng ký thành công với tất cả dữ liệu hợp lệ
  Scenario: TC09 - Đăng ký thành công với dữ liệu hợp lệ
    # Sử dụng thư viện Java UUID để sinh chuỗi ngẫu nhiên nhằm tránh bị trùng lặp dữ liệu khi chạy lại test nhiều lần
    * def randomStr = java.util.UUID.randomUUID().toString().substring(0, 8)
    * def testUsername = 'user_test_' + randomStr
    * def testEmail = testUsername + '@gmail.com'
    
    Given path '/api/auth/signup'
    And request
    """
    {
      "username": "#(testUsername)",
      "password": "Pass@123",
      "fullname": "User Test",
      "email": "#(testEmail)"
    }
    """
    When method POST
    # Mong đợi mã trạng thái 201 Created khi đăng ký thành công
    Then status 201
    And match response.success == true
    And match response.message == "Đăng ký tài khoản thành công!"
