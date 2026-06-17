Feature: Kiểm thử API cập nhật thông tin User (PUT /api/profile)

  Background:
    * url baseUrl
    # Đăng nhập để lấy token xác thực
    Given path '/api/auth/signin'
    And request { username: 'tamdt131005', password: 'Tam13102005@' }
    When method POST
    Then status 200
    * def token = response.token

  Scenario: th1: id ký tự chữ hoặc ký tự đặc biệt
    Given path '/api/profile'
    And header Authorization = 'Bearer ' + token
    And request { id: "a", email: 'user1@gmail.com', fullname: null, phone: null, sex: null, ngaysinh: null, avatar: null }
    When method put
    Then status 400

  Scenario: th2: id ko có trong database
    Given path '/api/profile'
    And header Authorization = 'Bearer ' + token
    And request { id: 100, email: 'user1@gmail.com', fullname: null, phone: null, sex: null, ngaysinh: null, avatar: null }
    When method put
    Then status 500

  Scenario: th3: id null hoặc rỗng
    Given path '/api/profile'
    And header Authorization = 'Bearer ' + token
    And request { id: null, email: 'user1@gmail.com', fullname: null, phone: null, sex: null, ngaysinh: null, avatar: null }
    When method put
    Then status 400

  Scenario: th4: email trùng user khác
    Given path '/api/profile'
    And header Authorization = 'Bearer ' + token
    And request { id: 2, email: 'admin@gmail.com', fullname: null, phone: null, sex: null, ngaysinh: null, avatar: null }
    When method put
    Then status 500

  Scenario: th5: email sai định dạng
    Given path '/api/profile'
    And header Authorization = 'Bearer ' + token
    And request { id: 2, email: 'user1gmail.com', fullname: null, phone: null, sex: null, ngaysinh: null, avatar: null }
    When method put
    Then status 400

  Scenario: th6: email ít hơn 3 ký tự
    Given path '/api/profile'
    And header Authorization = 'Bearer ' + token
    And request { id: 2, email: 'u@', fullname: null, phone: null, sex: null, ngaysinh: null, avatar: null }
    When method put
    Then status 400

  Scenario: th7: email quá 100 ký tự
    Given path '/api/profile'
    And header Authorization = 'Bearer ' + token
    And request { id: 2, email: 'iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii@gmail.com', fullname: null, phone: null, sex: null, ngaysinh: null, avatar: null }
    When method put
    Then status 400

  Scenario: th8: email có kdl khác string
    Given path '/api/profile'
    And header Authorization = 'Bearer ' + token
    And request { id: 2, email: 1111111, fullname: null, phone: null, sex: null, ngaysinh: null, avatar: null }
    When method put
    Then status 400

  Scenario: th9: email null hoặc rỗng
    Given path '/api/profile'
    And header Authorization = 'Bearer ' + token
    And request { id: 2, email: "", fullname: null, phone: null, sex: null, ngaysinh: null, avatar: null }
    When method put
    Then status 400

  Scenario: th10: fullname dưới 3 ký tự
    Given path '/api/profile'
    And header Authorization = 'Bearer ' + token
    And request { id: 2, email: 'user1@gmail.com', fullname: 'N', phone: null, sex: null, ngaysinh: null, avatar: null }
    When method put
    Then status 400

  Scenario: th11: fullname trên 50 ký tự
    Given path '/api/profile'
    And header Authorization = 'Bearer ' + token
    And request { id: 2, email: 'user1@gmail.com', fullname: 'iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii', phone: null, sex: null, ngaysinh: null, avatar: null }
    When method put
    Then status 400

  Scenario: th12: fullname kdl không phải là string
    Given path '/api/profile'
    And header Authorization = 'Bearer ' + token
    And request { id: 2, email: 'user1@gmail.com', fullname: 1111111, phone: null, sex: null, ngaysinh: null, avatar: null }
    When method put
    Then status 400

  Scenario: th13: phone sai định dạng số điện thoại
    Given path '/api/profile'
    And header Authorization = 'Bearer ' + token
    And request { id: 2, email: 'user1@gmail.com', fullname: null, phone: '123456789', sex: null, ngaysinh: null, avatar: null }
    When method put
    Then status 400

  Scenario: th14: phone kdl không phải là string
    Given path '/api/profile'
    And header Authorization = 'Bearer ' + token
    And request { id: 2, email: 'user1@gmail.com', fullname: null, phone: 0123456789, sex: null, ngaysinh: null, avatar: null }
    When method put
    Then status 400

  Scenario: th15: sex sai định dạng
    Given path '/api/profile'
    And header Authorization = 'Bearer ' + token
    And request { id: 2, email: 'user1@gmail.com', fullname: null, phone: null, sex: 'nam', ngaysinh: null, avatar: null }
    When method put
    Then status 400

  Scenario: th16: ngaysinh là ngày trong tương lai
    Given path '/api/profile'
    And header Authorization = 'Bearer ' + token
    And request { id: 2, email: 'user1@gmail.com', fullname: null, phone: null, sex: null, ngaysinh: '2030-12-31', avatar: null }
    When method put
    Then status 400

  Scenario: th17: ngaysinh là sai định dạng
    Given path '/api/profile'
    And header Authorization = 'Bearer ' + token
    And request { id: 2, email: 'user1@gmail.com', fullname: null, phone: null, sex: null, ngaysinh: '13-12-2023', avatar: null }
    When method put
    Then status 400

  Scenario: th18: avatar ít hơn 1 ký tự
    Given path '/api/profile'
    And header Authorization = 'Bearer ' + token
    And request { id: 2, email: 'user1@gmail.com', fullname: null, phone: null, sex: null, ngaysinh: null, avatar: '' }
    When method put
    Then status 400

  Scenario: th19: avatar quá 255 ký tự
    Given path '/api/profile'
    And header Authorization = 'Bearer ' + token
    And request { id: 2, email: 'user1@gmail.com', fullname: null, phone: null, sex: null, ngaysinh: null, avatar: 'iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii' }
    When method put
    Then status 400

  Scenario: th20: avatar kdl không phải là string
    Given path '/api/profile'
    And header Authorization = 'Bearer ' + token
    And request { id: 2, email: 'user1@gmail.com', fullname: null, phone: null, sex: null, ngaysinh: null, avatar: 123456789 }
    When method put
    Then status 400

  Scenario: th21: tất cả đúng định dạng nhưng không null
    Given path '/api/profile'
    And header Authorization = 'Bearer ' + token
    And request { id: 2, email: 'user1@gmail.com', fullname: 'Nguyen Van A', phone: "0123456789", sex: 'Nam', ngaysinh: '2023-12-13', avatar: "avatar_1775022099077.jpg" }
    When method put
    Then status 201

  Scenario: th22: tất cả null trừ id và email
    Given path '/api/profile'
    And header Authorization = 'Bearer ' + token
    And request { id: 2, email: 'user1@gmail.com', fullname: null, phone: null, sex: null, ngaysinh: null, avatar: null }
    When method put
    Then status 201