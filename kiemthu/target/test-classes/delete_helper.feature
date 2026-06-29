@ignore
Feature: Xóa item giỏ hàng phục vụ test dọn dẹp

  Background:
    * url baseUrl

  Scenario:
    Given path '/api/cart/' + giohang_id
    And header Authorization = 'Bearer ' + token
    When method DELETE
    Then status 200
