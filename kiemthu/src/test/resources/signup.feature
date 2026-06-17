Feature: Kiểm thử chức năng đăng ký (POST /api/auth/signup)

  Background:
    * url baseUrl

  # --- Các test case validate dữ liệu đầu vào (Scenario Outline) ---
  Scenario Outline: <tc> - <desc>
    Given path '/api/auth/signup'
    And request { username: '<username>', password: '<password>', email: '<email>' }
    When method POST
    Then status <status>
    And match response.success == <success>

    Examples:
      | tc   | desc                              | username    | password | email            | status | success |
      | TC01 | Username rỗng                     |             | Pass@123 | user@gmail.com   | 400    | false   |
      | TC02 | Username quá ngắn (2 ký tự)       | aa          | Pass@123 | user@gmail.com   | 400    | false   |
      | TC03 | Password rỗng                     | user123     |          | user@gmail.com   | 400    | false   |
      | TC04 | Password quá ngắn (3 ký tự)       | user123     | 123      | user@gmail.com   | 400    | false   |
      | TC05 | Email không hợp lệ                | user123     | Pass@123 | abc              | 400    | false   |

  # --- TC06: Đăng ký với username đã tồn tại ---
  Scenario: TC06 - Đăng ký với username đã tồn tại
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
    Then status 409
    And match response.success == false

  # --- TC07: Đăng ký với email đã tồn tại ---
  Scenario: TC07 - Đăng ký với email đã tồn tại
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
    Then status 409
    And match response.success == false

  # --- TC08: Đăng ký thành công với dữ liệu hợp lệ ---
  Scenario: TC08 - Đăng ký thành công với dữ liệu hợp lệ
    # Tạo username/email ngẫu nhiên để tránh trùng lặp khi chạy lại test
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
    Then status 201
    And match response.success == true
    And match response.message == "Đăng ký tài khoản thành công!"
