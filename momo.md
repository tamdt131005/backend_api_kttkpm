
<!-- http://localhost:3000/api/orders/momo/return?partnerCode=MOMO&orderId=DH1775388681001&requestId=DH1775388681001_1775388681068&amount=220000&orderInfo=Thanh+toan+don+hang+DH1775388681001&orderType=momo_wallet&transId=4720440844&resultCode=0&message=Thanh+cong&payType=credit&responseTime=1775389085724&extraData=...&signature=...
```
http://localhost:8000/pages/checkout/payment-success.html?partnerCode=MOMO&orderId=DH1775574778191&requestId=DH1775574778191_1775574778213&amount=500000&orderInfo=Thanh+toan+don+hang+DH1775574778191&orderType=momo_wallet&transId=4722695895&resultCode=1002&message=Giao+d%E1%BB%8Bch+b%E1%BB%8B+t%E1%BB%AB+ch%E1%BB%91i+do+nh%C3%A0+ph%C3%A1t+h%C3%A0nh+t%C3%A0i+kho%E1%BA%A3n+thanh+to%C3%A1n.&payType=credit&responseTime=1775574824857&extraData=eyJvcmRlcl9pZCI6MjMsInVzZXJfaWQiOjN9&signature=8448190c1ccd2727a94950253d49c687eba25b347af796d7ecdf8d3d03fd5e04 -->
<!-- 
No	Name	Number	Card Expdate	CVC	OTP	Test Case
1	NGUYEN VAN A	5200 0000 0000 1096	05/26	111	OTP	Card Successful
2	NGUYEN VAN A	5200 0000 0000 1104	05/26	111	OTP	Card failed -->

<!-- 
No	Name	Number	Card Expdate	OTP	Test Case
1	NGUYEN VAN A	9704 0000 0000 0018	03/07	OTP	Card Successful
2	NGUYEN VAN A	9704 0000 0000 0026	03/07	OTP	Card Lock
3	NGUYEN VAN A	9704 0000 0000 0034	03/07	OTP	Not Sufficient funds
4	NGUYEN VAN A	9704 0000 0000 0042	03/07	OTP	Card Limit -->