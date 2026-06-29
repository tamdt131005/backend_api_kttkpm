Feature: Kiểm thử chức năng đăng nhập (POST /api/auth/signin)

  Background:
    * url baseUrl

  Scenario Outline: <tc> - <desc>
    Given path '/api/auth/signin'
    And request { username: '<username>', password: '<password>' }
    When method POST
    Then status <status>
    And match response.success == <success>

    # Examples:
    # | tc   | desc                          | username   | password     | status | success |
    # | TC01 | Username rỗng                 |            | Pass@123     | 400    | false   |
    # | TC02 | Username quá ngắn (2 ký tự)  | aa         | Pass@123     | 400    | false   |
    # | TC03 | Password rỗng                 | user123    |              | 400    | false   |
    # | TC04 | Password quá ngắn (3 ký tự)  | user123    | 123          | 400    | false   |
    # | TC05 | Username không tồn tại        | usernamev1 | Pass@123     | 404    | false   |
    # | TC06 | Password sai                  | tamdt131005| Pass@sai     | 401    | false   |

    Examples:
      | read('login_data.csv') |

  Scenario: TC07 - Đăng nhập thành công
    Given path '/api/auth/signin'
    And request { username: 'tamdt131005', password: 'Tam13102005@' }
    When method POST
    Then status 200
    And match response.success == true
    And match response.token == '#notnull'
    And match response.user == { id: '#notnull', username: '#string', fullname: '#string', role: '#string', avatar: '##string' }