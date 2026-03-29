import express from 'express';
import { validateAddressCreate, validateAddressSetDefault, validateAddressUpdate } from '../validation/address.validate.js';
import AddressController from '../controller/address.controller.js'

const router = express.Router();

router.post('/', validateAddressCreate, AddressController.postAddress)
// {
//     "user_id": 1,
//     "tennguoinhan": "Thành",
//     "sodienthoai": "0123456688",
//     "diachichitiet": "8910 JQK",
//     "phuong": "hạ đình",
//     "quan": "quận 1",
//     "tinh": "Ho Chi Minh",
//     "macdinh": 1
// }
router.patch('/', validateAddressSetDefault, AddressController.conditionMacDinh)
router.get('/', AddressController.getAllAddress)
router.get('/:id', AddressController.getIdAddress)
router.put('/:id', validateAddressUpdate, AddressController.putAddress)
router.delete('/:id', AddressController.deleteAddress)

export default router;
