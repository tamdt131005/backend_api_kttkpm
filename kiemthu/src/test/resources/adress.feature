Feature: Kiểm thử chức năng thêm địa chỉ giao hàng (POST /api/address)
  Background:
    * url baseUrl
    * def randomStr = java.util.UUID.randomUUID().toString().substring(0, 8)
    * def username = 'user_addr_' + randomStr
    * def email = username + '@test.com'
    Given path '/api/auth/signup'
    And request { username: '#(username)', password: 'Password123@', fullname: 'Test Address User', email: '#(email)' }
    When method POST
    Then status 201
    Given path '/api/auth/signin'
    And request { username: '#(username)', password: 'Password123@' }
    When method POST
    Then status 200
    * def token = response.token
  Scenario Outline: <tc> - <desc>
    Given path '/api/address'
    And header Authorization = 'Bearer ' + token
    And request
    """
    {
      "tennguoinhan": "<tennguoinhan>",
      "sodienthoai": "<sodienthoai>",
      "diachichitiet": "<diachichitiet>",
      "phuong": "<phuong>",
      "quan": "<quan>",
      "tinh": "<tinh>",
      "macdinh": <macdinh>
    }
    """
    When method POST
    Then status <status>
    And match response.success == <success>
    And match response.message == <message>
    Examples:
      | tc   | desc                                                  | tennguoinhan  | sodienthoai | diachichitiet  | phuong            | quan        | tinh    | macdinh | status | success | message                       |
      | TC01 | Thêm địa chỉ mới thành công (không đặt mặc định)     | Nguyen Van A  | 0912345678  | 123 Lang       | Lang Ha           | Dong Da     | Ha Noi  | 0       | 201    | true    | "Thêm địa chỉ thành công"    |
      | TC02 | Thêm địa chỉ thành công và thiết lập làm mặc định    | Nguyen Van B  | 0987654321  | 456 Nguyen Trai| Thanh Xuan Trung  | Thanh Xuan  | Ha Noi  | 1       | 201    | true    | "Thêm địa chỉ thành công"    |
      | TC03 | Thêm địa chỉ thất bại do số điện thoại không hợp lệ  | Nguyen Van A  | 12345       | 123 Lang       | Lang Ha           | Dong Da     | Ha Noi  | 0       | 400    | false   | '#notnull'                    |
  Scenario: TC04 - Thêm địa chỉ thất bại do không gửi Authorization Token
    Given path '/api/address'
    And request
    """
    {
      "tennguoinhan": "Nguyen Van A",
      "sodienthoai": "0912345678",
      "diachichitiet": "123 Lang",
      "phuong": "Lang Ha",
      "quan": "Dong Da",
      "tinh": "Ha Noi",
      "macdinh": 0
    }
    """
    When method POST
    Then status 401
    And match response.success == false
