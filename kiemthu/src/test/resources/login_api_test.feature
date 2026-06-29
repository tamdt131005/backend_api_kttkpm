Feature: Kiểm thử chức năng đăng nhập từ bảng quyết định (POST /api/auth/signin)

Background:
    * url baseUrl

Scenario Outline: <testCaseId> - <description>
    Given path '/api/auth/signin'
    And request { username: '<username>', password: '<password>' }
    When method POST
    Then status <expectedStatus>
    And match response.success == <expectedSuccess>
    * print response

    Examples:
      | read('login_test_data.csv') |
