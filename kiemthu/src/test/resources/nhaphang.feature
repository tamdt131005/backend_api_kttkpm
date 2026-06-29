Feature: Kiểm thử API lưu phiếu nhập

Background:
    * url baseUrl

    # Đăng nhập
    Given path '/api/auth/signin'
    And request
    """
    {
      "username": "admin",
      "password": "123456"
    }
    """
    When method post
    Then status 200

    * def token = response.token

    * url baseUrl + '/api/admin/nhaphang'
    * header Authorization = 'Bearer ' + token
    * header Content-Type = 'application/json'

Scenario Outline: <tc> - <desc>

    * def rows =
    """
    [
      {
        "bienthe_id": #(bienthe_id),
        "soluong": #(soluong),
        "dongia": #(dongia),
        "ghichu": ""
      }
    ]
    """

    Given request
    """
    {
      "ghichu_phieu": "#(ghichu)",
      "rows": #(rows)
    }
    """

    When method post
    Then status <status>
    And match response.success == <success>

Examples:
| tc   | desc                     | bienthe_id | soluong | dongia | ghichu      | status | success |
| TC01 | Lưu thành công           | 1          | 10       | 50000   | Nhập hàng   | 201    | true    |
| TC02 | Biến thể không hợp lệ    | ''         | 10       | 50000   | Nhập hàng   | 400    | false   |
| TC03 | Số lượng bằng 0          | 1          | 0        | 50000   | Nhập hàng   | 400    | false   |
| TC04 | Đơn giá nhỏ hơn 1000     | 1          | 10       | 500     | Nhập hàng   | 400    | false   |
| TC05 | Ghi chú để trống         | 1          | 10       | 50000   |             | 201    | true    |

Scenario: TC06 - Thiếu trường rows

    Given request
    """
    {
      "ghichu_phieu": "Nhập hàng"
    }
    """
    When method post
    Then status 400
    And match response.success == false

# TC07 - Danh sách sản phẩm rỗng

Scenario: TC07 - rows rỗng

    Given request
    """
    {
      "ghichu_phieu": "Nhập hàng",
      "rows": []
    }
    """
    When method post
    Then status 400
    And match response.success == false

Scenario: TC08 - Nhiều dòng sản phẩm

    Given request
    """
    {
      "ghichu_phieu": "Nhập nhiều sản phẩm",
      "rows": [
        {
          "bienthe_id": 1,
          "soluong": 5,
          "dongia": 50000,
          "ghichu": ""
        },
        {
          "bienthe_id": 2,
          "soluong": 3,
          "dongia": 70000,
          "ghichu": ""
        }
      ]
    }
    """
    When method post
    Then status 201
    And match response.success == true
    And match response.data.phieunhap_id == '#number'

Scenario: TC09 - Body rỗng

    Given request
    """
    {
    }
    """
    When method post
    Then status 400
    And match response.success == false