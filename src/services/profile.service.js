import profileDao from '../dao/profile.dao.js'

class profileService {
    async getProfile(id){
        const profile = await profileDao.getProfile(id);
        if(!profile)
            throw { status: 404, message:"Lấy thông tin thất bại" }
        return profile;
    }

    async putProfile(id, profileData){
        const profile = await profileDao.putProfile(id,profileData);
        if(Number(profile)<=0)
            throw { status: 404, message:"Cập nhập thông tin thất bại" }
    }
}

export default new profileService();