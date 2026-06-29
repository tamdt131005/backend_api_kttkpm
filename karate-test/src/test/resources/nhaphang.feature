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

    # Chuyển API nhập hàng
    * url baseUrl + '/api/admin/nhaphang'
    * header Authorization = 'Bearer ' + token
    * header Content-Type = 'application/json'

Scenario: TC01 - Lưu phiếu nhập thành công

    Given request
    """
    {
      "ghichu_phieu": "Nhập hàng",
      "rows": [
        {
          "bienthe_id": 1,
          "soluong": 10,
          "dongia": 50000,
          "ghichu": ""
        }
      ]
    }
    """
    When method post
    Then status 201
    And match response.success == true
    And match response.data.phieunhap_id == '#number'
* print response

Scenario: TC02 - Biến thể để trống (ko hop le)

    Given request
    """
    {
      "ghichu_phieu": "Nhập hàng",
      "rows": [
        {
          "bienthe_id": "",
          "soluong": 10,
          "dongia": 50000,
          "ghichu": ""
        }
      ]
    }
    """
    When method post
    Then status 400
    And match response.success == false
* print response

Scenario: TC03 - Số lượng bằng 0

    Given request
    """
    {
      "ghichu_phieu": "Nhập hàng",
      "rows": [
        {
          "bienthe_id": 1,
          "soluong": 0,
          "dongia": 50000,
          "ghichu": ""
        }
      ]
    }
    """
    When method post
    Then status 400
    And match response.success == false
* print response

Scenario: TC04 - Đơn giá nhỏ hơn 1000

    Given request
    """
    {
      "ghichu_phieu": "Nhập hàng",
      "rows": [
        {
          "bienthe_id": 1,
          "soluong": 10,
          "dongia": 500,
          "ghichu": ""
        }
      ]
    }
    """
    When method post
    Then status 400
    And match response.success == false
* print response


Scenario: TC05 - Ghi chú phiếu để trống

    Given request
    """
    {
      "ghichu_phieu": "",
      "rows": [
        {
          "bienthe_id": 1,
          "soluong": 10,
          "dongia": 50000,
          "ghichu": ""
        }
      ]
    }
    """
    When method post
    Then status 201
    And match response.success == true
* print response

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
* print response

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
* print response
#######################################################
# TC08 - Nhiều dòng sản phẩm hợp lệ
#######################################################

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
* print response
#######################################################
# TC09 - Request Body rỗng
#######################################################

Scenario: TC09 - Body rỗng

    Given request
    """
    {
    }
    """
    When method post
    Then status 400
    And match response.success == false
    * print response