@ignore
Feature: Thêm item giỏ hàng phục vụ test chuẩn bị

  Background:
    * url baseUrl

  Scenario:
    Given path '/api/cart'
    And header Authorization = 'Bearer ' + token
    * def reqBody = ({ sanpham_id: __arg.sanpham_id, bienthe_id: __arg.bienthe_id, soluong: __arg.soluong })
    And request reqBody
    When method POST
    # Chấp nhận cả 201 (thêm mới thành công) hoặc 400 (đã có sẵn trong giỏ)
    Then assert responseStatus == 201 || responseStatus == 400
